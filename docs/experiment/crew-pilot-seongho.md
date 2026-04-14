# 🟣 Crew-Driven Pipeline 실증 실험 — KT AI 고객상담 자동화

> kode:crew 산출물 → kode:musher 실행 파일럿

## 1. 실험 개요

| 항목 | 내용 |
|------|------|
| **실험명** | kode:crew → kode:musher 실증 파일럿 (seongho) |
| **대상 프로젝트** | KT AI 고객상담 자동화 시스템 |
| **프로젝트 경로** | `/Users/jungchihoon/chihoon/kodevibe/seongho` |
| **예산 규모** | ₩15.6억/년 (Mission Critical, 24/7) |
| **kode:musher 버전** | v1.0.0 |
| **Pipeline** | 🟣 Crew-Driven (crew 산출물 기반 실행) |
| **Mode** | Solo |
| **Target IDE** | VS Code Copilot |

## 2. 실험 목적

1. **kode:crew 산출물 호환성 검증**: crew가 생성한 PRD, Product Brief, Architecture, ARB 체크리스트가 musher의 state files로 올바르게 매핑되는지 확인
2. **방향 정렬 검증**: musher의 direction guard가 crew 산출물의 방향성을 올바르게 반영하여 개발을 가이드하는지 검증
3. **프레임워크 공존 검증**: 기존 BMAD-METHOD (.bmad-core/) + 여러 IDE configs와 musher의 공존 가능성 확인
4. **실제 개발 가이드 품질**: musher가 enterprise-grade 프로젝트에서 실질적으로 유용한 가이드를 제공하는지 측정

## 3. 대상 프로젝트 현황

### 3.1 kode:crew 산출물 (입력)

| 산출물 | 경로 | 품질 |
|--------|------|------|
| PRD (Product Requirements) | `docs/PM/prd.md` | ⭐⭐⭐⭐⭐ (5K+ words, KPI/metrics 포함) |
| Product Brief | `docs/Analyst/product-brief.md` | ⭐⭐⭐⭐⭐ (시장분석, 경쟁자 분석 포함) |
| Conceptual Architecture | `docs/ARB/conceptual-architecture.md` | ⭐⭐⭐⭐⭐ (MSA, 기술 스택 상세) |
| ARB Checklist Result | `docs/ARB/arb-checklist-result.md` | ⭐⭐⭐⭐ (83.3% — 15 pass, 3 fail) |
| Brainstorming Session | `docs/brainstorming-session.md` | ⭐⭐⭐⭐ (전략 워크샵 결과) |

### 3.2 기존 프레임워크 (공존 대상)

| 프레임워크 | 경로 | 규모 |
|------------|------|------|
| BMAD-METHOD | `.bmad-core/` | 10 agents, 12+ tasks, 13 templates, 6 checklists |
| Claude Code | `.claude/` | commands, rules |
| Cursor | `.cursor/` | rules |
| Windsurf | `.windsurf/` | rules |
| Codex / OpenAI | `AGENTS.md`, `opencode.jsonc` | full agent mapping |
| Gemini | `.gemini/` | - |
| GitHub Chatmodes | `.github/chatmodes/` | - |

### 3.3 기술 스택

- **Backend**: Java 21 + Spring Boot 3.3, Python 3.12 + FastAPI
- **Frontend**: Next.js 14
- **Infra**: Kafka 3.7, Redis 7.2, PostgreSQL, K8s (KT G-Cloud)
- **AI/ML**: GPT-4 + Claude API, Milvus 2.4, LangChain 0.3 + LangGraph 0.2
- **Monitoring**: ELK + Prometheus + Grafana + Jaeger

### 3.4 ARB Fail Items (미해결)

| ID | 항목 | 상태 |
|----|------|------|
| SEC-003 | 개인정보보호법 compliance 상세 미비 | 미티게이션 플랜 제출됨 |
| DEP-003 | 성능 테스트 계획 미비 | k6/JMeter 시나리오 설계 필요 |
| AI-001 | AI 모델 거버넌스 미비 | MLOps 파이프라인 정의 필요 |

## 4. 실험 절차

### Phase 1: musher 설치 및 bootstrap

```bash
# 1. musher 초기화 (VS Code, Solo 모드)
cd /Users/jungchihoon/chihoon/kodevibe/seongho
npx musher-engineering init --ide vscode --mode solo

# 2. Bootstrap 실행 — AI에게 요청
# "Run bootstrap to onboard this project"
```

