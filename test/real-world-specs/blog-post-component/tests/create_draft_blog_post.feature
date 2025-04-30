Feature: A user creates a draft blog post with appropriate metadata

  Background:
    Given the user has appropriate permissions to create blog posts

  Rule: Blog posts must have a title

    Example: Creating a draft blog post with a title
      When the user creates a new blog post with title "Understanding Markdown"
      Then the blog post should be saved as a draft
      And the blog post should have the title "Understanding Markdown"

    Example: Attempting to create a blog post without a title
      When the user attempts to create a blog post without a title
      Then an error should be presented
      And the blog post should not be created

  Rule: Categories and tags are optional

    Example: Creating a blog post with categories and tags
      When the user creates a new blog post with title "Understanding Markdown"
      And the user adds categories:
        | Technology | Writing | Tutorial |
      And the user adds tags:
        | markdown | formatting | beginner |
      Then the blog post should be saved with the specified categories and tags

    Example: Creating a blog post without categories or tags
      When the user creates a new blog post with title "Understanding Markdown"
      And the user does not add any categories or tags
      Then the blog post should be saved without categories and tags

  Rule: Blog post content can be saved in draft state

    Example: Saving blog post content as draft
      When the user creates a new blog post with title "Understanding Markdown"
      And the user adds the following content:
        """
        This is a guide to understanding Markdown.
        
        ## Introduction
        
        Markdown is a lightweight markup language.
        """
      Then the blog post content should be saved
      And the blog post status should be "draft"