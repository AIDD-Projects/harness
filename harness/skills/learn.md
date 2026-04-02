# Learn

## Purpose

Capture lessons from the current session before ending.
Updates failure-patterns.md with new patterns and refreshes project-state.md Quick Summary.
This is K-Harness's memory mechanism — without it, the same mistakes repeat across sessions.

## When to Apply

- Before ending a chat session (recommended as the LAST skill invoked)
- After a debugging session where a non-obvious fix was found
- After a review revealed a repeated mistake
- When the user explicitly asks to record a lesson

## Procedure

### Step 1: Review Session Activity

1. Scan recent git changes: `git log --oneline -10` and `git diff --stat HEAD~3`
2. Identify what was accomplished in this session
3. Identify any errors, failures, or unexpected issues that occurred

### Step 2: Failure Pattern Detection

For each issue/error that occurred in this session:

1. Read `failure-patterns.md`
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

### Step 3: Update project-state.md

1. Update **Quick Summary** (3 lines):
   - Line 1: What was accomplished in this session
   - Line 2: What is currently in progress
   - Line 3: What should be done next
2. Update **Story Status** table if any stories changed
3. Add to **Recent Changes** section with date and summary

### Step 4: Update features.md (if applicable)

1. If new features were added → add row to Feature List
2. If existing features were modified → update Key Files and Test Files columns
3. If features were completed → update Status to `✅ done`

### Step 5: Report

Present a summary of all updates made.

## Output Format

```
## Session Learn Complete

### Lessons Captured:
- [FP-NNN] (new/updated): [description]

### State Files Updated:
- [x] project-state.md — Quick Summary refreshed
- [x] failure-patterns.md — [N] patterns added/updated
- [x] features.md — [N] features updated (if applicable)

### Next Session Should:
1. [recommended first action]
2. [next priority]

STATUS: DONE
```

## Rules

- Never invent patterns that didn't actually occur — record only real failures
- Keep failure pattern descriptions concise (1-2 sentences for Cause and Prevention)
- If no failures occurred, skip Step 2 and just update state files
- Do not modify source code — this skill only updates state files
- Quick Summary must be exactly 3 lines — concise enough for the next session to scan instantly

## Anti-patterns

| Anti-pattern | Correct Approach |
|---|---|
| Record theoretical risks as failure patterns | Only record failures that actually happened |
| Write vague descriptions ("something broke") | Be specific: file name, error message, root cause |
| Skip this skill because "nothing went wrong" | Still update Quick Summary and Story Status |
| Update failure-patterns.md but not project-state.md | Always update both — they serve different purposes |
