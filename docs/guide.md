# K-Harness 사용자 가이드

> LLM이 프로젝트를 "이해"하고 "기억"하게 만드는 하네스 프레임워크

---

## 1. 빠른 시작

### 설치

```bash
npx k-harness init
```

IDE를 선택하면 프로젝트에 3가지 유형의 파일이 생성됩니다:

| 유형 | 역할 | 위치 (VS Code 기준) |
|------|------|---------------------|
| **규칙** (Rules) | LLM이 항상 따라야 할 프로젝트 규칙 | `.github/copilot-instructions.md`, `.vscode/instructions/` |
| **스킬** (Skills) | LLM이 호출할 수 있는 절차적 가이드 | `.github/skills/` |
| **상태 파일** (State Files) | 프로젝트 현황을 세션 간 유지하는 문서 | `docs/` |

### 설치 직후 해야 할 일

```
1. bootstrap 스킬 실행 → 상태 파일 자동 채우기
2. docs/project-brief.md 확인 → 비전/목표/비목표 검토
3. 개발 시작
```

---

## 2. 상태 파일 (docs/)

K-Harness의 핵심입니다. LLM이 세션 간에 프로젝트를 기억하는 유일한 방법입니다.

| 파일 | 역할 | 갱신 주기 |
|------|------|-----------|
| `docs/project-brief.md` | 프로젝트 비전, 목표, 비목표, 핵심 결정 | 방향 변경 시 |
| `docs/project-state.md` | 현재 스프린트, 스토리 상태, 최근 변경 | 매 세션 |
| `docs/features.md` | 기능 레지스트리 (기능→파일→테스트→상태) | 기능 추가/변경 시 |
| `docs/dependency-map.md` | 모듈 의존성 그래프 | 모듈 추가/변경 시 |
| `docs/failure-patterns.md` | 반복되는 실패 패턴 (FP-NNN) | 실패 발견 시 |
| `docs/agent-memory/*.md` | 에이전트별 학습 기록 | learn 스킬 실행 시 |

### 왜 docs/ 폴더인가?

- 프로젝트 루트 디렉토리를 깨끗하게 유지
- 프로젝트 문서와 상태를 한 곳에서 관리
- `.gitignore`에 포함하지 마세요 — 팀원 간 공유 필수

---

## 3. 스킬 가이드

### 의사결정 트리

```
프로젝트 시작 / 상태파일 비어있음?
  └─→ bootstrap

새 기능을 만들고 싶다
  └─→ planner → feature-breakdown → [구현] → reviewer → learn

버그를 고치고 싶다
  └─→ investigate → [수정] → test-integrity → reviewer → learn

코드를 커밋하기 전
  └─→ reviewer + security-checklist

세션을 끝내기 전
  └─→ learn

프로젝트 방향이 바뀌었다
  └─→ pivot

인터페이스를 수정했다
  └─→ impact-analysis → test-integrity
```

---

### bootstrap — 프로젝트 온보딩

**언제**: K-Harness 설치 직후, 또는 상태 파일이 비어있을 때

**하는 일**:
1. 프로젝트 구조 자동 스캔 (package.json, import 분석 등)
2. 사용자에게 5가지 질문 (프로젝트 목적, 목표, 비목표, 아키텍처, 컨벤션)
3. 모든 상태 파일 자동 채우기

**예시 프롬프트**:
```
bootstrap 실행해줘
```

---

### planner — 기능 계획

**언제**: 새 기능을 시작하기 전 (코딩 전에 반드시)

**하는 일**:
1. `docs/project-brief.md`로 방향 확인 (Direction Guard)
2. `docs/dependency-map.md`로 영향 범위 분석
3. 구현 계획 수립 + 스토리 생성
4. `docs/project-state.md`에 스토리 등록

**예시 프롬프트**:
```
사용자 인증 기능을 추가하고 싶어. planner 실행해줘
```

---

### feature-breakdown — 기능 분해

**언제**: planner가 계획을 세운 후, 3개 이상 모듈에 걸친 기능일 때

