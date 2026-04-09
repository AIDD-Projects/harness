# Musher 설계 원칙

> LLM이 실수하지 않도록 만드는 프레임워크의 5가지 핵심 원칙

**GitHub 원본**: `docs/architecture/design-principles.md`  
**버전**: v0.6.3

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
- 전체 프레임워크 파일 수 ≤ 25개
- 단일 파일 크기 ≤ 300줄 (LLM이 한 번에 처리 가능한 범위)

### 측정 방법
```
작업별 컨텍스트 비용 = 읽어야 하는 파일 수 × 평균 파일 크기

목표: 모든 작업에서 컨텍스트 비용 < 600줄
```

### BMAD 대비 개선
| 작업 | BMAD 컨텍스트 비용 | Musher 목표 |
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

### BMAD의 testarch 지식 vs Musher 실패 패턴
| | BMAD testarch | Musher |
|--|--------------|-----------|
| 내용 | 일반적 테스트 이론 | 프로젝트 실제 실패 |
| 파일 수 | 30+ | 1 (docs/failure-patterns.md) |
| 효과 | 낮음 (MCPHub에서 같은 실수 4번 반복) | 높음 (구체적 체크리스트) |

> **Team Mode (v0.9.0)**: Team mode에서 `failure-patterns.md`는 `.harness/`로 이동하여 개인별로 관리됨. 팀원 각자의 LLM이 자기만의 실패 패턴을 축적하므로 서로의 패턴 파일이 충돌하지 않음.

---

## 원칙 4: IDE Native (IDE 네이티브)

### 규칙
- 각 IDE의 공식 커스터마이징 메커니즘만 사용 (6개 IDE 지원)
- 프레임워크 파일 = IDE가 인식하는 설정 파일
- 추가 CLI나 별도 인터프리터 불필요

### VS Code Copilot 커스터마이징 체계
```
.github/
  copilot-instructions.md    ← 42줄 디스패처 (모든 대화에 자동 적용)
  skills/                    ← SKILL.md 파일들 (온디맨드 절차)
    bootstrap/SKILL.md
    feature-breakdown/SKILL.md
    impact-analysis/SKILL.md
    investigate/SKILL.md
    learn/SKILL.md
    pivot/SKILL.md
    security-checklist/SKILL.md
    test-integrity/SKILL.md
    code-review-pr/SKILL.md
    deployment/SKILL.md
  agents/                    ← .agent.md 파일들
    planner.agent.md
    reviewer.agent.md
    sprint-manager.agent.md
    architect.agent.md
```

> 상세 규칙(Iron Laws, Testing Rules, Backend Rules 등)은 각 스킬/에이전트 안에 임베딩되어 있음.
> 디스패처는 워크플로우 안내와 state 파일 참조만 담당.

### 작동 방식
1. **copilot-instructions.md**: 매 대화에 자동 주입 (42줄 디스패처 — 워크플로우 안내 + state 파일 참조 + Iron Laws)
2. **.agent.md**: `@reviewer`처럼 멘션으로 호출하는 전문 에이전트 (규칙 임베딩됨)
3. **SKILL.md**: 도메인 지식 문서 (규칙 임베딩됨, 에이전트가 참조)

### 왜 네이티브여야 하는가
- BMAD는 `_bmad/` 폴더에 자체 체계를 구축했지만 VS Code Copilot은 이를 인식하지 못함
- LLM이 BMAD 파일을 찾아 읽는 것 자체가 추가 컨텍스트 비용
- VS Code 네이티브 파일은 **자동으로 컨텍스트에 주입**되므로 비용 0
- 상세 규칙은 스킬/에이전트 안에 임베딩하여, 해당 스킬 실행 시에만 로드 (토큰 절감)

---

## 원칙 5: Team Size Adaptation (팀 규모 적응)

### 규칙
- 1인 팀: copilot-instructions.md (디스패처) + skills 2~3개 = 충분
- 2~3인 팀: + agents 3개 + `docs/` 상태 파일 추가
- 4인+ 팀: 이 프레임워크 범위 밖. BMAD나 전용 PM 도구 권장.

### 1인 팀 최소 구성 (3개 파일)
```
.github/copilot-instructions.md
.github/skills/bootstrap/SKILL.md
.github/skills/test-integrity/SKILL.md
```

### 2~3인 팀 표준 구성 (~24개 파일)
```
.github/copilot-instructions.md
.github/skills/ (10개 스킬)
.github/agents/ (4개 에이전트)
docs/ (5개 상태 파일 + agent-memory 4개)
```

### v0.9.0 Team Mode — Solo/Team 분리

v0.9.0에서 `musher init --team`으로 팀 모드를 명시적으로 선택할 수 있게 됨:

| 모드 | 대상 | State 파일 위치 | 충돌 관리 |
|---|---|---|---|
| **Solo** (기본) | 1인 개발자 | 모두 `docs/` | 불필요 |
| **Team** | 2~3인 팀 | 공유 3개 `docs/` + 개인 2+α `.harness/` | `.harness/` gitignored, `.gitattributes` merge=union |

**핵심 메커니즘**:

- 공유 파일 (`docs/project-brief.md`, `features.md`, `dependency-map.md`): git committed, 팀 전체 공유
- 개인 파일 (`.harness/project-state.md`, `failure-patterns.md`, `agent-memory/`): gitignored, 충돌 원천 차단
- `resolveContent()`: init 시점에 스킬/에이전트 내 `docs/` 경로를 `.harness/`로 자동 치환

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
| 전체 공유 State | 모든 state 파일을 git commit | 다인 팀에서 merge 충돌 빈발 |
