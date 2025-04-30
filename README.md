# Specky Lint

[![Version](https://img.shields.io/npm/v/specky-lint.svg)](https://www.npmjs.com/package/specky-lint)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Build Status](https://img.shields.io/github/actions/workflow/status/specky-pm/lint/ci.yml?branch=main)](https://github.com/specky-pm/lint/actions)
[![Downloads](https://img.shields.io/npm/dm/specky-lint.svg)](https://www.npmjs.com/package/specky-lint)

A powerful TypeScript-based linter and validator for Specky component specifications.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage](#usage)
  - [Command Line Options](#command-line-options)
  - [Examples](#examples)
- [Configuration](#configuration)
  - [Configuration File](#configuration-file)
  - [Rule Severity](#rule-severity)
- [Error Code Reference](#error-code-reference)
- [Available Rules](#available-rules)
- [Development](#development)
  - [Setup](#setup)
  - [Project Structure](#project-structure)
- [Releasing](#releasing)
  - [Release Process](#release-process)
  - [Versioning](#versioning)
- [License](#license)

## Overview

Specky Lint validates that Specky component specifications adhere to the required format and structure, providing clear error and warning messages to help users correct issues. It ensures your component specifications are consistent, well-structured, and follow best practices.

Specky component specifications consist of:
- `spec.json` - Contains metadata about the component
- `component.md` - Describes the component in detail
- `datamodel.json` - Models entities that the component relies on
- `tests/*.feature` - Gherkin feature specifications for testing the component once implemented

## Features

| Feature | Description |
|---------|-------------|
| 📋 **Comprehensive Validation** | Validates all Specky specification files |
| 🔍 **Detailed Analysis** | Performs deep validation of structure and content |
| 🚨 **Clear Messaging** | Provides actionable error and warning messages |
| ⚙️ **Configurable Rules** | Customize validation rules to match your needs |
| 🔧 **Fix Suggestions** | Offers guidance on how to fix issues |

## Installation

### Global Installation

```bash
npm install -g specky-lint
```

This makes the `specky-lint` command available globally in your terminal.

### Local Installation

```bash
npm install --save-dev specky-lint
```

Then add to your package.json scripts:

```json
"scripts": {
  "lint:spec": "specky-lint"
}
```

## Quick Start

```bash
# Install globally
npm install -g specky-lint

# Lint the current directory
specky-lint

# Lint a specific component
specky-lint ./components/my-component

# Show only errors, not warnings
specky-lint --quiet
```

## Usage

```bash
specky-lint [options] [directory]
```

Where `[directory]` is the path to the directory containing your Specky files (defaults to current directory).

### Command Line Options

| Option | Description |
|--------|-------------|
| `--help` | Display help information |
| `--version` | Display version information |
| `--quiet` | Suppress warnings, only report errors |
| `--config <path>` | Specify a path to a custom configuration file |
| `--no-color` | Disable colored output |
| `--no-spec` | Disable validation of spec.json |
| `--no-datamodel` | Disable validation of datamodel.json |

### Examples

#### Basic Usage

```bash
# Lint the current directory
specky-lint

# Lint a specific directory
specky-lint ./components/my-component
```

#### Advanced Usage

```bash
# Use a custom configuration file
specky-lint --config ./config/.speckylintrc.json

# Show only errors, not warnings
specky-lint --quiet

# Disable colored output
specky-lint --no-color
```

## Configuration

Specky Lint can be configured using a `.speckylintrc.json` file in your project's root directory or specified via the `--config` option.

### Configuration File

Example `.speckylintrc.json`:

```json
{
  "rules": {
    "spec-json/invalid-version": "error",
    "datamodel-json/invalid-entity": "error"
  },
  "fileValidation": {
    "spec.json": true,
    "datamodel.json": true
  }
}
```

### Rule Severity

Rules can be configured with the following severity levels:

| Level | Value | Description |
|-------|-------|-------------|
| `"off"` or `0` | Disabled | Turn the rule off |
| `"warn"` or `1` | Warning | Treat violations as warnings |
| `"error"` or `2` | Error | Treat violations as errors |

## Available Rules

Specky Lint includes a comprehensive set of validation rules organized by category. Below is a selection of the most commonly used rules:

### Base Rules

| Rule ID | Description | Default Severity |
|---------|-------------|------------------|
| `base/missing-required-file` | A required file is missing | `error` |
| `base/missing-required-field` | A required field is missing | `error` |
| `base/file-read-error` | Failed to read file | `error` |

### Spec JSON Rules

#### Syntax and Structure

| Rule ID | Description | Default Severity |
|---------|-------------|------------------|
| `spec-json/invalid-json-syntax` | JSON format is invalid | `error` |
| `spec-json/invalid-version-format` | Version format is invalid | `error` |
| `spec-json/unrecognised-keys` | Spec.json contains unrecognized keys | `warning` |

#### Content Validation

| Rule ID | Description | Default Severity |
|---------|-------------|------------------|
| `spec-json/missing-field-name` | Required field "name" is missing in spec.json | `error` |
| `spec-json/invalid-field-name` | Name must be lowercase and can only contain alphanumeric characters, hyphens, and underscores | `warning` |
| `spec-json/missing-field-version` | Required field "version" is missing in spec.json | `error` |
| `spec-json/missing-field-description` | Required field "description" is missing in spec.json | `error` |
| `spec-json/missing-field-author` | Author field is missing or empty | `error` |
| `spec-json/invalid-license` | License is not a common SPDX license identifier | `warning` |

### Datamodel JSON Rules

#### Syntax and Structure

| Rule ID | Description | Default Severity |
|---------|-------------|------------------|
| `datamodel-json/invalid-json-syntax` | JSON format is invalid | `error` |
| `datamodel-json/invalid-datamodel-structure` | Datamodel structure is invalid | `error` |

#### Entity Validation

| Rule ID | Description | Default Severity |
|---------|-------------|------------------|
| `datamodel-json/invalid-field-entity-name` | Entity name must start with an uppercase letter and contain only alphanumeric characters | `error` |
| `datamodel-json/invalid-field-entity-attributes` | Entity must have at least one attribute | `error` |
| `datamodel-json/invalid-field-entities` | Datamodel must have at least one entity | `error` |
| `datamodel-json/missing-entity-name` | Required field "name" is missing in entity | `error` |
| `datamodel-json/missing-entity-attributes` | Required field "attributes" is missing in entity | `error` |

#### Attribute and Relationship Validation

| Rule ID | Description | Default Severity |
|---------|-------------|------------------|
| `datamodel-json/missing-field-attribute-name` | Required field "name" is missing in attribute | `error` |
| `datamodel-json/missing-field-attribute-type` | Required field "type" is missing in attribute | `error` |
| `datamodel-json/invalid-field-relationship-type` | Relationship type must be one of: one-to-one, one-to-many, many-to-one, many-to-many | `error` |
| `datamodel-json/invalid-field-relationship-target` | Target entity name must start with an uppercase letter and contain only alphanumeric characters | `error` |

*The full list of rules can be found in the source code under `src/utils/errorCodes.ts`.*

## Development

### Setup

```bash
# Clone the repository
git clone https://github.com/specky-pm/lint.git
cd specky-lint

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

### Project Structure

| Directory | Description |
|-----------|-------------|
| `src/cli` | Command-line interface |
| `src/core` | Core linter functionality |
| `src/validators` | File-specific validators |
| `src/reporters` | Output formatters |
| `src/utils` | Utility functions |
| `test` | Test files |

## Releasing

### Release Process

To prepare a new release of Specky Lint:

1. Update the version in `package.json`
2. Update `CHANGELOG.md` with the changes in the new version
3. Run the release preparation script:
   ```bash
   ./scripts/prepare-release.sh
   ```
4. Follow the instructions provided by the script to tag and publish the release

### Versioning

Specky Lint follows [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for new functionality in a backward compatible manner
- **PATCH** version for backward compatible bug fixes

## License

ISC