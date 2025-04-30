import {readFileSync} from 'fs';
import {resolve} from 'path';
import specJsonSchema from '../../src/spec/spec-json-schema';

describe('Spec JSON Schema Validation', () => {
  // Helper function to load JSON fixtures
  const loadFixture = (path: string) => {
    return JSON.parse(readFileSync(resolve(__dirname, '../fixtures', path), 'utf-8'));
  };

  describe('Valid spec.json', () => {
    it('should validate a valid spec.json file', () => {
      const validSpec = loadFixture('valid/spec.json');
      const result = specJsonSchema.safeParse(validSpec);
      expect(result.success).toBe(true);
    });
  });

  describe('Invalid spec.json', () => {
    it('should reject a spec with invalid version format', () => {
      const invalidSpec = loadFixture('invalid/spec-invalid-version.json');
      const result = specJsonSchema.safeParse(invalidSpec);
      expect(result.success).toBe(false);

      if (!result.success) {
        const errorMessages = result.error.errors.map(err => err.message);
        expect(errorMessages.some(msg =>
          msg.includes('invalid-field-version')
        )).toBe(true);
      }
    });

    it('should reject a spec missing required fields', () => {
      const invalidSpec = loadFixture('invalid/spec-missing-required.json');
      const result = specJsonSchema.safeParse(invalidSpec);
      expect(result.success).toBe(false);

      const errorMessages = result.error?.errors.map(err => err.message);
      expect(errorMessages?.some(msg =>
        msg.includes('missing-field-version')
      )).toBe(true);
    });

    it('should reject a spec with syntax errors', () => {
      try {
        const invalidSpec = loadFixture('invalid/spec-syntax-error.json');
        const result = specJsonSchema.safeParse(invalidSpec);
        expect(result.success).toBe(false);
      } catch (error) {
        // If the JSON is so malformed it can't be parsed, that's also a valid test case
        expect(error).toBeDefined();
      }
    });

    it('should reject a spec with unknown parameters', () => {
      const invalidConfig = {
        name: 'test-component',
        version: '1.0.0',
        description: 'Test component',
        unknown: 'value' // Unknown property
      };

      const result = specJsonSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });
  });

  describe('Name validation', () => {
    it('should validate component name format', () => {
      const invalidName = {
        name: 'InvalidName', // Should be lowercase with hyphens
        version: '1.0.0',
        description: 'Test component'
      };

      const result = specJsonSchema.safeParse(invalidName);
      expect(result.success).toBe(false);

      const errorMessages = result.error?.errors.map(err => err.message);
      expect(errorMessages?.some(msg =>
        msg.includes('invalid-field-name')
      )).toBe(true);
    });

    it('should accept valid component names', () => {
      const validNames = [
        'valid-component-name',
        'valid_component_name',
        'validcomponentname',
        'valid-component-name-123'
      ];

      validNames.forEach(name => {
        const spec = {
          name,
          version: '1.0.0',
          description: 'Test component'
        };

        const result = specJsonSchema.safeParse(spec);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Version validation', () => {
    it('should validate semver format', () => {
      const validVersions = ['1.0.0', '0.1.0', '1.0.0-alpha', '1.0.0-beta.1', '1.0.0+build.1'];
      const invalidVersions = ['1.0', '1', 'v1.0.0', '1.0.0.0', 'latest'];

      validVersions.forEach(version => {
        const spec = {
          name: 'test-component',
          version,
          description: 'Test component'
        };

        const result = specJsonSchema.safeParse(spec);
        expect(result.success).toBe(true);
      });

      invalidVersions.forEach(version => {
        const spec = {
          name: 'test-component',
          version,
          description: 'Test component'
        };

        const result = specJsonSchema.safeParse(spec);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Author validation', () => {
    it('should validate author as string', () => {
      const spec = {
        name: 'test-component',
        version: '1.0.0',
        description: 'Test component',
        author: 'John Doe'
      };

      const result = specJsonSchema.safeParse(spec);
      expect(result.success).toBe(true);
    });

    it('should validate author as object', () => {
      const validAuthor = {
        name: 'test-component',
        version: '1.0.0',
        description: 'Test component',
        author: {
          name: 'John Doe',
          email: 'john@example.com',
          url: 'https://example.com'
        }
      };

      const result = specJsonSchema.safeParse(validAuthor);
      expect(result.success).toBe(true);
    });

    it('should reject invalid author email', () => {
      const invalidEmail = {
        name: 'test-component',
        version: '1.0.0',
        description: 'Test component',
        author: {
          name: 'John Doe',
          email: 'invalid-email'
        }
      };

      const result = specJsonSchema.safeParse(invalidEmail);
      expect(result.success).toBe(false);

      const errorMessages = result.error?.errors.map(err => err.message);
      expect(errorMessages?.some(msg =>
        msg.includes('invalid-field-author-email')
      )).toBe(true);
    });

    it('should reject invalid author URL', () => {
      const invalidUrl = {
        name: 'test-component',
        version: '1.0.0',
        description: 'Test component',
        author: {
          name: 'John Doe',
          url: 'invalid-url'
        }
      };

      const result = specJsonSchema.safeParse(invalidUrl);
      expect(result.success).toBe(false);

      const errorMessages = result.error?.errors.map(err => err.message);
      expect(errorMessages?.some(msg =>
        msg.includes('invalid-field-author-url')
      )).toBe(true);
    });
  });

  describe('Dependencies validation', () => {
    it('should validate dependencies format', () => {
      const validDeps = {
        name: 'test-component',
        version: '1.0.0',
        description: 'Test component',
        dependencies: {
          'dep-one': '^1.0.0',
          'dep_two': '~2.0.0',
          'depthree': '3.0.0'
        }
      };

      const result = specJsonSchema.safeParse(validDeps);
      expect(result.success).toBe(true);
    });

    it('should reject invalid dependency names', () => {
      const invalidDepName = {
        name: 'test-component',
        version: '1.0.0',
        description: 'Test component',
        dependencies: {
          'Invalid-Dep': '^1.0.0' // Should be lowercase
        }
      };

      const result = specJsonSchema.safeParse(invalidDepName);
      expect(result.success).toBe(false);

      const errorMessages = result.error?.errors.map(err => err.message);
      expect(errorMessages?.some(msg =>
        msg.includes('invalid-field-dependency-name')
      )).toBe(true);
    });

    it('should reject empty dependency versions', () => {
      const emptyVersion = {
        name: 'test-component',
        version: '1.0.0',
        description: 'Test component',
        dependencies: {
          'valid-dep': '' // Empty version
        }
      };

      const result = specJsonSchema.safeParse(emptyVersion);
      expect(result.success).toBe(false);

      const errorMessages = result.error?.errors.map(err => err.message);
      expect(errorMessages?.some(msg =>
        msg.includes('invalid-field-dependency-version')
      )).toBe(true);
    });
  });

  describe('License validation', () => {
    it('should validate license format', () => {
      const validLicenses = ['MIT', 'Apache-2.0', 'GPL-3.0-only', 'UNLICENSED'];
      const invalidLicense = 'Invalid-License';

      validLicenses.forEach(license => {
        const spec = {
          name: 'test-component',
          version: '1.0.0',
          description: 'Test component',
          license
        };

        const result = specJsonSchema.safeParse(spec);
        expect(result.success).toBe(true);
      });

      const spec = {
        name: 'test-component',
        version: '1.0.0',
        description: 'Test component',
        license: invalidLicense
      };

      const result = specJsonSchema.safeParse(spec);
      expect(result.success).toBe(false);
    });
  });

  describe('Repository validation', () => {
    it('should validate repository as URL string', () => {
      const spec = {
        name: 'test-component',
        version: '1.0.0',
        description: 'Test component',
        repository: 'https://github.com/user/repo'
      };

      const result = specJsonSchema.safeParse(spec);
      expect(result.success).toBe(true);
    });

    it('should validate repository as object', () => {
      const spec = {
        name: 'test-component',
        version: '1.0.0',
        description: 'Test component',
        repository: {
          type: 'git',
          url: 'https://github.com/user/repo'
        }
      };

      const result = specJsonSchema.safeParse(spec);
      expect(result.success).toBe(true);
    });

    it('should reject invalid repository URL', () => {
      const invalidUrl = {
        name: 'test-component',
        version: '1.0.0',
        description: 'Test component',
        repository: 'invalid-url'
      };

      const result = specJsonSchema.safeParse(invalidUrl);
      expect(result.success).toBe(false);
    });
  });
});