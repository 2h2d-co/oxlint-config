# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Add the shared `2h2d` Oxlint plugin with adopted custom rules.
- Add a strict preset covering unsafe type propagation, Promise handling, exhaustive switches,
  error propagation, and bans on `any`, non-null assertions, and non-const type assertions.
- Add rule, preset, package-export, and Oxlint package-consumer tests.
- Add anti-slop attribution and license notices for adapted rule implementations.
- Add `2h2d/no-unpreserved-caught-error` for replacement errors thrown from parameterless catches.
- Add `2h2d/no-bivariant-method-signatures` to require contravariantly checked function properties
  in object type declarations.
- Add `2h2d/no-typebox-unsafe` to require static types to be derived from their runtime schemas.

### Changed

- Update the supported Oxlint and `@oxlint/plugins` version to 1.78.0.
- Analyze silent-error handling across reachable paths, accept explicit diagnostics and credible
  expected-error classification, and reject cause mentions that do not handle a failure.
- Move silent-error suppression analysis out of the strict preset and into a separate advisory
  preset so its heuristic findings do not require suppressions or runtime contract changes.
- Restore conditional object-spread enforcement and cover ternary and logical operand forms without
  an unsafe autofixer.
- Remove syntax-only known-value widening enforcement after it encouraged indirect
  empty-object-plus-`Object.assign` rewrites.
- Permit `unknown` dictionary values while continuing to reject `any`, `object`, and `{}` values.
- Require actual Promise rejection handling instead of accepting the `void` operator.
- Limit caught-error parameters to handlers that construct replacement errors.
- Remove runtime `typeof`, `shape` naming, and `unknown` alias rules after the post-rollout review
  found no objective safety benefit.

### Fixed

- Reject primitive JSON values where release validation requires package metadata objects.
