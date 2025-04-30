import {LinterConfig, Validator} from '../types';
import {BaseValidator} from './baseValidator';
import {SchemaValidator} from './schemaValidator';
import {SpecJsonValidator} from './specJsonValidator';
import {DatamodelJsonValidator} from './datamodelJsonValidator';

export {
  BaseValidator,
  SchemaValidator,
  SpecJsonValidator,
  DatamodelJsonValidator
};

/**
 * Factory for creating validators
 */
export class ValidatorFactory {
  /**
   * Creates validators based on configuration
   * @param config Linter configuration
   * @returns Array of validators
   */
  static createValidators(config?: LinterConfig): Validator[] {
    const validators: Validator[] = [];

    // Only create validators that are enabled in the config
    if (!config || config.fileValidation?.['spec.json'] !== false) {
      validators.push(new SpecJsonValidator());
    }

    if (!config || config.fileValidation?.['datamodel.json'] !== false) {
      validators.push(new DatamodelJsonValidator());
    }

    return validators;
  }
}

/**
 * Creates and returns all available validators
 * @returns Array of validators
 */
export function createValidators(): Validator[] {
  return ValidatorFactory.createValidators();
}