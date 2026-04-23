---
name: bootstrap
description: 'Onboard project into kode:harness. Scans codebase and fills state files. Use after harness init or when state files are empty.'
---

# Bootstrap

## Purpose

Onboard a new or existing project into kode:harness by filling **state files AND rules files** automatically.
Solves the cold-start problem: users don't know which `.md` files to fill or how.
One command does everything — no manual editing required.

## When to Apply

- Right after running `harness init` on a new project
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
3. **Framework Coexistence Check** (경량 — 1회 list_dir만 사용):
   프로젝트 루트 `list_dir` 결과에서 아래 패턴과 매칭하여 존재 목록만 생성한다.
   **⚠️ 내부 파일 스캔 금지** — 디렉토리 안의 파일을 읽거나 나열하지 않는다.

   | 패턴 | 프레임워크 |
   |------|:-----------|
   | `.bmad-core/` | BMAD-METHOD |
   | `.claude/` | Claude Code |
   | `.cursor/` | Cursor |
   | `.windsurf/` | Windsurf |
   | `.gemini/` | Gemini |
   | `.clinerules/` or `.cline/` | Cline |
   | `.github/chatmodes/` | GitHub Chatmodes |
   | `AGENTS.md` | Codex / OpenAI |
   | `opencode.jsonc` | OpenCode |

   > `.github/chatmodes/`는 `.github/` 하위이므로, `.github/` 존재 시 1회 추가 list_dir 허용.
   > 감지된 프레임워크는 State file에 "공존 프레임워크: [목록]"으로 기록한다.

4. **Scan for existing tests**: Find test files and map them to source modules
5. **Scan imports/dependencies**: Trace module relationships from import statements

**Do NOT modify any code files in this phase.**

### Phase 1.5: Crew Artifact Detection + Version Check

Check if external planning artifacts exist:
- `docs/crew/` directory — external planning tool output (requirements, analysis, design docs)
- User-provided documents — requirements specs, wireframes, API designs

**If crew artifacts are found:**
1. Check if `docs/project-brief.md` already has content (existing crew sync)
   - If project-brief has content → ask user: "⚠️ 기존 crew 산출물이 이미 반영되어 있습니다. 재인제스트하겠습니까?" (user confirms or skips)
   - If project-brief is empty (first crew sync) → proceed with full ingestion
2. **Lazy Read Protocol로 산출물 읽기** (⚠️ 전문 읽기 금지):

   **Step A: 구조 스캔 (첫 50줄)**
   - 각 산출물의 **첫 50줄만** 읽는다 (목차, 헤더, Executive Summary)
   - 이 50줄에서 추출: 프로젝트 비전, 목표, 비목표, 기술 스택, FR/KPI/ARB 목록 존재 여부
   - 문서 구조를 파악한다 (어떤 섹션이 몇 번째 줄에 있는지)
   - 첫 50줄에 목차가 없으면 60줄까지 확장 허용

   **Step B: 선택적 상세 읽기**
   - State file 작성에 필요한 섹션만 추가로 읽는다:
     - PRD → "Functional Requirements", "KPI", "Non-Functional Requirements" 섹션
     - Architecture → "Tech Stack", "Module 구조" 섹션
     - ARB Checklist → "Fail Items" 섹션만 (Pass 항목은 불필요)
     - Product Brief → "Vision" + "Persona" 섹션
   - **읽지 않는 섹션**: 배경, 시장 분석, 상세 설명, 참고 자료 등

   > 효과: PRD 336줄 → ~130줄 (61% 감소), 4개 산출물 총합 885줄 → ~350줄 (60% 감소)

3. Extract: project vision, goals, non-goals, feature list, module boundaries, tech decisions
4. **Skip most Phase 2 questions** — use artifact data instead. Only confirm with user: "Crew 산출물을 기반으로 state files를 채우겠습니다. 맞나요?"
5. Proceed to Phase 3 using extracted data

**If no crew artifacts:** Continue to Phase 2 (User Interview) normally.

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

### 🧭 Navigation — After Bootstrap

Bootstrap always leads to `planner`. Append this block after STATUS: DONE:

```
---
🧭 Next Step
→ Call: `planner`
→ Prompt example: "[프로젝트 이름]에 [첫 번째 기능]을 추가해줘"
→ Why: State files are filled — now plan the first feature
→ Pipeline: 🟢 Step 2/6
---
```

If crew artifacts were used (🟣 pipeline), adjust the prompt example:
```
→ Prompt example: "crew 산출물을 기반으로 첫 번째 기능을 계획해줘"
→ Pipeline: 🟣 Step 2/6
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

