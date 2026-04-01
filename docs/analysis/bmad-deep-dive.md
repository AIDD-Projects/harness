# BMAD 프레임워크 상세 분석

> 분석 대상: MCPHub Official 프로젝트의 `_bmad/` 디렉토리
> BMAD 버전: v6.0.0-alpha.22 (2026-03-26 설치)
> 분석 범위: Sprint 1~4 실행 과정 전체

---

## 1. 시스템 구조

### 1-1. 디렉토리 레이아웃

```
_bmad/
├── _config/                          # 마스터 설정
│   ├── manifest.yaml                 # 설치 메타데이터 & 버전
│   ├── agent-manifest.csv            # 에이전트 정의 (11개)
│   ├── task-manifest.csv             # 태스크 레지스트리 (5개)
│   ├── tool-manifest.csv             # 도구 레지스트리 (비어있음)
│   ├── workflow-manifest.csv         # 워크플로우 레지스트리 (33개)
│   ├── files-manifest.csv            # 파일 추적 (70+ SHA256)
│   ├── agents/                       # 에이전트 커스터마이즈 (10개 yaml)
│   ├── custom/                       # 비어있음
│   └── ides/                         # IDE별 설정
│       └── claude-code.yaml
│
├── bmm/                              # BMM 모듈 (Breakthrough Method)
│   ├── config.yaml                   # 프로젝트 설정
│   ├── agents/                       # 9개 에이전트 정의 (.md)
│   ├── workflows/                    # 26개 워크플로우 (단계별 분류)
│   │   ├── 1-analysis/               # 분석 (2)
│   │   ├── 2-plan-workflows/         # 계획 (2)
│   │   ├── 3-solutioning/            # 설계 (3)
│   │   ├── 4-implementation/         # 구현 (7)
│   │   ├── bmad-quick-flow/          # 빠른 개발 (2)
│   │   ├── excalidraw-diagrams/      # 다이어그램 (4)
│   │   ├── testarch/                 # 테스트 (8)
│   │   └── ...                       # 문서화, 상태 등
│   ├── testarch/knowledge/           # 테스트 지식 파일 30+
│   ├── data/                         # 문서 표준, 템플릿
│   └── teams/                        # 팀 구성 파일
│
├── core/                             # 코어 모듈
│   ├── config.yaml
│   ├── agents/bmad-master.md         # 마스터 오케스트레이터
│   ├── tasks/                        # 5개 코어 태스크 (XML)
│   └── workflows/                    # 3개 (브레인스토밍, 파티모드, 엘리시테이션)
│
_bmad-output/
└── implementation-artifacts/         # 비어있음

docs/bmad/
├── epics/                            # 11개 에픽
├── stories/                          # 86개 스토리
├── guides/                           # 11개 가이드
├── sprint-status.yaml                # 스프린트 추적
└── architecture/                     # 아키텍처 문서
```

### 1-2. 수량 요약

| 카테고리 | 수량 | 비고 |
|----------|------|------|
| 에이전트 | 11 | 9 BMM + 1 Core + 확장 페르소나 |
| 워크플로우 | 33 | 11개 카테고리로 분류 |
| 태스크 | 5 | 코어 엔진 (XML 형식) |
| 지식 파일 | 30+ | 테스트 아키텍처 전문 |
| 에픽 | 11 | 다중 도메인 |
| 스토리 | 86 | Sprint 1~7 + 에픽별 |
| 관리 파일 | 70+ | SHA256 해시 추적 |
| 총 파일 수 | 200+ | 전체 BMAD 생태계 |

---

## 2. 에이전트 시스템

### 2-1. BMM 에이전트 (9개)

| 에이전트 | 이름 | 역할 | 핵심 책임 |
|----------|------|------|-----------|
| analyst | Mary | 비즈니스 분석가 | 시장 조사, 요구사항 도출, 경쟁 분석 |
| architect | Winston | 시스템 아키텍트 | 기술 설계, 분산 시스템, API 패턴 |
| dev | Amelia | 개발자 | 코드 구현, 스토리 실행, TDD |
| pm | John | 프로덕트 매니저 | PRD 작성, 사용자 인터뷰, 요구사항 발견 |
| quick-flow-solo-dev | Barry | 퀵 플로우 개발자 | 자율 풀스택 개발, 빠른 납품 |
| sm | Bob | 스크럼 마스터 | 스토리 준비, 스프린트 계획, 애자일 |
| tea | Murat | 테스트 아키텍트 | 테스트 전략, CI/CD, 품질 게이트 |
| tech-writer | Paige | 기술 작가 | 문서화, API 스펙, 지식 관리 |
| ux-designer | Sally | UX 디자이너 | 사용자 조사, UI/UX 설계 |

