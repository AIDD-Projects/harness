# Changelog

All notable changes to kode:harness and its harness engineering approach are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.9.0] - 2026-04-27

### Changed
- **Naming Redesign**: All skills and agents renamed for clarity and discoverability
  - Skills: `bootstrap` → `setup`, `feature-breakdown` → `breakdown`, `code-review-pr` → `pr-review`, `investigate` → `debug`, `impact-analysis` → `check-impact`, `test-integrity` → `sync-tests`, `security-checklist` → `secure`, `deployment` → `release`, `learn` → `wrap-up`
  - Agents: `planner` → `pm`, `sprint-manager` → `lead`
  - `architect` and `reviewer` agents, `pivot` skill unchanged
- All IDE generators updated to emit new names (vscode, claude, cursor, codex, windsurf, antigravity)
- Documentation, tests, and QA scripts updated across the board

## [0.8.4] - 2026-04-26

### Changed
- Product branding transition: previous brand → `kode:harness`
- Positioning update: harness engineering is now described as the direction-management approach behind kode:harness

### Added
- `EXTERNAL_DEP` classification in `breakdown` skill — guides LLM to define mock boundary interfaces before implementing modules with external process/service dependencies (DB, Docker, message queue, network API)

## [0.8.3] - 2026-04-18

### Fixed
- Token Efficiency improvements (S1-S4)
- FR Coverage cross-validation
- `wrap-up` skill Completion Gate enforcement
- Agent Chaining terminology unification
- OSS keyword sanitization: replace internal service names with generic terms across all files
- `--crew` flag hidden from `--help` output (functionality preserved)

### Added
- `--crew` flag for conditional crew pipeline content (v0.8.2)
- Navigation UX improvements, pm state-write enforcement (v0.8.1)
- `scripts/qa-check.sh` — automated QA validation script (12 categories, macOS/Linux)
- `docs/qa/release-checklist.md` — Crew Integration compatibility checklist (§7)
- Crew Integration Architecture section in `copilot-instructions.md`

## [0.8.0] - 2026-04-15

### Added
- 🧭 Navigation Dispatcher with turn-by-turn guidance
- 5 Pipelines (🟢🔵🔴🟡🟣)
- Confirm-First gate in pm
- Wave-Level Pacing in lead
- Recalculating Mode in debug skill
- 100-point quality audit in reviewer

## [0.7.2] - 2026-04-10

### Changed
- Delegate team conventions to project-brief.md
- Remove prescriptive rules from dispatcher

## [0.6.5] - 2026-04-05

### Added
- `architect` agent (design review gate)
- `release` skill (pre-release checklist)
- `pr-review` skill (PR review)
- Iron Laws enforcement across all agents
- CLI `--batch` mode
- Merge conflict SOP
- Direction drift detection in `wrap-up` skill

## [0.6.0] - 2026-03-25

### Added
- Team Mode with shared/personal state separation
- 6 Team Rules (Pre-Pull, Owner, Read-Only, Append-Only, Pivot Lock, FP Promotion)
- `check-impact` skill
- `breakdown` skill

## [0.5.0] - 2026-03-15

### Added
- Initial release
- 6 IDE support (VS Code, Claude Code, Cursor, Codex, Windsurf, Antigravity)
- 8 skills (setup, wrap-up, pivot, sync-tests, secure, debug, check-impact, breakdown)
- 3 agents (pm, reviewer, lead)
- Direction Guard
- 5 state files
- Solo and Team modes
- CLI with `init` command

[0.8.4]: https://github.com/AIDD-Projects/harness/compare/v0.8.3...v0.8.4
[0.8.3]: https://github.com/AIDD-Projects/harness/compare/v0.8.0...v0.8.3
[0.8.0]: https://github.com/AIDD-Projects/harness/compare/v0.7.2...v0.8.0
[0.7.2]: https://github.com/AIDD-Projects/harness/compare/v0.6.5...v0.7.2
[0.6.5]: https://github.com/AIDD-Projects/harness/compare/v0.6.0...v0.6.5
[0.6.0]: https://github.com/AIDD-Projects/harness/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/AIDD-Projects/harness/releases/tag/v0.5.0
