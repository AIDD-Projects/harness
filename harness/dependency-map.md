# Dependency Map

A living document of module relationships. Update whenever modules are added or modified.

## Module Registry

| Module | Layer | Purpose | Depends On | Depended By | Owner |
|--------|-------|---------|------------|-------------|-------|
<!-- Example:
| auth       | domain        | User authentication    | -              | api, admin    | Alice |
| api        | presentation  | REST endpoints         | auth, services | frontend      | Bob   |
| services   | application   | Business logic         | auth, database | api           | Alice |
| database   | infrastructure| Data persistence       | -              | services      | Carol |
-->
<!-- Add new modules above this line -->

## Dependency Rules

- **No circular dependencies**: If A depends on B, B must not depend on A. Bidirectional check: for each row, verify the module does NOT appear in its own "Depends On" chain (A→B→C→A = circular).
- **Layer direction**: domain → application → infrastructure/presentation (never reverse).
  - `domain/` depends on nothing. No imports from application, infrastructure, or presentation.
  - `application/` depends on domain only. Implements use cases using domain interfaces.
  - `infrastructure/` implements domain interfaces. Can depend on domain and external libraries.
  - `presentation/` depends on application. Handles routing, DTOs, controllers.
  - `shared/` or `utils/` are cross-cutting. Any layer may depend on them, but they must NOT depend on any layer. Keep shared modules minimal.
- **Interface boundaries**: Modules communicate through interfaces, not concrete implementations.
- **New module = new row**: Every new module must be registered here before implementation (Iron Law #6).

## Change Impact Quick Reference

When modifying a module:

1. Find the module row above
2. Check the **Depended By** column — these modules may break
3. For each dependent module:
   - Check if the change affects the public interface
   - Update tests and mocks for all affected dependents
4. Record the change in docs/project-state.md

## Interface Change Log

<!-- Record interface changes as they happen. This is MANDATORY for all interface changes (Iron Law #1).
   **Who fills this**: The `impact-analysis` skill adds rows during planning/review. The `reviewer` agent verifies rows exist (Step 7).
   After modifying any public interface (method signature, return type, parameters):
   1. Add a row here immediately
   2. Check "Affected Modules" by reading the Depended By column in Module Registry
   3. Update mocks for all affected modules (run test-integrity skill)
   4. Set Status to "In Progress" until all dependents are updated, then "Updated"

   | Date | Module | Change | Affected Modules | Status |
   |------|--------|--------|------------------|--------|
   Example:
   | 2025-01-15 | auth | Added resetPassword() | api, admin | Updated |
   | 2025-01-20 | services | Changed getUser() return type | api | In Progress |
-->

| Date | Module | Change | Affected Modules | Status |
|------|--------|--------|------------------|--------|

<!-- TEAM_MODE_START -->
## Team Mode: Dependency Ownership

### Owner-Aware Module Registry
- The **Owner** column in Module Registry tracks who owns each module
- When adding a new module, always set the Owner to the responsible developer
- Owner information is used by `impact-analysis` to flag cross-owner blast radius

### Cross-Owner Dependency Rules
- Before adding a dependency on a module owned by another developer, verify with them
- Interface changes to modules with external dependents require Owner notification
- The `reviewer` agent checks Owner consistency during Step 7 (dependency-map audit)
<!-- TEAM_MODE_END -->