**검증 항목**:
- [ ] 기존 BMAD-METHOD 파일들과 충돌 없이 설치 완료
- [ ] `.github/copilot-instructions.md` 생성 확인
- [ ] `.github/skills/`, `.github/agents/` 생성 확인
- [ ] `docs/` 하위 state files 생성 (기존 crew 산출물과 공존)
- [ ] bootstrap이 crew 산출물을 인식하여 state files를 채우는지 확인

### Phase 2: crew 산출물 → musher state 매핑

| crew 산출물 | → musher state file | 매핑 방식 |
|-------------|---------------------|-----------|
| `docs/PM/prd.md` | `docs/project-brief.md` | PRD의 핵심 방향, 비전, 제약사항 추출 |
| `docs/PM/prd.md` | `docs/features.md` | MVP 5대 기능을 feature registry에 등록 |
| `docs/ARB/conceptual-architecture.md` | `docs/dependency-map.md` | MSA 컴포넌트를 모듈로 매핑 |
| `docs/ARB/arb-checklist-result.md` | `docs/failure-patterns.md` | ARB fail items를 known risk로 등록 |
| `docs/Analyst/product-brief.md` | `docs/project-brief.md` | 시장 컨텍스트, 경쟁 포지셔닝 보강 |

### Phase 3: 방향 정렬 검증

musher의 direction guard가 올바르게 작동하는지 테스트:

1. **정방향 테스트**: "AI 챗봇 자동응답 엔진의 API 설계를 시작해줘" → musher가 PRD의 요구사항에 맞게 가이드하는지 확인
2. **역방향 테스트**: "음성 봇 기능을 추가해줘" → musher가 MVP scope 외임을 인식하고 경고하는지 확인  
3. **ARB 연계 테스트**: "성능 테스트 계획을 수립해줘" → ARB fail item (DEP-003)과 연계하여 가이드하는지 확인

### Phase 4: Agent 활용 검증

| Agent | 테스트 시나리오 |
|-------|----------------|
| `planner` | MVP 5대 기능을 Story로 분해 요청 |
| `architect` | MSA 구조에 대한 설계 리뷰 요청 |
| `reviewer` | 생성된 코드에 대한 품질/보안 리뷰 요청 |
| `sprint-manager` | Sprint 진행 상황 트래킹 요청 |

## 5. 성공 기준

| # | 기준 | 측정 방법 | 목표 |
|---|------|-----------|------|
| 1 | 설치 무충돌 | musher init 성공 + 기존 파일 무손상 | 100% |
| 2 | Bootstrap 인식률 | crew 산출물 5개 중 state에 반영된 수 | ≥ 4/5 |
| 3 | 방향 정렬 정확도 | 정방향 3개 + 역방향 2개 테스트 통과율 | ≥ 80% |
| 4 | Agent 유용성 | 4개 Agent 테스트 중 실질적 도움된 수 | ≥ 3/4 |
| 5 | 프레임워크 공존 | BMAD + musher 동시 사용 가능 여부 | Yes |

## 6. 리스크 & 미티게이션

| 리스크 | 영향 | 미티게이션 |
|--------|------|-----------|
| BMAD와 instruction 충돌 | copilot-instructions.md 덮어쓰기 | 기존 .bmad-core/ 명령과 musher 명령 분리 확인 |
| docs/ 디렉토리 구조 충돌 | crew 산출물과 state files 혼재 | docs/ 하위 구조 사전 확인, 서브디렉토리로 분리 |
| 대규모 프로젝트 토큰 한계 | context window 초과 | state files를 간결하게 유지 |
| AGENTS.md 덮어쓰기 | Codex용 기존 AGENTS.md 손실 | vscode IDE 선택 시 AGENTS.md 미변경 확인 |

## 7. 실험 일지

### 2026-04-14 Phase 1 — 설치

**명령**: `npx musher-engineering init --ide vscode --mode solo`
**결과**: ✅ 성공

- `musher-engineering@0.8.0` 설치
- 기존 `AGENTS.md` (BMAD용) 감지 → overwrite 프롬프트 표시 (UX 문제 발견 → 수정 반영)
- N 선택 → 기존 파일 무손상, 새 파일만 생성
- 생성 확인: `.github/copilot-instructions.md`, `.github/skills/` × 10, `.github/agents/` × 4
- `docs/` state files × 5 + `agent-memory/` × 4 생성
- 기존 BMAD-METHOD (`.bmad-core/`, `.claude/`, `.cursor/`, `.windsurf/`, `AGENTS.md`) 전부 무손상 ✅
- **설치 무충돌 검증: PASS**

