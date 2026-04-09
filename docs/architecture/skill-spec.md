# Skill / Agent 작성 스펙

> v0.6.3 | Musher 파일의 구조, 규칙, 작성 가이드

---

## 1. SKILL.md 스펙

### 목적
특정 도메인 패턴에 대한 **실행 가능한 지식**을 단일 파일로 제공.
LLM이 이 파일 하나만 읽으면 해당 도메인 작업을 수행할 수 있어야 함.

### 필수 섹션

```markdown
# {Skill Name}

## 목적
이 skill이 해결하는 문제를 1~2문장으로.

## Invoked By (선택)
이 skill을 내부 호출하는 에이전트가 있으면 명시:
- {agent-name} (Step N)

## 적용 조건  
이 skill을 사용해야 하는 상황 (트리거):
- 조건 1
- 조건 2

## 절차
1. 첫 번째 단계
2. 두 번째 단계
3. ...

## 체크리스트
- [ ] 필수 확인 항목 1
- [ ] 필수 확인 항목 2
- [ ] (FP-001) 실패 패턴에서 온 항목

## 예시
### Good
(올바른 구현 코드 또는 패턴)

### Bad  
(흔한 실수 코드 또는 패턴)

## 관련 실패 패턴
- FP-001: {설명} → 체크리스트 항목 X에 반영됨
```

### 규칙
| 규칙 | 설명 |
|------|------|
| 자기 완결 | 다른 skill을 읽지 않아도 이해 가능 |
| ≤ 200줄 | 길어지면 분리 신호 |
| 구체적 코드 예시 | "좋은 예"와 "나쁜 예" 반드시 포함 |
| 체크리스트 필수 | LLM이 완료 전 확인할 항목 |
| 실패 패턴 연결 | docs/failure-patterns.md의 FP-NNN을 참조 |

---

## 2. Agent.md 스펙

### 목적
특정 역할을 수행하는 **전문 에이전트** 정의.
`@agent-name`으로 호출하면 이 파일이 컨텍스트에 주입됨.

### 필수 섹션

```markdown
---
name: {agent-name}
description: {한 줄 설명}
---

# {Agent Name}

## 역할
이 에이전트의 책임과 권한을 명확히 정의.

## 참조 Skills
- test-integrity.md
- hexagonal-arch.md

## 참조 파일
- docs/failure-patterns.md
- docs/project-state.md

## 절차

### 입력
사용자가 제공해야 하는 정보:
- ...

### 실행 단계
1. 단계 1: ...
2. 단계 2: ...

### 출력 형식
결과를 어떤 형태로 제공할지:
- ...

## 제약 사항
- 이 에이전트가 하지 않아야 할 것
- 권한 범위 밖의 작업
```

### Musher 표준 에이전트

#### `reviewer.agent.md`
```markdown
---
name: reviewer
description: 코드 변경사항을 리뷰하고 명확한 문제를 자동 수정합니다
---

# Reviewer

## 역할
- PR/diff 기반 코드 리뷰
- 명확한 문제 auto-fix, 판단 필요한 건 [ASK] 마킹
- docs/failure-patterns.md 체크리스트 강제 적용

## 참조 Skills
- test-integrity.md
- security-checklist.md
- impact-analysis.md

## 참조 파일
- docs/project-brief.md
- docs/features.md
- docs/failure-patterns.md
- docs/project-state.md
- docs/dependency-map.md
- docs/agent-memory/reviewer.md

## 절차

### 입력
- 변경된 파일 목록 또는 diff

### 실행 단계
1. 변경 파일 읽기 
2. docs/failure-patterns.md의 모든 FP-NNN 항목 대조
3. test-integrity 스킬 실행 (Mock Sync 검증)
4. security-checklist 스킬 실행 (보안 검증)
5. 각 skill의 체크리스트 대조
6. 기능 레지스트리 확인 — 새 기능이 docs/features.md에 등록되었는지
7. 의존성 맵 확인 — 새 모듈이 docs/dependency-map.md에 등록되었는지
8. State File Audit — 5개 state 파일 + agent-memory 갱신 여부 확인
9. 발견된 문제 분류:
   - 🔴 BLOCK: 머지 불가 — 반드시 수정
   - 🟡 ASK: 의도 확인 필요
   - 🟢 AUTO-FIX: 자동 수정 완료

### 출력 형식
파일별 리뷰 결과 + 요약 통계

## 제약 사항
- 기능 추가/리팩토링 제안 금지 (리뷰 범위만)
- auto-fix는 명백한 경우에만 (타입 불일치, import 누락 등)
```

