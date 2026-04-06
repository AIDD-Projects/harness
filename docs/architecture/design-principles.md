# K-Harness 설계 원칙

> LLM이 실수하지 않도록 만드는 프레임워크의 5가지 핵심 원칙

---

## 원칙 1: 1 Skill = 1 File

### 규칙
- 하나의 기능(skill)은 반드시 하나의 .md 파일로 완결
- 파일 내에 역할, 입력, 출력, 절차, 체크리스트가 모두 포함
- 다른 파일을 참조하는 것은 허용하되, **이해에 필수적인 내용은 반드시 인라인**

### 근거
BMAD에서 LLM이 실패한 핵심 원인은 "이 에이전트 → 이 워크플로우 → 이 태스크 → 이 템플릿" 
4단계 간접 참조 체인. LLM은 3회 이상의 파일 간 점프에서 컨텍스트를 잃는다.

### 위반 예시
```
❌ sprint-manager.agent.md → "run workflow: track-sprint" 
    → track-sprint.md → "use template: sprint-status.yaml"
    → sprint-status.yaml → "see story: S4-5" 
    → S4-5.md
```

### 준수 예시
```
✅ sprint-manager.agent.md 안에:
    - 현재 Sprint 목표
    - 현재 Story 목록 (인라인)
    - 완료/미완료 상태
    - 다음 액션
```

---

## 원칙 2: Context Minimization (컨텍스트 최소화)

### 규칙
- LLM이 하나의 작업을 수행하기 위해 읽어야 하는 파일 수 ≤ 3개
- 전체 프레임워크 파일 수 ≤ 20개
- 단일 파일 크기 ≤ 300줄 (LLM이 한 번에 처리 가능한 범위)

### 측정 방법
```
작업별 컨텍스트 비용 = 읽어야 하는 파일 수 × 평균 파일 크기

목표: 모든 작업에서 컨텍스트 비용 < 600줄
```

### BMAD 대비 개선
| 작업 | BMAD 컨텍스트 비용 | K-Harness 목표 |
|------|-------------------|---------------|
| Story 구현 | ~6 파일, 1500줄 | 2 파일, 400줄 |
| 코드 리뷰 | ~4 파일, 800줄 | 1 파일, 200줄 |
| Sprint 상태 확인 | ~3 파일, 400줄 | 1 파일, 100줄 |
| 테스트 작성 | ~5 파일, 1200줄 | 2 파일, 350줄 |

---

## 원칙 3: Failure Pattern Learning (실패 패턴 학습)

### 규칙
- 프로젝트에서 발생한 실제 실수를 `docs/failure-patterns.md`에 축적
- 각 skill 파일의 **체크리스트 섹션**에 관련 실패 패턴을 자동 반영
- 실패 패턴은 일반적 지식이 아닌 **이 프로젝트에서 실제로 발생한 것만** 기록

### 실패 패턴 형식
```markdown
## FP-001: Repository 인터페이스 변경 시 Mock 누락
- 발생: Sprint 4 — S4-1, S4-2, S4-3, S4-4 (4회)
- 원인: 인터페이스에 메서드 추가 후 테스트의 jest.fn() Mock 미갱신
- 방지: 인터페이스 변경 후 `grep -r "create.*Mock\|jest.fn" tests/` 실행
- 적용 skill: test-integrity, code-review
```

### BMAD의 testarch 지식 vs K-Harness 실패 패턴
| | BMAD testarch | K-Harness |
|--|--------------|-----------|
| 내용 | 일반적 테스트 이론 | 프로젝트 실제 실패 |
| 파일 수 | 30+ | 1 (docs/failure-patterns.md) |
| 효과 | 낮음 (MCPHub에서 같은 실수 4번 반복) | 높음 (구체적 체크리스트) |

---

## 원칙 4: IDE Native (IDE 네이티브)

### 규칙
- VS Code Copilot의 공식 커스터마이징 메커니즘만 사용
- 프레임워크 파일 = VS Code가 인식하는 설정 파일
- 추가 CLI나 별도 인터프리터 불필요

