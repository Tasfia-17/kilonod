# Contributing to Kilo-Nod

Thank you for your interest in contributing to Kilo-Nod. This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful and inclusive. We welcome contributors from all backgrounds and experience levels.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Create a new branch for your feature or bugfix
4. Make your changes
5. Test your changes thoroughly
6. Submit a pull request

## Development Setup

```bash
git clone https://github.com/YOUR_USERNAME/kilonod.git
cd kilonod
cd mcp-server && npm install
npm test
```

## Coding Standards

- Use ES modules (import/export)
- Follow existing code style
- Add JSDoc comments for functions
- Write descriptive variable names
- Keep functions small and focused

## Testing

All new features must include tests:

```bash
npm test
npm run test:coverage
```

## Commit Messages

Write clear, descriptive commit messages:

```
Add feature: Session management for audit logs

- Implement start_session and end_session tools
- Add session tracking to audit logs
- Update documentation
```

## Pull Request Process

1. Update README.md with details of changes
2. Update API documentation if needed
3. Ensure all tests pass
4. Request review from maintainers

## Questions

Open an issue or ask in the Kilo Discord community.
