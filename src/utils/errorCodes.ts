/**
 * Error code definitions for the linter
 * Each error code has a unique identifier, a description, and a suggestion
 */
export interface ErrorCodeDefinition {
  /** Short description of the error */
  description: string;
  /** Suggestion for fixing the error */
  suggestion: string;
  /** Default severity of the error (error or warning) */
  defaultSeverity: 'error' | 'warning';
  /** Category of the error */
  category: ErrorCategory;
}

/**
 * Categories of errors
 */
export enum ErrorCategory {
  /** Issues with the file format or syntax */
  SYNTAX = 'syntax',
  /** Issues with the structure of the specification */
  STRUCTURE = 'structure',
  /** Issues with the content of the specification */
  CONTENT = 'content',
  /** Issues with consistency between files */
  CROSS_FILE = 'cross-file',
  /** Issues with recommended practices */
  BEST_PRACTICE = 'best-practice',
  /** Issues with file system operations */
  FILE_SYSTEM = 'file-system'
}

/**
 * Error codes and their definitions
 */
export const ERROR_CODES: Record<string, ErrorCodeDefinition> = {

  // File System Errors
  'base/missing-required-file': {
    description: 'A required file is missing',
    suggestion: 'Create the missing file according to the Specky specification',
    defaultSeverity: 'error',
    category: ErrorCategory.FILE_SYSTEM
  },
  'base/file-read-error': {
    description: 'Failed to read file',
    suggestion: 'Check file permissions and ensure the file exists',
    defaultSeverity: 'error',
    category: ErrorCategory.FILE_SYSTEM
  },

  // Syntax Errors
  'spec-json/invalid-json-syntax': {
    description: 'JSON format is invalid',
    suggestion: 'Ensure the JSON file contains a valid object',
    defaultSeverity: 'error',
    category: ErrorCategory.STRUCTURE
  },
  'datamodel-json/invalid-json-syntax': {
    description: 'JSON format is invalid',
    suggestion: 'Ensure the JSON file contains a valid object',
    defaultSeverity: 'error',
    category: ErrorCategory.STRUCTURE
  },

  // Content Errors: Spec
  // name
  'spec-json/missing-field-name': {
    description: 'Required field "name" is missing in spec.json',
    suggestion: 'Add a "name" field to your spec.json file',
    defaultSeverity: 'error',
    category: ErrorCategory.CONTENT
  },
  'spec-json/invalid-field-name': {
    description: 'Name must be lowercase and can only contain alphanumeric characters, hyphens, and underscores',
    suggestion: 'Rename your component using only lowercase letters, numbers, hyphens, and underscores',
    defaultSeverity: 'warning',
    category: ErrorCategory.CONTENT
  },
  // version
  'spec-json/missing-field-version': {
    description: 'Required field "version" is missing in spec.json',
    suggestion: 'Add a "version" field following semantic versioning (e.g., "1.0.0")',
    defaultSeverity: 'error',
    category: ErrorCategory.CONTENT
  },
  'spec-json/invalid-field-version': {
    description: 'Version format is invalid',
    suggestion: 'Use a valid semantic version format (MAJOR.MINOR.PATCH)',
    defaultSeverity: 'error',
    category: ErrorCategory.STRUCTURE
  },
  // description
  'spec-json/missing-field-description': {
    description: 'Required field "description" is missing in spec.json',
    suggestion: 'Add a "description" field that explains the purpose of your component',
    defaultSeverity: 'error',
    category: ErrorCategory.CONTENT
  },
  'spec-json/invalid-field-description': {
    description: 'Description field cannot be empty',
    suggestion: 'Provide a meaningful description for your component',
    defaultSeverity: 'warning',
    category: ErrorCategory.CONTENT
  },
  // author - string
  'spec-json/missing-field-author': {
    description: 'Author field is missing or empty',
    suggestion: 'Add an "author" field with your name or organization',
    defaultSeverity: 'error',
    category: ErrorCategory.CONTENT
  },
  'spec-json/invalid-field-author': {
    description: 'Author field cannot be empty',
    suggestion: 'Provide a valid author name or organization',
    defaultSeverity: 'warning',
    category: ErrorCategory.CONTENT
  },
  // author - object - name
  'spec-json/missing-field-author-name': {
    description: 'Author name is missing in author object',
    suggestion: 'Add a "name" field to the author object',
    defaultSeverity: 'error',
    category: ErrorCategory.CONTENT
  },
  'spec-json/invalid-field-author-name': {
    description: 'Author name cannot be empty',
    suggestion: 'Provide a valid name in the author object',
    defaultSeverity: 'warning',
    category: ErrorCategory.CONTENT
  },
  // author - object - email
  'spec-json/invalid-field-author-email': {
    description: 'Author email must be a valid email address',
    suggestion: 'Provide a valid email address in the format user@example.com',
    defaultSeverity: 'warning',
    category: ErrorCategory.CONTENT
  },
  // author - object - URL
  'spec-json/invalid-field-author-url': {
    description: 'Author URL must be a valid URL',
    suggestion: 'Provide a valid URL starting with http:// or https://',
    defaultSeverity: 'warning',
    category: ErrorCategory.CONTENT
  },

  // license
  'spec-json/invalid-license': {
    description: 'License is not a common SPDX license identifier',
    suggestion: 'Use a valid SPDX license identifier (e.g., "MIT", "Apache-2.0")',
    defaultSeverity: 'warning',
    category: ErrorCategory.CONTENT
  },

  // Repository
  'spec-json/invalid-field-repository-url': {
    description: 'Repository URL must be a valid URL',
    suggestion: 'Provide a valid repository URL starting with http:// or https://',
    defaultSeverity: 'warning',
    category: ErrorCategory.CONTENT
  },
  'spec-json/invalid-field-repository-type': {
    description: 'Repository type cannot be empty',
    suggestion: 'Specify the repository type (e.g., "git")',
    defaultSeverity: 'warning',
    category: ErrorCategory.CONTENT
  },

  // Bugs
  'spec-json/invalid-field-bugs-url': {
    description: 'Bugs URL must be a valid URL',
    suggestion: 'Provide a valid URL for bug reporting starting with http:// or https://',
    defaultSeverity: 'warning',
    category: ErrorCategory.CONTENT
  },
  'spec-json/invalid-field-bugs-email': {
    description: 'Bugs email must be a valid email address',
    suggestion: 'Provide a valid email address for bug reporting in the format user@example.com',
    defaultSeverity: 'warning',
    category: ErrorCategory.CONTENT
  },

  // Dependencies
  'spec-json/invalid-field-dependency-name': {
    description: 'Dependency name must be lowercase and can only contain alphanumeric characters, hyphens, and underscores',
    suggestion: 'Use only lowercase letters, numbers, hyphens, and underscores in dependency names',
    defaultSeverity: 'warning',
    category: ErrorCategory.CONTENT
  },
  'spec-json/invalid-field-dependency-version': {
    description: 'Dependency version cannot be empty',
    suggestion: 'Specify a version or version range for the dependency',
    defaultSeverity: 'warning',
    category: ErrorCategory.CONTENT
  },

  // Publish config
  'spec-json/invalid-field-publish-registry': {
    description: 'Registry URL must be a valid URL',
    suggestion: 'Provide a valid registry URL starting with http:// or https://',
    defaultSeverity: 'warning',
    category: ErrorCategory.CONTENT
  },
  'spec-json/invalid-field-publish-access': {
    description: 'Access must be either "public" or "restricted"',
    suggestion: 'Set access to either "public" or "restricted"',
    defaultSeverity: 'warning',
    category: ErrorCategory.CONTENT
  },
  'spec-json/invalid-field-publish-tag': {
    description: 'Tag cannot be empty',
    suggestion: 'Provide a valid tag name for publishing',
    defaultSeverity: 'warning',
    category: ErrorCategory.CONTENT
  },

  // Other fields
  'spec-json/invalid-field-keywords': {
    description: 'Keywords cannot contain empty strings',
    suggestion: 'Ensure all keywords are non-empty strings',
    defaultSeverity: 'warning',
    category: ErrorCategory.CONTENT
  },
  'spec-json/invalid-field-homepage': {
    description: 'Homepage must be a valid URL',
    suggestion: 'Provide a valid homepage URL starting with http:// or https://',
    defaultSeverity: 'warning',
    category: ErrorCategory.CONTENT
  },
  'spec-json/invalid-field-files': {
    description: 'File paths cannot be empty',
    suggestion: 'Ensure all file paths in the "files" array are non-empty strings',
    defaultSeverity: 'warning',
    category: ErrorCategory.CONTENT
  },

  // Content Errors: Data Model
  'spec-json/invalid-field-dependencies': {
    description: 'Dependencies object structure is invalid',
    suggestion: 'Ensure the dependencies object has valid component names as keys and version strings as values',
    defaultSeverity: 'warning',
    category: ErrorCategory.CONTENT
  },
  'spec-json/unrecognised-keys': {
    description: 'Spec.json contains unrecognized keys',
    suggestion: 'Remove unrecognized keys from your spec.json file',
    defaultSeverity: 'warning',
    category: ErrorCategory.STRUCTURE
  },

  // Content Errors: Data Model
  'datamodel-json/empty-attributes': {
    description: 'Entity has empty attributes array',
    suggestion: 'Add at least one attribute to the entity',
    defaultSeverity: 'warning',
    category: ErrorCategory.CONTENT
  },

  // Entity validation
  'datamodel-json/invalid-field-entity-name': {
    description: 'Entity name must start with an uppercase letter and contain only alphanumeric characters',
    suggestion: 'Rename your entity to start with an uppercase letter and use only alphanumeric characters (e.g., "User", "BlogPost")',
    defaultSeverity: 'error',
    category: ErrorCategory.CONTENT
  },
  'datamodel-json/invalid-field-entity-attributes': {
    description: 'Entity must have at least one attribute',
    suggestion: 'Add at least one attribute to your entity definition',
    defaultSeverity: 'error',
    category: ErrorCategory.CONTENT
  },
  'datamodel-json/invalid-field-entities': {
    description: 'Datamodel must have at least one entity',
    suggestion: 'Add at least one entity to your datamodel.json file',
    defaultSeverity: 'error',
    category: ErrorCategory.CONTENT
  },
  'datamodel-json/invalid-entity-object': {
    description: 'Entity object structure is invalid',
    suggestion: 'Ensure the entity object contains required properties (name, attributes) and follows the correct structure',
    defaultSeverity: 'error',
    category: ErrorCategory.STRUCTURE
  },
  'datamodel-json/invalid-attribute-object': {
    description: 'Attribute object structure is invalid',
    suggestion: 'Ensure the attribute object contains valid properties and follows the correct structure',
    defaultSeverity: 'error',
    category: ErrorCategory.STRUCTURE
  },
  'datamodel-json/invalid-relationship-object': {
    description: 'Relationship object structure is invalid',
    suggestion: 'Ensure the relationship object contains valid properties and follows the correct structure',
    defaultSeverity: 'error',
    category: ErrorCategory.STRUCTURE
  },
  'datamodel-json/invalid-datamodel-structure': {
    description: 'Datamodel structure is invalid',
    suggestion: 'Ensure the datamodel.json file follows the correct structure with entities array',
    defaultSeverity: 'error',
    category: ErrorCategory.STRUCTURE
  },
  'datamodel-json/missing-entity-name': {
    description: 'Required field "name" is missing in entity',
    suggestion: 'Add a "name" field to your entity definition',
    defaultSeverity: 'error',
    category: ErrorCategory.CONTENT
  },
  'datamodel-json/missing-entity-attributes': {
    description: 'Required field "attributes" is missing in entity',
    suggestion: 'Add an "attributes" array to your entity definition',
    defaultSeverity: 'error',
    category: ErrorCategory.CONTENT
  },

  // Attribute validation
  'datamodel-json/missing-field-attribute-name': {
    description: 'Required field "name" is missing in attribute',
    suggestion: 'Add a "name" field to your attribute definition',
    defaultSeverity: 'error',
    category: ErrorCategory.CONTENT
  },
  'datamodel-json/missing-field-attribute-type': {
    description: 'Required field "type" is missing in attribute',
    suggestion: 'Add a "type" field to your attribute definition',
    defaultSeverity: 'error',
    category: ErrorCategory.CONTENT
  },
  'datamodel-json/missing-field-attribute-description': {
    description: 'Required field "description" is missing in attribute',
    suggestion: 'Add a "description" field to your attribute definition',
    defaultSeverity: 'error',
    category: ErrorCategory.CONTENT
  },
  'datamodel-json/invalid-field-attribute-name': {
    description: 'Attribute name cannot be empty',
    suggestion: 'Provide a name for each attribute in your entity',
    defaultSeverity: 'error',
    category: ErrorCategory.CONTENT
  },
  'datamodel-json/invalid-field-attribute-type': {
    description: 'Attribute type cannot be empty',
    suggestion: 'Specify a type for each attribute (e.g., "string", "number", "boolean")',
    defaultSeverity: 'error',
    category: ErrorCategory.CONTENT
  },
  'datamodel-json/invalid-field-attribute-description': {
    description: 'Attribute description cannot be empty',
    suggestion: 'Provide a meaningful description for each attribute',
    defaultSeverity: 'warning',
    category: ErrorCategory.CONTENT
  },

  // Relationship validation
  'datamodel-json/missing-field-relationship-name': {
    description: 'Required field "name" is missing in relationship',
    suggestion: 'Add a "name" field to your relationship definition',
    defaultSeverity: 'error',
    category: ErrorCategory.CONTENT
  },
  'datamodel-json/missing-field-relationship-target': {
    description: 'Required field "target" is missing in relationship',
    suggestion: 'Add a "target" field to your relationship definition',
    defaultSeverity: 'error',
    category: ErrorCategory.CONTENT
  },
  'datamodel-json/invalid-field-relationship-name': {
    description: 'Relationship name cannot be empty',
    suggestion: 'Provide a name for each relationship in your entity',
    defaultSeverity: 'error',
    category: ErrorCategory.CONTENT
  },
  'datamodel-json/invalid-field-relationship-type': {
    description: 'Relationship type must be one of: one-to-one, one-to-many, many-to-one, many-to-many',
    suggestion: 'Use one of the supported relationship types: one-to-one, one-to-many, many-to-one, many-to-many',
    defaultSeverity: 'error',
    category: ErrorCategory.CONTENT
  },
  'datamodel-json/invalid-field-relationship-target': {
    description: 'Target entity name must start with an uppercase letter and contain only alphanumeric characters',
    suggestion: 'Ensure the target entity name follows proper naming conventions (e.g., "User", "BlogPost")',
    defaultSeverity: 'error',
    category: ErrorCategory.CONTENT
  },
  'datamodel-json/invalid-field-relationship-inverse': {
    description: 'Inverse relationship name cannot be empty',
    suggestion: 'Provide a name for the inverse relationship',
    defaultSeverity: 'warning',
    category: ErrorCategory.CONTENT
  },

};

