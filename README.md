<div align="right">
  <a href="README.ko.md"><img src="https://img.shields.io/badge/lang-한국어-blue.svg" alt="한국어"></a>
</div>

# kode:harness

[![npm version](https://img.shields.io/npm/v/@kodevibe/harness.svg)](https://www.npmjs.com/package/@kodevibe/harness)
[![npm downloads](https://img.shields.io/npm/dm/@kodevibe/harness.svg)](https://www.npmjs.com/package/@kodevibe/harness)
[![CI](https://github.com/AIDD-Projects/harness/actions/workflows/ci.yml/badge.svg)](https://github.com/AIDD-Projects/harness/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Your AI coding agent forgets everything between sessions. kode:harness makes it remember — goals, decisions, failures, and project direction.**

Production-grade guardrails for AI coding agents. Prevents context rot, enforces project direction, and persists state across sessions. Works with **Copilot, Claude, Cursor, Codex, Windsurf, and Gemini**. Zero dependencies.

---

## Quick Start

```bash
npx @kodevibe/harness init          # pick your IDE
```

```bash
# Then tell your AI agent:
> "Run setup to onboard this project."
```

That's it. Your AI now has persistent memory, direction guardrails, and self-correction loops.

<details>
<summary>More install options</summary>

```bash
# Team mode (multi-developer direction alignment)
npx @kodevibe/harness init --team

# Non-interactive (CI/scripts)
npx @kodevibe/harness init --ide vscode
npx @kodevibe/harness init --ide claude
npx @kodevibe/harness init --ide cursor
npx @kodevibe/harness init --ide codex
npx @kodevibe/harness init --ide windsurf
npx @kodevibe/harness init --ide antigravity
```

| Flag | Description |
|------|-------------|
| `--ide <name>` | Target IDE: `vscode`, `claude`, `cursor`, `codex`, `windsurf`, `antigravity` |
| `--mode <mode>` | Project mode: `solo` (default) or `team` |
| `--dir <path>` | Target directory (default: current directory) |
| `--team` | Shorthand for `--mode team` |
| `--batch` | Non-interactive mode (requires `--ide`; defaults to solo mode) |
| `--overwrite` | Overwrite existing files (including state files) |
| `--version` | Show version number |

</details>

---

## The Problem: Context Rot

Your AI coding agent starts every session from zero. By session 3, it's forgotten the architecture decisions from session 1. By session 10, it's re-debating settled choices and contradicting its own earlier work.

In teams, it's worse — Developer A's AI refactors toward microservices while Developer B's AI doubles down on the monolith. **Without shared guardrails, AI agents pull the project apart.**

kode:harness solves this with three mechanisms:

| Mechanism | What it prevents |
|-----------|-----------------|
| **State Persistence** | AI forgetting goals, decisions, and progress between sessions |
| **Direction Guard** | AI drifting away from project goals or contradicting past decisions |
| **Failure Patterns** | AI repeating the same mistakes across sessions |

---

## Why not just...?

| Approach | Limitation | kode:harness difference |
|----------|-----------|------------------------|
| **`.cursorrules` / `copilot-instructions.md`** | Static. No state persistence, no self-correction, no cross-session memory. | Living state files that update every session. Direction Guard checks every request against goals. |
| **LangChain / CrewAI** | Runtime orchestration for building AI apps. Not for directing AI coding agents. | Markdown-native guardrails that work inside your IDE. No runtime, no SDK. |
| **BMAD / gstack / GSD** | Built for solo developers. 200+ files. No direction management. | ~25 files (~17K tokens). Direction Guard + Decision Log. Multi-developer team support. |
| **"I'll just be careful"** | Works until you forget. LLMs don't learn from past sessions. | Automated: `wrap-up` captures lessons, `debug` tracks failures, `reviewer` audits state. |

---

## What It Does

| Feature | Description |
|---------|-------------|
| 🛡️ **Direction Guard** | Every coding request is checked against project goals/non-goals before execution |
| 🧭 **Navigation Dispatcher** | Turn-by-Turn navigation through 5 pipelines with copy-paste next-step prompts |
| 📝 **State Persistence** | 5 markdown files that persist project knowledge across LLM sessions |
| 🔄 **5 Pipelines** | 🟢 New Dev → 🔵 Continue → 🔴 Bug Fix → 🟡 Direction Change → 🟣 Crew-Driven |
| 🛠️ **10 Skills** | Step-by-step procedures: setup, debug, breakdown, review, pivot, and more |
| 🤖 **4 Agents** | Role-based personas: pm, reviewer, lead, architect |
| ⚠️ **Failure Patterns** | Project-specific failure log that prevents repeat mistakes across sessions |
| 📋 **Decision Log** | Records why decisions were made so LLMs don't re-debate settled choices |
| 🟣 **Crew Artifact Integration** | Reads external planning output (PRD, Architecture, ARB Checklist) directly |

---

## Health Check

```bash
npx @kodevibe/harness doctor    # verify files are installed
npx @kodevibe/harness validate  # verify state files have real content
```

## Supported IDEs

| IDE | Dispatcher (always-on) | Skills | Agents |
|-----|----------------------|--------|--------|
| **VS Code Copilot** | `.github/copilot-instructions.md` | `.github/skills/*/SKILL.md` | `.github/agents/*.agent.md` |
| **Claude Code** | `CLAUDE.md` (+ `.claude/rules/core.md`) | `.claude/skills/*/SKILL.md` | `.claude/agents/*.md` |
| **Cursor** | `.cursor/rules/core.mdc` (+ `AGENTS.md`) | `.cursor/skills/*/SKILL.md` | `.cursor/agents/*.md` |
| **Codex** | `AGENTS.md` | `.agents/skills/*/SKILL.md` | `.codex/agents/*.md` |
| **Windsurf** | `.windsurf/rules/core.md` | `.windsurf/skills/*/SKILL.md` | *(agents installed as skills)* |
| **Antigravity** | `GEMINI.md` (+ `AGENTS.md`) | `.gemini/skills/*/SKILL.md` | `.gemini/agents/*.md` |

All IDEs also get state files (`project-state.md`, `project-brief.md`, `features.md`, `failure-patterns.md`, `dependency-map.md`) in the `docs/` directory.

## What Gets Installed

### Dispatcher (always active)
- **Core Rules** — 136-line dispatcher: session start guidance, workflow references, state file list, and Iron Laws. Detailed rules are embedded in each skill/agent that enforces them.

### Skills (on-demand procedures)
- **setup** — Onboard project into kode:harness: scans codebase + fills state files automatically
- **wrap-up** — End-of-session wrap-up: captures failure patterns, updates project state, detects direction drift
- **pivot** — Propagate direction changes across all state files when goals/tech/scope changes
- **sync-tests** — Verify mock/interface synchronization before committing
- **secure** — Pre-commit security risk scan
- **debug** — 4-phase systematic debugging (evidence → scope → fix → verify)
- **check-impact** — Assess change blast radius before modifying shared modules
- **breakdown** — Decompose features into dependency-ordered implementation tasks
- **pr-review** — Review incoming Pull Requests for quality, security, and direction alignment
- **release** — Pre-release validation checklist (tests, state files, security, versioning)

### Agents (role-based personas)
- **pm** — Feature planning, dependency analysis, Direction Alignment (goal/non-goal/decision check)
- **reviewer** — Code review + State File Audit (verifies state files were actually updated)
- **lead** — Sprint/Story state management, scope drift prevention, Next Step Recommendation
- **architect** — Design review gate: validates structural changes against project direction and module boundaries

### State Files (project memory)
- **project-brief.md** — Project vision, goals, non-goals, Decision Log (the "why")
- **project-state.md** — Current sprint, stories, and progress tracking (the "where")
- **features.md** — Living feature registry so LLMs know what exists (the "what")
- **dependency-map.md** — Module dependency graph for impact analysis (the "how")
- **failure-patterns.md** — Project-specific failure patterns that prevent repeat mistakes (the "watch out")

## How It Works

### 1. Bootstrap (once)
After `harness init`, run the `setup` skill. It scans your codebase, interviews you about goals/non-goals, and fills all 5 state files automatically. **This is the most important step** — without it, Direction Guard and other skills have no context.

### 2. Direction Guard (every request)
Before ANY coding task, the LLM reads `project-brief.md` and checks:
- Does this align with Goals? → proceed
- Does this fall under Non-Goals? → warn, suggest `pivot`
- Does this contradict a Decision Log entry? → warn, suggest `pivot`

### 3. Workflow Pipeline
```
setup → pm → [code] → reviewer → lead → wrap-up
```

kode:harness provides **5 pipelines** for different scenarios:

| Pipeline | When | Flow |
|---|---|---|
| 🟢 New Dev | First feature | setup → pm → lead → [code] → reviewer → wrap-up |
| 🔵 Continue | Resuming work | lead → [code] → reviewer → wrap-up |
| 🔴 Bug Fix | Debugging | debug → [fix] → reviewer → wrap-up |
| 🟡 Direction Change | Goals/tech shift | pivot → pm → lead → [code] → reviewer → wrap-up |
| 🟣 Crew-Driven | With external planning artifacts | setup(crew) → pm → lead → [code] → reviewer → wrap-up |

Each step ends with a 🧭 **Navigation block** telling you exactly what to do next — including the prompt to type.

- **pm**: Checks direction alignment, breaks down features. **Confirm-First gate** — won't proceed without your approval.
- **reviewer**: Reviews code + audits state file updates
- **lead**: Tracks progress via **Wave-Level Pacing** — runs tests between implementation waves
- **wrap-up**: Captures lessons before session ends
- **debug**: **Recalculating Mode** — after 3 failed attempts, proposes alternative approaches

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
| 1 | **Mock Sync** — Interface change → update mocks in the same commit | `reviewer`, `sync-tests` |
| 2 | **Type Check** — Read the source before calling constructors. Never trust memory. | `reviewer` |
| 3 | **Scope Compliance** — Stay within current Story scope. Report before modifying out-of-scope files. | `lead`, `reviewer` |
| 4 | **Security** — No credentials, passwords, or API keys in code or commits. | `secure`, `reviewer` |
| 5 | **3-Failure Stop** — Same approach fails 3 times → stop and report. | All agents |
| 6 | **Dependency Map** — New/modified module → update `dependency-map.md` in the same commit. | `reviewer`, `wrap-up` |
| 7 | **Feature Registry** — New feature → register in `features.md` in the same commit. | `reviewer`, `wrap-up` |
| 8 | **Session Handoff** — Session end → update `project-state.md` Quick Summary. | `wrap-up` |

## Documentation

See [docs/reference.md](docs/reference.md) for detailed descriptions of every skill, agent, rule, and state file.

## Why We Built This

Existing AI coding frameworks focus on **what the AI does** — generate code, run tests, deploy. But the real problem isn't capability. It's **direction**.

When one developer uses AI, direction stays consistent. But in teams, each developer's AI drifts independently. And even solo developers lose direction across sessions — what we call **Context Rot**. The AI forgets architecture decisions, re-debates settled choices, and contradicts its own earlier work.

kode:harness focuses on **where the AI is going**. It gives every AI session — across developers, across IDEs, across time — the same goals, decisions, and project state. The underlying discipline is **harness engineering**: lightweight, markdown-native guardrails that any LLM can read.

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

### How It Compares

| | BMAD v6.2.2 | gstack v0.15.1 | GSD v1.33.0 | kode:harness |
|---|---|---|---|---|
| Focus | Enterprise SDLC methodology | 1-person software factory | Full lifecycle automation | **Multi-developer direction alignment** |
| Files | 200+ | ~40 | Hundreds | ~25 |
| Dependencies | Node 20+ | Bun + Node + Playwright | Node 18+ | Zero |
| IDE support | 20+ (installer) | 5 (setup --host) | 13 (runtime select) | 6 (native format) |
| Direction management | ❌ | ❌ | ❌ | ✅ (Direction Guard + pivot + Decision Log) |
| Iron Laws (code quality rules) | ❌ | ❌ | ❌ | ✅ (8 laws embedded in skills) |
| Cold start | ❌ | ❌ | `/gsd-new-project` | ✅ (`setup` skill) |
| Context per task | 4-6 files | 1 file | Fresh 200k per plan | 2-3 files (136-line dispatcher) |

## Roadmap

kode:harness is at **v0.9.2** — state-check skill, Iron Law #10 (Self-Verify), Confirmation Gate Defaults, multi-IDE installation fixes, and CI Artifact Index for crew mode.

| Phase | Version | Status | Focus |
|---|---|---|---|
| **Foundation** | v0.5.0 | ✅ Done | Core framework: 6 IDE support, 8 skills, 3 agents, Team Mode, Direction Guard |
| **Hardening** | v0.6.5 | ✅ Done | 10 skills, 4 agents, Iron Laws, CLI batch/doctor/validate, merge conflict SOP, direction drift detection |
| **Flexibility** | v0.7.x | ✅ Done | Delegate team conventions to project-brief.md, remove prescriptive rules |
| **Navigation** | v0.8.x | ✅ Done | 🧭 Navigation Dispatcher, 5 Pipelines, Crew Artifact Integration, 100-point quality audit, Confirm-First gate, Wave-Level Pacing, Recalculating Mode |
| **Naming** | v0.9.0 | ✅ Done | Skill/agent naming redesign for clarity and discoverability |
| **Self-Verify** | v0.9.2 | ✅ Current | state-check skill, Iron Law #10, Confirmation Gate Defaults, multi-IDE fix, CI Artifact Index |
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
