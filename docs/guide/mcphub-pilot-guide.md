# K-Harness Pilot Guide — MCPHub Team

> **목적**: K-Harness를 MCPHub 프로젝트에 적용해보고, 실제 개발 경험에서 나온 피드백으로 프레임워크를 개선하기 위한 파일럿 가이드입니다.

---

## 1. K-Harness가 뭔가요?

LLM 코딩 에이전트(Copilot, Claude, Cursor 등)가 **반복적으로 실수하는 것을 방지**하는 프레임워크입니다.

핵심 컨셉 3가지:
- **Iron Laws**: LLM이 매 세션마다 반드시 지키는 규칙 (mock 동기화, 타입 체크, 스코프 준수 등)
- **Skills**: 특정 작업을 위한 단계별 절차 (디버깅, 코드리뷰, 보안점검, 의존성 분석 등)
- **Agents**: 역할 기반 페르소나 (reviewer, planner, sprint-manager)

**없으면 어떻게 되냐고?** → LLM이 mock 업데이트 안 하고, 인터페이스 변경 시 의존 모듈 놓치고, 같은 실수를 반복합니다.

---

## 2. 설치 (3분)

### Step 1: 프로젝트 디렉터리에서 실행

```bash
cd /path/to/mcphub-project

# VS Code 사용 시
npx k-harness init --ide vscode

# Claude Code 사용 시
npx k-harness init --ide claude

# Cursor 사용 시
npx k-harness init --ide cursor
```

### Step 2: 설치 확인

VS Code 기준으로 아래 파일들이 생성됩니다:

```
프로젝트/
├── .github/
│   ├── copilot-instructions.md         ← 전역 규칙 (매 세션 자동 적용)
│   ├── agents/
│   │   ├── reviewer.agent.md           ← 코드 리뷰어
│   │   ├── sprint-manager.agent.md     ← 스프린트 관리자
│   │   └── planner.agent.md            ← 기능 기획자
│   └── skills/
│       ├── test-integrity/SKILL.md     ← mock 동기화 검증
│       ├── security-checklist/SKILL.md ← 보안 점검
│       ├── investigate/SKILL.md        ← 체계적 디버깅
│       ├── impact-analysis/SKILL.md    ← 변경 영향 분석
│       └── feature-breakdown/SKILL.md  ← 기능 분해
├── .vscode/instructions/
│   ├── testing.instructions.md         ← 테스트 파일 편집 시 자동 적용
│   └── backend.instructions.md         ← src/ 파일 편집 시 자동 적용
├── project-state.md                    ← 스프린트/스토리 상태
├── failure-patterns.md                 ← 실패 패턴 기록
└── dependency-map.md                   ← 모듈 의존성 그래프
```

### Step 3: 프로젝트 맞춤 설정 (중요!)

설치 직후 반드시 해야 할 설정 3가지:

#### 3-1. `.github/copilot-instructions.md` 편집

```markdown
## Architecture
<!-- 여기에 MCPHub 아키텍처를 적어주세요 -->
TypeScript / Express / PostgreSQL
Hexagonal Architecture (Port + Adapter)

## Directory Structure
<!-- 여기에 실제 디렉터리 구조를 적어주세요 -->
src/
├── domain/           # Entities, Repository interfaces
├── application/      # Use Cases
├── infrastructure/   # DB, HTTP adapters
├── presentation/     # Controllers, DTOs
└── shared/           # Utils, types, errors

## Core Type Rules
<!-- LLM이 자주 틀리는 타입 결정을 적어주세요 -->
- `ServerType` is a union type ("stdio" | "sse"), NOT an enum.
- `ServerStatus` is a union type ("running" | "stopped" | "error"), NOT an enum.
```

#### 3-2. `project-state.md` 편집

```markdown
## Current Sprint
- Sprint: 1 — MCPHub Core
- Started: 2026-04-01
- Branch: main

## Story Status
| ID | Title | Status | Assignee |
|----|-------|--------|----------|
| S1-1 | MCP Server CRUD | 🔄 진행중 | |
| S1-2 | Health Check System | ⬜ todo | |
```

#### 3-3. `dependency-map.md` 편집

```markdown
## Module Registry
| Module | Layer | Purpose | Depends On | Depended By |
|--------|-------|---------|------------|-------------|
| McpServer | domain | Server entity | — | ServerService, API |
| ServerService | application | Server CRUD use cases | McpServer, ServerRepo | API, Admin |
| ServerRepo | infrastructure | DB adapter | McpServer | ServerService |
| API | presentation | REST endpoints | ServerService | — |
```

---

## 3. 실제 사용법

### 일상 개발 — 그냥 코딩하면 됩니다

