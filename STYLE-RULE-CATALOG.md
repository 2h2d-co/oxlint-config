# Native style rule catalog

This catalog evaluates Oxlint 1.78.0 and `oxlint-tsgolint` 7.0.2001 against the
shared strict preset's objective: improve practical TypeScript without creating
formatter churn, false contracts, gameable compliance, or unexplained
suppressions.

## Dictionary

- **Syntax rule**: a rule that sees parsed source and scopes but no TypeScript
  types.
- **Type-aware rule**: a native TypeScript rule executed by `oxlint-tsgolint`
  with compiler type information.
- **Wave A**: a rule suitable for blocking adoption after its listed findings
  are reviewed.
- **Pilot**: a rule that needs focused semantic and adversarial tests before it
  can become blocking.

## Scope and method

The active shared plugins expose 128 native rules in Oxlint's `style` category:

| Source plugin | Rules | Type-aware |
| ------------- | ----: | ---------: |
| ESLint core   |    54 |          0 |
| TypeScript    |    25 |          9 |
| Unicorn       |    49 |          0 |

Framework, test-runner, import, Node, Promise, Vue, and JSDoc style rules are not
universal policy. Evaluate those in package-specific plugin configurations
instead of loading them into the shared strict set.

The baseline ran the equivalent of:

```sh
oxlint -A all -D style --type-aware --format=json
```

across these ten in-scope repositories:

- `exa-search-cli`
- `new`
- `oxlint-config`
- `parallel-search-cli`
- `pi-dont-change-my-defaults`
- `pi-openai-codex-compat`
- `pi-openai-codex-fast`
- `pi-system-prompt-patcher`
- `tree-sitter-wasms`
- `vscode-node-tests`

The audit was read-only. It found 14,811 style diagnostics from 49 rules.
Enabling the entire category would overwhelmingly reward mechanical compliance:

| Rule                                     | Findings |
| ---------------------------------------- | -------: |
| `one-var`                                |    3,501 |
| `no-magic-numbers`                       |    2,566 |
| `sort-keys`                              |    2,118 |
| `func-style`                             |    1,426 |
| `curly`                                  |      920 |
| `no-ternary`                             |      781 |
| `sort-imports`                           |      663 |
| `max-statements`                         |      498 |
| `typescript/consistent-type-definitions` |      249 |
| `unicorn/switch-case-braces`             |      232 |

The full category must remain disabled. Adopt individual rules only.

## Decision standard

A blocking style rule should satisfy all of these:

1. Its accepted form communicates more information or removes an objective
   hazard.
2. It does not merely choose between equally practical TypeScript forms.
3. It does not change runtime behavior, public contracts, inference, or
   declaration-merging capabilities.
4. It is difficult to satisfy with dummy code.
5. Syntax-only matching is sufficiently precise for the construct.
6. Any remaining exception represents a real contract and can carry a useful
   narrow explanation.

Autofix availability is not evidence that a change is semantically safe.

## Already adopted

| Rule                                    | Reason                                                        |
| --------------------------------------- | ------------------------------------------------------------- |
| `no-new-func`                           | Reject runtime compilation rather than choose syntax style.   |
| `typescript/consistent-type-assertions` | Ban non-const assertions instead of selecting assertion form. |
| `typescript/method-signature-style`     | Restore contravariant parameter checking for object methods.  |

## Wave A recommendations

These rules have a narrow, objective contract and should be the first style
adoption wave.

