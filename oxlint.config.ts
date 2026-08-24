import { defineConfig } from "oxlint";

import { strictRules } from "./src/strict-rules.ts";

export default defineConfig({
  plugins: ["typescript", "unicorn", "oxc", "promise"],
  jsPlugins: [{ name: "2h2d", specifier: "./src/plugin.ts" }],
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
