# Changelog

All notable changes to Musher Engineering are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.9.2] - 2026-04-22

### Added
- Antigravity IDE support (GEMINI.md dispatcher, .gemini/ skills & agents)
- Navigation Dispatcher improvements

## [0.9.1] - 2026-04-21

### Fixed
- Codex IDE agent format (TOML)
- CLI flag parsing improvements

## [0.9.0] - 2026-04-20

### Added
- Codex IDE support (AGENTS.md dispatcher)
- 6 IDE support complete

## [0.8.4] - 2026-04-19

### Added
- `validate` CLI command for state file content verification
- `doctor` CLI command for installation health check

## [0.8.3] - 2026-04-18

### Added
- Crew Artifact Integration (🟣 Pipeline)
- Artifact Index and Validation Tracker generation
- Auto-detection of crew artifacts in docs/crew/, docs/PM/, docs/Analyst/, docs/ARB/

## [0.8.0] - 2026-04-15

### Added
- 🧭 Navigation Dispatcher with turn-by-turn guidance
- 5 Pipelines (🟢🔵🔴🟡🟣)
- Confirm-First gate in planner
- Wave-Level Pacing in sprint-manager
- Recalculating Mode in investigate skill
- 100-point quality audit in reviewer

## [0.7.2] - 2026-04-10

### Changed
- Delegate team conventions to project-brief.md
- Remove prescriptive rules from dispatcher

## [0.6.5] - 2026-04-05

### Added
- `architect` agent (design review gate)
- `deployment` skill (pre-deployment checklist)
- `code-review-pr` skill (PR review)
- Iron Laws enforcement across all agents
- CLI `--batch` mode
- Merge conflict SOP
- Direction drift detection in `learn` skill

## [0.6.0] - 2026-03-25

### Added
- Team Mode with shared/personal state separation
- 6 Team Rules (Pre-Pull, Owner, Read-Only, Append-Only, Pivot Lock, FP Promotion)
- `impact-analysis` skill
- `feature-breakdown` skill

## [0.5.0] - 2026-03-15

### Added
- Initial release
- 6 IDE support (VS Code, Claude Code, Cursor, Codex, Windsurf, Antigravity)
- 8 skills (bootstrap, learn, pivot, test-integrity, security-checklist, investigate, impact-analysis, feature-breakdown)
- 3 agents (planner, reviewer, sprint-manager)
- Direction Guard
- 5 state files
- Solo and Team modes
- CLI with `init` command

[0.9.2]: https://github.com/AIDD-Projects/harness/compare/v0.9.1...v0.9.2
[0.9.1]: https://github.com/AIDD-Projects/harness/compare/v0.9.0...v0.9.1
[0.9.0]: https://github.com/AIDD-Projects/harness/compare/v0.8.4...v0.9.0
[0.8.4]: https://github.com/AIDD-Projects/harness/compare/v0.8.3...v0.8.4
[0.8.3]: https://github.com/AIDD-Projects/harness/compare/v0.8.0...v0.8.3
[0.8.0]: https://github.com/AIDD-Projects/harness/compare/v0.7.2...v0.8.0
[0.7.2]: https://github.com/AIDD-Projects/harness/compare/v0.6.5...v0.7.2
[0.6.5]: https://github.com/AIDD-Projects/harness/compare/v0.6.0...v0.6.5
[0.6.0]: https://github.com/AIDD-Projects/harness/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/AIDD-Projects/harness/releases/tag/v0.5.0
