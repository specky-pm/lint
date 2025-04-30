/**
 * Validation schema for Specky datamodel.json file
 * Based on the specification in docs/specky-datamodel-json.md
 *
 * This file uses Zod to define both TypeScript types and runtime validations
 * in a single, declarative way.
 */

import {z} from 'zod';

// Regular expressions for validation
const ENTITY_NAME_REGEX = /^[A-Z][a-zA-Z0-9]*$/;

// Validation rules schema
export const validationSchema = z.object({
  // String validations
  minLength: z.number().int().positive().optional(),
  maxLength: z.number().int().positive().optional(),
  pattern: z.string().min(1).optional(),
  email: z.boolean().optional(),
  telephone: z.boolean().optional(),

  // Number validations
  minimum: z.number().optional(),
  maximum: z.number().optional(),
}).strict().optional();

// Attribute schema
export const attributeSchema = z.object({
  name: z.string({message: "missing-field-attribute-name"})
    .min(1, {message: "invalid-field-attribute-name"}),
  type: z.string({message: "missing-field-attribute-type"})
    .min(1, {message: "invalid-field-attribute-type"}),
  description: z.string({message: "missing-field-attribute-description"})
    .min(1, {message: "invalid-field-attribute-description"}),
  required: z.boolean().optional(),
  unique: z.boolean().optional(),
  default: z.any().optional(),
  validation: validationSchema.optional(),
}, {message: "invalid-attribute-object"}).strict();

// Relationship types
const relationshipTypes = ['one-to-one', 'one-to-many', 'many-to-one', 'many-to-many'] as const;

// Relationship schema
export const relationshipSchema = z.object({
  name: z.string({message: "missing-field-relationship-name"})
    .min(1, {message: "invalid-field-relationship-name"}),
  type: z.enum(relationshipTypes, {errorMap: () => ({message: "invalid-field-relationship-type"})}),
  target: z.string({message: "missing-field-relationship-target"})
    .regex(ENTITY_NAME_REGEX, {message: "invalid-field-relationship-target"}),
  inverse: z.string()
    .min(1, {message: "invalid-field-relationship-inverse"}).optional(),
}, {message: "invalid-relationship-object"}).strict();

// Entity schema
export const entitySchema = z.object({
  name: z.string({message: 'missing-entity-name'})
    .regex(ENTITY_NAME_REGEX, {message: "invalid-field-entity-name"}),
  attributes: z.array(attributeSchema, {message: 'missing-entity-attributes'})
    .min(1, {message: "invalid-field-entity-attributes"}),
  relationships: z.array(relationshipSchema).optional(),
}, {message: "invalid-entity-object"}).strict();

// Main datamodel.json schema
export const datamodelJsonSchema = z.object({
  entities: z.array(entitySchema, {message: 'invalid-datamodel-structure'})
    .min(1, {message: "invalid-field-entities"}),
}).strict();

// Export the type derived from the schema
export type DatamodelJson = z.infer<typeof datamodelJsonSchema>;

export default datamodelJsonSchema;