| Rule                                                                                                       | Baseline | Configuration or reason                                                                                    |
| ---------------------------------------------------------------------------------------------------------- | -------: | ---------------------------------------------------------------------------------------------------------- |
| `default-case-last`                                                                                        |        0 | Keep fallback control flow in the conventional terminal position.                                          |
| `default-param-last`                                                                                       |        0 | Avoid APIs that require callers to pass `undefined` to reach a later required parameter.                   |
| `grouped-accessor-pairs`                                                                                   |        0 | Keep paired getters and setters discoverable together.                                                     |
| `no-extra-label`, `no-label-var`                                                                           |        0 | Remove redundant labels and label/variable ambiguity without banning useful labels.                        |
| `no-lone-blocks`                                                                                           |        0 | Reject only blocks that do not provide lexical scope; blocks containing lexical declarations remain valid. |
| `no-multi-str`                                                                                             |        0 | Reject fragile backslash-newline string continuation.                                                      |
| `no-return-assign`                                                                                         |        0 | Use default `except-parens`, which permits an intentional assignment when parentheses make it explicit.    |
| `no-script-url`                                                                                            |        0 | Reject executable `javascript:` URLs.                                                                      |
| `no-useless-computed-key`                                                                                  |        0 | Remove needless computed syntax; quoted external keys remain available.                                    |
| `object-shorthand`                                                                                         |        0 | Configure as `["error", "properties"]`; do not rewrite function properties into non-constructable methods. |
| `prefer-const`                                                                                             |        1 | Preserve the invariant that a binding is not reassigned.                                                   |
| `prefer-exponentiation-operator`, `prefer-numeric-literals`, `prefer-object-has-own`, `prefer-rest-params` |        0 | Prefer direct language forms over legacy ceremony when the rule proves the narrow rewrite shape.           |
| `typescript/adjacent-overload-signatures`                                                                  |        0 | Keep every overload of one callable visible as a unit.                                                     |
| `typescript/ban-tslint-comment`                                                                            |        0 | Reject obsolete directives that no current tool honors.                                                    |
| `typescript/consistent-type-imports`                                                                       |        1 | Use type-only imports, but allow `import()` type annotations and keep separate type imports.               |
| `typescript/consistent-type-exports`                                                                       |        0 | Type-aware; prevent type-only symbols from implying a runtime export.                                      |
| `typescript/no-unnecessary-qualifier`                                                                      |        0 | Type-aware; remove only namespace qualifiers proven redundant.                                             |
| `typescript/prefer-find`                                                                                   |        0 | Type-aware; express first-match intent without allocating and traversing a complete filtered array.        |
| `typescript/prefer-readonly`                                                                               |        0 | Type-aware; applies only to private class members proven not to be reassigned.                             |
| `typescript/prefer-reduce-type-parameter`                                                                  |        0 | Type-aware; replace an assignable reducer assertion with the API's type parameter.                         |
| `unicorn/error-message`                                                                                    |        0 | Require non-empty messages on global built-in Error constructors.                                          |

Use these exact non-default configurations:

```json
{
  "no-return-assign": ["error", "except-parens"],
  "object-shorthand": ["error", "properties"],
  "typescript/consistent-type-imports": [
    "error",
    {
      "disallowTypeAnnotations": false,
      "fixStyle": "separate-type-imports",
      "prefer": "type-imports"
    }
  ]
}
```

The two current findings are small but still require semantic review; a zero or
low count is not permission to apply fixes blindly.

## Type-aware companion recommendations

These rules are not classified as `style` by Oxlint, but they enforce nearby
type-driven cleanup more reliably than syntax-only alternatives.

| Rule                                            | Category     | Baseline | Recommendation                                                                                                                      |
| ----------------------------------------------- | ------------ | -------: | ----------------------------------------------------------------------------------------------------------------------------------- |
| `typescript/no-deprecated`                      | `pedantic`   |        5 | Adopt. Migrate two obsolete project APIs; narrowly explain the three `process.umask()` uses for which Node has no safe alternative. |
| `typescript/no-mixed-enums`                     | `pedantic`   |        0 | Adopt. Mixed string/number enum domains are rarely a truthful contract.                                                             |
| `typescript/prefer-includes`                    | `pedantic`   |        0 | Adopt instead of syntax-only `unicorn/prefer-includes`; it verifies a compatible receiver API.                                      |
| `typescript/related-getter-setter-pairs`        | `pedantic`   |        0 | Adopt. Require getter output to be accepted by its paired setter while still permitting a wider setter input.                       |
| `typescript/no-unnecessary-template-expression` | `suspicious` |        1 | Adopt. It removes interpolation only when type analysis proves the expression is already a string or static value.                  |
| `typescript/restrict-plus-operands`             | `pedantic`   |        0 | Pilot explicit options. The permissive defaults add little, while banning practical string/number construction may create ceremony. |
| `typescript/no-unnecessary-type-conversion`     | `suspicious` |        1 | Pilot. The native implementation is marked pending, and an explicit conversion may document boundary normalization.                 |
| `typescript/prefer-optional-chain`              | `nursery`    |       14 | Defer. Oxlint marks its fixes dangerous and the rule nursery while return-type and short-circuit edge cases are tested.             |

The existing policy for `strict-boolean-expressions`,
`no-unnecessary-condition`, and `prefer-nullish-coalescing` remains deferred.

## Pilot before blocking

