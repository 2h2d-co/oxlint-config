# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Add the shared `2h2d` Oxlint plugin with nine adopted custom rules.
- Add a strict preset with the custom rules and a blanket ban on non-const type assertions.
- Add rule, preset, package-export, and Oxlint package-consumer tests.
- Add anti-slop attribution and license notices for adapted rule implementations.

### Changed

- Update the supported Oxlint and `@oxlint/plugins` version to 1.78.0.

### Fixed

- Reject primitive JSON values where release validation requires package metadata objects.
