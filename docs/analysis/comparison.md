# BMAD vs gstack vs K-Harness 비교 분석

> 최종 갱신: 2026-04-02
> BMAD v6.2.2 (43.2k ⭐, 132 contributors) | gstack v0.15.1 (60.9k ⭐, 26 contributors) | K-Harness v0.4.0

---

## 1. 핵심 비교표

| 차원 | BMAD v6.2.2 | gstack v0.15.1 | K-Harness |
|------|-------------|---------------|-----------|
| **목적** | 기업형 Agile AI 개발 방법론 | 1인 소프트웨어 팩토리 | 프로젝트 방향성 관리 프레임워크 |
| **파일 수** | 200+ (매니페스트, 에이전트, 워크플로우, 태스크, 지식) | ~31 skill + 10 support | 15 (8 skill + 3 agent + 3 rules + 5 state) |
| **에이전트** | 12+ (Analyst, Architect, Dev, PM, SM, TEA, UX...) | 0개 (skill이 역할 내장) | 3개 (planner, reviewer, sprint-manager) |
| **워크플로우/스킬** | 34+ workflows (4단계 phase-gate) | 31 skills (선형 파이프라인) | 8 skills |
| **모듈** | 5개 (BMM, BMB, TEA, BMGD, CIS) | 없음 | 없음 |
| **연결 방식** | CSV 매니페스트 → YAML → MD 간접 참조 | 출력물을 다음 skill이 직접 읽음 | skill → state file 직접 참조 |
| **학습** | 없음 (세션 독립) | `/learn` 세션 간 누적 | `learn` skill + failure-patterns.md |
| **IDE 지원** | 20+ (platform-codes.yaml에 정의) | 5 (Claude Code, Codex, Gemini CLI, Cursor, Factory Droid) | 7 (VS Code, Claude, Cursor, Codex, Windsurf, Augment, Antigravity) |
| **IDE 통합 방식** | installer가 IDE별 설정 생성 | `./setup --host` flag로 IDE별 SKILL.md 생성 | IDE 네이티브 포맷으로 생성 (.instructions.md, .mdc, SKILL.md 등) |
| **프로젝트 관리** | 풍부 (Epic/Story/Sprint/Phase-Gate) | 없음 | 경량 (5 state files + sprint 추적) |
| **방향 변경 관리** | 없음 | 없음 | `pivot` skill (state file 횡단 갱신) |
| **의사결정 기록** | 없음 (문서에 흩어짐) | 없음 | Decision Log (project-brief.md 내장) |
| **Cold Start** | 없음 | 없음 | `bootstrap` skill |
| **안전장치** | 없음 | `/careful`, `/freeze`, `/guard` | 없음 (범위 외) |
| **브라우저/배포** | 없음 | `/browse`, `/qa`, `/ship`, `/land-and-deploy` | 없음 (범위 외) |
| **의존성** | Node 20+ | Bun + Node + Playwright | Node 18+ (zero dep) |
| **설치** | `npx bmad-method install` | `git clone && ./setup` | `npx k-harness init` |
| **LLM 컨텍스트 비용** | 작업당 4~6 파일 | 작업당 1 파일 | 작업당 2~3 파일 |

---

## 2. BMAD에서 가져온 것

### ✅ Sprint/Story 추적 체계
BMAD의 `sprint-status.yaml` + `docs/bmad/stories/` 구조에서 착안.
다만 86개 story 파일은 과도 → **project-state.md 단일 파일**로 축소.

### ✅ Adversarial Review 개념
`check-implementation-readiness` 같은 "의도적으로 challenge하는" 워크플로우 → reviewer agent에 반영.

### ✅ Phase-Gate의 핵심 아이디어
"요구사항이 확정되기 전에 구현하지 않는다" → planner의 Direction Alignment 단계로 구현.

### ✅ 프로젝트 방향 관리 철학
BMAD의 체계적 SDLC 관리에서 "방향성 관리"만 추출 →
`project-brief.md` (Vision/Goals/Non-Goals/Decision Log) + `pivot` skill로 구현.

