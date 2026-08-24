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

### `2h2d/no-module-mocking`

Reject Vitest and Jest module-loader replacement. Prefer production dependency interfaces, local
servers, temporary directories, real adapters, and faithful test implementations. A narrow
suppression is permitted when the behavior under test genuinely belongs to module loading itself.

The native restricted-method rules are not a sufficient replacement in the shared configuration.
Loading a framework plugin also activates its unrelated correctness-category rules, while loading
both Jest and Vitest restrictions produces duplicate diagnostics for shared methods. Keep the
focused custom scope analysis until Oxlint can enable the restriction without those side effects.

### `2h2d/no-broad-object-parameters`

Reject the broad `object` type on function parameters. Use a specific owner contract or a genuine
generic constraint such as `Value extends object`. Resolve local generic aliases and defaults so
they cannot hide a broad contract. A reviewed suppression is permitted for an operation whose exact
contract is intentionally only “non-primitive.”

### `2h2d/no-typebox-unsafe`

Reject calls to TypeBox's `Unsafe` schema constructor through named, aliased, default, or namespace
imports from `typebox`. `Type.Unsafe` manually pairs a runtime schema with an independently stated
static type, allowing either contract to drift without a compiler error.

Use TypeBox constructors and derive with `Static<typeof schema>`, or preserve an exact native JSON
Schema as a const object literal and derive its type the same way. The rule resolves import bindings
to avoid rejecting unrelated local APIs named `Type` or `Unsafe`. It intentionally has no fixer
because selecting the authoritative runtime schema and preserving protocol-specific serialization
requires review.

### `2h2d/require-narrow-suppression-directives`

- Ban range-wide `oxlint-disable`, `eslint-disable`, and matching enable directives.
- Permit only same-line and next-line lint suppressions.
- Require exactly one named lint rule.
- Require an explanation of at least ten characters after `--`.
- Let native `typescript/ban-ts-comment` govern TypeScript directives: ban `@ts-ignore` and
  `@ts-nocheck`, permit `@ts-check`, and require a meaningful description on `@ts-expect-error`.
- Supply the root Oxlint option `reportUnusedDisableDirectives: "error"` through the shared strict
  configuration.

### `2h2d/no-broad-dictionary-values`

Reject object dictionaries whose direct value contract is `object`, or a union or local alias
containing that broad contract. Also reject semantically empty contracts hidden where the native
empty-object rule deliberately does not report, including `unknown & {}` and
`NonNullable<unknown>`.

Native `typescript/no-empty-object-type` owns direct `{}` and empty declaration diagnostics.
Native `typescript/no-explicit-any` owns explicit `any` diagnostics. The custom rule must not
duplicate either native diagnostic.

`Record<string, unknown>` and equivalent index signatures are permitted: `unknown` is a truthful,
type-safe contract when each retrieved value must be narrowed. Use recursive `JsonValue` and
`JsonObject` only after establishing that the data is actually JSON. A narrow suppression is valid
when “non-primitive” is the dictionary's exact value contract.

### `2h2d/require-promise-rejection-parameter`

Require inline and locally resolvable callbacks passed to `.catch`, plus second-argument rejection
callbacks passed to `.then`, to declare at least one runtime parameter. This extends the objective
parameter-retention policy of native `preserve-caught-error` to Promise-style rejection callbacks
without attempting to recognize logging methods, diagnostic sinks, expected-error classifiers, or
adequate control flow.

The Oxlint JavaScript plugin API exposes syntax and scopes but no TypeScript parser services, while
the separate type-aware backend has no custom-rule registration surface. The rule therefore
recognizes `catch` and `then` method names syntactically. Use a narrow explained suppression for an
unrelated API with the same method name, or when intentionally discarding a rejection reason is the
actual best-effort contract. Diagnostics for locally resolved named callbacks are reported at each
rejection-handler argument, keeping suppressions attached to the Promise operation that discards the
reason rather than to the reusable callback declaration.

## Adopted native rules

The following rules are explicitly enabled as errors. The shared strict configuration also enables
Oxlint's version-pinned native `correctness` category.

