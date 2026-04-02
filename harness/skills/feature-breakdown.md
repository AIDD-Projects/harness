# Feature Breakdown

## Purpose

Decompose a feature into implementation tasks ordered by dependency.
Ensures bottom-up implementation: foundations first, then layers that depend on them.

## When to Apply

- Starting a new feature or Story
- A feature touches 3+ modules
- Unsure which module to build first
- After the Planner agent creates a high-level plan

## Procedure

1. **Describe the feature** in one sentence
2. **Read dependency-map.md** to understand current module relationships
3. **Identify affected modules**: List every module that needs changes
4. **Classify changes per module**:
   - NEW_MODULE: Entirely new module to create
   - INTERFACE_CHANGE: Existing module's public interface changes
   - INTERNAL_CHANGE: Only internal implementation changes
   - TEST_ONLY: Only test updates needed
5. **Build dependency order**:
   - Draw a mini dependency graph for just the affected modules
   - Sort topologically: modules with no dependencies come first
   - Group into implementation waves (parallel-safe batches)
6. **Create task sequence**: Convert waves into numbered tasks
7. **Annotate each task** with:
   - Module name
   - Change type (from step 4)
   - Files to create/modify
   - Tests to write
   - Dependency (which prior task must finish first)

## Output Format

```markdown
## Feature: [one-sentence description]

### Wave 1 (no dependencies)
- [ ] Task 1: [Module A] — Create entity + repository interface
  - Files: <!-- list files to create/modify -->
  - Tests: <!-- list test files -->
  - Depends on: none

### Wave 2 (depends on Wave 1)
- [ ] Task 2: [Module B] — Implement use case
  - Files: <!-- list files to create/modify -->
  - Tests: <!-- list test files -->
  - Depends on: Task 1

### Wave 3 (depends on Wave 2)
- [ ] Task 3: [Module C] — Add API endpoint / UI integration
  - Files: <!-- list files to create/modify -->
  - Tests: <!-- list test files -->
  - Depends on: Task 2

### Dependency Map Updates
- [ ] Register Module A in dependency-map.md
- [ ] Update Module B's "Depends On" column
```

## Rules

- Never implement a module before its dependencies exist
- Each task should be completable in one session
- Every task must include its test files
- New modules MUST be registered in dependency-map.md (Iron Law #6)
- If a task exceeds Story scope, stop and report to user

## State File Updates (mandatory)

After completing the breakdown, update these files in the same session:

- [ ] **dependency-map.md**: Register all NEW_MODULE entries. Update "Depends On" / "Depended By" for INTERFACE_CHANGE entries.
- [ ] **features.md**: Add a new row for the feature with Status `🔧 active`, Key Files from Wave tasks, and Test Files.
- [ ] **project-state.md**: Add Stories to the Story Status table for each Wave.

## Anti-patterns

| Anti-pattern | Correct Approach |
|---|---|
| Start from UI, work backward | Start from domain, work forward |
| One giant task for the whole feature | Break into single-module tasks |
| Skip dependency-map registration | Register immediately when creating module |
| Tests "later" | Tests in the same task |
| Produce breakdown but skip state file updates | State file updates are part of the breakdown, not a separate step |
