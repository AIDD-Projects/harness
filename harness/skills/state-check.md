# State Check

## Purpose

Deterministic verification that state files are internally consistent and not silently drifting.
This skill exists because LLM self-checks miss state drift — every Iron Law #10 self-verify pass should run this skill before reporting STATUS: DONE.

## Invoked By

- **pm** agent — Post-Approval step (after writing features.md / project-state.md / dependency-map.md)
- **reviewer** agent — Step 8 (State File Audit) — supplements existing STATE-AUDIT logic
- **wrap-up** skill — Step 5.5 (after dependency-map verify)
- **User** (direct) — "state 파일 일관성 점검해줘"

## When to Apply

- After ANY agent writes to state files (mandatory before STATUS: DONE)
- Before committing changes that touch `docs/` or `.harness/`
- When the user reports state files "feel out of sync"
- Periodically — even when nothing recently changed (drift accumulates silently)

## Procedure

> **Philosophy**: Use deterministic cross-checks, not LLM intuition. Each check has a single PASS/WARN/FAIL outcome that does not depend on judgment. The LLM performs the file reads and comparisons listed below — no shell scripts, no external dependencies.

### Check 1: Required State Files Exist with Non-Placeholder Content

For each required state file, verify it exists and is not just a template stub:

| File | Placeholder Sentinel (FAIL if present) |
|------|----------------------------------------|
| `docs/project-state.md` (or `.harness/`) | `S1-1 \| Project scaffolding` |
| `docs/project-brief.md` | `This is the north star for all decisions` |
| `docs/dependency-map.md` | `Add new modules above this line` |
| `docs/features.md` | `Add new features above this line` |

For each file:
- **Missing** → FAIL: `[FAIL] {file} not found`
- **Sentinel present** → WARN: `[WARN] {file} contains template placeholder — run setup`
- **Real content** → PASS

> `failure-patterns.md` is excluded — FP-001~004 templates with Frequency: 0 are normal initial state.

### Check 2: features.md ↔ project-state.md Story Consistency

1. Read all `✅ done` Stories from `docs/project-state.md` (or `.harness/project-state.md` in Team mode) Story Status table
2. Read `docs/features.md` Feature Registry
3. For each `✅ done` Story:
   - If Story has `[FR-NNN]` prefix → must map to a feature row with that FR reference
   - Otherwise → must map to at least one feature row whose Key Files overlap with the Story's Scope
4. Outcomes:
   - Story ✅ done but no matching feature row → FAIL: `[FAIL] Story {S-N-M} done but no feature registered`
   - Story ✅ done but feature still `⬜ planned` → FAIL: `[FAIL] Feature status drift — {feature} is planned but Story {S-N-M} is done`
   - All consistent → PASS

### Check 3: dependency-map.md vs Actual src/ Directory Count

> **Goal**: detect orphan modules (in src/ but not registered) and stale entries (registered but deleted).

1. Read `docs/dependency-map.md` and count rows in the Module table (excluding header / comment lines like `Add new modules above this line`)
2. Inspect the source root (priority order — first existing path wins):
   - `src/`
   - `lib/`
   - `app/`
   - Project root (if no src-like directory)
3. Count direct child directories of the source root that look like modules (skip `__pycache__/`, `node_modules/`, `dist/`, `build/`, `.next/`, hidden dirs)
4. Compare:
   - `|map_count - dir_count| / max(map_count, dir_count) <= 0.20` → PASS
   - Difference > 20% → WARN: `[WARN] dependency-map has {map_count} modules but src/ has {dir_count} directories — likely drift`
   - One side is 0 and the other > 0 → FAIL: `[FAIL] dependency-map empty but {dir_count} src directories exist (or vice versa)`

> For tiny projects (<3 modules), this check always passes — see setup.md "Small Project Guidance".

### Check 4: agent-memory Legacy Names

Verify no legacy agent-memory file names remain after the v0.9 rename (planner→pm, sprint-manager→lead, navigator→lead, builder→pm):

1. Scan `docs/agent-memory/` (and `.harness/agent-memory/` in Team mode)
2. If any of these legacy names exist → WARN with rename suggestion:
   - `planner.md` → rename to `pm.md`
   - `sprint-manager.md` → rename to `lead.md`
   - `navigator.md` → rename to `lead.md`
   - `builder.md` → rename to `pm.md`
