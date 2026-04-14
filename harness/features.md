# Feature Registry

A living document of all features in this project. Update whenever features are added, modified, or deprecated.
This is LLM's map to understand "what exists" — without this, features get forgotten as the project grows.

## Feature List

| Feature | Status | Key Files | Test Files | Owner |
|---------|--------|-----------|------------|-------|
<!-- Example:
| User Auth       | ✅ done   | src/auth/login.ts, src/auth/jwt.ts     | tests/auth/login.test.ts      | - |
| MCP Routing     | 🔧 active | src/router/index.ts, src/router/mcp.ts | tests/router/mcp.test.ts      | - |
| Admin Dashboard | ⬜ planned | -                                       | -                             | - |
| Legacy REST API | ❌ dropped | -                                       | -                             | - |
-->
<!-- Add new features above this line -->

## Status Legend

- ✅ **done** — Feature complete with tests passing
- 🔧 **active** — Currently being developed
- ⬜ **planned** — In backlog, not started
- ⚠️ **broken** — Tests failing or known issues
- ❌ **dropped** — Removed or abandoned (keep for history)

> **Note**: Feature status uses 🔧 (active) while Story status in project-state.md also uses 🔧 (active). These are aligned — when a Story is 🔧 active, its parent Feature should be 🔧 active too.

## Update Protocol

When you add or modify a feature:
1. Add/update the row in the Feature List table above
2. List the key source files and test files
3. Update the Status column

**Iron Law #7**: When adding a new feature, register it here in the same commit.

**Write Precedence** (multiple skills update this file):
1. **planner** — registers new features (⬜ planned) when creating implementation plans
2. **sprint-manager** — updates Status to 🔧 active when a Story begins
3. **reviewer** — updates Status to ✅ done when Story passes review, or ⚠️ broken if tests fail
4. **learn** — finalizes Status at session end (conflict resolution: learn takes precedence)

## Orphan Detection

Periodically check for orphan features (features without active stories or stories without a parent feature):
- If a Feature has Status 🔧 but no Story references it in project-state.md → stale, update to ⬜ or ❌
- If a Story in project-state.md implements something not listed here → missing feature row, add it

## Test Coverage Quick Check

To verify all features are tested, scan this table for any row where:
- Status is ✅ or 🔧 but Test Files is empty → **missing tests**
- Status is ✅ but test files reference modules that no longer exist → **stale tests**
