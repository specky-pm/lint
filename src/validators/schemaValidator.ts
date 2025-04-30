import {z} from 'zod';
import {BaseValidator} from './baseValidator';
import {ValidationIssue} from '../types';

/**
 * Abstract schema validator that uses Zod schemas for validation
 * Provides common validation methods for JSON schema validation
 */
export abstract class SchemaValidator<T> extends BaseValidator {
  /** Zod schema for validation */
  protected schema: z.ZodSchema<T>;

  /**
   * Creates a new schema validator
   * @param schema Zod schema for validation
   */
  constructor(schema: z.ZodSchema<T>) {
    super();
    this.schema = schema;
  }

  /**
   * Validates JSON content using the schema
   * @param content Content to validate
   * @param filePath Path to the file being validated
   * @returns Array of validation issues
   */
  protected validateWithSchema(content: string, filePath: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    try {
      // Parse JSON
      const json = JSON.parse(content);

      // Validate with schema
      const result = this.schema.safeParse(json);

      if (!result.success) {
        // Convert Zod errors to ValidationIssues
        for (const error of result.error.errors) {
          const code = `${this.getValidatorPrefix()}/${error.message}`
          const issue = this.createIssue(
            'error',
            `${error.path.join('.') || 'root'}: ${error.message}`,
            filePath,
            code,
            undefined,
            undefined,
            error.message
          );

          if (issue) {
            issues.push(issue);
          }
        }
      }
    } catch (error) {
      // Handle JSON parsing errors
      const issue = this.createIssue(
        'error',
        `Invalid JSON syntax: ${error instanceof Error ? error.message : String(error)}`,
        filePath,
        `${this.getValidatorPrefix()}/invalid-json-syntax`,
        undefined,
        undefined,
        'Fix the JSON syntax error'
      );

      if (issue) {
        issues.push(issue);
      }
    }

    return issues;
  }

  /**
   * Gets the prefix for error codes
   * @returns Prefix for error codes
   */
  protected abstract getValidatorPrefix(): string;
}