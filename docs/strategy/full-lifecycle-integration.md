# K-Harness Full Lifecycle 통합 전략서

> **Version**: v3.0  
> **Last Updated**: 2026-04-07  
> **Status**: Gate 0 준비 중 (v0.9.0 Team Mode 완료)  
> **Author**: 정치훈 (SW아키텍처팀)

---

## 1. Executive Summary

K-Harness(Execution 하네스)와 kode:crew(Planning 포털)를 통합하여 KT 사내 소프트웨어 개발 전 생명주기(구상→설계→개발→배포)를 하나의 프레임워크로 지원한다.

**단, 통합 이전에 K-Harness 자체의 실사용 검증이 선행되어야 한다.**

검증되지 않은 프레임워크 위에 더 큰 것을 쌓는 것은 모래 위의 성이다.

---

## 2. 현재 위치 — 솔직한 평가

### 2.1 K-Harness (v0.9.0)

| 항목 | 상태 | 비고 |
|---|---|---|
| 코어 엔진 | ✅ 완성 | 8 스킬, 3 에이전트, 6 IDE, 93 테스트 |
| npm 배포 | ✅ 완료 | `npx k-harness init` |
| Team Mode | ✅ v0.9.0 | `--team` 플래그, `.harness/` 개인 분리, merge 충돌 방지 |
| 실사용 검증 | ❌ 미검증 | 단 한 번도 실제 개발 프로젝트에 적용하지 않음 |
| 팀 피드백 | ❌ 없음 | 만든 사람 외에 아무도 써보지 않음 |
| GPT-OSS-120B 테스트 | ❌ 미검증 | GPT-4o에서만 테스트. 사내 LLM에서 동작 확인 안 됨 |
| 문서/온보딩 | ⚠️ 부분 | 가이드 있으나 실제 온보딩 경험 없음 |

### 2.2 kode:crew (v0.9.x — MVP 87%)

| 항목 | 상태 | 비고 |
|---|---|---|
| 웹 포털 | ✅ 거의 완성 | Next.js + NestJS + LangGraph |
| Planning 워크플로우 | ✅ 동작 | Analyst → PM → ARB (3 에이전트, 5 워크플로우) |
| 실사용 검증 | ⚠️ 내부 | 개발팀 내부에서 테스트 중 |
| GPT-OSS-120B | ✅ 기본값 | 이미 사내 LLM으로 동작 |
| 인프라 운영 비용 | ❌ 높음 | AKS + PostgreSQL + Redis |

### 2.3 핵심 격차

K-Harness의 가장 큰 약점은 기술이 아니라 **"실증"**이다.
아무리 설계가 좋아도, 실제 프로젝트에서 개발자가 쓰고 "이거 도움 된다"고 말하기 전까지는 가설에 불과하다.

> **v0.9.0 기술 격차 해소**: Team Mode로 멀티 개발자 환경 지원. 이제 파일럿에 필요한 기술적 전제 조건을 갖춤.

---

## 3. 통합 아키텍처 — 최종 목표

