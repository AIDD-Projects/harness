# Project Instructions

## Architecture

<!-- TODO: Describe your project's architecture here.
   Example:
   TypeScript / Express / PostgreSQL
   Hexagonal Architecture (Port + Adapter)
-->

## Directory Structure

<!-- TODO: Map your directory structure.
   Example:
   src/
   ├── domain/           # Entities, Repository interfaces
   ├── application/      # Use Cases
   ├── infrastructure/   # DB, HTTP adapters
   ├── presentation/     # Controllers, DTOs
   └── shared/           # Utils, types, errors
-->

## Core Type Rules

<!-- TODO: Document type decisions that LLMs frequently get wrong.
   Example:
   - `ServerType` is a union type ("stdio" | "sse"), NOT an enum.
   - `UserRole` is a union type ("admin" | "user"), NOT an enum.
-->

## Iron Laws

1. **Mock Sync**: When you modify a repository/service interface, update corresponding mocks in the same commit.
2. **Type Check**: Before calling a constructor or factory, read the actual source file to verify parameters. Do not rely on memory.
3. **Scope Compliance**: Do not modify files outside the current Story scope (see project-state.md) without reporting first.
4. **Security**: Never include credentials, passwords, or API keys in code or commits.
5. **3-Failure Stop**: If the same approach fails 3 times, stop and report to the user.
6. **Dependency Map**: When adding or modifying a module, update dependency-map.md in the same commit. Register new modules, update relationship columns.
7. **Feature Registry**: When adding a new feature, register it in features.md in the same commit. Include key files and test files.
8. **Session Handoff**: Before ending a chat session, update project-state.md Quick Summary. Never leave the project in an undocumented state.

## Test Rules

- New feature = New test. Do not commit feature code without tests.
- Test command: <!-- TODO: e.g. npm test, pytest, go test ./..., mvn test -->
- Mock location: <!-- TODO: e.g. tests/__mocks__/, test/fixtures/ -->

## Completion Status Protocol

Report completion using one of:
- **DONE**: All steps completed. Present evidence (test results, file list, etc).
- **DONE_WITH_CONCERNS**: Completed but with concerns. List each concern.
- **BLOCKED**: Cannot proceed. Describe the cause and what was tried.
- **NEEDS_CONTEXT**: Need more information. Describe exactly what is needed.

## Concreteness Rules

- When modifying files, specify exact paths and line numbers.
- When tests fail, quote the test name and error message.
- When type errors occur, specify expected type and actual type.

## Direction Guard (Every Request)

Before starting ANY coding task, do this:

1. Read `project-brief.md` — check Vision, Goals, Non-Goals, and Decision Log
2. If `project-brief.md` is empty → run the `bootstrap` skill first, then return to the request
3. If the request conflicts with **Non-Goals** → stop and warn: "This falls under Non-Goals. Do you want to proceed? If yes, run `pivot` skill first."
4. If the request contradicts a **Decision Log** entry → warn: "This conflicts with a previous decision: [entry]. Run `pivot` skill to update direction."
5. If aligned → proceed

This applies to EVERY request, not just new sessions. Skip only for trivial questions ("what does this function do?").

## New Session Bootstrap

When starting a NEW chat session, read these files in order before doing any work:
1. `project-state.md` — Quick Summary tells you where we left off
2. `features.md` — What features exist in this project
3. `failure-patterns.md` — What mistakes to avoid
4. `project-brief.md` — Project vision, goals, and non-goals

If ALL state files are empty (only TODOs/placeholders), run the `bootstrap` skill before doing anything else.

## Workflow Pipeline

Follow this order for different workflows. Each step's output feeds the next.

### New Feature
```
bootstrap (if state files empty) → planner → [code] → reviewer → sprint-manager → learn
```

### Bug Fix
```
investigate → [fix] → test-integrity → reviewer → learn
```

### Session Lifecycle
```
[session start] → sprint-manager ("where are we?") → [work] → learn → [session end]
```

### Key Rules
- **planner before code**: Never start coding a feature without running planner first.
- **reviewer before commit**: Never commit without running reviewer.
- **learn before closing**: Run learn as the last skill of every session.
- **bootstrap once**: Run bootstrap once when state files are empty. Not needed after that.

## References

- project-brief.md — Project vision, goals, non-goals (the "why")
- features.md — Feature registry (the "what")
- project-state.md — Sprint/Story tracking, module registry (the "where")
- dependency-map.md — Module dependency graph (the "how")
- failure-patterns.md — Log of known failure patterns (the "watch out")