/**
 * Gets the definition for an error code
 * @param code Error code
 * @returns Error code definition or undefined if the code is not defined
 */
export function getErrorCodeDefinition(code: string): ErrorCodeDefinition | undefined {
  // Handle prefixed rule IDs by stripping the prefix
  const baseCode = code.includes('/') ? code.split('/')[1] : code;
  return ERROR_CODES[baseCode];
}

/**
 * Gets the description for an error code
 * @param code Error code
 * @returns Error code description or a default message if the code is not defined
 */
export function getErrorDescription(code: string): string {
  // Handle prefixed rule IDs by stripping the prefix
  const baseCode = code.includes('/') ? code.split('/')[1] : code;
  return ERROR_CODES[baseCode]?.description || `Unknown error (${code})`;
}

/**
 * Gets the suggestion for an error code
 * @param code Error code
 * @returns Error code suggestion or undefined if the code is not defined
 */
export function getErrorSuggestion(code: string): string | undefined {
  return ERROR_CODES[code]?.suggestion;
}

/**
 * Gets the default severity for an error code
 * @param code Error code
 * @returns Default severity or 'error' if the code is not defined
 */
export function getDefaultSeverity(code: string): 'error' | 'warning' {
  // Handle prefixed rule IDs by stripping the prefix
  const baseCode = code.includes('/') ? code.split('/')[1] : code;
  return ERROR_CODES[baseCode]?.defaultSeverity || 'error';
}

/**
 * Gets the category for an error code
 * @param code Error code
 * @returns Error category or undefined if the code is not defined
 */
export function getErrorCategory(code: string): ErrorCategory | undefined {
  // Handle prefixed rule IDs by stripping the prefix
  const baseCode = code.includes('/') ? code.split('/')[1] : code;
  return ERROR_CODES[baseCode]?.category;
}

/**
 * Formats an error message with code and suggestion
 * @param message Base error message
 * @param code Error code
 * @returns Formatted error message
 */
export function formatErrorMessage(message: string, code: string): string {
  const suggestion = getErrorSuggestion(code);
  if (suggestion) {
    return `${message}. ${suggestion} (${code})`;
  }
  return `${message} (${code})`;
}