@user-management @authentication
Feature: User Registration
  As a new user
  I want to create an account
  So that I can access the system

  Background:
    Given the registration page is open
    And the following validation rules are configured:
      | Email                        | Password                           |
      | Must be a valid email format | Minimum 8 characters with 1 number |

  Rule: New users can register with valid information

    Example: Successful registration with valid details
      When I enter valid registration details
        | Email            | Password       | FirstName | LastName |
        | user@example.com | SecureP@ssw0rd | John      | Doe      |
      And I submit the registration form
      Then a new user account should be created
      And I should receive a verification email
      And I should be redirected to the login page

    Example: Registration with optional information
      When I enter valid registration details
        | Email            | Password       | FirstName | LastName |
        | user@example.com | SecureP@ssw0rd | John      | Doe      |
      And I provide optional profile information
        | Phone           | Address     |
        | +1-555-123-4567 | 123 Main St |
      And I submit the registration form
      Then a new user account should be created with the optional information
      And I should receive a verification email

  Rule: Users cannot register with invalid information

    Example: Registration with existing email
      Given a user with email "existing@example.com" already exists
      When I enter registration details with email "existing@example.com"
      And I submit the registration form
      Then I should see an error message "Email already in use"
      And no new account should be created

    Example Outline: Registration with invalid input
      When I enter registration details
        | Email   | Password   | FirstName   | LastName   |
        | <email> | <password> | <firstName> | <lastName> |
      And I submit the registration form
      Then I should see an error message "<errorMessage>"
      And no new account should be created

      Examples:
        | email            | password  | firstName | lastName | errorMessage           |
        | invalid-email    | Password1 | John      | Doe      | Invalid email format   |
        | user@example.com | short     | John      | Doe      | Password too short     |
        | user@example.com | Password1 |           | Doe      | First name is required |
        | user@example.com | Password1 | John      |          | Last name is required  |