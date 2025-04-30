import path from 'path';
import fs from 'fs-extra';
import {DatamodelJsonValidator} from '../../src/validators/datamodelJsonValidator';
import {ValidationContext} from '../../src/types';

describe('DatamodelJsonValidator', () => {
  let validator: DatamodelJsonValidator;
  let validationContext: ValidationContext;

  beforeEach(() => {
    validator = new DatamodelJsonValidator();
    validationContext = {
      rootDir: path.resolve(__dirname, '../fixtures')
    };
  });

  describe('canValidate', () => {
    it('should return true for datamodel.json files', () => {
      expect(validator.canValidate('datamodel.json')).toBe(true);
      expect(validator.canValidate('/path/to/datamodel.json')).toBe(true);
    });

    it('should return false for non-datamodel.json files', () => {
      expect(validator.canValidate('other.json')).toBe(false);
      expect(validator.canValidate('datamodel.txt')).toBe(false);
      expect(validator.canValidate('/path/to/spec.json')).toBe(false);
    });
  });

  describe('validate', () => {
    it('should validate a valid datamodel.json file', async () => {
      const filePath = path.resolve(__dirname, '../fixtures/valid/datamodel.json');
      const content = await fs.readFile(filePath, 'utf8');

      const result = validator.validate(filePath, content, validationContext);

      expect(result.isValid).toBe(true);
      expect(result.issues.filter(issue => issue.severity === 'error').length).toBe(0);
    });

    it('should detect invalid JSON syntax', () => {
      const filePath = 'datamodel.json';
      const content = '{ "entities": [ { "name": "User", invalid json }';

      const result = validator.validate(filePath, content, validationContext);

      expect(result.isValid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0].code).toBe('datamodel-json/invalid-json-syntax');
    });

    it('should detect missing entities array', () => {
      const filePath = 'datamodel.json';
      const content = '{ "notEntities": [] }';

      const result = validator.validate(filePath, content, validationContext);

      expect(result.isValid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0].code).toBe('datamodel-json/invalid-datamodel-structure');
      expect(result.issues[0].message).toContain('entities');
    });

    it('should detect invalid entities format', () => {
      const filePath = 'datamodel.json';
      const content = '{ "entities": "not an array" }';

      const result = validator.validate(filePath, content, validationContext);

      expect(result.isValid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0].code).toBe('datamodel-json/invalid-datamodel-structure');
    });

    describe('entity validation', () => {
      it('should detect invalid entity format', () => {
        const filePath = 'datamodel.json';
        const content = '{ "entities": [ "not an object" ] }';

        const result = validator.validate(filePath, content, validationContext);

        expect(result.isValid).toBe(false);
        expect(result.issues.some(issue => issue.code === 'datamodel-json/invalid-entity-object')).toBe(true);
      });

      it('should detect missing entity name', () => {
        const filePath = 'datamodel.json';
        const content = '{ "entities": [ { "attributes": [ {"name": "name", "type": "string", "description": "desc"} ] } ] }';

        const result = validator.validate(filePath, content, validationContext);

        expect(result.isValid).toBe(false);
        expect(result.issues.some(issue => issue.code === 'datamodel-json/missing-entity-name')).toBe(true);
      });

      it('should detect missing attributes array', () => {
        const filePath = 'datamodel.json';
        const content = '{ "entities": [ { "name": "User" } ] }';

        const result = validator.validate(filePath, content, validationContext);

        expect(result.isValid).toBe(false);
        expect(result.issues.some(issue => issue.code === 'datamodel-json/missing-entity-attributes')).toBe(true);
      });

      // FIXME: test not implemented
      it('should warn about empty attributes array', () => {
        const filePath = 'datamodel.json';
        const content = '{ "entities": [ { "name": "User", "attributes": [] } ] }';

        const result = validator.validate(filePath, content, validationContext);

        expect(result.isValid).toBe(false);
        expect(result.issues.some(issue => issue.code === 'datamodel-json/invalid-field-entity-attributes')).toBe(true);
      });
    });

    describe('attribute validation', () => {
      it('should detect invalid attribute format', () => {
        const filePath = 'datamodel.json';
        const content = '{ "entities": [ { "name": "User", "attributes": [ "not an object" ] } ] }';

        const result = validator.validate(filePath, content, validationContext);

        expect(result.isValid).toBe(false);
        expect(result.issues.some(issue => issue.code === 'datamodel-json/invalid-attribute-object')).toBe(true);
      });

      it('should detect missing required attribute fields', () => {
        const filePath = 'datamodel.json';
        const content = '{ "entities": [ { "name": "User", "attributes": [ { "name": "id" } ] } ] }';

        const result = validator.validate(filePath, content, validationContext);

        expect(result.isValid).toBe(false);
        expect(result.issues.some(issue => issue.code === 'datamodel-json/missing-field-attribute-type')).toBe(true);
        expect(result.issues.some(issue => issue.code === 'datamodel-json/missing-field-attribute-description')).toBe(true);
      });

    });

    describe('relationship validation', () => {
      it('should detect invalid relationship format', () => {
        const filePath = 'datamodel.json';
        const content = `{ 
          "entities": [ 
            { 
              "name": "User", 
              "attributes": [
                { "name": "id", "type": "string", "description": "User ID" }
              ],
              "relationships": [ "not an object" ]
            }
          ] 
        }`;

        const result = validator.validate(filePath, content, validationContext);

        expect(result.isValid).toBe(false);
        expect(result.issues.some(issue => issue.code === 'datamodel-json/invalid-relationship-object')).toBe(true);
      });

      it('should detect missing required relationship fields', () => {
        const filePath = 'datamodel.json';
        const content = `{ 
          "entities": [ 
            { 
              "name": "User", 
              "attributes": [
                { "name": "id", "type": "string", "description": "User ID" }
              ],
              "relationships": [ { "name": "profiles" } ]
            }
          ] 
        }`;

        const result = validator.validate(filePath, content, validationContext);

        expect(result.isValid).toBe(false);
        expect(result.issues.some(issue => issue.code === 'datamodel-json/invalid-field-relationship-type')).toBe(true);
        expect(result.issues.some(issue => issue.code === 'datamodel-json/missing-field-relationship-target')).toBe(true);
      });

      it('should detect invalid relationship type', () => {
        const filePath = 'datamodel.json';
        const content = `{ 
          "entities": [ 
            { 
              "name": "User", 
              "attributes": [
                { "name": "id", "type": "string", "description": "User ID" }
              ],
              "relationships": [ 
                { 
                  "name": "profiles", 
                  "type": "invalid-type", 
                  "target": "Profile" 
                } 
              ]
            },
            {
              "name": "Profile",
              "attributes": [
                { "name": "id", "type": "string", "description": "Profile ID" }
              ]
            }
          ] 
        }`;

        const result = validator.validate(filePath, content, validationContext);

        expect(result.isValid).toBe(false);
        expect(result.issues.some(issue => issue.code === 'datamodel-json/invalid-field-relationship-type')).toBe(true);
      });
    });
  });
});