```
┌─────────────────────────────────────────────────────────┐
│                  K-Harness v1.0                         │
│              "Full Lifecycle Harness"                   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │           Presentation Layer (선택)              │    │
│  │  ┌──────────────┐    ┌────────────────────┐     │    │
│  │  │   웹 포털     │    │   IDE (6종 지원)    │     │    │
│  │  │  (kode:crew)  │    │  VS Code, Claude,  │     │    │
│  │  │  PM/아키텍트용 │    │  Cursor, Codex...  │     │    │
│  │  └──────┬───────┘    └────────┬───────────┘     │    │
│  └─────────┼─────────────────────┼─────────────────┘    │
│            │                     │                       │
│  ┌─────────┴─────────────────────┴─────────────────┐    │
│  │              Core Engine                         │    │
│  │                                                   │    │
│  │  Planning Phase          Execution Phase          │    │
│  │  ┌──────────────┐      ┌──────────────────┐      │    │
│  │  │ analyze      │      │ bootstrap         │      │    │
│  │  │ architect    │      │ feature-breakdown  │      │    │
│  │  │ arb-review   │      │ impact-analysis    │      │    │
│  │  │              │      │ investigate        │      │    │
│  │  │ Agents:      │      │ security-checklist │      │    │
│  │  │  architect   │      │ test-integrity     │      │    │
│  │  │              │      │ learn, pivot       │      │    │
│  │  │              │      │                    │      │    │
│  │  │              │      │ Agents:            │      │    │
│  │  │              │      │  planner           │      │    │
│  │  │              │      │  reviewer          │      │    │
│  │  │              │      │  sprint-manager    │      │    │
│  │  └──────┬───────┘      └────────┬───────────┘      │    │
│  │         │                       │                   │    │
│  │  ┌──────┴───────────────────────┴───────────────┐   │    │
│  │  │         State Files (docs/)                   │   │    │
│  │  │  project-brief.md ← Planning이 채움           │   │    │
│  │  │  features.md      ← 양쪽이 사용               │   │    │
│  │  │  dependency-map.md ← architect가 초기 설계     │   │    │
│  │  │  project-state.md ← 전체 진행 추적             │   │    │
│  │  │  failure-patterns.md ← arb-review + 실행 학습  │   │    │
│  │  │  agent-memory/*.md ← 에이전트별 기억           │   │    │
│  │  └──────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐      │
│  │         KT Standard Library (확장 모듈)            │      │
│  │  • MSA/BFF/Event-Driven 아키텍처 템플릿           │      │
│  │  • KT ARB 체크리스트                               │      │
│  │  • GPT-OSS-120B 최적화 프롬프트                    │      │
│  │  • 사내 기술 스택 표준 (Spring Boot, React...)     │      │
│  └────────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────────┘
```

### 통합 워크플로우 파이프라인

```
  ┌─── Planning Phase ──────────────────────────────────────┐
  │                                                          │
  │  analyze ──→ architect ──→ arb-review ──→ [GATE]        │
  │  (요구사항)    (설계)        (검증)         │             │
  │                                          PASS?           │
  │                                        ╱      ╲          │
  │                                      Yes      No         │
  │                                       │    → architect    │
  └───────────────────────────────────────┼──────────────────┘
                                          │
  ┌─── Execution Phase ───────────────────┼─────────────────┐
  │                                       ↓                  │
  │  bootstrap ──→ planner ──→ [code] ──→ reviewer          │
  │  (초기설정)     (작업분해)   (개발)     (리뷰)            │
  │                                          │               │
  │                              sprint-manager ──→ learn    │
  │                              (상태관리)         (학습)    │
  └──────────────────────────────────────────────────────────┘
```

### State Files — 변경 없이 Planning 흡수

| State File | Planning이 쓰는 내용 | Execution이 쓰는 내용 |
|---|---|---|
| `project-brief.md` | analyze가 Vision/Goals/Non-Goals 채움, architect가 Key Technical Decisions 채움 | pivot이 방향 변경 반영 |
| `features.md` | analyze가 초기 기능 후보 등록 | feature-breakdown이 상세화, learn이 업데이트 |
| `dependency-map.md` | architect가 초기 모듈/레이어/의존성 설계 | feature-breakdown/impact-analysis가 업데이트 |
| `project-state.md` | arb-review가 Sprint 0 (ARB 결과) 기록 | sprint-manager/planner가 Sprint N 관리 |
| `failure-patterns.md` | arb-review가 아키텍처 리스크를 FP로 등록 | learn/test-integrity/security가 패턴 추가 |

새로운 state file을 추가하지 않는다. 기존 템플릿이 Planning 산출물을 이미 담을 수 있다.

> **v0.9.0 참고**: Team 모드에서 `project-state.md`, `failure-patterns.md`, `agent-memory/`는 `.harness/`(개인)로 분리됩니다. Planning Phase의 공유 산출물(`project-brief`, `features`, `dependency-map`)은 `docs/`에 그대로 유지.

---

## 4. 검증 전략 — Gate-Based Approach

모든 후속 단계는 앞 단계의 검증을 통과해야만 진행한다. 실패하면 멈추고 수정한다.

