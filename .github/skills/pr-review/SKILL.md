---
name: pr-review
description: 'Review external Pull Requests for quality, security, and direction alignment. Use when reviewing incoming PRs.'
---

# Code Review PR

## Purpose

Review an external Pull Request (PR) for quality, security, and direction alignment before merging.
Unlike the `reviewer` agent (which reviews your own changes pre-commit with full project context), this skill is for reviewing incoming PRs from teammates or external contributors. pr-review is a cold review — stricter on state file compliance because the reviewer has less context about the PR author's intent.

## Invoked By

- **User** (direct) — when assigned as a PR reviewer or asked to review a branch
- Unlike `reviewer` agent (self-review before commit), this skill is for reviewing **incoming external PRs**

## When to Apply

- When assigned as a PR reviewer
- When a teammate asks for a review of their branch
- When reviewing open-source contributions

## Procedure

### Step 1: Gather PR Context

1. Read the PR title, description, and linked issues
2. Run `git diff <base>...<branch>` (use the PR's base branch, per project-brief.md; default: main) to see all changes
3. Run `git log --oneline <base>...<branch>` to understand commit history
4. Count files changed: `git diff --stat <base>...<branch>`

### Step 2: Direction Alignment

1. Read `docs/project-brief.md` — Goals, Non-Goals, Decision Log
2. Check: Does this PR serve a listed Goal?
3. Check: Does this PR contradict a Non-Goal or Decision Log entry?
4. If misaligned → comment on the PR with the concern before proceeding

### Step 3: Scope Check

1. Read `docs/project-state.md` — current Sprint and Stories
2. Verify the PR changes only files within its stated scope
3. Flag any out-of-scope modifications

### Step 4: Code Quality

Run through these checks for each changed file:

- [ ] Architecture rules respected (no layer violations — check docs/dependency-map.md)
- [ ] No hardcoded credentials or API keys
- [ ] No `TODO` or `FIXME` without a linked issue
- [ ] Error handling is present where needed
- [ ] No overly complex functions (single responsibility)
- [ ] No duplicated logic that should be extracted to a shared module
- [ ] No circular imports (verify against docs/dependency-map.md)
- [ ] Naming conventions follow project standards (per project-brief.md → Key Technical Decisions)

### Step 5: Test Coverage

- [ ] New features have corresponding tests
- [ ] Modified code has updated tests
- [ ] No `.only` or `.skip` left in test files
- [ ] Interface changes have synchronized mocks (Iron Law #1)

### Step 6: State File Compliance

- [ ] New features registered in `docs/features.md` (Iron Law #7). If the PR is partial (only one layer of a feature), registration is optional — but must be registered when the feature-completing PR is merged.
- [ ] New modules registered in `docs/dependency-map.md` (Iron Law #6)
- [ ] `docs/project-state.md` Story Status updated

### Step 7: Failure Pattern Cross-Check

1. Read `docs/failure-patterns.md`
2. Check if any active FP-NNN pattern applies to the PR changes
3. If match found → comment with the pattern ID and prevention guidance

## Output Format

```
## PR Review: [PR title]

### Direction: ✅ Aligned / ⚠️ Concern / ❌ Misaligned
[details if not aligned]

### Scope: ✅ Clean / ⚠️ Out-of-scope changes found
[list of out-of-scope files if any]

### Code Quality: [N] issues found
- [issue 1]
- [issue 2]

### Test Coverage: ✅ Sufficient / ⚠️ Gaps found
[list of gaps if any]

### State Files: ✅ Updated / ⚠️ Missing updates
[list of missing updates if any]

### Failure Patterns: [N] matches
- FP-NNN: [description]

### Verdict: APPROVE / REQUEST_CHANGES / COMMENT
[summary recommendation]
```

### 🧭 Navigation — After PR Review

After PR review completes, always append a 🧭 block:

| PR Review Result | 🧭 Next Step |
|---|---|
| APPROVE | Merge & `release` — "리리즈 준비를 확인해줘" |
| REQUEST_CHANGES | [Fix] — "PR 지적사항을 수정하세요. 완료 후 다시 `pr-review` 호출" |
| Direction misaligned | `pivot` — "방향을 전환하고 state 파일을 업데이트해줘" |

Example 🧭 block for APPROVE:
```
---
🧭 Next Step
→ Next: `release`
→ Prompt: "리리즈 준비를 확인해줘"
→ Why: PR approved — validate deployment readiness
→ Pipeline: 🟢/🔵 Step 5/6
---
```

## Rules

- Do not modify the PR code directly — only review and comment
- Always check direction alignment FIRST — a well-written PR that goes the wrong direction is worse than a messy one that's aligned
- Be specific: reference file names, line numbers, and function names
- Suggest fixes, don't just point out problems

