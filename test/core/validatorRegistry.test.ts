import {ValidatorRegistry} from '../../src/core/validatorRegistry';
import {FileValidationResult, ValidationContext, Validator} from '../../src/types';

// Create mock validators for testing
class MockSpecJsonValidator implements Validator {
  validate(filePath: string, content: string, context: ValidationContext): FileValidationResult {
    return {
      filePath,
      isValid: true,
      issues: []
    };
  }

  canValidate(filePath: string): boolean {
    return filePath.endsWith('spec.json');
  }
}

class MockDatamodelJsonValidator implements Validator {
  validate(filePath: string, content: string, context: ValidationContext): FileValidationResult {
    return {
      filePath,
      isValid: true,
      issues: []
    };
  }

  canValidate(filePath: string): boolean {
    return filePath.endsWith('datamodel.json');
  }
}

describe('ValidatorRegistry', () => {
  let validatorRegistry: ValidatorRegistry;
  let specJsonValidator: Validator;
  let datamodelValidator: Validator;

  beforeEach(() => {
    validatorRegistry = new ValidatorRegistry();
    specJsonValidator = new MockSpecJsonValidator();
    datamodelValidator = new MockDatamodelJsonValidator();
  });

  describe('registerValidator', () => {
    it('should register a validator', () => {
      validatorRegistry.registerValidator(specJsonValidator);

      expect(validatorRegistry.validatorCount).toBe(1);
      expect(validatorRegistry.getAllValidators()).toContain(specJsonValidator);
    });

    it('should register multiple validators', () => {
      validatorRegistry.registerValidator(specJsonValidator);

      expect(validatorRegistry.validatorCount).toBe(1);
      expect(validatorRegistry.getAllValidators()).toContain(specJsonValidator);
    });
  });

  describe('registerValidators', () => {
    it('should register multiple validators at once', () => {
      validatorRegistry.registerValidators([specJsonValidator, datamodelValidator]);

      expect(validatorRegistry.validatorCount).toBe(2);
      expect(validatorRegistry.getAllValidators()).toContain(specJsonValidator);
      expect(validatorRegistry.getAllValidators()).toContain(datamodelValidator);
    });
  });

  describe('getValidatorForFile', () => {
    beforeEach(() => {
      validatorRegistry.registerValidators([specJsonValidator, datamodelValidator]);
    });

    it('should return the appropriate validator for spec.json', () => {
      const validator = validatorRegistry.getValidatorForFile('path/to/spec.json');

      expect(validator).toBe(specJsonValidator);
    });

    it('should return the appropriate validator for datamodel.json', () => {
      const validator = validatorRegistry.getValidatorForFile('path/to/datamodel.json');

      expect(validator).toBe(datamodelValidator);
    });

    it('should return undefined if no validator is found', () => {
      const validator = validatorRegistry.getValidatorForFile('path/to/unknown.file');

      expect(validator).toBeUndefined();
    });
  });

  describe('getAllValidators', () => {
    it('should return all registered validators', () => {
      validatorRegistry.registerValidators([specJsonValidator, datamodelValidator]);

      const validators = validatorRegistry.getAllValidators();

      expect(validators).toHaveLength(2);
      expect(validators).toContain(specJsonValidator);
      expect(validators).toContain(datamodelValidator);
    });

    it('should return a copy of the validators array', () => {
      validatorRegistry.registerValidators([specJsonValidator, datamodelValidator]);

      const validators = validatorRegistry.getAllValidators();

      // Modifying the returned array should not affect the registry
      validators.pop();

      expect(validatorRegistry.validatorCount).toBe(2);
    });
  });

  describe('clearValidators', () => {
    it('should remove all registered validators', () => {
      validatorRegistry.registerValidators([specJsonValidator, datamodelValidator]);
      validatorRegistry.clearValidators();

      expect(validatorRegistry.validatorCount).toBe(0);
      expect(validatorRegistry.getAllValidators()).toHaveLength(0);
    });
  });

  describe('hasValidatorForFileType', () => {
    beforeEach(() => {
      validatorRegistry.registerValidators([specJsonValidator, datamodelValidator]);
    });

    it('should return true if a validator is registered for the file type', () => {
      expect(validatorRegistry.hasValidatorForFileType('spec.json')).toBe(true);
    });

    it('should return false if no validator is registered for the file type', () => {
      expect(validatorRegistry.hasValidatorForFileType('.txt')).toBe(false);
      expect(validatorRegistry.hasValidatorForFileType('.feature')).toBe(false);
    });
  });

  describe('validatorCount', () => {
    it('should return the number of registered validators', () => {
      expect(validatorRegistry.validatorCount).toBe(0);

      validatorRegistry.registerValidator(specJsonValidator);
      expect(validatorRegistry.validatorCount).toBe(1);

      validatorRegistry.registerValidator(datamodelValidator);
      expect(validatorRegistry.validatorCount).toBe(2);

      validatorRegistry.clearValidators();
      expect(validatorRegistry.validatorCount).toBe(0);
    });
  });
});