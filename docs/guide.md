# Musher 사용자 가이드

> 여러 개발자의 AI가 하나의 프로젝트 방향으로 정렬되게 만드는 프레임워크
> **v0.8.0** — 🧭 Navigation Dispatcher, 5개 파이프라인, Crew Artifact Integration
> **Confluence**: [사용자 가이드 — 시작하기](https://ktspace.atlassian.net/wiki/spaces/CNCORE/pages/709658498/kode+musher) | **Page ID**: `709658498`

다른 harness 프레임워크들(BMAD, gstack, GSD 등)은 **1인 개발자가 기획·분석·설계·개발을 혼자 하는 것**에 집중합니다. Musher는 다릅니다. **여러 명의 개발자가 각자의 AI 코딩 에이전트를 사용하면서도, 모든 AI 세션이 동일한 프로젝트 방향(Goals, Non-Goals, Decision Log)을 따르도록** 하는 것이 목표입니다.

---

## 1. 빠른 시작

```bash
npx musher init --ide vscode
```

설치하면 3종류의 파일이 생성됩니다:

| 유형 | 역할 | 위치 (VS Code) |
|------|------|----------------|
| **디스패처** (Dispatcher) | LLM이 매 요청마다 자동으로 읽는 42줄 안내 | `.github/copilot-instructions.md` |
| **스킬** (Skills) | 사용자가 필요할 때 호출하는 절차 가이드 | `.github/skills/` |
| **에이전트** (Agents) | 스킬 조합 + 판단을 하는 전문가 | `.github/agents/` |
| **상태 파일** (State) | 세션 간 프로젝트 맥락을 유지하는 문서 | `docs/` |

설치 직후:
```
"부트스트랩 실행해줘" → 상태 파일 자동 채우기 → 개발 시작
```

---

## 2. 핵심 개념: 디스패처 vs 스킬 vs 에이전트

Musher에는 3가지 부품이 있습니다. **이 구분을 이해하면 언제 뭘 써야 하는지 명확해집니다.**

### 디스패처 (Dispatcher) — 자동. 사용자가 신경 쓸 필요 없음

LLM이 **매 요청마다 알아서** 읽는 42줄 파일입니다. 호출하지 않아도 적용됩니다.

- `copilot-instructions.md` → 워크플로우 안내 (bootstrap → planner → code → reviewer → learn)
- 세션 시작 시 `docs/project-state.md` 읽기 지시
- state 파일 목록 참조

> 상세 규칙(Iron Laws, Testing Rules, Backend Rules 등)은 각 스킬/에이전트 안에 임베딩되어 있어, 해당 스킬 실행 시에만 로드됩니다.

**사용자 할 일**: 없음. `init`이 알아서 생성합니다.

### 스킬 (Skills) — 수동 호출. "이거 해줘"

**사용자가 직접 호출**해야 실행되는 절차적 가이드입니다. 각 스킬은 정해진 단계를 순서대로 수행합니다.

| 스킬 | 한 줄 요약 | 호출 예시 |
|------|-----------|----------|
| `bootstrap` | 처음 세팅 (상태+규칙 전부 채움) | "bootstrap 실행해줘" |
| `feature-breakdown` | 기능을 구현 순서로 분해 | "이 기능 구현 순서를 나눠줘" |
| `impact-analysis` | 인터페이스 변경 영향 분석 | "이 모듈 변경하면 뭐가 깨지나?" |
| `investigate` | 버그 체계적 추적 | "이 에러 원인 찾아줘" |
| `test-integrity` | mock 동기화 확인 | "인터페이스 바꿨으니 mock 확인해줘" |
| `security-checklist` | 커밋 전 보안 점검 | "보안 점검해줘" |
| `learn` | 세션 종료 시 학습 저장 | "오늘 작업 끝났어" |
| `pivot` | 프로젝트 방향 전환 | "REST에서 GraphQL로 바꾸려고 해" |
| `code-review-pr` | 외부 PR 리뷰 | "이 PR 리뷰해줘" |
| `deployment` | 배포/릴리스 전 검증 | "배포 준비 됐어?" |

### 에이전트 (Agents) — "전문가에게 맡기기"

에이전트는 **여러 스킬을 조합하여 복잡한 작업을 수행**하는 전문가입니다. 에이전트를 호출하면 내부에서 필요한 스킬들을 알아서 실행합니다.

| 에이전트 | 하는 일 | 내부적으로 호출하는 스킬 | 호출 방법 (VS Code) |
|----------|---------|----------------------|-------------------|
| `@planner` | 새 기능의 계획 수립 | feature-breakdown, impact-analysis | `@planner 인증 기능 추가하고 싶어` |
| `@reviewer` | 커밋 전 전수 검토 | test-integrity, security-checklist, impact-analysis | `@reviewer 커밋 전 검토해줘` |
| `@sprint-manager` | 현재 진행 상태 확인 | (없음 — 상태 파일만 읽음) | `@sprint-manager 지금 어디까지 했어?` |
| `@architect` | 설계 변경 검토 | impact-analysis, feature-breakdown | `@architect 이 구조 변경 괜찮을까?` |

> **핵심 구분**: 스킬은 **단일 절차**, 에이전트는 **스킬 조합 + 판단**입니다.
> 예: `@reviewer`를 호출하면 내부적으로 test-integrity → security-checklist → impact-analysis를 순서대로 돌리고, 결과를 종합하여 리뷰 판정을 내립니다.

---

## 3. 상황별 가이드: "지금 나는 뭘 하려는 건가?"

Musher는 5개 파이프라인을 제공합니다. 상황에 따라 적절한 파이프라인이 자동 선택됩니다:

| 파이프라인 | 상황 | 흐름 |
|---|---|---|
| 🟢 New Dev | 첨 기능 개발 | bootstrap → planner → sprint-manager → [코딩] → reviewer → learn |
| 🔵 Continue | 작업 재개 | sprint-manager → [코딩] → reviewer → learn |
| 🔴 Bug Fix | 디버깅 | investigate → [수정] → reviewer → learn |
| 🟡 Direction Change | 목표/기술 변경 | pivot → planner → sprint-manager → [코딩] → reviewer → learn |
| 🟣 Crew-Driven | kode:crew 산출물 | bootstrap(crew) → planner → sprint-manager → [코딩] → reviewer → learn |

> 🧭 **Navigation**: 각 단계 완료 시 AI가 "다음에 뭘 하세요" 블록을 자동으로 보여줍니다. 그대로 따라가면 됩니다.

### 🟢 프로젝트 처음 시작할 때

```
1. npx musher init --ide vscode
   → 프로젝트 언어를 자동 감지
2. "bootstrap 실행해줘"
   → 프로젝트 스캨 + 6가지 질문 → 상태 파일 자동 채우기
3. docs/project-brief.md 확인 — 비전/목표/비목표가 맞는지 검토
4. 개발 시작
```

### 🟢 기존 프로젝트에 합류할 때

```
1. npx musher init --ide vscode
2. "bootstrap 실행해줘" — 기존 코드를 스캨해서 상태 파일 채우기
3. docs/ 폴더의 상태 파일을 읽어보며 프로젝트 파악
4. "@sprint-manager 지금 어디까지 했어?" — 현재 상태 확인
```

### 🟢 새 기능을 만들고 싶을 때

```
1. "@planner 사용자 인증 기능을 추가하고 싶어"
   → planner가 프로젝트 방향 확인 → feature-breakdown 실행 → 구현 계획 수립
2. 계획에 따라 구현
3. "@reviewer 커밋 전 검토해줘"
4. 커밋
```

**planner가 하는 일을 구체적으로:**
- `docs/project-brief.md` 읽어서 이 기능이 목표에 부합하는지 확인 (Direction Guard)
- `docs/dependency-map.md` 읽어서 어떤 모듈이 영향받는지 분석
- feature-breakdown 스킬로 구현 순서(Wave) 생성
- `docs/project-state.md`에 새 스토리 등록

### 🟢 버그를 고칠 때

```
1. "UserService.ts:45에서 TypeError 발생했어. investigate 실행해줘"
   → 증거 수집 → 스코프 잠금 → 가설 → 검증
2. 수정
3. "인터페이스 바꿨으니 test-integrity 돌려줘" (인터페이스를 변경한 경우)
4. "@reviewer 커밋 전 검토해줘"
5. 커밋
```

### 🟢 커밋하기 전에

```
"@reviewer 커밋 전 검토해줘"
```

reviewer 에이전트가 알아서 합니다:
- 코드 품질/로직 검토
- test-integrity (mock 동기화 확인)
- security-checklist (보안 점검)
- failure-patterns.md 대조 (과거 실수 반복 여부)
- 상태 파일 갱신 여부 감사

### 🟢 세션을 끝낼 때

```
"오늘 작업 끝났어. learn 실행해줘"
```

learn 스킬이 합니다:
- `docs/project-state.md` Quick Summary 갱신 (다음 세션에서 어디부터 시작할지)
- 이번 세션에서 발견된 실패 패턴 기록
- 에이전트 메모리 갱신 (이번 세션의 학습 내용)

> ⚠️ **learn은 세션 끝에 딱 1번만 실행합니다.** 중간에 반복 호출하지 않습니다.

### 🟡 프로젝트 방향이 바뀌때

```
"REST API에서 GraphQL로 바꾸려고 해. pivot 실행해줘"
```

pivot 스킬이 합니다:
- 모든 상태 파일의 영향 분석
- 변경 계획을 보여주고 확인을 받음
- 확인 후 전체 상태 파일 일괄 갱신
- Decision Log에 기록

### 🟣 kode:crew 산출물로 시작할 때

kode:crew에서 나온 PRD, Architecture, ARB Checklist가 있다면:

```
1. npx musher init --ide vscode
2. crew 산출물을 docs/crew/ 또는 docs/PM/, docs/Analyst/, docs/ARB/ 에 배치
3. "crew 산출물을 기반으로 프로젝트를 세팅해줘"
   → bootstrap이 자동 감지 → Artifact Index + Validation Tracker 생성
4. "crew 산출물을 기반으로 첨 번째 기능을 계획해줘"
   → planner가 FR→Story 매핑
5. 🧭 네비게이션을 따라 진행
```

원본 crew 문서는 **절대 수정되지 않습니다**. 인덱스와 트래커만 생성됩니다.

### 🟢 모듈 인터페이스를 변경할 때

```
"auth 모듈에 resetPassword() 추가하려는데, 영향 분석 먼저 해줘"
```

impact-analysis 스킬이 합니다:
- dependency-map.md에서 의존 모듈 조회
- 영향 범위(blast radius) 파악
- 필요한 변경 목록 생성

### 🟢 새 세션을 시작할 때

```
"@sprint-manager 지금 어디까지 했어?"
```

sprint-manager가 합니다:
- `docs/project-state.md` 읽고 현재 상태 보고
- 다음 할 일 제안
- (만약 learn이 마지막 세션에서 실행됐다면 Quick Summary가 채워져 있으므로 바로 파악 가능)

---

## 4. 상태 파일 (docs/)

Musher의 핵심입니다. LLM이 세션 간에 프로젝트를 기억하는 유일한 방법입니다.

| 파일 | 역할 | 누가 갱신하나 |
|------|------|-------------|
| `docs/project-brief.md` | 프로젝트 비전, 목표, 비목표, 핵심 결정 | bootstrap, pivot |
| `docs/project-state.md` | 현재 스프린트, 스토리, Quick Summary | learn, sprint-manager, planner |
| `docs/features.md` | 기능 목록 (기능→파일→테스트→상태) | bootstrap, learn, planner |
| `docs/dependency-map.md` | 모듈 의존성 그래프 | bootstrap, feature-breakdown, impact-analysis |
| `docs/failure-patterns.md` | 반복 실패 패턴 (FP-NNN) | learn, test-integrity, security-checklist |
| `docs/agent-memory/*.md` | 에이전트별 학습 기록 | learn |

**직접 편집해도 됩니다.** 상태 파일은 일반 Markdown 파일입니다.
`docs/` 폴더를 Git에 반드시 커밋하세요 — 팀원 간 공유 필수.

---

## 5. Iron Laws (철칙)

LLM에게 강제되는 규칙입니다. 사용자가 직접 호출할 필요는 없지만 알고 있어야 합니다:

| # | 규칙 | 위반 시 |
|---|------|---------|
| 1 | **Mock Sync**: 인터페이스 변경 시 mock도 같은 커밋에서 업데이트 | 테스트 실패 |
| 2 | **Type Check**: 생성자 호출 전 소스 파일 확인 (메모리 의존 금지) | 타입 에러 |
| 3 | **Scope Compliance**: 현재 스토리 범위 밖 파일 수정 금지 | 스코프 드리프트 |
| 4 | **Security**: 코드에 인증정보 포함 금지 | 보안 사고 |
| 5 | **3-Failure Stop**: 같은 접근법 3번 실패 시 중단 보고 | 시간 낭비 |
| 6 | **Dependency Map**: 모듈 추가/수정 시 `docs/dependency-map.md` 갱신 | 의존성 추적 불가 |
| 7 | **Feature Registry**: 기능 추가 시 `docs/features.md` 등록 | 기능 망각 |
| 8 | **Session Handoff**: 세션 끝에 `docs/project-state.md` Quick Summary 갱신 | 다음 세션 맥락 상실 |

---

## 6. 한눈에 보는 전체 흐름

### 🟢 기본 흐름
```
프로젝트 시작
  │
  ▼
init ────────────────────────────── 언어 감지 + 파일 생성
  │
  ▼
bootstrap ───────────────────────── 상태 파일 + 규칙 파일 전부 채우기
  │
  ▼
┌─── 개발 루프 ──────────────────────────────────────────────┐
│                                                             │
│  @sprint-manager ──→ "다음 할 일 뭐야?"                     │
│         │                                                   │
│         ▼                                                   │
│  @planner ──→ 계획 수립 → **사용자 승인** (Confirm-First)   │
│         │                                                   │
│         ▼                                                   │
│     [구현] (Wave-Level Pacing: Wave별 자동 테스트)           │
│         │                                                   │
│         ▼                                                   │
│  @reviewer ──→ 전수 검토 (test-integrity, security)         │
│         │                                                   │
│         ▼                                                   │
│     [커밋] ──→ 🧭 "다음 Story 있나요?" or "세션 끝"         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
  │
  ▼
learn ───────────────────────────── 세션 학습 저장
```

### 🟣 Crew-Driven 흐름
```
crew 산출물 (PRD, Architecture, ARB)
  │
  ▼
bootstrap(crew) ─────────────────── Artifact Index + Validation Tracker 생성
  │
  ▼
@planner ────────────────────────── FR→Story 매핑, 구현 계획
  │
  ▼
[개발 루프] ─────────────────────── (위와 동일)
  │
  ▼
learn ───────────────────────────── Validation Tracker 업데이트
```

**예외 시나리오:**
- 버그 발생? → `investigate` 먼저 실행 후 수정
- 방향 변경? → `pivot` 실행
- 인터페이스 변경? → `impact-analysis` 먼저 실행
- PR 리뷰? → `code-review-pr` 실행
- 배포/릴리스? → `deployment` 실행
- 설계 변경? → `@architect` 먼저 실행

---

## 7. 자주 묻는 질문

### Q: planner 스킬과 @planner 에이전트의 차이는?
**A**: 동일합니다. `@planner`는 에이전트 모드로 호출하는 것이고, "planner 실행해줘"는 스킬로 호출하는 것입니다. 에이전트는 스킬보다 더 자율적으로 판단합니다 (예: feature-breakdown을 자동으로 호출할지 판단). 스킬은 정해진 절차만 따릅니다.

### Q: reviewer 없이 security-checklist만 돌려도 되나?
**A**: 네. 스킬은 독립적으로 실행 가능합니다. 다만 `@reviewer` 에이전트를 쓰면 security-checklist를 포함한 전체 검토를 한 번에 합니다.

### Q: 상태 파일을 수동으로 편집해도 되나?
**A**: 네. bootstrap 결과가 부정확하면 직접 수정하세요.

### Q: docs/dependency-map.md 매번 업데이트가 번거롭지 않나?
**A**: LLM이 자동으로 합니다. Iron Law #6에 의해 자동 갱신되고, reviewer가 누락을 감지합니다.

### Q: BMAD와 어떻게 다른가?
**A**: Musher는 LLM 컨텍스트 최소화에 집중합니다:
- BMAD: 200+ 파일, 34+ 워크플로우 → 강력하지만 저성능 LLM에서 컨텍스트 오버플로우 위험
- Musher: ~24 파일, 10 스킬 → 저성능 LLM(GPT-OSS-120B 등)에서도 안정 동작

### Q: Confirm-First Gate란?
**A**: planner/pivot 등이 계획을 세우면, **실행 전에 반드시 사용자 승인**을 받습니다. AI가 묻지도 않고 파일을 수정하는 일을 방지합니다. v0.8.0부터 모든 구조적 변경에 적용됩니다.

### Q: Wave-Level Pacing이란?
**A**: 기능을 여러 Wave(단계)로 나누어 구현할 때, **각 Wave 완료 시 자동으로 테스트를 실행**하고 결과를 확인합니다. 전체 구현이 끝나고 한꺼번에 테스트하는 대신, Wave별로 검증하여 문제를 조기에 발견합니다.

### Q: Recalculating Mode란?
**A**: 예상치 못한 상황(테스트 실패, 새로운 요구사항 등)이 발생하면, 현재 계획을 자동으로 재평가하고 조정합니다. 네비게이션의 "경로 재탐색"과 같은 개념입니다.

### Q: 🧭 Navigation Dispatcher란?
**A**: 각 스킬/에이전트 실행 완료 시, 다음에 무엇을 해야 하는지 `## 🧭 Navigation` 블록으로 자동 안내합니다. 사용자는 이 안내를 따라가기만 하면 됩니다. 처음 사용하는 개발자도 워크플로우를 자연스럽게 익힐 수 있습니다.

### Q: kode:crew 산출물 없이도 쓸 수 있나?
**A**: 네. 🟣 Crew-Driven 파이프라인은 crew 산출물이 있을 때만 활성화됩니다. 산출물 없이는 🟢 New Dev 파이프라인으로 시작하면 됩니다.

### Q: 다른 IDE에서도 쓸 수 있나?
**A**: 네. 6개 IDE를 지원합니다:
```
npx musher init --ide <vscode|claude|cursor|codex|windsurf|antigravity>
```

### Q: 팀에서 쓸 때 주의할 점은?
**A**: `docs/` 폴더를 Git에 반드시 커밋하세요. 상태 파일은 팀 전체가 공유해야 세션 간 지식이 유지됩니다.

### Q: 스킬을 전부 다 써야 하나?
**A**: 아닙니다. 최소한의 흐름은 이것만 기억하세요:
1. **시작**: `@sprint-manager` (어디까지 했지?)
2. **새 기능**: `@planner` (계획) → 구현 → `@reviewer` (검토) → 커밋
3. **종료**: `learn` (학습 저장)

나머지 스킬(investigate, impact-analysis, pivot 등)은 필요한 상황에서만 씁니다.

---

## 8. Team Mode

팀 단위로 Musher를 사용할 때는 `--team` 플래그로 초기화합니다:

```bash
npx musher init --ide vscode --team
```

### Solo vs Team 차이

| 항목 | Solo | Team |
|------|------|------|
| 상태 파일 위치 | 전부 `docs/` | 공유: `docs/`, 개인: `.harness/` |
| `.gitignore` | 변경 없음 | `.harness/` 자동 추가 |
| `.gitattributes` | 변경 없음 | 공유 파일에 `merge=union` 설정 |
| 파일 수 | 20개 | 22개 |

### 파일 분리 규칙

**공유 (docs/ — git 커밋):**
- `project-brief.md` — 프로젝트 비전 (전원 동일)
- `features.md` — 기능 레지스트리 (Owner 컬럼으로 구분)
- `dependency-map.md` — 모듈 의존성 (Owner 컬럼으로 구분)

**개인 (.harness/ — gitignored):**
- `project-state.md` — 내 스프린트/스토리 상태
- `failure-patterns.md` — 내가 겪은 실패 패턴
- `agent-memory/*.md` — 에이전트별 학습 기록

### Team Mode 6대 규칙

1. 공유 파일 수정 전 `git pull` 필수
2. 테이블 행에 Owner 컬럼 기입
3. 개인 파일은 `.harness/`에만 저장
4. `pivot` 실행 시 팀원에게 알림
5. 공유 파일 충돌 시 `merge=union` 전략 적용
6. 코드 리뷰에 `@reviewer` 에이전트 활용
