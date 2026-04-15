# Learn

## Purpose

Capture lessons from the current session before ending.
Updates docs/failure-patterns.md with new patterns and refreshes docs/project-state.md Quick Summary.
This is Musher's memory mechanism — without it, the same mistakes repeat across sessions.

## Invoked By

- **User** (direct) — "세션 마무리해줘", "오늘 배운 것 기록해줘"
- **reviewer** (pass, all done) → learn — 모든 Story 완료 시
- **reviewer** (STATE-AUDIT) → learn — state 파일 정리 후 세션 종료
- Final step in ALL pipelines (🟢/🔵/🔴/🟡)

## When to Apply

- Before ending a chat session (recommended as the LAST skill invoked, **once per session**)
- After a debugging session where a non-obvious fix was found
- After a review revealed a repeated mistake
- When the user explicitly asks to record a lesson

> **Timing**: Invoke this skill **once at session end**, not after each individual skill. It aggregates the entire session's work into state files.

## Procedure

### Step 1: Review Session Activity

1. Scan recent git changes: `git log --oneline -10` and `git diff --stat HEAD~3`
2. Identify what was accomplished in this session
3. Identify any errors, failures, or unexpected issues that occurred

**Edge Case: Zero-Change Session**
If `git diff --stat` shows no changes and `git log` shows no new commits this session:
- Report: "📝 Quiet session — status checks only, no code changes."
- Skip Step 3 (Failure Pattern Detection) — no code changes means no new failure patterns
- Skip Step 5 (features.md update) and Step 5.5 (dependency-map.md verify) — nothing changed
- Still execute Step 4 (Quick Summary update) and Step 6 (Agent Memory) if an agent was used
- Still execute Step 2 (Direction Drift Check) — discussion-only drift is possible

### Step 2: Direction Drift Check

Before recording failures, verify that the session's work stayed aligned with project direction:

1. Read `docs/project-brief.md` — focus on **Goals**, **Non-Goals**, and **Decision Log**
2. Compare this session's changes (from Step 1) against the brief:
   - Did any change serve a Non-Goal? → Flag as potential direction drift
   - Did any change contradict a Decision Log entry? → Flag as decision reversal
   - Did the user explicitly change direction during this session? → Note for pivot recommendation
3. **If drift detected**:
   - Add a warning to the Step 7 Report: `⚠️ Direction drift: [description of misalignment]`
   - Recommend: "Consider running `pivot` skill to formally update project direction. You can run it AFTER this learn session completes."
   - Do NOT block — the learn skill always completes
4. **If no drift**: Proceed silently (no output for this step)

<!-- CREW_MODE_START -->
#### Step 2.5: Validation Tracker Update (🟣 Pipeline only) ⚠️ MANDATORY

> **⛔ Completion Gate**: Step 2.5를 완료해야 Step 3 이후를 진행할 수 있습니다. Validation Tracker가 존재하면 반드시 갱신 후 다음 단계로 진행하세요.

If `docs/project-brief.md` contains a `## Validation Tracker` section with data:

1. **Update KPI Coverage status**:
   - Stories completed this session → if they map to a KPI → update Status (⬜→🟡 or 🟡→✅)
2. **Update FR Coverage status**:
   - Stories completed this session → if they have `[FR-NNN]` prefix → update Status (⬜→🟡 or 🟡→✅)
3. **Update ARB Fail Resolution status**:
   - Stories completed this session → if they have `[ARB-FAIL]` prefix and reviewer passed compliance check → update Status (⬜→🟡 or 🟡→✅)
4. **Check for Validation Drift**:
   - Did this session produce Stories/code that don't map to any FR or KPI? → warn
   - Are there KPIs/FRs with no Stories after 2+ sprints? → warn as "⚠️ Unplanned KPI/FR risk"
   - Include warnings in Step 7 Report
5. **Self-check**: Validation Tracker의 KPI/FR/ARB 상태가 이 세션의 완료 Story를 정확히 반영하는지 확인. 미갱신 항목이 있으면 즉시 갱신 후 다음 단계로 진행.

> ⛔ Validation Tracker 갱신 없이 Step 3으로 진행하지 마세요. 이 단계를 건너뛰면 FR/KPI Coverage가 실제 진행 상황과 불일치합니다.

If no Validation Tracker → skip this step entirely.
<!-- CREW_MODE_END -->

### Step 3: Failure Pattern Detection ⚠️ MANDATORY

For each issue/error that occurred in this session:

1. Read `docs/failure-patterns.md`
2. Check if this matches an existing pattern (FP-NNN):
   - **If match found AND already incremented by `investigate` in this session**: Skip — do not double-count. Check `docs/project-state.md` Recent Changes for investigate entries from this session to determine if a pattern was already recorded.
   - **If match found AND NOT already incremented this session**: Increment the Frequency counter, add the Sprint/Story to "Occurred"
   - **If new pattern**: Assign next FP-NNN number, create a new entry using this format:

