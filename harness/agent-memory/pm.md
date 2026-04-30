# pm Memory

> Auto-updated by the `wrap-up` skill at session end. Do not edit manually.
> **Initialization**: After the first sprint completes, replace placeholder comments below with real data.
> **Update trigger**: Updated when `wrap-up` skill runs after a pm session.

## Estimation Accuracy

<!-- Track estimate vs actual effort per wave to calibrate future planning.
   Format: [Sprint] Wave N: estimate vs actual (ratio)
   Examples:
   - [Sprint 1] Wave 1: accurate (1.0x) — simple CRUD, well-understood domain
   - [Sprint 1] Wave 3: optimistic (2.3x) — integration complexity underestimated
   - [Sprint 2] Wave 2: accurate (1.1x) — applied 1.5x buffer from Sprint 1 lesson
   Rule: If ratio > 2.0x for 2+ sprints → apply mandatory 2x buffer for that wave depth
-->

## Architecture Insights

<!-- Record structural patterns that affect planning.
   Format: Pattern — Planning Impact
   Examples:
   - Domain → Application → Infrastructure dependency order — plan domain layer first in every feature
   - Changes to shared/ require full rebuild — always estimate +30 min for shared/ changes
   - DB migration file creation frequently forgotten — add explicit "create migration" task to every DB-touching story
-->

## Repeated Patterns

<!-- Track recurring task patterns with frequency to auto-generate checklists.
   Format: Pattern — Frequency (N/total features) — Action
   Examples:
   - New feature = middleware + route + controller + service (4-file set) — 5/5 features — auto-include in breakdown
   - DB migration forgotten — 3/5 features needing DB — add explicit migration task
   - Auth middleware required for new routes — 4/6 route additions — default to auth-required
-->

## Velocity Trends

<!-- Track stories-per-sprint to predict capacity and detect trajectory changes.
   Format: [Sprint N] Planned: X, Done: Y, Rate: Z%
   Examples:
   - [Sprint 1] Planned: 5, Done: 3, Rate: 60% — ramp-up phase, team unfamiliar with codebase
   - [Sprint 2] Planned: 4, Done: 4, Rate: 100% — right-sized after Sprint 1 data
   - [Sprint 3] Planned: 4, Done: 5, Rate: 125% — acceleration, consider planning 5 next sprint
   Benchmark: After 3+ sprints, calculate average rate. If < 60% for 2 consecutive sprints → debug causes
-->
