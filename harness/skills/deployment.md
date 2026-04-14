# Deployment

## Purpose

Pre-deployment validation checklist. Ensures all quality gates pass and state files are consistent before releasing or deploying.

## When to Apply

- Before deploying to staging or production
- Before publishing a new npm/package version
- Before creating a release tag
- When the user says "ready to deploy" or "prepare release"

## Procedure

### Step 1: Version Check

1. Read `package.json` (or equivalent manifest) — note current version
2. Verify the version was bumped appropriately (Semantic Versioning):
   - Bug fix → patch (0.0.x) — e.g., `v1.2.3 → v1.2.4`
   - New feature (backward-compatible) → minor (0.x.0) — e.g., `v1.2.3 → v1.3.0`
   - Breaking change → major (x.0.0) — e.g., `v1.2.3 → v2.0.0`
   - If unsure, ask the designated authority (per project-brief.md)
3. If version was not bumped → **warn and recommend bumping before deploy**

### Step 2: Test Suite

1. Run the project's test command (per project-brief.md → Key Technical Decisions; e.g., `npm test`, `pytest`, `go test ./...`)
2. **All tests must pass.** If any fail → **BLOCKED, do not proceed**
3. Report: total tests, passed, failed

### Step 3: State File Consistency

Verify all state files are up to date:

- [ ] `docs/project-state.md` — Quick Summary reflects current state
- [ ] `docs/features.md` — All implemented features marked as `✅ done`
- [ ] `docs/dependency-map.md` — No orphaned modules
- [ ] `docs/failure-patterns.md` — No unresolved critical patterns
- [ ] `docs/project-brief.md` — Decision Log has entries for all major changes

### Step 4: Security Scan

1. Run the `security-checklist` skill
2. Verify no credentials, API keys, or `.env` files are staged
3. Check for known vulnerable dependencies (if applicable)

### Step 5: Git Status

1. `git status` — working directory should be clean
2. `git stash list` — verify no unintended stashes exist (if stashes are present, confirm they are intentional)
3. `git log --oneline -5` — verify recent commits are meaningful
3. Verify current branch is appropriate for deployment (the default branch or a release branch, per project-brief.md)

### Step 6: Changelog / Release Notes

1. Check if CHANGELOG.md or release notes exist
2. If yes → verify they include entries for all changes since last release
3. If no → generate a summary from `git log --oneline <last-tag>..HEAD`

## Output Format

```
## Deployment Readiness: [project-name] v[version]

### Pre-flight Checks:
- [x/✗] Version bumped: [version]
- [x/✗] Tests: [passed]/[total] passed
- [x/✗] State files consistent
- [x/✗] Security scan clean
- [x/✗] Git status clean
- [x/✗] Release notes prepared

### Verdict: READY / NOT_READY
[blockers if not ready]

### Deploy Command:
[Suggest based on project type detected in project-brief.md Key Technical Decisions:
  npm: npm publish / npx changeset publish
  Docker: docker build + docker push
  GitHub: gh release create vX.Y.Z
  Cloud: terraform apply / aws deploy]
```

### 🧭 Navigation — After Deployment Check

After deployment validation completes, always append a 🧭 block:

| Deployment Result | 🧭 Next Step |
|---|---|
| READY | [Deploy] — "배포 명령을 실행하세요" |
| NOT_READY (test failure) | [Fix] — "테스트 실패를 수정해줘. 완료 후 다시 `deployment` 호출" |
| NOT_READY (state files) | `learn` — "state 파일을 정리해줘" |
| NOT_READY (security) | `security-checklist` — "보안 이슈를 해결해줘" |

Example 🧭 block for READY:
```
---
🧭 Next Step
→ Call: [Deploy]
→ Prompt example: "배포 명령을 실행하세요"
→ Why: All checks passed — safe to deploy
→ Pipeline: 🟢/🔵 Step 5/6 → deploy
---
```

## Rollback Procedure

If a deployment fails or a critical issue is found post-deploy:

1. **Immediate**: Revert to the last known-good version
   - npm: `npm unpublish <pkg>@<bad-version>` (within 72h) or publish a patch fix
   - Docker: `docker tag <image>:<previous-tag> <image>:latest && docker push`
   - GitHub: `gh release delete vX.Y.Z` + `git tag -d vX.Y.Z && git push --delete origin vX.Y.Z`
2. **Record**: Add entry to `docs/failure-patterns.md` with deployment failure details
3. **Re-validate**: Run `deployment` skill again on the rollback commit to confirm stability
4. **Post-mortem**: Run `learn` skill to capture the incident for future sessions

## Rules

- Never deploy with failing tests — no exceptions
- Never deploy with unstaged changes in the working directory
- Always verify version bump before deployment
- This skill is read-only — it validates but does not execute the deployment

<!-- TEAM_MODE_START -->
## Team Mode: Pre-Deploy Coordination

### Shared State Sync
1. Run `git pull` on the default branch before starting deploy validation (per project-brief.md → Key Technical Decisions; default: main)
2. Verify `docs/features.md` and `docs/dependency-map.md` are up to date with latest changes from all developers
3. Check that no other developer has in-progress stories that depend on the current release

### Owner Verification
- Verify all modified modules have their Owner's approval
- If deploying changes to modules owned by others, confirm they have reviewed and approved
<!-- TEAM_MODE_END -->
