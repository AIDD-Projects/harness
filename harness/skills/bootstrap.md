# Bootstrap

## Purpose

Onboard a new or existing project into K-Harness by filling state files automatically.
Solves the cold-start problem: users don't know which `.md` files to fill or how.

## When to Apply

- Right after running `k-harness init` on a new project
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

### Phase 4: Verify

1. Present a summary of all filled state files to the user
2. Ask "Does this look correct? What should I change?"
3. Apply corrections if any
4. Report completion

## Output Format

```
## Bootstrap Complete

### Project: [name]
### Tech Stack: [detected stack]
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

- Never modify source code — this skill only writes to state files
- Always show the user what was discovered BEFORE writing files
- If the project has 0 source files, skip Phase 1 scan and go straight to Phase 2
- If a state file already has content, ask before overwriting
- Run this skill only once per project (or when explicitly requested for refresh)

## Anti-patterns

| Anti-pattern | Correct Approach |
|---|---|
| Guess module boundaries | Scan actual directory structure and imports |
| Skip user interview | Phase 1 scan alone is insufficient — always confirm with user |
| Overwrite existing state files silently | Ask before overwriting non-empty files |
| Create perfect dependency map on first try | Start with what's detectable, refine over time |
