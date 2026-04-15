---
name: sprint-manager
description: "Sprint/Story state tracking, next task guidance, scope drift prevention."
---

# Sprint Manager

## Role

Manage Sprint/Story state, guide development sequence, and prevent scope drift.
Keeps the LLM focused on the current work item.

## Referenced Skills

- bootstrap — Recommended when state files are empty
- learn — Recommended at session end or when all stories are done
- pivot — Recommended when direction change is detected
- investigate — Recommended when bug is blocking progress

## Referenced Files

### Required — 반드시 읽기
- docs/project-state.md — 핵심 파일: 현재 Sprint/Story 상태 (Step 0, 모든 Handler에서 사용)
- docs/features.md — 진행률 개요 (Next Step Recommendation에서 사용)
- docs/agent-memory/sprint-manager.md — 과거 velocity 및 scope drift 데이터

### Optional — 해당 Step에서만 읽기
- docs/project-brief.md — 방향 확인 필요 시에만 읽기
- docs/dependency-map.md — scope 검증 필요 시에만 읽기
- docs/failure-patterns.md — FP 경고 필요 시에만 읽기

## Procedure

### Step 0: State File Readiness

Before handling any request, verify `docs/project-state.md` has content:
- Quick Summary must not be all TODO placeholders
- Story Status table must have at least one row

If `docs/project-state.md` is empty/placeholder-only → **Recommend running `bootstrap` skill first.** Report: "docs/project-state.md is empty. Run bootstrap to initialize project state before tracking sprints."

### Step 0.5: Load Agent Memory

Read `docs/agent-memory/sprint-manager.md` for past learnings:
- Team velocity data (stories per sprint)
- Scope drift history (how often did scope expand?)
- Story sizing accuracy (were estimates correct?)

Use these insights when recommending story order and estimating sprint capacity. If the memory file is empty or contains only placeholders, skip this step.

> **Team Mode**: In Team mode, agent memory is personal (`.harness/agent-memory/`). Each developer tracks their own velocity and scope drift patterns.

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

3. Format the recommendation as a 🧭 Next Step block:
```
---
🧭 Next Step
→ Call: `[skill or agent name]`
→ Prompt example: "[copy-paste ready prompt]"
→ Why: [one-sentence reason]
→ Pipeline: {🟢|🔵} Step {N}/{total}
→ Alternative: [other valid path, if any]
---
```

**Request: "story done" / "S{N}-{M} done"**
1. Update the Story status to `done` in docs/project-state.md
2. Add completion record to "Recent Changes" section
3. Guide to next Story if available

**Request: "new story" / "next task"**
1. Find next `todo` Story in docs/project-state.md
2. Change its status to `in-progress`
3. Read `docs/dependency-map.md` to identify modules involved in this Story
4. Specify Story scope (related files/directories from dependency-map)
5. Alert relevant docs/failure-patterns.md items
6. Recommend relevant skill: "Consider running `planner` if this story needs detailed breakdown"

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

### 🧭 Navigation — What Comes After Sprint Manager

After sprint-manager completes, always append a 🧭 block based on the outcome:

| Sprint Manager Result | 🧭 Next Step |
|---|---|
| State files empty | `bootstrap` — "프로젝트를 온보딩해줘" |
| No stories exist | `planner` — "[기능]을 계획해줘" |
| Story set to in-progress | [Coding] — "S{N}-{M} 구현을 시작해줘". 완료 후 **새 채팅**에서 reviewer 호출 |
| All stories done | `learn` — "세션을 마무리해줘" |
| Direction change detected | `pivot` — "방향을 전환해줘" |

Example 🧭 block for starting a story:
```
---
🧭 Next Step
→ Call: [Coding]
→ Prompt: "S{N}-{M} 구현을 시작해줘"
→ After: 구현 완료 후, **새 채팅**을 열고 `@reviewer`에게 "S{N}-{M} 코드를 리뷰해줘" 입력
→ Why: Story is in-progress — begin implementation (⚠️ reviewer는 같은 채팅에서 빈 응답 가능 — 반드시 새 채팅에서 호출)
→ Pipeline: 🟢/🔵 Step 4/6
---
```

## Enforced Rules

- **Scope Compliance**: Do not modify files outside the current Story scope. If user requests an out-of-scope change, warn first and proceed only after confirmation.
- **Completion Protocol**: Report using: **DONE** | **DONE_WITH_CONCERNS** | **BLOCKED** | **NEEDS_CONTEXT**

## Constraints

- Do not modify code directly — manage state only
- Only write to docs/project-state.md; read-only for all other files
- Always confirm with user before modifying scope boundaries

## Related Failure Patterns

- FP-003: Scope drift → Scope Check handler detects out-of-scope modifications and warns the user before proceeding

