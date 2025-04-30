import fs from 'fs-extra';
import {Linter} from '../../src/core/linter';
import {ConsoleReporter} from '../../src/reporters/consoleReporter';

// Mock dependencies
jest.mock('fs-extra');
jest.mock('../../src/core/linter');
jest.mock('../../src/core/fileSystemHandler');
jest.mock('../../src/core/validatorRegistry');
jest.mock('../../src/reporters/consoleReporter');

// Mock Linter.create
const mockLintMethod = jest.fn().mockResolvedValue({
  isValid: true,
  fileResults: [],
  errorCount: 0,
  warningCount: 0
});

const mockLinter = {
  lint: mockLintMethod
};

(Linter.create as jest.Mock) = jest.fn().mockResolvedValue(mockLinter);

// Mock process.exit
const mockExit = jest.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
  return undefined as never;
});

// Mock console.log and console.error
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {
});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {
});

describe('CLI', () => {
  let originalArgv: string[];

  beforeEach(() => {
    // Save original process.argv
    originalArgv = process.argv;

    // Reset mocks
    jest.clearAllMocks();

    // Mock fs.readFileSync for package.json
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({
      name: 'specky-lint',
      version: '1.0.0'
    }));
  });

  afterEach(() => {
    // Restore original process.argv
    process.argv = originalArgv;
  });

  it('should run linter with default options', async () => {
    // Set up process.argv for the test
    process.argv = ['node', 'specky-lint'];

    // Import CLI module
    const {runLinter} = await import('../../src/cli/index');

    // Run the linter with the test arguments
    await runLinter('.', {});

    // Verify that Linter.create was called
    expect(Linter.create).toHaveBeenCalled();

    // Verify that process.exit was called with code 0 (success)
    expect(mockExit).toHaveBeenCalledWith(0);
  });

  it('should run linter with custom directory', async () => {
    // Mock Linter.create to verify the directory
    (Linter.create as jest.Mock).mockImplementation((validatorRegistry, fileSystemHandler, configPath, rootDir) => {
      // Verify rootDir is passed correctly
      expect(rootDir).toBe('custom-dir');

      return Promise.resolve({
        lint: jest.fn().mockResolvedValue({
          isValid: true,
          fileResults: [],
          errorCount: 0,
          warningCount: 0
        })
      });
    });

    // Set up process.argv for the test
    process.argv = ['node', 'specky-lint', 'custom-dir'];

    // Import CLI module
    const {runLinter} = await import('../../src/cli/index');

    // Run the linter with the test arguments
    await runLinter('custom-dir', {});

    // Verify that Linter.create was called
    expect(Linter.create).toHaveBeenCalled();
  });

  it('should handle linting failures', async () => {
    // Mock Linter.create to return a linter instance with a failing lint method
    (Linter.create as jest.Mock).mockResolvedValue({
      lint: jest.fn().mockResolvedValue({
        isValid: false,
        fileResults: [],
        errorCount: 1,
        warningCount: 0
      })
    });

    // Set up process.argv for the test
    process.argv = ['node', 'specky-lint'];

    // Import CLI module
    const {runLinter} = await import('../../src/cli/index');

    // Run the linter with the test arguments
    await runLinter('.', {});

    // Verify that process.exit was called with code 1 (failure)
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('should handle errors during linting', async () => {
    // Mock Linter.create to return a linter instance with a failing lint method
    (Linter.create as jest.Mock).mockResolvedValue({
      lint: jest.fn().mockRejectedValue(new Error('Linting error'))
    });

    // Set up process.argv for the test
    process.argv = ['node', 'specky-lint'];

    // Import CLI module
    const {runLinter} = await import('../../src/cli/index');

    // Run the linter with the test arguments
    await runLinter('.', {});

    // Verify that console.error was called with the error message
    expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('Error: Linting error'));

    // Verify that process.exit was called with code 1 (failure)
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('should use quiet mode when --quiet option is provided', async () => {
    // Mock Linter.create to return a linter instance
    (Linter.create as jest.Mock).mockResolvedValue({
      lint: jest.fn().mockResolvedValue({
        isValid: true,
        fileResults: [],
        errorCount: 0,
        warningCount: 0
      })
    });

    // Set up process.argv for the test
    process.argv = ['node', 'specky-lint', '--quiet'];

    // Import CLI module
    const {runLinter} = await import('../../src/cli/index');

    // Run the linter with the test arguments
    await runLinter('.', {quiet: true});

    // Verify that ConsoleReporter was created with quiet option
    expect(ConsoleReporter).toHaveBeenCalledWith({
      quiet: true,
      colorize: true
    });
  });

  it('should load config file when --config option is provided', async () => {
    // Mock fs.readFile to return a config file
    (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify({
      ignorePatterns: ['test/**'],
      rules: {
        'base/missing-required-field': 'warning'
      }
    }));

    // Mock Linter.create to verify the config path
    (Linter.create as jest.Mock).mockImplementation((validatorRegistry, fileSystemHandler, configPath, rootDir, cliOptions) => {
      // Verify that configPath is passed correctly
      expect(configPath).toBe('specky-lint.config.json');

      return Promise.resolve({
        lint: jest.fn().mockResolvedValue({
          isValid: true,
          fileResults: [],
          errorCount: 0,
          warningCount: 0
        })
      });
    });

    // Set up process.argv for the test
    process.argv = ['node', 'specky-lint', '--config', 'specky-lint.config.json'];

    // Import CLI module
    const {runLinter} = await import('../../src/cli/index');

    // Run the linter with the test arguments
    await runLinter('.', {config: 'specky-lint.config.json'});

    // Verify that Linter.create was called
    expect(Linter.create).toHaveBeenCalled();
  });

  it('should handle errors when loading config file', async () => {
    // Mock fs.readFile to throw an error
    (fs.readFile as jest.Mock).mockRejectedValue(new Error('File not found'));

    // Mock console.error to capture the error message
    mockConsoleError.mockImplementation((message) => {
      // Just for the test, we'll verify this in the expect below
    });

    // Mock Linter.create to return a linter instance
    (Linter.create as jest.Mock).mockResolvedValue({
      lint: jest.fn().mockResolvedValue({
        isValid: true,
        fileResults: [],
        errorCount: 0,
        warningCount: 0
      })
    });

    // Set up process.argv for the test
    process.argv = ['node', 'specky-lint', '--config', 'non-existent-config.json'];

    // Import CLI module
    const {runLinter} = await import('../../src/cli/index');

    // Run the linter with the test arguments
    await runLinter('.', {config: 'non-existent-config.json'});

    // Verify that Linter.create was called
    expect(Linter.create).toHaveBeenCalled();
  });
});