---

## 3. gstack에서 가져온 것

### ✅ 1 Skill = 1 File 원칙
LLM 컨텍스트 효율의 핵심. 매니페스트 기반 간접 참조 완전 배제.

### ✅ 파이프라인 자동 연결
각 단계의 출력이 다음 단계의 입력으로 명시적으로 연결되는 구조.
`bootstrap → planner → [code] → reviewer → sprint-manager → learn`

### ✅ /learn 학습 메커니즘
세션 간 학습 누적으로 반복 실패 자동 방지.

### ✅ /review의 자동 수정 패턴
"명백한 건 auto-fix, 판단 필요한 건 [ASK]" → reviewer agent에 반영.

---

## 4. 양쪽 모두에서 버린 것

### ❌ BMAD: 매니페스트 시스템 + 역할 과잉
CSV/YAML 매니페스트 + 12+ 에이전트는 LLM 컨텍스트 과부하. 파일 시스템 convention이 레지스트리 역할.

### ❌ BMAD: 테스트 지식 30개 파일
일반적 지식 → **실제 발생한 실패 패턴**만 failure-patterns.md에 관리.

### ❌ gstack: 런타임 의존 기능
Playwright 브라우저, 배포 자동화, Chrome Side Panel은 K-Harness의 "zero dep, 순수 markdown" 범위 밖.
이들은 "코드 작성 바깥의 일"이며, K-Harness는 "프로젝트 방향 관리 → 올바른 코드 작성"에 집중.

### ❌ gstack: Claude Code 종속 기능
hooked commands, hook-based safety skills 등은 Claude Code 전용.

---

## 5. K-Harness 고유 강점

### 🔹 프로젝트 방향성 관리 (BMAD에도 gstack에도 없음)
- `project-brief.md`: Vision, Goals, Non-Goals, **Decision Log**
- `pivot` skill: 방향 변경 시 ALL state files 횡단 갱신
- planner의 **Direction Alignment**: 새 기능 요청 vs 프로젝트 방향 대조

### 🔹 Cold Start 해결 (BMAD에도 gstack에도 없음)
- `bootstrap` skill: 프로젝트 스캔 → 인터뷰 → state file 자동 작성

### 🔹 IDE 네이티브 생성
BMAD와 gstack은 자체 포맷(manifest/SKILL.md)을 IDE에 맞추는 방식.
K-Harness는 **각 IDE의 네이티브 포맷**으로 직접 생성:
- VS Code: `.instructions.md` + `.agent.md`
- Cursor: `.mdc` rules
- Claude: `CLAUDE.md` + claude skills
- Codex: `AGENTS.md` + agents skills
- 각 IDE가 자체적으로 인식하는 표준 포맷

### 🔹 Zero Dependencies
- BMAD: Node 20+, installer binary
- gstack: Bun + Node + Playwright (수백 MB)
- K-Harness: `npm install` 한 줄 (0 dependencies)

### 🔹 State File Architecture
5개 파일로 프로젝트 지속성 관리:
| 파일 | 역할 |
|------|------|
| project-brief.md | 방향 (Vision/Goals/Non-Goals/Decision Log) |
| features.md | 기능 목록 + 상태 |
| dependency-map.md | 모듈 의존성 |
| project-state.md | 현재 Sprint/Story 상태 |
| failure-patterns.md | 반복 실패 패턴 |

---

## 6. K-Harness 설계 제약 조건

| 제약 | 근거 |
|------|------|
| LLM이 읽는 파일 ≤ 3개 | 컨텍스트 윈도우 효율 |
| 에이전트 ≤ 3개 | 1~3인 팀 적합 |
| 매니페스트 파일 0개 | 파일 시스템 convention이 레지스트리 |
| Sprint 관리 파일 1개 | 현재 sprint만 추적 |
| 실패 패턴 체크리스트 ≤ 10개 | 실전에서 검증된 것만 |
| 모든 IDE 네이티브 포맷 생성 | IDE가 자체 인식하는 표준 사용 |
| Zero dependencies | 설치 장벽 최소화 |