```
Gate 0        Gate 1         Gate 2          Gate 3         Gate 4
  │             │              │               │              │
  ▼             ▼              ▼               ▼              ▼
┌──────┐   ┌───────┐    ┌──────────┐    ┌──────────┐   ┌──────────┐
│ Self │──▶│ Pilot │──▶│ Planning │──▶│ Controlled│──▶│   GA     │
│ Test │   │ (1팀) │   │ Skills   │   │  Rollout  │   │ Release  │
│      │   │       │   │ 추가     │   │  (3~5팀)  │   │          │
└──────┘   └───────┘   └──────────┘   └──────────┘   └──────────┘
 1~2개월     2~3개월      1~2개월        2~3개월        1개월
```

### Gate 0: Self-Test (자가 검증) — 1~2개월

**목표**: K-Harness를 사용하여 K-Harness 자체를 개발한다 (dogfooding).

**구체적 활동**:
1. K-Harness 리포에 `npx k-harness init --ide vscode` 실행
2. `docs/project-brief.md`를 K-Harness 자체 비전으로 채움
3. 이후 모든 K-Harness 기능 개발을 K-Harness 워크플로우로 진행
   - planner → [code] → reviewer → sprint-manager → learn
4. GPT-OSS-120B 환경에서 동일 워크플로우 실행하여 비교

**측정 지표**:

| 지표 | 목표값 | 측정 방법 |
|---|---|---|
| 워크플로우 완주율 | ≥80% | planner→reviewer→learn 전체를 중단 없이 완료한 비율 |
| GPT-OSS-120B 성공률 | ≥70% | 스킬 지시를 LLM이 정확히 따른 비율 |
| 컨텍스트 오류율 | ≤10% | LLM이 state file을 잘못 읽거나 무시한 비율 |
| 개발 속도 변화 | 측정만 | K-Harness 유/무 비교 (기준선 확보) |
| 스킬 수정 횟수 | 기록 | 어떤 스킬이 가장 많이 수정되었나 (품질 지표) |

**Go/No-Go 기준**:
- **GO**: 워크플로우 완주율 ≥80% + GPT-OSS-120B 성공률 ≥70%
- **NO-GO**: 완주율 <60% → 스킬 재설계 후 재시도 (최대 2회)
- **PIVOT**: GPT-OSS-120B 성공률 <50% → 프롬프트 구조 근본 재설계

**핵심 가설**: "마크다운 스킬 파일을 LLM에게 주면, LLM이 절차를 따라 state file을 정확히 업데이트할 수 있다"

### Gate 1: Pilot (1팀 파일럿) — 2~3개월

**목표**: 나 이외의 개발자가 실제 프로젝트에서 K-Harness를 사용한다.

**파일럿 대상 선정 기준**:
- 신규 프로젝트 (기존 코드 없는 그린필드)
- 2~4명 소규모 팀
- 팀원이 LLM IDE 사용에 거부감 없음
- 기술 스택이 KT 표준과 호환 (Spring Boot / React)
- 3개월 이내 완료 가능한 규모

> **v0.9.0 활용**: 팀 파일럿에서 `npx k-harness init --team`으로 Team Mode 사용. 각 팀원의 State File 충돌 없이 협업 가능.

**파일럿 프로토콜**:
1. K-Harness 설치 + 30분 온보딩 세션
2. 팀이 자율적으로 사용 (강제하지 않음)
3. 주 1회 15분 피드백 수집 (구조화된 설문)
4. 팀이 "안 쓰겠다"고 하면 즉시 중단 (강제 금지)

**주간 피드백 설문** (5문항):

| # | 질문 | 응답 형태 |
|---|---|---|
| 1 | 이번 주 K-Harness를 몇 번 사용했나? | 숫자 |
| 2 | 가장 도움이 된 스킬/에이전트는? | 선택 |
| 3 | 가장 방해가 된 것은? | 서술 |
| 4 | K-Harness 없이 했으면 더 빨랐을 작업이 있었나? | Yes/No + 서술 |
| 5 | 계속 쓰고 싶은가? (1~5점) | 점수 |

**Go/No-Go 기준**:
- **GO**: 사용 의향 ≥3.5/5 + 포기율 ≤25%
- **NO-GO**: 포기율 >50% → 피드백 기반 근본 재설계
- **PARTIAL**: 특정 스킬만 유용 → 해당 스킬 중심으로 축소 재출시

