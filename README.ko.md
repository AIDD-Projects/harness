<div align="right">
  <a href="README.md"><img src="https://img.shields.io/badge/lang-English-blue.svg" alt="English"></a>
</div>

# kode:harness

[![npm version](https://img.shields.io/npm/v/@kodevibe/harness.svg)](https://www.npmjs.com/package/@kodevibe/harness)
[![npm downloads](https://img.shields.io/npm/dm/@kodevibe/harness.svg)](https://www.npmjs.com/package/@kodevibe/harness)
[![CI](https://github.com/AIDD-Projects/harness/actions/workflows/ci.yml/badge.svg)](https://github.com/AIDD-Projects/harness/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **AI 코딩 에이전트는 세션이 끝나면 모든 것을 잊습니다. kode:harness는 목표, 결정, 실패, 프로젝트 방향을 기억하게 합니다.**

AI 코딩 에이전트를 위한 프로덕션급 가드레일. 컨텍스트 부패를 방지하고, 프로젝트 방향을 강제하며, 세션 간 상태를 유지합니다. **Copilot, Claude, Cursor, Codex, Windsurf, Gemini** 지원. 의존성 제로.

---

## 빠른 시작

```bash
npx @kodevibe/harness init          # IDE 선택
```

```bash
# 그 후 AI 에이전트에게:
> "setup을 실행해서 이 프로젝트를 온보딩해줘."
```

끝입니다. 이제 AI는 영속적인 메모리, 방향 가드레일, 자기 교정 루프를 갖게 됩니다.

<details>
<summary>추가 설치 옵션</summary>

```bash
# Team 모드 (멀티 개발자 방향 정렬)
npx @kodevibe/harness init --team

# 비대화형 (CI/스크립트)
npx @kodevibe/harness init --ide vscode
npx @kodevibe/harness init --ide claude
npx @kodevibe/harness init --ide cursor
npx @kodevibe/harness init --ide codex
npx @kodevibe/harness init --ide windsurf
npx @kodevibe/harness init --ide antigravity
```

| 플래그 | 설명 |
|--------|------|
| `--ide <이름>` | 대상 IDE: `vscode`, `claude`, `cursor`, `codex`, `windsurf`, `antigravity` |
| `--mode <모드>` | 프로젝트 모드: `solo` (기본) 또는 `team` |
| `--dir <경로>` | 대상 디렉토리 (기본: 현재 디렉토리) |
| `--team` | `--mode team`의 축약형 |
| `--batch` | 비대화형 모드 (`--ide` 필수, solo 모드 기본) |
| `--overwrite` | 기존 파일 덮어쓰기 (state 파일 포함) |
| `--version` | 버전 번호 표시 |

</details>

---

## 문제: 컨텍스트 부패 (Context Rot)

AI 코딩 에이전트는 매 세션 제로에서 시작합니다. 세션 3에서는 세션 1의 아키텍처 결정을 잊고, 세션 10에서는 이미 확정된 사항을 다시 논의하며 자신의 이전 작업과 모순됩니다.

팀에서는 더 심각합니다 — 개발자 A의 AI는 마이크로서비스로 리팩토링하고, 개발자 B의 AI는 모놀리스를 강화합니다. **공유 가드레일 없이는 AI 에이전트가 프로젝트를 분리시킵니다.**

kode:harness는 세 가지 메커니즘으로 해결합니다:

| 메커니즘 | 방지하는 문제 |
|---------|-------------|
| **상태 영속성** | AI가 세션 간 목표, 결정, 진행 상황을 잊는 것 |
| **방향 가드** | AI가 프로젝트 목표에서 이탈하거나 과거 결정과 모순되는 것 |
| **실패 패턴** | AI가 세션 간 같은 실수를 반복하는 것 |

---

## 왜 그냥 ...을 쓰면 안 되나요?

| 접근법 | 한계 | kode:harness 차이점 |
|--------|------|---------------------|
| **`.cursorrules` / `copilot-instructions.md`** | 정적. 상태 영속성 없음, 자기 교정 없음, 세션 간 기억 없음. | 매 세션 업데이트되는 살아있는 state 파일. Direction Guard가 매 요청을 목표와 대조. |
| **LangChain / CrewAI** | AI 앱 구축용 런타임 오케스트레이션. AI 코딩 에이전트 방향 관리용이 아님. | IDE 안에서 작동하는 마크다운 네이티브 가드레일. 런타임 없음, SDK 없음. |
| **BMAD / gstack / GSD** | 1인 개발자용. 200+ 파일. 방향 관리 없음. | ~25개 파일 (~17K 토큰). Direction Guard + Decision Log. 멀티 개발자 팀 지원. |
| **"조심하면 되지"** | 잊을 때까지만 동작. LLM은 과거 세션에서 배우지 않음. | 자동화: `wrap-up`이 교훈 캡처, `debug`가 실패 추적, `reviewer`가 state 감사. |

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 🛡️ **Direction Guard** | 모든 코딩 요청을 프로젝트 목표/비목표와 대조 후 실행 |
| 🧭 **Navigation Dispatcher** | 5개 파이프라인을 따라 다음 단계 프롬프트를 자동 안내 |
| 📝 **상태 영속성** | LLM 세션 간 프로젝트 지식을 유지하는 5개 마크다운 파일 |
| 🔄 **5개 파이프라인** | 🟢 신규 → 🔵 계속 → 🔴 버그 수정 → 🟡 방향 전환 → 🟣 Crew 기반 |
| 🛠️ **10개 스킬** | 단계별 절차: setup, debug, breakdown, review, pivot 등 |
| 🤖 **4개 에이전트** | 역할 기반 페르소나: pm, reviewer, lead, architect |
| ⚠️ **실패 패턴** | 세션 간 같은 실수를 방지하는 프로젝트별 실패 기록 |
| 📋 **Decision Log** | 결정의 이유를 기록해 LLM이 확정된 사항을 재논의하지 않도록 방지 |
| 🟣 **Crew Artifact Integration** | 외부 기획 산출물 (PRD, Architecture, ARB Checklist) 직접 읽기 |

---

## 헬스체크

```bash
npx @kodevibe/harness doctor    # 파일 설치 상태 확인
npx @kodevibe/harness validate  # state 파일에 실제 내용 확인
```

---

## 지원 IDE

| IDE | 디스패처 (always-on) | 스킬 | 에이전트 |
|-----|---------------------|------|----------|
| **VS Code Copilot** | `.github/copilot-instructions.md` | `.github/skills/*/SKILL.md` | `.github/agents/*.agent.md` |
| **Claude Code** | `CLAUDE.md` (+ `.claude/rules/core.md`) | `.claude/skills/*/SKILL.md` | `.claude/agents/*.md` |
| **Cursor** | `.cursor/rules/core.mdc` (+ `AGENTS.md`) | `.agents/skills/*/SKILL.md` (cross-tool) | `.cursor/rules/<agent>.mdc` |
| **Codex** | `AGENTS.md` | `.agents/skills/*/SKILL.md` | `.codex/agents/*.toml` |
| **Windsurf** | `.windsurf/rules/core.md` | `.windsurf/skills/*/SKILL.md` | *(스킬로 설치)* |
| **Antigravity** | `AGENTS.md` | `.agents/skills/*/SKILL.md` (cross-tool) | `.agents/rules/<agent>.md` |

모든 IDE에 `docs/` 디렉토리에 State 파일(`project-state.md`, `project-brief.md`, `features.md`, `failure-patterns.md`, `dependency-map.md`)도 함께 설치됩니다.

---

## 설치되는 파일 구성

### 디스패처 (항상 활성)

- **Core Rules** — 136줄 디스패처: 세션 시작 가이드, 워크플로 참조, state 파일 목록, Iron Laws. 상세 규칙은 각 스킬/에이전트에 임베딩되어 있습니다.

### 스킬 (온디맨드 절차)

| 스킬 | 설명 |
|------|------|
| **setup** | 프로젝트를 kode:harness에 온보딩: 코드베이스 스캔 + state 파일 자동 작성 |
| **wrap-up** | 세션 종료 시 마무리: 실패 패턴 캡처, 프로젝트 상태 업데이트, 방향 드리프트 감지 |
| **pivot** | 목표·기술·범위 변경 시 모든 state 파일에 변경사항 전파 |
| **sync-tests** | 커밋 전 mock/인터페이스 동기화 검증 |
| **secure** | 커밋 전 보안 위험 스캔 |
| **debug** | 4단계 체계적 디버깅 (증거 → 범위축소 → 수정 → 검증) |
| **check-impact** | 공유 모듈 수정 전 영향 범위 평가 |
| **breakdown** | 기능을 의존성 순서대로 구현 태스크로 분해 |
| **pr-review** | PR 코드 리뷰: 품질, 보안, 방향 정렬 확인 |
| **release** | 배포 전 검증 체크리스트 (테스트, state 파일, 보안, 버전) |

### 에이전트 (역할 기반 페르소나)

| 에이전트 | 역할 |
|---------|------|
| **pm** | 기능 기획, 의존성 분석, Direction Alignment (목표/비목표/결정사항 체크) |
| **reviewer** | 코드 리뷰 + State 파일 감사 (state 파일이 실제로 업데이트되었는지 검증) |
| **lead** | 스프린트/스토리 상태 관리, 범위 이탈 방지, 다음 단계 추천 |
| **architect** | 설계 리뷰 게이트: 구조 변경이 프로젝트 방향 및 모듈 경계에 부합하는지 검증 |

### State 파일 (프로젝트 메모리)

| 파일 | 역할 |
|------|------|
| **project-brief.md** | 프로젝트 비전, 목표, 비목표, Decision Log ("왜"에 대한 기록) |
| **project-state.md** | 현재 스프린트, 스토리, 진행 상황 추적 ("어디"에 대한 기록) |
| **features.md** | LLM이 무엇이 존재하는지 알 수 있는 살아있는 기능 레지스트리 ("무엇"에 대한 기록) |
| **dependency-map.md** | 영향 분석을 위한 모듈 의존성 그래프 ("어떻게"에 대한 기록) |
| **failure-patterns.md** | 반복 실수를 방지하는 프로젝트별 실패 패턴 ("주의사항") |

---

## 작동 방식

### 1단계: Bootstrap (최초 1회)

`harness init` 후 `setup` 스킬을 실행합니다. 코드베이스를 스캔하고, 목표/비목표에 대해 질문한 후, 5개 state 파일을 자동으로 채웁니다. **가장 중요한 단계입니다** — 이것 없이는 Direction Guard 등 다른 스킬이 컨텍스트를 가지지 못합니다.

### 2단계: Direction Guard (매 요청마다)

모든 코딩 요청 전에 LLM이 `project-brief.md`를 읽고 확인합니다:

- 목표(Goals)에 부합하는가? → 진행
- 비목표(Non-Goals)에 해당하는가? → 경고, `pivot` 제안
- Decision Log의 결정사항과 모순되는가? → 경고, `pivot` 제안

### 3단계: Workflow Pipeline

```
setup → pm → [코딩] → reviewer → lead → wrap-up
```

kode:harness는 상황별 **5개 파이프라인**을 제공합니다:

| 파이프라인 | 상황 | 흐름 |
|---|---|---|
| 🟢 New Dev | 첫 기능 개발 | setup → pm → lead → [코딩] → reviewer → wrap-up |
| 🔵 Continue | 작업 재개 | lead → [코딩] → reviewer → wrap-up |
| 🔴 Bug Fix | 디버깅 | debug → [수정] → reviewer → wrap-up |
| 🟡 Direction Change | 목표/기술 변경 | pivot → pm → lead → [코딩] → reviewer → wrap-up |
| 🟣 Crew-Driven | 외부 기획 산출물 | setup(crew) → pm → lead → [코딩] → reviewer → wrap-up |

각 단계 완료 시 🧭 **Navigation 블록**이 다음에 무엇을 해야 하는지 — 입력할 프롬프트까지 안내합니다.

- **pm**: 방향 정렬 확인, 기능 분해. **Confirm-First 게이트** — 사용자 승인 없이 진행하지 않음.
- **reviewer**: 코드 리뷰 + state 파일 업데이트 감사
- **lead**: **Wave-Level Pacing** — 구현 Wave 사이에 자동 테스트 실행
- **wrap-up**: 세션 종료 전 교훈 캡처
- **debug**: **Recalculating Mode** — 3회 실패 후 대안 접근법 제시

### 4단계: 방향 전환 (Direction Changes)

목표, 기술, 범위가 변경될 때 `pivot` 스킬을 실행합니다:

- 모든 5개 state 파일을 일괄 업데이트
- Decision Log에 결정 사유를 기록
- 파일 간 불일치를 방지

---

## Team 모드

**harness engineering이 가장 중요한 지점입니다.** 여러 개발자가 각자 AI 세션을 실행하면 방향 이탈은 필연적입니다 — 공유 가드레일이 없다면.

```bash
npx @kodevibe/harness init --team
```

| | Solo 모드 | Team 모드 |
|---|---|---|
| 공유 상태 | `docs/` (git 추적) | `docs/` (git 추적): project-brief, features, dependency-map |
| 개인 상태 | `docs/` (git 추적) | `.harness/` (gitignored): project-state, failure-patterns |
| 에이전트 메모리 | `docs/agent-memory/` | `.harness/agent-memory/` |
| 대상 | 1인 개발자 | 기업 팀 |
| 팀 규칙 | — | Pre-Pull, Owner, Read-Only, Append-Only, Pivot Lock, FP Promotion |

### 팀 방향 정렬 메커니즘

- **공유 상태** (`project-brief.md`, `features.md`, `dependency-map.md`)는 git 추적 — 모든 개발자의 AI가 동일한 목표, 비목표, 결정사항을 읽습니다
- **개인 상태** (`project-state.md`, `failure-patterns.md`)는 `.harness/`로 격리 (gitignored) — 각 개발자가 충돌 없이 자신의 스프린트 진행 상황을 추적
- **Pre-Pull Protocol** — 매 세션 시작 전, AI가 최신 공유 상태를 pull하여 오래된 방향으로 작업하지 않도록 방지
- **Pivot Lock** — 방향 전환은 반드시 `pivot` 스킬을 통해 수행, 모든 state 파일을 원자적으로 업데이트하고 결정 사유를 기록
- **FP Promotion** — 로컬 실패 패턴을 공유 `failure-patterns.md`로 승격하여 팀 전체가 각 개발자의 실수로부터 학습
- **Owner Tracking** — 의존성 맵에 모듈 소유자를 표시하여 교차 팀 덮어쓰기를 방지

---

## Iron Laws

8개 규칙이 모든 스킬과 에이전트에 적용됩니다. kode:harness로 관리되는 프로젝트의 품질 근간을 형성합니다.

| # | 규칙 | 적용 대상 |
|---|------|----------|
| 1 | **Mock 동기화** — 인터페이스 변경 → 같은 커밋에서 mock 업데이트 | `reviewer`, `sync-tests` |
| 2 | **타입 확인** — 생성자 호출 전 소스 파일을 직접 읽기. 기억에 의존하지 않기 | `reviewer` |
| 3 | **범위 준수** — 현재 스토리 범위 내에서만 작업. 범위 외 파일 수정 시 먼저 보고 | `lead`, `reviewer` |
| 4 | **보안** — 코드나 커밋에 자격증명, 비밀번호, API 키 포함 금지 | `secure`, `reviewer` |
| 5 | **3회 실패 정지** — 같은 접근이 3번 실패하면 → 중단 후 보고 | 모든 에이전트 |
| 6 | **의존성 맵** — 모듈 추가/수정 → 같은 커밋에서 `dependency-map.md` 업데이트 | `reviewer`, `wrap-up` |
| 7 | **기능 레지스트리** — 새 기능 → 같은 커밋에서 `features.md`에 등록 | `reviewer`, `wrap-up` |
| 8 | **세션 핸드오프** — 세션 종료 → `project-state.md` Quick Summary 업데이트 | `wrap-up` |

---

## 왜 만들었나

기존 AI 코딩 프레임워크는 **AI가 무엇을 하는지** — 코드 생성, 테스트 실행, 배포에 집중합니다. 하지만 진짜 문제는 능력이 아닙니다. **방향**입니다.

혼자 개발하면 방향이 일관됩니다. 하지만 팀에서는 각 개발자의 AI가 독립적으로 이탈합니다. 그리고 혼자 개발해도 세션 간 방향을 잃습니다 — 우리가 **컨텍스트 부패(Context Rot)**라 부르는 현상입니다. AI는 아키텍처 결정을 잊고, 확정된 사항을 재논의하며, 자신의 이전 작업과 모순됩니다.

kode:harness는 **AI가 어디로 가는지**에 집중합니다. 개발자, IDE, 시간을 넘어 모든 AI 세션에 동일한 목표, 결정, 프로젝트 상태를 제공합니다. 이 근간이 되는 원칙이 **harness engineering** — 어떤 LLM이든 읽을 수 있는 경량 마크다운 네이티브 가드레일입니다.

### Crew Artifact Integration (🟣 파이프라인)

팀이 **외부 기획 도구** (또는 PRD, Architecture, ARB Checklist을 산출하는 기획 도구)를 사용한다면, kode:harness가 산출물을 직접 읽습니다:

```bash
npx @kodevibe/harness init
# 그 후 LLM에게 요청:
> "crew 산출물을 기반으로 프로젝트를 세팅해줘"
```

Bootstrap이 `docs/crew/`, `docs/PM/`, `docs/Analyst/`, `docs/ARB/`에서 crew 산출물을 자동 감지하고:
- **Artifact Index** — 모든 crew 문서를 경로, 역할, 핵심 내용과 함께 매핑
- **Validation Tracker** — KPI 커버리지, FR 커버리지, ARB Fail 해결 상황을 Story별로 추적

원본 crew 문서는 **절대 수정되지 않습니다**. 인덱스와 트래커만 생성됩니다.

### 다른 프레임워크와의 비교

| | BMAD v6.2.2 | gstack v0.15.1 | GSD v1.33.0 | **kode:harness** |
|---|---|---|---|---|
| 초점 | 기업 SDLC 방법론 | 1인 소프트웨어 팩토리 | 전체 수명주기 자동화 | **멀티 개발자 방향 정렬** |
| 파일 수 | 200+ | ~40 | 수백 개 | **~25** |
| 의존성 | Node 20+ | Bun + Node + Playwright | Node 18+ | **Zero** |
| IDE 지원 | 20+ (installer) | 5 (setup --host) | 13 (runtime select) | 6 (네이티브 포맷) |
| 방향 관리 | ❌ | ❌ | ❌ | ✅ (Direction Guard + pivot + Decision Log) |
| Iron Laws (코드 품질 규칙) | ❌ | ❌ | ❌ | ✅ (8개 규칙이 스킬에 임베딩) |
| Cold start | ❌ | ❌ | `/gsd-new-project` | ✅ (`setup` 스킬) |
| 태스크당 컨텍스트 | 4-6 파일 | 1 파일 | 매번 200k 플랜 | **2-3 파일 (136줄 디스패처)** |

---

## 로드맵

kode:harness는 현재 **v0.9.2** — state-check 스킬, Iron Law #10 (Self-Verify), Confirmation Gate Defaults, 멀티 IDE 설치 수정, Crew 모드용 CI Artifact Index 도입.

| 단계 | 버전 | 상태 | 초점 |
|------|------|------|------|
| **Foundation** | v0.5.0 | ✅ 완료 | 핵심 프레임워크: 6 IDE 지원, 8 스킬, 3 에이전트, Team Mode, Direction Guard |
| **Hardening** | v0.6.5 | ✅ 완료 | 10 스킬, 4 에이전트, Iron Laws, CLI batch/doctor/validate, 방향 드리프트 감지 |
| **Flexibility** | v0.7.x | ✅ 완료 | 팀 컨벤션을 project-brief.md에 위임, prescriptive 규칙 제거 |
| **Navigation** | v0.8.x | ✅ 완료 | 🧭 Navigation Dispatcher, 5개 파이프라인, Crew Artifact Integration, 100점 품질 감사, Confirm-First 게이트, Wave-Level Pacing, Recalculating Mode |
| **Naming** | v0.9.0 | ✅ 완료 | 스킬/에이전트 네이밍 재설계 — 직관성과 발견성 강화 |
| **Self-Verify** | v0.9.2 | ✅ 현재 | state-check 스킬, Iron Law #10, Confirmation Gate Defaults, 멀티 IDE 수정, CI Artifact Index |
| **Validation** | v1.0 | 🔜 다음 | 실사용 검증, 사용자 피드백 수집 |

### 다음 단계

- [ ] 파일럿: 외부 기획 산출물을 kode:harness의 🟣 파이프라인으로 실제 프로젝트에 적용
- [ ] 실제 프로젝트에 kode:harness를 적용하고 사용 데이터 수집
- [ ] 사용 사례 문서화: Solo vs Team, crew vs no-crew
- [ ] 마찰 포인트와 부족한 기능에 대한 사용자 피드백 수집
- [ ] 가정이 아닌 실증 데이터 기반으로 개선 반복

---

## 참여 & 피드백

kode:harness는 활발히 개발 중이며 여러분의 의견을 환영합니다.

- 🐛 **버그 신고 & 기능 요청** → [GitHub Issues](https://github.com/AIDD-Projects/harness/issues)
- 💬 **토론 & 아이디어** → [GitHub Discussions](https://github.com/AIDD-Projects/harness/discussions)
- 🚀 **직접 사용해보기** → `npx @kodevibe/harness init` 후 피드백을 남겨주세요

특히 다음 사항에 관심이 있습니다:

- 3명 이상 팀에서 Direction Guard가 어떻게 작동하는지
- 6개 Team Rules (Pre-Pull, Owner, Read-Only 등)가 충분한지
- 어떤 IDE 통합이 개선이 필요한지
- 여러분의 워크플로에 어떤 스킬이나 에이전트가 빠져 있는지

---

## 라이선스

MIT
