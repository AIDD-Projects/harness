# Testing Rules

## Required

- When interface changes, update corresponding mocks in the same commit (FP-001).
- Mocks must implement ALL interface methods. Missing method = build failure.
- Do not use real credentials in test data. Use fixtures or fakers.
- Async tests must use `await`. No floating promises.
- Each test must be independent. No shared state between tests.

## Forbidden

- Casting mocks with `any` type. Create mocks using the actual interface type.
- Creating mocks with no default return values. Always set sensible defaults (e.g. `mockResolvedValue`, stub returns).
- Committing with `skip` or `only` left in test files.
- Committing with debugging statements (e.g. `console.log`, `print`, `println`).

## References

- test-integrity skill
- failure-patterns.md FP-001: Mock not updated
