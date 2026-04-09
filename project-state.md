# Project State

> 200-line cap. Move completed sprints to an archive file when approaching limit.

## Quick Summary

kode:musher v1.0.0 npm 배포 완료. 6 IDE 지원 (vscode, claude, cursor, codex, windsurf, antigravity). 22줄 디스패쳐 패턴, 규칙 임베딩, Team Mode, 103 테스트. 다음 단계: 실제 프로젝트 파일럿 (Gate 1).

## Current Sprint

- Sprint: 3 — Team Mode & Pilot Prep
- Started: 2026-04-07
- Branch: main

## Story Status

| ID | Title | Status | Assignee |
|----|-------|--------|----------|
| S2-1 | kode:musher 자체에 harness 적용 (dogfooding) | ✅ done | - |
| S2-2 | Antigravity 제너레이터 + SKILL.md 포맷 | ✅ done | - |
| S2-3 | Augment 제너레이터 Skills 추가 | ✅ done | - |
| S2-4 | npm publish v0.3.0 | ✅ done | - |
| S2-5 | 실제 프로젝트에서 검증 | ⬜ todo | - |

## Completed Sprints

### Sprint 1 — Foundation (2026-03 ~ 2026-04-01)

| ID | Title | Status |
|----|-------|--------|
| S1-1 | CLI + 5 IDE generators | ✅ done |
| S1-2 | Core rules, testing/backend rules | ✅ done |
| S1-3 | Skills (5), Agents (3) | ✅ done |
| S1-4 | Dependency-aware structure (dependency-map, impact-analysis, planner) | ✅ done |
| S1-5 | Issue #1 — .vscode/ → .github/ 경로 수정 | ✅ done |
| S1-6 | Issue #2 — Mode Selector 문서 수정 | ✅ done |
| S1-7 | Feature Registry + Session Handoff + Direction Guard | ✅ done |
| S1-8 | npm publish v0.1.0 | ✅ done |

## Module Registry

| Module | Layer | Status |
|--------|-------|--------|
| bin/cli.js | entry | ✅ stable |
| src/init.js | core | ✅ stable (6 IDE generators) |
| harness/ | templates | ✅ stable |

## Technical Decisions

- Node.js + 순수 JS, 의존성 0개
- harness/ 에 원본 템플릿, src/init.js에서 IDE별 변환
- npm public registry 배포

## Recent Changes

- 2026-04-02: feat: Antigravity 제너레이터 + SKILL.md 포맷 (7번째 IDE)
- 2026-04-02: feat: Augment 제너레이터에 skills 추가
- 2026-04-02: npm publish v0.3.0
- 2026-04-01: feat: Augment Code 제너레이터 추가 (6번째 IDE)
- 2026-04-01: npm publish v0.2.0
- 2026-04-01: npm publish v0.1.0

## Session Handoff Protocol

Before ending a chat session:
1. Update Quick Summary (3줄)
2. Update Story Status
3. Log Recent Changes
4. Note any blockers

New session reads: project-state.md → features.md → failure-patterns.md → project-brief.md