#### `sprint-manager.agent.md`
```markdown
---
name: sprint-manager  
description: Sprint 진행 상황을 추적하고 다음 작업을 안내합니다
---

# Sprint Manager

## 역할
- 현재 Sprint 상태 보고
- Story 완료/미완료 추적
- 다음 우선순위 작업 제안

## 참조 Skills
- bootstrap, learn, pivot, investigate

## 참조 파일
- docs/project-state.md
- docs/project-brief.md
- docs/features.md
- docs/dependency-map.md
- docs/failure-patterns.md
- docs/agent-memory/sprint-manager.md

## 절차

### 입력
- 현재 작업 상태 질문 또는 상태 갱신 요청

### 실행 단계
0.5. docs/dependency-map.md 읽기 (모듈 현황 파악)
1. docs/project-state.md 읽기
2. 코드 상태와 docs/project-state.md 동기화 확인
3. Scope Check — 현재 작업이 Story 범위 내인지 확인 (FP-003)
4. 불일치 시 docs/project-state.md 갱신 제안
5. 다음 작업 우선순위 제시 + 적절한 스킬/에이전트 추천

### 출력 형식
Sprint 대시보드 형태:
- 🟢 완료: X개 story
- 🟡 진행 중: Y개 story  
- 🔴 미시작: Z개 story
- ➡️ 다음 추천: {story 이름}

## 제약 사항
- 코드 구현 직접 수행 금지
- Story 범위 결정 금지 (보고/제안만)
```

---

## 3. 규칙 임베딩 패턴

### 배경
v0.8.0 이전에는 `testing-rules.md`, `backend-rules.md` 등 path-scoped rules 파일이 별도로 존재했다.
항상 자동 주입되어 토큰을 소비하는 문제가 있어, **스킬/에이전트 내부에 규칙을 임베딩**하는 방식으로 전환했다.

### 원칙
- 규칙은 해당 스킬/에이전트가 호출될 때만 로드됨
- `core-rules.md`(42줄 디스패처)만 항상 로드
- Iron Laws, Testing Rules, Backend Rules 등은 관련 스킬/에이전트 `.md` 파일 하단에 직접 포함

### 임베딩 위치
| 규칙 | 임베딩된 파일 |
|------|-------------|
| Iron Laws | reviewer.agent.md |
| Testing Rules | reviewer.agent.md, test-integrity.md |
| Backend Rules | reviewer.agent.md |
| Completion Protocol | reviewer.agent.md, sprint-manager.agent.md |
| 3-Failure Stop | investigate.md |
| Scope Compliance | sprint-manager.agent.md |
| Direction Guard | planner.agent.md |
| Session Handoff | learn.md |

### 형식
스킬/에이전트 `.md` 파일의 마지막 섹션에 `## 임베딩된 규칙` 헤더 아래에 배치:

```markdown
## 임베딩된 규칙

### Iron Laws
1. Mock Sync: 인터페이스 변경 시 Mock 동시 갱신
2. Type Check: 생성자 호출 전 소스 파일 확인
3. ...

### Testing Rules  
- 테스트 대상 모듈만 import
- any 타입 사용 금지
- ...
```

---

## 3.5 Team Mode 마커 패턴

### 배경
v0.9.0에서 멀티 개발자(Team Mode) 시나리오를 지원하기 위해 도입.
Solo/Team 모드에 따라 가이드가 분기되어야 하지만, 템플릿 파일을 분리하면 유지보수 비용이 증가한다.
**하이브리드 마커 방식**(Track C)을 채택하여 하나의 템플릿에 두 모드를 공존시킨다.

### 동작 원리

```
<!-- TEAM_MODE_START -->
Team 전용 가이드 내용
<!-- TEAM_MODE_END -->
```

| 모드 | 동작 |
|------|------|
| Solo | 마커 + 내용 전체 제거 (regex strip) |
| Team | 마커만 제거, 내용 유지 |

