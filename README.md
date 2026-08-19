# @2h2d/oxlint-config

Shared Oxlint rules and strict configuration for 2h2d TypeScript and JavaScript repositories.

The package combines:

- custom syntax and scope rules under the `2h2d/` namespace;
- selected native Oxlint rules;
- one versioned policy consumed by regular Oxlint and Vite+ projects.

## Install

Install the package and its exact supported Oxlint version as development dependencies:

```bash
npm install --save-dev --save-exact @2h2d/oxlint-config oxlint@1.78.0
```

## Oxlint configuration

Create `oxlint.config.ts`:

```ts
import { strictRules } from "@2h2d/oxlint-config/strict-rules";
import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["typescript", "unicorn", "oxc"],
  jsPlugins: [
    {
      name: "2h2d",
      specifier: "@2h2d/oxlint-config/plugin",
    },
  ],
  categories: {
    correctness: "error",
  },
  rules: strictRules,
  env: {
    builtin: true,
  },
  options: {
    reportUnusedDisableDirectives: "error",
    typeAware: true,
    typeCheck: true,
  },
});
```

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

- `2h2d/no-conditional-empty-object-spread`
- `2h2d/no-module-mocking`
- `2h2d/no-object-parameters`
- `2h2d/no-unknown-returns`
- `2h2d/no-unpreserved-caught-error`
- `2h2d/no-unreviewed-suppression-directives`
- `2h2d/no-unsafe-dictionary-type`

The suppression-directive rule bans TypeScript suppression comments. Lint suppressions must use
`disable-line` or `disable-next-line`, name exactly one rule, and include an explanation after
`--`. `reportUnusedDisableDirectives: "error"` is a root configuration option rather than a rule,
so consumer configurations must set it as shown above.

The conditional-spread rule rejects object spread operands selected by conditional or logical
expressions. Build the object first and add condition-controlled fields in explicit statements;
the rule intentionally has no fixer because a mechanical rewrite can change evaluation order or
property semantics.

The unpreserved-error rule rejects replacement built-in errors thrown from parameterless catches.
It complements native `preserve-caught-error` without requiring dummy catch variables for
best-effort cleanup.

## Advisory rules

`2h2d/no-silent-error-suppression` is available separately as a review signal:

```ts
import { advisoryRules } from "@2h2d/oxlint-config/advisory-rules";
```

The rule analyzes reachable handler paths and reports failures that it cannot prove are propagated,
classified, returned, or recorded. Its syntax-only sink and classifier recognition is heuristic:
a finding is a prompt for human review, not proof of a defect.

Do not combine `advisoryRules` with the strict preset in a lint invocation that denies warnings.
Run it separately when reviewing error handling. Advisory findings require neither source
suppressions nor code changes. In particular, do not add logging, failure wrappers, or throws
solely to satisfy the advisory.

## Native rules

The strict preset also enables these native Oxlint rules:

```json
{
  "preserve-caught-error": ["error", { "requireCatchParameter": false }],
  "typescript/consistent-type-assertions": ["error", { "assertionStyle": "never" }],
  "typescript/no-explicit-any": "error",
  "typescript/no-floating-promises": [
    "error",
    {
      "allowForKnownSafeCalls": ["describe", "it", "test"],
      "ignoreVoid": false
    }
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
      "allowDefaultCaseForExhaustiveSwitch": false,
      "considerDefaultExhaustiveForUnions": false
    }
  ],
  "typescript/use-unknown-in-catch-callback-variable": "error"
}
```

Every non-const type assertion and postfix non-null assertion is prohibited. `as const` remains
allowed. `void promise` is not accepted as Promise rejection handling. Node's `describe`, `it`, and
`test` registration calls are allowed because the test runner observes their Promises; invoke those
registrations directly rather than wrapping them in `void`.

## Rule namespaces

Rules retain the namespace of their implementation:

- native TypeScript rules use configuration IDs such as `typescript/no-explicit-any` and are
  displayed as `typescript(no-explicit-any)`;
- native ESLint-compatible rules use IDs such as `preserve-caught-error` and are displayed as
  `eslint(preserve-caught-error)`;
- rules implemented by this package use IDs such as `2h2d/no-silent-error-suppression` and are
  displayed as `2h2d(no-silent-error-suppression)`.

Importing a native rule through `strictRules` does not move it into the `2h2d` namespace.

## Rule design

- Parse uncertain values at their I/O boundary.
- Propagate unexpected failures and preserve their original causes.
- Add condition-controlled object fields through explicit statements rather than hiding control
  flow inside a spread operand.
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
This package pins and tests Oxlint and `@oxlint/plugins` 1.78.0. Update those versions together and
validate the package-consumer integration test before release.

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
