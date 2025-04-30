Feature: A user edits a blog post

  Background:
    Given the user has appropriate permissions to edit blog posts
    And a blog post exists with the following details:
      | Title                  | Author      | Status    | Content                         |
      | Understanding Markdown | John Writer | published | A guide to Markdown formatting. |

  Rule: Edited posts must maintain an audit trail

    Example: Editing a blog post title
      When the user changes the blog post title to "Complete Guide to Markdown"
      Then the blog post title should be updated
      And a new revision should be created in the post history
      And the last modified date should be updated

    Example: Editing blog post content
      When the user updates the blog post content
      Then the blog post content should be updated
      And a new revision should be created in the post history
      And the last modified date should be updated

  Rule: Published content cannot be directly modified without tracking

    Example: Tracking changes to published content
      When the user edits the published blog post
      Then the original version should be preserved in the revision history
      And the changes should be tracked with the user's information
      And the modification timestamp should be recorded

  Rule: Content edits may require approval based on organizational policy

    Example: Editing with approval workflow enabled
      Given the approval workflow is enabled for published posts
      When the user edits the published blog post
      Then the changes should be saved as a pending revision
      And the changes should require approval before becoming visible
      And the original version should remain publicly accessible

    Example: Editing with approval workflow disabled
      Given the approval workflow is disabled for published posts
      When the user edits the published blog post
      Then the changes should be immediately applied
      And the updated version should be publicly accessible