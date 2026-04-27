# Project State

> **Keep this file under 200 lines.** When Story count exceeds 30, move completed stories (✅) to the Archive section at the bottom.

## Quick Summary

<!-- Update these 3 lines EVERY session end. Format strictly:
   Line 1: ✅ Last session: [Story ID] [one-sentence what was done]
   Line 2: 🔄 In progress: [Story ID] [current state with measurable progress]
   Line 3: ➡️ Next: [specific action to take first]

   ✅ Good examples:
   ✅ Last session: S1-002 User authentication implemented (login + JWT)
   🔄 In progress: S1-003 API endpoint tests (3/7 tests passing)
   ➡️ Next: Complete remaining 4 tests, then start S1-004

   ❌ Bad examples:
   ✅ Last session: Did some work (too vague)
   🔄 In progress: Stuff (no Story ID, no progress metric)
   ➡️ Next: Continue (no specific action)

   **Write Precedence**: Multiple skills update this file. Priority order:
   1. `wrap-up` (session end) — highest priority, overwrites Quick Summary
   2. `lead` (story status changes) — updates Story Status table
   3. `pm` (new stories) — adds rows to Story Status table
   4. `debug` (bug fixes) — adds to Recent Changes only
   If conflicts: wrap-up’s Quick Summary always wins (it captures final session state).
-->

## Current Sprint

- Sprint: 1 — Initial Setup
- Started: <!-- TODO: date -->
- Branch: main

## Story Status

| ID | Title | Status | Assignee |
|----|-------|--------|----------|
| S1-1 | Project scaffolding | ⬜ todo | |
| S1-2 | Core feature implementation | ⬜ todo | |
| S1-3 | Test coverage | ⬜ todo | |

<!-- Status legend: ⬜ todo, 🔧 active, ✅ done, 🚫 blocked, ❌ dropped -->

## Module Registry

<!-- Summary of current modules. Full details in docs/dependency-map.md -->
| Module | Layer | Status |
|--------|-------|--------|
<!-- Fill as modules are created. Status: ⬜ planned, 🔧 active, ✅ stable -->

## Technical Decisions

<!-- Record key architectural decisions here. Detailed rationale goes in project-brief.md Decision Log. -->

## Recent Changes

<!-- Log recent completions here. Keep last 10 entries. Older entries can be deleted. -->

---

## Session Handoff Protocol

Before ending a chat session, you MUST:
1. Update the **Quick Summary** section above (3 lines: ✅/🔄/➡️ format)
2. Update **Story Status** table with current progress
3. Add any new failure patterns to `docs/failure-patterns.md`
4. Update `docs/features.md` if any features were added/changed

When starting a new chat session, read these files first:
1. `docs/project-state.md` (this file) — where we are
2. `docs/features.md` — what exists
3. `docs/failure-patterns.md` — what to watch out for
4. `docs/project-brief.md` — why we're building this

---

## Archive

<!-- Move completed stories (✅) here when Story Status table exceeds 30 rows.
   Keep the table format. Prefix with sprint number for reference.
   | Sprint | ID | Title | Completed |
   |--------|----|-------|-----------|
-->
