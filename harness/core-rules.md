# Musher

This project uses Musher for structured AI-assisted development.
Skills and agents work together through shared state files — invoke them as needed.

## Session Start

Read `docs/project-state.md` first. If all state files are empty, run `bootstrap` skill.
If `.harness/my-context.md` exists, read it for personal environment and preferences.

## Workflow

- First time / empty state → run `bootstrap`
- Session start → run `sprint-manager` to check status
- Structural / design change → run `architect` before planner
- New feature → run `planner` before coding
- Before commit → run `reviewer`
- PR review → run `code-review-pr`
- Bug or issue → run `investigate`
- Before deploy / release → run `deployment`
- Session end → run `learn`
- Direction change → run `pivot`

## State Files

- docs/project-state.md — current sprint/story and quick summary
- docs/failure-patterns.md — known pitfalls (FP-NNN)
- docs/dependency-map.md — module dependency graph
- docs/features.md — feature registry
- docs/project-brief.md — project vision, goals, and non-goals

## Iron Laws

These laws are enforced across all skills and agents. Violations should be flagged immediately.

1. **Mock Sync**: When you modify an interface, update corresponding mocks in the same commit.
2. **Type Check**: Before calling a constructor or factory, read the actual source file to verify parameters.
3. **Scope Compliance**: Do not modify files outside the current Story scope without reporting first.
4. **Security**: Never include credentials, passwords, or API keys in code or commits.
5. **3-Failure Stop**: If the same approach fails 3 times, stop and report to the user.
6. **Dependency Map**: When adding or modifying a module, update dependency-map.md in the same commit.
7. **Feature Registry**: When adding a feature, register it in features.md in the same commit.
8. **Session Handoff**: At session end, update project-state.md Quick Summary so the next session has context.
