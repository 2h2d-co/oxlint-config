import { defineRule } from "@oxlint/plugins";

import type { ESTree, Scope, SourceCode, Variable } from "@oxlint/plugins";

type HandlerFunction = ESTree.ArrowFunctionExpression | ESTree.Function;

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

function resolvedHandler(
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

function hasRuntimeParameter(handler: HandlerFunction): boolean {
  return handler.params.some(
    (parameter) => parameter.type !== "Identifier" || parameter.name !== "this",
  );
}

function parameterlessHandlers(
  sourceCode: SourceCode,
  expression: ESTree.Expression,
): HandlerFunction[] {
  const current = unwrapExpression(expression);
  if (current.type === "ArrowFunctionExpression" || current.type === "FunctionExpression") {
    return hasRuntimeParameter(current) ? [] : [current];
  }
  if (current.type === "Identifier") {
    const handler = resolvedHandler(sourceCode, current);
    return handler === null || hasRuntimeParameter(handler) ? [] : [handler];
  }
  if (current.type === "ConditionalExpression") {
    return [
      ...parameterlessHandlers(sourceCode, current.consequent),
      ...parameterlessHandlers(sourceCode, current.alternate),
    ];
  }
  if (current.type === "LogicalExpression") {
    return [
      ...parameterlessHandlers(sourceCode, current.left),
      ...parameterlessHandlers(sourceCode, current.right),
    ];
  }
  if (current.type === "SequenceExpression") {
    const last = current.expressions.at(-1);
    return last === undefined ? [] : parameterlessHandlers(sourceCode, last);
  }
  return [];
}

function memberName(expression: ESTree.Expression): string | null {
  const current = unwrapExpression(expression);
  if (current.type !== "MemberExpression") return null;
  if (current.computed) {
    return current.property.type === "Literal" && typeof current.property.value === "string"
      ? current.property.value
      : null;
  }
  return current.property.name;
}

function rejectionHandlerArgument(node: ESTree.CallExpression): ESTree.Expression | null {
  if (node.callee.type === "Super" || node.callee.type === "V8IntrinsicExpression") return null;
  const method = memberName(node.callee);
  const argumentIndex = method === "catch" ? 0 : method === "then" ? 1 : -1;
  if (argumentIndex === -1) return null;
  for (let index = 0; index <= argumentIndex; index += 1) {
    const argument = node.arguments[index];
    if (argument === undefined || argument.type === "SpreadElement") return null;
    if (index === argumentIndex) return argument;
  }
  return null;
}

/**
 * Require Promise-style rejection callbacks to retain their rejection reason.
 *
 * Oxlint's JavaScript plugin API does not expose type information, so this rule deliberately
 * recognizes `.catch` and `.then` by syntax. Unrelated APIs using those method names can use a
 * narrow explained suppression.
 */
export const requirePromiseRejectionParameterRule = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Require Promise-style catch and then rejection callbacks to declare the rejection reason.",
    },
    messages: {
      missingParameter:
        "Declare the rejection reason and handle it, or add a narrow explained suppression when ignoring it is the intended contract.",
    },
  },
  createOnce(context) {
    return {
      CallExpression(node) {
        const argument = rejectionHandlerArgument(node);
        if (argument === null) return;
        for (const handler of parameterlessHandlers(context.sourceCode, argument)) {
          context.report({ node: handler, messageId: "missingParameter" });
        }
      },
    };
  },
});
