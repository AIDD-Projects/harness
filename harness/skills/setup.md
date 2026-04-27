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

<!-- CREW_MODE_START -->
### Phase 1.5: Crew Artifact Detection + Indexing

Check if external planning artifacts exist:
- `docs/crew/` directory — kode:crew output (requirements, analysis, design docs)
- `docs/PM/`, `docs/Analyst/`, `docs/ARB/` directories — kode:crew role-based output
- User-provided documents — requirements specs, wireframes, API designs
- User mentions "산출물", "PRD", "요구사항", "설계서" in their prompt

**If crew artifacts are found:**

1. **Catalog all documents** with path, estimated role (Analyst/PM/ARB/unknown), and key contents
2. **Check existing state**: If `docs/project-brief.md` already has a `## Crew Artifact Index` section with content:
   - Ask user: "⚠️ 기존 crew 산출물이 이미 인덱싱되어 있습니다. 재인덱싱하겠습니까?" (user confirms or skips)
   - If project-brief is empty (first crew sync) → proceed with full indexing
3. **Lazy Read Protocol로 산출물 읽기** (⚠️ 전문 읽기 금지):

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

4. **Create Artifact Index** in `docs/project-brief.md`:
   - Add `## Crew Artifact Index` table with: Artifact name, Path, Role, key contents summary (one line each)
5. **Extract Minimum** for quick reference (these go into the standard sections of project-brief.md):
   - Vision: 1-2 sentences from product-brief
   - Goals: KPI list from product-brief (measurable items only, not full descriptions)
   - Non-Goals: Out-of-scope list from PRD or product-brief
   - Key Technical Decisions: tech stack from architecture doc
6. **Build Validation Tracker** in `docs/project-brief.md`:
   - `### KPI Coverage`: extract KPI items from product-brief → create table with ID, KPI, Source, Story (empty), Status (⬜)
   - `### ARB Fail Resolution`: extract Fail items from arb-checklist → create table with ID, Item, Severity (CRITICAL/HIGH), Story (empty), Status (⬜ Required)
   - `### FR Coverage`: extract FR-NNN items from PRD → create table with FR, Description, Priority (P0/P1/P2), Stories (empty), Status (⬜)
7. **Confirm with user**: "Crew 산출물 [N]개를 발견했습니다. Artifact Index와 Validation Tracker를 생성합니다. 맞나요?"
   - If user says **yes** → proceed with Phase 3 using crew artifact data
   - If user says **no** → skip Artifact Index/Tracker creation, proceed with regular Phase 2 interview (treat as 🟢 pipeline)
8. **Skip most Phase 2 questions** — use artifact data instead. Only confirm implementation-specific decisions (test framework, specific library choices).
9. Proceed to Phase 3 using extracted data

**Original crew documents are NEVER modified. Only the index and tracker are created.**

**Crew Artifact Path Detection** (setup detects all patterns, priority order):
1. Pattern C: User-provided paths (explicit in prompt) — highest priority, always authoritative
2. Pattern B: `docs/crew/` (consolidated directory)
3. Pattern A: `docs/PM/`, `docs/Analyst/`, `docs/ARB/` (kode:crew role-based directories)
4. Pattern D: `docs/` files containing `prd`, `product-brief`, `architecture`, `checklist` keywords — lowest priority, fallback scan
- If multiple patterns match, use the highest priority source. Artifact Index records the actual discovered paths.

**If no crew artifacts:** Continue to Phase 2 (User Interview) normally.
<!-- CREW_MODE_END -->

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
<!-- CREW_MODE_START -->
- Crew Artifact Index → from Phase 1.5 (🟣 pipeline only — leave as template comment for 🟢 pipeline)
- Validation Tracker → from Phase 1.5 (🟣 pipeline only — leave as template comment for 🟢 pipeline)
<!-- CREW_MODE_END -->
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
- Sprint 1 stories: based on what setup discovered
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
After setup completes, remind the user that shared files require `git pull` before editing (Pre-Pull Protocol).
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

### 🧭 Navigation — After Bootstrap

Bootstrap always leads to `pm`. Append this block after STATUS: DONE:

**If NO crew artifacts** (🟢 pipeline):
```
---
🧭 Next Step
→ Next: `pm` (슬래시 메뉴에서 선택하거나, 채팅에 아래 프롬프트 입력)
→ Prompt: "[project]에 [첫 번째 기능]을 추가해줘"
→ Why: State files are filled — now plan the first feature
→ Pipeline: 🟢 Step 2/6
---
```

<!-- CREW_MODE_START -->
**If crew artifacts were used** (🟣 pipeline):
```
---
🧭 Next Step
→ Next: `pm` (슬래시 메뉴에서 선택하거나, 채팅에 아래 프롬프트 입력)
→ Prompt: "crew 산출물을 기반으로 첫 번째 기능을 계획해줘"
→ Why: Artifact Index + Validation Tracker created — pm will map FR→Stories
→ Pipeline: 🟣 Step 2/6
---
```
<!-- CREW_MODE_END -->

## Rules

- Never modify source code — this skill only writes to state files and rules files
- Always show the user what was discovered BEFORE writing files
- If the project has 0 source files, skip Phase 1 scan and go straight to Phase 2
- If a state file already has content, ask before overwriting
- Rules file TODO sections can be overwritten without asking (they are placeholders)
- Run this skill only once per project (or when explicitly requested for refresh)

### Small Project Guidance

For projects with fewer than 3 modules (e.g., single-file scripts, small CLI tools):
- `docs/dependency-map.md` may have only 1-2 rows — this is normal, not a gap
- `breakdown` Waves may collapse into a single Wave — skip Wave-level pacing
- Consider a simplified workflow: `setup → pm → [code] → reviewer → wrap-up` (skip lead for single-story projects)

## Embedded Knowledge

### Session Bootstrap Protocol
When starting a NEW session (not during setup), read these files in order:
1. `docs/project-state.md` — Quick Summary tells you where we left off
2. `docs/features.md` — What features exist
3. `docs/failure-patterns.md` — What mistakes to avoid
4. `docs/project-brief.md` — Project vision and non-goals

### Workflow Pipeline
- New feature: `pm → [code] → reviewer → lead → wrap-up`
- Bug fix: `debug → [fix] → sync-tests → reviewer → wrap-up`
- Session lifecycle: `lead ("where are we?") → [work] → wrap-up`

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
| Leave rules file TODOs unfilled | Phase 3.5 fills Key Technical Decisions TODOs. Decision Log remains empty (filled later via `pivot` skill during project lifecycle) |
| Use TypeScript globs for non-TS projects | Detect language in Phase 1 and set correct globs |
| Only fill state files, skip rules | Bootstrap fills BOTH — state files AND rules files |

<!-- TEAM_MODE_START -->
## Team Mode: Onboarding

When running setup in Team mode:

### New Project (first developer)
1. Run `musher init --team` to create shared + personal state files
2. Fill all state files via normal setup procedure
3. Commit shared files (docs/) to git
4. Push to remote — teammates will clone this

### Joining Developer (existing project)
1. Clone the repository (shared docs/ already exist)
2. Run `musher init --team` — only personal files (.harness/) are created; shared files are skipped
3. **DO NOT re-run setup interviews** — shared state is already filled by the first developer
4. Review docs/project-brief.md to understand project goals
5. Create your personal .harness/project-state.md with your current Story assignment

### Rules
- **Never overwrite shared files** when joining an existing project
- Set your Owner name in docs/features.md and docs/dependency-map.md rows you create
- Personal state (.harness/) is yours alone — no coordination needed
<!-- TEAM_MODE_END -->
