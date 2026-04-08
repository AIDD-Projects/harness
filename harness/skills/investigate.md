# Investigate

## Purpose

Debug bugs systematically. Prevent "symptom patching" — fixing without understanding root cause.
4-phase debugging process inspired by gstack's /investigate.

## When to Apply

- Test failures with unclear cause
- Runtime errors
- Regression bugs ("it worked yesterday")
- Unexplained behavior

## Procedure

### Phase 1: Evidence Collection (NO FIXES)

1. Record the full error message and stack trace
2. Trace the code path backwards from the error
3. Check recent changes: `git log --oneline -20 -- <related files>`
4. Verify the bug is reproducible

**Do NOT modify code in this phase.**

### Phase 2: Scope Lock

1. Identify the module/directory containing the root cause
2. **Read docs/dependency-map.md**: Find the target module's row. Check "Depended By" column to understand which other modules might be affected by the same root cause or by your fix.
3. **Read docs/project-state.md**: Verify the fix scope is within the current Story scope. If the root cause is in a module outside the current Story, **warn the user** before proceeding (Iron Law #3: Scope Compliance).
4. Exclude files outside that scope from modification
5. Check docs/failure-patterns.md for matching patterns

### Phase 3: Hypothesis + Fix

1. State the root cause hypothesis in one sentence
2. Implement the minimal fix based on the hypothesis
3. Verify the fix does not break existing tests

### Phase 4: Verify + Record

1. Run all related tests after the fix
2. Add a regression test (prevent the same bug from recurring)
3. Decide if the pattern should be recorded in docs/failure-patterns.md

## Checklist

- [ ] Root cause hypothesis is stated explicitly
- [ ] Did NOT skip Phase 1 (evidence collection) and jump straight to fixing
- [ ] docs/dependency-map.md consulted for blast radius understanding
- [ ] Fix scope verified against current Story in docs/project-state.md
- [ ] Fix scope is limited to the problem's scope
- [ ] All related tests pass after the fix
- [ ] Regression test is added
- [ ] Escalated to user after 3 failed attempts

## Example

### Good
```
Phase 1: TypeError: Cannot read property 'id' of undefined at UserService.ts:45
Phase 2: Scope → src/application/services/UserService.ts, src/domain/entities/User.ts
Phase 3: Hypothesis — findById returns null but no null check exists
         Fix — add null guard at UserService.ts:44
Phase 4: Tests pass, null case test added
```

### Bad
```
"Error occurred so I added an if statement."
→ Root cause unknown, no reproduction conditions recorded, same error possible elsewhere
```

## State File Updates (mandatory)

After the fix is verified (Phase 4):

- [ ] **docs/failure-patterns.md**: If the root cause is a repeatable pattern, add a new FP-NNN entry or increment the Frequency of an existing one. This is NOT optional.
- [ ] **docs/project-state.md**: Add the fix to Recent Changes with the root cause hypothesis.

## Enforced Rules

- **3-Failure Stop**: If the same fix approach fails 3 times, stop and report to the user. Do not keep trying.
- **Concreteness**: Specify exact file paths and line numbers. Quote error messages. Specify expected vs actual types.
- **Scope Lock**: Do not modify files outside the identified problem scope (Phase 2).

## Related Failure Patterns

- FP-001: Mock not updated → Phase 4 requires checking mock sync
- FP-002: Type confusion → Phase 1 requires verifying actual types
- FP-003: Scope drift → Phase 2 Scope Lock must verify fix is within current Story scope

<!-- TEAM_MODE_START -->
## Team Mode: Investigation

### Owner Awareness
- In Phase 2 (Scope Lock), check docs/dependency-map.md Owner column for the affected module
- If the root cause module is owned by another developer, **notify them** before applying a fix
- If the bug is in a shared module (no single Owner), document the fix in your PR description so the team can review

### Personal State
- Record new failure patterns in your personal .harness/failure-patterns.md
- If the pattern affects the whole team, promote it (see learn skill Team Mode section)
<!-- TEAM_MODE_END -->
