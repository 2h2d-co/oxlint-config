import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import strictConfig from "../src/strict-config.ts";

interface RuleMetadata {
  category: string;
  scope: string;
  value: string;
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const reviewedCorrectnessRules = [
  "eslint/constructor-super",
  "eslint/for-direction",
  "eslint/getter-return",
  "eslint/no-async-promise-executor",
  "eslint/no-caller",
  "eslint/no-class-assign",
  "eslint/no-compare-neg-zero",
  "eslint/no-cond-assign",
  "eslint/no-const-assign",
  "eslint/no-constant-binary-expression",
  "eslint/no-constant-condition",
  "eslint/no-control-regex",
  "eslint/no-debugger",
  "eslint/no-delete-var",
  "eslint/no-dupe-class-members",
  "eslint/no-dupe-else-if",
  "eslint/no-dupe-keys",
  "eslint/no-duplicate-case",
  "eslint/no-empty-character-class",
  "eslint/no-empty-pattern",
  "eslint/no-empty-static-block",
  "eslint/no-eval",
  "eslint/no-ex-assign",
  "eslint/no-extra-boolean-cast",
  "eslint/no-func-assign",
  "eslint/no-global-assign",
  "eslint/no-import-assign",
  "eslint/no-invalid-regexp",
  "eslint/no-irregular-whitespace",
  "eslint/no-iterator",
  "eslint/no-loss-of-precision",
  "eslint/no-misleading-character-class",
  "eslint/no-new-native-nonconstructor",
  "eslint/no-nonoctal-decimal-escape",
  "eslint/no-obj-calls",
  "eslint/no-self-assign",
  "eslint/no-setter-return",
  "eslint/no-shadow-restricted-names",
  "eslint/no-sparse-arrays",
  "eslint/no-this-before-super",
  "eslint/no-unassigned-vars",
  "eslint/no-unreachable",
  "eslint/no-unsafe-finally",
  "eslint/no-unsafe-negation",
  "eslint/no-unsafe-optional-chaining",
  "eslint/no-unused-expressions",
  "eslint/no-unused-labels",
  "eslint/no-unused-private-class-members",
  "eslint/no-unused-vars",
  "eslint/no-useless-backreference",
  "eslint/no-useless-catch",
  "eslint/no-useless-escape",
  "eslint/no-useless-rename",
  "eslint/no-with",
  "eslint/require-yield",
  "eslint/use-isnan",
  "eslint/valid-typeof",
  "oxc/bad-array-method-on-arguments",
  "oxc/bad-char-at-comparison",
  "oxc/bad-comparison-sequence",
  "oxc/bad-match-all-arg",
  "oxc/bad-min-max-func",
  "oxc/bad-object-literal-comparison",
  "oxc/bad-replace-all-arg",
  "oxc/const-comparisons",
  "oxc/double-comparisons",
  "oxc/erasing-op",
  "oxc/missing-throw",
  "oxc/number-arg-out-of-range",
  "oxc/only-used-in-recursion",
  "oxc/uninvoked-array-callback",
  "promise/no-callback-in-promise",
  "promise/no-new-statics",
  "promise/valid-params",
  "typescript/await-thenable",
  "typescript/no-array-delete",
  "typescript/no-base-to-string",
  "typescript/no-duplicate-enum-values",
  "typescript/no-duplicate-type-constituents",
  "typescript/no-extra-non-null-assertion",
  "typescript/no-floating-promises",
  "typescript/no-for-in-array",
  "typescript/no-implied-eval",
  "typescript/no-meaningless-void-operator",
  "typescript/no-misused-new",
  "typescript/no-misused-spread",
  "typescript/no-non-null-asserted-optional-chain",
  "typescript/no-redundant-type-constituents",
  "typescript/no-this-alias",
  "typescript/no-unnecessary-parameter-property-assignment",
  "typescript/no-unsafe-declaration-merging",
  "typescript/no-unsafe-unary-minus",
  "typescript/no-useless-default-assignment",
  "typescript/no-useless-empty-export",
  "typescript/no-wrapper-object-types",
  "typescript/prefer-as-const",
  "typescript/prefer-namespace-keyword",
  "typescript/require-array-sort-compare",
  "typescript/restrict-template-expressions",
  "typescript/triple-slash-reference",
  "typescript/unbound-method",
  "unicorn/no-await-in-promise-methods",
  "unicorn/no-empty-file",
  "unicorn/no-invalid-fetch-options",
  "unicorn/no-invalid-remove-event-listener",
  "unicorn/no-new-array",
  "unicorn/no-single-promise-in-promise-methods",
  "unicorn/no-thenable",
  "unicorn/no-unnecessary-await",
  "unicorn/no-useless-fallback-in-spread",
  "unicorn/no-useless-length-check",
  "unicorn/no-useless-spread",
  "unicorn/prefer-set-size",
  "unicorn/prefer-string-starts-ends-with",
];

test("loaded correctness categories contain only reviewed native rules", () => {
  assert.ok(Array.isArray(strictConfig.plugins));
  assert.ok(strictConfig.plugins.every((plugin) => typeof plugin === "string"));
  const loadedScopes = new Set(["eslint", ...strictConfig.plugins]);

  const result = spawnSync(
    resolve(root, "node_modules", "oxlint", "bin", "oxlint"),
    ["--rules", "--format", "json"],
    {
      cwd: root,
      encoding: "utf8",
    },
  );

  assert.equal(result.status, 0, result.stderr);
  const inventory: unknown = JSON.parse(result.stdout);
  assert.ok(Array.isArray(inventory));
  assert.ok(inventory.every(isRuleMetadata));

  const actualCorrectnessRules = inventory
    .filter((rule) => rule.category === "correctness" && loadedScopes.has(rule.scope))
    .map((rule) => `${rule.scope}/${rule.value}`)
    .sort();

  assert.deepEqual(
    actualCorrectnessRules,
    reviewedCorrectnessRules,
    "Oxlint's loaded correctness inventory changed; review every added, removed, or reclassified rule before updating this list.",
  );
});

function isRuleMetadata(value: unknown): value is RuleMetadata {
  return (
    typeof value === "object" &&
    value !== null &&
    "category" in value &&
    typeof value.category === "string" &&
    "scope" in value &&
    typeof value.scope === "string" &&
    "value" in value &&
    typeof value.value === "string"
  );
}