설정 후에는 별도 명령이 필요 없습니다. Copilot이 자동으로:
- **src/ 파일 편집 시** → backend rules 적용 (아키텍처 위반 방지)
- **테스트 파일 편집 시** → testing rules 적용 (mock 동기화 강제)
- **모든 대화** → Iron Laws 준수 (FP-001 ~ FP-004 자동 체크)

### 에이전트 활용 — 모드 선택기

VS Code Copilot Chat에서 커스텀 에이전트는 **모드(Mode)**로 동작합니다.
`@planner`처럼 `@`로 호출하는 것이 아니라, 채팅 하단의 **모드 선택기**에서 전환합니다.

#### VS Code 사용법
1. 채팅 하단의 모드 선택기 클릭 (기본값: "Agent")
2. 드롭다운에서 `planner` / `reviewer` / `sprint-manager` 선택
3. 평소처럼 대화하면 해당 에이전트 페르소나로 동작

```
[planner 모드 선택] → "사용자 인증 기능을 추가하고 싶어"
→ dependency-map을 읽고, 영향 분석하고, 구현 순서를 잡아줍니다.

[reviewer 모드 선택] → "커밋 전에 변경사항 리뷰해줘"
→ 아키텍처, 테스트, 보안, dependency-map 업데이트 여부를 검증합니다.

[sprint-manager 모드 선택] → "현재 상태 알려줘"
→ 현재 스프린트, 진행 중인 스토리, 다음 할 일을 안내합니다.
```

#### Claude Code 사용법
에이전트가 CLAUDE.md에 병합되어 있으므로 자연어로 요청:
```
"planner 모드로 기능 분석해줘"
"reviewer 역할로 코드 리뷰해줘"
```

#### Cursor 사용법
`.cursor/rules/planner.mdc` 등이 자동 적용되며, 필요 시 자연어로 요청합니다.

### 실패 패턴 기록 — 핵심 습관

LLM이 같은 실수를 반복하면 `failure-patterns.md`에 기록하세요:

```markdown
## FP-005: Express middleware 순서 오류 (2026-04-01)
- **증상**: 인증 미들웨어가 라우터 뒤에 등록되어 401 에러
- **근본 원인**: app.use(authMiddleware) 위치를 router 뒤에 배치
- **해결**: authMiddleware를 router 등록 전에 배치
- **방지 규칙**: Express 미들웨어는 반드시 라우터 전에 등록
```

→ 다음부터 Copilot이 이 패턴을 참조해서 같은 실수를 안 합니다.

---

## 4. Dependency-Aware 워크플로우 (핵심 차별점)

K-Harness의 핵심은 **프로젝트가 커져도 기능 간 연관관계를 추적**하는 것입니다.

### 새 기능 개발 시 흐름

```
1. planner 모드에서 기능 설명
   ↓
2. planner가 dependency-map.md 읽고 영향 분석
   ↓
3. feature-breakdown으로 구현 순서 생성 (Wave 1 → 2 → 3)
   ↓
4. 각 Wave별로 구현 (의존성 순서대로)
   ↓
5. reviewer 모드로 전환하여 리뷰 (dependency-map 업데이트 확인 포함)
   ↓
6. dependency-map.md 업데이트 → 다음 기능에서 더 정확한 분석
```

### 예시: "SSE 연결 관리 기능 추가"

```
[planner 모드 선택]
나: SSE 연결 관리 기능을 추가하고 싶어. 클라이언트가 서버에 SSE로 연결하면
    연결 상태를 추적하고, 끊어지면 재연결하는 기능이야.

planner:
  ## Feature: SSE 연결 관리
  **Risk**: Medium (3개 모듈 영향)

  ### Wave 1: Domain
  - [ ] SseConnection entity 생성
  - [ ] ConnectionRepository interface

  ### Wave 2: Application
  - [ ] ConnectionManager use case (depends: Wave 1)

  ### Wave 3: Infrastructure + Presentation
  - [ ] SseConnectionAdapter (depends: Wave 2)
  - [ ] /connections API endpoint (depends: Wave 2)

  ### Dependency Map 변경
  - NEW: SseConnection (domain)
  - NEW: ConnectionManager (application) → depends on SseConnection
  - MODIFY: API (presentation) → add dependency on ConnectionManager
```

---

## 5. 피드백 요청 사항

2주간 사용 후 아래 항목별로 피드백 부탁드립니다.

### 5-1. 설치/설정 경험

| 항목 | 평가 | 코멘트 |
|------|------|--------|
| 설치 과정 (`npx k-harness init`) | ⭐⭐⭐⭐⭐ | |
| 초기 설정 (architecture, directory, types) | | |
| 파일 구조 이해도 | | |
| README/문서 충분한지 | | |

