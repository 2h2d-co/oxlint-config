import { eslintCompatPlugin } from "@oxlint/plugins";

import { noModuleMockingRule } from "./rules/no-module-mocking.ts";
import { noObjectParametersRule } from "./rules/no-object-parameters.ts";
import { noTypeboxUnsafeRule } from "./rules/no-typebox-unsafe.ts";
import { noUnknownReturnsRule } from "./rules/no-unknown-returns.ts";
import { noUnreviewedSuppressionDirectivesRule } from "./rules/no-unreviewed-suppression-directives.ts";
import { noUnsafeDictionaryTypeRule } from "./rules/no-unsafe-dictionary-type.ts";

const plugin = eslintCompatPlugin({
  meta: { name: "@2h2d/oxlint-config" },
  rules: {
    "no-module-mocking": noModuleMockingRule,
    "no-object-parameters": noObjectParametersRule,
    "no-typebox-unsafe": noTypeboxUnsafeRule,
    "no-unknown-returns": noUnknownReturnsRule,
    "no-unreviewed-suppression-directives": noUnreviewedSuppressionDirectivesRule,
    "no-unsafe-dictionary-type": noUnsafeDictionaryTypeRule,
  },
});

export default plugin;
