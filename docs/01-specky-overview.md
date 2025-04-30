# Introduction

In this new age of AI driven agentic coding, requirements are more important than ever.
But writing good requirements is time consuming and, for those who are not subject matter experts,
extremely difficult, requiring a lot of research and learning, before specification can begin!
There needs to be a way for developers to share component specifications, just like they do with
libraries. That's where Specky comes in.

Specky is a tool for creating, sharing and downloading component specifications to be used when
building applications. The Specky-Package-Manager (spm) is a command line tool that enables
developers to easily work with 3rd party specifications as if they were project dependencies.
It works in a similar way to NPM and we've copied a lot of NPM features to make it easy for
developers to get up and running. If you've used NPM, you'll find a lot of the tools and
processes very familiar.

# Component Specs

At the core of Specky you'll find **component specifications**. When we say **component** we're
referring to an application component, for example, the "blog component" or "store component",
that represents all the functionality belonging to those concepts. Components may be composed
of other components, for example, the "store components" might be composed of the "catalog",
"shopping-cart" and "checkout" components.

## What's in a Component Spec?

Component specs should ONLY contain functional requirements. This allows the component to be reused
in may different contexts and architectures.

Component specs contain the following artifacts:

- **spec.json**: contains metadata about the component such as name, version, author, license, etc.
- **component.md**: describes the component in detail so that an LLM can understand its purpose and how it functions
- **datamodel.json** (optional): models any entities that the component may rely on
- **tests/*.feature** (optional): gherkin feature specifications that outline tests to verify the component is working
  correctly

## What's not in Component Spec?

Your component spec should not depend on any specific:

- programming language e.g. Python, Java, Go, Rust
- programming framework or library e.g. Spring, NextJS, Rails
- deployment environment e.g. AWS, Azure
- technologies like...
  - Databases (e.g. MongoDB, Postgres)
  - Communication protocols (REST, gRPC)

Why? Because architecture choices may differ, depending on non-functional requirements and
business or technical constraints. One developer might be building a hobby project and is
fine with using python to implement their project. Another developer might be building
a high-performance application and wants to use Rust. If you make architectural choices
for your users, you're limiting who can use your specification.

Do NOT include implementation logic in your specification. If you want to share an implementation,
create and share a library! In the case of requirements, we're only concerned with what should
happen, not how. By prescribing how a specific feature is to be implemented, you're again limiting
the usefulness of your specification. It might make sense to describe how to implement some feature
in a low level language like C, but that function may already exist in higher level language like python.

The goal here is to maximise the usefulness of requirements so that they can be applied in as many
areas as possible. A well written specification can be just as easily implemented as a REST API,
a User Interface or a function library.

# Additional Files

## README.md (Optional)

While not required, it's good practice to include a README.md file in your specification with:

- An overview of the component
- Examples of how to use the specification
- Any special considerations
- Contact information for questions or contributions

## CHANGELOG.md (Optional)

A file that documents the changes made in each version of the component specification:

- Version number and release date
- New features added
- Bugs fixed
- Breaking changes
- Deprecations
