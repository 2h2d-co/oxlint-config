# Strict rule policy

This document records the adopted strict-preset rules from the second code-quality review and the
rules deliberately deferred for later reconsideration.

## Scope

- Apply adopted rules to every committed TypeScript and JavaScript file.
- Do not exclude vendored source, tests, fixtures, generated source, or tooling.
- Use native Oxlint rules instead of custom equivalents when native enforcement is sufficient.
- Keep native rules in their original namespaces. Reserve `2h2d/` for rules implemented by this
  package.

## Adopted native rules

The following rules are enabled as errors:

| Configuration rule ID                               | Baseline findings | Policy                                                                           |
| --------------------------------------------------- | ----------------: | -------------------------------------------------------------------------------- |
| `typescript/no-floating-promises`                   |                 0 | Keep every created Promise observed or explicitly handled.                       |
| `typescript/no-misused-promises`                    |                 3 | Do not pass Promise-returning functions to synchronous contracts.                |
| `typescript/only-throw-error`                       |                 2 | Throw values with reliable error semantics.                                      |
| `typescript/use-unknown-in-catch-callback-variable` |                 2 | Treat callback failures as uncertain until narrowed.                             |
| `typescript/switch-exhaustiveness-check`            |                 3 | Handle every union member without treating `default` as proof of exhaustiveness. |
| `preserve-caught-error`                             |                26 | Require a catch parameter and preserve the original failure through `cause`.     |
| `typescript/no-non-null-assertion`                  |               184 | Ban unchecked postfix non-null assertions.                                       |
| `typescript/no-explicit-any`                        |                83 | Prevent `any` from bypassing type checking.                                      |
| `typescript/no-unsafe-argument`                     |                30 | Prevent unsafe values from entering typed calls.                                 |
| `typescript/no-unsafe-assignment`                   |                15 | Prevent unsafe values from entering typed bindings.                              |
| `typescript/no-unsafe-call`                         |                43 | Require callable type evidence before invocation.                                |
| `typescript/no-unsafe-member-access`                |                68 | Require object type evidence before property access.                             |
| `typescript/no-unsafe-return`                       |                12 | Prevent unsafe values from escaping typed functions.                             |

Baseline counts came from the 11 repositories migrated to the first shared preset. Diagnostics from
the unsafe-propagation rules overlap, so their counts do not represent distinct changes.

Exhaustive switches use:

```json
{
  "allowDefaultCaseForExhaustiveSwitch": false,
  "considerDefaultExhaustiveForUnions": false
}
```

Caught errors use:

```json
{
  "requireCatchParameter": true
}
```

## Adopted custom rules

### `2h2d/no-unreviewed-suppression-directives`

- Ban `@ts-expect-error`, `@ts-ignore`, and `@ts-nocheck`.
- Ban range-wide `oxlint-disable`, `eslint-disable`, and matching enable directives.
- Permit only same-line and next-line lint suppressions.
- Require exactly one named lint rule.
- Require a specific explanation after `--`.
- Set the root Oxlint option `reportUnusedDisableDirectives` to `error` in every consumer.

Example:

```ts
// oxlint-disable-next-line no-await-in-loop -- protocol operations must remain ordered.
await operation();
```

### `2h2d/no-silent-error-suppression`

- Reject catch handlers without a syntactic failure-propagation path.
- Reject inline `.catch(...)` callbacks without a syntactic failure-propagation path.
- Recognize `throw` and a returned `Promise.reject(...)` as propagation.
- Require expected failures to be classified explicitly while preserving a path for unexpected
  failures.
- Leave named `.catch(handler)` callbacks to analysis of the handler's own implementation.

## Deferred for later reconsideration

These native rules remain disabled until a later pilot:

| Rule                                    | Baseline findings | Reason for deferral                                                                            |
| --------------------------------------- | ----------------: | ---------------------------------------------------------------------------------------------- |
| `typescript/strict-boolean-expressions` |               409 | Requires explicit decisions about nullish, empty, zero, and false values across many branches. |
| `typescript/no-unnecessary-condition`   |               262 | Defensive checks and generated or external type contracts need deliberate review.              |
| `typescript/prefer-nullish-coalescing`  |                21 | Each change must preserve valid falsy values such as `""`, `0`, and `false`.                   |

Do not enable or remove these from consideration without a separate review.

## Custom rules not currently justified

- Do not add a JSON.parse-specific rule while the unsafe-propagation rules enforce validation more
  generally.
- Do not ban assigning object adapters to narrower contracts until a precise rule can distinguish
  unsafe production code from intentional focused test implementations.
- Do not add generic naming, line-count, or single-use-helper rules without evidence that they can
  enforce an objective policy with low noise.