```markdown
## FP-NNN: [Short description]

- **Occurred**: S[sprint]-[story]
- **Frequency**: 1
- **Cause**: [What went wrong and why]
- **Prevention**: [Specific check to prevent recurrence]
- **Applied in**: [Which skills/agents/rules should enforce this]
- **Status**: Active
```

3. If the failure relates to a specific skill or agent, note it for that skill's checklist

> **Self-check**: Step 3 완료 시 `docs/failure-patterns.md`에 최소 하나의 FP 항목이 있어야 합니다 (이 세션에서 실패가 없었으면 기존 항목 확인만).

### Step 4: Update docs/project-state.md ⚠️ MANDATORY

1. Update **Quick Summary** (3 lines):
   - Line 1: What was accomplished in this session
   - Line 2: What is currently in progress
   - Line 3: What should be done next

   > **Self-check**: Quick Summary가 정확히 3줄인지 확인. 3줄 초과 시 축약, 미달 시 보충.

2. Update **Story Status** table if any stories changed
3. **MANDATORY** — Add to **Recent Changes** section with date and summary. Recent Changes가 비어있으면 반드시 추가:
   ```
   - [YYYY-MM-DD] S{N}-{M}: {what was done} (STATUS: DONE)
   ```

### Step 5: Update docs/features.md (if applicable)

1. If new features were added → add row to Feature List
2. If existing features were modified → update Key Files and Test Files columns
3. If features were completed → update Status to `✅ done`

### Step 5.5: Verify docs/dependency-map.md (mandatory)

1. Check if any new modules were created in this session (scan `git diff --stat` for new directories)
2. Check if any module interfaces changed
3. For each finding:
   - New module without dependency-map entry → **add it now**
   - Interface change without Interface Change Log entry → **add it now**
4. Cross-reference `docs/features.md` Key Files against `docs/dependency-map.md` modules — flag orphaned modules

> **Self-check**: `docs/dependency-map.md`에 이 세션에서 새로 추가한 모듈이 모두 등록되었는지 확인. 누락 시 즉시 추가.

### Step 5.6: Resolve STATE-AUDIT Flags (if applicable)

If the `reviewer` agent was run in this session and produced `[STATE-AUDIT]` flags:
1. Review each flagged item
2. Apply the recommended state file update
3. If the flag was already resolved during the session, skip it

### Step 5.65: Auto-Commit State Files ⚠️ MANDATORY

State file 변경사항을 커밋합니다. Learn 실행 결과가 커밋되지 않으면 다음 세션에서 유실됩니다.

1. Stage state files: `git add docs/project-state.md docs/failure-patterns.md docs/features.md docs/dependency-map.md docs/agent-memory/`
2. Commit: `git commit -m "learn: session lessons captured"`
3. If commit fails (nothing to commit), skip — state files were already committed

> **Self-check**: `git status`에 docs/ 아래 unstaged 파일이 없어야 합니다.

### Step 5.7: Git Push Check (session end)

Before ending the session, check for unpushed commits:

1. Run `git log --oneline @{u}..HEAD 2>/dev/null || echo "no upstream"` to find unpushed commits
2. **If unpushed commits exist**:
   - List the commits: `git log --oneline @{u}..HEAD`
   - Solo mode: Recommend push — `git push origin {branch}`
   - Team mode: **Strongly recommend** push — unpushed work is invisible to teammates
   - Warn: "⚠️ {N}개의 커밋이 push되지 않았습니다. 작업물을 원격에 백업하세요."
3. **If no upstream configured** (`no upstream`):
   - Check if remote exists: `git remote -v`
   - If remote exists: Suggest `git push -u origin {branch}` (first push)
   - If no remote: Note "원격 저장소가 설정되지 않았습니다. 팀 협업 시 remote 설정이 필요합니다."
4. **If all commits are pushed**: Skip (no output)

### Step 6: Update Agent Memory (if applicable)

If an agent (reviewer, planner, sprint-manager, architect) was used in this session, update its memory file in `docs/agent-memory/`:

1. Read `docs/agent-memory/{agent-name}.md`
2. **Auto-initialize if needed**: If the file only contains `<!-- Example entries` placeholder comments and no real data:
   - Replace the placeholder block with actual entries from this session
   - Initialize statistics counters with real values
   - If real entries already exist alongside placeholders, APPEND new entries and remove only the placeholder comments. Do not overwrite existing real data.
   - **When does initialization happen?**: On the FIRST session where the agent is used AND learn is invoked. If an agent is never used, its memory stays as a placeholder indefinitely — this is expected.
   - Example transformation:
     ```
     Before: <!-- Example entries (replace with real findings after first review):
     After:  - [S1-1] Mock sync missed for UserService interface change
     ```
3. **Append session learnings** to the appropriate section:
   - **reviewer.md**: Add review patterns found, update statistics (total reviews +1, auto-fixes, escalations)
   - **planner.md**: Record estimation accuracy (planned vs actual), note architecture discoveries
   - **sprint-manager.md**: Update velocity (stories done/planned), record any scope drift incidents
   - **architect.md**: Record design decisions made, module boundary insights, anti-patterns observed
