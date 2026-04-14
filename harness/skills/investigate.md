# Investigate

## Purpose

Debug bugs systematically. Prevent "symptom patching" — fixing without understanding root cause.
4-phase debugging process inspired by gstack's /investigate.

## When to Apply

- Test failures with unclear cause
- Runtime errors
- Regression bugs ("it worked yesterday")
- Unexplained behavior

### Edge Case: No Reproducible Error

If the user reports "weird behavior" but there is no error message or stack trace:
1. Ask the user to clarify: (A) Performance issue? (B) Logic error — show expected vs actual output? (C) Intermittent/race condition?
2. For (A): Profile or add timing logs, then proceed to Phase 1 with timing data as "evidence"
3. For (B): Use expected vs actual output as the error evidence for Phase 1
4. For (C): Add logging to capture the intermittent state, attempt reproduction 3 times before escalating.
   **Async race condition example**:
   ```
   Evidence: "Data shows stale value intermittently (1 in 5 runs)"
   Logging: Add timestamp + thread/event-loop ID at read/write points
   Reproduction: Run 5 times with logging enabled
   If reproduced: capture the interleaving sequence → Phase 2
   If not reproduced after 5 attempts: escalate to user with collected logs
   ```

## Procedure

### Phase 1: Evidence Collection (NO FIXES)

> **failure-patterns.md responsibility**: investigate READS patterns (Phase 1) to see if this is a known bug, and WRITES updates (Phase 4) to record new patterns. The `reviewer` agent only READS patterns (Step 5) as a warning check. The `learn` skill WRITES patterns only for failures NOT already recorded by investigate in the same session.

1. Record the full error message (first 500 chars) and top 5-10 stack frames
2. Trace the code path backwards from the error
3. Check recent changes: `git log --oneline -20 -- <related files>`
4. Verify the bug is reproducible

**Do NOT modify code in this phase.**

### Phase 2: Scope Lock

1. Identify the module/directory containing the root cause
2. **Read docs/dependency-map.md**: Find the target module's row. Check "Depended By" column to understand which other modules might be affected by the same root cause or by your fix.
3. **Read docs/project-state.md**: Verify the fix scope is within the current Story scope. If the root cause is in a module outside the current Story, **STOP and ask the user**: (1) expand scope to include the module, or (2) report to the module owner. Do not proceed without user approval (Iron Law #3: Scope Compliance).
4. Exclude files outside that scope from modification
5. Check docs/failure-patterns.md for matching patterns

### Phase 3: Hypothesis + Fix

1. State the root cause hypothesis:
   - **Simple bugs**: One sentence is sufficient (e.g., "findById returns null but no null check exists")
   - **Complex bugs** (race conditions, multi-module cascades): One-sentence SUMMARY followed by supporting context (reproduction steps, timing data, affected modules). Max 5 lines total.
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

- [ ] **docs/failure-patterns.md**: If the root cause is a repeatable pattern, add a new FP-NNN entry or increment the Frequency of an existing one. Increment Frequency if the ROOT CAUSE is the same (e.g., all SQL injection bugs = same FP-NNN regardless of which module). Different root causes = different patterns. This is NOT optional. **Note**: When investigate updates failure-patterns.md here, the `learn` skill (Step 3) will skip re-incrementing this same pattern for this session to avoid double-counting.
- [ ] **docs/project-state.md**: Add the fix to Recent Changes with the root cause hypothesis.

## Recalculating Mode (invoked by 3-Failure Stop)

When investigate is triggered by another skill/agent's 3-Failure Stop (not by a user-reported bug):

**Required input**: The caller MUST provide a failure context summary:
```
[Recalculating Mode]
Failed Attempt 1: [approach] → [error message]
Failed Attempt 2: [approach] → [error message]
Failed Attempt 3: [approach] → [error message]
```
This input is mandatory — if not provided, ask the caller to supply it before proceeding.

1. **Read the failure context first** — understand what was already tried and why it failed
2. Skip Phase 3 (Hypothesis + Fix) — do NOT attempt a fix
3. Complete Phase 1 (Evidence) and Phase 2 (Scope Lock) to diagnose the blocker
4. Propose 1-2 **alternative approaches** that are fundamentally different from ALL 3 failed attempts
5. Present to the user for decision — do not auto-execute the alternatives
6. If investigate itself hits 3 failures in this mode → **full stop**, no further recursion

## Enforced Rules

- **3-Failure Stop**: If the same fix approach fails 3 times, stop and report to the user. Do not keep trying.
- **Concreteness**: Specify exact file paths and line numbers. Quote error messages. Specify expected vs actual types.
- **Scope Lock**: Do not modify files outside the identified problem scope (Phase 2).

### 🧭 Navigation — After Investigate

After investigation and fix, always append a 🧭 block:

| Investigate Result | 🧭 Next Step |
|---|---|
| Fix applied, tests pass | `reviewer` — "수정한 코드를 리뷰해줘" |
| Root cause found but fix is out of scope | User decision — "수정 범위가 Story 밖입니다. scope를 확장하겠습니까?" |
| 3 attempts failed | 🛑 User escalation — "3회 시도 실패. 다른 접근법을 논의합시다" |
| Invoked by 3-Failure Recalculating | Diagnose blocker → propose 1-2 alternative routes → user decides |

Example 🧭 block:
```
---
🧭 Next Step
→ Call: `reviewer`
→ Prompt example: "수정한 코드를 리뷰해줘"
→ Why: Bug fix applied — review before commit
→ Pipeline: 🔴 Step 3/4
---
```

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