### VS Code Copilot 커스터마이징 체계
```
.github/
  copilot-instructions.md    ← 전역 규칙 (모든 대화에 자동 적용)
  skills/                    ← SKILL.md 파일들 (온디맨드 절차)
    bootstrap/SKILL.md
    feature-breakdown/SKILL.md
    impact-analysis/SKILL.md
    ...
  agents/                    ← .agent.md 파일들
    planner.agent.md
    reviewer.agent.md
    sprint-manager.agent.md

.vscode/
  instructions/              ← .instructions.md 파일들
    backend.instructions.md      (applyTo: "src/**")
    testing.instructions.md      (applyTo: "**/*.test.*")
```

### 작동 방식
1. **copilot-instructions.md**: 매 대화에 자동 주입 (프로젝트 컨텍스트, 아키텍처 규칙)
2. **.instructions.md**: `applyTo` glob 패턴으로 파일 편집 시 조건부 주입
3. **.agent.md**: `@reviewer`처럼 멘션으로 호출하는 전문 에이전트
4. **SKILL.md**: 도메인 지식 문서 (에이전트가 참조)

### 왜 네이티브여야 하는가
- BMAD는 `_bmad/` 폴더에 자체 체계를 구축했지만 VS Code Copilot은 이를 인식하지 못함
- LLM이 BMAD 파일을 찾아 읽는 것 자체가 추가 컨텍스트 비용
- VS Code 네이티브 파일은 **자동으로 컨텍스트에 주입**되므로 비용 0

---

## 원칙 5: Team Size Adaptation (팀 규모 적응)

### 규칙
- 1인 팀: copilot-instructions.md + skills 2~3개 + instructions 2개 = 충분
- 2~3인 팀: + agents 2개 + docs/failure-patterns.md 추가
- 4인+ 팀: 이 프레임워크 범위 밖. BMAD나 전용 PM 도구 권장.

### 1인 팀 최소 구성 (5개 파일)
```
.github/copilot-instructions.md
.github/skills/bootstrap/SKILL.md
.github/skills/test-integrity/SKILL.md
.vscode/instructions/backend.instructions.md
.vscode/instructions/testing.instructions.md
```

### 2~3인 팀 표준 구성 (~27개 파일)
```
.github/copilot-instructions.md

.github/skills/
  bootstrap/SKILL.md
  feature-breakdown/SKILL.md
  impact-analysis/SKILL.md
  investigate/SKILL.md
  learn/SKILL.md
  pivot/SKILL.md
  security-checklist/SKILL.md
  test-integrity/SKILL.md

.github/agents/
  planner.agent.md
  reviewer.agent.md
  sprint-manager.agent.md

.vscode/instructions/
  backend.instructions.md
  testing.instructions.md

docs/
  project-brief.md
  project-state.md
  features.md
  dependency-map.md
  failure-patterns.md
  agent-memory/
    planner.md
    reviewer.md
    sprint-manager.md
```

---

## 원칙 간 우선순위

원칙이 충돌할 때의 해결 순서:

1. **Context Minimization** — 컨텍스트가 폭발하면 모든 것이 실패
2. **1 Skill = 1 File** — 간접 참조는 컨텍스트 비용을 증가시킴
3. **Failure Pattern Learning** — 같은 실수의 반복이 가장 큰 생산성 손실
4. **IDE Native** — 프레임워크 자체가 짐이 되면 안 됨
5. **Team Size Adaptation** — 확장성은 필요할 때 추가

---

## Anti-Patterns (하지 말아야 할 것)

| Anti-Pattern | 사례 | 결과 |
|-------------|------|------|
| 매니페스트 중독 | BMAD의 6개 CSV/YAML 매니페스트 | LLM이 추적 실패 |
| 역할 과잉 | 11개 에이전트를 1인 팀에서 사용 | 불필요한 전환 비용 |
| 일반적 지식 주입 | "TDD 원칙" 30페이지 | 프로젝트 특화 문제 해결 안 됨 |
| IDE 외부 체계 | 별도 CLI, 커스텀 파서 요구 | 도입 장벽 상승 |
| 미래 대비 설계 | "나중에 10인 팀이 되면..." | 현재 복잡도만 증가 |
