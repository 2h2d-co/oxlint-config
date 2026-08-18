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

### Changed

- Update the supported Oxlint and `@oxlint/plugins` version to 1.78.0.
- Analyze silent-error handling across reachable paths and file-local named rejection callbacks.
- Limit known-value widening enforcement to populated objects assigned to open dictionaries.
- Permit `unknown` dictionary values while continuing to reject `any`, `object`, and `{}` values.
- Require actual Promise rejection handling instead of accepting the `void` operator.
- Limit caught-error parameters to handlers that construct replacement errors.
- Remove conditional empty-object spread, runtime `typeof`, `shape` naming, and `unknown` alias
  rules after the post-rollout review found no objective safety benefit.

### Fixed

- Reject primitive JSON values where release validation requires package metadata objects.
