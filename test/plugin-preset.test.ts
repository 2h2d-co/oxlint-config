import assert from "node:assert/strict";
import test from "node:test";

import plugin from "../src/plugin.ts";
import { strictRules } from "../src/strict-rules.ts";

const expectedStrictRules = [
  "no-broad-dictionary-values",
  "no-broad-object-parameters",
  "no-module-mocking",
  "no-typebox-unsafe",
  "require-narrow-suppression-directives",
  "require-promise-rejection-parameter",
];

test("plugin exports exactly the adopted custom rules", () => {
  assert.deepEqual(Object.keys(plugin.rules ?? {}).sort(), expectedStrictRules);
});

test("strict preset enables only blocking custom rules", () => {
  const configuredCustomRules = Object.keys(strictRules)
    .filter((name) => name.startsWith("2h2d/"))
    .map((name) => name.slice("2h2d/".length))
    .sort();

  assert.deepEqual(configuredCustomRules, expectedStrictRules);
});

test("strict preset enables the adopted native rules", () => {
  assert.equal(strictRules["array-callback-return"], "error");
  assert.deepEqual(strictRules.eqeqeq, ["error", "always", { null: "ignore" }]);
  assert.equal(strictRules["no-new-func"], "error");
  assert.deepEqual(strictRules["typescript/ban-ts-comment"], [
    "error",
    {
      minimumDescriptionLength: 10,
      "ts-check": false,
      "ts-expect-error": "allow-with-description",
      "ts-ignore": true,
      "ts-nocheck": true,
    },
  ]);
  assert.deepEqual(strictRules["typescript/consistent-type-assertions"], [
    "error",
    { assertionStyle: "never" },
  ]);
  assert.deepEqual(strictRules["typescript/method-signature-style"], ["error", "property"]);
  assert.equal(strictRules["typescript/no-empty-object-type"], "error");
  assert.equal(strictRules["typescript/no-explicit-any"], "error");
  assert.deepEqual(strictRules["typescript/no-floating-promises"], [
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
  ]);
  assert.equal(strictRules["typescript/no-import-type-side-effects"], "error");
  assert.equal(strictRules["typescript/no-invalid-void-type"], "error");
  assert.equal(strictRules["typescript/no-misused-promises"], "error");
  assert.equal(strictRules["typescript/no-non-null-assertion"], "error");
  assert.equal(strictRules["typescript/no-unnecessary-type-parameters"], "error");
  assert.equal(strictRules["typescript/no-unsafe-argument"], "error");
  assert.equal(strictRules["typescript/no-unsafe-assignment"], "error");
  assert.equal(strictRules["typescript/no-unsafe-call"], "error");
  assert.equal(strictRules["typescript/no-unsafe-enum-comparison"], "error");
  assert.equal(strictRules["typescript/no-unsafe-function-type"], "error");
  assert.equal(strictRules["typescript/no-unsafe-member-access"], "error");
  assert.equal(strictRules["typescript/no-unsafe-return"], "error");
  assert.equal(strictRules["typescript/only-throw-error"], "error");
  assert.deepEqual(strictRules["typescript/prefer-promise-reject-errors"], [
    "error",
    {
      allowEmptyReject: false,
      allowThrowingAny: true,
      allowThrowingUnknown: true,
    },
  ]);
  assert.deepEqual(strictRules["typescript/return-await"], [
    "error",
    "error-handling-correctness-only",
  ]);
  assert.deepEqual(strictRules["typescript/switch-exhaustiveness-check"], [
    "error",
    {
      allowDefaultCaseForExhaustiveSwitch: false,
      considerDefaultExhaustiveForUnions: false,
    },
  ]);
  assert.equal(strictRules["typescript/use-unknown-in-catch-callback-variable"], "error");
  assert.deepEqual(strictRules["preserve-caught-error"], [
    "error",
    { requireCatchParameter: true },
  ]);
});

test("strict preset disables rejected correctness-category rules", () => {
  assert.equal(strictRules["oxc/double-comparisons"], "off");
  assert.equal(strictRules["oxc/erasing-op"], "off");
  assert.equal(strictRules["oxc/number-arg-out-of-range"], "off");
  assert.equal(strictRules["oxc/uninvoked-array-callback"], "off");
  assert.equal(strictRules["unicorn/no-empty-file"], "off");
  assert.equal(strictRules["unicorn/no-new-array"], "off");
  assert.equal(strictRules["unicorn/no-single-promise-in-promise-methods"], "off");
  assert.equal(strictRules["unicorn/no-thenable"], "off");
  assert.equal(strictRules["unicorn/no-useless-spread"], "off");
  assert.equal(strictRules["unicorn/prefer-string-starts-ends-with"], "off");
});