### `resolveContent()` 처리 순서
1. **Solo**: `content.replace(/<!-- TEAM_MODE_START -->[\s\S]*?<!-- TEAM_MODE_END -->\n?/g, '')` → 즉시 반환
2. **Team**:
   - `docs/project-state.md` → `.harness/project-state.md` 경로 치환
   - `docs/failure-patterns.md` → `.harness/failure-patterns.md` 경로 치환
   - `docs/agent-memory/` → `.harness/agent-memory/` 경로 치환
   - `TEAM_MODE_START/END` 마커만 제거 (내용 유지)
   - core-rules에 `TEAM_MODE_SECTION` 자동 추가

### 마커 적용 파일 목록
| 파일 | Team 블록 핵심 내용 |
|------|-------------------|
| bootstrap.md | 신규 프로젝트 vs 합류 개발자 온보딩 |
| learn.md | Pre-Pull, Owner-Scoped Updates, FP Promotion |
| pivot.md | Pivot Lock, Branch Check, After Pivot 알림 |
| investigate.md | Owner Awareness, 모듈 소유자 협의 |
| feature-breakdown.md | Owner Assignment, 교차 의존성 |
| impact-analysis.md | Owner-Aware Blast Radius |
| security-checklist.md | .harness/ gitignore, 공유 설정 비밀 |
| test-integrity.md | Owner 통보, 공유 fixture 동기화 |
| code-review-pr.md | Team Reviewer 역할, Cross-Owner PR 검토 |
| deployment.md | Team 릴리스 체크리스트, Shared State 검증 |
| planner.md | Owner-Aware Planning, Agent Memory 분리 |
| reviewer.md | Owner-Scoped Audit, Cross-Owner 변경 감지 |
| sprint-manager.md | Personal vs Shared State, Scope Check with Ownership |
| architect.md | Cross-Module Design Review, Architecture Decision 공유 |

### 작성 규칙
- 마커는 파일 **마지막 섹션**에 배치
- 마커 내부에 `---` 헤더를 사용하여 구조화
- 마커 블록 포함 총 줄 수 ≤ 200줄 제한 유지
- Solo 사용자에게 불필요한 복잡도 노출 금지

---

## 4. docs/failure-patterns.md 스펙

### 위치
프로젝트 root (모든 파일에서 접근 용이)

### 형식

```markdown
# 실패 패턴 레지스트리

## FP-001: Repository 인터페이스 변경 시 Mock 누락
- **발생**: Sprint 4 — S4-1, S4-2, S4-3, S4-4
- **빈도**: 4회
- **원인**: 인터페이스에 메서드 추가 후 테스트 Mock 미갱신
- **방지**: `grep -r "create.*Mock|jest.fn" tests/` 실행하여 누락 확인
- **적용**: test-integrity skill 체크리스트, reviewer agent

## FP-002: ServerType을 enum으로 사용
- **발생**: Sprint 1 머지 후
- **빈도**: 17개 테스트 실패
- **원인**: ServerType은 union type인데 `ServerType.STREAMABLE_HTTP` 형태로 사용
- **방지**: `ServerType.` 패턴이 코드에 없는지 확인
- **적용**: backend instructions, reviewer agent
```

### 규칙
- 번호는 순차 증가 (FP-001, FP-002, ...)
- 일반적 이론 금지 — 이 프로젝트에서 실제로 발생한 것만
- 해결된 패턴도 삭제하지 않음 (회귀 방지)
- 10개 초과 시 빈도 낮은 항목 아카이브 검토

---

## 5. docs/project-state.md 스펙

### 위치
프로젝트 root

### 형식

```markdown
# 프로젝트 상태

## 현재 Sprint
- Sprint: 5 — Infrastructure/Performance
- 기간: 2025-01-20 ~ 2025-02-03
- 브랜치: feature/sprint-5-infra

## Story 상태
| ID | 제목 | 상태 | 담당 |
|----|------|------|------|
| S5-1 | Redis 캐싱 | 🟢 완료 | KSH |
| S5-2 | 로깅 구조화 | 🟡 진행 중 | KSH |
| S5-3 | 성능 테스트 | 🔴 미시작 | - |

## 기술적 결정
- ServerType: union type (not enum)
- ORM: TypeORM entityManager 패턴
- 인증: AES-256-GCM

## 최근 변경
- 2025-01-22: S5-1 Redis 캐싱 완료, 테스트 통과
```
