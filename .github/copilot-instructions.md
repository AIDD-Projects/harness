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

## Test Rules

- New feature = New test. Do not commit feature code without tests.
- Test command: `npm test` <!-- TODO: customize -->
- Mock location: `tests/__mocks__/` <!-- TODO: customize -->

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

## References

- failure-patterns.md — Log of known failure patterns
- project-state.md — Sprint/Story tracking, module registry
- dependency-map.md — Module dependency graph (living architecture doc)

- Failure patterns: failure-patterns.md
- Current state: project-state.md
