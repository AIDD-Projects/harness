# Feature Registry

A living document of all features in this project. Update whenever features are added, modified, or deprecated.

## Feature List

| Feature | Status | Key Files | Test Files | Owner |
|---------|--------|-----------|------------|-------|
| CLI Init (7 IDE) | ✅ done | bin/cli.js, src/init.js | - | - |
| VS Code Generator | ✅ done | src/init.js (generateVscode) | - | - |
| Claude Generator | ✅ done | src/init.js (generateClaude) | - | - |
| Cursor Generator | ✅ done | src/init.js (generateCursor) | - | - |
| Codex Generator | ✅ done | src/init.js (generateCodex) | - | - |
| Windsurf Generator | ✅ done | src/init.js (generateWindsurf) | - | - |
| Core Rules (8 Iron Laws) | ✅ done | harness/core-rules.md | - | - |
| Testing Rules | ✅ done | harness/testing-rules.md | - | - |
| Backend Rules | ✅ done | harness/backend-rules.md | - | - |
| Skill: test-integrity | ✅ done | harness/skills/test-integrity.md | - | - |
| Skill: security-checklist | ✅ done | harness/skills/security-checklist.md | - | - |
| Skill: investigate | ✅ done | harness/skills/investigate.md | - | - |
| Skill: impact-analysis | ✅ done | harness/skills/impact-analysis.md | - | - |
| Skill: feature-breakdown | ✅ done | harness/skills/feature-breakdown.md | - | - |
| Agent: reviewer | ✅ done | harness/agents/reviewer.md | - | - |
| Agent: sprint-manager | ✅ done | harness/agents/sprint-manager.md | - | - |
| Agent: planner | ✅ done | harness/agents/planner.md | - | - |
| Feature Registry (features.md) | ✅ done | harness/features.md | - | - |
| Session Handoff Protocol | ✅ done | harness/core-rules.md, harness/project-state.md | - | - |
| Project Brief (project-brief.md) | ✅ done | harness/project-brief.md | - | - |
| Direction Guard | ✅ done | harness/agents/planner.md (Step 2) | - | - |
| npm Public Publish | ✅ done | package.json | - | - |
| Augment Code Generator | ✅ done | src/init.js (generateAugment) | - | - |
| Antigravity Generator | ✅ done | src/init.js (generateAntigravity) | - | - |

## Status Legend

- ✅ **done** — Feature complete
- 🔧 **active** — Currently being developed
- ⬜ **planned** — In backlog, not started
- ⚠️ **broken** — Known issues
- ❌ **dropped** — Removed or abandoned

## Update Protocol

When you add or modify a feature:
1. Add/update the row in the Feature List table above
2. List the key source files and test files
3. Update the Status column

**Iron Law #7**: When adding a new feature, register it here in the same commit.
