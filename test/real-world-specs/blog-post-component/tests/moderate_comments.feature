Feature: A moderator reviews and moderates comments

  Background:
    Given a published blog post exists with pending comments
    And the user has moderator permissions

  Rule: Only authorized users can moderate comments

    Example: Moderator approving a comment
      When the moderator approves a pending comment
      Then the comment status should change to "approved"
      And the comment should become visible to all users
      And the comment count for the blog post should increase

    Example: Non-moderator attempting to approve a comment
      Given the user does not have moderator permissions
      When the user attempts to approve a pending comment
      Then access should be denied
      And the comment should remain in "pending" status

  Rule: Rejected comments must have a reason

    Example: Rejecting a comment with a reason
      When the moderator rejects a comment with the reason "Violates community guidelines"
      Then the comment status should change to "rejected"
      And the rejection reason should be recorded
      And the comment should not be visible to regular users

    Example: Attempting to reject without providing a reason
      When the moderator attempts to reject a comment without specifying a reason
      Then an error should be presented
      And the comment should remain in "pending" status

  Rule: Moderation actions must be logged for audit purposes

    Example: Logging of approval action
      When the moderator approves a pending comment
      Then the action should be logged with the moderator's information
      And the log should include the timestamp and action type

    Example: Logging of rejection action
      When the moderator rejects a comment with a reason
      Then the action should be logged with the moderator's information
      And the log should include the timestamp, action type, and rejection reason