| Configuration rule ID                               | Policy                                                            |
| --------------------------------------------------- | ----------------------------------------------------------------- |
| `array-callback-return`                             | Require value-producing array callbacks to return a value.        |
| `eqeqeq`                                            | Prohibit coercive equality while permitting nullish checks.       |
| `no-case-declarations`                              | Give lexical declarations an explicit case-local scope.           |
| `no-extend-native`                                  | Prevent process-wide mutation of built-in prototypes.             |
| `no-new-func`                                       | Prohibit dynamic function compilation.                            |
| `no-var`                                            | Use block-scoped declarations instead of function-scoped `var`.   |
| `oxc/misrefactored-assign-op`                       | Detect targets accidentally retained in compound assignments.     |
| `oxc/no-accumulating-spread`                        | Prevent quadratic copying while accumulating collections.         |
| `typescript/ban-ts-comment`                         | Allow only explained `@ts-expect-error` compiler suppressions.    |
| `typescript/consistent-type-assertions`             | Ban every non-const type assertion.                               |
| `typescript/method-signature-style`                 | Require contravariantly checked function-property signatures.     |
| `typescript/no-empty-object-type`                   | Ban misleading `{}` and empty declarations.                       |
| `typescript/no-explicit-any`                        | Prevent explicit type-system bypasses.                            |
| `typescript/no-floating-promises`                   | Require every Promise rejection to be observed.                   |
| `typescript/no-import-type-side-effects`            | Remove type-only imports completely at runtime.                   |
| `typescript/no-invalid-void-type`                   | Keep `void` in valid return and generic positions.                |
| `typescript/no-misused-promises`                    | Do not pass Promise-returning functions to synchronous contracts. |
| `typescript/no-non-null-assertion`                  | Ban unchecked postfix non-null assertions.                        |
| `typescript/no-unnecessary-type-parameters`         | Require generics to relate or preserve type information.          |
| `typescript/no-unsafe-argument`                     | Prevent unsafe values from entering typed calls.                  |
| `typescript/no-unsafe-assignment`                   | Prevent unsafe values from entering typed bindings.               |
| `typescript/no-unsafe-call`                         | Require callable type evidence before invocation.                 |
| `typescript/no-unsafe-enum-comparison`              | Compare enum values only with related domains.                    |
| `typescript/no-unsafe-function-type`                | Ban the unchecked uppercase `Function` type.                      |
| `typescript/no-unsafe-member-access`                | Require object type evidence before property access.              |
| `typescript/no-unsafe-return`                       | Prevent unsafe values from escaping typed functions.              |
| `typescript/only-throw-error`                       | Throw values with reliable error semantics.                       |
| `typescript/prefer-promise-reject-errors`           | Use stack-bearing Promise rejection reasons when known.           |
| `typescript/return-await`                           | Preserve local async error-handling semantics.                    |
| `typescript/switch-exhaustiveness-check`            | Handle every union member without relying on `default`.           |
| `typescript/use-unknown-in-catch-callback-variable` | Treat Promise rejection values as uncertain until narrowed.       |
| `unicorn/no-accessor-recursion`                     | Prevent getters and setters from recursively invoking themselves. |
| `unicorn/no-array-fill-with-reference-type`         | Prevent accidental aliasing across filled array elements.         |
| `preserve-caught-error`                             | Preserve a caught failure when constructing a replacement Error.  |

`eqeqeq` uses `"always"` with `{ "null": "ignore" }`. Intentional `value == null` checks remain
valid while other coercive equality is prohibited.

`no-case-declarations` prevents lexical bindings from silently belonging to an entire switch.
Cases that own declarations use explicit blocks. A deliberate cross-case binding requires a narrow
explanation.

`no-var` expresses the declaration policy directly instead of treating a function-scoped `var` as
though it were scoped to its nearest visual block. TypeScript ambient declarations remain valid.

`no-extend-native` permits local constructors and subclasses while rejecting additions to native
global prototypes. A polyfill or deliberate runtime patch requires a narrow explained suppression
because it changes process-wide behavior.

`oxc/misrefactored-assign-op` reports likely incomplete rewrites such as `total += total + amount`.
Its simplification is a suggestion rather than an automatic fix. Preserve an intentional recurrence
with a clearer ordinary assignment or a narrow explanation instead of applying a semantic rewrite
blindly.

