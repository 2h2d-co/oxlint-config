import { defineRule } from "@oxlint/plugins";
import type { ESTree, Scope, SourceCode, Variable } from "@oxlint/plugins";

type HandlerFunction = ESTree.ArrowFunctionExpression | ESTree.Function;

type Flow = {
  continuations: Set<boolean>;
  propagates: boolean;
  unclassifiedExit: boolean;
};

type VisitorKeys = Readonly<Record<string, readonly string[]>>;

function isNode(value: unknown): value is ESTree.Node {
  return (
    typeof value === "object" && value !== null && "type" in value && typeof value.type === "string"
  );
}

function unwrapExpression(expression: ESTree.Expression): ESTree.Expression {
  let current = expression;
  while (
    current.type === "ParenthesizedExpression" ||
    current.type === "ChainExpression" ||
    current.type === "TSAsExpression" ||
    current.type === "TSNonNullExpression" ||
    current.type === "TSSatisfiesExpression" ||
    current.type === "TSTypeAssertion"
  ) {
    current = current.expression;
  }
  return current;
}

function nodeReferencesName(
  node: ESTree.Node,
  names: ReadonlySet<string>,
  visitorKeys: VisitorKeys,
): boolean {
  if (node.type === "Identifier" && names.has(node.name)) return true;
  for (const key of visitorKeys[node.type] ?? []) {
    const value: unknown = Reflect.get(node, key);
    if (isNode(value) && nodeReferencesName(value, names, visitorKeys)) return true;
    if (
      Array.isArray(value) &&
      value.some((child) => isNode(child) && nodeReferencesName(child, names, visitorKeys))
    ) {
      return true;
    }
  }
  return false;
}

function collectBindingNames(pattern: ESTree.ParamPattern, names: Set<string>): void {
  switch (pattern.type) {
    case "Identifier":
      names.add(pattern.name);
      return;
    case "AssignmentPattern":
      collectBindingNames(pattern.left, names);
      return;
    case "RestElement":
      collectBindingNames(pattern.argument, names);
      return;
    case "TSParameterProperty":
      collectBindingNames(pattern.parameter, names);
      return;
    case "ArrayPattern":
      for (const element of pattern.elements) {
        if (element !== null) collectBindingNames(element, names);
      }
      return;
    case "ObjectPattern":
      for (const property of pattern.properties) {
        if (property.type === "RestElement") {
          collectBindingNames(property.argument, names);
        } else {
          collectBindingNames(property.value, names);
        }
      }
  }
}

function collectDerivedCauseNames(
  body: ESTree.BlockStatement,
  initialNames: ReadonlySet<string>,
  visitorKeys: VisitorKeys,
): ReadonlySet<string> {
  const names = new Set(initialNames);
  let changed = true;

  const visit = (node: ESTree.Node, root: boolean): void => {
    if (
      !root &&
      (node.type === "ArrowFunctionExpression" ||
        node.type === "FunctionDeclaration" ||
        node.type === "FunctionExpression")
    ) {
      return;
    }
    if (
      node.type === "VariableDeclarator" &&
      node.id.type === "Identifier" &&
      node.init !== null &&
      node.parent.type === "VariableDeclaration" &&
      node.parent.kind === "const" &&
      nodeReferencesName(node.init, names, visitorKeys)
    ) {
      if (!names.has(node.id.name)) {
        names.add(node.id.name);
        changed = true;
      }
    }
    for (const key of visitorKeys[node.type] ?? []) {
      const value: unknown = Reflect.get(node, key);
      if (isNode(value)) {
        visit(value, false);
        continue;
      }
      if (!Array.isArray(value)) continue;
      for (const child of value) {
        if (isNode(child)) visit(child, false);
      }
    }
  };

  while (changed) {
    changed = false;
    visit(body, true);
  }
  return names;
}

function isPromiseRejectCall(expression: ESTree.Expression): boolean {
  const current = unwrapExpression(expression);
  if (current.type === "AwaitExpression") {
    return isPromiseRejectCall(current.argument);
  }
  if (current.type !== "CallExpression") return false;

  const callee = unwrapExpression(current.callee);
  return (
    callee.type === "MemberExpression" &&
    !callee.computed &&
    callee.object.type === "Identifier" &&
    callee.object.name === "Promise" &&
    callee.property.name === "reject"
  );
}

