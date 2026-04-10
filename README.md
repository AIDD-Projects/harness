# Musher

[![npm version](https://img.shields.io/npm/v/musher-engineering.svg)](https://www.npmjs.com/package/musher-engineering)
[![npm downloads](https://img.shields.io/npm/dm/musher-engineering.svg)](https://www.npmjs.com/package/musher-engineering)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Keep every developer's AI aligned on one project direction.**

> **v0.6.3** — Hardened framework with 10 skills, 4 agents, Iron Laws, and CLI health checks.

## The Problem

When one developer uses an AI coding assistant, direction stays consistent. But in **enterprise teams**, each developer runs their own AI sessions — and each AI drifts independently. Developer A's AI refactors toward microservices while Developer B's AI doubles down on the monolith. Without shared direction management, **AI agents across multiple developers pull the project apart.**

Musher Engineering solves this. It gives every developer's AI the same goals, non-goals, decisions, and project state — so all AI sessions converge on **one direction**, regardless of who's coding or which IDE they use.

## What It Does

Musher manages your **project's direction** — goals, decisions, scope — so LLM coding agents stay aligned **across developers and sessions**. Zero dependencies, 6 IDE support, native format generation.

- **Direction Guard** — Every coding request is checked against project goals/non-goals before execution
- **State Files** — 5 markdown files that persist project knowledge across LLM sessions
- **Skills** — Step-by-step procedures for planning, review, debugging, and direction changes
- **Agents** — Role-based personas that enforce the workflow (planner, reviewer, sprint-manager)
- **Failure Patterns** — Project-specific failure log that prevents repeat mistakes
- **Decision Log** — Records why decisions were made so LLMs don't re-debate settled choices

## Quick Start

```bash
# Solo mode (default)
npx musher-engineering init

# Team mode (multi-developer)
npx musher-engineering init --team
```

Select your IDE when prompted. Files are installed into the current directory.

After installation, ask your LLM to run the `bootstrap` skill:

> "Run bootstrap to onboard this project."

This scans your codebase and fills all 5 state files automatically.

### Non-interactive

```bash
npx musher-engineering init --ide vscode
npx musher-engineering init --ide claude
npx musher-engineering init --ide cursor
npx musher-engineering init --ide codex
npx musher-engineering init --ide windsurf
npx musher-engineering init --ide antigravity
```

### Options

| Flag | Description |
|------|-------------|
| `--ide <name>` | Target IDE: `vscode`, `claude`, `cursor`, `codex`, `windsurf`, `antigravity` |
| `--mode <mode>` | Project mode: `solo` (default) or `team` |
| `--dir <path>` | Target directory (default: current directory) |
| `--team` | Shorthand for `--mode team` |
| `--batch` | Non-interactive mode (requires `--ide`; defaults to solo mode) |
| `--overwrite` | Overwrite existing files (including state files) |
| `--version` | Show version number |

### Health Check

```bash
# Verify Musher files are installed
npx musher-engineering doctor

# Verify state files have real content (not just placeholders)
npx musher-engineering validate
```

## Supported IDEs

| IDE | Dispatcher (always-on) | Skills | Agents |
|-----|----------------------|--------|--------|
| **VS Code Copilot** | `.github/copilot-instructions.md` | `.github/skills/*/SKILL.md` | `.github/agents/*.agent.md` |
| **Claude Code** | `.claude/rules/core.md` | `.claude/skills/*/SKILL.md` | `.claude/agents/*.md` |
| **Cursor** | `.cursor/rules/core.mdc` | `.cursor/skills/*/SKILL.md` | `.cursor/agents/*.md` |
| **Codex** | `AGENTS.md` | `.agents/skills/*/SKILL.md` | `.codex/agents/*.toml` |
| **Windsurf** | `.windsurf/rules/core.md` | `.windsurf/skills/*/SKILL.md` | *(agents installed as skills)* |
| **Antigravity** | `GEMINI.md` | `.gemini/skills/*/SKILL.md` | `.gemini/agents/*.md` |

All IDEs also get state files (`project-state.md`, `project-brief.md`, `features.md`, `failure-patterns.md`, `dependency-map.md`) in the `docs/` directory.

## What Gets Installed

### Dispatcher (always active)
- **Core Rules** — 42-line dispatcher: session start guidance, workflow references, state file list, and Iron Laws. Detailed rules are embedded in each skill/agent that enforces them.

### Skills (on-demand procedures)
- **bootstrap** — Onboard project into Musher: scans codebase + fills state files automatically
- **learn** — End-of-session wrap-up: captures failure patterns, updates project state, detects direction drift
- **pivot** — Propagate direction changes across all state files when goals/tech/scope changes
- **test-integrity** — Verify mock/interface synchronization before committing
- **security-checklist** — Pre-commit security risk scan
- **investigate** — 4-phase systematic debugging (evidence → scope → fix → verify)
- **impact-analysis** — Assess change blast radius before modifying shared modules
- **feature-breakdown** — Decompose features into dependency-ordered implementation tasks
- **code-review-pr** — Review incoming Pull Requests for quality, security, and direction alignment
- **deployment** — Pre-deployment validation checklist (tests, state files, security, versioning)

### Agents (role-based personas)
- **planner** — Feature planning, dependency analysis, Direction Alignment (goal/non-goal/decision check)
- **reviewer** — Code review + State File Audit (verifies state files were actually updated)
- **sprint-manager** — Sprint/Story state management, scope drift prevention, Next Step Recommendation
- **architect** — Design review gate: validates structural changes against project direction and module boundaries

### State Files (project memory)
- **project-brief.md** — Project vision, goals, non-goals, Decision Log (the "why")
- **project-state.md** — Current sprint, stories, and progress tracking (the "where")
- **features.md** — Living feature registry so LLMs know what exists (the "what")
- **dependency-map.md** — Module dependency graph for impact analysis (the "how")
- **failure-patterns.md** — Project-specific failure patterns that prevent repeat mistakes (the "watch out")

## How It Works

### 1. Bootstrap (once)
After `musher init`, run the `bootstrap` skill. It scans your codebase, interviews you about goals/non-goals, and fills all 5 state files automatically. **This is the most important step** — without it, Direction Guard and other skills have no context.

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

## Team Mode

This is where Musher Engineering shines. When multiple developers each run their own AI sessions, direction divergence is inevitable — unless you have shared guardrails.

```bash
npx musher-engineering init --team
```

| | Solo Mode | Team Mode |
|---|---|---|
| Shared State | `docs/` (git tracked) | `docs/` (git tracked): project-brief, features, dependency-map |
| Personal State | `docs/` (git tracked) | `.harness/` (gitignored): project-state, failure-patterns |
| Agent Memory | `docs/agent-memory/` | `.harness/agent-memory/` |
| Target | Solo developer | Enterprise team |
| Team Rules | — | Pre-Pull, Owner, Read-Only, Append-Only, Pivot Lock, FP Promotion |

**How it keeps everyone aligned:**

- **Shared state** (`project-brief.md`, `features.md`, `dependency-map.md`) is git-tracked — every developer's AI reads the same goals, non-goals, and decisions
- **Personal state** (`project-state.md`, `failure-patterns.md`) goes to `.harness/` (gitignored) — each developer tracks their own sprint progress without conflicts
- **Pre-Pull Protocol** — Before every session, AI pulls latest shared state so no one works on stale direction
- **Pivot Lock** — Direction changes require the `pivot` skill, which updates ALL state files atomically and records the decision with reasoning
- **FP Promotion** — Local failure patterns get promoted to shared `failure-patterns.md` so the whole team learns from each developer's mistakes
- **Owner Tracking** — Dependency map marks module owners to prevent accidental cross-team overwrites

## Iron Laws

These 8 rules are enforced across all skills and agents. They form the quality backbone of every Musher-managed project.

| # | Law | Enforced By |
|---|-----|-------------|
| 1 | **Mock Sync** — Interface change → update mocks in the same commit | `reviewer`, `test-integrity` |
| 2 | **Type Check** — Read the source before calling constructors. Never trust memory. | `reviewer` |
| 3 | **Scope Compliance** — Stay within current Story scope. Report before modifying out-of-scope files. | `sprint-manager`, `reviewer` |
| 4 | **Security** — No credentials, passwords, or API keys in code or commits. | `security-checklist`, `reviewer` |
| 5 | **3-Failure Stop** — Same approach fails 3 times → stop and report. | All agents |
| 6 | **Dependency Map** — New/modified module → update `dependency-map.md` in the same commit. | `reviewer`, `learn` |
| 7 | **Feature Registry** — New feature → register in `features.md` in the same commit. | `reviewer`, `learn` |
| 8 | **Session Handoff** — Session end → update `project-state.md` Quick Summary. | `learn` |

## Documentation

See [docs/reference.md](docs/reference.md) for detailed descriptions of every skill, agent, rule, and state file.

## Why Musher?

### The Core Insight

Existing AI coding frameworks focus on **what the AI does** (generate code, run tests, deploy). Musher focuses on **where the AI is going** — ensuring every developer's AI moves in the same direction. This is the difference between a dog sled where each dog runs wherever it wants, and one where a musher keeps the whole team on course.

### Comparison

| | BMAD v6.2.2 | gstack v0.15.1 | GSD v1.33.0 | Musher |
|---|---|---|---|---|
| Focus | Enterprise SDLC methodology | 1-person software factory | Full lifecycle automation | **Multi-developer direction alignment** |
| Files | 200+ | ~40 | Hundreds | ~25 |
| Dependencies | Node 20+ | Bun + Node + Playwright | Node 18+ | Zero |
| IDE support | 20+ (installer) | 5 (setup --host) | 13 (runtime select) | 6 (native format) |
| Direction management | ❌ | ❌ | ❌ | ✅ (Direction Guard + pivot + Decision Log) |
| Iron Laws (code quality rules) | ❌ | ❌ | ❌ | ✅ (8 laws embedded in skills) |
| Cold start | ❌ | ❌ | `/gsd-new-project` | ✅ (`bootstrap` skill) |
| Context per task | 4-6 files | 1 file | Fresh 200k per plan | 2-3 files (42-line dispatcher) |

## Roadmap

Musher is at **v0.6.3** — the framework has been hardened with additional skills, agents, and CLI tools.

| Phase | Version | Status | Focus |
|---|---|---|---|
| **Foundation** | v0.5.0 | ✅ Done | Core framework: 6 IDE support, 8 skills, 3 agents, Team Mode, Direction Guard |
| **Hardening** | v0.6.3 | ✅ Current | 10 skills, 4 agents, Iron Laws, CLI batch/doctor/validate, merge conflict SOP, direction drift detection |
| **Intelligence** | v0.7.0 | 🔜 Next | Smart conflict detection, cross-developer direction drift alerts, agent memory sharing |
| **Ecosystem** | v0.8.0 | Planned | Plugin system, community skill/agent marketplace, IDE extension integrations |
| **Production** | v1.0.0 | Planned | Battle-tested across enterprise teams, comprehensive docs, stable API guarantee |

### What We're Working On Now

- [ ] Git hook integration for automatic Pre-Pull verification
- [ ] CI pipeline to detect Direction Guard violations in PRs
- [ ] Real-world case studies from enterprise team adoption
- [ ] Automated state file conflict resolution for Team Mode
- [ ] Performance benchmarks: with vs without Musher Engineering

## Contributing & Feedback

Musher is in active development and we'd love your input.

- **Bug reports & feature requests** → [GitHub Issues](https://github.com/KTcorp-Opensource-Projects/musher-engineering/issues)
- **Discussions & ideas** → [GitHub Discussions](https://github.com/KTcorp-Opensource-Projects/musher-engineering/discussions)
- **Try it on your project** → `npx musher-engineering init` and tell us what works (or doesn't)

We're especially interested in:
- How Direction Guard performs in teams of 3+ developers
- Whether the 6 Team Rules (Pre-Pull, Owner, Read-Only, etc.) are sufficient or need more
- Which IDE integrations need improvement
- What skills or agents are missing for your workflow

## License

MIT
