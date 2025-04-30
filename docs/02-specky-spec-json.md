# spec.json Specification

The `spec.json` file is the heart of every Specky component specification. It contains metadata about the component,
defines its dependencies, and configures how Specky should handle it.

## Purpose

- Provides metadata about the component
- Defines dependencies on other components
- Configures component-specific settings
- Serves as the package manifest

## Structure

The `spec.json` file is a JSON document with the following key fields:

### Required Fields

#### Field: name

##### Required

Yes

##### Type

String

##### Description

The name of the component specification. Must be unique within the Specky registry. Must be lowercase and can contain
hyphens and underscores.

##### Validation

- Must be a non-empty string.
- Must be lowercase.
- Can only contain alphanumeric characters, hyphens, and underscores.
- Must be unique within the registry.

#### Field: version

##### Required

Yes

##### Type

String

##### Description

The version of the component specification, following semantic versioning (MAJOR.MINOR.PATCH).

##### Validation

- Must follow semantic versioning format (X.Y.Z) where X, Y, and Z are non-negative integers.

#### Field: description

##### Required

Yes

##### Type

String

##### Description

A brief description of what the component does.

##### Validation

- Must be a non-empty string.
- Should be concise but descriptive.

### Author Information

#### Field: author

##### Required

No

##### Type

String or Object

##### Description

Information about the author of the component specification. Can be a simple string or a more detailed object with name,
email, and URL.

##### Validation

- If string: must be non-empty.
- If object: must contain at least a `name` field.
- Email should be a valid email format.
- URL should be a valid URL format.

#### Field: contributors

##### Required

No

##### Type

Array

##### Description

A list of people who have contributed to the component specification.

##### Validation

- Each entry should be either a string or an object following the same format as `author`.

### License Information

#### Field: license

##### Required

No

##### Type

String

##### Description

The license under which the component specification is distributed. Uses SPDX license identifiers.

##### Validation

- Must be a valid SPDX license identifier (e.g., "MIT", "Apache-2.0", "GPL-3.0").

### Categorization

#### Field: keywords

##### Required

No

##### Type

Array of Strings

##### Description

Tags that help others discover the component specification when searching the registry.

##### Validation

- Each keyword must be a non-empty string.
- Should be relevant to the component's functionality.
- Recommended to use lowercase.

### Dependencies

#### Field: dependencies

##### Required

No

##### Type

Object

##### Description

Other component specifications that this component depends on. Keys are names, values are version ranges.

##### Validation

- Keys must be valid component names.
- Values must be valid semver version ranges (e.g., "^1.0.0", "~2.1.0", ">=3.0.0 <4.0.0").

#### Field: devDependencies

##### Required

No

##### Type

Object

##### Description

Dependencies needed only during development.

##### Validation

- Same validation as `dependencies`.
- These should not be required for normal component usage.

#### Field: peerDependencies

##### Required

No

##### Type

Object

##### Description

Dependencies that the consumer must provide.

##### Validation

- Same validation as `dependencies`.
- Should only include components that are expected to be provided by the consumer.

#### Field: optionalDependencies

##### Required

No

##### Type

Object

##### Description

Dependencies that enhance the component but aren't required.

##### Validation

- Same validation as `dependencies`.
- Component should function properly even if these dependencies are not available.

### Repository Information

#### Field: repository

##### Required

No

##### Type

String or Object

##### Description

Information about where the component's source code is hosted.

##### Validation

- If string: must be a valid URL.
- If object: must contain `type` (e.g., "git") and `url` fields.
- URL should point to a valid repository.

#### Field: homepage

##### Required

No

##### Type

String

##### Description

URL to the component's homepage or documentation.

##### Validation

- Must be a valid URL.
- Should point to a page with information about the component.

#### Field: bugs

##### Required

No

##### Type

String or Object

##### Description

Information about where to report issues.

##### Validation

- If string: must be a valid URL.
- If object: should contain at least `url` field.
- May also include `email` field with a valid email address.

### Component Configuration

#### Field: main

##### Required

No

##### Type

String

##### Description

The primary entry point to the component specification (default: `component.md`).

##### Validation

- Must be a valid file path relative to the component root.
- File must exist in the component package.

#### Field: files

##### Required

No

##### Type

Array of Strings

##### Description

Files to include when publishing the component specification.

##### Validation

- Each entry must be a valid file path or glob pattern.
- Should include all files necessary for the component to function.

#### Field: specky

##### Required

No

##### Type

Object

##### Description

Specky-specific configuration options.

##### Validation

- Valid keys include `validators`, which can contain boolean options like `strict` and `datamodel`.

### Publishing Configuration

#### Field: private

##### Required

No

##### Type

Boolean

##### Description

If true, prevents the component from being published.

##### Validation

- Must be a boolean value (true or false).

#### Field: publishConfig

##### Required

No

##### Type

Object

##### Description

Configuration options used when publishing to the registry.

##### Validation

- May contain fields like `registry` (must be a valid URL), `access` (must be either "public" or "restricted"), and
  `tag` (must be a valid npm tag).

#### Field: engines

##### Required

No

##### Type

Object

##### Description

Specifies which versions of Specky the component is compatible with.

##### Validation

- Keys should be engine names (e.g., "specky").
- Values must be valid semver version ranges.

### Scripts

#### Field: scripts

##### Required

No

##### Type

Object

##### Description

Custom scripts that can be run with `spm run <script-name>`.

##### Validation

- Keys must be valid script names (alphanumeric, hyphens, and underscores).
- Values must be strings containing valid shell commands.

## Example

```json
{
  "name": "user-component",
  "version": "1.2.0",
  "description": "A comprehensive user management component",
  "author": {
    "name": "Jane Developer",
    "email": "jane@example.com",
    "url": "https://janedeveloper.com"
  },
  "license": "MIT",
  "keywords": ["user", "authentication", "profile"],
  "dependencies": {
    "email-validator": "^1.0.0",
    "password-strength": "~2.1.0"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/username/user-component.git"
  },
  "specky": {
    "validators": {
      "strict": true,
      "datamodel": true
    }
  }
}
```

