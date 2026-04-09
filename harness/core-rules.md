# Musher

This project uses Musher for structured AI-assisted development.
Skills and agents work together through shared state files — invoke them as needed.

## Session Start

Read `docs/project-state.md` first. If all state files are empty, run `bootstrap` skill.

## Workflow

- First time / empty state → run `bootstrap`
- Session start → run `sprint-manager` to check status
- New feature → run `planner` before coding
- Before commit → run `reviewer`
- Bug or issue → run `investigate`
- Session end → run `learn`
- Direction change → run `pivot`

## State Files

- docs/project-state.md — current sprint/story and quick summary
- docs/failure-patterns.md — known pitfalls (FP-NNN)
- docs/dependency-map.md — module dependency graph
- docs/features.md — feature registry
- docs/project-brief.md — project vision, goals, and non-goals