**발견된 UX 문제** (즉시 수정):
- `detectExistingInstall()`이 `AGENTS.md`를 Musher 파일로 오탐 (BMAD 꺼)
- overwrite 프롬프트가 영향 범위 불명확
- → 3가지 수정 (오탐 방지, 영향 범위 표시, 안내 문구) 적용, 140 tests pass

### 2026-04-14 Phase 2 — Bootstrap (🟣 Crew Pipeline)

**프롬프트**: "Run bootstrap to onboard this project"
**결과**: ✅ 성공 — 🟣 Pipeline 자동 진입

**Bootstrap 질문 3개**:
1. "Crew 산출물 5개를 기반으로 Artifact Index + Validation Tracker를 생성하겠습니다. 맞나요?" → **Yes** (🟣 Pipeline 선택)
2. "이 프로젝트의 구현 기술 스택은 무엇인가요?" → **아키텍처 문서대로** (Java+Spring Boot, Python+FastAPI, Next.js)
3. "테스트 프레임워크/명령어를 알려주세요." → **JUnit 5 + pytest**

**State Files 채움 결과**:

| State File | 채움 상태 | 주요 내용 |
|------------|-----------|-----------|
| `project-brief.md` | ✅ 완전 채움 | Vision, Goals(5), Non-Goals(6), Target Users(4), Artifact Index(5), Validation Tracker (KPI 6개, ARB Fail 3개, FR 5개), Key Technical Decisions (12개 기술 스택) |
| `features.md` | ✅ 채움 | FR-001~005 등록 (모두 ⬜ planned) |
| `dependency-map.md` | ✅ 채움 | 9개 모듈 (chat-service, ai-inference, routing-service, agent-assistant, dashboard, icis-integration, bms-integration, knowledge-base, api-gateway) |
| `project-state.md` | ✅ 채움 | Sprint 0 완료, Quick Summary 작성, Module Registry 9개 |
| `failure-patterns.md` | ✅ 템플릿 유지 | FP-001~004 Template (정상) |

**Crew 산출물 인식률**: 5/5 (100%) — PRD, Product Brief, Architecture, ARB Checklist, Brainstorming 전부 인덱싱
**원본 파일 무수정**: ✅ 확인 (crew 산출물 5개 모두 원본 유지)
**네비게이션 안내**: "→ Call: planner" 표시 (후에 UX 개선 대상 발견 → Phase 3에서 기록)

**Bootstrap 인식률 검증: PASS (5/5 = 100%, 목표 ≥ 4/5)**

### 2026-04-14 Phase 3 — Planner 실행 및 UX 문제 발견

**프롬프트**: "crew 기반으로 기능을 계획해줘"
**결과**: ⚠️ 계획 생성 성공, 상태파일 반영 실패

**Planner 동작 요약**:
- crew 산출물 5개를 정확하게 읽고 FR-001~005를 Story로 분해 ✅
- KPI 매핑, ARB Fail → P0 Story 매핑 정상 ✅
- Plan Confirmation Gate 작동 → "이 경로대로 진행할까요?" 질문 ✅
- 사용자 승인 후 **state files에 반영하지 않음** ❌ (Steps 13-14 미실행)
- 바로 🧭 Next Step 출력 → sprint-manager 안내

**Sprint-manager 동작 요약**:
- Planner가 state files에 쓰지 않아 Stories가 없음
- "No stories exist" 상태 감지
- 계획을 직접 반영하는 핸들러 없음 → planner 재호출 권장만 출력

**발견된 UX/기능 문제 5가지**:

| # | 문제 | 영향 | 심각도 |
|---|------|------|--------|
| A | `→ Call: planner` 표현이 실제 IDE 사용법과 불일치 | 사용자가 호출 방법을 모름 (슬래시 메뉴? 채팅 입력?) | Medium |
| B | `Prompt example:` 용어가 불일관 (일부는 "Prompt:", 일부는 "Prompt example:") | 혼란 | Low |
| C | Planner가 승인 후 state files에 쓰지 않음 (Steps 13-14 미실행) | Agent 간 핸드오프 broken | Critical |
| D | Sprint-manager에 planner plan 반영 핸들러 없음 | planner→sprint-manager 핸드오프 시 state 누락 | High |
| E | Sprint-manager 제약 "Only write to project-state.md" 때문에 Validation Tracker 보완 불가 | 🟣 pipeline 누수 | Medium |

