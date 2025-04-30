# datamodel.json Specification

The `datamodel.json` file defines the data entities and their attributes that the component works with. This file is
optional but recommended for components that manage specific data structures.

## Purpose

- Defines the data entities associated with the component
- Specifies the attributes and relationships of these entities
- Provides a clear data model for implementation
- Enables validation and consistency checks

## Structure

The `datamodel.json` file is a JSON document that defines entities and their attributes. The basic structure includes:

### Entities

An array of entity definitions, each with:

| Field           | Type             | Description                                       |
|-----------------|------------------|---------------------------------------------------|
| `name`          | String           | The name of the entity (e.g., "User", "Product"). |
| `attributes`    | Array            | The attributes that define the entity.            |
| `relationships` | Array (optional) | Relationships to other entities.                  |

### Attributes

Each attribute has:

| Field         | Type               | Description                                                           |
|---------------|--------------------|-----------------------------------------------------------------------|
| `name`        | String             | The name of the attribute (e.g., "id", "email").                      |
| `type`        | String             | The data type of the attribute (e.g., "string", "number", "boolean"). |
| `description` | String             | A description of what the attribute represents.                       |
| `required`    | Boolean (optional) | Whether the attribute is required.                                    |
| `unique`      | Boolean (optional) | Whether the attribute must be unique.                                 |
| `default`     | Any (optional)     | The default value for the attribute.                                  |
| `validation`  | Object             | Entity validation rules for the attribute.                            |

#### Entity Validation

Each entity validation rule has:

| Field     | Type              | Description                                                |
|-----------|-------------------|------------------------------------------------------------|
| `*`       | String            | The type of validation (see below for a detailed list)     |
| `value`   | Any               | The relevant confi                                         |
| `inverse` | String (optional) | The name of the inverse relationship on the target entity. |

Allowed validation rules:

- For strings:
  - `minLength`: minimum allowed length of the string
  - `maxLength`: maximum allowed length of the string
  - `pattern`: regular expression to match on the string
- For numbers:
  - `minimum`: smallest allowed number
  - `maximum`: largest allowed number
- Special validations:
  - `email`: ensures the field is an email address
  - `telephone`: ensures the field is a telephone number

**Example**

```json
{
  "entities": [
    {
      "name": "User",
      "attributes": [
        {
          "name": "password",
          "type": "string",
          "description": "Unique identifier for the user",
          "required": true,
          "unique": true,
          "validation": {
            "minLength": 8,
            "maxLength": 100,
            "pattern": "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
          }
...
```

### Relationships

Each relationship has:

| Field     | Type              | Description                                                                    |
|-----------|-------------------|--------------------------------------------------------------------------------|
| `name`    | String            | The name of the relationship.                                                  |
| `type`    | String            | The type of relationship (e.g., "one-to-many", "many-to-one", "many-to-many"). |
| `target`  | String            | The target entity of the relationship.                                         |
| `inverse` | String (optional) | The name of the inverse relationship on the target entity.                     |

## datamodel.json Validations

## Example

```json
{
  "entities": [
    {
      "name": "User",
      "attributes": [
        {
          "name": "id",
          "type": "string",
          "description": "Unique identifier for the user",
          "required": true,
          "unique": true
        },
        {
          "name": "email",
          "type": "string",
          "description": "User's email address",
          "required": true,
          "unique": true,
          "validation": {
            "format": "email"
          }
        },
        {
          "name": "passwordHash",
          "type": "string",
          "description": "Hashed password",
          "required": true
        },
        {
          "name": "firstName",
          "type": "string",
          "description": "User's first name",
          "required": true
        },
        {
          "name": "lastName",
          "type": "string",
          "description": "User's last name",
          "required": true
        },
        {
          "name": "role",
          "type": "string",
          "description": "User's role (admin, user, etc.)",
          "required": true,
          "default": "user"
        }
      ],
      "relationships": [
        {
          "name": "profiles",
          "type": "one-to-many",
          "target": "Profile",
          "inverse": "user"
        }
      ]
    },
    {
      "name": "Profile",
      "attributes": [
        {
          "name": "id",
          "type": "string",
          "description": "Unique identifier for the profile",
          "required": true,
          "unique": true
        },
        {
          "name": "bio",
          "type": "string",
          "description": "User's biography"
        },
        {
          "name": "avatarUrl",
          "type": "string",
          "description": "URL to the user's avatar image"
        }
      ],
      "relationships": [
        {
          "name": "user",
          "type": "many-to-one",
          "target": "User",
          "inverse": "profiles"
        }
      ]
    }
  ]
}