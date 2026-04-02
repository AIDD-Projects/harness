# Failure Patterns

Record only actual failures from this project. No theories or assumptions.
Keep resolved patterns for regression prevention.

---

## FP-001: Mock not updated when interface changed

- **Occurred**: <!-- Sprint/Story where this happened -->
- **Frequency**: 0
- **Cause**: LLM treated interface change and mock update as separate tasks. Added method to interface but forgot to update the mock, causing test failures.
- **Prevention**: Update mock in the same commit as the interface change.
- **Applied in**: testing rules, test-integrity skill, reviewer agent
- **Status**: Template — activate when first occurrence is logged

---

## FP-002: Type confusion (enum vs union, wrong parameter count)

- **Occurred**: <!-- Sprint/Story where this happened -->
- **Frequency**: 0
- **Cause**: LLM does not retain type information across sessions. Used enum syntax for union types or called constructors with wrong parameter count.
- **Prevention**: Document core types in global instructions. Read source file before calling constructors.
- **Applied in**: global instructions, backend rules
- **Status**: Template — activate when first occurrence is logged

---

## FP-003: Scope drift / ignoring instructions

- **Occurred**: <!-- Sprint/Story where this happened -->
- **Frequency**: 0
- **Cause**: LLM lost track of current scope in large workflows. Skipped "report and wait for approval" steps.
- **Prevention**: Track current Story in docs/project-state.md. Sprint manager agent detects scope violations.
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
