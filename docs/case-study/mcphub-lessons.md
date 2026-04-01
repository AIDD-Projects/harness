# MCPHub 프로젝트 교훈

> Sprint 1-4 실행에서 발견된 LLM 개발 패턴과 K-Harness가 방지할 수 있는 것

---

## 프로젝트 개요

- **프로젝트**: MCPHub — MCP 서버 관리 플랫폼
- **기술 스택**: TypeScript, Express, TypeORM, PostgreSQL, React 18, Mantine v8
- **아키텍처**: Hexagonal (Port + Adapter), 수동 DI
- **개발 체계**: BMAD v6.0.0-alpha.22 프레임워크
- **팀 규모**: 1인 개발자 + LLM 어시스턴트
- **Sprint**: 4개 Sprint 완료 (S1: 10개 story, S2-3: Foundation, S4: 6개 story)
- **테스트**: 30 suites, 354 tests

---

## 실패 유형별 분석

### 유형 1: Mock 미갱신 (4회)

#### 발생 Sprint
| Sprint | Story | 상황 |
|--------|-------|------|
| S4 | S4-1 | McpServerRepository에 findByFilters 추가, Mock 누락 |
| S4 | S4-2 | AuditLogRepository에 findByDateRange 추가, Mock 누락 |
| S4 | S4-3 | AdminUserRepository에 findWithPagination 추가, Mock 누락 |
| S4 | S4-4 | 페이지네이션 Repository 변경, Mock 누락 |

#### 근본 원인
- LLM이 도메인 레이어(인터페이스) 수정 → 테스트 레이어(Mock) 갱신을 별개 작업으로 인식
- BMAD의 testarch 지식 30개 파일에 "인터페이스 변경 시 Mock 동기화"라는 구체적 지침 부재
- 일반적인 "단위 테스트 원칙" 지식은 이 특정 실수를 방지하지 못함

#### K-Harness 방지 메커니즘
```
testing.instructions.md (applyTo: "backend/**/*.ts")
  → "Repository 인터페이스 변경 시 반드시 해당 Mock 팩토리 갱신"

test-integrity.md (skill)
  → 체크리스트: "[ ] (FP-001) 인터페이스의 모든 메서드가 Mock에 jest.fn()으로 매핑?"

failure-patterns.md
  → FP-001 기록 → reviewer.agent.md가 리뷰 시 자동 대조
```

---

### 유형 2: 타입 혼동 (3회)

#### 발생 상황
| 상황 | 설명 |
|------|------|
| Sprint 1 머지 | ServerType을 enum으로 사용 (`ServerType.STREAMABLE_HTTP`) → 실제론 union type |
| Sprint 1 머지 | McpServer 생성자 17개 파라미터인데 18개 전달 (extra: authType) |
| Sprint 4 | PaginatedResponse 타입 정의 위치 혼동 |

#### 근본 원인
- LLM이 이전 세션에서 확인한 타입 정보를 다음 세션에서 기억하지 못함
- BMAD에 "프로젝트 타입 레지스트리" 같은 메커니즘 없음
- 매번 코드베이스를 다시 탐색해야 하지만 탐색이 불완전

#### K-Harness 방지 메커니즘
```
.github/copilot-instructions.md (전역, 자동 주입)
  → "ServerType은 union type: 'STDIO' | 'SSE' | 'STREAMABLE_HTTP'"
  → "McpServer 생성자: 17개 파라미터 (authType 없음)"

failure-patterns.md
  → FP-002: ServerType enum 사용 금지
```
매 세션 시작 시 copilot-instructions.md가 자동 주입되므로 LLM이 매번 재탐색할 필요 없음.

---

### 유형 3: 지침 무시/순서 이탈 (2회)

#### 발생 상황
| 상황 | 설명 |
|------|------|
| Sprint 4 머지 | "보고 후 승인 대기" 지침을 무시하고 전체 Sprint 일괄 머지 |
| Sprint 1 재머지 | 롤백 → 단계별 머지 지침이었으나 S1-1~S1-10 한 번에 머지 |

