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
- [ ] **Cross-check features ↔ stories**: All `done` stories should have their features marked `✅ done` in features.md

<!-- CREW_MODE_START -->
- [ ] **Validation Tracker FR Coverage**: All Functional Requirements (FR) have at least one mapped Story (`docs/project-brief.md` → Validation Tracker)
- [ ] **Validation Tracker ARB Fail Resolution**: All ARB Fail items resolved (✅) or explicitly deferred with rationale
- [ ] **KPI Coverage**: All KPIs addressed or deferred with documented reason
- [ ] **CI Standards (🟣)**: If `docs/project-brief.md` has `## CI Artifact Index`, deploy artifacts (Dockerfile, CI workflow, build config) match the indexed guide's Key Constraints (see Step 3.5)
<!-- CREW_MODE_END -->

<!-- CREW_MODE_START -->
### Step 3.5: CI Standards Compliance (🟣 Pipeline only)

If `docs/project-brief.md` has a `## CI Artifact Index` section:

1. Read the indexed reference URL and Key Constraints for the project's primary language/build tool.
2. Verify the deployed configuration matches each Key Constraint listed in the index:
   - Base image (e.g., must use the standard company base image)
   - Build cache strategy (e.g., must use the company-approved cache mirror)
   - Required CI stages (e.g., security scan, signing)
   - Any other constraint listed in the index row
3. If **any** constraint is unmet → mark **NOT_READY** and list the unmet constraints in the verdict.
4. If `## CI Artifact Index` does not exist (or is empty) → skip this step entirely.

This step references the indexed company guide; it does not embed the guide content itself. The reviewer agent (Step 2.5) catches CI standard issues earlier in the cycle; this step is the final gate before deploy.
<!-- CREW_MODE_END -->

### Step 4: Security Scan

1. Run the `secure` skill
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

### Step 6.5: IDE Adapter 공식 문서 정합성 (IDE-targeting 프로젝트만)

If the project ships IDE-specific adapters or generators (e.g., `src/init.js` with multiple `generate<IDE>` functions, OR distributes templates installed under IDE-specific directories like `.cursor/`, `.codex/`, `.windsurf/`, `.agents/`):

1. **List all IDEs supported** by the project (read source — do not guess).
2. For **each IDE**, fetch the **official current documentation** for that IDE's agent/rules/skills layout. Do not rely on training data.
3. **Diff** the project's generated paths/file formats against the official docs:
   - File extensions (e.g., Codex requires `.toml`, not `.md`)
   - Directory locations (e.g., Antigravity uses `.agents/`, not `.gemini/`)
   - Frontmatter schema (required fields per IDE)
   - Cross-tool standards (e.g., `AGENTS.md`, `.agents/skills/`)
4. If **any drift** is detected → mark **NOT_READY**. Block the release until adapters match official docs.
5. Verify regression tests assert the **absence** of stale paths (e.g., `assert(!exists('.gemini/'))` if the IDE moved off Gemini).
6. Cite the official doc URL inline in the generator code as a comment (source-of-truth pointer).

**Rationale**: IDE vendors change their layouts (e.g., Cursor's skills location, Antigravity's `.gemini/` → `.agents/` migration). Without this gate, every IDE update silently breaks `harness init` for that IDE's users.

If the project does not ship IDE adapters → skip this step entirely.

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
<!-- CREW_MODE_START -->
- [x/✗/–] CI standards (🟣): [verdict] — `–` if no CI Artifact Index
<!-- CREW_MODE_END -->

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
| NOT_READY (test failure) | [Fix] — "테스트 실패를 수정해줘. 완료 후 다시 `release` 호출" |
| NOT_READY (state files) | `wrap-up` — "state 파일을 정리해줘" |
| NOT_READY (security) | `secure` — "보안 이슈를 해결해줘" |

Example 🧭 block for READY:
```
---
🧭 Next Step
→ Next: [Deploy]
→ Prompt: "배포 명령을 실행하세요"
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
3. **Re-validate**: Run `release` skill again on the rollback commit to confirm stability
4. **Post-mortem**: Run `wrap-up` skill to capture the incident for future sessions

## Rules

- Never deploy with failing tests — no exceptions
- Never deploy with unstaged changes in the working directory
- Always verify version bump before release
- This skill is read-only — it validates but does not execute the release

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
