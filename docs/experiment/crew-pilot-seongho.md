# 🟣 Crew-Driven Pipeline 실증 실험 — KT AI 고객상담 자동화

> kode:crew 산출물 → kode:musher 실행 파일럿

---

## Executive Summary

### 한눈에 보기

| 항목 | 내용 |
|------|------|
| **실험명** | kode:crew → kode:musher 실증 파일럿 (seongho) |
| **대상** | KT AI 고객상담 자동화 시스템 (₩15.6억/년, Mission Critical 24/7) |
| **기간** | 2026-04-14 ~ 2026-04-15 |
| **musher 버전** | v0.8.0 → v0.8.1 (실험 중 패치) |
| **Pipeline** | 🟣 Crew-Driven (Solo / VS Code Copilot) |
| **결과** | ✅ **전 항목 PASS** — 5/5 성공 기준 달성 |
| **산출물** | [GitHub: seongho/dev](https://github.com/KV000001-kodecrew-spinoff/seongho/tree/dev) — 66 files, 5,497 lines |

### 성공 기준 달성 현황

| # | 기준 | 목표 | 결과 | 달성 |
|---|------|------|------|------|
| 1 | 설치 무충돌 | 100% | 7개 기존 프레임워크 무손상 | ✅ PASS |
| 2 | Bootstrap 인식률 | ≥4/5 artifacts | 5/5 (100%) → 재실험 4/5 (80%) | ✅ PASS |
| 3 | 방향 정렬 정확도 | ≥80% | FR→Story + ARB Fail→P0 Story 100% 매핑 | ✅ PASS |
| 4 | Agent 유용성 | ≥3/4 agents | 4/5 agents 유용 (fallback 포함) | ✅ PASS |
| 5 | 프레임워크 공존 | Yes | BMAD+Claude+Cursor+Windsurf+Codex+Gemini+GitHub 공존 | ✅ PASS |

### 🟣 Pipeline 완주 결과 (2 사이클)

| Step | Agent/Skill | S1-1 결과 | S1-2 결과 |
|------|------------|-----------|-----------|
| 1/6 | bootstrap | ✅ crew 4개 인식, state 5/5 채움 | (재사용) |
| 2/6 | planner | ⚠️ plan 정확, state write 실패 → fallback 보완 | (재사용) |
| 3/6 | sprint-manager | ✅ 16 Stories + Validation Tracker 100% | ✅ S1-2 active |
| 4/6 | coding | ✅ 모노레포 스캐폴딩 (6개 영역) | ✅ ARB SEC-003 CRITICAL 해결 |
| 5/6 | reviewer | ✅ DONE_WITH_CONCERNS (2건 minor) | ✅ DONE_WITH_CONCERNS (5건 non-blocking) |
| 6/6 | learn | ✅ state 최신화, Session End 안내 | ✅ FP-005 생성, agent-memory 초기화 |

### 실험에서 발견된 문제 → 프레임워크 개선 적용

| 문제 | 수정 | 버전 |
|------|------|------|
| `→ Call:` 호출 방법 불명확 | `→ Next: (슬래시 메뉴에서 선택하거나, 채팅에 프롬프트 입력)` 16개 파일 수정 | v0.8.1 |
| `Prompt example:` 불일관 | `Prompt:` 통일 (13개 파일) | v0.8.1 |
| Planner state file write 미실행 | MANDATORY 섹션 추가 + sprint-manager fallback handler | v0.8.1 |
| Sprint-manager plan 반영 핸들러 없음 | "plan approved" fallback handler 추가 | v0.8.1 |
| Git commit/push 가이드 부재 | reviewer Step 9, learn push check, sprint-manager commit 리마인더 | v0.9.0 예정 |

### 핵심 인사이트 8가지 (요약)

1. **LLM은 "지시"보다 "흐름"을 따른다** — MANDATORY 3중 강제도 LLM의 completion 흐름을 바꾸지 못함
2. **Defense-in-Depth가 핵심 패턴** — 발신자(planner) 실패 시 수신자(sprint-manager) fallback으로 보완
3. **Validation Tracker가 crew→musher Gap을 메움** — KPI/FR/ARB Fail→Story 추적 자동화
4. **토큰 예산 한계** — Enterprise PRD(5K+ words)는 bootstrap에서 토큰 초과 위험
5. **IDE UX 매핑은 실사용에서만 발견** — 실증 없이는 불가능
6. **Scope + Reviewer = 품질 게이트** — 🧭 프롬프트 한 줄로 자연스러운 게이트 삽입
7. **기술 스택 일관성 유지** — crew PRD → planner Story → coding까지 기술 결정 무손실 전달
8. **Git Commit/Push 가이드 부재** — 프레임워크가 push를 유도하지 않아 팀 협업 시 Gap 발생

---

## 1. 실험 개요

### 1.1 목적

1. **kode:crew 산출물 호환성 검증**: crew가 생성한 PRD, Product Brief, Architecture, ARB 체크리스트가 musher의 state files로 올바르게 매핑되는지 확인
2. **방향 정렬 검증**: musher의 direction guard가 crew 산출물의 방향성을 올바르게 반영하여 개발을 가이드하는지 검증
3. **프레임워크 공존 검증**: 기존 BMAD-METHOD (.bmad-core/) + 여러 IDE configs와 musher의 공존 가능성 확인
4. **실제 개발 가이드 품질**: musher가 enterprise-grade 프로젝트에서 실질적으로 유용한 가이드를 제공하는지 측정

### 1.2 대상 프로젝트

| 항목 | 내용 |
|------|------|
| **프로젝트** | KT AI 고객상담 자동화 시스템 |
| **프로젝트 경로** | `/Users/jungchihoon/chihoon/kodevibe/seongho` |
| **원격 저장소** | [GitHub: seongho](https://github.com/KV000001-kodecrew-spinoff/seongho) |
| **예산 규모** | ₩15.6억/년 (Mission Critical, 24/7) |
| **기술 스택** | Java 21/Spring Boot 3.3, Python 3.12/FastAPI, Next.js 14, Kafka 3.7, Redis 7.2, PostgreSQL 16, Milvus 2.4, ELK+Prometheus+Grafana |

### 1.3 kode:crew 산출물 (입력)

| 산출물 | 경로 | 품질 |
|--------|------|------|
| PRD (Product Requirements) | `docs/PM/prd.md` | ⭐⭐⭐⭐⭐ (5K+ words, KPI/metrics 포함) |
| Product Brief | `docs/Analyst/product-brief.md` | ⭐⭐⭐⭐⭐ (시장분석, 경쟁자 분석 포함) |
| Conceptual Architecture | `docs/ARB/conceptual-architecture.md` | ⭐⭐⭐⭐⭐ (MSA, 기술 스택 상세) |
| ARB Checklist Result | `docs/ARB/arb-checklist-result.md` | ⭐⭐⭐⭐ (83.3% — 15 pass, 3 fail) |
| Brainstorming Session | `docs/brainstorming-session.md` | ⭐⭐⭐⭐ (전략 워크샵 결과) |

### 1.4 기존 프레임워크 (공존 대상)

| 프레임워크 | 경로 | 규모 |
|------------|------|------|
| BMAD-METHOD | `.bmad-core/` | 10 agents, 12+ tasks, 13 templates, 6 checklists |
| Claude Code | `.claude/` | commands, rules |
| Cursor | `.cursor/` | rules |
| Windsurf | `.windsurf/` | rules |
| Codex / OpenAI | `AGENTS.md`, `opencode.jsonc` | full agent mapping |
| Gemini | `.gemini/` | - |
| GitHub Chatmodes | `.github/chatmodes/` | - |

### 1.5 ARB Fail Items (미해결)

| ID | 항목 | 상태 |
|----|------|------|
| SEC-003 | 개인정보보호법 compliance 상세 미비 | 미티게이션 플랜 제출됨 |
| DEP-003 | 성능 테스트 계획 미비 | k6/JMeter 시나리오 설계 필요 |
| AI-001 | AI 모델 거버넌스 미비 | MLOps 파이프라인 정의 필요 |

---

## 2. 실험 절차 설계

### 2.1 실험 흐름

| Phase | 내용 | 검증 항목 |
|-------|------|-----------|
| Phase 1 | musher 설치 | 기존 파일 무손상, 공존 가능 |
| Phase 2 | Bootstrap (🟣 Pipeline 진입) | crew 산출물 인식률, state files 매핑 |
| Phase 3 | Planner → Sprint-manager 핸드오프 | 방향 정렬, Story 매핑, Validation Tracker |
| Phase 4 | Coding + Reviewer (2 사이클) | 코드 품질, Scope 준수, 리뷰 유효성 |
| Phase 5 | Learn (세션 마무리) | state file 최신화, Session Handoff |

### 2.2 성공 기준

| # | 기준 | 측정 방법 | 목표 |
|---|------|-----------|------|
| 1 | 설치 무충돌 | musher init 성공 + 기존 파일 무손상 | 100% |
| 2 | Bootstrap 인식률 | crew 산출물 5개 중 state에 반영된 수 | ≥ 4/5 |
| 3 | 방향 정렬 정확도 | FR→Story 매핑 + ARB Fail→P0 Story | ≥ 80% |
| 4 | Agent 유용성 | 5개 Agent/Skill 중 실질적 도움 수 | ≥ 3/4 |
| 5 | 프레임워크 공존 | BMAD + musher 동시 사용 가능 여부 | Yes |

---

## 3. 실험 결과 상세

### Phase 1: 설치 (v0.8.0)

**명령**: `npx musher-engineering init --ide vscode --mode solo`
**결과**: ✅ 성공

- `musher-engineering@0.8.0` 설치
- 기존 `AGENTS.md` (BMAD용) 감지 → overwrite 프롬프트 표시 (UX 문제 발견 → 수정 반영)
- N 선택 → 기존 파일 무손상, 새 파일만 생성
- 생성 확인: `.github/copilot-instructions.md`, `.github/skills/` × 10, `.github/agents/` × 4
- `docs/` state files × 5 + `agent-memory/` × 4 생성
- 기존 7개 프레임워크 파일 전부 무손상 ✅
- **설치 무충돌 검증: PASS**

**발견된 UX 문제** (즉시 수정):
- `detectExistingInstall()`이 `AGENTS.md`를 Musher 파일로 오탐
- → 3가지 수정 적용, 140 tests pass

### Phase 2: Bootstrap (🟣 Crew Pipeline)

**프롬프트**: "Run bootstrap to onboard this project"
**결과**: ✅ 성공 — 🟣 Pipeline 자동 진입

**State Files 채움 결과**:

| State File | 채움 상태 | 주요 내용 |
|------------|-----------|-----------|
| `project-brief.md` | ✅ 완전 채움 | Vision, Goals(5), Non-Goals(6), Artifact Index(5), Validation Tracker (KPI 6, ARB Fail 3, FR 5) |
| `features.md` | ✅ 채움 | FR-001~005 등록 |
| `dependency-map.md` | ✅ 채움 | 9개 모듈 |
| `project-state.md` | ✅ 채움 | Sprint 0 완료, Quick Summary |
| `failure-patterns.md` | ✅ 템플릿 유지 | FP-001~004 |

**Crew 산출물 인식률**: 5/5 (100%) — 전부 인덱싱, 원본 무수정 ✅

### Phase 3: Planner + UX 문제 발견 → v0.8.1 패치

**Planner 결과**: Plan 생성 ✅ (FR-001~005 매핑, ARB Fail→P0) — **state file write 미실행** ❌

**발견된 문제 5건 → 즉시 수정, v0.8.1 publish**:

| # | 문제 | 수정 | 심각도 |
|---|------|------|--------|
| A | `→ Call:` IDE 사용법 불일치 | 16개 파일 네비게이션 통일 | Medium |
| B | `Prompt example:` 불일관 | 13개 파일 `Prompt:` 통일 | Low |
| C | Planner state write 미실행 | MANDATORY 섹션 추가 | **Critical** |
| D | Sprint-manager fallback 없음 | "plan approved" handler 추가 | High |
| E | Validation Tracker 보완 불가 | 🟣 pipeline 한정 허용 | Medium |

**테스트**: 140/140 pass ✅ | **커밋**: `f73ddef` (20 files, 405 insertions) | **npm**: v0.8.1 published

### Phase 4: v0.8.1 전체 재검증

#### 4.1 재설치 + Bootstrap
- v0.8.1 harness 교체 ✅
- State files 5/5 채움 (Artifact 4개 인식, brainstorming 제외)
- 토큰 예산 초과 발생 → "계속" 후 정상 완료

#### 4.2 Planner 재실행
- Plan: 4 Sprint, 16 Stories ✅
- **MANDATORY Write 여전히 미실행** ❌ — LLM 구조적 한계 확인

#### 4.3 Sprint-manager Fallback ✅
- 16 Stories 전부 반영
- Validation Tracker: KPI 6/6, FR 5/5, ARB Fail 3/3 매핑 완료

#### 4.4 S1-1: 프로젝트 스캐폴딩 구현

| 영역 | 경로 | 주요 구현 |
|------|------|-----------|
| Java API Server | `services/api-server/` | Spring Boot 3.3 WebFlux, Security, R2DBC, Kafka, JWT, OTEL |
| Python AI Engine | `services/ai-engine/` | FastAPI, pydantic-settings, LangChain 0.3, Milvus 2.4 |
| Frontend | `frontend/` | Next.js 14 App Router, Tailwind, Zustand 5, React Query 5 |
| Infra | `infra/docker-compose.yml` | PostgreSQL 16, Redis 7.2, Kafka 3.7 KRaft, ES 8.13, Milvus 2.4 |
| CI/CD | `.gitlab-ci.yml` | 3-stage, service-independent, change-based rules |
| Makefile | `Makefile` | infra-up/down/logs, test/lint/clean |

**Reviewer**: DONE_WITH_CONCERNS (MinIO deprecated env, Frontend 테스트 누락)
**Learn**: S1-1 done ✅, Pipeline 1사이클 완주

#### 4.5 S1-2: [ARB-FAIL] 개인정보보호 규정 준수 설계

| 유형 | 파일 | 내용 |
|------|------|------|
| 문서 | `docs/privacy/privacy-policy.md` | 개인정보 처리 방침 (수집 항목, 법적 근거, 보관 기간, 파기 절차) |
| 문서 | `docs/privacy/pia-plan.md` | PIA 수행 계획서 (5단계 8주, Sprint 연계, 행정안전부 절차) |
| Java | `PiiMasker.java` + Test | PII 5종 탐지/마스킹, record, JUnit 5 @Nested/@ParameterizedTest |
| Python | `pii.py` + Test | PII 5종 regex + NER 확장, 비식별화, pytest 15+ 케이스 |

**ARB Fail SEC-003 충족**: 3/3 권고사항 모두 ✅
**Reviewer**: DONE_WITH_CONCERNS (non-blocking 5건 → 전부 반영)
**Learn**: FP-005 생성, agent-memory 초기화, ARB-F1 → Resolved ✅

#### 4.6 Git Push — seongho dev 브랜치 ✅

실험 완료 후 사용자가 수동으로 push 실행:

```bash
git checkout -b dev
git add <all project files>
git commit -m "S1-1, S1-2: 프로젝트 스캐폴딩 + 개인정보보호 규정 준수 설계"
git push -u origin dev
```

| 항목 | 내용 |
|------|------|
| 브랜치 | `dev` 생성 및 origin push |
| 커밋 | `f44a804` — 66 files, 5,497 lines added |
| 원격 | https://github.com/KV000001-kodecrew-spinoff/seongho/tree/dev |

**발견된 Gap**: 2 사이클 동안 musher가 **한 번도 git push를 권장하지 않음**. 팀 협업 시 치명적 — v0.9.0에서 commit/push 가이드 추가 예정.

---

## 4. 코드 품질 전수 검증

> 실험 검증자가 생성된 코드를 직접 확인

### Java API Server

| 항목 | 평가 | 상세 |
|------|------|------|
| Spring Boot | ✅ | 3.3.5 (PRD 요구 충족) |
| Java 21 | ✅ | toolchain 설정 |
| WebFlux | ✅ | Reactive stack |
| Security | ✅ | @EnableWebFluxSecurity |
| R2DBC + Redis + Kafka | ✅ | Reactive DB + 메시징 |
| PII Masking | ✅ | 5종 pattern, record, final class |
| Observability | ✅ | Prometheus + OTEL |

### Python AI Engine

| 항목 | 평가 | 상세 |
|------|------|------|
| FastAPI | ✅ | lifespan 패턴 (modern) |
| LangChain/LangGraph | ✅ | 0.3/0.2 (PRD 정확) |
| Milvus/ES | ✅ | pymilvus 2.4, ES 8.13 |
| ruff + mypy strict | ✅ | py312 타겟 |
| PII Detection | ✅ | 5종 regex + NER 확장 |

### Frontend

| 항목 | 평가 | 상세 |
|------|------|------|
| Next.js 14 | ✅ | App Router, Turbopack |
| Zustand + React Query | ✅ | 상태관리 |
| 테스트 | ⚠️ | Jest 설정만 있고 파일 없음 |

### Infra

| 항목 | 평가 | 상세 |
|------|------|------|
| PostgreSQL 16 + Redis 7.2 | ✅ | healthcheck 포함 |
| Kafka 3.7 KRaft | ✅ | ZooKeeper 없는 최신 모드 |
| Milvus 2.4 | ✅ | etcd + MinIO 3-tier |

**종합**: PRD 기술 스택 **100% 반영**, production-ready 수준

---

## 5. 2사이클 완주 후 최종 상태

| 항목 | 수치 |
|------|------|
| Sprint 1 진행률 | 2/4 Stories done (50%) |
| ARB Fail Resolution | 1/3 resolved (SEC-003 ✅) |
| KPI/FR Coverage | 0/6, 0/5 (기능 구현 전) |
| Failure Patterns | 5개 (4 template + FP-005 active) |
| Git | `dev` 브랜치, `f44a804`, 66 files, 5,497 lines |

---

## 6. 핵심 인사이트

### 인사이트 1: LLM은 "지시"보다 "흐름"을 따른다

MANDATORY 섹션, Completion Check, 🧭 차단 — 3중 텍스트 강제에도 Planner는 state file write를 건너뛰었다. LLM은 "텍스트 생성 → 다음 블록 출력"이라는 자연스러운 completion 흐름을 따르며, 중간에 tool 호출(file edit)을 삽입하는 것은 텍스트 지시만으로 보장할 수 없다.

**해결책**: 지시 강화가 아니라 **defense-in-depth** (수신 agent의 fallback handler)

### 인사이트 2: Defense-in-Depth 패턴이 LLM Agent 핸드오프의 핵심

Planner(발신자)의 write가 실패해도 Sprint-manager(수신자)의 fallback handler가 보완하여 파이프라인이 정상 동작했다. LLM agent 시스템에서 **모든 핸드오프 지점에 수신자 측 fallback을 두는 것**이 신뢰성의 핵심 패턴이다.

### 인사이트 3: Validation Tracker가 🟣 Pipeline의 가치를 증명

KPI 6개, FR 5개, ARB Fail 3개 → 전부 Story ID로 추적 가능. 기존 crew 산출물만으로는 "어떤 Story가 어떤 KPI에 기여하는지" 추적이 불가능했지만, musher의 Validation Tracker가 이 Gap을 메웠다.

### 인사이트 4: 대규모 프로젝트의 토큰 예산 한계

Enterprise PRD (5K+ words)는 Bootstrap에서 토큰 예산을 초과한다. "계속" 버튼으로 이어갈 수 있지만 UX friction. 분할 실행 전략 필요.

### 인사이트 5: IDE UX 매핑은 실사용에서만 발견됨

"→ Call: planner", "Prompt example:" 같은 표현은 개발 중 문제 없지만, 실제 IDE에서 사용하면 "이걸 어떻게 호출하지?"라는 혼란을 일으킨다. **실증 실험 없이는 발견 불가능한 UX 이슈**.

### 인사이트 6: Scope + Reviewer = 품질 게이트

Sprint-manager Scope 안내 → Coding → "완료 후 reviewer를 호출해줘" 🧭 프롬프트 한 줄이 품질 게이트를 자연스럽게 삽입. Reviewer는 형식적 리뷰가 아닌 **유의미한 피드백** (MinIO deprecated env, 테스트 누락 등).

### 인사이트 7: 기술 스택 일관성 유지

PRD에 명시된 기술 스택(Java 21+Spring Boot 3.3, Python 3.12+FastAPI 등)이 crew 산출물 → planner Story → coding 구현까지 **무손실 전달**. musher 없이는 LLM이 임의로 기술 스택을 변경할 위험 존재.

### 인사이트 8: Git Commit/Push 가이드 부재

실험 2사이클 동안 musher가 **한 번도 git push를 권장하지 않음**. 사용자가 직접 dev 브랜치를 만들고 push. 팀 단위 작업에서는 자주 커밋/push가 필수.

**대응** (v0.9.0):
- `reviewer` Step 9: Commit Guidance (Story ID 커밋 메시지 + push 권장)
- `learn` Step 5.7: Git Push Check (미push 커밋 감지 및 경고)
- `sprint-manager`: Story done 시 commit/push reminder

---

## 7. 리스크 & 미티게이션

| 리스크 | 영향 | 결과 |
|--------|------|------|
| BMAD와 instruction 충돌 | copilot-instructions.md 덮어쓰기 | ✅ 해결 — overwrite 확인 |
| docs/ 구조 충돌 | crew 산출물과 state files 혼재 | ✅ 해결 — 서브디렉토리 분리 |
| 토큰 한계 | context window 초과 | ⚠️ 발생 — "계속" 우회 |
| AGENTS.md 덮어쓰기 | Codex 설정 손실 | ✅ 해결 — overwrite=N |
| LLM state write 미실행 | 핸드오프 데이터 누락 | ✅ 해결 — defense-in-depth |
| Git push 미수행 | 작업물 공유 누락 | ⚠️ 대응 예정 — v0.9.0 |
