# component.md Specification

The `component.md` file is the core of the Specky component specification.
While the `spec.json` file contains metadata, the `component.md` file contains the actual
functional requirements and detailed description of the component.

## Purpose

- Describes what the component should do
- Defines functional requirements in a language-agnostic way
- Provides enough detail for developers to implement the component
- Written in a way that LLMs (Large Language Models) can understand and process

## Recommended Structure

The `component.md` file is a Markdown document with NO specific structure (for now).
However, you may want to include the following sections:

### Overview

Suggested minimum.

| Section              | Description                                                                  |
|----------------------|------------------------------------------------------------------------------|
| Overview             | A concise summary of what the component does and its purpose in the system.  |
| Core Functionality   | Detailed description of the main features and capabilities of the component. |
| Features & Use Cases | A heirarchical list of features, use cases and business rules                |

### Miscellaneous

Optional sections that might make sense depending on your use case.

| Section                       | Description                                                                                                                 |
|-------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| Data Management               | (if you don't include datamodel.json) How the component manages data, including what data is stored and how it's processed. |
| Integration Points            | How the component interacts with other components or systems.                                                               |
| Edge Cases and Error Handling | How the component should handle unusual situations and errors.                                                              |
| Constraints and Limitations   | Any known constraints or limitations of the component.                                                                      |
| Compliance Requirements       | Any regulatory or compliance requirements.                                                                                  |
| Examples                      | Example scenarios to illustrate how the component should be used.                                                           |
| Glossary                      | Definitions of key terms used throughout the specification.                                                                 |

## Writing Style Guidelines

- **Be Clear and Specific**: Use precise language to describe functionality.
- **Focus on What, Not How**: Describe what the component should do, not how it should be implemented.
- **Use Consistent Terminology**: Maintain consistent terms throughout the document.
- **Use Active Voice**: Write in active voice for clarity.
- **Organize Hierarchically**: Use headings and subheadings to create a clear structure.

## Example

```markdown
# User Authentication Component

# Overview

The User Authentication Component handles all aspects of user authentication including registration, 
login, logout, password management, and session handling. It provides secure, reliable authentication 
services that can be integrated with any application requiring user identity verification.

# Core Functionality

## User Registration
- Collect essential user information (email, password, name)
- Validate email format and uniqueness
- Enforce password strength requirements
- Generate and store secure password hashes
- Send verification emails to confirm user identity
- Create new user accounts upon successful verification

## Authentication
- Verify user credentials against stored information
- Generate secure session tokens upon successful authentication
- Implement rate limiting to prevent brute force attacks
- Support remember-me functionality for persistent sessions
- Track login attempts and lock accounts after suspicious activity

## Features & Use Cases

Feature: User Registration
- Use Case: a user creates a new account
  - Rule: collect essential user information (email, password, name)
  - Rule: validate email format and uniqueness
  - Rule: enforce password strength requirements
  - Rule: generate and store secure password hashes
  - Rule: send verification emails to confirm user identity

Feature: Authentication
- Use Case: a user logs into the system
  - Rule: verify user credentials against stored information
  - Rule: generate secure session tokens upon successful authentication
  - Rule: implement rate limiting to prevent brute force attacks
  - Rule: support remember-me functionality for persistent sessions
  - Rule: track login attempts and lock accounts after suspicious activity

## Data Management

### User Data
The component stores the following user information:
- Unique identifier
- Email address (unique)
- Password hash (never the plain password)
- Account status (active, pending, locked)
- Registration date
- Last login timestamp
- Failed login attempts

## Edge Cases and Error Handling

### Account Recovery
- Process for recovering access when email is inaccessible
- Handling of accounts with suspicious activity
- Procedure for administratively resetting accounts

## Constraints and Limitations

- Maximum of 10 failed login attempts before temporary lockout
- Password reset links expire after 24 hours
- Email verification required before full account access
- Session tokens valid for maximum of 30 days
```
