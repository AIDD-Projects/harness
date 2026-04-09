# Musher Framework Architecture

> v0.9.0 | Musher의 컴포넌트가 어떻게 연결되고, 데이터가 어떻게 흐르는지 정의한 문서.  
> 프레임워크 변경 시 이 문서를 먼저 확인하여 기존 연계가 깨지지 않는지 검증할 것.

---

## 1. 계층 구조

Musher는 5개 계층으로 구성된다. 아래 계층이 위 계층에 의존한다.

```
Layer 5: Agent Memory    — 에이전트별 학습, 세션 간 성장
Layer 4: Agents          — 복합 워크플로우, 스킬 조합 호출
Layer 3: Skills          — 절차적 워크플로우, 수동 호출
Layer 2: State Files     — 영속 상태, 세션 간 연결고리
Layer 1: Dispatcher      — 22줄 디스패처, 워크플로우 안내
```

| 계층 | 파일 | 활성화 | 역할 |
|------|------|--------|------|
| Dispatcher | core-rules.md (22줄) | 항상 (IDE가 로드) | 워크플로우 안내, state 파일 참조 |
| State Files | docs/project-brief.md, docs/features.md, docs/project-state.md, docs/dependency-map.md, docs/failure-patterns.md | 항상 (스킬/에이전트가 참조) | 세션 간 상태 유지 |
| Skills | 8개 스킬 (.md) | 수동 호출 | 단일 절차 실행 (규칙 임베딩됨) |
| Agents | 3개 에이전트 (.md) | 수동 호출 | 스킬 조합 + 판단 (규칙 임베딩됨) |
| Agent Memory | docs/agent-memory/{name}.md | learn 스킬이 갱신 | 에이전트별 학습 축적 |

---

## 2. 컴포넌트 연계 맵

### 2.1 에이전트 → 스킬 호출 관계

```
reviewer ──→ test-integrity
         ──→ security-checklist
         ──→ impact-analysis

planner  ──→ feature-breakdown
         ──→ impact-analysis

sprint-manager ──→ (직접 호출하는 스킬 없음, Next Step에서 다른 스킬/에이전트 추천)
```

### 2.2 스킬/에이전트 → State File 접근 매트릭스

R = 읽기, W = 쓰기, W* = 조건부 쓰기 (해당 상황 발생 시에만)

| 컴포넌트 | project-brief | features | project-state | dependency-map | failure-patterns |
|----------|:---:|:---:|:---:|:---:|:---:|
| **bootstrap** | W | W | W | W | — |
| **learn** | — | W | W | W* | W |
| **pivot** | W | W | W | W | W |
| **investigate** | — | — | R/W | R | R/W |
| **feature-breakdown** | R | W | W | R/W | R |
| **impact-analysis** | — | R/W | R/W* | R/W | R |
| **test-integrity** | — | — | W* | W* | R/W |
| **security-checklist** | — | — | W* | — | R/W |
| **reviewer** | R | R | R | R | R |
| **planner** | R | R/W | R/W | R | R |
| **sprint-manager** | R | R | R/W | R | R |

### 2.3 에이전트 → Agent Memory

| 에이전트 | 메모리 파일 | 읽기 시점 | 쓰기 시점 |
|----------|-----------|-----------|-----------|
| reviewer | docs/agent-memory/reviewer.md | 리뷰 시작 시 | learn 스킬이 갱신 |
| planner | docs/agent-memory/planner.md | 플래닝 시작 시 | learn 스킬이 갱신 |
| sprint-manager | docs/agent-memory/sprint-manager.md | 상태 확인 시 | learn 스킬이 갱신 |

---

## 3. 워크플로우 파이프라인

### 3.1 새 기능 개발

```
State 비어있음? ──Yes──→ bootstrap ──→ planner ──→ [코딩] ──→ reviewer ──→ sprint-manager ──→ learn
                  No ──────────────↗
                                   ↓ 내부 호출          ↓ 내부 호출
                            feature-breakdown      test-integrity
                            impact-analysis        security-checklist
                                                   impact-analysis
```