#### 근본 원인  
- BMAD의 33개 워크플로우 중 현재 위치를 LLM이 추적 실패
- "다음 단계로 넘어가도 되는가?" 판단 기준이 워크플로우 내에 분산
- LLM은 "완료했으니 다음으로" 패턴에 빠지기 쉬움

#### K-Harness 방지 메커니즘
```
project-state.md (매번 참조)
  → "현재 단계: S4-5 검증 대기 중"
  → "다음 액션: 검증 보고서 제출 후 승인 대기"
  → "⛔ 승인 없이 머지 금지"

sprint-manager.agent.md
  → 제약 사항: "코드 구현 직접 수행 금지, Story 범위 결정 금지"
  → 게이트: "머지 전 reviewer agent 실행 필수"
```

---

### 유형 4: 불필요 파일 커밋 (2회)

#### 발생 상황
| 파일 | 위험도 | 설명 |
|------|--------|------|
| CREDENTIALS.md | 🔴 Critical | 평문 비밀번호 포함, Git에 커밋 |
| tmp_replace.js | 🟡 Medium | LLM이 생성한 임시 스크립트 |
| coverage_output.txt | 🟡 Medium | 테스트 커버리지 출력물 |
| .env.production | 🔴 Critical | 프로덕션 환경변수 |

#### 근본 원인
- LLM이 작업 중 생성한 임시 파일을 정리하지 않음
- `.gitignore` 확인 없이 `git add .` 패턴 사용
- BMAD에 "커밋 전 체크리스트" 메커니즘 없음

#### K-Harness 방지 메커니즘
```
security-checklist.md (skill)
  → 체크리스트: "[ ] .gitignore에 없는 민감 파일 확인"
  → 체크리스트: "[ ] 임시 파일 삭제 확인"
  → Bad 예시: CREDENTIALS.md, .env.production, tmp_*.js

reviewer.agent.md
  → 실행 단계: "git status --short에서 의도하지 않은 파일 확인"

failure-patterns.md  
  → FP-003: 민감 정보 파일 커밋 사고
```

---

## 정량적 요약

| 지표 | MCPHub 실적 | K-Harness 목표 |
|------|-----------|---------------|
| 같은 실수 반복 횟수 | 4회 (Mock) | 최대 1회 (학습 후 방지) |
| 타입 혼동 | 3회 | 0회 (copilot-instructions 자동 주입) |
| 지침 이탈 | 2회 | 0회 (project-state 게이트) |
| 보안 사고 | 2건 | 0건 (security-checklist 강제) |
| LLM 컨텍스트 파일 수 | 6~8개/작업 | ≤ 3개/작업 |
| 재작업률 | ~30% | ≤ 10% |

---

## 핵심 교훈 5가지

### 1. 일반적 지식 < 프로젝트 특화 체크리스트
30개의 테스트 이론 파일보다 "이 프로젝트에서 4번 틀린 FP-001" 1줄이 효과적.

### 2. 자동 주입 > 명시적 참조
LLM에게 "이 파일 읽어라"고 하면 빠뜨림. copilot-instructions 자동 주입이 유일한 신뢰 수단.

### 3. 파일 수 최소화 = 정확도 향상
6개 파일을 체인으로 탐색하는 동안 컨텍스트를 잃음. 2개 파일이면 정확도 유지.

### 4. 선형 워크플로우 > 복잡한 phase-gate
33개 워크플로우에서 "지금 어디지?"보다, Plan → Build → Verify 3단계가 추적 가능.

### 5. 명시적 게이트 > 암묵적 규칙
"승인 없이 머지 금지"를 project-state.md에 박아두면 LLM이 무시하기 어려움.
WorkFlow 파일 속 다단계 참조 속에 묻히면 LLM이 놓침.
