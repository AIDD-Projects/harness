# Impact Analysis

## Purpose

Before modifying any module, trace all affected modules to prevent cascade failures.
The most common cause of regressions in growing projects is changing one module without updating its dependents.

## When to Apply

- Adding, removing, or changing a module's public interface
- Modifying shared types, entities, or DTOs
- Refactoring that touches more than 2 files
- When a test fails in a module you didn't directly change

## Procedure

1. **Identify the target module**: Which module are you about to change?
2. **Read docs/dependency-map.md**: Find the target module's row
3. **List dependents**: Read the "Depended By" column — these are the blast radius
4. **Check interface impact**: Does your change affect the module's public interface?
   - If NO (internal-only change) → proceed, but still run dependent tests
   - If YES → continue to step 5
5. **Trace each dependent**:
   - List files in each dependent module that import from the target
   - Identify which functions/types they use
   - Determine if the interface change breaks them
6. **Plan updates**: Create a task list of all files that need modification
7. **Verify scope**: Confirm all files are within the current Story scope docs/project-state.md)

## Checklist

- [ ] Target module identified in docs/dependency-map.md
- [ ] All dependent modules listed
- [ ] Interface vs internal change classified
- [ ] Files importing from target module enumerated
- [ ] Mock/test updates planned for each dependent (FP-001)
- [ ] All changes within current Story scope
- [ ] Escalated to user if scope exceeds current Story

## Example

### Good
```
Target: auth module
Change: Added `resetPassword(email: string): Promise<void>`
Dependents: api, admin
Impact:
  - api/routes/auth.ts imports AuthService → needs new route
  - admin/controllers/user.ts imports AuthService → needs admin endpoint
  - tests/__mocks__/AuthService.ts → needs new mock method
Plan: 4 files to update, all within S3-2 scope
```

### Bad
```
"I'll just add this method and see what breaks."
→ Tests fail in 3 modules, mock out of sync, 2 hours wasted
```

## State File Updates (mandatory)

After completing the analysis, update these files:

- [ ] **docs/dependency-map.md**: Update the Interface Change Log table with: Date, Module, Change description, Affected Modules, Status. **This is mandatory for ALL interface changes** — do not skip even if the change seems minor.
- [ ] **docs/project-state.md**: If scope exceeds current Story, add a note to Recent Changes.

## Related Failure Patterns

- FP-001: Interface changed, mock not updated → Checklist item 5
- FP-002: Type confusion across modules → Step 5 verification
