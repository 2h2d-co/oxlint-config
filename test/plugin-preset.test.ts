import assert from "node:assert/strict";
import test from "node:test";

import plugin from "../src/plugin.ts";
import { strictRules } from "../src/strict-rules.ts";

const expectedRules = [
  "no-known-value-widening",
  "no-module-mocking",
  "no-object-parameters",
  "no-silent-error-suppression",
  "no-unknown-returns",
  "no-unpreserved-caught-error",
  "no-unreviewed-suppression-directives",
  "no-unsafe-dictionary-type",
];

test("plugin exports exactly the adopted custom rules", () => {
  assert.deepEqual(Object.keys(plugin.rules ?? {}).sort(), expectedRules);
});

test("strict preset enables every custom rule", () => {
  const configuredCustomRules = Object.keys(strictRules)
    .filter((name) => name.startsWith("2h2d/"))
    .map((name) => name.slice("2h2d/".length))
    .sort();

  assert.deepEqual(configuredCustomRules, expectedRules);
});

test("strict preset enables the adopted native rules", () => {
  assert.deepEqual(strictRules["typescript/consistent-type-assertions"], [
    "error",
    { assertionStyle: "never" },
  ]);
  assert.equal(strictRules["typescript/no-explicit-any"], "error");
  assert.deepEqual(strictRules["typescript/no-floating-promises"], [
    "error",
    {
      allowForKnownSafeCalls: ["describe", "it", "test"],
      ignoreVoid: false,
    },
  ]);
  assert.equal(strictRules["typescript/no-misused-promises"], "error");
  assert.equal(strictRules["typescript/no-non-null-assertion"], "error");
  assert.equal(strictRules["typescript/no-unsafe-argument"], "error");
  assert.equal(strictRules["typescript/no-unsafe-assignment"], "error");
  assert.equal(strictRules["typescript/no-unsafe-call"], "error");
  assert.equal(strictRules["typescript/no-unsafe-member-access"], "error");
  assert.equal(strictRules["typescript/no-unsafe-return"], "error");
  assert.equal(strictRules["typescript/only-throw-error"], "error");
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
    { requireCatchParameter: false },
  ]);
});