**하는 일**:
1. 영향받는 모듈 식별
2. 의존성 순서대로 Wave(구현 단계) 분할
3. 각 Wave별 태스크 목록 생성
4. `docs/dependency-map.md`, `docs/features.md`, `docs/project-state.md` 갱신

**예시 프롬프트**:
```
인증 기능을 구현 순서대로 나눠줘. feature-breakdown 실행
```

---

### reviewer — 코드 리뷰

**언제**: 커밋 직전 (필수)

**하는 일**:
1. 변경된 코드 문법/로직/보안 검토
2. 스코프 준수 확인 (현재 스토리 범위 내인지)
3. 테스트 mock 동기화 확인 (FP-001)
4. `docs/failure-patterns.md` 대조 — 과거 실수 반복 여부
5. 상태 파일 갱신 여부 확인

**예시 프롬프트**:
```
커밋 전에 reviewer 돌려줘
```

---

### sprint-manager — 스프린트 관리

**언제**: 새 세션 시작 시 "지금 어디까지 했지?" 확인할 때

**하는 일**:
1. `docs/project-state.md` 읽고 현재 상태 보고
2. 다음 할 일 제안
3. 스코프 드리프트 감지
4. 스토리 완료 처리

**예시 프롬프트**:
```
지금 어디까지 했지? sprint-manager 실행
```
```
S1-2 스토리 완료 처리해줘
```

---

### investigate — 버그 조사

**언제**: 원인 불명의 에러, 테스트 실패, 회귀 버그

**하는 일**:
1. **Phase 1**: 증거 수집 (에러 메시지, 스택 트레이스, git log) — 코드 수정 금지
2. **Phase 2**: 스코프 잠금 — 문제가 있는 모듈/디렉토리 한정
3. **Phase 3**: 가설 수립 + 최소 수정
4. **Phase 4**: 검증 + 회귀 테스트 추가

**예시 프롬프트**:
```
UserService.ts:45에서 TypeError 발생. investigate 실행
```

---

### impact-analysis — 영향 분석

**언제**: 모듈의 공개 인터페이스를 수정할 때, 공유 타입을 변경할 때

**하는 일**:
1. `docs/dependency-map.md`에서 대상 모듈 조회
2. "Depended By" 열로 영향 범위(blast radius) 파악
3. 의존 모듈별 필요 변경 목록 생성
4. 스코프 내 작업 가능 여부 확인

**예시 프롬프트**:
```
auth 모듈에 resetPassword() 메서드 추가하려는데, impact-analysis 먼저 실행
```

---

### test-integrity — 테스트 무결성

**언제**: 인터페이스 변경 후 mock이 동기화됐는지 확인할 때

**하는 일**:
1. 변경된 인터페이스 식별
2. 대응하는 mock 파일 찾기
3. 메서드 동기화 확인
4. 반환 타입 일치 확인
5. 기존 테스트 통과 확인

**예시 프롬프트**:
```
UserRepository 인터페이스 수정했으니 test-integrity 돌려줘
```

---

### security-checklist — 보안 점검

**언제**: 커밋 직전, 환경 설정 파일 변경 시, 인증/인가 코드 수정 시

**하는 일**:
1. 스테이징 영역에 .env, credentials, *.key 파일 없는지 확인
2. 하드코딩된 비밀번호/API 키/토큰 스캔
3. .gitignore 검증
4. 임시 파일 스테이징 여부 확인

**예시 프롬프트**:
```
커밋 전에 security-checklist 실행해줘
```

---

### pivot — 방향 전환

**언제**: 기술 스택 변경, 스코프 축소/확대, 아키텍처 변경, 목표 변경

**하는 일**:
1. 변경 사항 캡처 (한 문장으로)
2. 모든 상태 파일 영향 스캔
3. 변경 계획 사용자에게 제시 (확인 필수)
4. 확인 후 전체 상태 파일 일괄 갱신
5. `docs/project-brief.md`에 Decision Log 기록

