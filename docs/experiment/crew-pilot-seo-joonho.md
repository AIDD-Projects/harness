# 🟣 Crew-Driven Pipeline 실증 실험 #2 — 산출물검증(배치)

> kode:crew 산출물 → kode:musher v0.8.2 (`--crew` 플래그) 실행 파일럿
> 실험 #1(seongho)의 후속 — `--crew` 조건부 콘텐츠 기능 첫 실증
> **Confluence**: [실증 실험 #2 페이지](https://ktspace.atlassian.net/wiki/spaces/CNCORE/pages/717786374) | **Page ID**: 717786374

---

## Executive Summary

### 한눈에 보기

| 항목 | 내용 |
|------|------|
| **실험명** | kode:crew → kode:musher 실증 파일럿 #2 (seo-joonho-qa-agent-batch-001) |
| **대상** | 산출물검증(배치) — it'portal 산출물 자동 검증 시스템 |
| **기간** | 2026-04-15 (1일 — 단일 세션) |
| **musher 버전** | v0.8.2 (`--crew` 플래그 최초 사용) |
| **Pipeline** | 🟣 Crew-Driven (Solo + Crew / VS Code Copilot) |
| **결과** | ✅ 완료 — FR-001~003 전부 구현, 91개 테스트, 하니스 개선 5건 도출 |
| **산출물** | [GitHub: seo-joonho-qa-agent-batch-001](https://github.com/KV000001-kodecrew-spinoff/seo-joonho-qa-agent-batch-001) |
| **브랜치 전략** | `main` 원본 유지 / `dev` 브랜치에서 작업 (S1-3~S1-4 + docs 포함) |

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
| 5 | Planner → Sprint-manager 핸드오프 | 🟣 pipeline 정상 흐름 | ✅ PASS (S1-4까지 4회 반복 확인) |
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
| **브랜치** | `main` — 원본 유지 (d5c207c) / `dev` — 실험 작업 브랜치 (b623e12) |
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

**S1-3: [FR-002] 배치 자동 실행 엔진**

- 프롬프트: sprint-manager로 S1-3 활성화 후 코딩 진행
- ✅ 코딩 완료 — 커밋 3a958af

**구현 결과**:

| 구분 | 수량 | 상세 |
|------|------|------|
| Config | 1 | BatchJobConfig — Spring Batch Job/Step/Reader/Processor/Writer 구성 (89라인) |
| Controller | 1 | BatchController — POST/GET `/api/batches` (수동 트리거, 상태 조회) |
| Service | 1 | BatchExecutionService — 배치 실행 핵심 로직 (171라인) |
| Scheduler | 1 | BatchScheduler — @Scheduled CRON 기반 자동 실행 |
| DTO | 3 | BatchResponse, BatchTriggerRequest, ErrorResponse |
| Exception | 2 | BatchExecutionException, BatchNotFoundException |
| 테스트 | **28개** | BatchExecutionServiceTest(18), BatchControllerTest(8), BatchSchedulerTest(5) — 실제 @Test 카운트 기준 |
| State 변경 | 3 | features.md FR-002 ✅, project-state.md S1-3 active, dependency-map.md 업데이트 |

**파일 변경**: 20개 파일, +1,093줄

**관찰**:
- Reviewer 별도 호출 여부: 커밋 메시지에 reviewer 언급 없음 — S1-1과 동일하게 인라인 처리 추정
- features.md FR-002 ✅ 정상 업데이트 — 하지만 project-brief.md FR Coverage 동기화 여부 미확인 (learn 미실행)
- project-state.md Quick Summary은 아직 S1-2 기준 — S1-3 완료 미반영 (learn 또는 sprint-manager 미호출)

**누적 테스트**: S1-1(23) + S1-2(21) + S1-3(28) = **72개**

**S1-4: [FR-003] 검증 결과 PDF 생성 및 저장**

- 프롬프트: sprint-manager로 S1-4 활성화 후 코딩 진행
- ✅ 코딩 완료 — 커밋 22035e7

**구현 결과**:

| 구분 | 수량 | 상세 |
|------|------|------|
| Service | 2 | PdfGeneratorService (인터페이스+구현체), LocalStorageService (파일 시스템 저장) |
| Integration | 1 | BatchReportService — 배치 완료 → PDF 생성 → 저장 통합 |
| Module | 2 | infra-pdf (new), infra-storage (new) — DDD 인프라 계층 추가 |
| Config | 1 | build.gradle (iText 의존성), settings.gradle 업데이트 |
| Domain 변경 | 2 | BatchStatus.PDF_GENERATION_FAILED 추가, reportPath 필드 추가 |
| 테스트 | **19개** | PdfGeneratorServiceImplTest(3), LocalStorageServiceTest(7), BatchReportServiceTest(7), BatchControllerTest(2 추가) |

**파일 변경**: 36개 파일, +900줄

**발견 이슈 (FP-005, FP-006)**:
- FP-005: JDK Temurin 17.0.2 SSL 인증서 만료 → Maven Central PKIX failure
- FP-006: infra-pdf/infra-storage 로컬 JAR 전이 의존성 누락

**⚠️ Reviewer 빈 응답 이슈**:
- S1-4 코딩 완료 후 Reviewer 에이전트 호출 시 빈 응답 반환
- **원인**: VS Code Copilot 제한 — 동일 채팅 세션에서 agent-to-agent invocation 미지원
- 코딩 에이전트가 "reviewer를 호출합니다"라고 안내하지만 실제 reviewer 에이전트가 실행되지 않고 빈 응답으로 fallback
- **대응**: 사용자가 별도 프롬프트로 `@reviewer` 직접 호출 필요
- **하니스 개선 필요**: 🟣 pipeline 코딩 프롬프트에서 "reviewer를 호출해줘" → "사용자에게 reviewer 호출을 안내해줘"로 변경

**누적 테스트**: S1-1(23) + S1-2(21) + S1-3(28) + S1-4(19) = **91개** ✅

### Phase 6: Learn (🟣 Step 6/6)

#### Learn 1차 시도 (S1-2 후, 커밋 9e9c95d, d5c207c)

- ✅ agent-memory/reviewer.md 초기화 — S1-2 보안 리뷰 패턴 기록
- ✅ agent-memory/sprint-manager.md 초기화 — velocity 2/5 (40%)
- ❌ project-brief.md FR-001 🟡→✅ **미수정** (Step 2.5 미실행)
- ❌ dependency-map.md Interface Change Log **비어있음** (Step 5.5 미실행)
- ❌ failure-patterns.md **전부 Template** (Step 3 미실행)

**결론**: Step 4 (Quick Summary) + Step 6 (Agent Memory) 만 실행하고 Step 2.5/3/5.5 건너뜀

#### Learn 2차 시도 (S1-4 후, 최종 — 미커밋)

- ✅ **Step 2.5**: FR Coverage 업데이트 — FR-001/002/003 모두 🟡→✅ (드디어 실행!)
- ✅ **Step 3**: Failure Patterns — FP-001 활성화 (Mock NPE), FP-005/006 신규 등록
- ✅ **Step 4**: Quick Summary 업데이트 ("S1-4 done, 91 tests")
- ✅ **Step 5**: features.md FR-003 상세 업데이트 (Key Files + Test Files)
- ✅ **Step 6**: agent-memory — sprint-manager 4/5 (80%), reviewer 2 reviews/3 auto-fixes
- 🟡 **Step 2.5 → KPI**: KPI-1/2/4이 🟡 (⬜→✅가 아닌 ⬜→🟡) — 부분 정확
- ❌ **Recent Changes**: S1-4 완료 항목 미추가
- ❌ **Quick Summary**: 2줄 (스펙은 3줄 요구)
- ❌ **미커밋**: learn이 변경사항을 자동 커밋하지 않음

**1차 vs 2차 비교**:

| Step | 1차 (S1-2 후) | 2차 (S1-4 후) |
|------|---------------|---------------|
| Step 2.5 (Validation Tracker) | ❌ 미실행 | ✅ 실행 (FR ✅, KPI 🟡) |
| Step 3 (Failure Patterns) | ❌ 미실행 | ✅ 실행 (3건 기록) |
| Step 4 (Quick Summary) | ✅ 실행 | ✅ 실행 |
| Step 5 (features.md) | 부분 | ✅ 상세 |
| Step 5.5 (Interface Change) | ❌ 미실행 | ❌ 미실행 |
| Step 6 (Agent Memory) | ✅ 실행 | ✅ 실행 |
| 자동 커밋 | ❌ | ❌ |

**개선**: 2차 learn이 1차 대비 현저히 향상. 그러나 Step 5.5, 자동 커밋, Quick Summary 3줄, Recent Changes 업데이트 등 여전히 미비.

#### S1-2 후 State Files 감사 결과 (4건 이슈)

| # | 심각도 | 문제 | 위치 | 최종 상태 |
|---|--------|------|------|----------|
| 1 | 🔴 | FR-001 상태 불일치 — features.md ✅ vs project-brief.md 🟡 | project-brief.md FR Coverage | ✅ learn 2차에서 해결 |
| 2 | 🔴 | Interface Change Log 비어있음 — 보안 수정 2건 미기록 (Iron Law #1) | dependency-map.md | ❌ 미해결 |
| 3 | 🟡 | Failure Pattern 미기록 — 보안 이슈 2건 새 패턴 미등록 | failure-patterns.md | ✅ learn 2차에서 해결 (FP-001/005/006) |
| 4 | 🟡 | Learn 미완료 — planner.md, sprint-manager.md 템플릿 유지 | agent memory | ✅ learn 2차에서 해결 |

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
| Coding | S1-3 구현 완료 — BatchJobConfig+BatchController+Service+Scheduler, 테스트 28개 | ✅ | 커밋 3a958af, 20파일 +1093줄 |
| Coding | ⚠️ Reviewer 별도 호출 없이 커밋 — S1-1과 동일 패턴 | Medium | 🟣 pipeline reviewer 단계 생략 반복 |
| Coding | ⚠️ project-state.md Quick Summary S1-3 미반영 — learn/sprint-manager 미호출 상태 | Medium | S1-2 기준 잔존 |
| Coding | S1-4 구현 완료 — PdfGenerator+LocalStorage+BatchReport, 테스트 19개 추가 | ✅ | 커밋 22035e7, 36파일 +900줄 |
| Coding | S1-4 중 FP-005 (JDK SSL 인증서 만료) + FP-006 (전이 의존성 누락) 발생 | Medium | 현장 대응 완료 |
| Reviewer | ⚠️ S1-4 Reviewer 호출 시 빈 응답 — VS Code agent-to-agent 미지원 | 🔴 | 하니스 프롬프트 변경 필요 |
| 중간점검 | 8건 이슈 발견, Iron Law 7/8 준수, 전체 등급 **B+** | Info | 상세 6.1~6.2 참조 |
| Learn | 2차 learn 실행 — Step 2.5/3/4/5/6 ✅, Step 5.5 ❌ | 🟡 | 1차 대비 현저히 향상 |
| Learn | ⚠️ learn 변경사항 자동 커밋 안 됨 — 수동 커밋 필요 | Medium | 하니스 개선 필요 |

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

### 5.3 Reviewer Agent-to-Agent 호출 실패 (🔴 VS Code 제한)

**현상**: S1-4 코딩 완료 후 "reviewer를 호출합니다"라고 안내 후 빈 응답 반환. 사용자가 별도 프롬프트로 `@reviewer` 호출해야 동작.

**근본 원인**: VS Code Copilot 환경에서 동일 채팅 세션 내 agent-to-agent invocation이 미지원. 코딩 에이전트가 reviewer를 "호출"한다고 하지만 실제로는 빈 텍스트를 받아 인라인 리뷰로 fallback하거나, 아예 빈 응답.

**하니스 개선 제안**:
- 🟣 pipeline 코딩 프롬프트: "reviewer를 호출해줘" → "사용자에게 reviewer 호출을 안내해줘" 로 변경
- 또는 코딩 에이전트 완료 메시지 끝에 "💡 이제 `@reviewer`를 호출하세요" 구문 삽입

### 5.4 코드 품질은 양호

State file 정합성 문제와 별개로, 실제 코드 품질은 좋음:
- 91개 테스트 (S1-1: 23, S1-2: 21, S1-3: 28, S1-4: 19) — 전체 pass
- 보안 조치 실행 (Path Traversal, UUID 파일명, 화이트리스트)
- RESTful API 설계, Java Record DTO, 적절한 예외 처리
- 엔티티에 비즈니스 로직 내장 (DDD 스타일)
- DDD 인프라 계층 분리 (infra-db, infra-pdf, infra-storage)

---

## 6. 리스크 & 미티게이션

| 리스크 | 영향 | 결과 |
|--------|------|------|
| maxRequests 초과 | 중단 UX friction | ✅ 해결 — 100으로 변경 |
| 비표준 crew 경로 | 미감지 위험 | ✅ 해결 — Pattern D 정상 작동 |
| 기존 8개 프레임워크 충돌 | 파일 덮어쓰기 | ✅ 무손상 확인 |
| MANDATORY Write 미실행 | 핸드오프 데이터 누락 | 🔄 모니터링 중 |
| learn 불완전 실행 | State file 정합성 누적 차이 | 🔴 발생 → 🟡 2차에서 대부분 해결 |
| reviewer-learn 책임 경계 gap | FR Coverage 교차검증 부재 | 🔴 발견 — 하니스 개선 필요 |
| reviewer 빈 응답 | VS Code agent-to-agent 미지원 | 🔴 발견 — 프롬프트 변경 필요 |

---

## 7. 중간점검 결과 (S1-3 → S1-4 사이)

### 7.1 State File 감사

| 항목 | 심각도 | 문제 | S1-4 후 해결 |
|------|--------|------|-------------|
| FR Coverage 불일치 | 🔴 | features.md ✅ vs project-brief.md 🟡 | ✅ learn 2차 해결 |
| KPI Coverage 미갱신 | 🔴 | KPI-1~4 전부 ⬜ 유지 | 🟡 learn 2차에서 🟡로 변경 (✅ 아님) |
| sprint-manager.md 잔류 | 🔴 | velocity 2/5 — S1-3 미반영 | ✅ learn 2차에서 4/5 갱신 |
| Reviewer 미호출 패턴 | 🔴 | S1-1/S1-3 인라인 → S1-4 빈 응답 | 🔴 구조적 문제 — 하니스 개선 필요 |
| 테스트 카운트 오차 | 🟡 | state에 21개, 실제 23개 (S1-1) | Info |
| failure-patterns 템플릿 | 🟡 | 전부 Template 상태 | ✅ learn 2차에서 3건 활성화 |
| planner/architect memory 비어있음 | 🟡 | agent가 해당 memory 미기록 | 🟡 여전히 비어있음 |
| maxRequests 15 이슈 | 🟡 | 어느 시점에 100→15 변경 | Info — 사용자 설정 문제 |

### 7.2 Iron Law 준수

| # | Iron Law | 준수 | 비고 |
|---|----------|------|------|
| 1 | Mock Sync | ✅ | JUnit 단위 테스트 mock 일관 |
| 2 | Type Check | ✅ | Java 엔티티 ↔ DTO 정합 |
| 3 | Scope Compliance | ✅ | 각 Story scope 내 변경 |
| 4 | Security | ✅ | 인증정보 미포함 |
| 5 | 3-Failure Stop | ✅ | 해당 사항 없음 |
| 6 | Dependency Map | ✅ | S1-3에서 batch-service 의존 추가 |
| 7 | Feature Registry | ✅ | FR-001~003 정확히 반영 |
| 8 | Session Handoff | 🟡 | Quick Summary 업데이트는 되었으나 3줄 미달 |

**전체 등급: B+** — 코드 품질 양호, State file 정합성 갭은 learn 스킬 설계 한계에 기인

---

## 8. 실험 결론

### 8.1 최종 수치

| 지표 | 값 |
|------|-----|
| **총 Story** | 4/5 완료 (80%) — S1-5 (배포 파이프라인)는 Phase 2 |
| **총 테스트** | 91개 (전부 pass) |
| **총 파일** | 46개 Java 소스 |
| **총 커밋** | 8개 (bootstrap → learn → S1-1 → S1-2 → learn → S1-3 → sprint-manager → S1-4) |
| **FR Coverage** | FR-001 ✅, FR-002 ✅, FR-003 ✅ (100%) |
| **Pipeline 진행** | bootstrap → planner → sprint-manager → coding×4 → learn×2 |
| **경과 시간** | 단일 세션 (2026-04-15) |

### 8.2 검증 포인트 최종 판정

| # | 검증 항목 | 판정 | 근거 |
|---|-----------|------|------|
| 1 | `--crew` 플래그 동작 | ✅ PASS | solo + crew mode 출력, Phase 1.5 자동 진입 |
| 2 | 비표준 경로 감지 | ✅ PASS | `docs/planning_artifacts/` → Pattern D 100% 감지 |
| 3 | ARB Fail 0건 처리 | ✅ PASS | "승인 (Fail 항목 없음) ✅" 올바르게 표시 |
| 4 | 8개 프레임워크 공존 | ✅ PASS | 전부 무손상 |
| 5 | Pipeline 핸드오프 | ✅ PASS | 4회 반복 (S1-1~S1-4) 정상 흐름 확인 |
| 6 | maxRequests 대응 | ✅ PASS | 100 설정으로 해결 |

### 8.3 하니스 개선 항목 도출 (→ v0.8.3)

| # | 개선 항목 | 심각도 | 근거 |
|---|-----------|--------|------|
| 1 | **reviewer Step 8**: FR Coverage ↔ features.md 교차검증 추가 | 🔴 | State file 불일치 방치 가능 |
| 2 | **learn Step 2.5**: MANDATORY Write로 강화 | 🔴 | 1차 learn에서 skip → FR 불일치 5 Story 잔존 |
| 3 | **🟣 pipeline 코딩 프롬프트**: "reviewer를 호출해줘" → "사용자에게 reviewer 호출을 안내해줘" | 🔴 | VS Code agent-to-agent 미지원 → 빈 응답 |
| 4 | **learn**: 변경사항 자동 커밋 | 🟡 | learn 후 uncommitted 상태 방치 |
| 5 | **learn Quick Summary**: 3줄 형식 강제 | 🟡 | 2줄만 기재 반복 |
| 6 | **learn Recent Changes**: S-N 완료 항목 자동 추가 | 🟡 | Recent Changes 섹션 비어있음 |
| 7 | **agent-memory 디렉토리**: 설치 시 생성 검증 | 🟡 | learn이 디렉토리 부재로 실패 가능 |
| 8 | **maxRequests**: post-install 가이드에 100 권장 | 🟡 | 기본값 50으로는 crew 프로젝트에서 중단 |

### 8.4 실험 #1(seongho) → #2(seo-joonho) 비교 종합

| 항목 | 실험 #1 (seongho) | 실험 #2 (seo-joonho) |
|------|-------------------|---------------------|
| harness 버전 | v0.8.0→v0.8.1 | v0.8.2 |
| `--crew` 사용 | ❌ 없음 | ✅ 첫 실증 |
| 완료 Story | 2/6 (33%) | 4/5 (80%) |
| 총 테스트 | ~30개 | 91개 |
| Pipeline 반복 | 2회 | 4회 |
| learn 실행 | 1회 (부분) | 2회 (1차 부분→2차 대폭 향상) |
| 주요 발견 | maxRequests, 프레임워크 공존 | Reviewer 빈 응답, learn 불완전 실행 패턴 |
| 전체 등급 | B | B+ |

### 8.5 결론

실증 실험 #2는 `--crew` 플래그의 첫 실전 검증으로서 **6개 검증 포인트 전부 PASS**를 달성했다. 비표준 경로 감지(Pattern D), ARB 전체 승인 케이스, 8개 프레임워크 공존 모두 정상 동작이 확인되었으며, 실험 #1 대비 Pipeline 반복 횟수(4회)와 learn 개선(2차에서 Step 2.5/3 실행)에서 명확한 진전이 있었다.

그러나 **3가지 구조적 한계**가 확인되었다:
1. **learn 불완전 실행**: Step 2.5/3/5.5가 조건부이므로 LLM이 skip 가능 → MANDATORY로 강화 필요
2. **Reviewer agent-to-agent 미지원**: VS Code Copilot 환경 제한 → 프롬프트 우회 필요
3. **State file 교차검증 부재**: reviewer와 learn 사이 책임 경계 빈틈 → reviewer Step 8 보강

이 3건은 v0.8.3에서 우선 해결해야 할 항목이며, 해결 시 harness의 State file 정합성이 크게 향상될 것으로 예상한다.

### 8.6 브랜치 전략 변경

실험 종료 시점에 **main 브랜치를 원본 상태로 보존**하고 모든 실험 작업물(S1-3, S1-4, docs 변경)을 `dev` 브랜치로 이관하였다.

| 브랜치 | HEAD | 내용 |
|--------|------|------|
| `main` | d5c207c | 원격과 동일 — 원본 상태 유지 |
| `dev` | b623e12 | S1-3, S1-4, learn docs 커밋 포함 — 원격에 push 완료 |

이후 세션에서 sprint-manager 호출 시 `dev` 브랜치에서 S1-5 작업을 이어갈 수 있다.
