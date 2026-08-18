import { defineRule } from "@oxlint/plugins";
import type { ESTree, Scope, SourceCode } from "@oxlint/plugins";

const builtInErrors = new Set(["AggregateError", "Error", "TypeError"]);

function thrownBuiltInError(
  expression: ESTree.Expression,
  isGlobalReference: (identifier: ESTree.IdentifierReference) => boolean,
): boolean {
  if (expression.type !== "CallExpression" && expression.type !== "NewExpression") return false;
  const callee = expression.callee;
  return (
    callee.type === "Identifier" && builtInErrors.has(callee.name) && isGlobalReference(callee)
  );
}

function parameterlessOwningCatch(node: ESTree.Node): ESTree.CatchClause | null {
  let current: ESTree.Node | null = node.parent;
  while (current !== null && current.type !== "Program") {
    if (
      current.type === "ArrowFunctionExpression" ||
      current.type === "FunctionDeclaration" ||
      current.type === "FunctionExpression"
    ) {
      return null;
    }
    if (current.type === "CatchClause") return current.param === null ? current : null;
    current = current.parent;
  }
  return null;
}

function isGlobalBuiltIn(sourceCode: SourceCode, identifier: ESTree.IdentifierReference): boolean {
  if (sourceCode.isGlobalReference(identifier)) return true;
  let scope: Scope | null = sourceCode.getScope(identifier);
  while (scope !== null) {
    const variable = scope.set.get(identifier.name);
    if (variable !== undefined) return variable.defs.length === 0;
    scope = scope.upper;
  }
  return true;
}

/** Require access to the caught cause when a catch throws a replacement built-in Error. */
export const noUnpreservedCaughtErrorRule = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow throwing a replacement built-in Error from a parameterless catch because its cause cannot be preserved.",
    },
    messages: {
      missingCause:
        "This replacement error cannot preserve the caught failure. Add a catch parameter and pass it as the error's `cause`.",
    },
  },
  createOnce(context) {
    return {
      ThrowStatement(node) {
        if (parameterlessOwningCatch(node) === null) return;
        if (
          thrownBuiltInError(node.argument, (identifier) =>
            isGlobalBuiltIn(context.sourceCode, identifier),
          )
        ) {
          context.report({ node, messageId: "missingCause" });
        }
      },
    };
  },
});
