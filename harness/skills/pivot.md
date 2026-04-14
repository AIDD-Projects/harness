# Pivot

## Purpose

When a project direction changes — technology swap, scope expansion/reduction, architecture shift — this skill propagates the change across ALL state files consistently.
Without this, direction changes create silent inconsistencies:docs/project-brief.md says "GraphQL" but docs/dependency-map.md still references REST modules.

## Invoked By

- **User** (direct) — "방향을 바꾸자", "GraphQL로 변경해줘"
- **planner** (direction change detected) → BLOCK → pivot required before planning proceeds

## When to Apply

- Technology change: "Switch from REST to GraphQL", "Replace PostgreSQL with MongoDB"
- Scope change: "Add real-time features", "Remove mobile support", "Downscope to MVP"
- Architecture shift: "Move from monolith to microservices", "Switch from SSR to SPA"
- Goal change: "Pivot from B2C to B2B", "Change target users"
- Any time the user says "let's change direction", "pivot", "switch to", "drop [feature area]"

## Procedure

### Step 1: Capture the Change

1. Ask the user to describe the change in one sentence
2. Classify the change type:
   - **Tech Swap**: Replacing one technology with another
   - **Scope Change**: Adding or removing feature areas
   - **Architecture Shift**: Changing system structure
   - **Goal Pivot**: Changing project purpose or target

### Step 2: Impact Scan

Read ALL state files and identify what needs updating:

1. **docs/project-brief.md**:
   - Does Vision need rewording?
   - Do Goals need updating?
   - Do Non-Goals need updating?
   - Do Key Technical Decisions need changing?
   - Record the decision with reasoning in the Decision Log section

2. **docs/features.md**:
   - Which existing features are affected?
   - Which features should be marked `⛔ dropped`?
   - Are new features needed?

3. **docs/dependency-map.md**:
   - Which modules are obsoleted by this change?
   - Which new modules are needed?
   - Which dependency relationships change?

4. **docs/project-state.md**:
   - Which in-progress stories are affected?
   - Does the current sprint goal change?
   - Update Quick Summary to reflect the pivot

5. **docs/failure-patterns.md**:
   - Are any existing patterns invalidated by this change?
   - Mark invalidated patterns as `Status: Obsolete (pivot: [reason])`

6. **Rules files** (`.vscode/instructions/*.md`) — optional, flag only:
   - Do any instruction files reference old direction (e.g., old framework names, deprecated patterns)?
   - Flag for user to update manually if tech stack or architecture changed
   - Note: Pivot does NOT auto-update rules files — they are outside harness scope. Only flag them for the user's attention.

### Step 3: Present Change Plan

Before writing anything, present a summary to the user:

```
## Pivot: [one-sentence description]
Type: [Tech Swap | Scope Change | Architecture Shift | Goal Pivot]

### State File Changes:
- docs/project-brief.md: [what changes]
- docs/features.md: [N features affected, M dropped, K added]
- docs/dependency-map.md: [N modules obsoleted, M added, K relationships changed]
- docs/project-state.md: [N stories affected]
- docs/failure-patterns.md: [N patterns obsoleted]

### Confirm? (yes/no)
```

- If **yes**: Proceed to Step 4 (update all state files)
- If **no**: Pivot is cancelled — no state files modified, return to current direction

### Step 4: Execute Updates

After user confirms, update ALL state files in order:

1. **docs/project-brief.md** first (source of truth for direction)
2. **docs/features.md** second (what we're building)
3. **docs/dependency-map.md** third (how it connects)
4. **docs/project-state.md** fourth (current work status)
5. **docs/failure-patterns.md** last (historical patterns)

### Step 5: Decision Log Entry

Add an entry to the Decision Log section in docs/project-brief.md:

```markdown
### [YYYY-MM-DD] [Decision Title]
- **Change**: [What changed]
- **Reason**: [Why this decision was made]
- **Impact**: [What was affected]
- **Alternatives Considered**: [1-2 bullet points on what was rejected and why]
```

### 🧭 Navigation — After Pivot

After pivot completes, always append a 🧭 block:

| Pivot Result | 🧭 Next Step |
|---|---|
| All state files updated | `planner` — "변경된 방향에 맞춰 재계획해줘" |
| Crew artifacts exist for new direction | `bootstrap` (🟣) — "crew 산출물을 기반으로 state를 다시 세팅해줘" |
| User cancelled | 🏁 No action — "기존 방향을 유지합니다" |

Example 🧭 block:
```
---
🧭 Next Step
→ Call: `planner`
→ Prompt example: "변경된 방향에 맞춰 재계획해줘"
→ Why: Direction changed — re-plan features for new goals
→ Pipeline: 🟡 Step 2/2
---
```

## Rules

- **Never skip the confirmation step** — the user must approve before any state file is written
- **Never update partially** — if you update docs/project-brief.md, you MUST check and update all other state files too
- **Preserve history** — mark dropped features as `⛔ dropped`, don't delete rows
- **Record the why** — every pivot must have a Decision Log entry with reasoning

## Team Mode

If `.harness/` directory exists (Team mode is active):

- **pivot MUST be run on the default branch** by the designated authority (per project-brief.md → Key Technical Decisions; default: team lead) only
- Feature branches should NOT run pivot independently
- If a direction change is needed from a feature branch:
  1. Document the proposed change
  2. Share with the team
  3. The designated authority runs pivot on the default branch
  4. All developers pull the latest shared state files
  5. Each developer's `.harness/` personal state is unaffected (update manually if needed)

<!-- TEAM_MODE_START -->
## Team Mode: Pivot Lock

### Who Can Run Pivot
- **The designated authority** runs pivot, and **only on the default branch** (per project-brief.md → Key Technical Decisions; default: team lead on main)
- If you are not the designated authority, propose the direction change instead:
  1. Document proposed change in a GitHub issue or Slack message
  2. Discuss with the team
  3. The designated authority runs pivot after consensus

### Branch Check
Before running pivot, verify:
1. You are on the default branch (per project-brief.md; default: main): `git branch --show-current`
2. Your working tree is clean: `git status` must show no uncommitted changes
3. You have pulled the latest: `git pull`

### After Pivot
1. Commit and push the updated shared files
2. Notify all team members to pull the latest shared state files
3. Each developer's personal .harness/ files are NOT auto-updated — developers should review the pivot changes and manually update their personal state if needed
<!-- TEAM_MODE_END -->
