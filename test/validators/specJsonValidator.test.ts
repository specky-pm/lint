import path from 'path';
import fs from 'fs-extra';
import {SpecJsonValidator} from '../../src/validators/specJsonValidator';
import {ValidationContext} from '../../src/types';

describe('SpecJsonValidator', () => {
  let validator: SpecJsonValidator;
  let validationContext: ValidationContext;

  beforeEach(() => {
    validator = new SpecJsonValidator();
    validationContext = {
      rootDir: path.resolve(__dirname, '../fixtures')
    };
  });

  describe('canValidate', () => {
    it('should return true for spec.json files', () => {
      expect(validator.canValidate('spec.json')).toBe(true);
      expect(validator.canValidate('/path/to/spec.json')).toBe(true);
    });

    it('should return false for non-spec.json files', () => {
      expect(validator.canValidate('other.json')).toBe(false);
      expect(validator.canValidate('spec.txt')).toBe(false);
      expect(validator.canValidate('/path/to/component.md')).toBe(false);
    });
  });

  describe('validate', () => {
    it('should validate a valid spec.json file', async () => {
      const filePath = path.resolve(__dirname, '../fixtures/valid/spec.json');
      const content = await fs.readFile(filePath, 'utf8');

      const result = validator.validate(filePath, content, validationContext);

      expect(result.isValid).toBe(true);
      expect(result.issues.length).toBe(0);
    });

    it('should detect invalid JSON syntax', () => {
      const filePath = 'spec.json';
      const content = '{ "name": "test", "version": "1.0.0", invalid json }';

      const result = validator.validate(filePath, content, validationContext);

      expect(result.isValid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0].code).toBe('spec-json/invalid-json-syntax');
    });

    it('should detect missing required fields', async () => {
      const filePath = path.resolve(__dirname, '../fixtures/invalid/spec-missing-required.json');
      const content = await fs.readFile(filePath, 'utf8');

      const result = validator.validate(filePath, content, validationContext);

      expect(result.isValid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0].code).toBe('spec-json/missing-field-version');
      expect(result.issues[0].message).toContain('version');
    });

    it('should detect invalid version format', async () => {
      const filePath = path.resolve(__dirname, '../fixtures/invalid/spec-invalid-version.json');
      const content = await fs.readFile(filePath, 'utf8');

      const result = validator.validate(filePath, content, validationContext);

      expect(result.isValid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0].code).toBe('spec-json/invalid-field-version');
    });

    it('should validate cross-file consistency when component.md is available', async () => {
      const filePath = path.resolve(__dirname, '../fixtures/valid/spec.json');
      const content = await fs.readFile(filePath, 'utf8');

      // Create context with component.md content
      const componentMdPath = path.resolve(__dirname, '../fixtures/valid/component.md');
      const componentMdContent = await fs.readFile(componentMdPath, 'utf8');

      const contextWithComponentMd: ValidationContext = {
        ...validationContext,
        componentMd: componentMdContent
      };

      const result = validator.validate(filePath, content, contextWithComponentMd);

      // Should still be valid since the component name is consistent
      expect(result.isValid).toBe(true);
    });

    // New tests for optional fields validation
    describe('optional fields validation', () => {
      it('should validate author field format', () => {
        const filePath = 'spec.json';
        const validAuthorString = '{ "name": "test-component", "version": "1.0.0", "description": "Test", "author": "John Doe" }';
        const validAuthorObject = '{ "name": "test-component", "version": "1.0.0", "description": "Test", "author": { "name": "John Doe", "email": "john@example.com", "url": "https://example.com" } }';
        const invalidAuthorObject = '{ "name": "test-component", "version": "1.0.0", "description": "Test", "author": { "email": "invalid-email", "url": "invalid-url" } }';

        // Valid author string
        let result = validator.validate(filePath, validAuthorString, validationContext);
        expect(result.isValid).toBe(true);

        // Valid author object
        result = validator.validate(filePath, validAuthorObject, validationContext);
        expect(result.isValid).toBe(true);

        // Invalid author object
        result = validator.validate(filePath, invalidAuthorObject, validationContext);
        expect(result.issues.some(issue => issue.message.includes('author'))).toBe(true);
      });

      it('should validate license field format', () => {
        const filePath = 'spec.json';
        const validLicense = '{ "name": "test-component", "version": "1.0.0", "description": "Test", "license": "MIT" }';
        const invalidLicense = '{ "name": "test-component", "version": "1.0.0", "description": "Test", "license": "InvalidLicense" }';

        // Valid license
        let result = validator.validate(filePath, validLicense, validationContext);
        expect(result.isValid).toBe(true);

        // Invalid license
        result = validator.validate(filePath, invalidLicense, validationContext);
        expect(result.issues.some(issue => issue.message.includes('license'))).toBe(true);
      });

      it('should validate repository field format', () => {
        const filePath = 'spec.json';
        const validRepositoryString = '{ "name": "test-component", "version": "1.0.0", "description": "Test", "repository": "https://github.com/user/repo.git" }';
        const validRepositoryObject = '{ "name": "test-component", "version": "1.0.0", "description": "Test", "repository": { "type": "git", "url": "https://github.com/user/repo.git" } }';
        const invalidRepositoryObject = '{ "name": "test-component", "version": "1.0.0", "description": "Test", "repository": { "type": "", "url": "invalid-url" } }';

        // Valid repository string
        let result = validator.validate(filePath, validRepositoryString, validationContext);
        expect(result.isValid).toBe(true);

        // Valid repository object
        result = validator.validate(filePath, validRepositoryObject, validationContext);
        expect(result.isValid).toBe(true);

        // Invalid repository object
        result = validator.validate(filePath, invalidRepositoryObject, validationContext);
        expect(result.issues.some(issue => issue.message.includes('repository'))).toBe(true);
      });
    });

    // New tests for dependencies validation
    describe('dependencies validation', () => {
      it('should validate dependencies format', () => {
        const filePath = 'spec.json';
        const validDependencies = '{ "name": "test-component", "version": "1.0.0", "description": "Test", "dependencies": { "dep1": "^1.0.0", "dep2": "~2.0.0" } }';
        const invalidDependenciesFormat = '{ "name": "test-component", "version": "1.0.0", "description": "Test", "dependencies": "not-an-object" }';
        const invalidDependencyVersion = '{ "name": "test-component", "version": "1.0.0", "description": "Test", "dependencies": { "dep1": "" } }';

        // Valid dependencies
        let result = validator.validate(filePath, validDependencies, validationContext);
        expect(result.isValid).toBe(true);

        // Invalid dependencies format
        result = validator.validate(filePath, invalidDependenciesFormat, validationContext);
        expect(result.isValid).toBe(false);
        expect(result.issues.some(issue => issue.code === 'spec-json/invalid-field-dependencies')).toBe(true);

        // Invalid dependency version
        result = validator.validate(filePath, invalidDependencyVersion, validationContext);
        expect(result.issues.some(issue => issue.code === 'spec-json/invalid-field-dependency-version')).toBe(true);
      });

      // not supported yet
      xit('should validate version range formats', () => {
        const filePath = 'spec.json';
        const validVersionRanges = `{
          "name": "test-component",
          "version": "1.0.0",
          "description": "Test",
          "dependencies": {
            "exact": "1.0.0",
            "caret": "^1.0.0",
            "tilde": "~1.0.0",
            "greater": ">1.0.0",
            "greaterEqual": ">=1.0.0",
            "less": "<2.0.0",
            "lessEqual": "<=2.0.0",
            "range": "1.0.0 - 2.0.0",
            "complex": ">=1.0.0 <2.0.0",
            "any": "*",
            "latest": "latest"
          }
        }`;

        const result = validator.validate(filePath, validVersionRanges, validationContext);
        expect(result.isValid).toBe(true);
      });
    });
  });
});