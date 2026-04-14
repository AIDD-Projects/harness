# Test Integrity

## Purpose

Ensure test mocks stay synchronized when repository/service interfaces change.
Prevents the most common LLM coding failure: updating an interface but forgetting to update corresponding mocks. (FP-001)

## Invoked By

- **reviewer** agent — Step 3: Mock synchronization verification

## When to Apply

- Adding, removing, or modifying methods on a repository/service interface
- Creating a new repository or service
- When a use case starts calling a new interface method

## Procedure

1. **Read docs/failure-patterns.md**: Check FP-001 status. If frequency > 0, this project has a history of mock sync failures — apply extra scrutiny to every interface change.
2. **Identify changed interfaces**: Find modified files in your interface directory
3. **Map to mock files**: Locate the corresponding mock file for each changed interface
4. **Sync methods**: Verify every interface method exists in the mock
5. **Verify return types**: Confirm mock return values match the interface return types (FP-002: watch for type confusion)
6. **Check consumers**: Verify use case tests configure the mock correctly for new methods

## Checklist

- [ ] docs/failure-patterns.md reviewed for FP-001 history
- [ ] (FP-001) Every changed interface method is reflected in its mock
- [ ] (FP-002) Mock return types match interface signatures (no type confusion)
- [ ] New methods have default mock return values set
- [ ] Use case tests correctly use the new mock methods
- [ ] Existing tests still pass

## Example

### Good
```
Interface adds findByFilters() → Mock adds findByFilters with mockResolvedValue([])
Both changes in the same commit.
```

### Bad
```
Interface adds findByFilters() → Mock unchanged
→ Runtime error: method not found on mock object
```

## State File Updates (mandatory)

After synchronizing mocks:

- [ ] **docs/failure-patterns.md**: If mock sync was missed and caused a test failure, increment FP-001 Frequency.
- [ ] **docs/dependency-map.md**: If the interface change altered module relationships, update the relevant row.
- [ ] **docs/project-state.md**: If mock sync issues were found and fixed, add to Recent Changes: "🔧 Test: [interface] mock synchronized". This ensures the next session is aware of the fix.

## Testing Rules (enforced during this skill)

- Mocks must implement ALL interface methods. Missing method = build failure.
- Recommended: Avoid `any` type casting on mocks — create mocks using the actual interface type (adjust per project-brief.md → Key Technical Decisions).
- New methods must have default mock return values (e.g., `mockResolvedValue`, stub returns).
- Recommended: No `skip`, `only`, or debug statements in committed test files.
- Async tests must use `await`. No floating promises.
- Each test must be independent. No shared state between tests.

### 🧭 Navigation — After Test Integrity

Test-integrity is invoked BY `reviewer` (Step 3). After completion, control returns to the reviewer's flow.
If invoked directly by the user, append:

```
---
🧭 Next Step
→ Call: `reviewer`
→ Prompt example: "코드를 리뷰해줘"
→ Why: Mock sync verified — proceed with full review
---
```

## Related Failure Patterns

- FP-001: Interface changed, mock not updated → Checklist item 2
- FP-002: Type confusion → Step 5 return type verification

<!-- TEAM_MODE_START -->
## Team Mode: Test Integrity

- If the interface you changed is owned by another developer (check docs/dependency-map.md Owner), notify them about the mock update requirement
- When updating shared test fixtures or mocks, run `git pull` first to avoid overwriting teammates' changes
<!-- TEAM_MODE_END -->