`oxc/no-accumulating-spread` has no automatic fixer. Prefer a linear construction, but do not
replace immutable accumulation with mutation when a caller-owned seed or intermediate snapshots
must remain unchanged. Those ownership and persistence contracts justify a narrow explained
suppression.

`unicorn/no-accessor-recursion` catches same-property access that would ordinarily overflow the
stack. A dynamic accessor that replaces itself before the reported access requires a narrow
explanation of why recursion cannot occur.

`unicorn/no-array-fill-with-reference-type` catches obvious object references that `fill` would
reuse in every array position. It is intentionally incomplete because it has no type information.
Shared immutable sentinels and custom `fill` methods that clone their input require a narrow
explanation.

`typescript/no-floating-promises` uses `ignoreVoid: false`. `void operation()` does not handle a
rejection. A package-qualified exemption allows only the `describe`, `it`, and `test` declarations
from `node:test`, whose runner owns and observes their returned Promises. Invoke those registrations
directly rather than wrapping them in `void`.

`preserve-caught-error` uses `requireCatchParameter: true`. Every catch must retain its failure, and
replacement built-in errors must preserve it as their `cause`. Whether a caught failure should be
logged or recorded remains a review decision: no custom syntax rule attempts to recognize
project-specific diagnostic sinks.

`2h2d/require-promise-rejection-parameter` closes the equivalent parameterless-callback gap for
Promise-style `.catch` and `.then` rejection handlers. It deliberately does not infer whether
mentioning the parameter constitutes adequate handling.

`typescript/prefer-promise-reject-errors` permits forwarding an `unknown` or externally typed `any`
rejection reason unchanged. It still rejects known non-Error reasons and empty rejection calls.
Native unsafe-propagation rules prohibit introducing or propagating explicit `any` elsewhere. This
preserves failure identity at uncertain boundaries instead of forcing a wrapper.

`typescript/return-await` uses `"error-handling-correctness-only"`. It requires `await` only where
returning a bare Promise would bypass local `try`/`catch` behavior; it does not impose stylistic
`return await` elsewhere.

`typescript/no-unnecessary-type-parameters` prevents a meaningless generic from bypassing
`2h2d/no-broad-object-parameters`. A generic constrained by `object` is valid only when it relates
multiple positions or preserves the caller's type through an output. If “any non-primitive” is the
exact one-way input contract, use `object` with a narrow explained suppression instead.

Exhaustive switches use:

```json
{
  "allowDefaultCaseForExhaustiveSwitch": false,
  "considerDefaultExhaustiveForUnions": false
}
```

### Native correctness-category exceptions

The pinned native `correctness` category is enabled, with these explicit exceptions:

| Rule                                           | Reason                                                                                          |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `oxc/double-comparisons`                       | Syntax-only rewrites are unsound for `NaN`, coercive comparisons, and object identity.          |
| `oxc/erasing-op`                               | Zero arithmetic can preserve `NaN`, negative zero, infinity, and operand side effects.          |
| `oxc/number-arg-out-of-range`                  | Its number-formatting precision limits are obsolete under modern ECMAScript.                    |
| `oxc/uninvoked-array-callback`                 | It mistakes function values passed to non-callback methods such as `fill` for callbacks.        |
| `unicorn/no-empty-file`                        | Empty files can be intentional generated artifacts, fixtures, or reserved entry points.         |
| `unicorn/no-new-array`                         | `new Array(length)` intentionally creates a sparse array; suggested replacements can be dense.  |
| `unicorn/no-single-promise-in-promise-methods` | A one-element combinator can intentionally preserve aggregate shape and fresh Promise identity. |
| `unicorn/no-thenable`                          | Deliberate `PromiseLike` implementations are a standard JavaScript interoperability contract.   |
| `unicorn/no-useless-spread`                    | Spread can intentionally snapshot iterables, normalize arrays, or change consumption timing.    |
| `unicorn/prefer-string-starts-ends-with`       | Anchored regular expressions have edge-case semantics not shared by string methods.             |

## Removed rules

The post-rollout review removed these rules from both the strict preset and the plugin:

