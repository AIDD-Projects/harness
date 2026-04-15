# 🟣 Crew-Driven Pipeline 실증 실험 #2 — 산출물검증(배치)

> kode:crew 산출물 → kode:musher v0.8.2 (`--crew` 플래그) 실행 파일럿
> 실험 #1(seongho)의 후속 — `--crew` 조건부 콘텐츠 기능 첫 실증

---

## Executive Summary

### 한눈에 보기

| 항목 | 내용 |
|------|------|
| **실험명** | kode:crew → kode:musher 실증 파일럿 #2 (seo-joonho-qa-agent-batch-001) |
| **대상** | 산출물검증(배치) — it'portal 산출물 자동 검증 시스템 |
| **기간** | 2026-04-15 ~ (진행 중) |
| **musher 버전** | v0.8.2 (`--crew` 플래그 최초 사용) |
| **Pipeline** | 🟣 Crew-Driven (Solo + Crew / VS Code Copilot) |
| **결과** | 🔄 진행 중 |
| **산출물** | [GitHub: seo-joonho-qa-agent-batch-001](https://github.com/KV000001-kodecrew-spinoff/seo-joonho-qa-agent-batch-001) |

### 실험 #1(seongho)과의 차이

| 항목 | 실험 #1 (seongho, v0.8.0→0.8.1) | 실험 #2 (seo-joonho, v0.8.2) |
|------|----------------------------------|-------------------------------|
| `--crew` 플래그 | 없음 (항상 crew 콘텐츠 포함) | ✅ 명시적 `--crew` — 첫 실증 |
| crew 산출물 경로 | `docs/PM/`, `docs/Analyst/`, `docs/ARB/` | `docs/planning_artifacts/`, `docs/ARB/` |
| 산출물 수 | 5개 (brainstorming 포함) | 4개 |
| 기존 프레임워크 | 7개 | 8개 (.clinerules 추가) |
| ARB Fail | 3건 (SEC-003, DEP-003, AI-001) | 0건 (전체 승인) |
| 프로젝트 규모 | Enterprise (₩15.6억/년, MSA 10+ 서비스) | Mid-size (배치 검증 시스템, DDD 10 모듈) |

### 검증 포인트 (이번 실험의 목적)

| # | 검증 항목 | 목표 | 결과 |
|---|-----------|------|------|
| 1 | `--crew` 플래그로 crew 콘텐츠 정상 포함 | 설치 시 `solo + crew mode` 표시 | ✅ PASS |
| 2 | 비표준 경로 crew 산출물 감지 | `docs/planning_artifacts/` 자동 인식 | ✅ PASS |
| 3 | ARB Fail 0건 시 정확한 처리 | Fail 없음 → 빈 섹션 or "승인" 표시 | ✅ PASS |
| 4 | 기존 8개 프레임워크 공존 | 기존 파일 무손상 | ✅ PASS |
| 5 | Planner → Sprint-manager 핸드오프 | 🟣 pipeline 정상 흐름 | 🔄 진행 중 |
| 6 | maxRequests 이슈 대응 | 50 → 100 설정으로 해결 | ✅ PASS |

---

## 1. 실험 개요

### 1.1 목적

1. **`--crew` 플래그 실증**: v0.8.2에서 추가된 `--crew` 조건부 콘텐츠 기능이 실제 프로젝트에서 정상 동작하는지 검증
2. **비표준 경로 감지**: crew 산출물이 `docs/crew/`나 `docs/PM/`이 아닌 `docs/planning_artifacts/`에 있을 때 bootstrap Phase 1.5의 Pattern D(키워드 스캔)가 정상 작동하는지 확인
3. **ARB 전체 승인 케이스**: 실험 #1은 ARB Fail 3건이었지만, 이번은 Fail 0건 — Validation Tracker가 올바르게 빈 상태를 처리하는지 검증
4. **프레임워크 공존 강도 테스트**: 8개 프레임워크 공존 (실험 #1보다 1개 추가)

### 1.2 대상 프로젝트

| 항목 | 내용 |
|------|------|
| **프로젝트** | 산출물검증(배치) — it'portal 업로드 산출물 자동 검증 시스템 |
| **프로젝트 경로** | `/Users/jungchihoon/chihoon/kodevibe/seo-joonho-qa-agent-batch-001` |
| **원격 저장소** | GitHub: seo-joonho-qa-agent-batch-001 |
| **기술 스택** | Java 21/Spring Boot+Spring Batch, React 18+/TypeScript, Apache Airflow, Azure PaaS (AKS, ACR, Blob, PostgreSQL) |

### 1.3 kode:crew 산출물 (입력)

| 산출물 | 경로 | 라인 수 | 주요 내용 |
|--------|------|---------|-----------|
| PRD | `docs/planning_artifacts/prd.md` | 336 | FR-001~003, 도메인 모델, NFR |
| Product Brief | `docs/planning_artifacts/product-brief.md` | 134 | 비전, 페르소나 4명, KPI 4개 |
| Conceptual Architecture | `docs/ARB/conceptual-architecture.md` | 277 | MSA, Azure PaaS, DR, 모니터링 |
| ARB Checklist | `docs/ARB/arb-checklist-result.md` | 138 | 전체 승인 (Fail 0건) |

### 1.4 기존 프레임워크 (공존 대상 — 8개)

| 프레임워크 | 경로 |
|------------|------|
| BMAD-METHOD | `.bmad-core/` |
| Claude Code | `.claude/` |
| Cursor | `.cursor/` |
| Windsurf | `.windsurf/` |
| Gemini | `.gemini/` |
| Cline | `.clinerules/` |
| GitHub Chatmodes | `.github/chatmodes/` |
| VS Code | `.vscode/` |

---

## 2. 실험 진행 기록

### Phase 1: 설치 (v0.8.2 --crew)

**명령**: `npx musher-engineering@0.8.2 init --ide vscode --mode solo --crew`

**결과**: ✅ 성공

- `solo + crew mode` 정상 표시 — `--crew` 플래그 동작 확인
- detected language: `typescript`
- 24 files 생성 (skills 10 + agents 4 + state 5 + agent-memory 4 + copilot-instructions 1)
- 기존 8개 프레임워크 파일 전부 무손상 ✅

### Phase 2: Bootstrap (🟣 Crew Pipeline)

**프롬프트**: "Run bootstrap to onboard this project"

**결과**: ✅ 성공 — 🟣 Pipeline 자동 진입

**maxRequests 이슈 발생**:
- `chat.agent.maxRequests: 50`에서 "Copilot이 한동안 이 문제에 대해 작업하고 있습니다" 표시
- **원인**: 기존 프레임워크 8개 디렉토리 스캔 + crew 산출물 4개 읽기 + state files 5개 쓰기 = tool call 50+ 회 초과
- **해결**: 설정을 100으로 변경 후 "계속" 선택 → 정상 완료

**crew 산출물 감지**:
- `docs/planning_artifacts/prd.md` ✅ — Pattern D (키워드 스캔) 감지
- `docs/planning_artifacts/product-brief.md` ✅ — Pattern D 감지
- `docs/ARB/conceptual-architecture.md` ✅ — Pattern A (`docs/ARB/`) 감지
- `docs/ARB/arb-checklist-result.md` ✅ — Pattern A 감지
- **인식률: 4/4 (100%)**

**User Q&A** (Phase 1.5에서 skip되지 않은 구현 확인 질문):
- Q: Artifact Index + Validation Tracker 생성? → A: 네
- Q: JUnit 5 + Jest + React Testing Library? → A: 네
- Q: Java/TypeScript 코딩 컨벤션? → A: 미정

**State Files 채움 결과**:

| State File | 라인 수 | 주요 내용 |
|------------|---------|-----------|
| `project-brief.md` | 83 | Vision, Goals(4), Non-Goals(5), Target Users(4), Artifact Index(4건), Validation Tracker (KPI 4, ARB 0, FR 3), Key Technical Decisions(15항목) |
| `project-state.md` | 50 | Quick Summary, Module Registry(10개), Sprint 1 초기화 |
| `features.md` | 50 | FR-001~003 등록 (⬜ planned) |
| `dependency-map.md` | 62 | 10 모듈 의존관계 (frontend→api-gateway→backend-api→domain) |
| `failure-patterns.md` | 63 | FP-001~004 템플릿 유지 |

**Validation Tracker 상세**:

| 섹션 | 항목 수 | 특이사항 |
|------|---------|----------|
| KPI Coverage | 4건 | 자동 배치 92%, PDF 25초, 체크리스트 90%, 수동 트리거 |
| ARB Fail Resolution | **0건** | "ARB 체크리스트 결과: 승인 (Fail 항목 없음) ✅" — 정확한 판단 |
| FR Coverage | 3건 | FR-001~003 전부 P0 |

### Phase 3: Planner (🟣 Step 2/6)

**결과**: ✅ Plan 생성 완료

- FR-001~003 기반 Story 계획 수립
- 🧭 Next Step: sprint-manager → "S1-1 Story를 시작해줘"
- Pipeline: 🟣 Step 2/6 (Plan confirmation gate)

**관찰**: (seongho 실험과 비교)
- <!-- TODO: Plan 내용 상세 기록 — Story 수, Sprint 구성 등 -->
- <!-- TODO: MANDATORY Write 실행 여부 확인 -->

### Phase 4: Sprint-manager (🟣 Step 3/6)

**결과**: ✅ 성공

- Plan → State files 반영 완료
- S1-1 "프로젝트 초기 설정 및 도메인 모델" Story active 설정
- 🧭 Next Step: Coding → S1-1 구현 시작
- **Scope 안내**: Spring Boot 멀티모듈 초기화, 도메인 엔티티 4개 (산출물, 검증결과, 배치, 사용자), JPA Repository, Flyway 마이그레이션, JUnit 5 테스트

**관찰**:
- MANDATORY Write 실행 여부: <!-- TODO: project-state.md Story 등록 확인 -->
- Fallback handler 동작 여부: <!-- TODO: sprint-manager가 planner 미반영분 보완했는지 확인 -->

### Phase 5: Coding + Reviewer (🟣 Step 4-5/6)

**S1-1: 프로젝트 초기 설정 및 도메인 모델**

- 프롬프트: "S1-1 프로젝트 초기 설정 및 도메인 모델을 구현해줘. Spring Boot 멀티모듈 프로젝트 초기화, 도메인 엔티티 4개(산출물, 검증결과, 배치, 사용자), JPA Repository, Flyway 마이그레이션, JUnit 5 테스트 포함. PRD 도메인 모델 섹션 참조. 완료 후 reviewer를 호출해줘."
- ✅ 코딩 완료 — Reviewer 단계 진입 대기 (Java 버전 확인 후 커밋)

**구현 결과**:

| 구분 | 수량 | 상세 |
|------|------|------|
| 도메인 엔티티 | 4개 | Artifact (산출물, 200MB 제한), Batch (배치, 24h 타임아웃), User (역할 기반), ValidationResult (검증결과, 1:1 산출물 매핑) |
| Enum | 5개 | ArtifactStatus, ArtifactType(PDF/DOCX/XLSX/MARKDOWN), BatchStatus, TriggerType(AUTO/MANUAL), UserRole(ADMIN/QA_MANAGER/PM) |
| JPA Repository | 4개 | 커스텀 쿼리: findByStatus, findByFileName, findByTriggeredById, findByArtifactId, findByEmail |
| JUnit 5 테스트 | **23개** | ArtifactTest(8), BatchTest(8), UserTest(3), ValidationResultTest(4) — project-state는 21개 기재 (오차) |
| Flyway 마이그레이션 | V1 | 4 테이블 + 4 인덱스 + FK + UNIQUE 제약 |
| Gradle 멀티모듈 | 6개 | domain, infra-db, backend-api, batch-service, api-gateway, (frontend 미생성) |

**코드 품질 관찰**:
- 엔티티에 비즈니스 로직 내장 (상태 전이 메서드, 검증 로직) — 단순 POJO 아님
- Lazy 로딩, protected 기본 생성자, @Enumerated(STRING) 등 JPA 모범 사례 적용
- 한국어 @DisplayName으로 테스트 의도 명확

**⚠️ 이슈: Java 버전 불일치**:
- `gradle.properties`: `javaVersion=17` (로컬에 Java 21 미설치)
- PRD / project-brief / project-state / ARB 체크리스트: 모두 Java 21 명시
- **판단**: Spring Boot 3.3.0은 Java 17~21 호환. S1-1 코드에 Java 21 전용 문법 미사용. 17로 유지하고 CI/CD 구축 시 21로 변경 가능
- **결론**: Java 17 유지 → 커밋 → S1-2 진행

**Reviewer 결과**: ✅ 리뷰 통과 — 보안 수정 포함 (Path Traversal 방지, UUID 파일명, 확장자 화이트리스트)

**S1-2: [FR-001] 파일 감지 및 등록 API**

- 프롬프트: "S1-2 [FR-001] 파일 감지 및 등록 API를 구현해줘. PRD의 FR-001 스펙과 도메인 모델을 참고해서 파일 업로드 REST API, 서비스 레이어, DTO를 만들어줘. 완료 후 reviewer를 호출해줘"
- ✅ 코딩 + Reviewer 완료 — 커밋 대기

**구현 결과**:

| 구분 | 수량 | 상세 |
|------|------|------|
| Controller | 1 | ArtifactController — POST/GET `/api/artifacts`, 201/200/400/404/413 |
| Service | 2 | ArtifactService (파일 등록/조회, @Transactional), FileStorageService (UUID 저장, Path Traversal 방지) |
| DTO | 3 | Java Record — ArtifactUploadResponse, ArtifactDetailResponse, ErrorResponse |
| Exception | 4 | UnsupportedFileTypeException, FileSizeExceededException, FileStorageException, GlobalExceptionHandler |
| 테스트 | **21개** | ArtifactControllerTest(7), ArtifactServiceTest(14) — 정상/오류/엣지케이스 포괄 |

**보안 조치 (Reviewer 지적 → 수정)**:
- Path Traversal 방지: `targetLocation.startsWith(storageLocation)` 검증
- UUID 기반 파일명으로 원본 파일명 비노출
- 확장자 화이트리스트 (`.docx/.xlsx/.pdf/.md`)
- 200MB 이중 검증 (도메인 + Spring multipart)

**누적 테스트**: S1-1(23) + S1-2(21) = **44개**

### Phase 6: Learn (🟣 Step 6/6)

- 🟡 Learn 미완료 추정 — agent memory 파일(planner.md, sprint-manager.md)이 여전히 템플릿 상태

**Learn 2차 실행 확인 (커밋 9e9c95d, d5c207c)**:
- ✅ agent-memory/reviewer.md 초기화 — S1-2 보안 리뷰 패턴 기록
- ✅ agent-memory/sprint-manager.md 초기화 — velocity 2/5 (40%)
- ❌ project-brief.md FR-001 🟡→✅ **미수정** (Step 2.5 미실행 확정)
- ❌ dependency-map.md Interface Change Log **비어있음** (Step 5.5 미실행 확정)
- ❌ failure-patterns.md **전부 Template** (Step 3 미실행 확정)

**결론**: learn이 Step 4 (Quick Summary) + Step 6 (Agent Memory) 만 실행하고, Step 2.5/3/5.5를 건너뜀

**S1-2 후 State Files 감사 결과 (4건 이슈)**:

| # | 심각도 | 문제 | 위치 |
|---|--------|------|------|
| 1 | 🔴 | FR-001 상태 불일치 — features.md ✅ vs project-brief.md 🟡 | project-brief.md FR Coverage |
| 2 | 🔴 | Interface Change Log 비어있음 — 보안 수정 2건 미기록 (Iron Law #1) | dependency-map.md |
| 3 | 🟡 | Failure Pattern 미기록 — 보안 이슈 2건 새 패턴 미등록 | failure-patterns.md |
| 4 | 🟡 | Learn 미완료 — planner.md, sprint-manager.md 템플릿 유지 | agent memory |

**관찰**: 🟣 Pipeline에서 learn이 자동 호출되지 않고 사용자가 별도 프롬프트를 입력해야 함. 코딩 에이전트가 "커밋 후 learn 호출"을 안내했지만 실제 실행 여부 불확실.

---

## 3. 발견 사항

### 3.1 `--crew` 플래그 검증

| 체크 | 결과 | 상세 |
|------|------|------|
| 설치 메시지에 `crew mode` 표시 | ✅ | `solo + crew mode` 정확히 출력 |
| bootstrap에서 Phase 1.5 진입 | ✅ | crew 산출물 감지 → Artifact Index 생성 |
| Validation Tracker 생성 | ✅ | KPI 4 + FR 3 + ARB 0 |
| 🟣 pipeline 네비게이션 표시 | ✅ | 🧭에 "Step 2/6" 표시 |

### 3.2 비표준 경로 감지 (Pattern D)

이전 실험(seongho)은 `docs/PM/`과 `docs/ARB/`로 Pattern A/B에 해당했지만, 이번은 `docs/planning_artifacts/`라는 비표준 경로를 사용. Bootstrap Phase 1.5의 **Pattern D (키워드 fallback 스캔)**가 `prd`, `product-brief` 키워드를 포함한 파일명으로 정상 감지.

### 3.3 ARB 전체 승인 케이스

실험 #1에서는 ARB Fail 3건 → P0 Story 매핑이 핵심 검증 포인트였으나, 이번은 Fail 0건. Bootstrap이 "승인 (Fail 항목 없음) ✅"로 올바르게 처리하여 불필요한 빈 테이블을 만들지 않음.

### 3.4 maxRequests 이슈

| 설정 | 결과 |
|------|------|
| 50 (기본) | ❌ 중단 — "계속하시겠습니까?" 표시 |
| 100 | ✅ 정상 완료 |

**원인 분석**: 기존 프레임워크 8개(특히 `.bmad-core/`는 10+ agents, 12+ tasks)의 디렉토리 스캔이 tool call 수를 급증시킴. 실험 #1(seongho)에서도 동일 현상 관찰되었으나 당시에는 "토큰 한계"로 오인. 실제 원인은 **VS Code Agent turn limit** (`chat.agent.maxRequests`).

**프레임워크 개선 권장**: 설치 가이드나 post-install guide에 `maxRequests: 100` 권장 안내 추가 검토.

---

## 4. 진행 중 관찰 사항

<!-- 실험 진행하면서 계속 업데이트 -->

| 시점 | 관찰 | 심각도 | 대응 |
|------|------|--------|------|
| 설치 | `solo + crew mode` 정상 출력 | Info | — |
| Bootstrap | maxRequests 50 초과 | Medium | 100으로 변경 |
| Bootstrap | Pattern D로 비표준 경로 감지 성공 | Info (positive) | — |
| Bootstrap | ARB Fail 0건 정확 처리 | Info (positive) | — |
| Planner | Plan 생성 성공, 🧭 네비게이션 정상 | Info | — |
| Sprint-manager | S1-1 active, Coding scope 안내 정상 | Info | — |
| Coding | S1-1 코딩 완료 — 엔티티 4, 테스트 23, Flyway V1 | ✅ | Java 17/21 불일치 (17 유지) |
| Coding | ⚠️ Java 버전: gradle=17 vs 문서=21 | Medium | CI/CD 시 변경 |
| Coding | ⚠️ 테스트 카운트: state에 21개, 실제 23개 | Low | 오차 |
| Coding | Reviewer 별도 호출 없이 인라인 통과 → 커밋 | Info | 🟣 pipeline에서 reviewer 단계 생략 관찰 |
| Sprint-manager | S1-1 커밋 완료 → S1-2 [FR-001] 파일 감지 및 등록 API 전환 | ✅ | 🟢 Step 4/6 |
| Coding | S1-2 구현 완료 — Controller+Service+DTO 13파일, 테스트 21개 | ✅ | Reviewer 호출 프롬프트 포함 |
| Reviewer | S1-2 보안 리뷰 통과 — Path Traversal 방지, UUID 파일명, 화이트리스트 | ✅ | 🟢 Step 5/6 |
| Learn | ❌ 불완전 실행 — FR-001 🟡→✅ 미수정, agent-memory 미생성, failure-patterns 미기록 | 🔴 | 하니스 설계 gap 발견 |
| Learn | learn Step 2.5 (Validation Tracker Update) 미실행 → FR Coverage 불일치 잔존 | 🔴 | reviewer Step 8에도 교차검증 부재 |
| Sprint-manager | S1-3 [FR-002] 배치 자동 실행 엔진 활성화 | ✅ | 🟣 Step 4/6 |

---

## 5. 핵심 인사이트

### 5.1 State File 동기화 Gap (🔴 하니스 설계 이슈)

**현상**: S1-2 완료 후 `features.md`는 FR-001 ✅로 정확히 업데이트되었으나, `project-brief.md` FR Coverage는 🟡로 불일치 잔존.

**근본 원인 분석**:

| 파일 | 업데이트 담당 | 실제 동작 |
|------|-------------|----------|
| features.md FR-001 ✅ | 코딩 에이전트 | ✅ 정상 |
| project-brief.md FR Coverage | learn Step 2.5 | ❌ 미실행 |
| dependency-map.md Interface Change Log | learn Step 5.5 or reviewer Step 7 | ❌ 둘 다 미실행 |
| failure-patterns.md | learn Step 3 | ❌ 미실행 |
| agent-memory/*.md | learn Step 6 | ❌ 파일 자체 부존재 |

**책임 경계 빈틈**: `project-brief.md`의 Validation Tracker FR Coverage 상태는 learn Step 2.5가 담당하는데, learn이 불완전 실행되면 이 상태가 영구적으로 불일치. reviewer Step 8 (State Audit)에도 FR Coverage ↔ features.md 교차검증이 명시적으로 없어서 이중 안전장치도 부재.

**하니스 개선 제안**:
1. **reviewer Step 8**에 `project-brief.md FR Coverage ↔ features.md 상태 교차검증` 체크 추가
2. **learn Step 2.5**를 MANDATORY Write로 강화 — 현재는 조건부 실행이라 skip 가능
3. agent-memory 디렉토리가 없을 때 learn이 실패하는지 확인 필요

### 5.2 S1-1에서 Reviewer 단계 생략

S1-1 코딩 시 프롬프트에 "완료 후 reviewer를 호출해줘"가 없었고, 코딩 에이전트가 인라인으로 리뷰를 통과시켜 바로 커밋. S1-2에서는 프롬프트에 reviewer 호출이 명시되어 있어 별도 Step으로 실행됨. → **🟣 pipeline 안내 프롬프트의 reviewer 호출 지시 포함 여부가 실제 동작을 결정**

### 5.3 코드 품질은 양호

State file 정합성 문제와 별개로, 실제 코드 품질은 좋음:
- 44개 테스트 (S1-1: 23, S1-2: 21)
- 보안 조치 실행 (Path Traversal, UUID 파일명, 화이트리스트)
- RESTful API 설계, Java Record DTO, 적절한 예외 처리
- 엔티티에 비즈니스 로직 내장 (DDD 스타일)

---

## 6. 리스크 & 미티게이션

| 리스크 | 영향 | 결과 |
|--------|------|------|
| maxRequests 초과 | 중단 UX friction | ✅ 해결 — 100으로 변경 |
| 비표준 crew 경로 | 미감지 위험 | ✅ 해결 — Pattern D 정상 작동 |
| 기존 8개 프레임워크 충돌 | 파일 덮어쓰기 | ✅ 무손상 확인 |
| MANDATORY Write 미실행 | 핸드오프 데이터 누락 | 🔄 모니터링 중 |
| learn 불완전 실행 | State file 정합성 누적 차이 | 🔴 발생 — FR-001 불일치, Interface Change Log 비어있음 |
| reviewer-learn 책임 경계 gap | FR Coverage 교차검증 부재 | 🔴 발견 — 하니스 개선 필요 |
