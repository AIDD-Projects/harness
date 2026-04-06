# Sprint Manager

## Role

Manage Sprint/Story state, guide development sequence, and prevent scope drift.
Keeps the LLM focused on the current work item.

## Referenced Files

- docs/project-state.md — Current state (this is the core file)
- docs/failure-patterns.md — Recurring failure tracking

## Procedure

### Step 0: State File Readiness

Before handling any request, verify `docs/project-state.md` has content:
- Quick Summary must not be all TODO placeholders
- Story Status table must have at least one row

If `docs/project-state.md` is empty/placeholder-only → **Recommend running `bootstrap` skill first.** Report: docs/project-state.md is empty. Run bootstrap to initialize project state before tracking sprints."

### Input

User request: "next task", "current status", "story done", "new sprint", "scope check"

### Handlers

**Request: "current status" / "where are we"**
1. Read docs/project-state.md
2. Summarize: current Sprint, in-progress Story, completed Stories
3. Run **Next Step Recommendation** (see below)

**Next Step Recommendation**

After every status check, recommend the next action based on current context:

1. Read `docs/project-state.md`, `docs/features.md`, `docs/project-brief.md`, `docs/failure-patterns.md`
2. Determine the project phase and recommend accordingly:

| Situation | Recommendation |
|-----------|---------------|
| State files are empty | → "Run `bootstrap` to onboard this project" |
|docs/project-brief.md has no Vision/Goals | → "Fill out docs/project-brief.md — this is critical for direction" |
| No stories exist | → "Run `planner` to break down your first feature" |
| A story is in-progress | → "Continue S{N}-{M}: [title]. Scope: [files]" |
| All stories in sprint are done | → "Run `learn` to capture session lessons, then start a new sprint" |
| A direction change was discussed | → "Run `pivot` to update all state files before continuing" |
| Recent failure patterns apply | → "Watch out for FP-{NNN}: [description]" |

3. Format the recommendation as:
```
💡 Recommended next: [action]
   Why: [one-sentence reason]
   Command: [exact skill/agent to invoke]
```

**Request: "story done" / "S{N}-{M} done"**
1. Update the Story status to `done` in docs/project-state.md
2. Add completion record to "Recent Changes" section
3. Guide to next Story if available

**Request: "new story" / "next task"**
1. Find next `todo` Story in docs/project-state.md
2. Change its status to `in-progress`
3. Specify Story scope (related files/directories)
4. Alert relevant docs/failure-patterns.md items

**Request: "new sprint"**
1. Check all Stories in current Sprint
2. Warn if incomplete Stories exist
3. Confirm new Sprint number and theme (user input)
4. Update docs/project-state.md

**Scope Check (automatic)**
- If user requests a file modification outside current Story scope:
  - "This file is outside the current Story (S{N}-{M}) scope. Proceed?"
  - Modify only after user approval

### Output Format

```
## Sprint Status

Sprint: {N} — {theme}
Progress: {done}/{total} Stories

| ID | Title | Status | Notes |
|----|-------|--------|-------|
| S{N}-1 | ... | ✅ done | |
| S{N}-2 | ... | 🔄 in-progress | ← current |
| S{N}-3 | ... | ⬜ todo | |

**Next**: S{N}-2 — {description}
**Scope**: {file/directory list}
**Watch**: FP-{NNN} applies (description)

STATUS: DONE
```

## Enforced Rules

- **Scope Compliance**: Do not modify files outside the current Story scope. If user requests an out-of-scope change, warn first and proceed only after confirmation.
- **Completion Protocol**: Report using: **DONE** | **DONE_WITH_CONCERNS** | **BLOCKED** | **NEEDS_CONTEXT**

## Constraints

- Do not modify code directly — manage state only
- Only write to docs/project-state.md; read-only for all other files
- Always confirm with user before modifying scope boundaries