**예시 프롬프트**:
```
REST API에서 GraphQL로 바꾸려고 해. pivot 실행
```

---

### learn — 세션 학습

**언제**: 세션 종료 직전 (매 세션 마지막에 필수)

**하는 일**:
1. 세션 활동 리뷰 (git log 기반)
2. 실패 패턴 감지 → `docs/failure-patterns.md` 갱신
3. `docs/project-state.md` Quick Summary 업데이트
4. `docs/features.md` 갱신 (해당 시)
5. `docs/agent-memory/` 에이전트 메모리 갱신 (해당 시)

**예시 프롬프트**:
```
오늘 작업 끝났어. learn 실행
```

---

## 4. 에이전트 가이드

에이전트는 특화된 역할을 수행하는 AI 전문가입니다.

| 에이전트 | 호출 방법 (VS Code) | 역할 |
|----------|---------------------|------|
| `@planner` | `@planner 사용자 인증 기능 추가` | 기능 계획 + 의존성 분석 |
| `@reviewer` | `@reviewer 커밋 전 검토` | 코드 리뷰 + 품질/보안/테스트 검증 |
| `@sprint-manager` | `@sprint-manager 현재 상태` | 스프린트 추적 + 다음 작업 안내 |

---

## 5. Iron Laws (철칙)

K-Harness가 LLM에게 강제하는 규칙입니다. 사용자도 알고 있어야 합니다:

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

## 6. 일반적인 작업 흐름

### 새 프로젝트 시작

```
1. npx k-harness init --ide vscode
2. bootstrap 실행
3. docs/project-brief.md 검토/수정
4. planner로 첫 기능 계획
5. 구현 → reviewer → learn
```

### 기존 프로젝트 합류

```
1. npx k-harness init --ide vscode
2. bootstrap 실행 (코드베이스 자동 스캔)
3. docs/ 폴더의 상태 파일들 검토
4. sprint-manager로 현재 상태 확인
```

### 일반 개발 세션

```
[시작] sprint-manager → "어디까지 했지?"
[작업] 코딩
[커밋 전] reviewer + security-checklist
[종료] learn → "오늘 뭘 했고, 다음에 뭘 해야 하는지"
```

---

## 7. 자주 묻는 질문

### Q: 상태 파일을 수동으로 편집해도 되나?
**A**: 네. 상태 파일은 일반 Markdown입니다. LLM과 사람 모두 읽고 쓸 수 있습니다. bootstrap 결과가 부정확하면 직접 수정하세요.

### Q: docs/dependency-map.md를 매번 업데이트하는 게 번거롭지 않나?
**A**: LLM이 자동으로 합니다. Iron Law #6에 의해 모듈을 추가/수정할 때 자동 갱신됩니다. reviewer가 누락을 감지하면 경고합니다.

### Q: 어떤 스킬을 먼저 써야 하는지 모르겠다
**A**: 3번 의사결정 트리를 참고하세요. 대부분의 경우:
- 새 기능 → `planner`
- 버그 → `investigate`
- 세션 끝 → `learn`

### Q: BMAD와 어떻게 다른가?
**A**: K-Harness는 LLM 컨텍스트 최소화에 집중합니다:
- BMAD: 200+ 파일, 34+ 워크플로우 → 강력하지만 저성능 LLM에서 컨텍스트 오버플로우 위험
- K-Harness: ≤15 파일, ≤300줄 규칙 → 저성능 LLM(GPT-OSS-120B, mi:dm 등)에서도 일관된 동작

### Q: 다른 IDE에서도 쓸 수 있나?
**A**: 네. 7개 IDE를 지원합니다:
```
npx k-harness init --ide <vscode|claude|cursor|codex|windsurf|augment|antigravity>
```

### Q: 팀에서 쓸 때 주의할 점은?
**A**: `docs/` 폴더를 Git에 반드시 커밋하세요. 상태 파일은 팀 전체가 공유해야 세션 간 지식이 유지됩니다.