4. Keep entries concise — one line per learning, prefixed with `[S{sprint}-{story}]`
5. Prune entries older than 5 sprints to stay within the 100-line limit
6. If no agent was used in this session, skip this step

### Step 7: Report

Present a summary of all updates made.

## Output Format

```
## Session Learn Complete

### Lessons Captured:
- [FP-NNN] (new/updated): [description]

### State Files Updated:
- [x] docs/project-state.md — Quick Summary refreshed
- [x] docs/failure-patterns.md — [N] patterns added/updated
- [x] docs/features.md — [N] features updated (if applicable)
- [x] docs/dependency-map.md — [N] modules verified/added (if applicable)
- [x] docs/agent-memory/{name}.md — [N] agents updated (if applicable)

### Git Status:
- Unpushed commits: [N] — `git push origin {branch}` 실행 권장
  (or: All commits pushed ✅)

### Next Session Should:
1. [recommended first action]
2. [next priority]

STATUS: DONE
```

### 🧭 Navigation — After Learn

Learn is the final skill in every pipeline. Append the appropriate 🧭 block:

```
---
🧭 Next Step
→ 🏁 Session End
→ Prompt: "다음 세션 시작 시 `sprint-manager`를 호출하세요"
→ Why: Session lessons captured — state files are up to date
→ Pipeline:
    🟢/🔵: Step 6/6 (complete)
    🔴: Step 4/4 (complete)
---
```

<!-- CREW_MODE_START -->
If crew artifacts were used this session (🟣 pipeline), also append:
```
→ Note: 다음 세션에서 crew 산출물이 업데이트되었다면, `bootstrap`부터 다시 시작하세요
```
<!-- CREW_MODE_END -->

## Rules

- Never invent patterns that didn't actually occur — record only real failures
- Keep failure pattern descriptions concise (1-2 sentences for Cause and Prevention)
- If no failures occurred, skip Step 2 and just update state files
- Do not modify source code — this skill only updates state files
- Quick Summary must be exactly 3 lines — concise enough for the next session to scan instantly

## Enforced Rules

- **Session Handoff**: Before ending a session, docs/project-state.md Quick Summary MUST be updated. Never leave the project in an undocumented state.
- **State File Size Limits**: Keep state files compact for LLM context windows:
  - docs/project-brief.md: Max 200 lines
  - docs/project-state.md: Max 300 lines (archive completed sprints)
  - docs/failure-patterns.md: Max 50 patterns (remove resolved entries)
  - docs/dependency-map.md: Max 100 modules
  - docs/features.md: Max 50 features
  - docs/agent-memory/*.md: Max 100 lines each
  - .harness/ personal files: same limits as shared files

## Anti-patterns

| Anti-pattern | Correct Approach |
|---|---|
| Record theoretical risks as failure patterns | Only record failures that actually happened |
| Write vague descriptions ("something broke") | Be specific: file name, error message, root cause |
| Skip this skill because "nothing went wrong" | Still update Quick Summary and Story Status |
| Update docs/failure-patterns.md but not docs/project-state.md | Always update both — they serve different purposes |

<!-- TEAM_MODE_START -->
## Team Mode: Session Wrap-up

### Pre-Pull (mandatory before any shared file edit)
1. Run `git pull` on the default branch before updating docs/features.md or docs/dependency-map.md (per project-brief.md → Key Technical Decisions; default: main)
2. If merge conflicts occur, follow the **Merge Conflict SOP** below

### Merge Conflict SOP

When `git pull` causes merge conflicts in shared state files:

1. **Identify conflict files**: `git diff --name-only --diff-filter=U`
2. **Resolution strategy by file type**:
   | File | Strategy |
   |------|----------|
   | `docs/features.md` | Keep BOTH entries (merge=union should handle; if not, manually keep all rows) |
   | `docs/dependency-map.md` | Keep BOTH entries (merge=union should handle; if not, manually keep all rows) |
   | `docs/project-brief.md` | Resolve based on team's pivot authority (per project-brief.md; default: prefer REMOTE) |
   | `docs/failure-patterns.md` | Keep BOTH entries, deduplicate by FP-NNN number |
3. **After resolving**: `git add <resolved-files> && git commit`
4. **Verify**: Re-read the resolved file and confirm no data was lost
5. **If unsure**: Do NOT force-resolve. Ask the designated authority (per project-brief.md; default: team lead) or the Owner of the conflicting rows.

### Owner-Scoped Updates
- **docs/features.md**: only update rows where Owner = you
- **docs/dependency-map.md**: only update rows where Owner = you; if adding a new module, append at the bottom
- **Personal files** (.harness/project-state.md, .harness/failure-patterns.md, .harness/agent-memory/): update freely — no coordination needed

### Failure Pattern Promotion
If a personal failure pattern (FP-NNN in .harness/failure-patterns.md) is likely to affect other developers:
1. Discuss with the team (Slack, PR comment, etc.)
2. If agreed, add it to a shared location (team wiki, PR description) so others can add it to their personal .harness/failure-patterns.md
<!-- TEAM_MODE_END -->
