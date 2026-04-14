# Reviewer Memory

> Auto-updated by the `learn` skill at session end. Do not edit manually.
> **Initialization**: After the first code review, replace placeholder comments below with real data.
> **Update trigger**: Updated when `learn` skill runs after a reviewer session.

## Project-Specific Review Patterns

<!-- Record patterns specific to THIS project that future reviews should check.
   Format: Pattern — Location — Severity — Prevention
   Examples:
   - SQL injection risk in src/api/routes/ — req.params used directly — HIGH — add parameterized query wrapper
   - Mock sync miss rate 50% — interface changes in src/domain/ — HIGH — run test-integrity skill pre-commit
   - Hardcoded timeout 5000ms in tests — tests/integration/ — LOW — extract to test config
-->

## Frequently Missed Items

<!-- Track items that reviews catch repeatedly to prioritize attention.
   Format: Item — Frequency (N/total reviews) — Iron Law reference
   Examples:
   - docs/features.md update omitted — 3/5 reviews — Iron Law #7
   - dependency-map.md not updated after new module — 2/5 reviews — Iron Law #6
   - Test files connecting to real database — 1/5 reviews — testing rules
   Threshold: If frequency > 50% → recommend adding to pre-commit hook
-->

## Review Statistics

- Total reviews: 0
- Auto-fixes applied: 0
- Escalations: 0
<!-- Track ratios after 5+ reviews:
   - Auto-fix rate: auto-fixes / total issues (if > 30% → consider automating those checks)
   - Escalation rate: escalations / total reviews (if > 20% → investigate root cause)
-->

## Test Failure Patterns

<!-- Track which test patterns commonly fail during reviews.
   Format: Pattern — Frequency — Root Cause — Mitigation
   Examples:
   - Mock method missing after interface change — 4/10 reviews — FP-001 — run test-integrity pre-commit
   - Async test timeout — 2/10 reviews — missing await — enforce eslint no-floating-promises
   - Snapshot mismatch after UI change — 3/10 reviews — stale snapshots — update snapshots in same commit
-->
