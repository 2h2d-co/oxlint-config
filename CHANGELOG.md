# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [0.1.0-alpha.12] - 2026-08-24

### Fixed

- Report parameterless named rejection handlers at each `.catch` or `.then` argument so explained
  suppressions remain attached to the Promise operation rather than the callback declaration.

## [0.1.0-alpha.11] - 2026-08-24

### Added

- Export a complete strict configuration that consumers inherit to enable the native correctness
  category, plugins, shared rules, built-in globals, type-aware checking, and unused suppression
  reporting.
- Require Promise-style `.catch` and `.then` rejection callbacks to declare their rejection reason.

### Removed

- Disable syntax-only double-comparison simplification because its rewrites are not equivalent for
  `NaN`, coercive comparisons, or object identity.
- Disable erasing-operation simplification because zero arithmetic can preserve `NaN`, negative
  zero, infinity, and operand side effects.
- Disable obsolete number-formatting argument limits that reject precision values permitted by
  modern ECMAScript.
- Disable uninvoked-array callback detection because it mistakes function values passed to methods
  such as `fill` for callbacks.
- Disable useless-spread enforcement because spread can intentionally snapshot iterables, normalize
  sparse arrays, or change iterator consumption timing.
- Disable inherited native rules that reject meaningful empty files, sparse-array construction,
  single-value Promise aggregation, deliberate thenables, or anchored regular-expression
  semantics.

## [0.1.0-alpha.10] - 2026-08-23

### Added

- Add native enforcement for array callback returns, non-coercive equality, dynamic function
  compilation, empty object and unsafe function types, type-only import side effects, invalid
  `void` positions, unnecessary type parameters, unsafe enum comparisons, Promise rejection
  reasons, and async return semantics.
- Add adversarial package integration coverage for native-rule boundaries and native/custom
  dictionary diagnostic ownership.

### Changed

- Rename custom rules whose identifiers overclaimed their enforcement:
  `no-object-parameters` to `no-broad-object-parameters`, `no-unsafe-dictionary-type` to
  `no-broad-dictionary-values`, and `no-unreviewed-suppression-directives` to
  `require-narrow-suppression-directives`.
- Resolve generic local aliases and defaults in broad object parameter contracts.
- Recognize Vitest's `vitest` alias in module-mocking enforcement.
- Require lint suppression explanations to contain at least ten characters.
- Replace custom method-signature enforcement with native
  `typescript/method-signature-style`.
- Require every catch to bind its failure through native `preserve-caught-error`.
- Limit the floating-Promise exemption to declarations imported from `node:test`.
- Allow explained `@ts-expect-error` directives through native `typescript/ban-ts-comment` while
  continuing to prohibit `@ts-ignore` and `@ts-nocheck`.
- Resolve dictionary aliases in their lexical scopes, respect type-parameter shadowing, and classify
  unions and intersections according to their effective broad value contract.
- Let native `typescript/no-empty-object-type` own direct `{}` diagnostics while retaining custom
  dictionary enforcement for `object` and derived semantically empty contracts.
- Clarify that TypeBox builders are preferred, schema-derived native JSON Schema is the fallback,
  and explained `Unsafe` use is the last resort.

### Removed

- Remove custom conditional object-spread enforcement because the rejected construction is valid,
  concise, and often preserves useful inference.
- Remove `2h2d/no-unknown-returns` and the advisory package surface because `unknown` is safe,
  truthful boundary contracts were its only known finding, and syntax cannot prove a narrower
  domain.
- Remove custom silent-error and parameterless-catch analysis in favor of native error rules and
  human review of logging policy.
- Remove the unused analysis left by `2h2d/no-known-value-widening`.

### Fixed

- Install the current prerelease and required type-aware lint engine through the README command.
- Restore versioned release history instead of describing every published version as unreleased.

## [0.1.0-alpha.9] - 2026-08-22

### Changed

- Move `2h2d/no-unknown-returns` from strict enforcement to the advisory preset.

## [0.1.0-alpha.8] - 2026-08-19

### Added