### 2026-04-14 Phase 3.5 — 문제 수정 (musher 코드 패치)

> 발견된 5가지 문제를 즉시 수정 반영

**수정 A: 네비게이션 호출 방식 통일** ✅
- 전체 harness 파일 (agent 4개 + skill 10개 + core-rules + template 2개) 수정
- `→ Call: {agent}` → `→ Next: {agent} (슬래시 메뉴에서 선택하거나, 채팅에 프롬프트 입력)`
- 사용자에게 실제 IDE operation을 명시

**수정 B: "Prompt example:" → "Prompt:" 통일** ✅
- 전체 harness/template 파일 13개에서 통일
- 사용자가 바로 복사-붙여넣기할 수 있는 형태로 단순화

**수정 C: Planner MANDATORY Post-Approval State File Write** ✅
- `harness/agents/planner.md`에 `### ⚠️ MANDATORY: Post-Approval State File Write` 섹션 추가
- 승인 후 features.md, project-state.md, dependency-map.md, project-brief.md 순서로 필수 Write
- Completion Check 체크리스트 포함
- "🧭 Next Step 출력 전에 반드시 모든 Write 완료" 강제

**수정 D: Sprint-manager Plan 반영 핸들러** ✅
- `harness/agents/sprint-manager.md`에 `"plan approved" / "플랜 반영해줘"` 핸들러 추가
- Planner가 state files에 쓴 경우 → 정상 진행
- Planner가 state files에 안 쓴 경우 → sprint-manager가 보완 (대화 context에서 plan 추출하여 반영)
- 🟣 pipeline: Validation Tracker 보완까지 포함

**수정 E: Sprint-manager 제약 범위 확장 검토** ⬜
- 현재 "Only write to project-state.md" 제약 유지
- Plan 반영 핸들러에서 project-brief.md Validation Tracker 보완 허용 (🟣 pipeline 한정)
- 향후 더 넓은 범위가 필요하면 별도 Story로 추적

**수정 후 테스트**: 140/140 ALL PASS ✅

### [날짜] Phase 4 — Agent 검증 (재실행)

> (수정 후 재실행 시 기록 — Phase 3에서 발견된 문제를 수정한 후 재검증 필요)

## 8. 결론 & 인사이트

### 중간 결론 (Phase 1-3 완료 기준)

**성공 기준 달성 현황**:

| # | 기준 | 결과 | 달성 |
|---|------|------|------|
| 1 | 설치 무충돌 | musher init 100% 성공, 기존 7개 프레임워크 무손상 | ✅ PASS |
| 2 | Bootstrap 인식률 | 5/5 (100%) — crew 산출물 전부 인식 및 매핑 | ✅ PASS |
| 3 | 방향 정렬 정확도 | 미검증 (Phase 4에서 진행) | ⬜ TBD |
| 4 | Agent 유용성 | Planner ⚠️ (계획은 정확하나 state 반영 실패), Sprint-manager ⚠️ | 🔄 수정 후 재검증 |
| 5 | 프레임워크 공존 | 7개 프레임워크와 무충돌 공존 확인 | ✅ PASS |

### 핵심 인사이트

1. **LLM 행동 불확실성**: "Steps 13-14 실행" 같은 절차적 지시만으로는 LLM이 실행을 보장하지 않음. **MANDATORY + Completion Check + 🧭 차단** 3중 강제가 필요
2. **Agent handoff의 약점**: Agent간 핸드오프 시 "state files에 반영됨" 가정이 깨지면 전체 파이프라인 정지. 수신 agent에 fallback 핸들러 필수
3. **IDE UX Mapping 중요성**: "→ Call:" 같은 추상적 표현은 실제 IDE 조작법 (슬래시 메뉴, 채팅 입력)과 괴리. 사용자 가이드에서 IDE operation 명시 필수
4. **Crew 산출물 호환성**: 5/5 인식 + 무수정 공존은 매우 긍정적. kode:crew → kode:musher pipeline의 핵심 가치 입증