### 5-2. 규칙 유용성

| 규칙 | 도움됐나? | 불필요/과도한 부분 | 빠진 규칙 |
|------|----------|-----------------|----------|
| Iron Law 1: Mock Sync | | | |
| Iron Law 2: Type Check | | | |
| Iron Law 3: Scope Compliance | | | |
| Iron Law 4: Security | | | |
| Iron Law 5: 3-Failure Stop | | | |
| Iron Law 6: Dependency Map | | | |
| Testing Rules | | | |
| Backend Rules | | | |

### 5-3. 스킬 유용성

| 스킬 | 사용 횟수 | 도움됐나? | 개선 제안 |
|------|----------|----------|----------|
| test-integrity | | | |
| security-checklist | | | |
| investigate | | | |
| impact-analysis | | | |
| feature-breakdown | | | |

### 5-4. 에이전트 유용성

| 에이전트 | 사용 횟수 | 도움됐나? | 개선 제안 |
|---------|----------|----------|----------|
| @planner | | | |
| @reviewer | | | |
| @sprint-manager | | | |

### 5-5. Dependency-Aware 워크플로우

- dependency-map.md를 실제로 유지보수했나요?
- planner의 영향 분석이 정확했나요?
- 프로젝트 규모에 비해 과도하거나 부족했나요?
- 개선 제안:

### 5-6. 자유 피드백

**가장 도움된 점:**

**가장 불편했던 점:**

**빠져 있다고 느낀 기능:**

**삭제해도 될 것 같은 기능:**

---

## 6. 피드백 제출 방법

1. 이 파일을 복사해서 피드백 항목을 채워주세요
2. GitHub Issue로 제출: https://github.com/OG056501-Opensource-Poc/k-harness/issues
3. 또는 직접 전달

### 피드백 라벨

- `feedback/install` — 설치/설정 관련
- `feedback/rules` — 규칙 관련 (Iron Laws, Testing, Backend)
- `feedback/skill` — 스킬 관련
- `feedback/agent` — 에이전트 관련
- `feedback/dependency` — 의존성 관리 관련
- `feedback/missing` — 빠진 기능
- `feedback/remove` — 불필요한 기능

---

## 7. 자주 묻는 질문

### Q: 기존 프로젝트 설정과 충돌이 나면?

`npx k-harness init`은 기존 파일을 **덮어쓰지 않습니다** (기본값). 충돌 시 `⏭ Skipped (exists)` 메시지가 표시됩니다. 강제 덮어쓰기는 `--overwrite` 옵션을 사용하세요.

### Q: 특정 규칙이 우리 프로젝트에 안 맞으면?

생성된 파일을 직접 편집하면 됩니다. K-Harness 파일은 설치 후 프로젝트 소유이므로, 자유롭게 수정/삭제하세요. 그리고 **왜 안 맞았는지 피드백**해 주시면 프레임워크를 개선합니다.

### Q: dependency-map.md를 매번 업데이트하는 게 번거롭지 않나?

Iron Law #6이 있으므로 Copilot이 모듈 추가/수정 시 자동으로 dependency-map 업데이트를 제안합니다. 또한 reviewer 모드로 전환하면 commit 전에 업데이트 누락을 감지합니다.

### Q: VS Code에서 에이전트를 어떻게 호출하나요?

VS Code에서 커스텀 에이전트는 `@planner`처럼 `@`로 호출하는 것이 아니라, 채팅 하단의 **모드 선택기**에서 전환합니다. `@`로 호출되는 것은 `@github`, `@terminal` 등 빌트인 참가자만 해당됩니다.

### Q: Claude Code이나 Cursor에서는 에이전트 호출이 다른가?

- **Claude Code**: 에이전트가 CLAUDE.md에 병합되므로, "planner 모드로 기능 분석해줘"처럼 자연어로 요청하세요.
- **Cursor**: `.cursor/rules/planner.mdc`가 생성되며, 필요 시 자동 적용됩니다.

### Q: npm에 퍼블리시되어 있나?

아직 npm 퍼블리시는 안 되어 있습니다. GitHub에서 직접 실행하세요:
```bash
npx github:OG056501-Opensource-Poc/k-harness init --ide vscode
```

---

## 8. 타임라인

| 기간 | 활동 |
|------|------|
| **Week 1** | 설치 + 초기 설정 + 일상 개발에 적용 |
| **Week 2** | 의존성 워크플로우 시도 (@planner, impact-analysis) |
| **Week 3** | 피드백 정리 + 제출 |
| **Week 4** | K-Harness 팀이 피드백 반영 → v0.2.0 릴리즈 |

---

*K-Harness v0.1.0 — "LLM이 같은 실수를 두 번 하지 않게"*
