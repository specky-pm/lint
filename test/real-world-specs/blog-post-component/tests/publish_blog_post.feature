Feature: A user publishes a draft blog post

  Background:
    Given the user has appropriate permissions to publish blog posts
    And a draft blog post exists with the following details:
      | Title                  | Author      | Content                         |
      | Understanding Markdown | John Writer | A guide to Markdown formatting. |

  Rule: Only draft posts can be published

    Example: Publishing a draft blog post
      When the user publishes the draft blog post
      Then the blog post status should change to "published"
      And the publication date should be set to the current date

    Example: Attempting to publish an already published post
      Given the blog post has already been published
      When the user attempts to publish the blog post again
      Then an error should be presented
      And the blog post publication date should remain unchanged

  Rule: Published posts become publicly accessible

    Example: Accessing a published blog post
      When the user publishes the draft blog post
      Then the blog post should be accessible to all users
      And the blog post should appear in the list of published posts

  Rule: Publishing a post requires mandatory fields

    Example: Publishing a post with all required fields
      Given the draft blog post has a title, content, and author
      When the user publishes the draft blog post
      Then the blog post should be successfully published

    Example: Attempting to publish a post with missing required fields
      Given the draft blog post is missing content
      When the user attempts to publish the draft blog post
      Then an error should be presented
      And the blog post should remain in draft status