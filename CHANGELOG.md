# Changelog

All notable changes to Specky Lint will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-04-24

### Added

- Initial release of Specky Lint with core functionality:
  - Command-line interface with comprehensive options
  - Configuration system for customizing linting rules
  - Detailed error reporting with codes and suggestions

#### File Validation

- **spec.json** validation:
  - JSON syntax validation
  - Required fields validation (`name`, `version`, `description`)
  - Version format validation (SemVer)
  - Optional fields validation (author, license, repository)
  - Dependencies validation

- **datamodel.json** validation:
  - JSON syntax validation
  - Structure validation
  - Entity validation
  - Attribute validation
  - Relationship validation

#### Reporting

- Comprehensive error reporting with:
  - Error codes (SL001-SL007)
  - Line and column information
  - Suggestions for fixing issues
  - Color-coded output

#### Documentation

- README with usage instructions
- Man page for command-line usage
- Contributing guidelines

### Changed

- N/A (Initial release)

### Deprecated

- N/A (Initial release)

### Removed

- N/A (Initial release)

### Fixed

- N/A (Initial release)

### Security

- N/A (Initial release)

[0.1.0]: https://github.com/specky-pm/lint/releases/tag/v0.1.0