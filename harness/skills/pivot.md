# Pivot

## Purpose

When a project direction changes — technology swap, scope expansion/reduction, architecture shift — this skill propagates the change across ALL state files consistently.
Without this, direction changes create silent inconsistencies: project-brief.md says "GraphQL" but dependency-map.md still references REST modules.

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

1. **project-brief.md**:
   - Does Vision need rewording?
   - Do Goals need updating?
   - Do Non-Goals need updating?
   - Do Key Technical Decisions need changing?
   - Record the decision with reasoning in the Decision Log section

2. **features.md**:
   - Which existing features are affected?
   - Which features should be marked `⛔ dropped`?
   - Are new features needed?

3. **dependency-map.md**:
   - Which modules are obsoleted by this change?
   - Which new modules are needed?
   - Which dependency relationships change?

4. **project-state.md**:
   - Which in-progress stories are affected?
   - Does the current sprint goal change?
   - Update Quick Summary to reflect the pivot

5. **failure-patterns.md**:
   - Are any existing patterns invalidated by this change?
   - Mark invalidated patterns as `Status: Obsolete (pivot: [reason])`

### Step 3: Present Change Plan

Before writing anything, present a summary to the user:

```
## Pivot: [one-sentence description]
Type: [Tech Swap | Scope Change | Architecture Shift | Goal Pivot]

### State File Changes:
- project-brief.md: [what changes]
- features.md: [N features affected, M dropped, K added]
- dependency-map.md: [N modules obsoleted, M added, K relationships changed]
- project-state.md: [N stories affected]
- failure-patterns.md: [N patterns obsoleted]

### Confirm? (yes/no)
```

### Step 4: Execute Updates

After user confirms, update ALL state files in order:

1. **project-brief.md** first (source of truth for direction)
2. **features.md** second (what we're building)
3. **dependency-map.md** third (how it connects)
4. **project-state.md** fourth (current work status)
5. **failure-patterns.md** last (historical patterns)

### Step 5: Decision Log Entry

Add an entry to the Decision Log section in project-brief.md:

```markdown
### [YYYY-MM-DD] [Decision Title]
- **Change**: [What changed]
- **Reason**: [Why this decision was made]
- **Impact**: [What was affected]
- **Alternatives Considered**: [What else was considered and rejected]
```

## Rules

- **Never skip the confirmation step** — the user must approve before any state file is written
- **Never update partially** — if you update project-brief.md, you MUST check and update all other state files too
- **Preserve history** — mark dropped features as `⛔ dropped`, don't delete rows
- **Record the why** — every pivot must have a Decision Log entry with reasoning
