import chalk from 'chalk';
import {FileValidationResult, ValidationIssue, ValidationResult} from '../types';

/**
 * Reporter that formats validation results for console output
 */
export class ConsoleReporter {
  private quiet: boolean;
  private colorize: boolean;

  /**
   * Creates a new ConsoleReporter
   * @param options Reporter options
   */
  constructor(options: { quiet?: boolean; colorize?: boolean } = {}) {
    this.quiet = options.quiet || false;
    this.colorize = options.colorize !== false; // Default to true
  }

  /**
   * Formats a validation issue for display
   * @param issue The validation issue to format
   * @returns Formatted string representation of the issue
   */
  formatIssue(issue: ValidationIssue): string {
    // Skip warnings in quiet mode
    if (this.quiet && issue.severity === 'warning') {
      return '';
    }

    const severityLabel = issue.severity === 'error' ? 'ERROR' : 'WARNING';
    const severityText = this.colorize
      ? (issue.severity === 'error' ? chalk.red(severityLabel) : chalk.yellow(severityLabel))
      : severityLabel;

    let location = issue.filePath;
    if (issue.line !== undefined) {
      location += `:${issue.line}`;
      if (issue.column !== undefined) {
        location += `:${issue.column}`;
      }
    }

    let message = `[${severityText}] ${location} - ${issue.message} (${issue.code})`;

    if (issue.suggestion) {
      const suggestionLabel = this.colorize ? chalk.blue('Suggestion') : 'Suggestion';
      message += `\n  ${suggestionLabel}: ${issue.suggestion}`;
    }

    return message;
  }

  /**
   * Formats a file validation result for display
   * @param fileResult The file validation result to format
   * @returns Formatted string representation of the file result
   */
  formatFileResult(fileResult: FileValidationResult): string {
    if (fileResult.issues.length === 0) {
      return '';
    }

    const issueMessages = fileResult.issues
      .map(issue => this.formatIssue(issue))
      .filter(message => message !== ''); // Filter out empty messages (from quiet mode)

    if (issueMessages.length === 0) {
      return '';
    }

    return issueMessages.join('\n');
  }

  /**
   * Generates a summary of the validation results
   * @param result The validation result to summarize
   * @returns Formatted summary string
   */
  generateSummary(result: ValidationResult): string {
    // Skip summary in quiet mode if there are only warnings
    if (this.quiet && result.errorCount === 0) {
      return '';
    }

    const errorText = result.errorCount === 1 ? 'error' : 'errors';
    const warningText = result.warningCount === 1 ? 'warning' : 'warnings';

    let summary = '';

    if (result.errorCount > 0 && result.warningCount > 0) {
      const errorCount = this.colorize ? chalk.red(result.errorCount) : result.errorCount;
      const warningCount = this.colorize ? chalk.yellow(result.warningCount) : result.warningCount;
      summary = `Found ${errorCount} ${errorText} and ${warningCount} ${warningText}`;
    } else if (result.errorCount > 0) {
      const errorCount = this.colorize ? chalk.red(result.errorCount) : result.errorCount;
      summary = `Found ${errorCount} ${errorText}`;
    } else if (result.warningCount > 0 && !this.quiet) {
      const warningCount = this.colorize ? chalk.yellow(result.warningCount) : result.warningCount;
      summary = `Found ${warningCount} ${warningText}`;
    } else {
      summary = this.colorize ? chalk.green('All files passed validation!') : 'All files passed validation!';
    }

    return summary;
  }

  /**
   * Formats the entire validation result for display
   * @param result The validation result to format
   * @returns Formatted string representation of the validation result
   */
  formatResult(result: ValidationResult): string {
    const fileResults = result.fileResults
      .map(fileResult => this.formatFileResult(fileResult))
      .filter(message => message !== '') // Filter out empty messages
      .join('\n\n');

    const summary = this.generateSummary(result);

    if (fileResults && summary) {
      return `${fileResults}\n\n${summary}`;
    } else if (fileResults) {
      return fileResults;
    } else if (summary) {
      return summary;
    } else {
      return this.colorize ? chalk.green('All files passed validation!') : 'All files passed validation!';
    }
  }
}