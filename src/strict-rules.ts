import type { DummyRuleMap } from "oxlint";

/** Shared 2h2d Oxlint policy. */
export const strictRules: DummyRuleMap = {
  "2h2d/no-conditional-empty-object-spread": "error",
  "2h2d/no-module-mocking": "error",
  "2h2d/no-object-parameters": "error",
  "2h2d/no-silent-error-suppression": "error",
  "2h2d/no-unknown-returns": "error",
  "2h2d/no-unpreserved-caught-error": "error",
  "2h2d/no-unreviewed-suppression-directives": "error",
  "2h2d/no-unsafe-dictionary-type": "error",
  "preserve-caught-error": ["error", { requireCatchParameter: false }],
  "typescript/consistent-type-assertions": ["error", { assertionStyle: "never" }],
  "typescript/no-explicit-any": "error",
  "typescript/no-floating-promises": [
    "error",
    {
      allowForKnownSafeCalls: ["describe", "it", "test"],
      ignoreVoid: false,
    },
  ],
  "typescript/no-misused-promises": "error",
  "typescript/no-non-null-assertion": "error",
  "typescript/no-unsafe-argument": "error",
  "typescript/no-unsafe-assignment": "error",
  "typescript/no-unsafe-call": "error",
  "typescript/no-unsafe-member-access": "error",
  "typescript/no-unsafe-return": "error",
  "typescript/only-throw-error": "error",
  "typescript/switch-exhaustiveness-check": [
    "error",
    {
      allowDefaultCaseForExhaustiveSwitch: false,
      considerDefaultExhaustiveForUnions: false,
    },
  ],
  "typescript/use-unknown-in-catch-callback-variable": "error",
};