3. If both legacy and new names exist for the same role → FAIL: `[FAIL] Both {legacy} and {new} exist — merge then delete legacy`

### Check 5: Iron Law #10 Self-Verify Marker

When invoked from another agent (pm, reviewer, wrap-up), confirm the calling agent declared its self-verify intent:
- The calling agent should have written nothing else after invoking state-check
- If the agent already produced STATUS: DONE before calling state-check → WARN: `[WARN] Iron Law #10 violation — STATUS: DONE issued before state-check`

This check is informational — humans calling the skill directly can ignore it.

<!-- CREW_MODE_START -->
### Check 6 (🟣 Pipeline only): Validation Tracker Coverage

If `docs/project-brief.md` contains a `## Validation Tracker` section:

1. Read FR Coverage table — for each FR with at least one Story, that Story must exist in project-state.md Story Status
2. Read ARB Fail Resolution table — for each Fail item with a Story link, the Story must exist
3. Outcomes:
   - Tracker references missing Story → FAIL: `[FAIL] Validation Tracker references {S-N-M} but Story not found in project-state.md`
   - Story marked ✅ done in project-state but Tracker still shows ⬜ → WARN: `[WARN] Validation Tracker out of sync — {Story} done but {KPI/FR/ARB} status unchanged`

If no Validation Tracker → skip.
<!-- CREW_MODE_END -->

## Output Format

```
## State Check Result

### Check 1: Required Files
- [x] docs/project-state.md — has content
- [x] docs/project-brief.md — has content
- [x] docs/dependency-map.md — has content
- [x] docs/features.md — has content

### Check 2: Story ↔ Feature Consistency
- {N} ✅ done Stories cross-checked
- {M} matched / {K} drifted

### Check 3: dependency-map ↔ src/ Coverage
- map: {N} modules, src/: {M} directories — {diff}% drift

### Check 4: Agent Memory Legacy Names
- No legacy names found (or list of legacy files to rename)

<!-- CREW_MODE_START -->
### Check 6: Validation Tracker (🟣)
- {N} FR references checked / {M} drifted
<!-- CREW_MODE_END -->

### Findings
- [PASS] {N} checks passed
- [WARN] {N} warnings: {list}
- [FAIL] {N} failures: {list}

STATUS: PASS | WARN | FAIL
```

### Result Interpretation

- **PASS** — all checks passed; calling agent may proceed with STATUS: DONE
- **WARN** — non-blocking issues; calling agent should include warnings in its output but may proceed
- **FAIL** — blocking; calling agent must NOT report STATUS: DONE until failures are resolved

### 🧭 Navigation — After State Check

When invoked directly (not by another agent), append:

```
---
🧭 Next Step
→ Result: {PASS | WARN | FAIL}
→ Next: {fix the listed issues, then re-run state-check} or {return to caller}
→ Why: state-check is the deterministic gate before STATUS: DONE
→ Pipeline: utility skill (no pipeline step)
---
```

When invoked by another agent (pm/reviewer/wrap-up), control returns to the caller — no separate 🧭 block.

## Rules

- Do NOT invent data. Read the files and report exactly what you find.
- Do NOT modify state files in this skill — diagnosis only. Caller decides remediation.
- Do NOT run shell scripts. All checks are markdown-described file reads + comparisons.
- If a check cannot be performed (e.g., `docs/` missing entirely), report it as FAIL and stop — further checks are meaningless.

## Anti-patterns

| Anti-pattern | Correct Approach |
|---|---|
| Skip state-check because "I just wrote those files" | Run it anyway — Iron Law #10 mandates self-verify |
| Report PASS when one check could not be performed | Report FAIL with reason; PASS requires all applicable checks ran |
| Auto-fix drift inside this skill | This skill is read-only diagnosis — caller fixes drift |

<!-- TEAM_MODE_START -->
## Team Mode: State Check

In Team mode:
- Personal state files live in `.harness/` (project-state.md, failure-patterns.md, agent-memory/)
- Shared files live in `docs/` (project-brief.md, features.md, dependency-map.md)
- Check 1 looks in BOTH directories — file exists if either path has it
- Check 2 (Story ↔ Feature) reads `.harness/project-state.md` (personal) against `docs/features.md` (shared) — drift is per-developer
- Check 4 (legacy agent-memory) scans `.harness/agent-memory/` only
- If `git pull` was skipped before this run, shared-file checks may report stale data — note this in WARN output
<!-- TEAM_MODE_END -->
