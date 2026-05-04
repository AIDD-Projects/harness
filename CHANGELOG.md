# Changelog

All notable changes to kode:harness and its harness engineering approach are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Pre-1.0 stability notice.** kode:harness is in active 0.x development. Per SemVer §4, the public surface (CLI flags, state file shapes, skill/agent contracts) may change between any two minor versions. v1.0.0 will be cut only after the IDE compatibility matrix and the 11 skills + 4 agents stay frozen for 30 days alongside external production usage. Until then, breaking changes will be flagged in the **Changed** section of each release.

## [Unreleased]

## [0.10.0] - 2026-05-04

### Added
- **Common Mode Confidence Loop** — common/non-crew users now get a Goal Card, required proof, and quiet next action instead of long navigator chatter.
- **Evidence-Gated Progress Board** — `lead` surfaces Story state as `Planned → Implementing → Proof Pending → Proven → Reviewed`, with evidence and blockers visible.
- **Proof Ledger** — `reviewer`, `wrap-up`, and `project-state.md` now use compact proof records: evidence, result, and command/observation.
- **Done Definition / Success Proof** — `project-brief.md` template now asks common users to define what releasable means and how it will be proven.
- **Content regression tests + QA checks** — init tests and `qa-check.sh` now verify the v0.10 confidence-loop contracts are present in generated outputs.

### Changed
- **Quiet Navigator** — the mandatory 🧭 block stays, but common-mode guidance is now shorter and evidence-first: Goal, Evidence, Next, Prompt, Why, Pipeline.
- **Drift guard expanded** — `scripts/check-harness-drift.js` now checks the generated VS Code core dispatcher as well as skills and agents.

### Verified
- Tests PASS
- `npm run harness:check-drift` PASS
- `bash scripts/qa-check.sh` PASS

## [0.9.7] - 2026-05-01

### Added
- **Drift guard** between `harness/` (Source of Truth) and the repo-committed `.github/` files. New script `scripts/check-harness-drift.js` re-runs `init` into a tmp directory and diffs `.github/skills` + `.github/agents`; npm scripts `harness:check-drift` and `harness:sync` make the workflow explicit.
- **Source of Truth statement** in `CONTRIBUTING.md` — `harness/` is canonical, `.github/` (and the `.claude/`, `.cursor/`, `.codex/`, `.windsurf/`, `.agents/` siblings) are generated outputs. Drift = bug.
- **Concrete `project-brief.md` example** — the shipped template now carries kode:harness's own Vision / Goals / Non-Goals / Target Users alongside the placeholders, so first-time `setup` users see what "good" looks like.
- **README ecosystem positioning** — clarified kode:harness's role inside the kode:vibe ecosystem (execution layer between planning and infrastructure layers) and added an explicit IDE selection guide so newcomers can pick the right `--ide` without trial-and-error.
- **Verification-first reviewer gate** — reviewer now blocks review completion when tests fail or no working proof is available. This keeps the navigator focused on runnable evidence, not procedural chatter.

### Verified
- Tests still PASS
- `npm run harness:check-drift` PASS
- `bash scripts/qa-check.sh` PASS

## [0.9.6] - 2026-04-30

### Added
- **Init overwrite backups** — when `init` refreshes existing IDE config files, the previous file is now copied to `.harness/init-backups/<timestamp>/...` before being overwritten. State files keep the existing `--overwrite` protection behavior.

### Changed
- **pm naming cleanup** — user-facing shipped files now refer to the `pm` agent instead of the legacy `Planner` label. Migration guidance such as `planner.md` → `pm.md` remains intact where it is needed.

### Fixed
- **LICENSE branding** — copyright holder text now uses `kode:harness contributors` instead of the legacy Musher branding.

### Verified
- 175/175 tests PASS
- `bash scripts/qa-check.sh` 1–10 PASS
- `npm pack --dry-run` PASS

## [0.9.5] - 2026-04-29

