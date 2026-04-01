---
applyTo: "**/*.test.ts,**/*.test.js,**/*.spec.ts,**/*.spec.js,**/__mocks__/**,**/__tests__/**"
---

# Testing Rules

## Required

- When interface changes, update corresponding mocks in the same commit (FP-001).
- Mocks must implement ALL interface methods. Missing method = build failure.
- Do not use real credentials in test data. Use fixtures or fakers.
- Async tests must use `await`. No floating promises.
- Each test must be independent. No shared state between tests.

## Forbidden

- Casting mocks with `any` type. Create mocks using the actual interface type.
- Creating mocks with bare `jest.fn()` only. Set default return values with `mockResolvedValue` etc.
- Committing with `skip` or `only` left in test files.
- Committing with `console.log` debugging statements.

## References

- test-integrity skill
- failure-patterns.md FP-001: Mock not updated
