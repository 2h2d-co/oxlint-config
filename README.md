# @2h2d/oxlint-config

Shared Oxlint rules and strict configuration for 2h2d TypeScript and JavaScript repositories.

The package combines:

- custom syntax and scope rules under the `2h2d/` namespace;
- selected native Oxlint rules;
- one versioned policy consumed by regular Oxlint and Vite+ projects.

## Install

Install the package and its exact supported Oxlint version as development dependencies:

```bash
npm install --save-dev --save-exact @2h2d/oxlint-config@alpha oxlint@1.78.0 oxlint-tsgolint@7.0.2001
```

## Oxlint configuration

Create `oxlint.config.ts`:

```ts
import { strictConfig } from "@2h2d/oxlint-config";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [strictConfig],
});
```

The inherited configuration enables the TypeScript, Unicorn, and Oxc plugins; the native
`correctness` category; the shared rules; built-in globals; type-aware linting and type checking;
and unused suppression reporting. Add project-specific rules or overrides after `extends`.

The package requires Node.js 22.19 or newer, matching the generated 2h2d TypeScript projects.

## Vite+ configuration

Import the same rule map into the Vite+ lint configuration:

```ts
import { strictRules } from "@2h2d/oxlint-config/strict-rules";
import { defineConfig } from "vite-plus";

export default defineConfig({
  lint: {
    plugins: ["typescript", "unicorn", "oxc"],
    jsPlugins: [
      {
        name: "2h2d",
        specifier: "@2h2d/oxlint-config/plugin",
      },
    ],
    rules: strictRules,
    options: {
      reportUnusedDisableDirectives: "error",
      typeAware: true,
      typeCheck: true,
    },
  },
});
```

## Custom rules

The strict preset enables these custom rules as errors:

- `2h2d/no-broad-dictionary-values`
- `2h2d/no-broad-object-parameters`
- `2h2d/no-module-mocking`
- `2h2d/no-typebox-unsafe`
- `2h2d/require-narrow-suppression-directives`
- `2h2d/require-promise-rejection-parameter`

The suppression-directive rule requires lint suppressions to use `disable-line` or
`disable-next-line`, name exactly one rule, and include an explanation after `--`. Native
`typescript/ban-ts-comment` separately bans `@ts-ignore` and `@ts-nocheck` while allowing
`@ts-expect-error` with a meaningful description. Both explanations require at least ten
characters. `reportUnusedDisableDirectives: "error"` is a root configuration option supplied by
the inherited strict configuration.

The module-mocking rule prohibits `mock`, `doMock`, and `unstable_mockModule` calls on Jest and
Vitest APIs. Tests replace dependencies through production interfaces or faithful implementations.
Native restricted-method rules were not adopted because loading their framework plugins also
activates unrelated correctness-category rules, and loading both produces duplicate diagnostics.

The TypeBox rule rejects `Unsafe` calls imported from `typebox`, including named, aliased, default,
and namespace import forms. Prefer TypeBox builders. When builders cannot express the schema, use
const native JSON Schema and derive the static type with `Static<typeof schema>`; although TypeBox
does not strongly check the native schema's keywords, deriving from it still prevents an
independently declared static type from drifting away. Use `Unsafe` with a narrow explained
suppression only when neither representation can express the required invariant.

The broad-object-parameter rule rejects the lowercase `object` contract on function inputs,
including local generic aliases that resolve to it, while allowing meaningful generic constraints
such as `Value extends object`. Suppress it narrowly when “any non-primitive” is the exact intended
API. Do not replace an accurate `object` contract with a one-position generic such as
`<Value extends object>(value: Value): void`; native
`typescript/no-unnecessary-type-parameters` rejects that generic because it does not relate or
preserve type information.

The dictionary rule rejects direct value contracts based on `object` and semantically empty
contracts hidden behind intersections or utility types. Native `typescript/no-empty-object-type`
owns explicit `{}` and empty declaration diagnostics, while `typescript/no-explicit-any` owns
explicit `any`. Use `unknown` when values are genuinely uncertain and narrow them before use.

