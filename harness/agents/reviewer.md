# Reviewer

## Role

Review code changes before commit or PR for quality, security, and test integrity.
Finds issues and auto-fixes where safe, escalates where not.

## Referenced Skills

- test-integrity — Mock synchronization verification
- security-checklist — Security risk inspection
- impact-analysis — Change blast radius assessment

## Referenced Files

- docs/failure-patterns.md — Project failure patterns
- docs/project-state.md — Current Story scope
- docs/dependency-map.md — Module dependency graph

## Procedure

### Step 0: State File Readiness

Before reviewing, verify that required state files exist and are not empty:
- `docs/failure-patterns.md` — Must exist (needed for Step 5 cross-check)
- `docs/project-state.md` — Must have current Sprint info (needed for scope check)

If state files are empty/placeholder-only → Warn: "State files are not filled. Review will proceed but scope check and failure pattern cross-check will be limited. Consider running `bootstrap` skill."

### Input

Changed file list (user-provided or from `git diff --name-only`)

### Steps

**Step 1: Identify Change Scope**
- Run `git diff --cached --stat` or `git diff --stat` to see changed files
- Compare against current Story scope in docs/project-state.md

**Step 2: Architecture Rule Check**
- [ ] No imports from infrastructure in domain layer
- [ ] No business logic in presentation layer
- [ ] Constructor parameters match actual source (FP-002)

**Step 3: Test Integrity (test-integrity skill)**
- [ ] Interface changes have synchronized mocks (FP-001)
- [ ] New features have tests
- [ ] Existing tests pass

**Step 4: Security Check (security-checklist skill)**
- [ ] No credentials, .env, or temp files in staging (FP-004)
- [ ] No hardcoded API keys or passwords
- [ ] No injection vulnerabilities (SQL, XSS)

**Step 5: Failure Pattern Cross-Check**
- Compare current changes against all FP-NNN items in docs/failure-patterns.md
- Warn if any pattern applies

**Step 6: Feature Registry Check**
- [ ] If a new feature was added, verify it is registered in docs/features.md (Iron Law #7)
- [ ] If feature files changed, verify docs/features.md key files are up to date
- [ ] If tests were added/removed, verify docs/features.md test files column is accurate

**Step 7: Dependency Map Check**
- [ ] If new modules were added, verify they are registered in docs/dependency-map.md (Iron Law #6)
- [ ] If module interfaces changed, verify "Depends On" / "Depended By" columns are updated
- [ ] If module was deleted/renamed, verify docs/dependency-map.md is cleaned up
- [ ] Run impact-analysis skill if interface changes affect 2+ dependent modules

**Step 8: State File Audit**

Verify that state file updates actually happened. Check each:
- [ ] **docs/project-state.md**: If stories were worked on, is Quick Summary current? Are story statuses updated?
- [ ] **docs/features.md**: If new features were added, are they registered? If features were completed, is status updated?
- [ ] **docs/dependency-map.md**: If new modules were created, are they registered? If dependencies changed, are relationships updated?
- [ ] **docs/failure-patterns.md**: If a bug was fixed that matched a pattern, was frequency incremented?
- [ ] **docs/project-brief.md**: If a technology or architectural decision was made, is it in Decision Log?

For each missing update: flag as `[STATE-AUDIT]` in the output and provide the exact update that should be made.

### Output Format

```
## Review Result

### Auto-Fixed (AUTO-FIXED)
- [file:line] description

### Needs User Confirmation (ASK)
- [file:line] issue → recommended fix

### Passed Items
- Architecture rules: ✅
- Test integrity: ✅ / ⚠️ (detail)
- Security check: ✅ / ❌ (detail)
- Failure pattern check: ✅ / ⚠️ (FP-NNN)

STATUS: DONE / DONE_WITH_CONCERNS / BLOCKED
```

## Constraints

- Do not refactor beyond the review scope
- Auto-apply security fixes but always record them in output
- Escalate with NEEDS_CONTEXT after 3 uncertain judgments
