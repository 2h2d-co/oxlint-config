# @2h2d/oxlint-config

Shared Oxlint rules and strict configuration for 2h2d TypeScript and JavaScript repositories.

The package combines:

- custom syntax and scope rules under the `2h2d/` namespace;
- selected native Oxlint rules;
- one versioned policy consumed by regular Oxlint and Vite+ projects.

## Install

Install the package and its exact supported Oxlint version as development dependencies:

```bash
npm install --save-dev --save-exact @2h2d/oxlint-config oxlint@1.77.0
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
      typeAware: true,
      typeCheck: true,
    },
  },
});
```

## Custom rules

The strict preset enables these custom rules as errors:

- `2h2d/no-conditional-empty-object-spread`
- `2h2d/no-known-value-widening`
- `2h2d/no-module-mocking`
- `2h2d/no-object-parameters`
- `2h2d/no-runtime-typeof` with `allowInTypeGuards: true`
- `2h2d/no-shape-in-symbol-names`
- `2h2d/no-unknown-returns`
- `2h2d/no-unknown-type-aliases`
- `2h2d/no-unsafe-dictionary-type`

The preset also bans every non-const type assertion:

```json
{
  "typescript/consistent-type-assertions": ["error", { "assertionStyle": "never" }]
}
```

`as const` remains allowed.

## Rule design

- Parse uncertain values at their I/O boundary.
- Preserve known keys, literals, and domain types.
- Prefer `satisfies` to widening annotations.
- Use named contracts for meaningful inputs and outputs.
- Represent arbitrary JSON with recursive `JsonValue` and `JsonObject` types.
- Replace dependencies through production interfaces rather than module-loader mocks.
- Apply policy to every committed TypeScript and JavaScript file without special directories for
  vendored, test, or tooling code.

## Compatibility

Oxlint JavaScript plugins are currently alpha and outside normal semantic-versioning guarantees.
This package pins and tests Oxlint and `@oxlint/plugins` 1.77.0. Update those versions together and
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
2. Restrict that GitHub environment to `v*` tags and require a reviewer.
3. Protect `main` with code-owner review and protect `v*` tags from unauthorized changes.
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
