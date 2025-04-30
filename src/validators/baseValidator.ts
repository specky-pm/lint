import path from 'path';
import {FileValidationResult, LinterConfig, ValidationContext, ValidationIssue, Validator} from '../types';
import {formatErrorMessage, getDefaultSeverity, getErrorSuggestion} from '../utils/errorCodes';

/**
 * Base validator class that other validators will extend
 * Provides common validation methods and utilities
 */
export abstract class BaseValidator implements Validator {
  /** Configuration for the validator */
  protected config?: LinterConfig;

  /**
   * Sets the configuration for the validator
   * @param config Linter configuration
   */
  setConfig(config: LinterConfig): void {
    this.config = config;
  }

  /**
   * Checks if this validator is enabled in the configuration
   * @param config Linter configuration
   * @returns True if this validator is enabled, false otherwise
   */
  isEnabled(config: LinterConfig): boolean {
    // By default, all validators are enabled
    return true;
  }

  /**
   * Validates a file
   * @param filePath Path to the file
   * @param content Content of the file
   * @param context Validation context
   * @returns Validation result
   */
  abstract validate(
    filePath: string,
    content: string,
    context: ValidationContext
  ): FileValidationResult;

  /**
   * Checks if this validator can validate the given file
   * @param filePath Path to the file
   * @returns True if this validator can validate the file, false otherwise
   */
  abstract canValidate(filePath: string): boolean;

  /**
   * Creates a validation issue
   * @param severity Severity of the issue (error or warning)
   * @param message Message describing the issue
   * @param filePath Path to the file with the issue
   * @param code Error code for documentation reference
   * @param line Line number where the issue occurred (optional)
   * @param column Column number where the issue occurred (optional)
   * @param suggestion Suggestion for fixing the issue (optional)
   * @returns Validation issue
   */
  protected createIssue(
    severity: 'error' | 'warning',
    message: string,
    filePath: string,
    code: string,
    line?: number,
    column?: number,
    suggestion?: string
  ): ValidationIssue {
    // If no suggestion is provided, use the one from error codes
    const finalSuggestion = getErrorSuggestion(code) || suggestion;

    // If config is available, check if the rule is configured
    if (this.config?.rules && this.config.rules[code] !== undefined) {
      // If rule is set to 'off', return null to skip this issue
      if (this.config.rules[code] === 'off') {
        return null as any; // This will be filtered out later
      }

      // Use configured severity
      severity = this.config.rules[code] as 'error' | 'warning';
    } else {
      // Use default severity from error codes if not explicitly configured
      // Only apply default severity in tests if it doesn't make a warning into an error
      // This preserves backward compatibility with existing tests
      const defaultSeverity = getDefaultSeverity(code);
      if (defaultSeverity === 'warning' && severity === 'error') {
        // Keep it as error if that's what the validator specified
      } else {
        severity = defaultSeverity;
      }
    }

    return {
      severity,
      message,
      filePath,
      line,
      column,
      code,
      suggestion: finalSuggestion
    };
  }

  /**
   * Creates a successful validation result with no issues
   * @param filePath Path to the validated file
   * @returns Validation result
   */
  protected createSuccessResult(filePath: string): FileValidationResult {
    return {
      filePath,
      isValid: true,
      issues: []
    };
  }

  /**
   * Creates a validation result with issues
   * @param filePath Path to the validated file
   * @param issues Array of validation issues
   * @returns Validation result
   */
  protected createResultWithIssues(
    filePath: string,
    issues: ValidationIssue[]
  ): FileValidationResult {
    // Filter out null issues (rules set to 'off')
    const filteredIssues = issues.filter(issue => issue !== null);

    // A file is valid if it has no error issues (warnings are allowed)
    const isValid = !filteredIssues.some(issue => issue.severity === 'error');

    return {
      filePath,
      isValid,
      issues: filteredIssues
    };
  }

  /**
   * Gets the file name from a file path
   * @param filePath Path to the file
   * @returns File name
   */
  protected getFileName(filePath: string): string {
    return path.basename(filePath);
  }

  /**
   * Checks if a value is a non-empty string
   * @param value Value to check
   * @returns True if the value is a non-empty string, false otherwise
   */
  protected isNonEmptyString(value: any): boolean {
    return typeof value === 'string' && value.trim().length > 0;
  }

  /**
   * Checks if a value is a valid JSON object
   * @param value Value to check
   * @returns True if the value is a valid JSON object, false otherwise
   */
  protected isJsonObject(value: any): boolean {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  /**
   * Validates that a JSON object has required fields
   * @param json JSON object to validate
   * @param requiredFields Array of required field names
   * @param filePath Path to the file being validated
   * @returns Array of validation issues (empty if all required fields are present)
   */
  protected validateRequiredFields(
    json: any,
    requiredFields: string[],
    filePath: string
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    for (const field of requiredFields) {
      if (json[field] === undefined) {
        const issue = this.createIssue(
          'error',
          `Missing required field '${field}'`,
          filePath,
          'base/missing-required-field',
          undefined,
          undefined,
          `Add a '${field}' field to the JSON object`
        );

        if (issue) {
          issues.push(issue);
        }
      }
    }

    return issues;
  }

  /**
   * Creates a formatted error message with code and suggestion
   * @param message Base error message
   * @param code Error code
   * @returns Formatted error message
   */
  protected formatErrorMessage(message: string, code: string): string {
    return formatErrorMessage(message, code);
  }
}