# Project Brief

## Vision

LLM 코딩 에이전트의 반복 실패를 방지하는 IDE-agnostic 개발 하네스. 프로젝트에 설치하면 LLM이 Iron Laws, Skills, Agents, Failure Patterns를 따르도록 구조화된 instruction 파일을 제공한다.

## Goals

- 6개 IDE(VS Code, Claude, Cursor, Codex, Windsurf, Gemini CLI) 지원 — `npx musher-engineering init`으로 원커맨드 설치
- 세션 간 컨텍스트 유지 — Session Handoff Protocol, New Session Bootstrap
- 기능 추적 — features.md로 LLM이 프로젝트 전체 기능을 파악
- 프로젝트별 맞춤 — project-brief.md로 방향성, failure-patterns.md로 실패 학습
- 실제 프로젝트에서 효과 검증 — 데이터 기반 개선

## Non-Goals

- UI 대시보드 — CLI만 제공
- 런타임 코드 생성 — 정적 instruction 파일만 설치
- 특정 IDE 깊은 통합 — IDE-agnostic 유지, 각 IDE의 기존 확장점만 활용
- AI 모델 호출 — LLM을 직접 호출하지 않음, LLM이 읽는 문서만 제공

## Target Users

LLM 코딩 에이전트(Copilot, Claude, Cursor 등)를 사용하는 개발자. 프로젝트 규모가 커지면서 LLM의 반복 실수, 컨텍스트 손실, 스코프 드리프트를 경험한 팀.

## Key Technical Decisions

- Node.js + 순수 JS (TypeScript 없음, 의존성 0개)
- npx 실행 — 글로벌 설치 불필요
- harness/ 디렉토리에 템플릿 원본, src/init.js에서 IDE별 변환
- npm public registry 배포 (v0.1.0~)
