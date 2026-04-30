---
name: breakdown
description: 'Break down features into implementable stories. Use when planning new features.'
---

# Feature Breakdown

## Purpose

Decompose a feature into implementation tasks ordered by dependency.
Ensures bottom-up implementation: foundations first, then layers that depend on them.

## Invoked By

- **pm** agent — Step 8: Create ordered task list for new features
- **architect** agent — when structural validation requires task decomposition review

> **Note**: breakdown is responsible for task decomposition only. It does NOT invoke `check-impact`. The pm calls both skills independently: breakdown (Step 8) for task ordering, then check-impact (Step 9) for blast radius analysis.

## When to Apply

- Starting a new feature or Story
- A feature touches 3+ modules
- Unsure which module to build first
- After the pm agent creates a high-level plan

## Procedure

1. **Describe the feature** in one sentence
2. **Read docs/project-brief.md** — verify the feature aligns with Goals and does not violate Non-Goals. If project-brief.md is empty (setup hasn't run), skip this check but warn the user. If it conflicts with Non-Goals, **stop and warn the user** before proceeding. (Direction Guard — prevents breakdown of out-of-scope features even when invoked directly without pm)
3. **Read docs/dependency-map.md** to understand current module relationships
4. **Identify affected modules**: List every module that needs changes
5. **Classify changes per module**:
   - NEW_MODULE: Entirely new module to create
   - INTERFACE_CHANGE: Existing module's public interface changes
   - INTERNAL_CHANGE: Only internal implementation changes
   - TEST_ONLY: Only test updates needed
   - EXTERNAL_DEP: External process/service dependency (DB, Docker, message queue, network API, etc.) — define mock boundary interface before implementation. No real external process execution in tests.
6. **Build dependency order**:
   - List modules topologically: modules with zero dependencies first, then modules depending on first layer, etc.
   - Example: Module A (no deps) → Module B (depends A) → Module C (depends A, B)
   - Group into implementation waves (parallel-safe batches)
7. **Create task sequence**: Convert waves into numbered tasks
8. **Annotate each task** with:
   - Module name
   - Change type (from step 5)
   - Files to create/modify
   - Tests to write
   - Dependency (which prior task must finish first)
   - ⚠️ Relevant failure patterns (check docs/failure-patterns.md)

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
- [ ] Register Module A in docs/dependency-map.md
- [ ] Update Module B's "Depends On" column
```

## Rules

- Never implement a module before its dependencies exist
- Each task should be completable in one session
- Every task must include its test files
- New modules MUST be registered in docs/dependency-map.md (Iron Law #6) — the breakdown OUTPUT section lists these registrations, and pm (or the user, if invoked directly) is responsible for executing the actual state file writes
- If a task exceeds Story scope, stop and report to user

## State File Updates (mandatory — Step 9)

After completing the breakdown, update these files in the same session:

- [ ] **docs/dependency-map.md**: Register all NEW_MODULE entries. Update "Depends On" / "Depended By" for INTERFACE_CHANGE entries.
- [ ] **docs/features.md**: Add a new row for the feature with Status `🔧 active`, Key Files from Wave tasks, and Test Files.
- [ ] **docs/project-state.md**: Add Stories to the Story Status table for each Wave.

### 🧭 Navigation — After Feature Breakdown

Feature-breakdown is invoked BY pm (Step 8), so the 🧭 returns control to pm's flow.
If invoked directly by the user, append:

```
---
🧭 Next Step
→ Next: `pm`
→ Prompt: "breakdown을 기반으로 Sprint Story를 생성해줘"
→ Why: Tasks are defined — pm will register Stories and update state files
→ Pipeline: 🟢 Step 2/6 (returns to pm)
---
```

## Anti-patterns

| Anti-pattern | Correct Approach |
|---|---|
| Start from UI, work backward | Start from domain, work forward |
| One giant task for the whole feature | Break into single-module tasks |
| Skip dependency-map registration | Register immediately when creating module |
| Tests "later" | Tests in the same task |
| Produce breakdown but skip state file updates | State file updates are part of the breakdown, not a separate step |

## Related Failure Patterns

- FP-001: Interface changed, mock not updated → When creating tasks that modify interfaces, include "Update mock" as an explicit sub-task
- FP-002: Type confusion → When annotating tasks, specify expected types for new interfaces
- FP-003: Scope drift → If the breakdown exceeds the current Story scope, stop and report

