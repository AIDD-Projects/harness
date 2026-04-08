# Project Instructions

## Architecture

Node.js / Pure JavaScript / Zero Dependencies
CLI tool architecture — single entry (bin/cli.js → src/init.js)

## Directory Structure

src/           # Core logic (init.js)
bin/           # CLI entry point
harness/       # Template files (skills, agents, state files)
templates/     # User-facing templates (agent.template.md, skill.template.md)
tests/         # Test files (Node.js native test runner)
docs/          # Documentation (architecture, analysis, strategy)

## Core Type Rules

- `GENERATORS` is a plain object map (not a class or enum).
- `mode` parameter is a string: `'solo'` or `'team'` (not boolean).
- All file I/O uses synchronous `fs` methods (`writeFileSync`, `mkdirSync`).

## Iron Laws

1. **Mock Sync**: When you modify a repository/service interface, update corresponding mocks in the same commit.
2. **Type Check**: Before calling a constructor or factory, read the actual source file to verify parameters. Do not rely on memory.
3. **Scope Compliance**: Do not modify files outside the current Story scope (see project-state.md) without reporting first.
4. **Security**: Never include credentials, passwords, or API keys in code or commits.
5. **3-Failure Stop**: If the same approach fails 3 times, stop and report to the user.
6. **Dependency Map**: When adding or modifying a module, update dependency-map.md in the same commit. Register new modules, update relationship columns.
7. **Feature Registry**: When adding a feature, register it in features.md in the same commit.
8. **Session Handoff**: At session end, update project-state.md Quick Summary so the next session has context.

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