function continuation(classified: boolean): Flow {
  return {
    continuations: new Set([classified]),
    propagates: false,
    unclassifiedExit: false,
  };
}

function mergeFlows(flows: readonly Flow[]): Flow {
  const merged: Flow = {
    continuations: new Set(),
    propagates: false,
    unclassifiedExit: false,
  };
  for (const flow of flows) {
    for (const state of flow.continuations) merged.continuations.add(state);
    merged.propagates ||= flow.propagates;
    merged.unclassifiedExit ||= flow.unclassifiedExit;
  }
  return merged;
}

function analyzeStatements(
  statements: readonly ESTree.Statement[],
  initialStates: ReadonlySet<boolean>,
  causeNames: ReadonlySet<string>,
  visitorKeys: VisitorKeys,
): Flow {
  let aggregate: Flow = {
    continuations: new Set(initialStates),
    propagates: false,
    unclassifiedExit: false,
  };

  for (const statement of statements) {
    const next = [...aggregate.continuations].map((classified) =>
      analyzeStatement(statement, classified, causeNames, visitorKeys),
    );
    const analyzed = mergeFlows(next);
    aggregate = {
      continuations: analyzed.continuations,
      propagates: aggregate.propagates || analyzed.propagates,
      unclassifiedExit: aggregate.unclassifiedExit || analyzed.unclassifiedExit,
    };
  }
  return aggregate;
}

function analyzeStatement(
  statement: ESTree.Statement,
  classified: boolean,
  causeNames: ReadonlySet<string>,
  visitorKeys: VisitorKeys,
): Flow {
  if (statement.type === "ThrowStatement") {
    const preservesCause = nodeReferencesName(statement.argument, causeNames, visitorKeys);
    return {
      continuations: new Set(),
      propagates: preservesCause,
      unclassifiedExit: !preservesCause,
    };
  }

  if (statement.type === "ReturnStatement") {
    const propagates =
      statement.argument !== null &&
      isPromiseRejectCall(statement.argument) &&
      nodeReferencesName(statement.argument, causeNames, visitorKeys);
    return {
      continuations: new Set(),
      propagates,
      unclassifiedExit: !propagates && !classified,
    };
  }

  if (statement.type === "BreakStatement" || statement.type === "ContinueStatement") {
    return {
      continuations: new Set(),
      propagates: false,
      unclassifiedExit: !classified,
    };
  }

  if (statement.type === "BlockStatement") {
    return analyzeStatements(statement.body, new Set([classified]), causeNames, visitorKeys);
  }

  if (statement.type === "IfStatement") {
    const branchClassified =
      classified || nodeReferencesName(statement.test, causeNames, visitorKeys);
    const consequent = analyzeStatement(
      statement.consequent,
      branchClassified,
      causeNames,
      visitorKeys,
    );
    const alternate =
      statement.alternate === null
        ? continuation(branchClassified)
        : analyzeStatement(statement.alternate, branchClassified, causeNames, visitorKeys);
    return mergeFlows([consequent, alternate]);
  }

  if (statement.type === "SwitchStatement") {
    const branchClassified =
      classified || nodeReferencesName(statement.discriminant, causeNames, visitorKeys);
    const cases = statement.cases.map((switchCase) =>
      analyzeStatements(
        switchCase.consequent,
        new Set([branchClassified]),
        causeNames,
        visitorKeys,
      ),
    );
    if (!statement.cases.some((switchCase) => switchCase.test === null)) {
      cases.push(continuation(branchClassified));
    }
    return mergeFlows(cases);
  }

  if (
    statement.type === "DoWhileStatement" ||
    statement.type === "ForInStatement" ||
    statement.type === "ForOfStatement" ||
    statement.type === "ForStatement" ||
    statement.type === "WhileStatement"
  ) {
    const condition =
      statement.type === "DoWhileStatement" || statement.type === "WhileStatement"
        ? statement.test
        : statement.type === "ForStatement"
          ? statement.test
          : statement.right;
    const bodyClassified =
      classified || (condition !== null && nodeReferencesName(condition, causeNames, visitorKeys));
    return mergeFlows([
      continuation(bodyClassified),
      analyzeStatement(statement.body, bodyClassified, causeNames, visitorKeys),
    ]);
  }

  if (statement.type === "LabeledStatement" || statement.type === "WithStatement") {
    return analyzeStatement(statement.body, classified, causeNames, visitorKeys);
  }

  // Nested try/catch control flow is intentionally conservative: a throw inside
  // it may be intercepted before it can propagate the failure handled here.
  return continuation(classified);
}

