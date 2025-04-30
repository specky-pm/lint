import {SchemaValidator} from './schemaValidator';
import datamodelJsonSchema, {DatamodelJson} from '../spec/datamodel-json-schema';
import {FileValidationResult, LinterConfig, ValidationContext, ValidationIssue} from '../types';

/**
 * Validator for datamodel.json files
 * Uses Zod schema for validation
 */
export class DatamodelJsonValidator extends SchemaValidator<DatamodelJson> {
  /**
   * Creates a new DatamodelJsonValidator
   */
  constructor() {
    super(datamodelJsonSchema);
  }

  /**
   * Checks if this validator can validate the given file
   * @param filePath Path to the file
   * @returns True if this validator can validate the file, false otherwise
   */
  canValidate(filePath: string): boolean {
    const fileName = this.getFileName(filePath);
    return fileName === 'datamodel.json';
  }

  /**
   * Checks if this validator is enabled in the configuration
   * @param config Linter configuration
   * @returns True if this validator is enabled, false otherwise
   */
  isEnabled(config: LinterConfig): boolean {
    return config.fileValidation?.['datamodel.json'] !== false;
  }

  /**
   * Validates a datamodel.json file
   * @param filePath Path to the file
   * @param content Content of the file
   * @param context Validation context
   * @returns Validation result
   */
  validate(
    filePath: string,
    content: string,
    context: ValidationContext
  ): FileValidationResult {
    // Validate using the schema
    const issues = this.validateWithSchema(content, filePath);

    // If there are schema validation issues, return them
    if (issues.length > 0) {
      return this.createResultWithIssues(filePath, issues);
    }

    // Perform cross-file validation if context is available
    if (context.specJson) {
      const crossFileIssues = this.validateCrossFileConsistency(content, context, filePath);
      issues.push(...crossFileIssues);
    }

    return this.createResultWithIssues(filePath, issues);
  }

  /**
   * Gets the prefix for error codes
   * @returns Prefix for error codes
   */
  protected getValidatorPrefix(): string {
    return 'datamodel-json';
  }

  /**
   * Validates cross-file consistency between datamodel.json and other files
   * @param content Content of the datamodel.json file
   * @param context Validation context
   * @param filePath Path to the file being validated
   * @returns Array of validation issues
   */
  private validateCrossFileConsistency(
    content: string,
    context: ValidationContext,
    filePath: string
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // This is a placeholder for potential cross-file validation
    // In a real implementation, you might want to check for consistency
    // between the datamodel.json and spec.json files

    return issues;
  }
}