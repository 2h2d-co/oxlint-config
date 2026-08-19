import { defineRule } from "@oxlint/plugins";

/** Require function properties so strictFunctionTypes checks parameter variance. */
export const noBivariantMethodSignaturesRule = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow bivariant method signatures in object types; use function properties instead.",
    },
    messages: {
      bivariantMethod:
        "Method signatures are bivariant. Use a function property so strictFunctionTypes checks parameter variance.",
    },
  },
  createOnce(context) {
    return {
      TSMethodSignature(node) {
        context.report({
          node,
          messageId: "bivariantMethod",
        });
      },
    };
  },
});