### Fixed
- **Iron Laws consistency** — `harness/agents/reviewer.md` carried a stale 8-law copy of the Iron Laws (missing #9 Common First, #10 Self-Verify). Replaced the embedded copy with a single reference to `harness/core-rules.md` § Iron Laws (the canonical source). Reviewer continues to enforce all 10 laws.
- **Dispatcher synchronization** — `.github/copilot-instructions.md` (this repo's own dispatcher) was missing the three 🟣 Crew Pipeline blocks present in `harness/core-rules.md` (the distributed template). Added the blocks so both dispatchers tell the same truth.

### Changed
- **Lightness budget recalibration** — `scripts/qa-check.sh` §1 budgets adjusted with rationale comment:
  - Total tokens: 35K → 40K
  - Dispatcher: 1300 → 1500 words
  - Per-file: 2300 → 2500 words
  - The v0.8 budgets did not account for v0.9.x feature additions (Iron Law #9/#10, 🟣 Crew Pipeline, state-check skill, IDE adapter doc-cite comments). Recalibrated to provide realistic headroom while preserving OSS lightness intent (still ≤50% of typical context window).
- **`harness/skills/setup.md`** — removed the "Embedded Knowledge" section (Session Bootstrap Protocol, Workflow Pipeline, State File Size Limits) which duplicated information already authoritative in `core-rules.md` and skill-specific docs. Anti-patterns table retained.
- **`harness/agents/pm.md`** — trimmed philosophical asides ("by design", "defense-in-depth", "why" rationales) without touching any decision logic. All Confirmation Gates, MANDATORY blocks, state file write order, Self-Verify (Iron Law #10), and Direction Alignment checkpoint actions are preserved.

### Verified
- 174/174 tests PASS
- `bash scripts/qa-check.sh` 1–10 PASS
  - `§1 경량성 예산`: 4/4 ✅
  - `§10 IDE 어댑터 경로 회귀`: 4/4 ✅

## [0.9.4] - 2026-04-29

### Fixed
- **All 6 IDE adapters re-aligned with official documentation** — every generator now cites its source of truth in code comments:
  - **Antigravity** (critical fix): was generating `.gemini/skills/` and `.gemini/agents/` plus a project-root `GEMINI.md`, contradicting [antigravity.google/docs/skills](https://antigravity.google/docs/skills) and [/docs/rules-workflows](https://antigravity.google/docs/rules-workflows). Now writes `.agents/skills/<name>/SKILL.md` and `.agents/rules/*.md`; project-root `GEMINI.md` removed (the spec defines GEMINI.md only at the global `~/.gemini/GEMINI.md`).
  - **Codex** (format fix): subagents were emitted as Markdown; the official [Codex CLI subagents docs](https://developers.openai.com/codex/subagents) require TOML with `name`, `description`, `developer_instructions` fields. Now writes `.codex/agents/*.toml`.
  - **Cursor** (scope fix): unofficial `.cursor/skills/` and `.cursor/agents/` paths replaced with the cross-tool open Agent Skills standard at `.agents/skills/`, plus per-agent rules at `.cursor/rules/<agent>.mdc`.
  - **VS Code, Claude Code, Windsurf**: re-verified, no changes required.
- **Doctor / `detectExistingInstall` markers** updated to match the new layout (`.agents/rules/core.md` for Antigravity, `.codex/agents/reviewer.toml` for Codex).

### Added
- **Regression assertions** in `tests/init.test.js` to prevent reintroducing the removed paths (`.gemini/`, `.cursor/skills/`, `.cursor/agents/`, project-root `GEMINI.md`).

## [0.9.3] - 2026-04-29

### Fixed
- **OSS templates** — replaced legacy `Musher` / `musher-engineering` references with `kode:harness` / `harness-engineering` across `harness/core-rules.md`, `harness/project-brief.md`, `harness/skills/setup.md`, `harness/skills/wrap-up.md`.

## [0.9.2] - 2026-04-28

### Added
- **`state-check` skill** — deterministic state file consistency verification (invoked before STATUS: DONE)
- **Iron Law #10 (Self-Verify)** — every agent must run `state-check` before reporting STATUS: DONE; FAIL blocks DONE
- **Confirmation Gate Defaults** — SAFE defaults when user does not respond (pm: hold plan write; lead: block out-of-scope edits; reviewer: hold commit)
- **CI Artifact Index** — crew-mode reference layer for company CI standards (read-only guidance for AI agents)
- **agent-memory legacy migration** in `setup` — auto-migrates `planner` → `pm`, `sprint-manager` → `lead`

### Fixed
- **Multi-IDE installation support** — Cursor, Claude Code, Codex, and Antigravity generators corrected for v0.9.x naming

## [0.9.1] - 2026-04-27

### Added
- **pm Roadmap Planning (Step 0.7)** — pm agent now plans roadmap-level cadence before sprint breakdown
- **Sprint Completion Checkpoint** — reviewer pass (sprint all done) routes to pm checkpoint for retrospective and next-sprint planning
- **Chaining Map update** — explicit `reviewer (pass, sprint all done) → pm checkpoint` transition in copilot-instructions

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

[0.10.0]: https://github.com/AIDD-Projects/harness/compare/v0.9.7...v0.10.0
[0.9.7]: https://github.com/AIDD-Projects/harness/compare/v0.9.6...v0.9.7
[0.9.6]: https://github.com/AIDD-Projects/harness/compare/v0.9.5...v0.9.6
[0.9.5]: https://github.com/AIDD-Projects/harness/compare/v0.9.4...v0.9.5
[0.9.4]: https://github.com/AIDD-Projects/harness/compare/v0.9.3...v0.9.4
[0.9.3]: https://github.com/AIDD-Projects/harness/compare/v0.9.2...v0.9.3
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