### 2-2. 코어 에이전트 (1개)

| 에이전트 | 이름 | 역할 | 핵심 책임 |
|----------|------|------|-----------|
| bmad-master | BMad Master | 마스터 오케스트레이터 | 워크플로우 조율, 지식 관리, 런타임 실행 |

### 2-3. 에이전트 호출 경로

```
manifest.yaml → agent-manifest.csv → _config/agents/*.customize.yaml → bmm/agents/*.md
```

LLM이 에이전트를 활성화하려면 **최소 4개 파일**을 순차 탐색해야 합니다.

---

## 3. 워크플로우 시스템

### 3-1. Phase-Gate 모델 (4단계)

```
Phase 1: Analysis      → Phase 2: Planning     → Phase 3: Solutioning  → Phase 4: Implementation
(create-product-brief)    (create-ux-design)      (create-architecture)    (sprint-planning)
(research)                (create-prd)            (create-epics-stories)   (create-story)
                                                  (check-readiness)        (dev-story)
                                                                           (code-review)
                                                                           (correct-course)
                                                                           (retrospective)
                                                                           (sprint-status)
```

### 3-2. 전체 워크플로우 목록 (33개)

| 카테고리 | 수 | 워크플로우 |
|----------|---|-----------|
| 분석 | 2 | create-product-brief, research |
| 계획 | 2 | create-ux-design, create-prd |
| 설계 | 3 | create-architecture, create-epics-and-stories, check-implementation-readiness |
| 구현 | 7 | sprint-planning, create-story, dev-story, code-review, correct-course, retrospective, sprint-status |
| 퀵플로우 | 2 | create-tech-spec, quick-dev |
| 다이어그램 | 4 | excalidraw 시리즈 4종 |
| 테스트 | 8 | testarch-atdd/automate/framework/ci/test-design/test-review/nfr/trace |
| 문서화 | 2 | document-project, generate-project-context |
| 상태 | 2 | workflow-status, workflow-init |
| 코어 | 3 | brainstorming, party-mode, advanced-elicitation |

---

## 4. 매니페스트 연결 구조

```
manifest.yaml ──── 어떤 모듈 로드 (core, bmm)
    │
    ├── agent-manifest.csv ──── 에이전트 이름 → 파일 경로
    ├── workflow-manifest.csv ── 워크플로우 이름 → 실행 파일
    ├── task-manifest.csv ────── 재사용 태스크 컴포넌트
    └── files-manifest.csv ───── 70+ 파일 무결성 추적 (SHA256)
```

**문제**: 이 간접 참조 구조는 **정적 도구 레지스트리**에는 적합하지만,
LLM이 런타임에 동적으로 탐색하기에는 과도한 indirection을 발생시킵니다.

---

## 5. 테스트 지식 베이스

`_bmad/bmm/testarch/knowledge/`에 30개+ 파일:

**커버리지**: 인증, API 테스트, 컴포넌트 TDD, 성능, 디버깅, CI 통합, 데이터 관리, 네트워크, 리스크 관리

**문제점**: MCPHub Sprint 4에서 "Mock 미갱신" 실패가 4번 반복되었으나, 이 지식 베이스에는 해당 패턴에 대한 명시적 체크리스트가 없었습니다. 지식이 일반적(generic)이고 프로젝트 특화(project-specific) 패턴이 누락됩니다.

---

## 6. 실전 사용 결과 (MCPHub Sprint 1~4)

### 6-1. 성공한 점
- Sprint 추적 체계 (epics → stories → sprint-status.yaml)
- Phase-gate로 요구사항 → 아키텍처 → 구현까지 문서화
- 코드 리뷰 워크플로우로 adversarial 검증

### 6-2. 실패한 점

| 반복 실패 | 횟수 | 원인 |
|-----------|------|------|
| Mock 미갱신 (Repository 인터페이스 변경 시 테스트 Mock 누락) | 4회 | 체크리스트 부재 |
| 지침 무시 (보고 후 승인 대기 없이 머지 진행) | 2회 | 워크플로우 복잡도로 LLM이 순서 추적 실패 |
| 타입 혼동 (ServerType union vs enum) | 3회 | 프로젝트 현재 상태를 매번 새로 파악해야 함 |
| 불필요 파일 커밋 (임시 스크립트, credentials) | 2회 | .gitignore 미비 + LLM 자동 생성 파일 미관리 |

### 6-3. 핵심 교훈

> **BMAD의 문제는 "너무 많다"는 것이다.**
> 33개 워크플로우, 11개 에이전트, 70+ 관리 파일의 매니페스트 시스템은
> 인간 팀 관리에는 체계적이지만, LLM 컨텍스트 윈도우 안에서 동작시키기엔 과부하다.
