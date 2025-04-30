import {SchemaValidator} from './schemaValidator';
import specJsonSchema, {SpecJson} from '../spec/spec-json-schema';
import {FileValidationResult, LinterConfig, ValidationContext} from '../types';

/**
 * Validator for spec.json files
 * Uses Zod schema for validation
 */
export class SpecJsonValidator extends SchemaValidator<SpecJson> {
  /**
   * Creates a new SpecJsonValidator
   */
  constructor() {
    super(specJsonSchema);
  }

  /**
   * Checks if this validator can validate the given file
   * @param filePath Path to the file
   * @returns True if this validator can validate the file, false otherwise
   */
  canValidate(filePath: string): boolean {
    const fileName = this.getFileName(filePath);
    return fileName === 'spec.json';
  }

  /**
   * Checks if this validator is enabled in the configuration
   * @param config Linter configuration
   * @returns True if this validator is enabled, false otherwise
   */
  isEnabled(config: LinterConfig): boolean {
    return config.fileValidation?.['spec.json'] !== false;
  }

  /**
   * Validates a spec.json file
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


    return this.createResultWithIssues(filePath, issues);
  }

  /**
   * Gets the prefix for error codes
   * @returns Prefix for error codes
   */
  protected getValidatorPrefix(): string {
    return 'spec-json';
  }

}