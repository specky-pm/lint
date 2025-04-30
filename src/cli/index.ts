#!/usr/bin/env node

import {Command} from 'commander';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';

import {Linter} from '../core/linter';
import {FileSystemHandler} from '../core/fileSystemHandler';
import {ValidatorRegistry} from '../core/validatorRegistry';
import {ConsoleReporter} from '../reporters/consoleReporter';
import {createValidators} from '../validators';

// Import the package.json to get the version
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8'));

/**
 * Runs the linter on the specified directory
 * @param directory Directory to lint
 * @param options Command line options
 */
async function runLinter(directory: string, options: any): Promise<void> {
  try {
    console.log(chalk.blue(`Linting Specky specifications in ${directory}...`));

    // Create components
    const fileSystemHandler = new FileSystemHandler();
    const validatorRegistry = new ValidatorRegistry();

    // Register validators
    validatorRegistry.registerValidators(createValidators());

    // Create linter with configuration
    const linter = await Linter.create(
      validatorRegistry,
      fileSystemHandler,
      options.config,
      directory,
      {
        // File validation options
        fileValidation: {
          'spec.json': options.spec !== false,
          'datamodel.json': options.datamodel !== false
        },
        // Convert CLI options to config options
        rules: options.quiet ?
          {
            // In quiet mode, treat warnings as 'off'
            ...Object.fromEntries(
              Object.entries(options.rules || {})
                .filter(([_, value]) => value === 'warning')
                .map(([key]) => [key, 'off'])
            )
          } :
          options.rules
      }
    );

    // Create reporter
    const reporter = new ConsoleReporter({
      quiet: options.quiet,
      colorize: options.noColor !== true
    });

    // Run linter
    const result = await linter.lint(directory);

    // Report results
    const output = reporter.formatResult(result);
    console.log(output);

    // Exit with appropriate code
    process.exit(result.isValid ? 0 : 1);
  } catch (error) {
    console.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
    process.exit(1);
  }
}

// Create a new command instance
const program = new Command();

// Configure the CLI
program
  .name('specky-lint')
  .description('A TypeScript-based linter/validator for Specky specifications')
  .version(packageJson.version)
  .argument('[directory]', 'Directory to lint', '.')
  .option('--quiet', 'Only report errors, not warnings')
  .option('--config <path>', 'Specify a configuration file')
  .option('--no-color', 'Disable colored output')
  .option('--no-spec', 'Disable validation of spec.json')
  .option('--no-datamodel', 'Disable validation of datamodel.json')
  .action(runLinter);

// Only parse arguments if this file is being run directly (not imported in tests)
if (require.main === module) {
  // Parse the command-line arguments
  program.parse(process.argv);
}

// Export for testing
export {program, runLinter};