The Promise rejection parameter rule requires inline and locally resolvable `.catch` callbacks, and
the rejection callback passed to `.then`, to declare the rejection reason. It closes the syntax gap
between Promise callbacks and native `preserve-caught-error` without guessing whether a particular
logging or diagnostic sink is adequate. Because Oxlint JavaScript plugins do not receive type
information, unrelated APIs using `catch` or `then` can use a narrow explained suppression.

## Native rules

The strict rule map explicitly enables these native Oxlint rules. The exported strict configuration
additionally enables Oxlint's native `correctness` category; inspect the effective version-pinned
set with `oxlint --print-config <file>`.

```json
{
  "array-callback-return": "error",
  "eqeqeq": ["error", "always", { "null": "ignore" }],
  "no-extend-native": "error",
  "no-new-func": "error",
  "no-var": "error",
  "preserve-caught-error": ["error", { "requireCatchParameter": true }],
  "typescript/ban-ts-comment": [
    "error",
    {
      "minimumDescriptionLength": 10,
      "ts-check": false,
      "ts-expect-error": "allow-with-description",
      "ts-ignore": true,
      "ts-nocheck": true
    }
  ],
  "typescript/consistent-type-assertions": ["error", { "assertionStyle": "never" }],
  "typescript/method-signature-style": ["error", "property"],
  "typescript/no-empty-object-type": "error",
  "typescript/no-explicit-any": "error",
  "typescript/no-floating-promises": [
    "error",
    {
      "allowForKnownSafeCalls": [
        {
          "from": "package",
          "name": ["describe", "it", "test"],
          "package": "node:test"
        }
      ],
      "ignoreVoid": false
    }
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
      "allowEmptyReject": false,
      "allowThrowingAny": true,
      "allowThrowingUnknown": true
    }
  ],
  "typescript/return-await": ["error", "error-handling-correctness-only"],
  "typescript/switch-exhaustiveness-check": [
    "error",
    {
      "allowDefaultCaseForExhaustiveSwitch": false,
      "considerDefaultExhaustiveForUnions": false
    }
  ],
  "typescript/use-unknown-in-catch-callback-variable": "error",
  "oxc/double-comparisons": "off",
  "oxc/erasing-op": "off",
  "oxc/number-arg-out-of-range": "off",
  "oxc/uninvoked-array-callback": "off",
  "unicorn/no-empty-file": "off",
  "unicorn/no-new-array": "off",
  "unicorn/no-single-promise-in-promise-methods": "off",
  "unicorn/no-thenable": "off",
  "unicorn/no-useless-spread": "off",
  "unicorn/prefer-string-starts-ends-with": "off"
}
```

Function-scoped `var` declarations are prohibited in favor of `let` and `const`; TypeScript ambient
declarations remain valid. Native global prototypes must not be extended. Intentional polyfills or
runtime patches require a narrow explained suppression because they alter process-wide behavior.

The strict map explicitly disables ten rules inherited from the native `correctness` category.
Syntax-only comparison algebra is not sound for values such as `NaN` or objects with coercion
semantics. Arithmetic involving zero can preserve `NaN`, infinity, negative zero, or operand side
effects instead of collapsing to the numeric value `0`. Obsolete number-formatting limits reject
precision values permitted by modern JavaScript. Function values passed to array methods such as
`fill` are not necessarily callbacks. Spread can intentionally snapshot an iterable or convert
sparse slots into dense `undefined` values. Empty committed files can be meaningful artifacts;
single-argument `new Array(length)` has intentional sparse-array semantics; a one-element Promise
combinator can preserve aggregation shape and Promise identity; custom thenables are a standard
interoperability contract; and anchored regular expressions are not always equivalent to
`startsWith` or `endsWith`.

Every catch must bind its failure, and replacement built-in errors must preserve that value as their
`cause`. Promise-style rejection callbacks must likewise bind their rejection reason. Whether a
caught failure should be logged or recorded is a review decision rather than a custom lint
heuristic.

