# Impact Analysis

## Purpose

Before modifying any module, trace all affected modules to prevent cascade failures.
The most common cause of regressions in growing projects is changing one module without updating its dependents.

## Invoked By

- **planner** agent — Step 9: for each existing module being modified
- **reviewer** agent — Step 7: when interface changes affect 2+ dependent modules

## When to Apply

- Adding, removing, or changing a module's public interface
- Modifying shared types, entities, or DTOs
- Refactoring that touches more than 2 files
- When a test fails in a module you didn't directly change

## Procedure

1. **Identify the target module**: Which module are you about to change?
2. **Read docs/dependency-map.md**: Find the target module's row
3. **Read docs/failure-patterns.md**: Check if any active patterns (FP-001, FP-002, etc.) apply to the target module or change type. If FP-001 frequency > 0, flag mock updates as mandatory in step 6.
4. **List dependents**: Read the "Depended By" column — these are the blast radius
5. **Read docs/features.md**: Identify which features include the target module in their Key Files column. These features may need status or Key Files updates.
6. **Check interface impact**: Does your change affect the module's public interface?
   - If NO (internal-only change) → proceed, but still run dependent tests
   - If YES → continue to step 7
7. **Trace each dependent** (direct dependents only):
   - List files in each dependent module that import from the target
   - Identify which functions/types they use
   - Determine if the interface change breaks them
   - Note: Transitive dependents (modules importing from a dependent, not the target) are not traced here. Check them later if direct dependent interfaces also change.
8. **Plan updates**: Create a task list of all files that need modification
9. **Verify scope**: Confirm all files are within the current Story scope (docs/project-state.md)

## Checklist

- [ ] Target module identified in docs/dependency-map.md
- [ ] docs/failure-patterns.md checked for active patterns
- [ ] All dependent modules listed
- [ ] Affected features identified from docs/features.md
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

- [ ] **docs/dependency-map.md**: Update the Interface Change Log table with: Date, Module, Change description, Affected Modules, Status ("In Progress" until all dependents updated, then "Updated"). **This is mandatory for ALL interface changes** — do not skip even if the change seems minor.
- [ ] **docs/features.md**: If the interface change affects a feature's Key Files, update the Key Files column. If test files change, update the Test Files column.
- [ ] **docs/project-state.md**: If scope exceeds current Story, add a note to Recent Changes.

### 🧭 Navigation — After Impact Analysis

Impact-analysis is invoked BY `planner` (Step 9) or `reviewer` (Step 7). After completion, control returns to the caller's flow.
If invoked directly by the user, append:

```
---
🧭 Next Step
→ Call: `planner` or `reviewer`
→ Prompt example: "영향도 분석 결과를 반영해줘"
→ Why: Blast radius mapped — incorporate into plan or review
→ Pipeline: N/A (utility skill — invoked by planner Step 9 or reviewer Step 7)
---
```

## Related Failure Patterns

- FP-001: Interface changed, mock not updated → Checklist item 7 (mock/test updates planned)
- FP-002: Type confusion across modules → Step 7 (trace each dependent, verify types)

<!-- TEAM_MODE_START -->
## Team Mode: Impact Analysis

### Owner-Aware Blast Radius
- When listing affected modules from docs/dependency-map.md, check the Owner column
- If a dependent module is owned by another developer, the blast radius extends to their scope
- Flag cross-owner impacts: "⚠️ Module [X] owned by [dev] will be affected"

### Notification
- For interface changes affecting modules owned by other developers, **list them explicitly** in the analysis output
- Recommend notifying affected module owners before proceeding with changes
<!-- TEAM_MODE_END -->
