# K-Harness

Project Direction Management Framework for LLM-Driven Development.

## What It Does

K-Harness manages your **project's direction** — goals, decisions, scope — so LLM coding agents stay aligned across sessions. It combines BMAD's systematic project management with gstack's simplicity: zero dependencies, IDE-native format generation, and minimal context overhead.

- **Direction Guard** — Every coding request is checked against project goals/non-goals before execution
- **State Files** — 5 markdown files that persist project knowledge across LLM sessions
- **Skills** — Step-by-step procedures for planning, review, debugging, and direction changes
- **Agents** — Role-based personas that enforce the workflow (planner, reviewer, sprint-manager)
- **Failure Patterns** — Project-specific failure log that prevents repeat mistakes
- **Decision Log** — Records why decisions were made so LLMs don't re-debate settled choices

## Quick Start

```bash
npx k-harness init
```

Select your IDE when prompted. Files are installed into the current directory.

After installation, ask your LLM to run the `bootstrap` skill:

> "Run bootstrap to onboard this project."

This scans your codebase and fills all 5 state files automatically.

### Non-interactive

```bash
npx k-harness init --ide vscode
npx k-harness init --ide claude
npx k-harness init --ide cursor
npx k-harness init --ide codex
npx k-harness init --ide windsurf
npx k-harness init --ide augment
npx k-harness init --ide antigravity
```

### Options

| Flag | Description |
|------|-------------|
| `--ide <name>` | Target IDE: `vscode`, `claude`, `cursor`, `codex`, `windsurf`, `augment`, `antigravity` |
| `--dir <path>` | Target directory (default: current directory) |
| `--overwrite` | Overwrite existing files |

## Supported IDEs

| IDE | Global Rules | File-Scoped Rules | Skills | Agents |
|-----|-------------|-------------------|--------|--------|
| **VS Code Copilot** | `.github/copilot-instructions.md` | `.vscode/instructions/*.instructions.md` | `.github/skills/*/SKILL.md` | `.github/agents/*.agent.md` |
| **Claude Code** | `CLAUDE.md` | (merged into CLAUDE.md) | `.claude/skills/*/SKILL.md` | (merged into CLAUDE.md) |
| **Cursor** | `.cursor/rules/core.mdc` | `.cursor/rules/*.mdc` | (merged into rules) | (merged into rules) |
| **Codex** | `AGENTS.md` | (merged into AGENTS.md) | `.agents/skills/*/SKILL.md` | (merged into AGENTS.md) |
| **Windsurf** | `.windsurfrules` | (merged) | (merged) | (merged) |
| **Augment Code** | `.augment/rules/core.md` | `.augment/rules/*.md` | `.augment/skills/*/SKILL.md` | `.augment/skills/*/SKILL.md` |
| **Google Antigravity** | `.agent/rules/core.md` | `.agent/rules/*.md` | `.agent/skills/*/SKILL.md` | `.agent/skills/*/SKILL.md` |

All IDEs also get state files (`project-state.md`, `project-brief.md`, `features.md`, `failure-patterns.md`, `dependency-map.md`) in the `docs/` directory.

## What Gets Installed

### Rules (always active)
- **Core Rules** — Architecture enforcement, Iron Laws, completion protocol, concreteness rules
- **Testing Rules** — Mock synchronization, forbidden patterns (applied to test files)
- **Backend Rules** — Dependency inversion, type safety, explicit staging (applied to source files)

### Skills (on-demand procedures)
- **bootstrap** — Onboard project into K-Harness: scans codebase + fills state files automatically
- **learn** — End-of-session wrap-up: captures failure patterns, updates project state
- **pivot** — Propagate direction changes across all state files when goals/tech/scope changes
- **test-integrity** — Verify mock/interface synchronization before committing
- **security-checklist** — Pre-commit security risk scan
- **investigate** — 4-phase systematic debugging (evidence → scope → fix → verify)
- **impact-analysis** — Assess change blast radius before modifying shared modules
- **feature-breakdown** — Decompose features into dependency-ordered implementation tasks

### Agents (role-based personas)
- **planner** — Feature planning, dependency analysis, Direction Alignment (goal/non-goal/decision check)
- **reviewer** — Code review + State File Audit (verifies state files were actually updated)
- **sprint-manager** — Sprint/Story state management, scope drift prevention, Next Step Recommendation

### State Files (project memory)
- **project-brief.md** — Project vision, goals, non-goals, Decision Log (the "why")
- **project-state.md** — Current sprint, stories, and progress tracking (the "where")
- **features.md** — Living feature registry so LLMs know what exists (the "what")
- **dependency-map.md** — Module dependency graph for impact analysis (the "how")
- **failure-patterns.md** — Project-specific failure patterns that prevent repeat mistakes (the "watch out")

## How It Works

### 1. Bootstrap (once)
After `k-harness init`, run the `bootstrap` skill. It scans your codebase, interviews you about goals/non-goals, and fills all 5 state files automatically. **This is the most important step** — without it, Direction Guard and other skills have no context.

### 2. Direction Guard (every request)
Before ANY coding task, the LLM reads `project-brief.md` and checks:
- Does this align with Goals? → proceed
- Does this fall under Non-Goals? → warn, suggest `pivot`
- Does this contradict a Decision Log entry? → warn, suggest `pivot`

### 3. Workflow Pipeline
```
bootstrap → planner → [code] → reviewer → sprint-manager → learn
```
- **planner**: Checks direction alignment, breaks down features
- **reviewer**: Reviews code + audits state file updates
- **sprint-manager**: Tracks progress, recommends next action
- **learn**: Captures lessons before session ends

### 4. Direction Changes
When goals, technology, or scope changes, run the `pivot` skill:
- Updates ALL 5 state files consistently
- Records the decision with reasoning in Decision Log
- Prevents silent inconsistencies across files

## Documentation

See [docs/reference.md](docs/reference.md) for detailed descriptions of every skill, agent, rule, and state file.

## Why Not BMAD or gstack?

| | BMAD v6.2.2 | gstack v0.15.1 | K-Harness |
|---|---|---|---|
| Focus | Enterprise SDLC methodology | 1-person software factory | Project direction management |
| Files | 200+ | ~40 | ~20 |
| Dependencies | Node 20+ | Bun + Node + Playwright | Zero |
| IDE support | 20+ (installer) | 5 (setup --host) | 7 (native format) |
| Direction management | ❌ | ❌ | ✅ (Direction Guard + pivot + Decision Log) |
| Cold start | ❌ | ❌ | ✅ (bootstrap) |
| State file audit | ❌ | ❌ | ✅ (reviewer Step 8) |
| Context per task | 4-6 files | 1 file | 2-3 files |

## License

MIT