**데이터 흐름:**
1. `planner`가 docs/project-brief.md(방향), docs/features.md(기존 기능), docs/dependency-map.md(의존성) 읽기
2. `planner`가 `feature-breakdown` 호출 → docs/dependency-map.md, docs/features.md, docs/project-state.md 쓰기
3. 코딩 완료 후 `reviewer`가 docs/failure-patterns.md, docs/project-state.md, docs/dependency-map.md, docs/features.md 읽기
4. `reviewer`가 `test-integrity`, `security-checklist`, `impact-analysis` 호출
5. `learn`이 docs/project-state.md, docs/failure-patterns.md, docs/features.md, docs/agent-memory/*.md 쓰기

### 3.2 버그 수정

```
investigate ──→ [수정] ──→ test-integrity ──→ reviewer ──→ learn
```

**데이터 흐름:**
1. `investigate`가 docs/failure-patterns.md 읽기 (기존 패턴 매칭)
2. `investigate`가 docs/dependency-map.md 읽기 (blast radius 파악)
3. `investigate`가 docs/project-state.md 읽기 (Story scope 검증)
4. 수정 후 `test-integrity`가 docs/failure-patterns.md 읽기 (FP-001 이력 확인) + mock 동기화 확인
3. `reviewer`가 전체 검증
4. `learn`이 새 failure pattern 기록

### 3.3 세션 라이프사이클

```
[세션 시작] ──→ sprint-manager ("현재 상태?") ──→ [작업] ──→ learn ──→ [세션 종료]
```

**데이터 흐름:**
1. 세션 시작 시 디스패처가 `docs/project-state.md` 읽기 지시
2. `sprint-manager`가 docs/project-state.md 읽고 다음 작업 추천
3. 작업 수행
4. `learn`이 세션 결과를 state 파일 + agent memory에 기록

### 3.4 방향 전환

```
Direction Guard 경고 ──→ pivot ──→ [5개 state 파일 일괄 업데이트] ──→ 작업 재개
```

**트리거:** 디스패처가 세션 시작 시 docs/project-brief.md 읽기를 안내.
Non-Goal 충돌 또는 Decision Log 충돌 감지 시 `pivot` 스킬 실행 권고.

---

## 4. Direction Guard 흐름

모든 코딩 요청에 적용되는 게이트:

```
요청 수신
  │
  ├──→ docs/project-brief.md 읽기
  │
  ├── 비어있음? ──Yes──→ bootstrap 실행 먼저
  │
  ├── Non-Goal 충돌? ──Yes──→ "Non-Goals에 해당합니다" 경고 + pivot 제안
  │
  ├── Decision Log 충돌? ──Yes──→ "기존 결정과 충돌합니다" 경고 + pivot 제안
  │
  └── 정상 ──→ 작업 진행
```

---

## 5. 데이터 순환 흐름

Musher의 핵심 설계 원칙: **모든 작업의 결과가 state 파일로 돌아온다.**

```
bootstrap (초기화)
    ↓ 쓰기
State Files (채워짐)
    ↓ 읽기
planner / reviewer / sprint-manager (판단)
    ↓ 작업 수행
learn (결과 기록)
    ↓ 쓰기
State Files (갱신) ←── 다음 세션에서 다시 읽힘
    ↓ 쓰기
Agent Memory (학습 축적) ←── 다음 에이전트 호출 시 읽힘
```

> 상세 규칙(Iron Laws, Testing Rules 등)은 각 스킬/에이전트에 임베딩되어 있어, 해당 스킬 실행 시에만 로드됨.
> 디스패처(22줄)는 항상 로드되지만 워크플로우 안내와 state 파일 참조만 담당.

이 순환이 끊어지는 경우:
- `learn`을 실행하지 않고 세션 종료 → state 파일 미갱신 → 다음 세션이 오래된 정보로 시작
- `bootstrap`을 실행하지 않고 작업 시작 → state 파일 비어있음 → 에이전트의 판단 품질 저하
- 에이전트 사용 후 `learn` 미실행 → agent memory 미갱신 → 같은 실수 반복

---

## 6. 독립 스킬 vs 의존 스킬

| 스킬 | 독립 실행 가능 | 에이전트에서 호출됨 | State 읽기 | State 쓰기 |
|------|:---:|:---:|:---:|:---:|
| bootstrap | ✅ | — | — | ✅ (4개) |
| learn | ✅ | — | ✅ (5개 + memory) | ✅ (4개 + memory) |
| pivot | ✅ | — | ✅ (5개) | ✅ (5개) |
| investigate | ✅ | — | ✅ (3개: FP, dep-map, project-state) | ✅ (2개: FP, project-state) |
| feature-breakdown | ✅ | planner | ✅ (3개: brief, dep-map, FP) | ✅ (3개) |
| impact-analysis | ✅ | planner, reviewer | ✅ (4개: dep-map, FP, features, project-state) | ✅ 조건부 (dep-map, features, project-state) |
| test-integrity | ✅ | reviewer | ✅ (1개: FP) | ✅ 조건부 (FP, dep-map, project-state) |
| security-checklist | ✅ | reviewer | ✅ (1개: FP) | ✅ 조건부 (FP, project-state) |

**핵심 관찰:**
- `bootstrap`, `learn`, `pivot`은 **state 관리 스킬** — 직접 호출만 가능, 항상 state 쓰기
- `feature-breakdown`은 독립 + 에이전트 양쪽에서 사용, 항상 state 읽기/쓰기
- `impact-analysis`, `test-integrity`, `security-checklist`은 **분석 스킬** — FP 무조건 읽기 + 상황에 따라 조건부 쓰기
- `investigate`는 dep-map, project-state, FP를 읽고 FP/project-state는 쓰기

---

## 7. IDE 제너레이터 매핑

`init.js`가 위 컴포넌트를 각 IDE 포맷으로 변환:

| 컴포넌트 | VS Code | Claude Code | Cursor | Codex | Windsurf | Antigravity |
|----------|---------|-------------|--------|-------|----------|-------------|
| Dispatcher | .github/copilot-instructions.md (22줄) | .claude/rules/core.md | .cursor/rules/core.mdc | AGENTS.md (22줄 디스패처) | .windsurf/rules/core.md | .agent/rules/core.md |
| Skills | .github/skills/{id}/SKILL.md | .claude/skills/{id}/SKILL.md | .cursor/skills/{id}/SKILL.md | .agents/skills/{id}/SKILL.md | .windsurf/skills/{id}/SKILL.md | .agent/skills/{id}/SKILL.md |
| Agents | .github/agents/{id}.agent.md | .claude/skills/{id}/SKILL.md | .cursor/skills/{id}/SKILL.md | .agents/skills/{id}/SKILL.md | .windsurf/skills/{id}/SKILL.md | .agent/skills/{id}/SKILL.md |
| State Files | docs/*.md | docs/*.md | docs/*.md | docs/*.md | docs/*.md | docs/*.md |
| Agent Memory | docs/agent-memory/*.md | docs/agent-memory/*.md | docs/agent-memory/*.md | docs/agent-memory/*.md | docs/agent-memory/*.md | docs/agent-memory/*.md |

---

## 변경 시 체크리스트

이 아키텍처를 변경할 때 확인할 사항:

- [ ] 새 스킬 추가 시: 접근 매트릭스(2.2) 업데이트
- [ ] 새 에이전트 추가 시: 호출 관계(2.1) + 메모리 파일(2.3) + 매트릭스(2.2) 업데이트
- [ ] 새 state 파일 추가 시: 접근 매트릭스(2.2) + 크기 제한(core-rules.md) 업데이트
- [ ] 워크플로우 변경 시: 파이프라인(3.x) + 데이터 순환(5) 업데이트
- [ ] IDE 제너레이터 변경 시: 매핑 표(7) 업데이트
- [ ] Team Mode 관련 변경 시: TEAM_MODE 마커 블록(8) + resolveContent 로직 업데이트

---

## 8. Team Mode 아키텍처

### 8.1 `resolveContent()` 처리 파이프라인

```
                    ┌────── Solo ──────┐
Template ─→ resolveContent() ─┤                    ├─→ 최종 파일
                    └────── Team ──────┘

Solo: TEAM_MODE 블록 strip → 반환
Team: 경로 치환 → TEAM_MODE 마커 제거 → TEAM_MODE_SECTION 추가(core-rules만)
```

### 8.2 State File 분리 (Team Mode)

```
docs/ (shared, git tracked)          .harness/ (personal, gitignored)
├── project-brief.md                 ├── project-state.md
├── features.md                      ├── failure-patterns.md
├── dependency-map.md                └── agent-memory/
└── (nothing else)                       ├── reviewer.md
                                         ├── planner.md
                                         └── sprint-manager.md
```

### 8.3 접근 매트릭스 (Team Mode 변형)

Team Mode에서는 2.2의 경로가 변경됨:
- `project-state` → `.harness/project-state.md` (개인)
- `failure-patterns` → `.harness/failure-patterns.md` (개인)
- `agent-memory/*` → `.harness/agent-memory/*` (개인)
- `project-brief`, `features`, `dependency-map` → `docs/` 유지 (공유)

### 8.4 Team 전용 가이드 (TEAM_MODE 마커)

11개 스킬/에이전트에 `<!-- TEAM_MODE_START/END -->` 마커로 팀 협업 가이드가 포함됨.
Solo에서는 자동 제거되어 사용자에게 노출되지 않음.

핵심 가이드:
- **Pre-Pull**: 공유 파일 수정 전 `git pull`
- **Owner-Scoped**: 본인 Owner 행만 수정
- **Pivot Lock**: team lead만 main에서 pivot 실행
- **FP Promotion**: 개인 FP가 팀 영향 시 공유 승격
