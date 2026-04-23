# Project Instructions

## Architecture

Node.js / Pure JavaScript / Zero Dependencies
CLI tool architecture — single entry (bin/cli.js → src/init.js)

## Directory Structure

src/           # Core logic (init.js)
bin/           # CLI entry point
harness/       # Template files (skills, agents, state files)
templates/     # User-facing templates (agent.template.md, skill.template.md)
tests/         # Test files (Node.js native test runner)
docs/          # Documentation (architecture, analysis, strategy)

## Core Type Rules

- `GENERATORS` is a plain object map (not a class or enum).
- `mode` parameter is a string: `'solo'` or `'team'` (not boolean).
- All file I/O uses synchronous `fs` methods (`writeFileSync`, `mkdirSync`).

## Crew Integration Architecture

kode:harness(이 프로젝트)는 **외부 기획 도구의 산출물을 소비하여 정밀한 개발을 지원**하는 구조이다.
현재 기획 도구는 사내 기획 서비스이지만, 도구명·산출물 형식은 언제든 변경될 수 있다.

### 핵심 규칙

- **코드/문서에 사내 서비스명 직접 노출 금지** — 항상 "external planning tool", "planning artifacts" 등 일반 용어 사용. 차단 대상 키워드는 `qa-check.sh §8` grep 패턴 참조
- **`--crew` CLI 플래그는 숨겨진 옵션** — `--help`에 노출하지 않되 기능은 유지
- **CREW_MODE 마커 블록** (`<!-- CREW_MODE_START/END -->`)은 crew=false(기본)일 때 전체 제거, crew=true일 때 마커만 제거하고 내용 유지
- **산출물 입력 경로**: `docs/crew/`, `docs/PM/`, `docs/Analyst/`, `docs/ARB/` — bootstrap이 자동 감지
- **산출물 형식이 변경되면**: `harness/skills/bootstrap.md`의 Crew Artifact Detection 로직과 `src/init.js`의 `resolveContent()` 동시 수정 필요

### 변경 시 체크포인트

1. `qa-check.sh §8`이 사내 키워드를 자동 탐지 — 새 서비스명 추가 시 grep 패턴도 갱신
2. README.md / README.ko.md에서 기획 도구 설명은 일반 용어로만 기술
3. harness/ 템플릿 변경 → `harness init` 재실행으로 생성 파일(.github/ 등)에 반영 확인

## Iron Laws

1. **Mock Sync**: When you modify a repository/service interface, update corresponding mocks in the same commit.
2. **Type Check**: Before calling a constructor or factory, read the actual source file to verify parameters. Do not rely on memory.
3. **Scope Compliance**: Do not modify files outside the current Story scope (see project-state.md) without reporting first.
4. **Security**: Never include credentials, passwords, or API keys in code or commits.
5. **3-Failure Stop**: If the same approach fails 3 times, stop and report to the user.
6. **Dependency Map**: When adding or modifying a module, update dependency-map.md in the same commit. Register new modules, update relationship columns.
7. **Feature Registry**: When adding a feature, register it in features.md in the same commit.
8. **Session Handoff**: At session end, update project-state.md Quick Summary so the next session has context.
9. **Common First**: All features must work at Common level (🟢🔵🔴) without crew dependency. Crew-specific logic must be inside crew marker blocks only.

## Test Rules

- New feature = New test. Do not commit feature code without tests.
- Test command: `npm test` <!-- TODO: customize -->
- Mock location: `tests/__mocks__/` <!-- TODO: customize -->

## Completion Status Protocol

Report completion using one of:
- **DONE**: All steps completed. Present evidence (test results, file list, etc).
- **DONE_WITH_CONCERNS**: Completed but with concerns. List each concern.
- **BLOCKED**: Cannot proceed. Describe the cause and what was tried.
- **NEEDS_CONTEXT**: Need more information. Describe exactly what is needed.

## Concreteness Rules

- When modifying files, specify exact paths and line numbers.
- When tests fail, quote the test name and error message.
- When type errors occur, specify expected type and actual type.

## References

- failure-patterns.md — Log of known failure patterns
- project-state.md — Sprint/Story tracking, module registry
- dependency-map.md — Module dependency graph (living architecture doc)

- Failure patterns: failure-patterns.md
- Current state: project-state.md
