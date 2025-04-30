import {LinterConfig, Validator} from '../types';
import {BaseValidator} from '../validators/baseValidator';

/**
 * Registry for file validators
 * Manages validators and provides the appropriate validator for a given file
 */
export class ValidatorRegistry {
  private validators: Validator[] = [];
  private config?: LinterConfig;

  /**
   * Registers a validator with the registry
   * @param validator The validator to register
   */
  /**
   * Sets the configuration for all validators
   * @param config Linter configuration
   */
  setConfig(config: LinterConfig): void {
    this.config = config;

    // Pass configuration to all validators that support it
    this.validators.forEach(validator => {
      if (validator instanceof BaseValidator) {
        validator.setConfig(config);
      }
    });
  }

  /**
   * Registers a validator with the registry
   * @param validator The validator to register
   */
  registerValidator(validator: Validator): void {
    // Set config if available
    if (this.config && validator instanceof BaseValidator) {
      validator.setConfig(this.config);
    }

    this.validators.push(validator);
  }

  /**
   * Registers multiple validators with the registry
   * @param validators The validators to register
   */
  registerValidators(validators: Validator[]): void {
    validators.forEach(validator => this.registerValidator(validator));
  }

  /**
   * Gets the appropriate validator for a file
   * @param filePath The path of the file to validate
   * @returns The validator for the file, or undefined if no validator is found
   */
  getValidatorForFile(filePath: string): Validator | undefined {
    return this.validators.find(validator =>
      validator.canValidate(filePath) &&
      (this.config ? validator.isEnabled(this.config) : true)
    );
  }

  /**
   * Gets all registered validators
   * @returns Array of all registered validators
   */
  getAllValidators(): Validator[] {
    return [...this.validators];
  }

  /**
   * Clears all registered validators
   */
  clearValidators(): void {
    this.validators = [];
  }

  /**
   * Checks if a validator is registered for a specific file type
   * @param fileExtension The file extension to check for
   * @returns True if a validator is registered for the file extension, false otherwise
   */
  hasValidatorForFileType(fileExtension: string): boolean {
    // Create a dummy file path with the given extension
    const dummyFilePath = `dummy${fileExtension}`;
    return this.validators.some(validator =>
      validator.canValidate(dummyFilePath) &&
      (this.config ? validator.isEnabled(this.config) : true)
    );
  }

  /**
   * Gets the number of registered validators
   * @returns The number of registered validators
   */
  get validatorCount(): number {
    return this.validators.length;
  }
}