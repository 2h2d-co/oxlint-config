import type { DummyRuleMap } from "oxlint";

/** Shared 2h2d Oxlint policy. */
export const strictRules: DummyRuleMap = {
  "2h2d/no-conditional-empty-object-spread": "error",
  "2h2d/no-known-value-widening": "error",
  "2h2d/no-module-mocking": "error",
  "2h2d/no-object-parameters": "error",
  "2h2d/no-runtime-typeof": ["error", { allowInTypeGuards: true }],
  "2h2d/no-shape-in-symbol-names": "error",
  "2h2d/no-unknown-returns": "error",
  "2h2d/no-unknown-type-aliases": "error",
  "2h2d/no-unsafe-dictionary-type": "error",
  "typescript/consistent-type-assertions": ["error", { assertionStyle: "never" }],
};