| Rule                                     | Baseline | Risk to test                                                                                                        |
| ---------------------------------------- | -------: | ------------------------------------------------------------------------------------------------------------------- |
| `no-duplicate-imports`                   |       18 | Native rule is pending. All findings inspected were deliberate type/value splits; test `allowSeparateTypeImports`.  |
| `prefer-spread`                          |        0 | Verify array-like but non-iterable argument lists and `this` preservation.                                          |
| `typescript/prefer-for-of`               |        0 | Native rule is pending; test sparse arrays, mutation during iteration, and side effects.                            |
| `typescript/prefer-function-type`        |        0 | Verify ambient and declaration-merging interfaces before removing that capability.                                  |
| `typescript/prefer-return-this-type`     |        0 | Replacing a class return type with polymorphic `this` strengthens a public fluent contract.                         |
| `unicorn/no-useless-collection-argument` |        2 | Both findings are useful cleanup, but syntax-only matching does not prove `Set` or `Map` is the global constructor. |
| `unicorn/prefer-bigint-literals`         |        0 | Rewriting an unsafe numeric literal can intentionally correct, but does change, its already-rounded runtime value.  |
| `unicorn/prefer-string-trim-start-end`   |        0 | Syntax-only matching cannot prove the receiver is a built-in string.                                                |

Pilot rules remain disabled until focused tests establish that false positives
can be represented by rare, meaningful suppressions rather than code-shape
workarounds.

## Rejected type-aware style rules

| Rule                                        | Baseline | Reason                                                                                                                         |
| ------------------------------------------- | -------: | ------------------------------------------------------------------------------------------------------------------------------ |
| `typescript/dot-notation`                   |      145 | Bracket notation often marks protocol and externally named keys; dot notation adds no type safety.                             |
| `typescript/prefer-regexp-exec`             |       20 | `String#match` is practical and often clearer; forcing `exec` adds stateful-regex ceremony without a correctness improvement.  |
| `typescript/prefer-string-starts-ends-with` |        0 | One rule combines safe slice cleanup with anchored-regex rewrites whose `$` newline semantics are not identical to `endsWith`. |

## Other style rules not suitable for the strict set

The remaining native style rules are intentionally rejected rather than left
unevaluated.

### Pure convention, formatter ownership, or equally practical forms

- `arrow-body-style`, `capitalized-comments`, `func-name-matching`,
  `func-names`, `func-style`, `init-declarations`,
  `logical-assignment-operators`, `no-implicit-coercion`, `no-multi-assign`,
  `operator-assignment`, `prefer-arrow-callback`, `prefer-destructuring`,
  `prefer-named-capture-group`, `prefer-template`, `sort-imports`, `sort-keys`,
  `vars-on-top`, `yoda`
- `typescript/array-type`, `typescript/class-literal-property-style`,
  `typescript/consistent-generic-constructors`,
  `typescript/consistent-indexed-object-style`,
  `typescript/consistent-type-definitions`, `typescript/no-inferrable-types`,
  `typescript/parameter-properties`, `typescript/unified-signatures`
- `unicorn/catch-error-name`, `unicorn/consistent-existence-index-check`,
  `unicorn/consistent-template-literal-escape`, `unicorn/empty-brace-spaces`,
  `unicorn/explicit-timer-delay`, `unicorn/filename-case`,
  `unicorn/no-console-spaces`, `unicorn/no-zero-fractions`,
  `unicorn/number-literal-case`, `unicorn/numeric-separators-style`,
  `unicorn/relative-url-style`, `unicorn/switch-case-break-position`,
  `unicorn/text-encoding-identifier-case`

Notable examples: explicit boolean comparisons can aid boundary readability;
`interface` and `type` have different capabilities; explicit default generic
arguments can pin intent against a future library default.

### Complexity metrics and syntax bans

- `curly`, `guard-for-in`, `id-denylist`, `id-length`, `id-match`,
  `max-params`, `max-statements`, `no-continue`, `no-labels`,
  `no-magic-numbers`, `no-nested-ternary`, `no-ternary`, `one-var`
- `unicorn/max-nested-calls`, `unicorn/no-nested-ternary`, `unicorn/no-null`,
  `unicorn/no-unreadable-array-destructuring`,
  `unicorn/prefer-logical-operator-over-ternary`, `unicorn/prefer-ternary`,
  `unicorn/switch-case-braces`

These rules encourage extraction, constants, nesting, or control-flow expansion
without proving that the result is easier to understand. `guard-for-in` is also
gameable: any appropriately positioned `if` satisfies it without checking
`Object.hasOwn`.

### Broad syntax matching or semantic rewrites

- `new-cap`, `no-template-curly-in-string`, `prefer-object-spread`,
  `prefer-regex-literals`
