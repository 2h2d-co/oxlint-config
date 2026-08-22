import assert from "node:assert/strict";
import test from "node:test";

import { advisoryRules } from "../src/advisory-rules.ts";
import plugin from "../src/plugin.ts";
import { strictRules } from "../src/strict-rules.ts";

const expectedStrictRules = [
  "no-module-mocking",
  "no-object-parameters",
  "no-typebox-unsafe",
  "no-unreviewed-suppression-directives",
  "no-unsafe-dictionary-type",
];
const expectedAdvisoryRules = ["no-unknown-returns"];
const expectedPluginRules = [...expectedStrictRules, ...expectedAdvisoryRules].sort();

test("plugin exports exactly the adopted custom rules", () => {
  assert.deepEqual(Object.keys(plugin.rules ?? {}).sort(), expectedPluginRules);
});

test("strict preset enables only blocking custom rules", () => {
  const configuredCustomRules = Object.keys(strictRules)
    .filter((name) => name.startsWith("2h2d/"))
    .map((name) => name.slice("2h2d/".length))
    .sort();

  assert.deepEqual(configuredCustomRules, expectedStrictRules);
});

test("advisory preset contains only non-blocking review signals", () => {
  assert.deepEqual(advisoryRules, {
    "2h2d/no-unknown-returns": "warn",
  });
  for (const name of expectedAdvisoryRules) {
    assert.equal(strictRules[`2h2d/${name}`], undefined);
  }
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