**핵심 가설**: "다른 개발자도 K-Harness를 쓰면 개발 워크플로우가 개선된다"

### Gate 2: Planning Skills 추가 — 1~2개월

**Gate 1을 통과한 후에만 진행.**

**추가 스킬 난이도 분석**:

| 스킬 | 복잡도 | 위험 요소 | 완화 전략 |
|---|---|---|---|
| `analyze` | 높음 | 멀티턴 대화 필요 — 기존 스킬은 모두 싱글턴 | 구조화된 인터뷰 + 템플릿 채우기로 한정 |
| `architect` | 높음 | 창의적 합성 필요 — 체크리스트와 근본적으로 다름 | 설계 가이드로 포지셔닝 (대신 설계 아님) |
| `arb-review` | 중간 | 체크리스트형이므로 기존 패턴과 유사 | `security-checklist` 패턴 재활용 |

**`analyze` 설계 원칙**:
- "자유 생성"이 아닌 **"구조화된 인터뷰 + 템플릿 채우기"**
- 5W1H 질문 → 답변으로 `project-brief.md` 빈칸 채우기
- LLM의 창의성에 의존하지 않고, 사용자의 답변을 정리하는 역할에 한정

**`architect` 설계 원칙**:
- "설계를 대신 해주는 스킬"이 아닌 **"설계를 구조화하는 가이드"**
- 결정해야 할 항목 목록 제시 + 트레이드오프 분석
- 최종 결정은 인간이 직접 입력
- KT Standard Library에서 패턴별 템플릿 제공

**검증**: Gate 0과 동일한 dogfooding. K-Harness v0.7.0 개발에 Planning 스킬 적용하여 검증.

### Gate 3: Controlled Rollout (3~5팀 확대) — 2~3개월

**이 단계에서 답해야 할 질문**:
1. 브라운필드(기존 프로젝트)에서 `bootstrap` 스킬이 제대로 동작하는가?
2. 10명 규모에서 state file 충돌은 없는가? (동시 편집)
3. Planning → Execution 파이프라인이 end-to-end로 동작하는가?
4. KT Standard preset이 실제 프로젝트 요구사항을 충족하는가?

**Go/No-Go 기준**:
- **GO**: 3팀 이상에서 긍정적 피드백 + 측정 가능한 개선 효과
- **NO-GO**: 2팀 이상에서 "방해된다" 피드백 → 근본 재설계 또는 프로젝트 중단
- **SCALE-DOWN**: 특정 용도에서만 유용 → 범용 대신 특화 도구로 포지셔닝 변경

### Gate 4: GA Release (v1.0) — 1개월

**GA 선언 조건**:
- ≥3개 실제 프로젝트에서 full lifecycle 완주 실적
- 개발자 만족도 ≥4.0/5
- GPT-OSS-120B에서 안정 동작 확인
- 사내 Confluence 문서 + 온보딩 가이드 완성
- 1시간 이내 온보딩 가능

---

## 5. kode:crew와의 관계 — 현실적 시나리오

### 시나리오 A: 보완 관계 유지 (비용 최소)

```
kode:crew (웹) → Planning 산출물 export → docs/project-brief.md 형식
K-Harness (IDE) → project-brief.md를 입력으로 사용
```

- kode:crew 코드 변경: 최소 (export 기능 추가)
- 정치적 비용: 없음
- **적합한 경우**: kode:crew 팀과 별도로 움직여야 할 때

### 시나리오 B: K-Harness가 Planning 흡수

```
K-Harness에 analyze + architect + arb-review 추가
kode:crew의 역할이 자연소멸
```

- K-Harness 코드 변경: 큼
- 정치적 비용: 매우 높음
- **적합한 경우**: kode:crew MVP 오픈 후 사용율이 저조할 때

### 시나리오 C: State File 포맷 공유 (권장)

```
kode:crew = 비개발자(PM/아키텍트)를 위한 웹 도구
K-Harness = 개발자를 위한 IDE 하네스
양쪽이 동일한 state file 포맷을 공유
Git 리포가 단일 진실 소스(SSOT)
```

