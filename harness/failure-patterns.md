# Failure Patterns

Record only actual failures from this project. No theories or assumptions.
Keep resolved patterns for regression prevention.
**Resolution criteria**: A pattern is "Resolved" when Frequency stays at 0 for 3+ consecutive sprints after prevention was applied.

**Valid Status values**:
- `Template` — Pre-defined pattern, not yet observed in this project
- `Active` — Observed at least once, prevention in effect
- `Resolved` — Frequency 0 for 3+ sprints after prevention applied
- `Obsolete (pivot: [reason])` — Invalidated by a direction change (set by `pivot` skill)

---

## FP-001: Mock not updated when interface changed

- **Occurred**: <!-- Sprint/Story where this happened -->
- **Frequency**: 0
- **Cause**: LLM treated interface change and mock update as separate tasks. Added method to interface but forgot to update the mock, causing test failures.
- **Prevention**: Update mock in the same commit as the interface change.
- **Applied in**: testing rules, test-integrity skill, reviewer agent
- **Status**: Template — activate when first occurrence is logged

<!-- Activation example: When this pattern first occurs, update like this:
- **Occurred**: S1-2
- **Frequency**: 1
- **Status**: Active
On subsequent occurrences, increment Frequency and append to Occurred (e.g., S1-2, S2-1) -->

---

## FP-002: Type confusion (wrong parameter count, wrong types)

- **Occurred**: <!-- Sprint/Story where this happened -->
- **Frequency**: 0
- **Cause**: LLM does not retain type information across sessions. Called constructors with wrong parameter count, used wrong types (e.g., passed string where number expected), or confused similar type names.
- **Concrete scenario**: `new UserService(repo)` but constructor requires `new UserService(repo, logger, config)` — LLM remembered only 1 of 3 parameters from previous session.
- **Prevention**: Document core types in global instructions. Read source file before calling constructors (Iron Law #2).
- **Applied in**: global instructions, backend rules
- **Status**: Template — activate when first occurrence is logged

---

## FP-003: Scope drift / ignoring instructions

- **Occurred**: <!-- Sprint/Story where this happened -->
- **Frequency**: 0
- **Cause**: LLM lost track of current scope in large workflows. Skipped "report and wait for approval" steps.
- **Concrete scenario**: Working on S1-002 (user auth), LLM noticed a bug in S1-001 (scaffolding) and fixed it without asking — breaking the unchanged module's tests.
- **Prevention**: Track current Story in docs/project-state.md. Sprint manager agent detects scope violations. If root cause is in another module, STOP and ask user.
- **Applied in**: sprint-manager agent, global instructions
- **Status**: Template — activate when first occurrence is logged

---

## FP-004: Dangerous file committed

- **Occurred**: <!-- Sprint/Story where this happened -->
- **Frequency**: 0
- **Cause**: LLM created temp files during work, then ran `git add .` which staged credentials or debug artifacts.
- **Prevention**: Ban `git add .`. Run security-checklist skill before commits. Reviewer agent inspects staging area.
- **Applied in**: security-checklist skill, reviewer agent, backend rules
- **Status**: Template — activate when first occurrence is logged
