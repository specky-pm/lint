// Validation issue with severity level
export interface ValidationIssue {
  severity: 'error' | 'warning';
  message: string;
  filePath: string;
  line?: number;
  column?: number;
  code: string; // Error code for documentation reference
  suggestion?: string; // Optional suggestion for fixing the issue
}

// Result of validation for a single file
export interface FileValidationResult {
  filePath: string;
  isValid: boolean;
  issues: ValidationIssue[];
}

// Overall validation result
export interface ValidationResult {
  isValid: boolean;
  fileResults: FileValidationResult[];
  errorCount: number;
  warningCount: number;
}

// Interface for all validators
export interface Validator {
  validate(filePath: string, content: string, context: ValidationContext): FileValidationResult;
  canValidate(filePath: string): boolean;
  isEnabled(config: LinterConfig): boolean;
}

// Context shared between validators for cross-file validation
export interface ValidationContext {
  specJson?: any;
  datamodelJson?: any;
  rootDir: string;
}

// Configuration interface
export interface LinterConfig {
  rootDir: string;
  ignorePatterns?: string[];
  // Enable/disable specific file validations
  fileValidation?: {
    'spec.json'?: boolean;
    'datamodel.json'?: boolean;
    'component.md'?: boolean;
  };
  rules?: {
    [ruleId: string]: 'error' | 'warning' | 'off';
  };
}