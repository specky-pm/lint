# Contributing to Specky Lint

Thank you for your interest in contributing to Specky Lint! We welcome contributions from everyone.

## How to Contribute

1. **Fork the repository:** Start by forking the Specky Lint repository on GitHub.
2. **Clone your fork:** Clone your forked repository to your local machine.
   ```bash
   git clone https://github.com/yourusername/specky-lint.git
   cd specky-lint
   ```
3. **Install dependencies:** Install the project dependencies.
   ```bash
   npm install
   ```
4. **Create a new branch:** Create a new branch for your contribution. Use a descriptive name (e.g.,
   `feat/add-new-rule`, `fix/resolve-parsing-issue`).
   ```bash
   git checkout -b your-branch-name
   ```
5. **Make your changes:** Implement your feature, bug fix, or documentation improvement.
6. **Run tests and linting:** Ensure your changes pass all tests and linting checks.
   ```bash
   npm test
   npm run lint
   ```
7. **Commit your changes:** Commit your changes with a clear and concise commit message. Follow the Conventional Commits
   specification if possible.
   ```bash
   git commit -m "feat: add a new validation rule"
   ```
8. **Push to your fork:** Push your changes to your fork on GitHub.
   ```bash
   git push origin your-branch-name
   ```
9. **Create a Pull Request:** Open a pull request from your fork to the main Specky Lint repository. Provide a clear
   description of your changes and reference any related issues.

## Development Workflow

- We use a feature branch workflow. All development happens in branches off the `main` branch.
- Pull requests are reviewed before being merged into `main`.
- We use semantic versioning for releases.

## Running Tests and Linting

- **Tests:** Run unit and integration tests using `npm test`.
- **Linting:** Check code style and potential errors using `npm run lint`.

Please ensure all tests pass and linting checks are clean before submitting a pull request.

## Pull Request Guidelines

- Keep pull requests focused on a single issue or feature.
- Provide a clear and detailed description of your changes.
- Include relevant tests for your changes.
- Ensure your code follows the project's coding style.
- Be responsive to feedback during the review process.

Thank you for helping improve Specky Lint!