| Rule                                      | Reason                                                                                             |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `2h2d/no-bivariant-method-signatures`     | Native `typescript/method-signature-style` now provides the same enforcement.                      |
| `2h2d/no-conditional-empty-object-spread` | Conditional object construction is valid, concise, and often preserves useful inference.           |
| `2h2d/no-known-value-widening`            | Syntax-only widening guesses encouraged `Object.assign` rewrites without proving lost type safety. |
| `2h2d/no-runtime-typeof`                  | `typeof` is a sound narrowing primitive; wrapping it in a type guard merely moves the same check.  |
| `2h2d/no-shape-in-symbol-names`           | A vocabulary ban cannot objectively improve correctness and conflicts with legitimate domains.     |
| `2h2d/no-silent-error-suppression`        | Logging policy requires project context and remains a human review concern.                        |
| `2h2d/no-unknown-returns`                 | `unknown` is safe and often truthful; syntax cannot prove that a boundary knows a narrower domain. |
| `2h2d/no-unknown-type-aliases`            | Aliasing `unknown` can add domain meaning without weakening type safety.                           |
| `2h2d/no-unpreserved-caught-error`        | Native `preserve-caught-error` now requires a catch parameter in every handler.                    |

Do not reintroduce these rules without new evidence and a separate review.

The Promise rejection parameter rule is not a restoration of silent-error analysis. It enforces
only whether the callback can access its rejection reason and contains no sink-name or
control-flow heuristics.

## Post-rollout evidence

- The original silent-error implementation accumulated 51 narrow suppressions across consumers,
  including 39 in `pi-openai-codex-compat`.
- Requiring every catch parameter caused 11 paired `no-unused-vars` suppressions in that repository
  and encouraged `void error` statements elsewhere.
- The first non-null migration overused a `requiredValue` helper; a semantic review reduced it from
  82 uses to 13 genuine invariants.
- Known-value widening enforcement introduced empty-object-plus-`Object.assign` rewrites that were
  less direct than ordinary object construction without providing semantic type analysis.
- Unknown-return enforcement rejected truthful generic contracts, produced no useful unsuppressed
  findings across the in-scope repositories, and could be bypassed through inference, imported
  aliases, or object wrappers. Native unnecessary-type-parameter enforcement covers dishonest
  caller-selected generics without rejecting `unknown`.
- Unsafe-propagation rules exposed inaccurate broad test fixtures, but upstream `any` declarations
  also created pressure to remove an integration block. Future migrations must preserve useful
  coverage and suppress a rule narrowly at an unavoidable third-party boundary instead.
- A native-rule trial across all ten in-scope repositories found three genuine type-only import
  side effects and two bare Promise returns that bypass local error handling. Configured nullish
  equality and opaque Promise rejection allowances preserve all intentional current contracts
  without suppressions.
- Native module-mocking restrictions recognized globals, aliases, computed methods, and local
  shadowing, but loading both framework plugins duplicated shared findings and loading either
  expanded the correctness ruleset. The focused custom rule remains lower-noise.

The current native-only caught-error policy deliberately restores catch parameters despite the
earlier migration result. Consumer adoption must not reintroduce `void error`, dummy reads, or
paired unused-variable suppressions. Review each caught failure for propagation, diagnostics, or a
documented best-effort contract; logging itself remains non-blocking.

## Deferred for later reconsideration

These native rules remain disabled until a later pilot:

| Rule                                    | Baseline findings | Reason for deferral                                                                            |
| --------------------------------------- | ----------------: | ---------------------------------------------------------------------------------------------- |
| `typescript/strict-boolean-expressions` |               409 | Requires explicit decisions about nullish, empty, zero, and false values across many branches. |
| `typescript/no-unnecessary-condition`   |               267 | Defensive checks and generated or external type contracts need deliberate review.              |
| `typescript/prefer-nullish-coalescing`  |                21 | Each change must preserve valid falsy values such as `""`, `0`, and `false`.                   |

Do not enable or remove these from consideration without a separate review.

## Custom rules not currently justified

- Do not add a JSON.parse-specific rule while the unsafe-propagation rules enforce validation more
  generally.
- Do not ban assigning object adapters to narrower contracts until a precise rule can distinguish
  unsafe production code from intentional focused test implementations.
- Do not add generic naming, line-count, or single-use-helper rules without evidence that they can
  enforce an objective policy with low noise.
