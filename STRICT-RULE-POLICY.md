# Strict rule policy

This document is the authoritative record of the shared strict preset. It incorporates the fresh
post-rollout review of the rules' actual effects across consumer repositories.

## Scope

- Apply adopted rules to every committed TypeScript and JavaScript file.
- Do not exclude vendored source, tests, fixtures, generated source, or tooling.
- Use native Oxlint rules instead of custom equivalents when native enforcement is sufficient.
- Keep native rules in their original namespaces. Reserve `2h2d/` for rules implemented by this
  package.
- Prefer a narrow, explained line suppression over distorting production contracts, adding
  pass-through abstractions, or deleting useful test coverage to satisfy a rule.

## Adopted custom rules

### `2h2d/no-bivariant-method-signatures`

Reject method signatures in object type declarations. TypeScript checks method parameters
bivariantly, which can admit implementations with narrower parameter types and lead to runtime
failures. Declare callable members as function properties so `strictFunctionTypes` checks their
parameters contravariantly.

The rule applies to interface and type-literal method signatures, including optional, generic,
quoted, and computed methods. It does not reject call signatures, construct signatures, class
methods, or object implementation methods. It intentionally has no fixer because safely rewriting
comments, overloads, generics, and computed members requires local judgment.

### `2h2d/no-conditional-empty-object-spread`

Reject object spread operands selected by a conditional expression or logical operator, including
ternary-empty, `&&`, `||`, and `??` forms.

Build the base object first and add condition-controlled fields in explicit statements. This makes
the control flow searchable and prevents omission behavior from being hidden inside object
expansion. Do not provide an autofixer: preserving evaluation order, getters, and overwrite
semantics requires local judgment.

### `2h2d/no-module-mocking`

Reject Vitest and Jest module-loader replacement. Prefer production dependency interfaces, local
servers, temporary directories, real adapters, and faithful test implementations. A narrow
suppression is permitted when the behavior under test genuinely belongs to module loading itself.

### `2h2d/no-object-parameters`

Reject the broad `object` type on function parameters. Use a specific owner contract or a genuine
generic constraint such as `Value extends object`. A reviewed suppression is permitted for an
operation whose exact contract is intentionally only “non-primitive.”

### `2h2d/no-unknown-returns`

Reject explicit function contracts returning `unknown`, a union containing `unknown`,
`Promise<unknown>`, `PromiseLike<unknown>`, or a file-local alias resolving to one of those types.

Parse or validate uncertain data before returning it from an application boundary. A genuinely
generic decoding API may use a narrow reviewed suppression rather than claim a false domain type.

### `2h2d/no-unpreserved-caught-error`

Reject a parameterless catch that throws a replacement global `Error`, `TypeError`, or
`AggregateError`. Add a catch parameter so native `preserve-caught-error` can require it as the
replacement error's `cause`.

This targeted rule replaces the previous requirement that every catch have a parameter.

### `2h2d/no-unreviewed-suppression-directives`

- Ban `@ts-expect-error`, `@ts-ignore`, and `@ts-nocheck`.
- Ban range-wide `oxlint-disable`, `eslint-disable`, and matching enable directives.
- Permit only same-line and next-line lint suppressions.
- Require exactly one named lint rule.
- Require a non-empty explanation after `--`.
- Set the root Oxlint option `reportUnusedDisableDirectives` to `error` in every consumer.

### `2h2d/no-unsafe-dictionary-type`

Reject object dictionaries whose direct value contract is `any`, `object`, `{}`, or a union or
file-local alias containing one of those types.

`Record<string, unknown>` and equivalent index signatures are permitted: `unknown` is a truthful,
type-safe contract when each retrieved value must be narrowed. Use recursive `JsonValue` and
`JsonObject` only after establishing that the data is actually JSON.

## Advisory rules

### `2h2d/no-silent-error-suppression`

Retain silent-error analysis only as an optional review signal. Syntax-only sink and classifier
recognition cannot distinguish intentional fallback, cleanup, and boundary handling from accidental
suppression without project-specific assumptions.

