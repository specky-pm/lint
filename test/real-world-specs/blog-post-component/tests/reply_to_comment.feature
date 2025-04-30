Feature: A user replies to an existing comment

  Background:
    Given a published blog post exists
    And the blog post has an existing comment from "commenter@example.com"
    And the user has access to the blog post

  Rule: Replies must be associated with a parent comment

    Example: Replying to an existing comment
      When the user replies to the existing comment with the text "I agree with your point"
      Then the reply should be saved
      And the reply should be associated with the parent comment
      And the reply count for the parent comment should increase by 1

    Example: Attempting to reply to a non-existent comment
      When the user attempts to reply to a comment that doesn't exist
      Then an error should be presented
      And no reply should be saved

  Rule: Nested replies may have a maximum depth

    Example: Replying within the maximum nesting depth
      Given the system allows replies up to 3 levels deep
      And there is a comment with replies 2 levels deep
      When the user adds a reply to the deepest reply
      Then the reply should be saved successfully
      And the reply should be properly nested under its parent

    Example: Exceeding the maximum nesting depth
      Given the system allows replies up to 3 levels deep
      And there is a comment with replies 3 levels deep
      When the user attempts to reply to the deepest reply
      Then the system should handle this according to policy
      And the user should be informed about the nesting limitation

  Rule: Replies inherit moderation settings from the system

    Example: Replying with moderation enabled
      Given comment moderation is enabled
      When the user replies to the existing comment
      Then the reply should be saved with status "pending"
      And the reply should not be visible to other users until approved

    Example: Replying with moderation disabled
      Given comment moderation is disabled
      When the user replies to the existing comment
      Then the reply should be saved with status "approved"
      And the reply should be immediately visible to other users