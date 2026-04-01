# Dependency Map

A living document of module relationships. Update whenever modules are added or modified.

## Module Registry

| Module | Layer | Purpose | Depends On | Depended By |
|--------|-------|---------|------------|-------------|
<!-- Example:
| auth       | domain        | User authentication    | -              | api, admin    |
| api        | presentation  | REST endpoints         | auth, services | frontend      |
| services   | application   | Business logic         | auth, database | api           |
| database   | infrastructure| Data persistence       | -              | services      |
-->

## Dependency Rules

- **No circular dependencies**: If A depends on B, B must not depend on A.
- **Layer direction**: domain → application → infrastructure/presentation (never reverse).
- **Interface boundaries**: Modules communicate through interfaces, not concrete implementations.
- **New module = new row**: Every new module must be registered here before implementation.

## Change Impact Quick Reference

When modifying a module:

1. Find the module row above
2. Check the **Depended By** column — these modules may break
3. For each dependent module:
   - Check if the change affects the public interface
   - Update tests and mocks for all affected dependents
4. Record the change in project-state.md

## Interface Change Log

<!-- Record interface changes as they happen.
   Format:
   | Date | Module | Change | Affected Modules | Status |
   |------|--------|--------|------------------|--------|
   | 2026-04-01 | auth | Added `resetPassword()` | api, admin | Updated |
-->

| Date | Module | Change | Affected Modules | Status |
|------|--------|--------|------------------|--------|