- Add `2h2d/no-typebox-unsafe` to require static types to be derived from runtime schemas.

## [0.1.0-alpha.7] - 2026-08-19

### Added

- Add custom enforcement for contravariantly checked function-property signatures.

## [0.1.0-alpha.6] - 2026-08-19

### Changed

- Restore silent-error analysis as an advisory review signal.

## [0.1.0-alpha.5] - 2026-08-19

### Removed

- Remove silent-error analysis from the plugin.

## [0.1.0-alpha.4] - 2026-08-19

### Changed

- Replace known-value widening guesses with conditional object-spread enforcement.
- Refine silent-error path, classifier, diagnostic, and returned-failure analysis.

### Fixed

- Recognize explicit cause-derived failure-state capture.

## [0.1.0-alpha.3] - 2026-08-19

### Added

- Add targeted parameterless-catch enforcement.

### Changed

- Require actual Promise rejection handling instead of accepting `void`.
- Permit `unknown` dictionary values while rejecting broad object value contracts.
- Narrow widening and silent-error analysis.

### Removed

- Remove runtime `typeof`, shape naming, and `unknown` alias restrictions after review found no
  objective safety benefit.

## [0.1.0-alpha.2] - 2026-08-18

### Added

- Add reviewed suppression directives and silent-error custom rules.
- Add native rules for unsafe type propagation, Promise handling, assertions, exhaustive switches,
  and error handling.
- Add strict-rule policy and package-consumer integration coverage.

## [0.1.0-alpha.1] - 2026-08-18

### Changed

- Update the supported Oxlint and `@oxlint/plugins` version to 1.78.0.

### Fixed

- Reject primitive JSON values where release validation requires package metadata objects.

## [0.1.0-alpha.0] - 2026-08-18

### Added

- Add the shared `2h2d` Oxlint plugin, strict preset, release workflow, rule tests, and package
  integration tests.
- Add anti-slop attribution and license notices for adapted implementations.

[Unreleased]: https://github.com/2h2d-co/oxlint-config/compare/v0.1.0-alpha.12...HEAD
[0.1.0-alpha.12]: https://github.com/2h2d-co/oxlint-config/compare/v0.1.0-alpha.11...v0.1.0-alpha.12
[0.1.0-alpha.11]: https://github.com/2h2d-co/oxlint-config/compare/v0.1.0-alpha.10...v0.1.0-alpha.11
[0.1.0-alpha.10]: https://github.com/2h2d-co/oxlint-config/compare/v0.1.0-alpha.9...v0.1.0-alpha.10
[0.1.0-alpha.9]: https://github.com/2h2d-co/oxlint-config/compare/v0.1.0-alpha.8...v0.1.0-alpha.9
[0.1.0-alpha.8]: https://github.com/2h2d-co/oxlint-config/compare/v0.1.0-alpha.7...v0.1.0-alpha.8
[0.1.0-alpha.7]: https://github.com/2h2d-co/oxlint-config/compare/v0.1.0-alpha.6...v0.1.0-alpha.7
[0.1.0-alpha.6]: https://github.com/2h2d-co/oxlint-config/compare/v0.1.0-alpha.5...v0.1.0-alpha.6
[0.1.0-alpha.5]: https://github.com/2h2d-co/oxlint-config/compare/v0.1.0-alpha.4...v0.1.0-alpha.5
[0.1.0-alpha.4]: https://github.com/2h2d-co/oxlint-config/compare/v0.1.0-alpha.3...v0.1.0-alpha.4
[0.1.0-alpha.3]: https://github.com/2h2d-co/oxlint-config/compare/v0.1.0-alpha.2...v0.1.0-alpha.3
[0.1.0-alpha.2]: https://github.com/2h2d-co/oxlint-config/compare/v0.1.0-alpha.1...v0.1.0-alpha.2
[0.1.0-alpha.1]: https://github.com/2h2d-co/oxlint-config/compare/v0.1.0-alpha.0...v0.1.0-alpha.1
[0.1.0-alpha.0]: https://github.com/2h2d-co/oxlint-config/releases/tag/v0.1.0-alpha.0