Every non-const type assertion and postfix non-null assertion is prohibited. `as const` remains
allowed. Empty `{}` and unsafe `Function` contracts are prohibited. Object-type callables use
function-property syntax so `strictFunctionTypes` checks parameter variance. `void promise` is not
accepted as Promise rejection handling, and a Promise returned from a `try` block must be awaited
when rejection would otherwise bypass local error handling. Only the `describe`, `it`, and `test`
declarations from `node:test` are exempt from floating-Promise enforcement because the test runner
observes their Promises.

Generic parameters must relate multiple positions or preserve information through an output. Do not
use a one-position generic merely to disguise a broad input contract.

`Promise.reject` requires an `Error` when the rejection type is known. An `unknown` or externally
typed `any` reason may be forwarded unchanged so the lint policy does not force wrapping that
alters failure identity. Explicit `any` remains prohibited at its source.

## Rule namespaces

Rules retain the namespace of their implementation:

- native TypeScript rules use configuration IDs such as `typescript/no-explicit-any` and are
  displayed as `typescript(no-explicit-any)`;
- native ESLint-compatible rules use IDs such as `preserve-caught-error` and are displayed as
  `eslint(preserve-caught-error)`;
- rules implemented by this package use IDs such as `2h2d/no-broad-object-parameters` and are
  displayed as `2h2d(no-broad-object-parameters)`.

Importing a native rule through `strictRules` does not move it into the `2h2d` namespace.

## Rule design

- Parse uncertain values at their I/O boundary.
- Declare callable object-type members as function properties so their parameters are checked
  contravariantly.
- Derive static types from their runtime schemas instead of pairing them through `Type.Unsafe`.
- Propagate unexpected failures and preserve their original causes.
- Keep promises observable and use exhaustive union handling.
- Use named contracts for meaningful inputs and outputs.
- Use `unknown` for genuinely uncertain dictionary values and narrow each value before use.
- Represent data with recursive `JsonValue` and `JsonObject` only after establishing that it is
  JSON.
- Replace dependencies through production interfaces rather than module-loader mocks.
- Apply policy to every committed TypeScript and JavaScript file without special directories for
  vendored, test, or tooling code.
- Prefer a narrow explained suppression over distorting a contract, adding a pass-through helper,
  or deleting useful test coverage.

## Compatibility

Oxlint JavaScript plugins are currently alpha and outside normal semantic-versioning guarantees.
This package pins and tests Oxlint and `@oxlint/plugins` 1.78.0 with
`oxlint-tsgolint` 7.0.2001. Update those versions together and validate the package-consumer
integration test before release.

## Development

```bash
npm install
npm run check
npm test
npm run pack:dry
```

`npm test` builds the package before running rule, preset, package-export, and Oxlint consumer tests.

## Packaging

`.github/npm-package-files` is the authoritative package-content allowlist used by the local release
command and both CI jobs. Update it whenever the intended published file set changes.

## Release staging

Repository setup:

1. Configure npm trusted publishing for `2h2d-co/oxlint-config` using
   `.github/workflows/publish.yml` and the `npm-publish` environment.
2. Restrict that GitHub environment to `v*` tags without a deployment reviewer or administrator
   bypass.
3. Protect `main` with code-owner review and protect `v*` tags from unauthorized changes while
   retaining the repository-administrator release path.
4. Replace `.github/release-signers` if release commits use a different SSH signing key.

Release flow:

1. Run `npm run release -- X.Y.Z` from a clean, synchronized `main`.
2. Inspect the signed release commit and lightweight tag.
3. Push them atomically with `git push --atomic origin main vX.Y.Z`.
4. Approve the staged package after CI verifies its source, signature, digest, provenance, and
   contents.

## Attribution

Selected rules are adapted from
[`dmmulroy/anti-slop`](https://github.com/dmmulroy/anti-slop) under the MIT License. See
`THIRD_PARTY_NOTICES.md` and `LICENSES/anti-slop-MIT.txt`.
