import type { DummyRuleMap } from "oxlint";

/** Shared 2h2d Oxlint policy. */
export const strictRules: DummyRuleMap = {
  "2h2d/no-broad-dictionary-values": "error",
  "2h2d/no-broad-object-parameters": "error",
  "2h2d/no-module-mocking": "error",
  "2h2d/no-typebox-unsafe": "error",
  "2h2d/require-narrow-suppression-directives": "error",
  "2h2d/require-promise-rejection-parameter": "error",
  "array-callback-return": "error",
  eqeqeq: ["error", "always", { null: "ignore" }],
  "no-new-func": "error",
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
  "typescript/no-empty-object-type": "error",
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
  "typescript/no-import-type-side-effects": "error",
  "typescript/no-invalid-void-type": "error",
  "typescript/no-misused-promises": "error",
  "typescript/no-non-null-assertion": "error",
  "typescript/no-unnecessary-type-parameters": "error",
  "typescript/no-unsafe-argument": "error",
  "typescript/no-unsafe-assignment": "error",
  "typescript/no-unsafe-call": "error",
  "typescript/no-unsafe-enum-comparison": "error",
  "typescript/no-unsafe-function-type": "error",
  "typescript/no-unsafe-member-access": "error",
  "typescript/no-unsafe-return": "error",
  "typescript/only-throw-error": "error",
  "typescript/prefer-promise-reject-errors": [
    "error",
    {
      allowEmptyReject: false,
      allowThrowingAny: true,
      allowThrowingUnknown: true,
    },
  ],
  "typescript/return-await": ["error", "error-handling-correctness-only"],
  "typescript/switch-exhaustiveness-check": [
    "error",
    {
      allowDefaultCaseForExhaustiveSwitch: false,
      considerDefaultExhaustiveForUnions: false,
    },
  ],
  "typescript/use-unknown-in-catch-callback-variable": "error",
};
