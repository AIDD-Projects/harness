# K-Harness

LLM Development Harness — IDE-agnostic rules, skills, and agents that prevent common AI coding failures.

## What It Does

K-Harness installs structured instruction files into your project that guide LLM coding agents (Copilot, Claude, Cursor, Codex, Windsurf) to avoid common mistakes:

- **Iron Laws** — Hard rules the LLM must follow every session (mock sync, type checking, security)
- **Skills** — Step-by-step procedures for specific tasks (debugging, code review, security checks)
- **Agents** — Role-based personas (reviewer, sprint manager)
- **Failure Patterns** — Project-specific failure log that prevents repeat mistakes
- **State Tracking** — Sprint/Story state so the LLM knows what to work on

## Quick Start

```bash
npx k-harness init
```

Select your IDE when prompted. Files are installed into the current directory.

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
| **Cursor** | `.cursor/rules/core.mdc` | `.cursor/rules/*.mdc` | `.cursor/rules/*.mdc` | `.cursor/rules/*.mdc` |
| **Codex** | `AGENTS.md` | (merged into AGENTS.md) | `.agents/skills/*/SKILL.md` | (merged into AGENTS.md) |
| **Windsurf** | `.windsurfrules` | (merged) | (merged) | (merged) |
| **Augment Code** | `.augment/rules/core.md` | `.augment/rules/*.md` | `.augment/skills/*/SKILL.md` | `.augment/skills/*/SKILL.md` |
| **Google Antigravity** | `.agent/rules/core.md` | `.agent/rules/*.md` | `.agent/skills/*/SKILL.md` | `.agent/skills/*/SKILL.md` |

All IDEs also get `project-state.md`, `failure-patterns.md`, `features.md`, and `project-brief.md` at the project root.

## What Gets Installed

### Rules (always active)
- **Core Rules** — Architecture enforcement, Iron Laws, completion protocol, concreteness rules
- **Testing Rules** — Mock synchronization, forbidden patterns (applied to test files)
- **Backend Rules** — Dependency inversion, type safety, explicit staging (applied to source files)

### Skills (on-demand procedures)
- **test-integrity** — Verify mock/interface synchronization before committing
- **security-checklist** — Pre-commit security risk scan
- **investigate** — 4-phase systematic debugging (evidence → scope → fix → verify)

### Agents (role-based personas)
- **reviewer** — Code review: architecture, tests, security, failure pattern cross-check
- **sprint-manager** — Sprint/Story state management, scope drift prevention

### State Files
- **project-state.md** — Current sprint, stories, and progress tracking
- **failure-patterns.md** — Template for logging project-specific failure patterns

## After Installation

1. **Edit `project-state.md`** — Set up your first sprint and stories
2. **Customize global rules** — Add your architecture, type rules, and directory structure
3. **Log failures** — When an LLM makes a repeated mistake, record it in `failure-patterns.md`

## Design Principles

1. **State Injection** — Project state injected at every session start
2. **Rigid Workflow** — Hard "do/don't" rules; soft suggestions get ignored by LLMs
3. **Failure-Driven Rules** — Rules derived only from actual project failures
4. **Completion Status Protocol** — DONE / BLOCKED / NEEDS_CONTEXT reporting
5. **Scope Lock** — Escalate before modifying files outside current story scope

## Research & Analysis

```
docs/
├── analysis/           # Framework comparisons
│   ├── comparison.md   # BMAD vs gstack
│   ├── bmad-deep-dive.md
│   └── gstack-deep-dive.md
├── architecture/       # K-Harness design
│   ├── design-principles.md
│   ├── file-structure.md
│   └── skill-spec.md
└── case-study/
    └── mcphub-lessons.md
```

## License

MIT
