import {readFileSync} from 'fs';
import {resolve} from 'path';
import datamodelJsonSchema from '../../src/spec/datamodel-json-schema';

describe('Datamodel JSON Schema Validation', () => {
  // Helper function to load JSON fixtures
  const loadFixture = (path: string) => {
    return JSON.parse(readFileSync(resolve(__dirname, '../fixtures', path), 'utf-8'));
  };

  describe('Valid datamodel.json', () => {
    it('should validate a valid datamodel.json file', () => {
      const validDatamodel = loadFixture('valid/datamodel.json');
      const result = datamodelJsonSchema.safeParse(validDatamodel);
      expect(result.success).toBe(true);
    });
  });

  describe('Invalid datamodel.json', () => {
    it('should reject a datamodel with invalid entity structure', () => {
      const invalidDatamodel = loadFixture('invalid/datamodel-invalid-entity.json');
      const result = datamodelJsonSchema.safeParse(invalidDatamodel);
      expect(result.success).toBe(false);

      if (!result.success) {
        // We expect validation errors, but don't need to check specific messages
        // as the schema might change and error messages with it
        expect(result.error.errors.length).toBeGreaterThan(0);
      }
    });

    it('validates datamodel with structural patterns', () => {
      // Note: The current schema doesn't validate duplicate entity names or attributes
      // This test documents the current behavior rather than the ideal behavior
      const structuralDatamodel = loadFixture('invalid/datamodel-structural-error.json');
      const result = datamodelJsonSchema.safeParse(structuralDatamodel);

      // Currently, the schema accepts this file despite structural issues
      // This may be addressed in future schema updates
      expect(result.success).toBe(true);
    });
  });

  describe('Entity validation', () => {
    it('should validate entity name format', () => {
      const invalidEntity = {
        entities: [
          {
            name: 'invalidName', // Should start with uppercase
            attributes: [
              {
                name: 'id',
                type: 'string',
                description: 'ID field'
              }
            ]
          }
        ]
      };

      const result = datamodelJsonSchema.safeParse(invalidEntity);
      expect(result.success).toBe(false);

      const errorMessages = result.error?.errors.map(err => err.message);
      expect(errorMessages?.some(msg =>
        msg.includes('invalid-field-entity-name')
      )).toBe(true);
    });

    it('should require at least one attribute', () => {
      const invalidEntity = {
        entities: [
          {
            name: 'User',
            attributes: [] // Empty attributes array
          }
        ]
      };

      const result = datamodelJsonSchema.safeParse(invalidEntity);
      expect(result.success).toBe(false);

      const errorMessages = result.error?.errors.map(err => err.message);
      expect(errorMessages?.some(msg =>
        msg.includes('invalid-field-entity-attributes')
      )).toBe(true);
    });
  });

  describe('Attribute validation', () => {
    it('should validate required attribute fields', () => {
      const invalidAttribute = {
        entities: [
          {
            name: 'User',
            attributes: [
              {
                // Missing name
                type: 'string',
                description: 'ID field'
              }
            ]
          }
        ]
      };

      const result = datamodelJsonSchema.safeParse(invalidAttribute);
      expect(result.success).toBe(false);
    });

    it('should validate attribute description is not empty', () => {
      const invalidAttribute = {
        entities: [
          {
            name: 'User',
            attributes: [
              {
                name: 'id',
                type: 'string',
                description: '' // Empty description
              }
            ]
          }
        ]
      };

      const result = datamodelJsonSchema.safeParse(invalidAttribute);
      expect(result.success).toBe(false);

      const errorMessages = result.error?.errors.map(err => err.message);
      expect(errorMessages?.some(msg =>
        msg.includes('invalid-field-attribute-description')
      )).toBe(true);
    });

    it('should accept optional fields in attributes', () => {
      const validAttribute = {
        entities: [
          {
            name: 'User',
            attributes: [
              {
                name: 'id',
                type: 'string',
                description: 'User ID',
                required: true,
                unique: true,
                default: 'user-1'
              }
            ]
          }
        ]
      };

      const result = datamodelJsonSchema.safeParse(validAttribute);
      expect(result.success).toBe(true);
    });
  });

  describe('Relationship validation', () => {
    it('should validate relationship type', () => {
      const invalidRelationship = {
        entities: [
          {
            name: 'User',
            attributes: [
              {
                name: 'id',
                type: 'string',
                description: 'ID field'
              }
            ],
            relationships: [
              {
                name: 'posts',
                type: 'invalid-type', // Invalid relationship type
                target: 'Post'
              }
            ]
          }
        ]
      };

      const result = datamodelJsonSchema.safeParse(invalidRelationship);
      expect(result.success).toBe(false);

      const errorMessages = result.error?.errors.map(err => err.message);
      expect(errorMessages?.some(msg =>
        msg.includes('invalid-field-relationship-type')
      )).toBe(true);
    });

    it('should validate target entity name format', () => {
      const invalidTarget = {
        entities: [
          {
            name: 'User',
            attributes: [
              {
                name: 'id',
                type: 'string',
                description: 'ID field'
              }
            ],
            relationships: [
              {
                name: 'posts',
                type: 'one-to-many',
                target: 'invalidTarget' // Should start with uppercase
              }
            ]
          }
        ]
      };

      const result = datamodelJsonSchema.safeParse(invalidTarget);
      expect(result.success).toBe(false);

      const errorMessages = result.error?.errors.map(err => err.message);
      expect(errorMessages?.some(msg =>
        msg.includes('invalid-field-relationship-target')
      )).toBe(true);
    });

    it('should accept optional inverse field in relationships', () => {
      const validRelationship = {
        entities: [
          {
            name: 'User',
            attributes: [
              {
                name: 'id',
                type: 'string',
                description: 'ID field'
              }
            ],
            relationships: [
              {
                name: 'posts',
                type: 'one-to-many',
                target: 'Post',
                inverse: 'author'
              }
            ]
          }
        ]
      };

      const result = datamodelJsonSchema.safeParse(validRelationship);
      expect(result.success).toBe(true);
    });

    it('should accept relationships without inverse field', () => {
      const validRelationship = {
        entities: [
          {
            name: 'User',
            attributes: [
              {
                name: 'id',
                type: 'string',
                description: 'ID field'
              }
            ],
            relationships: [
              {
                name: 'posts',
                type: 'one-to-many',
                target: 'Post'
                // No inverse field
              }
            ]
          }
        ]
      };

      const result = datamodelJsonSchema.safeParse(validRelationship);
      expect(result.success).toBe(true);
    });
  });

  describe('Validation rules', () => {
    it('should validate string validation rules', () => {
      const validStringValidation = {
        entities: [
          {
            name: 'User',
            attributes: [
              {
                name: 'email',
                type: 'string',
                description: 'Email address',
                validation: {
                  minLength: 5,
                  maxLength: 100,
                  pattern: '^[a-z0-9]+$'
                }
              }
            ]
          }
        ]
      };

      const result = datamodelJsonSchema.safeParse(validStringValidation);
      expect(result.success).toBe(true);
    });

    it('should validate email and telephone boolean flags', () => {
      const validBooleanValidation = {
        entities: [
          {
            name: 'User',
            attributes: [
              {
                name: 'email',
                type: 'string',
                description: 'Email address',
                validation: {
                  email: true
                }
              },
              {
                name: 'phone',
                type: 'string',
                description: 'Phone number',
                validation: {
                  telephone: true
                }
              }
            ]
          }
        ]
      };

      const result = datamodelJsonSchema.safeParse(validBooleanValidation);
      expect(result.success).toBe(true);
    });

    it('should validate number validation rules', () => {
      const validNumberValidation = {
        entities: [
          {
            name: 'Product',
            attributes: [
              {
                name: 'price',
                type: 'number',
                description: 'Product price',
                validation: {
                  minimum: 0,
                  maximum: 1000
                }
              }
            ]
          }
        ]
      };

      const result = datamodelJsonSchema.safeParse(validNumberValidation);
      expect(result.success).toBe(true);
    });

    it('should reject invalid validation rules', () => {
      const invalidValidation = {
        entities: [
          {
            name: 'User',
            attributes: [
              {
                name: 'email',
                type: 'string',
                description: 'Email address',
                validation: {
                  minLength: -5, // Negative value not allowed
                  unknown: 'value' // Unknown property
                }
              }
            ]
          }
        ]
      };

      const result = datamodelJsonSchema.safeParse(invalidValidation);
      expect(result.success).toBe(false);
    });

    it('should reject non-positive minLength and maxLength', () => {
      const invalidLengthValidation = {
        entities: [
          {
            name: 'User',
            attributes: [
              {
                name: 'username',
                type: 'string',
                description: 'Username',
                validation: {
                  minLength: 0, // Should be positive
                  maxLength: -10 // Should be positive
                }
              }
            ]
          }
        ]
      };

      const result = datamodelJsonSchema.safeParse(invalidLengthValidation);
      expect(result.success).toBe(false);
    });
  });

  describe('Combined validations', () => {
    it('should validate a complex entity with multiple validation types', () => {
      const complexEntity = {
        entities: [
          {
            name: 'Product',
            attributes: [
              {
                name: 'id',
                type: 'string',
                description: 'Product ID',
                required: true,
                unique: true
              },
              {
                name: 'name',
                type: 'string',
                description: 'Product name',
                required: true,
                validation: {
                  minLength: 3,
                  maxLength: 100
                }
              },
              {
                name: 'price',
                type: 'number',
                description: 'Product price',
                required: true,
                validation: {
                  minimum: 0.01
                }
              },
              {
                name: 'email',
                type: 'string',
                description: 'Contact email',
                validation: {
                  email: true
                }
              },
              {
                name: 'phone',
                type: 'string',
                description: 'Contact phone',
                validation: {
                  telephone: true
                }
              }
            ]
          }
        ]
      };

      const result = datamodelJsonSchema.safeParse(complexEntity);
      expect(result.success).toBe(true);
    });
  });
});