- `unicorn/consistent-date-clone`, `unicorn/custom-error-definition`,
  `unicorn/no-array-method-this-argument`,
  `unicorn/no-await-expression-member`, `unicorn/prefer-array-index-of`,
  `unicorn/prefer-class-fields`, `unicorn/prefer-default-parameters`,
  `unicorn/prefer-export-from`, `unicorn/prefer-global-this`,
  `unicorn/prefer-includes`, `unicorn/prefer-negative-index`,
  `unicorn/prefer-object-from-entries`,
  `unicorn/prefer-optional-catch-binding`, `unicorn/prefer-reflect-apply`,
  `unicorn/prefer-spread`, `unicorn/prefer-string-raw`,
  `unicorn/prefer-structured-clone`, `unicorn/require-array-join-separator`,
  `unicorn/throw-new-error`

Observed evidence includes:

- all seven `no-template-curly-in-string` findings were intentional embedded
  JavaScript or grammar fixture source;
- all four `unicorn/no-array-method-this-argument` findings were false
  positives on a project API named `find(provider, modelId)`;
- the 75 `new-cap` findings included TypeBox `Value.Check` builder calls;
- `prefer-regex-literals` rejected intentional `String.raw` regular-expression
  construction;
- `throw-new-error` assumes every capitalized `*Error` call is a constructor,
  even though error factories are valid and global `Error()` is equivalent to
  `new Error()`.

Rules that force temporary variables, object-construction rewrites, callback
braces, or alternate Promise identity are especially likely to manufacture
slop.

### Package-specific APIs

- `unicorn/prefer-classlist-toggle`,
  `unicorn/prefer-dom-node-text-content`,
  `unicorn/prefer-keyboard-event-key`, `unicorn/prefer-modern-dom-apis`,
  `unicorn/prefer-response-static-json`, `unicorn/require-module-attributes`

These belong, if anywhere, in browser, Fetch, or module-format-specific
configurations.

### Redundant or conflicting rules

- `typescript/no-empty-interface` is covered more completely by the adopted
  `typescript/no-empty-object-type`.
- `unicorn/prefer-includes` has a type-aware native replacement.
- `unicorn/prefer-optional-catch-binding` directly conflicts with the adopted
  caught-error retention policy.

## Type-aware rules that look stylistic but should stay disabled

These rules are outside Oxlint's `style` category but are frequent sources of
style-driven rewrites:

| Rule                                                | Baseline | Decision                                                                                                           |
| --------------------------------------------------- | -------: | ------------------------------------------------------------------------------------------------------------------ |
| `typescript/prefer-readonly-parameter-types`        |    2,195 | Reject; it makes ordinary mutable ecosystem APIs impractical and spreads deep-readonly ceremony.                   |
| `typescript/strict-boolean-expressions`             |      387 | Keep deferred; each nullish, zero, empty-string, and false decision is domain-specific.                            |
| `typescript/no-unnecessary-condition`               |      270 | Keep deferred; defensive checks can intentionally protect against external or stale declarations.                  |
| `typescript/require-await`                          |      112 | Reject; removing `async` changes synchronous throw timing and Promise identity.                                    |
| `typescript/no-confusing-void-expression`           |       96 | Reject; it expands concise callbacks and deliberate `void` expressions into ceremony.                              |
| `typescript/promise-function-async`                 |       38 | Reject; adding `async` also changes Promise identity and error timing.                                             |
| `typescript/consistent-return`                      |       23 | Reject as universal style; explicit `undefined` returns can conceal rather than clarify callback intent.           |
| `typescript/prefer-nullish-coalescing`              |       19 | Keep deferred; changes require a decision about every valid falsy value.                                           |
| `typescript/strict-void-return`                     |       17 | Reject; TypeScript deliberately permits value-returning callbacks in `void` positions, such as `push` and `write`. |
| `typescript/no-unnecessary-boolean-literal-compare` |        8 | Reject; `value === true` can communicate exact boundary intent even when the type is already boolean.              |
| `typescript/no-unnecessary-type-arguments`          |        0 | Reject; explicitly selecting a default generic can document and pin a public contract.                             |
| `typescript/non-nullable-type-assertion-style`      |        0 | Reject; it prefers postfix `!`, which the strict preset prohibits.                                                 |

## Recommended rollout

1. Add focused preset tests for every Wave A option.
2. Enable Wave A in `oxlint-config` and review its two current findings without
   touching consumer repositories.
3. Publish and roll out in the established repository order, with
   `pi-openai-codex-compat` last.
4. Treat every new suppression as a failed-rule-design signal until its
   explanation demonstrates a genuine contract.
5. Evaluate pilot rules separately; do not bundle them into the Wave A release.
