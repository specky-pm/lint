import {Linter} from '../../src/core/linter';
import {FileSystemHandler} from '../../src/core/fileSystemHandler';
import {ValidatorRegistry} from '../../src/core/validatorRegistry';
import {FileValidationResult, LinterConfig, ValidationContext, Validator} from '../../src/types';

// Mock dependencies
jest.mock('../../src/core/fileSystemHandler');
jest.mock('../../src/core/validatorRegistry');

// Mock validator implementation
class MockValidator implements Validator {
  constructor(
    private filePattern: RegExp,
    private validationResult: FileValidationResult | null = null,
    private shouldThrow: boolean = false
  ) {
  }

  validate(filePath: string, content: string, context: ValidationContext): FileValidationResult {
    if (this.shouldThrow) {
      throw new Error('Validation error');
    }

    if (this.validationResult) {
      return this.validationResult;
    }

    return {
      filePath,
      isValid: true,
      issues: []
    };
  }

  canValidate(filePath: string): boolean {
    return this.filePattern.test(filePath);
  }
}

describe('Linter', () => {
  let linter: Linter;
  let fileSystemHandler: jest.Mocked<FileSystemHandler>;
  let validatorRegistry: jest.Mocked<ValidatorRegistry>;
  let config: LinterConfig;

  beforeEach(() => {
    fileSystemHandler = new FileSystemHandler() as jest.Mocked<FileSystemHandler>;
    validatorRegistry = new ValidatorRegistry() as jest.Mocked<ValidatorRegistry>;
    config = {rootDir: '/test'};

    linter = new Linter(validatorRegistry, fileSystemHandler, config);
  });

  describe('lint', () => {
    it('should detect missing required files', async () => {
      // FIXME component.md is not a required file
      (fileSystemHandler.checkRequiredFiles as jest.Mock).mockResolvedValue(['spec.json', 'component.md']);

      const result = await linter.lint('/test');

      expect(result.isValid).toBe(false);
      expect(result.errorCount).toBe(2);
      expect(result.warningCount).toBe(0);
      expect(result.fileResults).toHaveLength(2);
      expect(result.fileResults[0].issues[0].code).toBe('base/missing-required-file');
      expect(result.fileResults[1].issues[0].code).toBe('base/missing-required-file');
    });

    it('should validate all discovered files', async () => {
      // Mock checkRequiredFiles to return no missing files
      (fileSystemHandler.checkRequiredFiles as jest.Mock).mockResolvedValue([]);

      // Mock discoverSpecFiles to return file paths
      (fileSystemHandler.discoverSpecFiles as jest.Mock).mockResolvedValue({
        specJson: '/test/spec.json',
        datamodelJson: '/test/datamodel.json'
      });

      // Mock readFile to return file contents
      (fileSystemHandler.readFile as jest.Mock).mockImplementation(async (filePath: string) => {
        if (filePath.endsWith('.json')) {
          return '{"name": "test"}';
        } else {
          return 'test content';
        }
      });

      // Create mock validators
      const specJsonValidator = new MockValidator(/spec\.json$/);
      const datamodelJsonValidator = new MockValidator(/datamodel\.json$/);

      // Mock getValidatorForFile to return appropriate validator
      (validatorRegistry.getValidatorForFile as jest.Mock).mockImplementation((filePath: string) => {
        if (filePath.endsWith('spec.json')) {
          return specJsonValidator;
        } else if (filePath.endsWith('datamodel.json')) {
          return datamodelJsonValidator;
        }
        return undefined;
      });

      const result = await linter.lint('/test');

      expect(result.isValid).toBe(true);
      expect(result.errorCount).toBe(0);
      expect(result.warningCount).toBe(0);
      expect(result.fileResults).toHaveLength(2);
      expect(validatorRegistry.getValidatorForFile).toHaveBeenCalledTimes(2);
    });

    it('should handle validation errors', async () => {
      // Mock checkRequiredFiles to return no missing files
      (fileSystemHandler.checkRequiredFiles as jest.Mock).mockResolvedValue([]);

      // Mock discoverSpecFiles to return file paths
      (fileSystemHandler.discoverSpecFiles as jest.Mock).mockResolvedValue({
        specJson: '/test/spec.json',
        datamodelJson: undefined
      });

      // Mock readFile to return file contents
      (fileSystemHandler.readFile as jest.Mock).mockImplementation(async (filePath: string) => {
        if (filePath.endsWith('.json')) {
          return '{"name": "test"}';
        } else {
          return 'test content';
        }
      });

      // Create mock validators with validation issues
      const specJsonValidator = new MockValidator(/spec\.json$/, {
        filePath: '/test/spec.json',
        isValid: false,
        issues: [
          {
            severity: 'error',
            message: 'Missing required field',
            filePath: '/test/spec.json',
            code: 'base/missing-required-field'
          },
          {
            severity: 'warning',
            message: 'Warning message',
            filePath: '/test/spec.json',
            code: 'spec-json/warning'
          }
        ]
      });

      // Mock getValidatorForFile to return appropriate validator
      validatorRegistry.getValidatorForFile.mockImplementation((filePath: string) => {
        if (filePath.endsWith('spec.json')) {
          return specJsonValidator;
        }
        return undefined;
      });

      const result = await linter.lint('/test');

      expect(result.isValid).toBe(false);
      expect(result.errorCount).toBe(1);
      expect(result.warningCount).toBe(1);
      expect(result.fileResults).toHaveLength(1);
    });

    it('should handle file reading errors', async () => {
      // Mock checkRequiredFiles to return no missing files
      (fileSystemHandler.checkRequiredFiles as jest.Mock).mockResolvedValue([]);

      // Mock discoverSpecFiles to return file paths
      (fileSystemHandler.discoverSpecFiles as jest.Mock).mockResolvedValue({
        specJson: '/test/spec.json',
        datamodelJson: undefined
      });

      // Mock readFile to throw an error
      (fileSystemHandler.readFile as jest.Mock).mockRejectedValue(new Error('File read error'));

      // Create mock validator
      const specJsonValidator = new MockValidator(/spec\.json$/);

      // Mock getValidatorForFile to return appropriate validator
      (validatorRegistry.getValidatorForFile as jest.Mock).mockReturnValue(specJsonValidator);

      const result = await linter.lint('/test');

      expect(result.isValid).toBe(false);
      expect(result.errorCount).toBe(1);
      expect(result.warningCount).toBe(0);
      expect(result.fileResults).toHaveLength(1);
      expect(result.fileResults[0].issues[0].code).toBe('base/file-read-error');
    });

    it('should handle invalid JSON in context files', async () => {
      // Mock checkRequiredFiles to return no missing files
      fileSystemHandler.checkRequiredFiles.mockResolvedValue([]);

      // Mock discoverSpecFiles to return file paths
      fileSystemHandler.discoverSpecFiles.mockResolvedValue({
        specJson: '/test/spec.json',
        datamodelJson: '/test/datamodel.json'
      });

      // Mock readFile to return invalid JSON
      fileSystemHandler.readFile.mockImplementation(async (filePath: string) => {
        if (filePath.endsWith('spec.json')) {
          return 'invalid json';
        } else if (filePath.endsWith('datamodel.json')) {
          return 'also invalid';
        }
        return '';
      });

      // Create mock validators
      const specJsonValidator = new MockValidator(/spec\.json$/, {
        filePath: '/test/spec.json',
        isValid: false,
        issues: [
          {
            severity: 'error',
            message: 'Invalid JSON syntax',
            filePath: '/test/spec.json',
            code: 'spec-json/invalid-json-syntax'
          }
        ]
      });

      const datamodelJsonValidator = new MockValidator(/datamodel\.json$/, {
        filePath: '/test/datamodel.json',
        isValid: false,
        issues: [
          {
            severity: 'error',
            message: 'Invalid JSON syntax',
            filePath: '/test/datamodel.json',
            code: 'datamodel-json/invalid-json-syntax'
          }
        ]
      });

      // Mock getValidatorForFile to return appropriate validator
      validatorRegistry.getValidatorForFile.mockImplementation((filePath: string) => {
        if (filePath.endsWith('spec.json')) {
          return specJsonValidator;
        } else if (filePath.endsWith('datamodel.json')) {
          return datamodelJsonValidator;
        }
        return undefined;
      });

      const result = await linter.lint('/test');

      expect(result.isValid).toBe(false);
      expect(result.errorCount).toBe(2);
      expect(result.warningCount).toBe(0);
      expect(result.fileResults).toHaveLength(2);
    });
  });
});