- **핵심**: project-brief.md, features.md 등의 포맷을 KT 사내 표준으로 합의
- 정치적 비용: 없음 (각자 영역 존중)
- **적합한 경우**: kode:crew 팀과 협업이 가능할 때

**권장: 시나리오 C 우선, B 대비.**
K-Harness 검증(Gate 0~1)이 선행되어야 어떤 시나리오든 논의 자격이 생김.

---

## 6. GPT-OSS-120B 검증 계획

### 6.1 검증 매트릭스

| 스킬 | GPT-4o 기대치 | GPT-OSS-120B 가설 | 검증 방법 |
|---|---|---|---|
| `bootstrap` | 95% | 85% | 동일 리포에서 양쪽 실행, 결과 비교 |
| `feature-breakdown` | 90% | 75% | 동일 기능 분해 지시, 분해 품질 비교 |
| `impact-analysis` | 90% | 70% | 동일 변경 사항의 영향 분석 비교 |
| `reviewer` | 85% | 65% | 동일 PR의 리뷰 품질 비교 |
| `investigate` | 85% | 60% | 동일 버그의 근본 원인 도달률 |
| `security-checklist` | 95% | 85% | 체크리스트 기반이라 비교적 안정적 |
| `analyze` (신규) | 80% | 55%? | 미검증 — Gate 2에서 확인 |
| `architect` (신규) | 75% | 45%? | 미검증 — 가장 위험한 스킬 |

### 6.2 실패 시 대응

| 단계 | 조건 | 대응 |
|---|---|---|
| Option 1 | 특정 스킬만 실패 | 프롬프트 경량화 (50줄 이하, Step-by-step 강제) |
| Option 2 | 분석/합성형 실패 | 하이브리드 모델 (체크리스트→120B, 분석→GPT-4o) |
| Option 3 | 전반적 실패 | 스킬 포기, core-rules.md(Direction Guard+Session Bootstrap)만 유지 |

---

## 7. 조직 변화 관리

### 채택 장벽 분석

| 장벽 | 대응 |
|---|---|
| "또 새로운 도구?" 피로 | 강제하지 않는다. 써본 사람이 추천하게 만든다 |
| 학습 비용 | 30분 온보딩 + 명확한 가이드. 그래도 안 되면 도구가 나쁜 것 |
| LLM 불신 | 강제가 아닌 보조 도구로 포지셔닝 |
| 기존 습관 | 비교 데이터로 설득. 데이터 없으면 설득 자격 없음 |

### 채택 전략: Push가 아닌 Pull

```
단계 1: 증거 만들기 (Gate 0~1)
  → 수치 + 구체적 사례

단계 2: 얼리 어답터 확보 (Gate 1~2)  
  → 파일럿 팀에서 자발적 전파

단계 3: 표준화 논의 (Gate 3 이후)
  → 충분한 실적이 쌓인 후에만 "표준" 논의
  → 표준은 선언하는 것이 아니라 인정받는 것

단계 4: 조직 표준 (GA 이후)
  → 사내 기술 위원회 발표
  → KT 개발 가이드라인에 포함
```

---

## 8. 로드맵

```
2026 H1 (상반기)
┌─────────────────────────────────────────────────────────┐
│ Gate 0: Self-Test (4월~5월)                             │
│  • K-Harness로 K-Harness 개발 (dogfooding)              │
│  • GPT-OSS-120B 기본 검증                               │
│  • 스킬 품질 안정화                                      │
│  • v0.7.0 release (안정화판)                            │
│                                                          │
│ Gate 1: 1팀 파일럿 시작 (6월~)                           │
│  • 파일럿 대상 선정 + 온보딩                              │
│  • 주간 피드백 수집 시작                                  │
└─────────────────────────────────────────────────────────┘

2026 H2 (하반기)
┌─────────────────────────────────────────────────────────┐
│ Gate 1 완료 (7~8월)                                      │
│  • 파일럿 결과 분석                                       │
│  • Go/No-Go 판정                                         │
│                                                          │
│ (GO인 경우)                                               │
│ Gate 2: Planning Skills 추가 (8~9월)                      │
│  • analyze, architect, arb-review 스킬 개발               │
│  • Self-test (dogfooding)                                 │
│  • v0.7.0 release                                         │
│                                                          │
│ Gate 3: 3~5팀 확대 파일럿 (10~12월)                       │
│  • Full lifecycle 검증                                    │
│  • KT Standard preset 개발 및 검증                        │
│  • kode:crew 연동(시나리오 C) 논의 시작                    │
└─────────────────────────────────────────────────────────┘

2027 Q1
┌─────────────────────────────────────────────────────────┐
│ Gate 4: GA Release (1~2월)                               │
│  • v1.0.0                                                │
│  • 사내 표준 발표                                         │
│  • Confluence + 온보딩 체계 완성                          │
└─────────────────────────────────────────────────────────┘
```

