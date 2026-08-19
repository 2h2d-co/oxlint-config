import assert from "node:assert/strict";
import test from "node:test";

import { advisoryRules } from "../src/advisory-rules.ts";
import plugin from "../src/plugin.ts";
import { strictRules } from "../src/strict-rules.ts";

const expectedStrictRules = [
  "no-bivariant-method-signatures",
  "no-conditional-empty-object-spread",
  "no-module-mocking",
  "no-object-parameters",
  "no-typebox-unsafe",
  "no-unknown-returns",
  "no-unpreserved-caught-error",
  "no-unreviewed-suppression-directives",
  "no-unsafe-dictionary-type",
];
const expectedPluginRules = [...expectedStrictRules, "no-silent-error-suppression"].sort();

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
    "2h2d/no-silent-error-suppression": "warn",
  });
  assert.equal(strictRules["2h2d/no-silent-error-suppression"], undefined);
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