function functionCauseNames(callback: HandlerFunction): ReadonlySet<string> {
  const names = new Set<string>();
  const parameter = callback.params[0];
  if (parameter !== undefined) collectBindingNames(parameter, names);
  return names;
}

function blockPropagatesFailure(
  body: ESTree.BlockStatement,
  initialCauseNames: ReadonlySet<string>,
  visitorKeys: VisitorKeys,
): boolean {
  if (initialCauseNames.size === 0) return false;
  const causeNames = collectDerivedCauseNames(body, initialCauseNames, visitorKeys);
  const flow = analyzeStatements(body.body, new Set([false]), causeNames, visitorKeys);
  return flow.propagates && !flow.unclassifiedExit && !flow.continuations.has(false);
}

function callbackPropagatesFailure(callback: HandlerFunction, visitorKeys: VisitorKeys): boolean {
  const causeNames = functionCauseNames(callback);
  if (callback.type === "ArrowFunctionExpression" && callback.body.type !== "BlockStatement") {
    return (
      causeNames.size > 0 &&
      isPromiseRejectCall(callback.body) &&
      nodeReferencesName(callback.body, causeNames, visitorKeys)
    );
  }
  if (callback.body === null || callback.body.type !== "BlockStatement") return false;
  return blockPropagatesFailure(callback.body, causeNames, visitorKeys);
}

function resolveVariable(
  sourceCode: SourceCode,
  identifier: ESTree.IdentifierReference,
): Variable | null {
  let scope: Scope | null = sourceCode.getScope(identifier);
  while (scope !== null) {
    const variable = scope.set.get(identifier.name);
    if (variable !== undefined) return variable;
    scope = scope.upper;
  }
  return null;
}

function resolvedCallback(
  sourceCode: SourceCode,
  identifier: ESTree.IdentifierReference,
): HandlerFunction | null {
  const variable = resolveVariable(sourceCode, identifier);
  if (variable === null || variable.defs.length !== 1) return null;
  const [definition] = variable.defs;
  if (definition?.type === "FunctionName" && definition.node.type === "FunctionDeclaration") {
    return definition.node;
  }
  if (definition?.type !== "Variable" || definition.node.type !== "VariableDeclarator") {
    return null;
  }
  const initializer = definition.node.init;
  return initializer?.type === "ArrowFunctionExpression" ||
    initializer?.type === "FunctionExpression"
    ? initializer
    : null;
}

function isCatchMethod(expression: ESTree.Expression): boolean {
  const callee = unwrapExpression(expression);
  if (callee.type !== "MemberExpression") return false;

  if (callee.computed) {
    return callee.property.type === "Literal" && callee.property.value === "catch";
  }
  return callee.property.name === "catch";
}

/** Require every unclassified handler path to propagate the caught failure. */
export const noSilentErrorSuppressionRule = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow catch handlers and Promise rejection callbacks with an unclassified path that can suppress the caught failure.",
    },
    messages: {
      catchClause:
        "This catch handler can suppress an unclassified failure. Classify an expected cause and preserve every other cause when throwing.",
      promiseCatch:
        "This Promise rejection callback can suppress an unclassified failure. Classify an expected cause and preserve every other cause when rejecting or throwing.",
    },
  },
  createOnce(context) {
    return {
      CatchClause(node) {
        const visitorKeys = context.sourceCode.visitorKeys;
        const causeNames = new Set<string>();
        if (node.param !== null) collectBindingNames(node.param, causeNames);
        if (!blockPropagatesFailure(node.body, causeNames, visitorKeys)) {
          context.report({ node, messageId: "catchClause" });
        }
      },
      CallExpression(node) {
        if (!isCatchMethod(node.callee)) return;
        const visitorKeys = context.sourceCode.visitorKeys;

        const candidate = node.arguments[0];
        if (candidate === undefined || candidate.type === "SpreadElement") return;
        const callback =
          candidate.type === "ArrowFunctionExpression" || candidate.type === "FunctionExpression"
            ? candidate
            : candidate.type === "Identifier"
              ? resolvedCallback(context.sourceCode, candidate)
              : null;
        if (callback === null || !callbackPropagatesFailure(callback, visitorKeys)) {
          context.report({ node: candidate, messageId: "promiseCatch" });
        }
      },
    };
  },
});