---

## 9. 리스크 매트릭스

| # | 리스크 | 확률 | 영향 | 대응 |
|---|---|---|---|---|
| R1 | GPT-OSS-120B에서 스킬이 안 돌아감 | 중 | 치명 | 프롬프트 경량화 → 하이브리드 모델 → 룰만 유지 |
| R2 | 파일럿 팀이 "안 쓰겠다"고 함 | 중 | 높음 | 피드백 분석 후 재설계. 2차 파일럿. 3회 실패 → 프로젝트 중단 |
| R3 | kode:crew 팀이 통합을 거부 | 중 | 중 | 시나리오 A로 후퇴. K-Harness가 강해지면 자연 해결 |
| R4 | Planning 스킬 품질 부족 | 높 | 중 | Execution만으로도 가치 있음. Planning은 보너스 |
| R5 | KT 조직 내 채택 거부 | 중 | 높 | Push 대신 Pull 전략. 실적으로 증명 |
| R6 | BMAD가 급성장하여 K-Harness 불필요 | 낮 | 높 | K-Harness 차별점(저성능 LLM, KT 표준, 경량)이 다른 시장 |

---

## 10. 성공의 정의

```
최소 성공 (Minimum Viable Success):
  K-Harness Execution (v0.5~0.6)이 1개 팀에서 3개월 이상 지속 사용

기본 성공:
  K-Harness Full Lifecycle이 3개 팀에서 사용
  + GPT-OSS-120B에서 안정 동작

완전 성공:
  KT 사내 개발 표준으로 채택
  + kode:crew와 연동 (state file 포맷 통일)
  + 10개 이상 프로젝트 적용 실적
```

---

## 11. 진행 로그

| 날짜 | Gate | 활동 | 결과 |
|---|---|---|---|
| 2026-04-05 | — | 전략서 v2 작성 | 完 |
| 2026-04-06 | — | v0.8.4 릴리즈: Codex/Windsurf 공식 스펙 정렬, Augment 삭제 (7→6 IDE) | 完 |
| 2026-04-07 | — | v0.9.0 릴리즈: Team Mode 구현 (`.harness/`, resolveContent, 93 테스트) | 完 |
| 2026-04-07 | — | 전략서 v3 업데이트: Team Mode 반영, Gate 1 파일럿 전제 조건 충족 | 完 |

---

## Appendix A: Planning Skills 상세 설계

*Gate 1 통과 후 상세화 예정. 현재는 개요만 기술.*

### analyze 스킬

- **목적**: 비즈니스 아이디어를 구조화된 요구사항으로 변환
- **방식**: 5W1H 구조화 인터뷰 → project-brief.md 템플릿 채우기
- **Writes**: project-brief.md, features.md

### architect 스킬

- **목적**: 요구사항을 기술 아키텍처 결정으로 변환
- **방식**: 결정 항목 제시 + 트레이드오프 분석 (설계를 대신하지 않음)
- **Writes**: project-brief.md (Key Technical Decisions), dependency-map.md, features.md

### arb-review 스킬

- **목적**: 아키텍처 결정을 KT 표준 대비 검증 (Gate)
- **방식**: 체크리스트 기반 (security-checklist 패턴 재활용)
- **Writes**: project-state.md (ARB 결과), failure-patterns.md (리스크 등록)
- **Output**: PASS / CONDITIONAL / FAIL

---

_이 문서는 K-Harness Full Lifecycle 통합 전략의 로드맵입니다. v0.9.0 Team Mode 완료로 Gate 1 (팀 파일럿)의 기술적 전제 조건을 갖추었습니다._
