# Unenabled native rule catalog

This is a review snapshot for `@2h2d/oxlint-config` 0.1.1 and Oxlint 1.79.0.
It contains every native rule that is available in a namespace loaded by `strictConfig` but is
not enabled by either the `correctness` category or an explicit rule entry.

## Scope and method

- **Included namespaces:** `eslint`, `typescript`, `unicorn`, `oxc`, `promise`.
- **Excluded as already enabled:** every rule reported as `deny` by
  `oxlint --print-config src/index.ts`.
- **Excluded as explicitly disabled:** 12 rules reported as `allow` by the effective
  configuration; their rationale remains in `STRICT-RULE-POLICY.md`.
- **Out of scope:** rules from plugins the shared configuration does not load, such as React,
  Jest, Vitest, Vue, import, JSDoc, Node, Next.js, and JSX accessibility.
- **Descriptions:** concise descriptions from the official Oxlint source at tag
  [`oxlint_v1.79.0`](https://github.com/oxc-project/oxc/tree/oxlint_v1.79.0/crates/oxc_linter/src/rules),
  with each rule linked to its official documentation.
- **Type-aware:** the rule needs TypeScript type information, so its findings and runtime cost
  should be assessed with the configured type-aware backend.

The three rules marked **deferred by policy** are intentionally reserved for a later pilot in
`STRICT-RULE-POLICY.md`; they remain here because they are absent rather than configured as
explicit `off` entries.

## Summary

| Namespace    | Suspicious | Pedantic | Style | Restriction | Performance | Nursery |   Total | Type-aware |
| ------------ | ---------: | -------: | ----: | ----------: | ----------: | ------: | ------: | ---------: |
| `eslint`     |         11 |       27 |    53 |          22 |           2 |       4 |     119 |          0 |
| `typescript` |         10 |       14 |    23 |          11 |           0 |       2 |      60 |         31 |
| `unicorn`    |          8 |       47 |    49 |          13 |           3 |       1 |     121 |          0 |
| `oxc`        |          3 |        1 |     0 |           6 |           1 |       0 |      11 |          0 |
| `promise`    |          2 |        0 |     7 |           2 |           0 |       1 |      12 |          0 |
| **Total**    |         34 |       89 |   132 |          54 |           6 |       8 | **323** |     **31** |

## `eslint`

- [`eslint/accessor-pairs`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/accessor-pairs.html) — Enforces getter/setter pairs in objects and classes. _(pedantic)_
- [`eslint/arrow-body-style`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/arrow-body-style.html) — Enforce consistent use of braces in arrow functions. _(style)_
- [`eslint/block-scoped-var`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/block-scoped-var.html) — Enforce the use of variables within the scope they are defined. _(suspicious)_
- [`eslint/capitalized-comments`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/capitalized-comments.html) — Enforces or disallows capitalization of the first letter of a comment. _(style)_
- [`eslint/class-methods-use-this`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/class-methods-use-this.html) — Enforce that class methods utilize `this`. _(restriction)_
- [`eslint/complexity`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/complexity.html) — Enforces a maximum cyclomatic complexity in a program, which is the number of linearly independent paths in a program. _(restriction)_
- [`eslint/curly`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/curly.html) — Enforce consistent brace style for all control statements. _(style)_
- [`eslint/default-case`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/default-case.html) — Enforces that all `switch` statements include a `default` case, unless explicitly marked with a configured comment. _(restriction)_
- [`eslint/default-case-last`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/default-case-last.html) — Requires the `default` clause in `switch` statements to be the last one. _(style)_
- [`eslint/default-param-last`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/default-param-last.html) — Requires default parameters in functions to be the last ones. _(style)_
- [`eslint/func-name-matching`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/func-name-matching.html) — Requires function expression names to match the variable or property names they are assigned to, or disallows such matches with `"never"`. _(style)_
- [`eslint/func-names`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/func-names.html) — Require or disallow named function expressions. _(style)_
- [`eslint/func-style`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/func-style.html) — Enforce the consistent use of either function declarations or expressions assigned to variables. _(style)_
- [`eslint/grouped-accessor-pairs`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/grouped-accessor-pairs.html) — Require grouped accessor pairs in object literals and classes. _(style)_
- [`eslint/guard-for-in`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/guard-for-in.html) — Require for-in loops to include an if statement. _(style)_
- [`eslint/id-denylist`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/id-denylist.html) — Disallow specified identifiers. _(style)_
- [`eslint/id-length`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/id-length.html) — Enforce a minimum and/or maximum identifier length convention by counting the graphemes for a given identifier. _(style)_
- [`eslint/id-match`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/id-match.html) — Enforces a naming convention for identifiers by requiring each checked name to match a configured regular expression. _(style)_
- [`eslint/init-declarations`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/init-declarations.html) — Require or disallow initialization in variable declarations. _(style)_
- [`eslint/logical-assignment-operators`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/logical-assignment-operators.html) — This rule requires or disallows logical assignment operator shorthand. _(style)_
- [`eslint/max-classes-per-file`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/max-classes-per-file.html) — Enforce a maximum number of classes per file. _(pedantic)_
- [`eslint/max-depth`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/max-depth.html) — Enforce a maximum depth that blocks can be nested. _(pedantic)_
- [`eslint/max-lines`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/max-lines.html) — Enforce a maximum number of lines per file. _(pedantic)_
- [`eslint/max-lines-per-function`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/max-lines-per-function.html) — Enforce a maximum number of lines of code in a function. _(pedantic)_
- [`eslint/max-nested-callbacks`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/max-nested-callbacks.html) — Enforce a maximum depth that callbacks can be nested. _(pedantic)_
- [`eslint/max-params`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/max-params.html) — Enforce a maximum number of parameters in function definitions which by default is three. _(style)_
- [`eslint/max-statements`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/max-statements.html) — Enforce a maximum number of statements in a function. _(style)_
- [`eslint/new-cap`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/new-cap.html) — This rule requires constructor names to begin with a capital letter. _(style)_
- [`eslint/no-alert`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-alert.html) — Disallow the use of `alert`, `confirm`, and `prompt`. _(restriction)_
- [`eslint/no-array-constructor`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-array-constructor.html) — Disallows creating arrays with the `Array` constructor. _(pedantic)_
- [`eslint/no-await-in-loop`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-await-in-loop.html) — Disallow the use of `await` within loop bodies. _(perf)_
- [`eslint/no-bitwise`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-bitwise.html) — Disallow bitwise operators. _(restriction)_
- [`eslint/no-console`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-console.html) — Disallow the use of console. _(restriction)_
- [`eslint/no-continue`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-continue.html) — Disallow `continue` statements. _(style)_
- [`eslint/no-div-regex`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-div-regex.html) — Disallow equal signs explicitly at the beginning of regular expressions. _(restriction)_
- [`eslint/no-duplicate-imports`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-duplicate-imports.html) — Disallow duplicate module imports. _(style)_
- [`eslint/no-else-return`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-else-return.html) — Disallow `else` blocks after `return` statements in `if` statements. _(pedantic)_
- [`eslint/no-empty`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-empty.html) — Disallows empty block statements. _(restriction)_
- [`eslint/no-empty-function`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-empty-function.html) — Disallows the usage of empty functions. _(restriction)_
- [`eslint/no-eq-null`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-eq-null.html) — Disallow `null` comparisons without type-checking operators. _(restriction)_
- [`eslint/no-extra-bind`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-extra-bind.html) — Disallow unnecessary calls to `.bind()`. _(suspicious)_
- [`eslint/no-extra-label`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-extra-label.html) — Disallow unnecessary labels. _(style)_
- [`eslint/no-fallthrough`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-fallthrough.html) — Disallow fallthrough of `case` statements. _(pedantic)_
- [`eslint/no-implicit-coercion`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-implicit-coercion.html) — Disallow shorthand type conversions using operators like `!!`, unary `+`, and `"" +`. _(style)_
- [`eslint/no-implicit-globals`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-implicit-globals.html) — Disallows declarations in the global scope, global variable leaks, and writes or redeclarations of read-only globals. _(restriction)_
- [`eslint/no-implied-eval`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-implied-eval.html) — Disallows passing strings to `setTimeout()`, `setInterval()`, and `execScript()`. _(suspicious)_
- [`eslint/no-inline-comments`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-inline-comments.html) — Disallows comments on the same line as code. _(pedantic)_
- [`eslint/no-inner-declarations`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-inner-declarations.html) — Disallow variable or function declarations in nested blocks. _(pedantic)_
- [`eslint/no-label-var`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-label-var.html) — Disallow labels that share a name with a variable. _(style)_
- [`eslint/no-labels`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-labels.html) — Disallow labeled statements. _(style)_
- [`eslint/no-lone-blocks`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-lone-blocks.html) — Disallows unnecessary standalone block statements. _(style)_
- [`eslint/no-lonely-if`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-lonely-if.html) — Disallow `if` statements as the only statement in `else` blocks. _(pedantic)_
- [`eslint/no-loop-func`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-loop-func.html) — Disallows function declarations and expressions inside loop statements when they reference variables declared in the outer scope that may change across iterations. _(pedantic)_
- [`eslint/no-magic-numbers`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-magic-numbers.html) — Disallow magic numbers. _(style)_
- [`eslint/no-multi-assign`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-multi-assign.html) — Disallow use of chained assignment expressions. _(style)_
- [`eslint/no-multi-str`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-multi-str.html) — Disallow multiline strings. _(style)_
- [`eslint/no-negated-condition`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-negated-condition.html) — Disallow negated conditions. _(pedantic)_
- [`eslint/no-nested-ternary`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-nested-ternary.html) — Disallow nested ternary expressions. _(style)_
- [`eslint/no-new`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-new.html) — Disallow new operators outside of assignments or comparisons. _(suspicious)_
- [`eslint/no-object-constructor`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-object-constructor.html) — Disallow calls to the Object constructor without an argument. _(pedantic)_
- [`eslint/no-param-reassign`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-param-reassign.html) — Disallow reassigning function parameters or, optionally, their properties. _(restriction)_
- [`eslint/no-plusplus`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-plusplus.html) — Disallow the unary operators `++` and `--`. _(restriction)_
- [`eslint/no-promise-executor-return`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-promise-executor-return.html) — Disallow returning values from Promise executor functions. _(pedantic)_
- [`eslint/no-redeclare`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-redeclare.html) — Disallow variable redeclaration. _(pedantic)_
- [`eslint/no-regex-spaces`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-regex-spaces.html) — Disallow 2+ consecutive spaces in regular expressions. _(restriction)_
- [`eslint/no-restricted-exports`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-restricted-exports.html) — Disallow specified names in exports. _(nursery)_
- [`eslint/no-restricted-globals`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-restricted-globals.html) — Specify global variable names that should not be used in your application. _(restriction)_
- [`eslint/no-restricted-imports`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-restricted-imports.html) — Disallow specified modules when loaded by `import`. _(restriction)_
- [`eslint/no-restricted-properties`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-restricted-properties.html) — This rule allows you to disallow access to certain properties on certain objects. _(restriction)_
- [`eslint/no-return-assign`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-return-assign.html) — Disallows assignment operators in return statements. _(style)_
- [`eslint/no-script-url`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-script-url.html) — Disallow `javascript:` URLs. _(style)_
- [`eslint/no-self-compare`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-self-compare.html) — Disallow comparisons where both sides are exactly the same. _(pedantic)_
- [`eslint/no-sequences`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-sequences.html) — Disallows the use of the comma operator. _(restriction)_
- [`eslint/no-shadow`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-shadow.html) — Disallows variable declarations from shadowing variables declared in the outer scope. _(suspicious)_
- [`eslint/no-template-curly-in-string`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-template-curly-in-string.html) — Disallow template literal placeholder syntax in regular strings. _(style)_
- [`eslint/no-ternary`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-ternary.html) — Disallow ternary operators. _(style)_
- [`eslint/no-throw-literal`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-throw-literal.html) — Disallow throwing literals or non-Error objects as exceptions. _(pedantic)_
- [`eslint/no-undef`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-undef.html) — Disallow the use of undeclared variables. _(nursery)_
- [`eslint/no-undefined`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-undefined.html) — Disallow the use of `undefined` as an identifier. _(restriction)_
- [`eslint/no-underscore-dangle`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-underscore-dangle.html) — Disallows dangling underscores in identifiers. _(suspicious)_
- [`eslint/no-unexpected-multiline`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-unexpected-multiline.html) — Disallow confusing multiline expressions. _(suspicious)_
- [`eslint/no-unmodified-loop-condition`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-unmodified-loop-condition.html) — Disallow references in loop conditions that are never modified within the loop. _(suspicious)_
- [`eslint/no-unneeded-ternary`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-unneeded-ternary.html) — Disallow ternary operators when simpler alternatives exist. _(suspicious)_
- [`eslint/no-unreachable-loop`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-unreachable-loop.html) — Disallow loops whose body allows only one iteration. _(nursery)_
- [`eslint/no-use-before-define`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-use-before-define.html) — Disallows using variables before they are defined. _(restriction)_
- [`eslint/no-useless-assignment`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-useless-assignment.html) — Disallow variable assignments when the value is not used. _(nursery)_
- [`eslint/no-useless-call`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-useless-call.html) — Disallow unnecessary calls to `.call()` and `.apply()`. _(perf)_
- [`eslint/no-useless-computed-key`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-useless-computed-key.html) — Disallow unnecessary computed property keys in objects and classes. _(style)_
- [`eslint/no-useless-concat`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-useless-concat.html) — Disallow unnecessary concatenation of literals or template literals. _(suspicious)_
- [`eslint/no-useless-constructor`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-useless-constructor.html) — Disallow constructors that can be safely removed without changing how the class works. _(suspicious)_
- [`eslint/no-useless-return`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-useless-return.html) — Disallows redundant return statements. _(pedantic)_
- [`eslint/no-void`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-void.html) — Disallows the use of the `void` operator. _(restriction)_
- [`eslint/no-warning-comments`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-warning-comments.html) — Disallows warning comments such as TODO, FIXME, XXX in code. _(pedantic)_
- [`eslint/object-shorthand`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/object-shorthand.html) — Require or disallow method and property shorthand syntax for object literals. _(style)_
- [`eslint/one-var`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/one-var.html) — Enforce variables to be declared either together or separately in functions. _(style)_
- [`eslint/operator-assignment`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/operator-assignment.html) — Enforce whether to use assignment operator shorthand. _(style)_
- [`eslint/prefer-arrow-callback`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/prefer-arrow-callback.html) — Requires using arrow functions for callbacks. _(style)_
- [`eslint/prefer-const`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/prefer-const.html) — Requires `const` declarations for variables that are never reassigned after their initial declaration. _(style)_
- [`eslint/prefer-destructuring`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/prefer-destructuring.html) — Require destructuring from arrays and/or objects. _(style)_
- [`eslint/prefer-exponentiation-operator`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/prefer-exponentiation-operator.html) — Disallow the use of `Math.pow` in favor of the `**` operator. _(style)_
- [`eslint/prefer-named-capture-group`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/prefer-named-capture-group.html) — Enforces the use of named capture groups in regular expressions. _(style)_
- [`eslint/prefer-numeric-literals`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/prefer-numeric-literals.html) — Disallow `parseInt()` and `Number.parseInt()` in favor of binary, octal, and hexadecimal literals. _(style)_
- [`eslint/prefer-object-has-own`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/prefer-object-has-own.html) — Disallow use of `Object.prototype.hasOwnProperty.call()` and prefer use of `Object.hasOwn()`. _(style)_
- [`eslint/prefer-object-spread`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/prefer-object-spread.html) — Disallow using `Object.assign` with an object literal as the first argument and prefer the use of object spread instead. _(style)_
- [`eslint/prefer-promise-reject-errors`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/prefer-promise-reject-errors.html) — Require using Error objects as Promise rejection reasons. _(pedantic)_
- [`eslint/prefer-regex-literals`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/prefer-regex-literals.html) — Disallow use of the RegExp constructor in favor of regular expression literals. _(style)_
- [`eslint/prefer-rest-params`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/prefer-rest-params.html) — Disallows the use of the `arguments` object and instead enforces the use of rest parameters. _(style)_
- [`eslint/prefer-spread`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/prefer-spread.html) — Require spread operators instead of `.apply()`. _(style)_
- [`eslint/prefer-template`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/prefer-template.html) — Require template literals instead of string concatenation. _(style)_
- [`eslint/radix`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/radix.html) — Enforce the consistent use of the radix argument when using `parseInt()`, which specifies what base to use for parsing the number. _(pedantic)_
- [`eslint/require-await`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/require-await.html) — Disallow async functions which have no `await` expression. _(pedantic)_
- [`eslint/require-unicode-regexp`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/require-unicode-regexp.html) — Enforce the use of `u` or `v` flag on regular expressions. _(pedantic)_
- [`eslint/sort-imports`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/sort-imports.html) — Enforce sorted import declarations. _(style)_
- [`eslint/sort-keys`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/sort-keys.html) — When declaring multiple properties, sorting property names alphabetically makes it easier to find and/or diff necessary properties at a later time. _(style)_
- [`eslint/sort-vars`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/sort-vars.html) — Enforce sorting of variable declarations within the same block. _(pedantic)_
- [`eslint/symbol-description`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/symbol-description.html) — Require symbol descriptions. _(pedantic)_
- [`eslint/unicode-bom`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/unicode-bom.html) — Require or disallow Unicode byte order mark (BOM). _(restriction)_
- [`eslint/vars-on-top`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/vars-on-top.html) — Enforces that all `var` declarations are placed at the top of their containing scope. _(style)_
- [`eslint/yoda`](https://oxc.rs/docs/guide/usage/linter/rules/eslint/yoda.html) — Require or disallow "Yoda" conditions. _(style)_

## `typescript`

- [`typescript/adjacent-overload-signatures`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/adjacent-overload-signatures.html) — Require that function overload signatures be consecutive. _(style)_
- [`typescript/array-type`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/array-type.html) — Require consistently using either `T[]` or `Array<T>` for arrays. _(style)_
- [`typescript/ban-tslint-comment`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/ban-tslint-comment.html) — This rule disallows `tslint:<rule-flag>` comments. _(style)_
- [`typescript/ban-types`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/ban-types.html) — Disallow certain types. _(pedantic)_
- [`typescript/class-literal-property-style`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/class-literal-property-style.html) — Enforces a consistent style for exposing literal values on classes. _(style)_
- [`typescript/consistent-generic-constructors`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/consistent-generic-constructors.html) — Enforce specifying generic type arguments on type annotation or constructor name of a constructor call. _(style)_
- [`typescript/consistent-indexed-object-style`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/consistent-indexed-object-style.html) — Choose between requiring either `Record` type or indexed signature types. _(style)_
- [`typescript/consistent-return`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/consistent-return.html) — Enforce consistent return behavior in functions. _(suspicious; type-aware)_
- [`typescript/consistent-type-definitions`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/consistent-type-definitions.html) — Enforce type definitions to consistently use either `interface` or `type`. _(style)_
- [`typescript/consistent-type-exports`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/consistent-type-exports.html) — Enforce using `export type` for exports that are only used as types. _(style; type-aware)_
- [`typescript/consistent-type-imports`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/consistent-type-imports.html) — Enforce consistent usage of type imports. _(style)_
- [`typescript/dot-notation`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/dot-notation.html) — Enforce dot notation whenever property access can be written safely as `obj.prop`. _(style; type-aware)_
- [`typescript/explicit-function-return-type`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/explicit-function-return-type.html) — This rule enforces that functions have an explicit return type annotation. _(restriction)_
- [`typescript/explicit-member-accessibility`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/explicit-member-accessibility.html) — Require explicit accessibility modifiers on class properties and methods. _(restriction)_
- [`typescript/explicit-module-boundary-types`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/explicit-module-boundary-types.html) — Require explicit return and argument types on exported functions' and classes' public class methods. _(restriction)_
- [`typescript/no-confusing-non-null-assertion`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-confusing-non-null-assertion.html) — Disallow non-null assertion in locations that may be confusing. _(suspicious)_
- [`typescript/no-confusing-void-expression`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-confusing-void-expression.html) — This rule forbids using void expressions in confusing locations such as arrow function returns. _(pedantic; type-aware)_
- [`typescript/no-deprecated`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-deprecated.html) — Disallow using code marked as `@deprecated`. _(pedantic; type-aware)_
- [`typescript/no-dynamic-delete`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-dynamic-delete.html) — Disallow using the delete operator on computed key expressions. _(restriction)_
- [`typescript/no-empty-interface`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-empty-interface.html) — Disallow the declaration of empty interfaces. _(style)_
- [`typescript/no-extraneous-class`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-extraneous-class.html) — Disallow classes used as namespaces. _(suspicious)_
- [`typescript/no-inferrable-types`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-inferrable-types.html) — Disallow explicit type declarations for variables or parameters initialized to a number, string, or boolean. _(style)_
- [`typescript/no-mixed-enums`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-mixed-enums.html) — This rule disallows enums from having both string and numeric members. _(pedantic; type-aware)_
- [`typescript/no-namespace`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-namespace.html) — Disallow TypeScript namespaces. _(restriction)_
- [`typescript/no-non-null-asserted-nullish-coalescing`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-non-null-asserted-nullish-coalescing.html) — Disallow non-null assertions in the left operand of a nullish coalescing operator. _(restriction)_
- [`typescript/no-restricted-types`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-restricted-types.html) — Disallow certain types from being used. _(restriction)_
- [`typescript/no-unnecessary-boolean-literal-compare`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-unnecessary-boolean-literal-compare.html) — This rule disallows unnecessary equality comparisons with boolean literals. _(suspicious; type-aware)_
- [`typescript/no-unnecessary-condition`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-unnecessary-condition.html) — Disallow conditions that are always truthy, always falsy, or always nullish based on TypeScript's type information. _(nursery; type-aware; **deferred by policy**)_
- [`typescript/no-unnecessary-qualifier`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-unnecessary-qualifier.html) — Disallow namespace qualifiers when the referenced name is already in scope. _(style; type-aware)_
- [`typescript/no-unnecessary-template-expression`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-unnecessary-template-expression.html) — Disallows unnecessary template expressions (interpolations) that can be simplified. _(suspicious; type-aware)_
- [`typescript/no-unnecessary-type-arguments`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-unnecessary-type-arguments.html) — This rule disallows type arguments that are identical to the default type parameter. _(suspicious; type-aware)_
- [`typescript/no-unnecessary-type-assertion`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-unnecessary-type-assertion.html) — This rule disallows type assertions that do not change the type of an expression. _(suspicious; type-aware)_
- [`typescript/no-unnecessary-type-constraint`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-unnecessary-type-constraint.html) — Disallow unnecessary constraints on generic types. _(suspicious)_
- [`typescript/no-unnecessary-type-conversion`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-unnecessary-type-conversion.html) — Disallow unnecessary type conversion expressions. _(suspicious; type-aware)_
- [`typescript/no-unsafe-type-assertion`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-unsafe-type-assertion.html) — Disallows unsafe type assertions that narrow a type. _(suspicious; type-aware)_
- [`typescript/no-var-requires`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-var-requires.html) — Disallow `require` statements except in import statements. _(restriction)_
- [`typescript/non-nullable-type-assertion-style`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/non-nullable-type-assertion-style.html) — This rule prefers a non-null assertion over an explicit type cast for non-nullable types. _(restriction; type-aware)_
- [`typescript/parameter-properties`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/parameter-properties.html) — Requires or disallows parameter properties in class constructors. _(style)_
- [`typescript/prefer-enum-initializers`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/prefer-enum-initializers.html) — Require each enum member value to be explicitly initialized. _(pedantic)_
- [`typescript/prefer-find`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/prefer-find.html) — Prefer `.find(...)` over `.filter(...)[0]` for retrieving a single element. _(style; type-aware)_
- [`typescript/prefer-for-of`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/prefer-for-of.html) — Enforces the use of a `for...of` loop instead of a `for` loop with simple iteration. _(style)_
- [`typescript/prefer-function-type`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/prefer-function-type.html) — Enforce using function types instead of interfaces with call signatures. _(style)_
- [`typescript/prefer-includes`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/prefer-includes.html) — Enforce using `.includes()` instead of `.indexOf() !== -1` or `/regex/.test()`. _(pedantic; type-aware)_
- [`typescript/prefer-literal-enum-member`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/prefer-literal-enum-member.html) — Explicit enum values must only be literal values (string, number, boolean, etc.). _(restriction)_
- [`typescript/prefer-nullish-coalescing`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/prefer-nullish-coalescing.html) — Enforce using the nullish coalescing operator (`??`) instead of logical OR (`||`) or conditional expressions when the left operand might be `null` or `undefined`. _(pedantic; type-aware; **deferred by policy**)_
- [`typescript/prefer-optional-chain`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/prefer-optional-chain.html) — Enforce using concise optional chain (`?.`) expressions. _(nursery; type-aware)_
- [`typescript/prefer-readonly`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/prefer-readonly.html) — Require class members that are never reassigned to be marked `readonly`. _(style; type-aware)_
- [`typescript/prefer-readonly-parameter-types`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/prefer-readonly-parameter-types.html) — Require function and method parameters to use readonly-compatible types. _(pedantic; type-aware)_
- [`typescript/prefer-reduce-type-parameter`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/prefer-reduce-type-parameter.html) — This rule prefers using a type parameter for the accumulator in `Array#reduce()` instead of casting. _(style; type-aware)_
- [`typescript/prefer-regexp-exec`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/prefer-regexp-exec.html) — Prefer `RegExp#exec()` over `String#match()` when extracting a regex match. _(style; type-aware)_
- [`typescript/prefer-return-this-type`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/prefer-return-this-type.html) — This rule enforces using `this` types for return types when possible. _(style; type-aware)_
- [`typescript/prefer-string-starts-ends-with`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/prefer-string-starts-ends-with.html) — Prefer `startsWith` and `endsWith` over manual string boundary checks. _(style; type-aware)_
- [`typescript/prefer-ts-expect-error`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/prefer-ts-expect-error.html) — Enforce using @ts-expect-error over @ts-ignore. _(pedantic)_
- [`typescript/promise-function-async`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/promise-function-async.html) — This rule requires any function or method that returns a Promise to be marked as async. _(restriction; type-aware)_
- [`typescript/related-getter-setter-pairs`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/related-getter-setter-pairs.html) — This rule enforces that getters and setters for the same property are defined together and have related types. _(pedantic; type-aware)_
- [`typescript/require-await`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/require-await.html) — This rule disallows async functions which do not have an await expression. _(pedantic; type-aware)_
- [`typescript/restrict-plus-operands`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/restrict-plus-operands.html) — This rule requires both operands of addition to be the same type and be number, string, or any. _(pedantic; type-aware)_
- [`typescript/strict-boolean-expressions`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/strict-boolean-expressions.html) — Disallow certain types in boolean expressions. _(pedantic; type-aware; **deferred by policy**)_
- [`typescript/strict-void-return`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/strict-void-return.html) — Disallow returning non-void values where a `void` return is expected. _(pedantic; type-aware)_
- [`typescript/unified-signatures`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/unified-signatures.html) — Disallow overload signatures that can be unified into one. _(style)_

## `unicorn`

- [`unicorn/catch-error-name`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/catch-error-name.html) — This rule enforces consistent and descriptive naming for error variables in `catch` statements, preventing the use of vague names like `badName` or `_` when the error is used. _(style)_
- [`unicorn/consistent-assert`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/consistent-assert.html) — Enforces consistent usage of the `assert` module. _(pedantic)_
- [`unicorn/consistent-date-clone`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/consistent-date-clone.html) — Enforce consistent cloning of `Date` objects without unnecessary `.getTime()` calls. _(style)_
- [`unicorn/consistent-empty-array-spread`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/consistent-empty-array-spread.html) — When spreading a ternary in an array, we can use both `[]` and `''` as fallbacks, but it's better to have consistent types in both branches. _(pedantic)_
- [`unicorn/consistent-existence-index-check`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/consistent-existence-index-check.html) — Enforce consistent style for element existence checks with `indexOf()`, `lastIndexOf()`, `findIndex()`, and `findLastIndex()`. _(style)_
- [`unicorn/consistent-function-scoping`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/consistent-function-scoping.html) — Disallow functions that are declared in a scope which does not capture any variables from the outer scope. _(suspicious)_
- [`unicorn/consistent-template-literal-escape`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/consistent-template-literal-escape.html) — Enforce consistent style for escaping `${` in template literals. _(style)_
- [`unicorn/custom-error-definition`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/custom-error-definition.html) — Enforce correct `Error` subclassing. _(style)_
- [`unicorn/empty-brace-spaces`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/empty-brace-spaces.html) — Enforce no spaces between braces. _(style)_
- [`unicorn/error-message`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/error-message.html) — Enforces providing a `message` when creating built-in `Error` objects to improve readability and debugging. _(style)_
- [`unicorn/escape-case`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/escape-case.html) — Enforce uppercase characters for the value of the escape sequence. _(pedantic)_
- [`unicorn/explicit-length-check`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/explicit-length-check.html) — Enforce explicitly comparing the `length` or `size` property of a value. _(pedantic)_
- [`unicorn/explicit-timer-delay`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/explicit-timer-delay.html) — Enforce or disallow explicit `delay` argument for `setTimeout()` and `setInterval()`. _(style)_
- [`unicorn/filename-case`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/filename-case.html) — Enforce a consistent case style for filenames. _(style)_
- [`unicorn/import-style`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/import-style.html) — Enforce specific import styles per module. _(restriction)_
- [`unicorn/max-nested-calls`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/max-nested-calls.html) — Limit the depth of nested calls. _(style)_
- [`unicorn/new-for-builtins`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/new-for-builtins.html) — Enforce the use of `new` for most builtins. _(pedantic)_
- [`unicorn/no-abusive-eslint-disable`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/no-abusive-eslint-disable.html) — Disallows `oxlint-disable` or `eslint-disable` comments without specifying rules. _(restriction)_
- [`unicorn/no-anonymous-default-export`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/no-anonymous-default-export.html) — Disallows anonymous functions and classes as default exports. _(restriction)_
- [`unicorn/no-array-callback-reference`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/no-array-callback-reference.html) — Prevents passing a function reference directly to iterator methods. _(pedantic)_
- [`unicorn/no-array-for-each`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/no-array-for-each.html) — Forbids the use of `Array#forEach` in favor of a for loop. _(restriction)_
- [`unicorn/no-array-method-this-argument`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/no-array-method-this-argument.html) — Disallows the use of the `thisArg` parameter in array iteration methods such as `map`, `filter`, `some`, `every`, and similar methods. _(style)_
- [`unicorn/no-array-reduce`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/no-array-reduce.html) — Disallow `Array#reduce()` and `Array#reduceRight()`. _(restriction)_
- [`unicorn/no-array-reverse`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/no-array-reverse.html) — Prefer using `Array#toReversed()` over `Array#reverse()`. _(suspicious)_
- [`unicorn/no-array-sort`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/no-array-sort.html) — Prefer using `Array#toSorted()` over `Array#sort()`. _(suspicious)_
- [`unicorn/no-await-expression-member`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/no-await-expression-member.html) — Disallows member access from `await` expressions. _(style)_
- [`unicorn/no-confusing-array-with`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/no-confusing-array-with.html) — Disallow confusing uses of `Array#with()`. _(suspicious)_
- [`unicorn/no-console-spaces`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/no-console-spaces.html) — Disallows leading/trailing space inside `console.log()` and similar methods. _(style)_
- [`unicorn/no-document-cookie`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/no-document-cookie.html) — Disallows direct use of `document.cookie`. _(restriction)_
- [`unicorn/no-hex-escape`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/no-hex-escape.html) — Enforces a convention of using Unicode escapes instead of hexadecimal escapes for consistency and clarity. _(pedantic)_
- [`unicorn/no-immediate-mutation`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/no-immediate-mutation.html) — Disallows mutating a variable immediately after initialization. _(pedantic)_
- [`unicorn/no-instanceof-array`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/no-instanceof-array.html) — Require `Array.isArray()` instead of `instanceof Array`. _(pedantic)_
- [`unicorn/no-instanceof-builtins`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/no-instanceof-builtins.html) — Disallow `instanceof` with built-in objects. _(suspicious)_
- [`unicorn/no-length-as-slice-end`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/no-length-as-slice-end.html) — Disallow using `length` as the end argument of a `slice` call. _(restriction)_
- [`unicorn/no-lonely-if`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/no-lonely-if.html) — Disallow `if` statements as the only statement in `if` blocks without `else`. _(pedantic)_
- [`unicorn/no-magic-array-flat-depth`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/no-magic-array-flat-depth.html) — Disallow magic numbers for `Array.prototype.flat` depth. _(restriction)_
- [`unicorn/no-negated-condition`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/no-negated-condition.html) — Disallow negated conditions. _(pedantic)_
- [`unicorn/no-negation-in-equality-check`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/no-negation-in-equality-check.html) — Disallow negated expressions on the left of (in)equality checks. _(pedantic)_
- [`unicorn/no-nested-ternary`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/no-nested-ternary.html) — Disallow nested ternary expressions. _(style)_
- [`unicorn/no-null`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/no-null.html) — Disallow the use of the `null` literal, to encourage using `undefined` instead. _(style)_
- [`unicorn/no-object-as-default-parameter`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/no-object-as-default-parameter.html) — Disallow the use of an object literal as a default value for a parameter. _(pedantic)_
- [`unicorn/no-process-exit`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/no-process-exit.html) — Disallow all usage of `process.exit()`. _(restriction)_
- [`unicorn/no-static-only-class`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/no-static-only-class.html) — Disallow `class` declarations that exclusively contain `static` members. _(pedantic)_
- [`unicorn/no-this-assignment`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/no-this-assignment.html) — Disallow assigning `this` to a variable. _(pedantic)_
- [`unicorn/no-typeof-undefined`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/no-typeof-undefined.html) — Disallow `typeof` comparisons with `undefined`. _(pedantic)_
- [`unicorn/no-unnecessary-array-flat-depth`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/no-unnecessary-array-flat-depth.html) — Disallows passing `1` to `Array.prototype.flat`. _(pedantic)_
- [`unicorn/no-unnecessary-array-splice-count`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/no-unnecessary-array-splice-count.html) — Disallows passing `.length` or `Infinity` as the `deleteCount` or `skipCount` argument of `Array#splice()` or `Array#toSpliced()`. _(pedantic)_
- [`unicorn/no-unnecessary-slice-end`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/no-unnecessary-slice-end.html) — Disallows unnecessarily passing a second argument to `slice(...)`, for cases where it would not change the result. _(pedantic)_
- [`unicorn/no-unreadable-array-destructuring`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/no-unreadable-array-destructuring.html) — Disallows destructuring values from an array in ways that are difficult to read. _(style)_
- [`unicorn/no-unreadable-iife`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/no-unreadable-iife.html) — This rule disallows IIFEs with a parenthesized arrow function body. _(pedantic)_
- [`unicorn/no-useless-collection-argument`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/no-useless-collection-argument.html) — Disallow useless values or fallbacks in `Set`, `Map`, `WeakSet`, or `WeakMap`. _(style)_
- [`unicorn/no-useless-error-capture-stack-trace`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/no-useless-error-capture-stack-trace.html) — Disallows unnecessary `Error.captureStackTrace(…)` in error constructors. _(restriction)_
- [`unicorn/no-useless-iterator-to-array`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/no-useless-iterator-to-array.html) — Disallow unnecessary `.toArray()` on iterators. _(nursery)_
- [`unicorn/no-useless-promise-resolve-reject`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/no-useless-promise-resolve-reject.html) — Disallows returning values wrapped in `Promise.resolve` or `Promise.reject` in an async function or a `Promise#then`/`catch`/`finally` callback. _(pedantic)_
- [`unicorn/no-useless-switch-case`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/no-useless-switch-case.html) — Disallows useless `default` cases in `switch` statements. _(pedantic)_
- [`unicorn/no-useless-undefined`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/no-useless-undefined.html) — Disallow useless `undefined`. _(pedantic)_
- [`unicorn/no-zero-fractions`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/no-zero-fractions.html) — Prevents the use of zero fractions. _(style)_
- [`unicorn/number-literal-case`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/number-literal-case.html) — This rule enforces proper case for numeric literals. _(style)_
- [`unicorn/numeric-separators-style`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/numeric-separators-style.html) — Enforces a convention of grouping digits using numeric separators. _(style)_
- [`unicorn/prefer-add-event-listener`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-add-event-listener.html) — Prefer `.addEventListener()` and `.removeEventListener()` over `on`-functions. _(suspicious)_
- [`unicorn/prefer-array-find`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-array-find.html) — Encourages using `Array.prototype.find` and `Array.prototype.findLast` instead of taking the first or last matching element from `filter(...)`. _(perf)_
- [`unicorn/prefer-array-flat`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-array-flat.html) — Prefers `Array#flat()` over legacy techniques to flatten arrays. _(pedantic)_
- [`unicorn/prefer-array-flat-map`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-array-flat-map.html) — Prefers the use of `.flatMap()` when `map()` and `flat()` are used together. _(perf)_
- [`unicorn/prefer-array-index-of`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-array-index-of.html) — Enforces using `indexOf` or `lastIndexOf` instead of `findIndex` or `findLastIndex` when the callback is a simple strict equality comparison. _(style)_
- [`unicorn/prefer-array-some`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-array-some.html) — Prefer using `Array#some()` over various alternatives. _(pedantic)_
- [`unicorn/prefer-at`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-at.html) — Prefer the `Array#at()` and `String#at()` methods for index access. _(pedantic)_
- [`unicorn/prefer-bigint-literals`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-bigint-literals.html) — Requires using BigInt literals (e.g. `123n`) instead of calling the `BigInt()` constructor with literal arguments such as numbers or numeric strings. _(style)_
- [`unicorn/prefer-blob-reading-methods`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-blob-reading-methods.html) — Recommends using `Blob#text()` and `Blob#arrayBuffer()` over `FileReader#readAsText()` and `FileReader#readAsArrayBuffer()`. _(pedantic)_
- [`unicorn/prefer-class-fields`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-class-fields.html) — Prefers class field declarations over `this` assignments in constructors for static values. _(style)_
- [`unicorn/prefer-classlist-toggle`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-classlist-toggle.html) — Prefers the use of `element.classList.toggle(className, condition)` over conditional add/remove patterns. _(style)_
- [`unicorn/prefer-code-point`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-code-point.html) — Prefer `String#codePointAt` over `String#charCodeAt` and `String.fromCodePoint` over `String.fromCharCode`. _(pedantic)_
- [`unicorn/prefer-date-now`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-date-now.html) — Prefers use of `Date.now()` over `new Date().getTime()` or `new Date().valueOf()`. _(pedantic)_
- [`unicorn/prefer-default-parameters`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-default-parameters.html) — Prefer default parameters over reassignment. _(style)_
- [`unicorn/prefer-dom-node-append`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-dom-node-append.html) — Enforces the use of, for example, `document.body.append(div);` over `document.body.appendChild(div);` for DOM nodes. _(pedantic)_
- [`unicorn/prefer-dom-node-dataset`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-dom-node-dataset.html) — Use `.dataset` on DOM elements over `getAttribute(…)`, `.setAttribute(…)`, `.removeAttribute(…)` and `.hasAttribute(…)`. _(pedantic)_
- [`unicorn/prefer-dom-node-remove`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-dom-node-remove.html) — Prefers the use of `child.remove()` over `parentNode.removeChild(child)`. _(pedantic)_
- [`unicorn/prefer-dom-node-text-content`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-dom-node-text-content.html) — Enforces the use of `.textContent` over `.innerText` for DOM nodes. _(style)_
- [`unicorn/prefer-event-target`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-event-target.html) — Prefer `EventTarget` over `EventEmitter`. _(pedantic)_
- [`unicorn/prefer-export-from`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-export-from.html) — Prefer direct re-exports using `export ... from` syntax instead of separate import and export statements. _(style)_
- [`unicorn/prefer-global-this`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-global-this.html) — Prefer `globalThis` over environment-specific global aliases like `window`, `self`, and `global`. _(style)_
- [`unicorn/prefer-import-meta-properties`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-import-meta-properties.html) — Prefer `import.meta.{dirname,filename}` over legacy techniques for getting file paths. _(pedantic)_
- [`unicorn/prefer-includes`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-includes.html) — Prefer `includes()` over `indexOf()` when checking for existence/non-existence. _(style)_
- [`unicorn/prefer-keyboard-event-key`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-keyboard-event-key.html) — Prefer `KeyboardEvent#key` over `KeyboardEvent#keyCode`. _(style)_
- [`unicorn/prefer-logical-operator-over-ternary`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-logical-operator-over-ternary.html) — This rule finds ternary expressions that can be simplified to a logical operator. _(style)_
- [`unicorn/prefer-math-min-max`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-math-min-max.html) — Prefers use of `Math.min()` and `Math.max()` instead of ternary expressions when performing simple comparisons. _(pedantic)_
- [`unicorn/prefer-math-trunc`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-math-trunc.html) — Enforce the use of `Math.trunc` instead of bitwise operators. _(pedantic)_
- [`unicorn/prefer-modern-dom-apis`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-modern-dom-apis.html) — Prefer modern DOM APIs like `replaceWith` and `before` over older methods like `replaceChild` and `insertBefore`. _(style)_
- [`unicorn/prefer-modern-math-apis`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-modern-math-apis.html) — Checks for usage of legacy patterns for mathematical operations. _(restriction)_
- [`unicorn/prefer-module`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-module.html) — Prefer JavaScript modules (ESM) over CommonJS. _(restriction)_
- [`unicorn/prefer-native-coercion-functions`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-native-coercion-functions.html) — Prefers built-in functions over custom ones with the same functionality. _(pedantic)_
- [`unicorn/prefer-negative-index`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-negative-index.html) — Prefer using a negative index over `.length - index` when possible. _(style)_
- [`unicorn/prefer-number-coercion`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-number-coercion.html) — Prefer `Number()` over `parseFloat()` and base-10 `parseInt()`. _(pedantic)_
- [`unicorn/prefer-number-properties`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-number-properties.html) — Disallows use of `parseInt()`, `parseFloat()`, `isNaN()`, `isFinite()`, `NaN`, `Infinity` and `-Infinity` as global variables. _(restriction)_
- [`unicorn/prefer-object-from-entries`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-object-from-entries.html) — Encourages using `Object.fromEntries` when converting an array of key-value pairs into an object. _(style)_
- [`unicorn/prefer-optional-catch-binding`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-optional-catch-binding.html) — Prefers omitting the catch binding parameter if it is unused. _(style)_
- [`unicorn/prefer-prototype-methods`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-prototype-methods.html) — This rule prefers borrowing methods from the prototype instead of the instance. _(pedantic)_
- [`unicorn/prefer-query-selector`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-query-selector.html) — Prefer `.querySelector()` over `.getElementById()`, and `.querySelectorAll()` over `.getElementsByClassName()` and `.getElementsByTagName()`. _(pedantic)_
- [`unicorn/prefer-reflect-apply`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-reflect-apply.html) — Disallows the use of `Function.prototype.apply()` and suggests using `Reflect.apply()` instead. _(style)_
- [`unicorn/prefer-regexp-test`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-regexp-test.html) — Prefers `RegExp#test()` over `String#match()` and `String#exec()`. _(pedantic)_
- [`unicorn/prefer-response-static-json`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-response-static-json.html) — Enforces the use of `Response.json()` over `new Response(JSON.stringify())`. _(style)_
- [`unicorn/prefer-set-has`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-set-has.html) — Prefer `Set#has()` over `Array#includes()` when checking for existence or non-existence. _(perf)_
- [`unicorn/prefer-single-call`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-single-call.html) — Enforce combining multiple `Array#push()`, `Element#classList.{add,remove}()`, and `importScripts()` into one call. _(pedantic)_
- [`unicorn/prefer-spread`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-spread.html) — Enforces the use of the spread operator (`...`) over outdated patterns. _(style)_
- [`unicorn/prefer-string-raw`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-string-raw.html) — Prefers use of `String.raw` to avoid escaping `\`. _(style)_
- [`unicorn/prefer-string-replace-all`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-string-replace-all.html) — Prefers `String#replaceAll()` over `String#replace()` when using a regex with the global flag. _(pedantic)_
- [`unicorn/prefer-string-slice`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-string-slice.html) — Prefer `String#slice()` over `String#substr()` and `String#substring()`. _(pedantic)_
- [`unicorn/prefer-string-trim-start-end`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-string-trim-start-end.html) — Prefer `trimStart` / `trimEnd` over `trimLeft` / `trimRight` on String. _(style)_
- [`unicorn/prefer-structured-clone`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-structured-clone.html) — Prefer using `structuredClone` to create a deep clone. _(style)_
- [`unicorn/prefer-ternary`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-ternary.html) — Prefers ternary expressions over simple `if`/`else` statements. _(style)_
- [`unicorn/prefer-top-level-await`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-top-level-await.html) — Prefer top-level await over top-level promises and async function calls. _(pedantic)_
- [`unicorn/prefer-type-error`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/prefer-type-error.html) — Enforce throwing a `TypeError` instead of a generic `Error` after a type-checking if statement. _(pedantic)_
- [`unicorn/relative-url-style`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/relative-url-style.html) — Enforce consistent relative URL style. _(style)_
- [`unicorn/require-array-join-separator`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/require-array-join-separator.html) — Enforce using the separator argument with `Array#join()`. _(style)_
- [`unicorn/require-module-attributes`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/require-module-attributes.html) — This rule enforces a non-empty attribute list in `import`/`export` statements and `import()` expressions. _(style)_
- [`unicorn/require-module-specifiers`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/require-module-specifiers.html) — Enforce a non-empty specifier list in `import` and `export` statements. _(suspicious)_
- [`unicorn/require-number-to-fixed-digits-argument`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/require-number-to-fixed-digits-argument.html) — Enforce using the digits argument with `Number#toFixed()`. _(pedantic)_
- [`unicorn/require-post-message-target-origin`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/require-post-message-target-origin.html) — Enforce using the `targetOrigin` argument with `window.postMessage()`. _(suspicious)_
- [`unicorn/switch-case-braces`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/switch-case-braces.html) — Enforce consistent use of braces in switch case clauses. _(style)_
- [`unicorn/switch-case-break-position`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/switch-case-break-position.html) — Enforce consistent `break`/`return`/`continue`/`throw` position in `case` clauses. _(style)_
- [`unicorn/text-encoding-identifier-case`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/text-encoding-identifier-case.html) — Enforce consistent case for text encoding identifiers. _(style)_
- [`unicorn/throw-new-error`](https://oxc.rs/docs/guide/usage/linter/rules/unicorn/throw-new-error.html) — This rule makes sure you always use `new` when throwing an error. _(style)_

## `oxc`

- [`oxc/approx-constant`](https://oxc.rs/docs/guide/usage/linter/rules/oxc/approx-constant.html) — Disallows the use of approximate constants, instead preferring the use of the constants in the `Math` object. _(suspicious)_
- [`oxc/bad-bitwise-operator`](https://oxc.rs/docs/guide/usage/linter/rules/oxc/bad-bitwise-operator.html) — This rule applies when bitwise operators are used where logical operators are expected. _(restriction)_
- [`oxc/branches-sharing-code`](https://oxc.rs/docs/guide/usage/linter/rules/oxc/branches-sharing-code.html) — Checks if the `if` and `else` blocks contain shared code that can be moved out of the blocks. _(pedantic)_
- [`oxc/no-async-await`](https://oxc.rs/docs/guide/usage/linter/rules/oxc/no-async-await.html) — Disallows the use of `async`/`await`. _(restriction)_
- [`oxc/no-async-endpoint-handlers`](https://oxc.rs/docs/guide/usage/linter/rules/oxc/no-async-endpoint-handlers.html) — Disallows the use of `async` functions as Express endpoint handlers. _(suspicious)_
- [`oxc/no-barrel-file`](https://oxc.rs/docs/guide/usage/linter/rules/oxc/no-barrel-file.html) — Disallow barrel files containing `export *` statements when the total number of modules exceeds a threshold. _(restriction)_
- [`oxc/no-const-enum`](https://oxc.rs/docs/guide/usage/linter/rules/oxc/no-const-enum.html) — Disallow TypeScript `const enum`. _(restriction)_
- [`oxc/no-map-spread`](https://oxc.rs/docs/guide/usage/linter/rules/oxc/no-map-spread.html) — Disallow object or array spreads in `Array.prototype.map` and `Array.prototype.flatMap` to add properties or elements to array items. _(perf)_
- [`oxc/no-optional-chaining`](https://oxc.rs/docs/guide/usage/linter/rules/oxc/no-optional-chaining.html) — Disallow optional chaining. _(restriction)_
- [`oxc/no-rest-spread-properties`](https://oxc.rs/docs/guide/usage/linter/rules/oxc/no-rest-spread-properties.html) — Disallow Object Rest/Spread Properties. _(restriction)_
- [`oxc/no-this-in-exported-function`](https://oxc.rs/docs/guide/usage/linter/rules/oxc/no-this-in-exported-function.html) — Disallows the use of `this` in exported functions. _(suspicious)_

## `promise`

- [`promise/always-return`](https://oxc.rs/docs/guide/usage/linter/rules/promise/always-return.html) — Require returning inside each `then()` to create readable and reusable Promise chains. _(suspicious)_
- [`promise/avoid-new`](https://oxc.rs/docs/guide/usage/linter/rules/promise/avoid-new.html) — Disallow creating promises with `new Promise()`. _(style)_
- [`promise/catch-or-return`](https://oxc.rs/docs/guide/usage/linter/rules/promise/catch-or-return.html) — Ensure that each `then()` applied to a promise also has a `catch()`. _(restriction)_
- [`promise/no-nesting`](https://oxc.rs/docs/guide/usage/linter/rules/promise/no-nesting.html) — Disallow nested `then()` or `catch()` statements. _(style)_
- [`promise/no-promise-in-callback`](https://oxc.rs/docs/guide/usage/linter/rules/promise/no-promise-in-callback.html) — Disallows the use of Promises within error-first callback functions. _(suspicious)_
- [`promise/no-return-in-finally`](https://oxc.rs/docs/guide/usage/linter/rules/promise/no-return-in-finally.html) — Disallow return statements in a `finally()` callback of a promise. _(nursery)_
- [`promise/no-return-wrap`](https://oxc.rs/docs/guide/usage/linter/rules/promise/no-return-wrap.html) — Prevents unnecessary wrapping of return values in promises with `Promise.resolve` or `Promise.reject`. _(style)_
- [`promise/param-names`](https://oxc.rs/docs/guide/usage/linter/rules/promise/param-names.html) — Enforce standard parameter names for Promise constructors. _(style)_
- [`promise/prefer-await-to-callbacks`](https://oxc.rs/docs/guide/usage/linter/rules/promise/prefer-await-to-callbacks.html) — Prefer `async`/`await` over callback functions for handling asynchronous code. _(style)_
- [`promise/prefer-await-to-then`](https://oxc.rs/docs/guide/usage/linter/rules/promise/prefer-await-to-then.html) — Prefer `await` to `then()`/`catch()`/`finally()` for reading Promise values. _(style)_
- [`promise/prefer-catch`](https://oxc.rs/docs/guide/usage/linter/rules/promise/prefer-catch.html) — Prefer `catch` to `then(a, b)` and `then(null, b)`. _(style)_
- [`promise/spec-only`](https://oxc.rs/docs/guide/usage/linter/rules/promise/spec-only.html) — Disallow use of non-standard Promise static methods. _(restriction)_
