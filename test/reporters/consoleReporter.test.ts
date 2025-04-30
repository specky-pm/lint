import {ConsoleReporter} from '../../src/reporters/consoleReporter';
import {FileValidationResult, ValidationIssue, ValidationResult} from '../../src/types';

// Mock chalk to avoid ANSI color codes in test output
jest.mock('chalk', () => ({
  red: (text: string) => text,
  yellow: (text: string) => text,
  green: (text: string) => text,
  blue: (text: string) => text
}));

describe('ConsoleReporter', () => {
  let reporter: ConsoleReporter;

  beforeEach(() => {
    reporter = new ConsoleReporter();
  });

  describe('formatIssue', () => {
    it('should format an error issue correctly', () => {
      const issue: ValidationIssue = {
        severity: 'error',
        message: 'Missing required field',
        filePath: 'spec.json',
        line: 10,
        column: 5,
        code: 'base/missing-required-field'
      };

      const formatted = reporter.formatIssue(issue);

      expect(formatted).toBe('[ERROR] spec.json:10:5 - Missing required field (base/missing-required-field)');
    });

    it('should format a warning issue correctly', () => {
      const issue: ValidationIssue = {
        severity: 'warning',
        message: 'Recommended section missing',
        filePath: 'component.md',
        line: 25,
        code: 'component-md/missing-recommended-section'
      };

      const formatted = reporter.formatIssue(issue);

      expect(formatted).toBe('[WARNING] component.md:25 - Recommended section missing (component-md/missing-recommended-section)');
    });

    it('should include suggestion when available', () => {
      const issue: ValidationIssue = {
        severity: 'error',
        message: 'Missing required field',
        filePath: 'spec.json',
        line: 10,
        column: 5,
        code: 'base/missing-required-field',
        suggestion: 'Add a description field'
      };

      const formatted = reporter.formatIssue(issue);

      expect(formatted).toContain('[ERROR] spec.json:10:5 - Missing required field (base/missing-required-field)');
      expect(formatted).toContain('Suggestion: Add a description field');
    });

    it('should skip warnings in quiet mode', () => {
      const quietReporter = new ConsoleReporter({quiet: true});
      const issue: ValidationIssue = {
        severity: 'warning',
        message: 'Recommended section missing',
        filePath: 'component.md',
        line: 25,
        code: 'component-md/missing-recommended-section'
      };

      const formatted = quietReporter.formatIssue(issue);

      expect(formatted).toBe('');
    });
  });

  describe('formatFileResult', () => {
    it('should format file result with multiple issues', () => {
      const fileResult: FileValidationResult = {
        filePath: 'spec.json',
        isValid: false,
        issues: [
          {
            severity: 'error',
            message: 'Missing required field',
            filePath: 'spec.json',
            line: 10,
            column: 5,
            code: 'base/missing-required-field'
          },
          {
            severity: 'warning',
            message: 'Optional field missing',
            filePath: 'spec.json',
            line: 15,
            code: 'base/missing-optional-field'
          }
        ]
      };

      const formatted = reporter.formatFileResult(fileResult);

      expect(formatted).toContain('[ERROR] spec.json:10:5 - Missing required field (base/missing-required-field)');
      expect(formatted).toContain('[WARNING] spec.json:15 - Optional field missing (base/missing-optional-field)');
    });

    it('should return empty string for file with no issues', () => {
      const fileResult: FileValidationResult = {
        filePath: 'spec.json',
        isValid: true,
        issues: []
      };

      const formatted = reporter.formatFileResult(fileResult);

      expect(formatted).toBe('');
    });
  });

  describe('generateSummary', () => {
    it('should generate summary with errors and warnings', () => {
      const result: ValidationResult = {
        isValid: false,
        fileResults: [],
        errorCount: 2,
        warningCount: 3
      };

      const summary = reporter.generateSummary(result);

      expect(summary).toBe('Found 2 errors and 3 warnings');
    });

    it('should generate summary with only errors', () => {
      const result: ValidationResult = {
        isValid: false,
        fileResults: [],
        errorCount: 1,
        warningCount: 0
      };

      const summary = reporter.generateSummary(result);

      expect(summary).toBe('Found 1 error');
    });

    it('should generate summary with only warnings', () => {
      const result: ValidationResult = {
        isValid: true,
        fileResults: [],
        errorCount: 0,
        warningCount: 1
      };

      const summary = reporter.generateSummary(result);

      expect(summary).toBe('Found 1 warning');
    });

    it('should generate success message when no issues', () => {
      const result: ValidationResult = {
        isValid: true,
        fileResults: [],
        errorCount: 0,
        warningCount: 0
      };

      const summary = reporter.generateSummary(result);

      expect(summary).toBe('All files passed validation!');
    });

    it('should skip summary in quiet mode if only warnings', () => {
      const quietReporter = new ConsoleReporter({quiet: true});
      const result: ValidationResult = {
        isValid: true,
        fileResults: [],
        errorCount: 0,
        warningCount: 5
      };

      const summary = quietReporter.generateSummary(result);

      expect(summary).toBe('');
    });
  });

  describe('formatResult', () => {
    it('should format complete validation result', () => {
      const result: ValidationResult = {
        isValid: false,
        fileResults: [
          {
            filePath: 'spec.json',
            isValid: false,
            issues: [
              {
                severity: 'error',
                message: 'Missing required field',
                filePath: 'spec.json',
                line: 10,
                code: 'base/missing-required-field'
              }
            ]
          },
          {
            filePath: 'component.md',
            isValid: false,
            issues: [
              {
                severity: 'warning',
                message: 'Recommended section missing',
                filePath: 'component.md',
                line: 25,
                code: 'component-md/missing-recommended-section'
              }
            ]
          }
        ],
        errorCount: 1,
        warningCount: 1
      };

      const formatted = reporter.formatResult(result);

      expect(formatted).toContain('[ERROR] spec.json:10 - Missing required field (base/missing-required-field)');
      expect(formatted).toContain('[WARNING] component.md:25 - Recommended section missing (component-md/missing-recommended-section)');
      expect(formatted).toContain('Found 1 error and 1 warning');
    });
  });
});