import { eslintCompatPlugin } from "@oxlint/plugins";

import { noBroadDictionaryValuesRule } from "./rules/no-broad-dictionary-values.ts";
import { noBroadObjectParametersRule } from "./rules/no-broad-object-parameters.ts";
import { noModuleMockingRule } from "./rules/no-module-mocking.ts";
import { noTypeboxUnsafeRule } from "./rules/no-typebox-unsafe.ts";
import { requireNarrowSuppressionDirectivesRule } from "./rules/require-narrow-suppression-directives.ts";

const plugin = eslintCompatPlugin({
  meta: { name: "@2h2d/oxlint-config" },
  rules: {
    "no-broad-dictionary-values": noBroadDictionaryValuesRule,
    "no-broad-object-parameters": noBroadObjectParametersRule,
    "no-module-mocking": noModuleMockingRule,
    "no-typebox-unsafe": noTypeboxUnsafeRule,
    "require-narrow-suppression-directives": requireNarrowSuppressionDirectivesRule,
  },
});

export default plugin;
