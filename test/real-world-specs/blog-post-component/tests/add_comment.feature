Feature: A user adds a comment to a blog post

  Background:
    Given a published blog post exists
    And the user has access to the blog post

  Rule: Comments must have content

    Example: Adding a comment with content
      When the user adds a comment with the text "This is a very helpful article!"
      Then the comment should be saved
      And the comment should be associated with the blog post
      And the comment count for the blog post should increase by 1

    Example: Attempting to add an empty comment
      When the user attempts to add a comment with no text
      Then an error should be presented
      And no comment should be saved

  Rule: Comments may require moderation based on system policy

    Example: Adding a comment with moderation enabled
      Given comment moderation is enabled
      When the user adds a comment with the text "This is a very helpful article!"
      Then the comment should be saved with status "pending"
      And the comment should not be visible to other users
      And a notification should be sent to moderators

    Example: Adding a comment with moderation disabled
      Given comment moderation is disabled
      When the user adds a comment with the text "This is a very helpful article!"
      Then the comment should be saved with status "approved"
      And the comment should be immediately visible to other users

  Rule: Comments have a maximum length

    Example: Adding a comment within length limits
      When the user adds a comment with 500 characters
      Then the comment should be saved successfully

    Example: Attempting to add a comment exceeding length limits
      When the user attempts to add a comment with 3000 characters
      Then an error should be presented
      And the comment should not be saved