# tests/ Directory Specification

The `tests/` directory contains Gherkin feature specifications that define tests for the component.

As of 30.04.2025, we don't want to define any strict rules about how to formulate these tests, however,
we recommend you use Gherkin v6 syntax (Feature, Rule, Example) and use the "User Story Mapping" process
to formulate your tests.

## Why we chose Gherkin

Gherkin is a human-readable, programming language agnostic way of specifying behaviour that has wide(ish) adoption.

With Gherkin you can:

- Define the expected behavior of the component in a structured format
- Use these executable test scenarios for testing implementation
- Enable behavior-driven development (BDD)
- Facilitate communication between stakeholders

## Organizing Feature Files with User Story Mapping

When organizing feature files according to User Story Mapping principles, structure them by user activities and
journeys:

```
tests/
  customer_journey/
    browse_products.feature
    add_to_cart.feature
    checkout.feature
    track_order.feature
  store_management/
    manage_inventory.feature
    process_returns.feature
    generate_reports.feature
  admin_activities/
    manage_users.feature
    configure_system.feature
    audit_activities.feature
```

This organization:

1. Groups features by user roles and activities
2. Follows the natural flow of user journeys
3. Makes it easier to understand the system from a user's perspective
4. Helps identify gaps in your specifications

Each feature file should represent a complete user story or use case, with rules representing the business rules that
apply to that use case.

## Recommended Reading

see gherkin-best-practices.md for more information.