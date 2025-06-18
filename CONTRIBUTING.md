# Contributing to Result.js

Thank you for your interest in contributing to Result.js! This document provides guidelines and information for contributors.

## Development Setup

1. Fork and clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run tests to ensure everything works:
   ```bash
   npm test
   ```

## Code Style

We use ESLint and Prettier for code formatting. Please ensure your code follows the established style:

```bash
npm run lint    # Check for linting issues
npm run format  # Format code with Prettier
```

## Testing

We use Node.js built-in test runner. All tests should pass before submitting a pull request:

```bash
npm test
```

## Adding New Features

1. Create a feature branch from `main`
2. Add your feature with appropriate tests
3. Update documentation if needed
4. Ensure all tests pass
5. Submit a pull request

## Bug Reports

When reporting bugs, please include:

- A clear description of the issue
- Steps to reproduce the problem
- Expected vs actual behavior
- Environment information (Node.js version, OS, etc.)

## Pull Request Guidelines

1. **Title**: Use a clear, descriptive title
2. **Description**: Explain what the PR does and why
3. **Tests**: Include tests for new functionality
4. **Documentation**: Update README.md if adding new features
5. **Breaking Changes**: Clearly mark any breaking changes

## Commit Message Format

We follow conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create a GitHub release
4. The release workflow will automatically publish to npm

## Questions?

If you have questions about contributing, please open an issue or reach out to the maintainers. 