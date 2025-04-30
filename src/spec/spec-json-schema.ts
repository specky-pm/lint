/**
 * Validation schema for Specky spec.json file
 * Based on the specification in docs/specky-spec-json.md
 *
 * This file uses Zod to define both TypeScript types and runtime validations
 * in a single, declarative way.
 */

import {z} from 'zod';

// Regular expressions for validation
const SEMVER_REGEX = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const URL_REGEX = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;
const COMPONENT_NAME_REGEX = /^[a-z0-9-_]+$/;

// Author schema (string or object with name, email, and URL)
export const authorSchema = z.union([
  z.string({message: "missing-field-author"})
    .min(1, {message: "invalid-field-author"}),
  z.object({
    name: z.string({message: "missing-field-author-name"})
      .min(1, {message: "invalid-field-author-name"}),
    email: z.string()
      .regex(EMAIL_REGEX, {message: "invalid-field-author-email"}).optional(),
    url: z.string()
      .regex(URL_REGEX, {message: "invalid-field-author-url"}).optional(),
  }),
]);

// Repository schema (string URL or object with type and URL)
export const repositorySchema = z.union([
  z.string().regex(URL_REGEX, {
    message: "invalid-field-repository-url"
  }),
  z.object({
    type: z.string().min(1, {
      message: "invalid-field-repository-type"
    }),
    url: z.string().regex(URL_REGEX, {
      message: "invalid-field-repository-url"
    }),
  }),
]);

// Bugs schema (string URL or object with URL and email)
export const bugsSchema = z.union([
  z.string().regex(URL_REGEX, {
    message: "invalid-field-bugs-url"
  }),
  z.object({
    url: z.string().regex(URL_REGEX, {
      message: "invalid-field-bugs-url"
    }),
    email: z.string().regex(EMAIL_REGEX, {
      message: "invalid-field-bugs-email"
    }).optional(),
  }),
]);

// Dependencies schema (object with component names as keys and version ranges as values)
export const dependenciesSchema = z.record(
  z.string().regex(COMPONENT_NAME_REGEX, {
    message: "invalid-field-dependency-name"
  }),
  z.string().min(1, {
    message: "invalid-field-dependency-version"
  }),
  {message: "invalid-field-dependencies"}
);

// Publishing configuration schema
export const publishConfigSchema = z.object({
  registry: z.string().regex(URL_REGEX, {
    message: "invalid-field-publish-registry"
  }).optional(),
  access: z.enum(['public', 'restricted'], {
    errorMap: () => ({message: "invalid-field-publish-access"})
  }).optional(),
  tag: z.string().min(1, {
    message: "invalid-field-publish-tag"
  }).optional(),
}).optional();

// Main spec.json schema
export const specJsonSchema = z.object({
  // Required fields
  name: z.string({message: "missing-field-name"})
    .regex(COMPONENT_NAME_REGEX, {message: "invalid-field-name"}),

  version: z.string({message: "missing-field-version"})
    .regex(SEMVER_REGEX, {message: "invalid-field-version"}),

  description: z.string({message: "missing-field-description"})
    .min(1, {message: "invalid-field-description"}),

  // Author information
  author: authorSchema.optional(),
  contributors: z.array(authorSchema).optional(),

  // License information
  license: z.enum([
    // Common SPDX license identifiers
    'MIT',
    'ISC',
    'Apache-2.0',
    'BSD-2-Clause',
    'BSD-3-Clause',
    'GPL-2.0-only',
    'GPL-3.0-only',
    'LGPL-2.1-only',
    'LGPL-3.0-only',
    'MPL-2.0',
    'AGPL-3.0-only',
    'Unlicense',
    'UNLICENSED'
  ], {
    errorMap: () => ({
      message: "invalid-license"
    })
  }).optional(),

  // Categorization
  keywords: z.array(z.string().min(1, {
    message: "invalid-field-keywords"
  })).optional(),

  // Dependencies
  dependencies: dependenciesSchema.optional(),

  // Repository information
  repository: repositorySchema.optional(),
  homepage: z.string().regex(URL_REGEX, {
    message: "invalid-field-homepage"
  }).optional(),
  bugs: bugsSchema.optional(),

  // Component configuration
  files: z.array(z.string().min(1, {
    message: "invalid-field-files"
  })).optional(),

  // Publishing configuration
  publishConfig: publishConfigSchema,
}).strict({message: "unrecognised-keys"});
// Export the type derived from the schema
export type SpecJson = z.infer<typeof specJsonSchema>;

export default specJsonSchema;