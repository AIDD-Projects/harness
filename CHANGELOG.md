# Changelog

All notable changes to kode:harness and its harness engineering approach are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Product branding transition: previous brand → `kode:harness`
- Positioning update: harness engineering is now described as the direction-management approach behind kode:harness

## [0.8.3] - 2026-04-18

### Fixed
- Token Efficiency improvements (S1-S4)
- FR Coverage cross-validation
- `learn` skill Completion Gate enforcement
- Agent Chaining terminology unification
- OSS keyword sanitization: replace internal service names with generic terms across all files
- `--crew` flag hidden from `--help` output (functionality preserved)

### Added
- `--crew` flag for conditional crew pipeline content (v0.8.2)
- Navigation UX improvements, planner state-write enforcement (v0.8.1)
- `scripts/qa-check.sh` — automated QA validation script (12 categories, macOS/Linux)
- `docs/qa/release-checklist.md` — Crew Integration compatibility checklist (§7)
- Crew Integration Architecture section in `copilot-instructions.md`

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

[0.8.3]: https://github.com/AIDD-Projects/harness/compare/v0.8.0...v0.8.3
[0.8.0]: https://github.com/AIDD-Projects/harness/compare/v0.7.2...v0.8.0
[0.7.2]: https://github.com/AIDD-Projects/harness/compare/v0.6.5...v0.7.2
[0.6.5]: https://github.com/AIDD-Projects/harness/compare/v0.6.0...v0.6.5
[0.6.0]: https://github.com/AIDD-Projects/harness/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/AIDD-Projects/harness/releases/tag/v0.5.0
