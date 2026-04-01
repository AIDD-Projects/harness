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
2. Exclude files outside that scope from modification
3. Check failure-patterns.md for matching patterns

### Phase 3: Hypothesis + Fix

1. State the root cause hypothesis in one sentence
2. Implement the minimal fix based on the hypothesis
3. Verify the fix does not break existing tests

### Phase 4: Verify + Record

1. Run all related tests after the fix
2. Add a regression test (prevent the same bug from recurring)
3. Decide if the pattern should be recorded in failure-patterns.md

## Checklist

- [ ] Root cause hypothesis is stated explicitly
- [ ] Did NOT skip Phase 1 (evidence collection) and jump straight to fixing
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

## Related Failure Patterns

- FP-002: Type confusion → Phase 1 requires verifying actual types
- FP-001: Mock not updated → Phase 4 requires checking mock sync
