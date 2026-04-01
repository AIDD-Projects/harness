# Dependency Map

A living document of module relationships. Update whenever modules are added or modified.

## Module Registry

| Module | Layer | Purpose | Depends On | Depended By |
|--------|-------|---------|------------|-------------|
| bin/cli.js | entry | CLI 진입점 | src/init.js | - |
| src/init.js | core | IDE별 파일 생성기 (6 IDE) | harness/* | bin/cli.js |
| harness/core-rules.md | template | Iron Laws, session protocol | - | src/init.js |
| harness/testing-rules.md | template | 테스트 규칙 | - | src/init.js |
| harness/backend-rules.md | template | 백엔드 규칙 | - | src/init.js |
| harness/skills/*.md | template | 5 skill 템플릿 | - | src/init.js |
| harness/agents/*.md | template | 3 agent 템플릿 | - | src/init.js |
| harness/project-state.md | template | 상태 추적 템플릿 | - | src/init.js |
| harness/features.md | template | 기능 레지스트리 템플릿 | - | src/init.js |
| harness/project-brief.md | template | 프로젝트 방향성 템플릿 | - | src/init.js |

## Dependency Rules

- **No circular dependencies**: If A depends on B, B must not depend on A.
- **Layer direction**: domain → application → infrastructure/presentation (never reverse).
- **Interface boundaries**: Modules communicate through interfaces, not concrete implementations.
- **New module = new row**: Every new module must be registered here before implementation.

## Change Impact Quick Reference

When modifying a module:

1. Find the module row above
2. Check the **Depended By** column — these modules may break
3. For each dependent module:
   - Check if the change affects the public interface
   - Update tests and mocks for all affected dependents
4. Record the change in project-state.md

## Interface Change Log

<!-- Record interface changes as they happen.
   Format:
   | Date | Module | Change | Affected Modules | Status |
   |------|--------|--------|------------------|--------|
   | 2026-04-01 | auth | Added `resetPassword()` | api, admin | Updated |
-->

| Date | Module | Change | Affected Modules | Status |
|------|--------|--------|------------------|--------|
| 2026-04-01 | src/init.js | Augment Code 제너레이터 추가 | - | Done |
| 2026-04-01 | src/init.js | features.md, project-brief.md 출력 추가 | - | Done |
| 2026-04-01 | harness/core-rules.md | Iron Law #7, #8, Session Bootstrap 추가 | src/init.js | Done |
