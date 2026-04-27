# Architect Memory

> Auto-updated by the `wrap-up` skill at session end. Do not edit manually.
> **Initialization**: After the first architecture review, replace placeholder comments below with real data.
> **Update trigger**: Only updated when the `architect` agent runs. If architect was not invoked this session, this file stays unchanged.

## Design Decision History

<!-- Record each architecture decision with context and rationale.
   Format: [Date] Decision — Rationale (alternatives rejected: X, Y)
   Examples:
   - [2025-01-15] Chose layered architecture — simpler for 2-person team (rejected: hexagonal, too much boilerplate)
   - [2025-01-20] Rejected microservices — traffic < 1K req/s, monolith sufficient (revisit when traffic > 10K)
-->

## Module Boundary Insights

<!-- Record coupling hotspots and stable zones discovered during reviews.
   Format: Module — Observation — Impact (depended-by count)
   Examples:
   - shared/ is coupling hotspot — changes ripple to 5+ modules — consider splitting into shared/types and shared/utils
   - API layer is stable — rarely modified when business logic changes — safe to skip in impact analysis for domain changes
-->

## Architectural Anti-patterns Observed

<!-- Record anti-patterns with severity, detection method, and prevention.
   Format: Pattern — Severity (HIGH/MED/LOW) — Detection — Resolution — Prevention
   Examples:
   - Circular dep auth↔user — HIGH — dependency-map bidirectional check — extracted shared types — run check-impact before interface changes
   - God module in utils/ (800+ lines) — MED — file size check — decompose into auth-utils, date-utils, string-utils — enforce max 200 lines per module
-->

## Architecture Review Trends

<!-- Track patterns across reviews to identify systemic issues.
   Format: [Sprint] Reviews: N, Issues found: N, Recurring: list
   Examples:
   - [Sprint 1] Reviews: 2, Issues: 3, Recurring: none (first sprint)
   - [Sprint 2] Reviews: 3, Issues: 2, Recurring: circular dependency (2nd occurrence → escalate)
   Threshold: If same issue recurs 3+ times → add to failure-patterns.md
-->
