import { defineRule } from "@oxlint/plugins";

import type { ESTree } from "@oxlint/plugins";

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

function conditionallySelectsSpreadValue(expression: ESTree.Expression): boolean {
  const current = unwrapExpression(expression);
  if (current.type === "ConditionalExpression" || current.type === "LogicalExpression") return true;
  return false;
}

/** Require condition-controlled object fields to be added through explicit statements. */
export const noConditionalEmptyObjectSpreadRule = defineRule({
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Disallow object spreads whose source is selected by a conditional or logical expression.",
    },
    messages: {
      avoid:
        "This spread hides condition-controlled object fields. Build the object explicitly and add the fields in conditional statements.",
    },
  },
  createOnce(context) {
    return {
      SpreadElement(node) {
        if (node.parent.type !== "ObjectExpression") return;
        if (conditionallySelectsSpreadValue(node.argument)) {
          context.report({ node, messageId: "avoid" });
        }
      },
    };
  },
});
