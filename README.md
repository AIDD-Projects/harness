<div align="right">
  <a href="README.ko.md"><img src="https://img.shields.io/badge/lang-한국어-blue.svg" alt="한국어"></a>
</div>

# kode:harness

[![npm version](https://img.shields.io/npm/v/@kodevibe/harness.svg)](https://www.npmjs.com/package/@kodevibe/harness)
[![npm downloads](https://img.shields.io/npm/dm/@kodevibe/harness.svg)](https://www.npmjs.com/package/@kodevibe/harness)
[![CI](https://github.com/AIDD-Projects/harness/actions/workflows/ci.yml/badge.svg)](https://github.com/AIDD-Projects/harness/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Keep every developer's AI aligned on one project direction.**

kode:harness is built on **harness engineering** for multi-developer, enterprise-grade AI-assisted development.

> **v0.8.4** — 6 IDE support, Navigation Dispatcher, 5 Pipelines ( 🟢🔵🔴🟡🟣), Crew Artifact Integration, EXTERNAL_DEP classification.

## From Harness to Enterprise Harness Engineering

The concept of an AI "harness" — structured markdown files that guide LLM coding agents — has become a foundational pattern in AI-assisted development. Frameworks like BMAD, gstack, and GSD pioneered this approach for **solo developers**.

This approach takes harness engineering beyond solo tooling. It evolves the harness concept into an **enterprise-grade direction management method** for both multi-developer teams and solo developers. **kode:harness** is the product form of that approach.

| | Traditional Harness | kode:harness + harness engineering |
|---|---|---|
| Target | Solo developer | **Multi-developer teams** |
| Focus | What the AI does | **Where the AI is going** |
| Direction management | ❌ | ✅ Direction Guard + pivot + Decision Log |
| Team state sharing | ❌ | ✅ Shared/personal state separation |
| Token budget | 200+ files | **~25 files (~17K tokens)** — works with small LLMs too |

## The Problem

When one developer uses an AI coding assistant, direction stays consistent. But in **enterprise teams**, each developer runs their own AI sessions — and each AI drifts independently. Developer A's AI refactors toward microservices while Developer B's AI doubles down on the monolith. Without shared direction management, **AI agents across multiple developers pull the project apart.**

kode:harness solves this. It gives every developer's AI the same goals, non-goals, decisions, and project state — so all AI sessions converge on **one direction**, regardless of who's coding or which IDE they use.

## What It Does

kode:harness manages your **project's direction** — goals, decisions, scope — so LLM coding agents stay aligned **across developers and sessions**. Zero dependencies, 6 IDE support, native format generation. The underlying approach is harness engineering for multi-developer and enterprise-grade execution.

- **Direction Guard** — Every coding request is checked against project goals/non-goals before execution
- **Navigation Dispatcher** — 🧭 Turn-by-Turn navigation guides developers through 5 pipelines with explicit next-step prompts
- **5 Pipelines** — 🟢 New Dev → 🟕 Continue → 🟤 Bug Fix → 🟡 Direction Change → 🟣 Crew-Driven (external planning artifact integration)
- **Crew Artifact Integration** — Reads external planning output (PRD, Architecture, ARB Checklist) directly — no manual copy needed
- **State Files** — 5 markdown files that persist project knowledge across LLM sessions
- **Skills** — Step-by-step procedures for planning, review, debugging, and direction changes
- **Agents** — Role-based personas that enforce the workflow (planner, reviewer, sprint-manager)
- **Failure Patterns** — Project-specific failure log that prevents repeat mistakes
- **Decision Log** — Records why decisions were made so LLMs don't re-debate settled choices

## Quick Start

```bash
# Solo mode (default)
npx @kodevibe/harness init

# Team mode (multi-developer)
npx @kodevibe/harness init --team
```

Select your IDE when prompted. Files are installed into the current directory.

After installation, ask your LLM to run the `bootstrap` skill:

> "Run bootstrap to onboard this project."

This scans your codebase and fills all 5 state files automatically.

### Non-interactive

```bash
npx @kodevibe/harness init --ide vscode
npx @kodevibe/harness init --ide claude
npx @kodevibe/harness init --ide cursor
npx @kodevibe/harness init --ide codex
npx @kodevibe/harness init --ide windsurf
npx @kodevibe/harness init --ide antigravity
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
# Verify kode:harness files are installed
npx @kodevibe/harness doctor

# Verify state files have real content (not just placeholders)
npx @kodevibe/harness validate
```

### IDE Configuration (Optional)

Large projects with crew artifacts may require increased turn limits:

| IDE | Setting | Recommended |
|-----|---------|-------------|
| VS Code | `chat.agent.maxRequests` in settings.json | `100` |
| Cursor | Auto-managed | Default OK |
| Windsurf | Auto-managed | Default OK |
| Claude Code | Terminal-based | Default OK |

> This is only needed when running `bootstrap` with crew artifacts on projects that have many existing frameworks. Normal coding/review operations work within default limits.

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
- **Core Rules** — 136-line dispatcher: session start guidance, workflow references, state file list, and Iron Laws. Detailed rules are embedded in each skill/agent that enforces them.

### Skills (on-demand procedures)
- **bootstrap** — Onboard project into kode:harness: scans codebase + fills state files automatically
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
After `harness init`, run the `bootstrap` skill. It scans your codebase, interviews you about goals/non-goals, and fills all 5 state files automatically. **This is the most important step** — without it, Direction Guard and other skills have no context.

### 2. Direction Guard (every request)
Before ANY coding task, the LLM reads `project-brief.md` and checks:
- Does this align with Goals? → proceed
- Does this fall under Non-Goals? → warn, suggest `pivot`
- Does this contradict a Decision Log entry? → warn, suggest `pivot`

### 3. Workflow Pipeline
```
bootstrap → planner → [code] → reviewer → sprint-manager → learn
```

kode:harness provides **5 pipelines** for different scenarios:

| Pipeline | When | Flow |
|---|---|---|
| 🟢 New Dev | First feature | bootstrap → planner → sprint-manager → [code] → reviewer → learn |
| 🔵 Continue | Resuming work | sprint-manager → [code] → reviewer → learn |
| 🔴 Bug Fix | Debugging | investigate → [fix] → reviewer → learn |
| 🟡 Direction Change | Goals/tech shift | pivot → planner → sprint-manager → [code] → reviewer → learn |
| 🟣 Crew-Driven | With external planning artifacts | bootstrap(crew) → planner → sprint-manager → [code] → reviewer → learn |

Each step ends with a 🧭 **Navigation block** telling you exactly what to do next — including the prompt to type.

- **planner**: Checks direction alignment, breaks down features. **Confirm-First gate** — won't proceed without your approval.
- **reviewer**: Reviews code + audits state file updates
- **sprint-manager**: Tracks progress via **Wave-Level Pacing** — runs tests between implementation waves
- **learn**: Captures lessons before session ends
- **investigate**: **Recalculating Mode** — after 3 failed attempts, proposes alternative approaches

### 4. Direction Changes
When goals, technology, or scope changes, run the `pivot` skill:
- Updates ALL 5 state files consistently
- Records the decision with reasoning in Decision Log
- Prevents silent inconsistencies across files

## Team Mode

This is where harness engineering matters most. When multiple developers each run their own AI sessions, direction divergence is inevitable — unless you have shared guardrails.

```bash
npx @kodevibe/harness init --team
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

These 8 rules are enforced across all skills and agents. They form the quality backbone of every kode:harness project managed with harness engineering.

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

## Why kode:harness?

### The Core Insight

Existing AI coding frameworks focus on **what the AI does** (generate code, run tests, deploy). kode:harness focuses on **where the AI is going** — ensuring every developer's AI moves in the same direction. harness engineering is the discipline that keeps the whole team on course.

### Crew Artifact Integration (🟣 Pipeline)

If your team uses an **external planning tool** (or any tool that produces PRD, Architecture, ARB Checklist documents), kode:harness reads them directly:

```bash
npx @kodevibe/harness init
# Then ask your LLM:
> "crew 산출물을 기반으로 프로젝트를 세팅해줘"
```

Bootstrap auto-detects crew artifacts in `docs/crew/`, `docs/PM/`, `docs/Analyst/`, `docs/ARB/` and creates:
- **Artifact Index** — maps every crew document with path, role, and key contents
- **Validation Tracker** — tracks KPI coverage, FR coverage, and ARB Fail resolution across Stories

Original crew documents are **never modified**. Only the index and tracker are created.

### Comparison

| | BMAD v6.2.2 | gstack v0.15.1 | GSD v1.33.0 | kode:harness |
|---|---|---|---|---|
| Focus | Enterprise SDLC methodology | 1-person software factory | Full lifecycle automation | **Multi-developer direction alignment** |
| Files | 200+ | ~40 | Hundreds | ~25 |
| Dependencies | Node 20+ | Bun + Node + Playwright | Node 18+ | Zero |
| IDE support | 20+ (installer) | 5 (setup --host) | 13 (runtime select) | 6 (native format) |
| Direction management | ❌ | ❌ | ❌ | ✅ (Direction Guard + pivot + Decision Log) |
| Iron Laws (code quality rules) | ❌ | ❌ | ❌ | ✅ (8 laws embedded in skills) |
| Cold start | ❌ | ❌ | `/gsd-new-project` | ✅ (`bootstrap` skill) |
| Context per task | 4-6 files | 1 file | Fresh 200k per plan | 2-3 files (136-line dispatcher) |

## Roadmap

kode:harness is at **v0.8.4** — 6 IDE support complete, Navigation Dispatcher and Crew Artifact Integration stable.

| Phase | Version | Status | Focus |
|---|---|---|---|
| **Foundation** | v0.5.0 | ✅ Done | Core framework: 6 IDE support, 8 skills, 3 agents, Team Mode, Direction Guard |
| **Hardening** | v0.6.5 | ✅ Done | 10 skills, 4 agents, Iron Laws, CLI batch/doctor/validate, merge conflict SOP, direction drift detection |
| **Flexibility** | v0.7.x | ✅ Done | Delegate team conventions to project-brief.md, remove prescriptive rules |
| **Navigation** | v0.8.x | ✅ Current | 🧭 Navigation Dispatcher, 5 Pipelines, Crew Artifact Integration, 100-point quality audit, Confirm-First gate, Wave-Level Pacing, Recalculating Mode |
| **Validation** | v1.0 | 🔜 Next | Real-world project adoption, user feedback collection |

### What's Next

- [ ] Pilot: Run external planning artifacts through kode:harness's 🟣 pipeline on a real project
- [ ] Adopt kode:harness in real projects and collect usage data
- [ ] Document case studies: solo vs team, crew vs no-crew
- [ ] Gather user feedback on friction points and missing features
- [ ] Iterate based on real-world evidence, not assumptions

## Contributing & Feedback

kode:harness is in active development and we'd love your input.

- **Bug reports & feature requests** → [GitHub Issues](https://github.com/AIDD-Projects/harness/issues)
- **Discussions & ideas** → [GitHub Discussions](https://github.com/AIDD-Projects/harness/discussions)
- **Try it on your project** → `npx @kodevibe/harness init` and tell us what works (or doesn't)

We're especially interested in:
- How Direction Guard performs in teams of 3+ developers
- Whether the 6 Team Rules (Pre-Pull, Owner, Read-Only, etc.) are sufficient or need more
- Which IDE integrations need improvement
- What skills or agents are missing for your workflow

## License

MIT
