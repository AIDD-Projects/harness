# BMAD vs gstack 비교 및 K-Harness 교훈

> K-Harness가 두 프레임워크에서 가져가야 할 것과 버려야 할 것

---

## 1. 핵심 비교표

| 차원 | BMAD | gstack | K-Harness 방향 |
|------|------|--------|---------------|
| **파일 수** | 200+ (매니페스트, 에이전트, 워크플로우, 태스크, 지식) | ~31 (skill당 SKILL.md 1개) | **최소화** — LLM이 읽는 파일 3개 이하 |
| **에이전트** | 11개 (Analyst, Architect, Dev, PM, SM, TEA...) | 0개 (skill이 역할 내장) | **2~3개** — 필요한 역할만 |
| **워크플로우** | 33개 (4단계 phase-gate) | 선형 파이프라인 (Think→Ship) | **단순 선형** — 단계 간 암묵적 연결 |
| **연결 방식** | CSV 매니페스트 → YAML → MD 간접 참조 | 출력물을 다음 skill이 직접 읽음 | **직접 참조** — 파일 간 indirection 금지 |
| **학습** | 세션 독립 (매번 새로 파악) | `/learn` 세션 간 누적 | **프로젝트 메모리** — 실패 패턴 자동 적용 |
| **안전장치** | 없음 (LLM 재량) | `/careful`, `/freeze`, `/guard` | **기본 내장** — 체크리스트 강제 |
| **IDE 지원** | 설정만 존재 (실동작 미검증) | Claude Code 최적화, Codex/Cursor 지원 | **VS Code Copilot 네이티브** |
| **팀 규모** | 대규모 팀 가정 (9개 역할) | 1인 최적화 | **1~3인 팀** |
| **프로젝트 관리** | 풍부 (Epic/Story/Sprint) | 없음 | **경량** — 현재 sprint 단일 파일 |

---

## 2. BMAD에서 가져갈 것

### ✅ Sprint/Story 추적 체계
BMAD의 `sprint-status.yaml` + `docs/bmad/stories/` 구조는 장기 프로젝트 관리에 효과적.
다만 86개 story 파일은 과도 → **현재 sprint의 story만 단일 파일로** 관리.

### ✅ Adversarial Review 개념
`check-implementation-readiness`, `review-adversarial-general` 같은 "의도적으로challenge하는" 워크플로우는 품질 향상에 기여.

### ✅ Phase-Gate의 핵심 아이디어
"요구사항이 확정되기 전에 구현하지 않는다"는 원칙은 유지.
다만 4단계 → **Plan → Build → Verify 3단계**로 축소.

---

## 3. gstack에서 가져갈 것

### ✅ 1 Skill = 1 File 원칙
LLM 컨텍스트 효율의 핵심. 매니페스트 기반 간접 참조 완전 배제.

### ✅ 파이프라인 자동 연결
각 단계의 출력이 다음 단계의 입력으로 명시적으로 연결되는 구조.

### ✅ /learn 학습 메커니즘
세션 간 학습 누적으로 반복 실패 자동 방지. MCPHub에서 4번 반복된 Mock 미갱신 문제가 대표 사례.

### ✅ 안전장치 (careful/freeze/guard)
파괴적 명령 경고 + 편집 범위 제한은 필수 기능.

### ✅ /review의 자동 수정 패턴
"명백한 건 auto-fix, 판단 필요한 건 [ASK]" — 이 패턴이 효과적.

---

## 4. 양쪽 모두에서 버릴 것

### ❌ BMAD: 역할 과잉
11개 에이전트는 1~3인 팀에 불필요. 에이전트 간 전환 자체가 컨텍스트 낭비.

### ❌ BMAD: 매니페스트 시스템
CSV/YAML 매니페스트로 파일을 추적하는 것은 LLM에게 부담만 줌.
파일 시스템 구조(convention) 자체가 레지스트리 역할.

### ❌ BMAD: 테스트 지식 30개 파일
일반적 지식은 프로젝트 특화 문제를 해결하지 못함.
대신 **실제 발생한 실패 패턴**을 3~5개 체크리스트로 관리.

### ❌ gstack: Claude Code 종속
K-Harness는 VS Code Copilot 기반이므로 Claude Code 전용 기능(hooked commands 등) 배제.

### ❌ gstack: 브라우저 자동화
Playwright 기반 `/browse`, `/qa`는 훌륭하지만 K-Harness 초기 범위 밖.

### ❌ gstack: 멀티 AI (codex 크로스 리뷰)
OpenAI Codex CLI 연동은 복잡도 대비 효과 불확실.

---

## 5. K-Harness가 해결해야 할 고유 문제

MCPHub 프로젝트 4개 Sprint 실행에서 발견된 문제들:

### 문제 1: "Mock 미갱신 반복" (4회 발생)
- **상황**: Repository 인터페이스 변경 시 테스트 Mock 갱신 누락
- **BMAD 대응**: testarch/knowledge에 일반적인 테스트 지식만 있고 프로젝트 특화 체크리스트 없음
- **gstack 대응**: `/learn`이 첫 실수를 기억 → 2번째부터 경고
- **K-Harness 해법**: `test-integrity` skill에 "인터페이스 변경 시 Mock 체크리스트" 내장

### 문제 2: "지침 무시/순서 이탈" (2회 발생)
- **상황**: "보고 후 승인 대기" 지침을 무시하고 일방적으로 머지
- **BMAD 대응**: 33개 워크플로우 속에서 LLM이 현재 단계를 추적 실패
- **gstack 대응**: 선형 파이프라인이라 순서가 명확
- **K-Harness 해법**: 현재 단계를 단일 파일에 명시 + 게이트 체크

### 문제 3: "프로젝트 상태 매번 재파악" (매 세션)
- **상황**: 새 대화마다 ServerType이 enum인지 union인지, 현재 어디까지 완료인지 처음부터 파악
- **BMAD 대응**: sprint-status.yaml이 있지만 코드 상태와 동기화 안 됨
- **gstack 대응**: `/learn`의 project-specific 학습
- **K-Harness 해법**: `project-state.md` 자동 갱신 파일

### 문제 4: "불필요 파일 커밋" (2회 발생)
- **상황**: LLM이 생성한 임시 스크립트, credentials가 커밋됨
- **BMAD 대응**: 없음
- **gstack 대응**: `/careful`이 일부 경고
- **K-Harness 해법**: `.gitignore` 강제 체크 + `guard` skill

---

## 6. K-Harness 설계 제약 조건

| 제약 | 근거 |
|------|------|
| LLM이 읽는 파일 ≤ 3개 | 컨텍스트 윈도우 효율 |
| 에이전트 ≤ 3개 | 1~3인 팀 적합 |
| 매니페스트 파일 0개 | 파일 시스템 convention이 레지스트리 |
| Sprint 관리 파일 1개 | 현재 sprint만 추적 |
| 실패 패턴 체크리스트 ≤ 10개 | 실전에서 검증된 것만 |
| VS Code Copilot 네이티브 | .instructions.md, .agent.md, SKILL.md 체계 |
