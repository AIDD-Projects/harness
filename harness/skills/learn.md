# Learn

## Purpose

Capture lessons from the current session before ending.
Updates docs/failure-patterns.md with new patterns and refreshes docs/project-state.md Quick Summary.
This is Musher's memory mechanism — without it, the same mistakes repeat across sessions.

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

### Step 2: Direction Drift Check

Before recording failures, verify that the session's work stayed aligned with project direction:

1. Read `docs/project-brief.md` — focus on **Goals**, **Non-Goals**, and **Decision Log**
2. Compare this session's changes (from Step 1) against the brief:
   - Did any change serve a Non-Goal? → Flag as potential direction drift
   - Did any change contradict a Decision Log entry? → Flag as decision reversal
   - Did the user explicitly change direction during this session? → Note for pivot recommendation
3. **If drift detected**:
   - Add a warning to the Step 6 Report: `⚠️ Direction drift: [description of misalignment]`
   - Recommend: "Consider running `pivot` skill to formally update project direction"
   - Do NOT block — the learn skill always completes
4. **If no drift**: Proceed silently (no output for this step)

### Step 3: Failure Pattern Detection

For each issue/error that occurred in this session:

1. Read `docs/failure-patterns.md`
2. Check if this matches an existing pattern (FP-NNN):
   - **If match found**: Increment the Frequency counter, add the Sprint/Story to "Occurred"
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

### Step 4: Update docs/project-state.md

1. Update **Quick Summary** (3 lines):
   - Line 1: What was accomplished in this session
   - Line 2: What is currently in progress
   - Line 3: What should be done next
2. Update **Story Status** table if any stories changed
3. Add to **Recent Changes** section with date and summary

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

### Step 5.6: Resolve STATE-AUDIT Flags (if applicable)

If the `reviewer` agent was run in this session and produced `[STATE-AUDIT]` flags:
1. Review each flagged item
2. Apply the recommended state file update
3. If the flag was already resolved during the session, skip it

### Step 6: Update Agent Memory (if applicable)

If an agent (reviewer, planner, sprint-manager, architect) was used in this session, update its memory file in `docs/agent-memory/`:

1. Read `docs/agent-memory/{agent-name}.md`
2. **Auto-initialize if needed**: If the file only contains `<!-- Example entries` placeholder comments and no real data:
   - Replace the placeholder block with actual entries from this session
   - Initialize statistics counters with real values
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
→ Prompt example: "다음 세션 시작 시 `sprint-manager`를 호출하세요"
→ Why: Session lessons captured — state files are up to date
→ Pipeline:
    🟢/🔵/🟣: Step 6/6 (complete)
    🔴: Step 4/4 (complete)
---
```

If crew artifacts were used this session (🟣 pipeline), also append:
```
→ Note: 다음 세션에서 crew 산출물이 업데이트되었다면, `bootstrap`부터 다시 시작하세요
```

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
