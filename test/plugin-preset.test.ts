import assert from "node:assert/strict";
import test from "node:test";

import plugin from "../src/plugin.ts";
import { strictRules } from "../src/strict-rules.ts";

const expectedRules = [
  "no-conditional-empty-object-spread",
  "no-known-value-widening",
  "no-module-mocking",
  "no-object-parameters",
  "no-runtime-typeof",
  "no-shape-in-symbol-names",
  "no-unknown-returns",
  "no-unknown-type-aliases",
  "no-unreviewed-suppression-directives",
  "no-unsafe-dictionary-type",
];

void test("plugin exports exactly the adopted custom rules", () => {
  assert.deepEqual(Object.keys(plugin.rules ?? {}).sort(), expectedRules);
});

void test("strict preset enables every custom rule and the blanket assertion ban", () => {
  const configuredCustomRules = Object.keys(strictRules)
    .filter((name) => name.startsWith("2h2d/"))
    .map((name) => name.slice("2h2d/".length))
    .sort();

  assert.deepEqual(configuredCustomRules, expectedRules);
  assert.deepEqual(strictRules["typescript/consistent-type-assertions"], [
    "error",
    { assertionStyle: "never" },
  ]);
});
