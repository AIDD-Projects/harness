# Bootstrap

## Purpose

Onboard a new or existing project into Musher by filling **state files AND rules files** automatically.
Solves the cold-start problem: users don't know which `.md` files to fill or how.
One command does everything — no manual editing required.

## When to Apply

- Right after running `musher init` on a new project
- When joining an existing project that has empty state files
- When state files are outdated and need a refresh
- When any agent reports "state files are empty"

## Procedure

### Phase 1: Project Discovery (read-only)

1. **Scan project root** for configuration files:
   - `package.json`, `tsconfig.json` → Node.js/TypeScript
   - `go.mod`, `go.sum` → Go
   - `requirements.txt`, `pyproject.toml`, `setup.py` → Python
   - `pom.xml`, `build.gradle` → Java
   - `Cargo.toml` → Rust
   - `Gemfile` → Ruby
2. **Scan directory structure**: List top-level directories and identify patterns
   - `src/`, `lib/`, `app/` → source code
   - `tests/`, `test/`, `__tests__/`, `spec/` → test directories
   - `docs/` → documentation
3. **Scan for existing tests**: Find test files and map them to source modules
4. **Scan imports/dependencies**: Trace module relationships from import statements

**Do NOT modify any code files in this phase.**

### Phase 2: User Interview (interactive)

Ask the user these questions (skip any already answered by Phase 1):

1. "What does this project do? (one sentence)"
2. "What are the top 3 goals of this project?"
3. "What is explicitly OUT of scope? (non-goals)"
4. "What architecture pattern are you using?" (show detected pattern if found)
5. "Are there any type decisions or conventions the AI should know about?"
6. "What is your test command?" (show detected command if found, e.g., `npm test`, `pytest`, `go test ./...`)

### Phase 3: Fill State Files

Using data from Phase 1 + Phase 2, fill the following files:

**docs/project-brief.md**:
- Project Name → from package.json name, go.mod module, or user input
- Vision → from user answer #1
- Goals → from user answer #2
- Non-Goals → from user answer #3
- Key Technical Decisions → from Phase 1 scan + user answer #4, #5

**docs/features.md**:
- Add one row per detected module/feature area
- Status: `✅ done` for modules with passing tests, `🔧 active` for modules without tests
- Key Files: actual file paths from scan
- Test Files: actual test file paths from scan

**docs/dependency-map.md**:
- Add one row per module
- Layer: inferred from directory structure (domain/application/infrastructure/presentation)
- Depends On / Depended By: inferred from import scan

**docs/project-state.md**:
- Quick Summary: filled with current project state
- Sprint 1 stories: based on what bootstrap discovered
- Module Registry: summary from docs/dependency-map.md

**docs/failure-patterns.md**:
- Keep FP-001 through FP-004 as templates (Frequency: 0)
- No changes unless user reports known issues

### Phase 3.5: Project Brief Auto-Configuration

Using language/framework detected in Phase 1 + user answers from Phase 2, enrich `docs/project-brief.md`:

