import { eslintCompatPlugin } from "@oxlint/plugins";

import { noBivariantMethodSignaturesRule } from "./rules/no-bivariant-method-signatures.ts";
import { noConditionalEmptyObjectSpreadRule } from "./rules/no-conditional-empty-object-spread.ts";
import { noModuleMockingRule } from "./rules/no-module-mocking.ts";
import { noObjectParametersRule } from "./rules/no-object-parameters.ts";
import { noSilentErrorSuppressionRule } from "./rules/no-silent-error-suppression.ts";
import { noUnknownReturnsRule } from "./rules/no-unknown-returns.ts";
import { noUnpreservedCaughtErrorRule } from "./rules/no-unpreserved-caught-error.ts";
import { noUnreviewedSuppressionDirectivesRule } from "./rules/no-unreviewed-suppression-directives.ts";
import { noUnsafeDictionaryTypeRule } from "./rules/no-unsafe-dictionary-type.ts";

const plugin = eslintCompatPlugin({
  meta: { name: "@2h2d/oxlint-config" },
  rules: {
    "no-bivariant-method-signatures": noBivariantMethodSignaturesRule,
    "no-conditional-empty-object-spread": noConditionalEmptyObjectSpreadRule,
    "no-module-mocking": noModuleMockingRule,
    "no-object-parameters": noObjectParametersRule,
    "no-silent-error-suppression": noSilentErrorSuppressionRule,
    "no-unknown-returns": noUnknownReturnsRule,
    "no-unpreserved-caught-error": noUnpreservedCaughtErrorRule,
    "no-unreviewed-suppression-directives": noUnreviewedSuppressionDirectivesRule,
    "no-unsafe-dictionary-type": noUnsafeDictionaryTypeRule,
  },
});

export default plugin;