- Keep the rule out of the strict preset and every required lint invocation.
- Report advisory findings as warnings in a separate audit.
- Treat each finding as a prompt for human review rather than proof of a defect.
- Do not add lint suppressions for advisory findings.
- Do not add logging, diagnostics, failure wrappers, or throws solely to satisfy the advisory.

## Adopted native rules

The following rules remain enabled as errors:

| Configuration rule ID                               | Policy                                                            |
| --------------------------------------------------- | ----------------------------------------------------------------- |
| `typescript/consistent-type-assertions`             | Ban every non-const type assertion.                               |
| `typescript/no-explicit-any`                        | Prevent explicit type-system bypasses.                            |
| `typescript/no-floating-promises`                   | Require every Promise rejection to be observed.                   |
| `typescript/no-misused-promises`                    | Do not pass Promise-returning functions to synchronous contracts. |
| `typescript/no-non-null-assertion`                  | Ban unchecked postfix non-null assertions.                        |
| `typescript/no-unsafe-argument`                     | Prevent unsafe values from entering typed calls.                  |
| `typescript/no-unsafe-assignment`                   | Prevent unsafe values from entering typed bindings.               |
| `typescript/no-unsafe-call`                         | Require callable type evidence before invocation.                 |
| `typescript/no-unsafe-member-access`                | Require object type evidence before property access.              |
| `typescript/no-unsafe-return`                       | Prevent unsafe values from escaping typed functions.              |
| `typescript/only-throw-error`                       | Throw values with reliable error semantics.                       |
| `typescript/switch-exhaustiveness-check`            | Handle every union member without relying on `default`.           |
| `typescript/use-unknown-in-catch-callback-variable` | Treat Promise rejection values as uncertain until narrowed.       |
| `preserve-caught-error`                             | Preserve a caught failure when constructing a replacement Error.  |

`typescript/no-floating-promises` uses `ignoreVoid: false`. `void operation()` does not handle a
rejection. The `describe`, `it`, and `test` exports from `node:test` are allowed because the Node
test runner owns and observes their returned Promises. Invoke those registration calls directly
rather than wrapping them in `void`.

`preserve-caught-error` uses `requireCatchParameter: false`. Parameterless best-effort catches do
not need dummy variables; `2h2d/no-unpreserved-caught-error` handles the narrower replacement-error
case.

Exhaustive switches use:

```json
{
  "allowDefaultCaseForExhaustiveSwitch": false,
  "considerDefaultExhaustiveForUnions": false
}
```

## Removed rules

The post-rollout review removed these rules from both the strict preset and the plugin:

| Rule                            | Reason                                                                                             |
| ------------------------------- | -------------------------------------------------------------------------------------------------- |
| `2h2d/no-known-value-widening`  | Syntax-only widening guesses encouraged `Object.assign` rewrites without proving lost type safety. |
| `2h2d/no-runtime-typeof`        | `typeof` is a sound narrowing primitive; wrapping it in a type guard merely moves the same check.  |
| `2h2d/no-shape-in-symbol-names` | A vocabulary ban cannot objectively improve correctness and conflicts with legitimate domains.     |
| `2h2d/no-unknown-type-aliases`  | Aliasing `unknown` can add domain meaning without weakening type safety.                           |

Do not reintroduce these rules without new evidence and a separate review.

## Post-rollout evidence

- The original silent-error implementation accumulated 51 narrow suppressions across consumers,
  including 39 in `pi-openai-codex-compat`.
- Requiring every catch parameter caused 11 paired `no-unused-vars` suppressions in that repository
  and encouraged `void error` statements elsewhere.
- The first non-null migration overused a `requiredValue` helper; a semantic review reduced it from
  82 uses to 13 genuine invariants.
- Known-value widening enforcement introduced empty-object-plus-`Object.assign` rewrites that were
  less direct than ordinary object construction without providing semantic type analysis.
- Unsafe-propagation rules exposed inaccurate broad test fixtures, but upstream `any` declarations
  also created pressure to remove an integration block. Future migrations must preserve useful
  coverage and suppress a rule narrowly at an unavoidable third-party boundary instead.

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
