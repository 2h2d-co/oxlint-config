import { defineConfig } from "oxlint";

import { strictRules } from "./strict-rules.ts";

/** Complete shared 2h2d Oxlint configuration. */
const strictConfig = defineConfig({
  plugins: ["typescript", "unicorn", "oxc"],
  jsPlugins: [
    {
      name: "2h2d",
      specifier: "@2h2d/oxlint-config/plugin",
    },
  ],
  categories: {
    correctness: "error",
  },
  rules: strictRules,
  env: {
    builtin: true,
  },
  options: {
    reportUnusedDisableDirectives: "error",
    typeAware: true,
    typeCheck: true,
  },
});

export default strictConfig;