1. **Fill Key Technical Decisions** with detected tech stack:
   - Language, framework, database (from Phase 1)
   - Architecture pattern (from user answer #4)
   - Type conventions (from user answer #5)
   - Test command and mock location (from user answer #6)

2. **Ask about coding conventions** for the detected language:
   - "Any coding style conventions the AI should follow for [detected language]?" (e.g., enum vs union types, Pydantic vs dataclass, etc.)
   - If the user provides conventions → write them to Key Technical Decisions
   - If the user skips → do not inject any defaults

### Phase 4: Verify

1. Present a summary of all filled state files to the user
2. Ask "Does this look correct? What should I change?"
3. Apply corrections if any
4. Report completion

<!-- TEAM_MODE_START -->
## Team Mode: File Locations

In Team mode, state files are split between shared and personal directories:

### Shared (docs/, git committed)
- `docs/project-brief.md` — project vision, goals, non-goals
- `docs/features.md` — feature registry
- `docs/dependency-map.md` — module dependency graph

### Personal (.harness/, gitignored)
- `.harness/project-state.md` — current sprint/story progress
- `.harness/failure-patterns.md` — personal failure patterns
- `.harness/agent-memory/` — agent memory files

When filling state files in Phase 3, write to the correct directories based on this split.
After bootstrap completes, remind the user that shared files require `git pull` before editing (Pre-Pull Protocol).
<!-- TEAM_MODE_END -->

## Output Format

```
## Bootstrap Complete

### Project: [name]
### Tech Stack: [detected stack]
### Language: [detected language]
### Modules Found: [count]
### Features Mapped: [count]
### Dependency Links: [count]

### State Files Updated:
- [x]docs/project-brief.md — [summary]
- [x]docs/features.md — [N] features registered
- [x]docs/dependency-map.md — [N] modules, [N] dependencies
- [x]docs/project-state.md — Sprint 1 initialized
- [ ]docs/failure-patterns.md — templates only (no changes)

STATUS: DONE
```

## Rules

- Never modify source code — this skill only writes to state files and rules files
- Always show the user what was discovered BEFORE writing files
- If the project has 0 source files, skip Phase 1 scan and go straight to Phase 2
- If a state file already has content, ask before overwriting
- Rules file TODO sections can be overwritten without asking (they are placeholders)
- Run this skill only once per project (or when explicitly requested for refresh)

## Embedded Knowledge

### Session Bootstrap Protocol
When starting a NEW session (not during bootstrap), read these files in order:
1. `docs/project-state.md` — Quick Summary tells you where we left off
2. `docs/features.md` — What features exist
3. `docs/failure-patterns.md` — What mistakes to avoid
4. `docs/project-brief.md` — Project vision and non-goals

### Workflow Pipeline
- New feature: `planner → [code] → reviewer → sprint-manager → learn`
- Bug fix: `investigate → [fix] → test-integrity → reviewer → learn`
- Session lifecycle: `sprint-manager ("where are we?") → [work] → learn`

### State File Size Limits
- docs/project-brief.md: Max 200 lines
- docs/project-state.md: Max 300 lines
- docs/failure-patterns.md: Max 50 patterns
- docs/dependency-map.md: Max 100 modules
- docs/features.md: Max 50 features
- docs/agent-memory/*.md: Max 100 lines each

## Anti-patterns

| Anti-pattern | Correct Approach |
|---|---|
| Guess module boundaries | Scan actual directory structure and imports |
| Skip user interview | Phase 1 scan alone is insufficient — always confirm with user |
| Overwrite existing state files silently | Ask before overwriting non-empty files |
| Create perfect dependency map on first try | Start with what's detectable, refine over time |
| Leave rules file TODOs unfilled | Phase 3.5 fills ALL TODO sections — no manual editing needed |
| Use TypeScript globs for non-TS projects | Detect language in Phase 1 and set correct globs |
| Only fill state files, skip rules | Bootstrap fills BOTH — state files AND rules files |

<!-- TEAM_MODE_START -->
## Team Mode: Onboarding

When running bootstrap in Team mode:

### New Project (first developer)
1. Run `musher init --team` to create shared + personal state files
2. Fill all state files via normal bootstrap procedure
3. Commit shared files (docs/) to git
4. Push to remote — teammates will clone this

### Joining Developer (existing project)
1. Clone the repository (shared docs/ already exist)
2. Run `musher init --team` — only personal files (.harness/) are created; shared files are skipped
3. **DO NOT re-run bootstrap interviews** — shared state is already filled by the first developer
4. Review docs/project-brief.md to understand project goals
5. Create your personal .harness/project-state.md with your current Story assignment

### Rules
- **Never overwrite shared files** when joining an existing project
- Set your Owner name in docs/features.md and docs/dependency-map.md rows you create
- Personal state (.harness/) is yours alone — no coordination needed
<!-- TEAM_MODE_END -->
