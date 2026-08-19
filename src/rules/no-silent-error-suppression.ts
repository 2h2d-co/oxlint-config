import { defineRule } from "@oxlint/plugins";

import type { ESTree, Scope, SourceCode, Variable } from "@oxlint/plugins";

type HandlerFunction = ESTree.ArrowFunctionExpression | ESTree.Function;
type HandlingState = "handled" | "unhandled";
type ClassifierPolarity = "negative" | "positive";

type Flow = {
  continuations: Set<HandlingState>;
  unsafeExit: boolean;
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
      isCauseDerivedValue(node.init, names, visitorKeys) &&
      !names.has(node.id.name)
    ) {
      names.add(node.id.name);
      changed = true;
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

function isPromiseRejectCall(
  expression: ESTree.Expression,
  causeNames: ReadonlySet<string>,
  visitorKeys: VisitorKeys,
): boolean {
  const current = unwrapExpression(expression);
  if (current.type === "AwaitExpression") {
    return isPromiseRejectCall(current.argument, causeNames, visitorKeys);
  }
  if (current.type !== "CallExpression") return false;

  const callee = unwrapExpression(current.callee);
  return (
    callee.type === "MemberExpression" &&
    !callee.computed &&
    callee.object.type === "Identifier" &&
    callee.object.name === "Promise" &&
    callee.property.name === "reject" &&
    current.arguments.some(
      (argument) =>
        argument.type !== "SpreadElement" && nodeReferencesName(argument, causeNames, visitorKeys),
    )
  );
}

function calleeName(expression: ESTree.Expression): string | null {
  const current = unwrapExpression(expression);
  if (current.type === "Identifier") return current.name;
  if (current.type !== "MemberExpression") return null;
  if (current.computed) {
    return current.property.type === "Literal" && typeof current.property.value === "string"
      ? current.property.value
      : null;
  }
  return current.property.name;
}

function isClassifierCall(
  expression: ESTree.Expression,
  causeNames: ReadonlySet<string>,
  visitorKeys: VisitorKeys,
): boolean {
  const current = unwrapExpression(expression);
  if (current.type !== "CallExpression") return false;
  const name = calleeName(current.callee);
  if (name === null || !/^(?:classify(?:[A-Z_]|$)|has[A-Z_]|is[A-Z_])/u.test(name)) {
    return false;
  }
  return current.arguments.some(
    (argument) =>
      argument.type !== "SpreadElement" && nodeReferencesName(argument, causeNames, visitorKeys),
  );
}

function isCauseDiscriminant(
  expression: ESTree.Expression,
  causeNames: ReadonlySet<string>,
  visitorKeys: VisitorKeys,
): boolean {
  const current = unwrapExpression(expression);
  return (
    (current.type === "MemberExpression" &&
      nodeReferencesName(current.object, causeNames, visitorKeys)) ||
    isClassifierCall(current, causeNames, visitorKeys)
  );
}

function classifierPolarity(
  expression: ESTree.Expression,
  causeNames: ReadonlySet<string>,
  visitorKeys: VisitorKeys,
): ClassifierPolarity | null {
  const current = unwrapExpression(expression);
  if (current.type === "UnaryExpression" && current.operator === "!") {
    const nested = classifierPolarity(current.argument, causeNames, visitorKeys);
    return nested === "positive" ? "negative" : nested === "negative" ? "positive" : null;
  }
  if (current.type === "BinaryExpression" && current.operator === "instanceof") {
    return nodeReferencesName(current.left, causeNames, visitorKeys) ? "positive" : null;
  }
  if (
    current.type === "BinaryExpression" &&
    (current.operator === "===" ||
      current.operator === "==" ||
      current.operator === "!==" ||
      current.operator === "!=")
  ) {
    const leftIsDiscriminant = isCauseDiscriminant(current.left, causeNames, visitorKeys);
    const rightIsDiscriminant = isCauseDiscriminant(current.right, causeNames, visitorKeys);
    if (leftIsDiscriminant === rightIsDiscriminant) return null;
    return current.operator === "!==" || current.operator === "!=" ? "negative" : "positive";
  }
  if (current.type === "LogicalExpression") {
    const left = classifierPolarity(current.left, causeNames, visitorKeys);
    const right = classifierPolarity(current.right, causeNames, visitorKeys);
    if (current.operator === "&&") {
      if (left === "positive" || right === "positive") return "positive";
      return left === "negative" && right === "negative" ? "negative" : null;
    }
    if (current.operator === "||") {
      if (left === "negative" || right === "negative") return "negative";
      return left === "positive" && right === "positive" ? "positive" : null;
    }
    return null;
  }
  return isClassifierCall(current, causeNames, visitorKeys) ? "positive" : null;
}

function isCauseDerivedValue(
  expression: ESTree.Expression,
  causeNames: ReadonlySet<string>,
  visitorKeys: VisitorKeys,
): boolean {
  const current = unwrapExpression(expression);
  if (!nodeReferencesName(current, causeNames, visitorKeys)) return false;
  if (
    current.type === "CallExpression" &&
    (isClassifierCall(current, causeNames, visitorKeys) ||
      (current.callee.type === "Identifier" &&
        /^(?:BigInt|Boolean|Number|String|Symbol)$/u.test(current.callee.name)))
  ) {
    return false;
  }
  return (
    current.type === "Identifier" ||
    current.type === "MemberExpression" ||
    current.type === "ObjectExpression" ||
    current.type === "ArrayExpression" ||
    current.type === "CallExpression" ||
    current.type === "NewExpression" ||
    current.type === "TemplateLiteral"
  );
}

function expressionObservesCause(
  expression: ESTree.Expression,
  causeNames: ReadonlySet<string>,
  visitorKeys: VisitorKeys,
): boolean {
  const current = unwrapExpression(expression);
  if (current.type === "AwaitExpression") {
    return expressionObservesCause(current.argument, causeNames, visitorKeys);
  }
  if (current.type === "CallExpression") {
    const name = calleeName(current.callee);
    const isObservableSink =
      name !== null &&
      (/^(?:debug|error|info|warn)$/u.test(name) ||
        /^(?:add|append|capture|emit|log|notify|publish|push|record|report|save|send|set|store|trace|track|write)(?:[A-Z_]|$)/u.test(
          name,
        ) ||
        /^on[A-Z].*(?:Diagnostic|Error|Failure|Warning)$/u.test(name));
    return (
      isObservableSink &&
      current.arguments.some(
        (argument) =>
          argument.type !== "SpreadElement" &&
          nodeReferencesName(argument, causeNames, visitorKeys),
      )
    );
  }
  if (current.type === "AssignmentExpression") {
    if (current.left.type === "ArrayPattern" || current.left.type === "ObjectPattern") return false;
    return (
      unwrapExpression(current.left).type === "MemberExpression" &&
      nodeReferencesName(current.right, causeNames, visitorKeys)
    );
  }
  return false;
}

function isHandledReturnExpression(
  expression: ESTree.Expression,
  causeNames: ReadonlySet<string>,
  visitorKeys: VisitorKeys,
): boolean {
  const current = unwrapExpression(expression);
  if (isPromiseRejectCall(current, causeNames, visitorKeys)) return true;
  if (expressionObservesCause(current, causeNames, visitorKeys)) return true;
  return isCauseDerivedValue(current, causeNames, visitorKeys);
}

function continuation(state: HandlingState): Flow {
  return {
    continuations: new Set([state]),
    unsafeExit: false,
  };
}

function mergeFlows(flows: readonly Flow[]): Flow {
  const merged: Flow = {
    continuations: new Set(),
    unsafeExit: false,
  };
  for (const flow of flows) {
    for (const state of flow.continuations) merged.continuations.add(state);
    merged.unsafeExit ||= flow.unsafeExit;
  }
  return merged;
}

function analyzeStatements(
  statements: readonly ESTree.Statement[],
  initialStates: ReadonlySet<HandlingState>,
  causeNames: ReadonlySet<string>,
  visitorKeys: VisitorKeys,
): Flow {
  let aggregate: Flow = {
    continuations: new Set(initialStates),
    unsafeExit: false,
  };

  for (const statement of statements) {
    const next = [...aggregate.continuations].map((state) =>
      analyzeStatement(statement, state, causeNames, visitorKeys),
    );
    const analyzed = mergeFlows(next);
    aggregate = {
      continuations: analyzed.continuations,
      unsafeExit: aggregate.unsafeExit || analyzed.unsafeExit,
    };
  }
  return aggregate;
}

function analyzeStatement(
  statement: ESTree.Statement,
  state: HandlingState,
  causeNames: ReadonlySet<string>,
  visitorKeys: VisitorKeys,
): Flow {
  if (statement.type === "ThrowStatement") {
    return {
      continuations: new Set(),
      unsafeExit: !nodeReferencesName(statement.argument, causeNames, visitorKeys),
    };
  }

  if (statement.type === "ReturnStatement") {
    const handlesCause =
      state === "handled" ||
      (statement.argument !== null &&
        isHandledReturnExpression(statement.argument, causeNames, visitorKeys));
    return {
      continuations: new Set(),
      unsafeExit: !handlesCause,
    };
  }

  if (statement.type === "BreakStatement" || statement.type === "ContinueStatement") {
    return {
      continuations: new Set(),
      unsafeExit: state === "unhandled",
    };
  }

  if (statement.type === "ExpressionStatement") {
    return continuation(
      state === "handled" || expressionObservesCause(statement.expression, causeNames, visitorKeys)
        ? "handled"
        : "unhandled",
    );
  }

  if (statement.type === "BlockStatement") {
    return analyzeStatements(statement.body, new Set([state]), causeNames, visitorKeys);
  }

  if (statement.type === "IfStatement") {
    const polarity =
      state === "handled" ? null : classifierPolarity(statement.test, causeNames, visitorKeys);
    const consequentState =
      state === "handled" || polarity === "positive" ? "handled" : "unhandled";
    const alternateState = state === "handled" || polarity === "negative" ? "handled" : "unhandled";
    const consequent = analyzeStatement(
      statement.consequent,
      consequentState,
      causeNames,
      visitorKeys,
    );
    const alternate =
      statement.alternate === null
        ? continuation(alternateState)
        : analyzeStatement(statement.alternate, alternateState, causeNames, visitorKeys);
    return mergeFlows([consequent, alternate]);
  }

  if (statement.type === "SwitchStatement") {
    const classified =
      state === "unhandled" &&
      (isCauseDiscriminant(statement.discriminant, causeNames, visitorKeys) ||
        isClassifierCall(statement.discriminant, causeNames, visitorKeys));
    const cases = statement.cases.map((switchCase) =>
      analyzeStatements(
        switchCase.consequent,
        new Set<HandlingState>([
          state === "handled" || (classified && switchCase.test !== null) ? "handled" : "unhandled",
        ]),
        causeNames,
        visitorKeys,
      ),
    );
    if (!statement.cases.some((switchCase) => switchCase.test === null)) {
      cases.push(continuation(state));
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
    return mergeFlows([
      continuation(state),
      analyzeStatement(statement.body, state, causeNames, visitorKeys),
    ]);
  }

  if (statement.type === "LabeledStatement" || statement.type === "WithStatement") {
    return analyzeStatement(statement.body, state, causeNames, visitorKeys);
  }

  // Unsupported nested control flow cannot prove that the failure is handled.
  return continuation(state);
}

function functionCauseNames(callback: HandlerFunction): ReadonlySet<string> {
  const names = new Set<string>();
  const parameter = callback.params[0];
  if (parameter !== undefined) collectBindingNames(parameter, names);
  return names;
}

function blockHandlesFailure(
  body: ESTree.BlockStatement,
  initialCauseNames: ReadonlySet<string>,
  visitorKeys: VisitorKeys,
): boolean {
  if (initialCauseNames.size === 0) return false;
  const causeNames = collectDerivedCauseNames(body, initialCauseNames, visitorKeys);
  const flow = analyzeStatements(body.body, new Set(["unhandled"]), causeNames, visitorKeys);
  return !flow.unsafeExit && !flow.continuations.has("unhandled");
}

function callbackHandlesFailure(callback: HandlerFunction, visitorKeys: VisitorKeys): boolean {
  const causeNames = functionCauseNames(callback);
  if (callback.type === "ArrowFunctionExpression" && callback.body.type !== "BlockStatement") {
    return causeNames.size > 0 && isHandledReturnExpression(callback.body, causeNames, visitorKeys);
  }
  if (callback.body === null || callback.body.type !== "BlockStatement") return false;
  return blockHandlesFailure(callback.body, causeNames, visitorKeys);
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

/** Require every handler path to propagate, classify, or observably report the caught failure. */
export const noSilentErrorSuppressionRule = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow catch handlers and Promise rejection callbacks with a path that silently suppresses the caught failure.",
    },
    messages: {
      catchClause:
        "This catch handler can silently suppress a failure. Propagate it, classify an expected cause, report a cause-derived diagnostic, or add a narrow explained suppression.",
      promiseCatch:
        "This Promise rejection callback can silently suppress a failure. Propagate it, report a cause-derived diagnostic, or add a narrow explained suppression.",
    },
  },
  createOnce(context) {
    return {
      CatchClause(node) {
        const visitorKeys = context.sourceCode.visitorKeys;
        const causeNames = new Set<string>();
        if (node.param !== null) collectBindingNames(node.param, causeNames);
        if (!blockHandlesFailure(node.body, causeNames, visitorKeys)) {
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
        if (callback !== null && !callbackHandlesFailure(callback, visitorKeys)) {
          context.report({ node: candidate, messageId: "promiseCatch" });
        }
      },
    };
  },
});
