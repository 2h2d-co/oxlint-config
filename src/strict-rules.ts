import type { DummyRuleMap } from "oxlint";

/** Shared 2h2d Oxlint policy. */
export const strictRules: DummyRuleMap = {
  "2h2d/no-module-mocking": "error",
  "2h2d/no-object-parameters": "error",
  "2h2d/no-typebox-unsafe": "error",
  "2h2d/no-unreviewed-suppression-directives": "error",
  "2h2d/no-unsafe-dictionary-type": "error",
  "preserve-caught-error": ["error", { requireCatchParameter: true }],
  "typescript/ban-ts-comment": [
    "error",
    {
      minimumDescriptionLength: 10,
      "ts-check": false,
      "ts-expect-error": "allow-with-description",
      "ts-ignore": true,
      "ts-nocheck": true,
    },
  ],
  "typescript/consistent-type-assertions": ["error", { assertionStyle: "never" }],
  "typescript/method-signature-style": ["error", "property"],
  "typescript/no-explicit-any": "error",
  "typescript/no-floating-promises": [
    "error",
    {
      allowForKnownSafeCalls: [
        {
          from: "package",
          name: ["describe", "it", "test"],
          package: "node:test",
        },
      ],
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
