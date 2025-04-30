import path from 'path';
import {FileSystemHandler} from './fileSystemHandler';
import {ValidatorRegistry} from './validatorRegistry';
import {ConfigManager} from './config';
import {FileValidationResult, LinterConfig, ValidationContext, ValidationIssue, ValidationResult} from '../types';
import {formatErrorMessage} from '../utils/errorCodes';
import {ValidatorFactory} from '../validators';

/**
 * Core linter that coordinates the validation process
 */
export class Linter {
  private fileSystemHandler: FileSystemHandler;
  private validatorRegistry: ValidatorRegistry;
  private config: LinterConfig;

  /**
   * Creates a new Linter instance
   * @param validatorRegistry Registry of validators to use
   * @param fileSystemHandler Handler for file system operations
   * @param config Linter configuration
   */
  constructor(
    validatorRegistry: ValidatorRegistry,
    fileSystemHandler: FileSystemHandler,
    config: LinterConfig
  ) {
    this.validatorRegistry = validatorRegistry;
    this.fileSystemHandler = fileSystemHandler;
    this.config = config;

    // Pass configuration to validator registry
    this.validatorRegistry.setConfig(config);
  }

  /**
   * Creates a new Linter instance with configuration loaded from a file
   * @param validatorRegistry Registry of validators to use
   * @param fileSystemHandler Handler for file system operations
   * @param configPath Path to the configuration file (optional)
   * @param rootDir Root directory for linting (optional)
   * @param cliOptions Command line options (optional)
   * @returns A new Linter instance
   */
  static async create(
    validatorRegistry: ValidatorRegistry,
    fileSystemHandler: FileSystemHandler,
    configPath?: string,
    rootDir?: string,
    cliOptions?: Partial<LinterConfig>
  ): Promise<Linter> {
    const config = await ConfigManager.loadConfig(configPath, rootDir, cliOptions);

    // Create validators based on configuration
    validatorRegistry.clearValidators();
    validatorRegistry.registerValidators(ValidatorFactory.createValidators(config));

    return new Linter(validatorRegistry, fileSystemHandler, config);
  }

  /**
   * Lints a directory containing Specky specifications
   * @param directoryPath Path to the directory to lint
   * @returns Validation result
   */
  async lint(directoryPath: string): Promise<ValidationResult> {
    const absolutePath = path.resolve(directoryPath);

    // Check if required files exist
    const missingFiles = await this.fileSystemHandler.checkRequiredFiles(absolutePath, this.config);
    if (missingFiles.length > 0) {
      return this.createMissingFilesResult(absolutePath, missingFiles);
    }

    // Discover specification files
    const specFiles = await this.fileSystemHandler.discoverSpecFiles(absolutePath);

    // Create validation context
    const context: ValidationContext = {
      rootDir: absolutePath
    };

    // Load context files
    if (specFiles.specJson) {
      try {
        const content = await this.fileSystemHandler.readFile(specFiles.specJson);
        try {
          context.specJson = JSON.parse(content);
        } catch (error) {
          // Invalid JSON will be caught by the validator
        }
      } catch (error) {
        // File reading errors will be caught during validation
      }
    }

    if (specFiles.datamodelJson) {
      try {
        const content = await this.fileSystemHandler.readFile(specFiles.datamodelJson);
        try {
          context.datamodelJson = JSON.parse(content);
        } catch (error) {
          // Invalid JSON will be caught by the validator
        }
      } catch (error) {
        // File reading errors will be caught during validation
      }
    }

    // Validate each file
    const fileResults: FileValidationResult[] = [];

    // Validate spec.json
    if (specFiles.specJson && this.config.fileValidation?.['spec.json'] !== false) {
      const result = await this.validateFile(specFiles.specJson, context);
      if (result) {
        fileResults.push(result);
      }
    }

    // Validate datamodel.json
    if (specFiles.datamodelJson && this.config.fileValidation?.['datamodel.json'] !== false) {
      const result = await this.validateFile(specFiles.datamodelJson, context);
      if (result) {
        fileResults.push(result);
      }
    }

    // Aggregate results
    return this.aggregateResults(fileResults);
  }

  /**
   * Validates a single file
   * @param filePath Path to the file to validate
   * @param context Validation context
   * @returns Validation result for the file
   */
  private async validateFile(
    filePath: string,
    context: ValidationContext
  ): Promise<FileValidationResult | null> {
    const validator = this.validatorRegistry.getValidatorForFile(filePath);

    if (!validator) {
      return null;
    }

    try {
      const content = await this.fileSystemHandler.readFile(filePath);
      return validator.validate(filePath, content, context);
    } catch (error) {
      // Handle file reading errors
      const issue: ValidationIssue = {
        severity: 'error',
        message: formatErrorMessage(
          `Failed to read file: ${error instanceof Error ? error.message : String(error)}`,
          'base/file-read-error'
        ),
        filePath,
        code: 'base/file-read-error'
      };

      return {
        filePath,
        isValid: false,
        issues: [issue]
      };
    }
  }

  /**
   * Creates a validation result for missing required files
   * @param directoryPath Path to the directory
   * @param missingFiles Array of missing file names
   * @returns Validation result
   */
  private createMissingFilesResult(
    directoryPath: string,
    missingFiles: string[]
  ): ValidationResult {
    const fileResults: FileValidationResult[] = missingFiles.map(fileName => {
      const filePath = path.join(directoryPath, fileName);
      const issue: ValidationIssue = {
        severity: 'error',
        message: formatErrorMessage(
          `Required file '${fileName}' is missing`,
          'base/missing-required-file'
        ),
        filePath,
        code: 'base/missing-required-file'
      };

      return {
        filePath,
        isValid: false,
        issues: [issue]
      };
    });

    return this.aggregateResults(fileResults);
  }

  /**
   * Aggregates file validation results into an overall validation result
   * @param fileResults Array of file validation results
   * @returns Aggregated validation result
   */
  private aggregateResults(fileResults: FileValidationResult[]): ValidationResult {
    let errorCount = 0;
    let warningCount = 0;

    // Count errors and warnings
    for (const fileResult of fileResults) {
      for (const issue of fileResult.issues) {
        if (issue.severity === 'error') {
          errorCount++;
        } else {
          warningCount++;
        }
      }
    }

    // Determine overall validity (valid if no errors)
    const isValid = errorCount === 0;

    return {
      isValid,
      fileResults,
      errorCount,
      warningCount
    };
  }
}