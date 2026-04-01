# Test Integrity

## Purpose

Ensure test mocks stay synchronized when repository/service interfaces change.
Prevents the most common LLM coding failure: updating an interface but forgetting to update corresponding mocks. (FP-001)

## When to Apply

- Adding, removing, or modifying methods on a repository/service interface
- Creating a new repository or service
- When a use case starts calling a new interface method

## Procedure

1. **Identify changed interfaces**: Find modified files in your interface directory
2. **Map to mock files**: Locate the corresponding mock file for each changed interface
3. **Sync methods**: Verify every interface method exists in the mock
4. **Verify return types**: Confirm mock return values match the interface return types
5. **Check consumers**: Verify use case tests configure the mock correctly for new methods

## Checklist

- [ ] (FP-001) Every changed interface method is reflected in its mock
- [ ] Mock return types match interface signatures
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

## Related Failure Patterns

- FP-001: Interface changed, mock not updated → Checklist item 1
