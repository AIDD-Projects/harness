# 3대 핵심 문제에 대한 오픈소스 프레임워크 솔루션 분석

> 분석 대상: BMAD v6.0, gstack v0.14, Claude Code Memory, Cursor Rules, Roo Code Boomerang
> 분석 일자: 2026-04-01
> 목적: K-Harness가 해결해야 할 3가지 핵심 문제에 대해 기존 프레임워크들이 어떻게 접근하는지 비교하고, 개선 방향 도출

---

## 문제 정의

| # | 문제 | 실제 발생 상황 |
|---|------|---------------|
| 1 | **기능 추적** | 프로젝트가 커지면 LLM이 모든 기능을 파악하지 못함. "이 프로젝트에 뭐가 있는지" 자체를 모름 |
| 2 | **컨텍스트 유실** | 채팅 용량이 차서 새 세션이 열리면 이전 맥락 소실. 매번 처음부터 재파악 |
| 3 | **사용자별 적응** | 모든 프로젝트가 다름. 사용자 방향에 맞게 구조를 설계하고, 그 방향을 유지해야 함 |

---

## 문제 1: 기능 추적 — "프로젝트에 뭐가 있는지 LLM이 모른다"

### 각 프레임워크의 접근법

| 프레임워크 | 접근 | 장단점 |
|-----------|------|--------|
| **BMAD** | Epics(11개) → Stories(86개) → sprint-status.yaml | ✅ 체계적 ❌ 200+파일 → LLM 컨텍스트 과부하 |
| **gstack** | 기능 추적 없음. 당일 작업에만 집중 | ✅ 간결 ❌ 장기 프로젝트에서 기능 누락 |
| **Claude Code** | CLAUDE.md에 아키텍처 개요 + `.claude/rules/`에 **경로별 규칙** → 해당 파일 작업 시에만 로드 | ✅ 온디맨드 로딩 ✅ 컨텍스트 효율적 |
| **Cursor** | .cursorrules에 프로젝트 설명 1개 파일 | ✅ 단순 ❌ 세분화 불가 |
| **Roo Code** | `.roo/rules-{mode-slug}/`에 모드별 규칙 분리 + Boomerang 서브태스크 격리 | ✅ 격리된 컨텍스트 ✅ 모드별 전문화 |

### 핵심 인사이트

**Claude Code의 "경로별 규칙(path-specific rules)"이 가장 효과적인 패턴:**

```yaml
# .claude/rules/auth.md
---
paths:
  - "src/auth/**/*.ts"
---
# Auth 모듈 규칙
- JWT 토큰은 RS256 사용
- 세션 만료: 24시간
- refreshToken은 httpOnly cookie
```

→ LLM이 `src/auth/` 파일을 작업할 때만 이 컨텍스트가 로드됨.
→ 전체 프로젝트를 한 번에 읽을 필요 없이, **작업 중인 영역의 컨텍스트만** 주입.

**Roo Code의 "컨텍스트 격리"도 중요한 패턴:**

> "Each subtask operates in complete isolation with its own conversation history. 
> It does not automatically inherit the parent's context."

→ Orchestrator가 전체 그림을 관리하고, 서브태스크는 해당 영역만 깊이 작업.
→ 컨텍스트가 무관한 정보로 오염되는 것(context poisoning)을 방지.

### K-Harness에 적용할 것

1. **Feature Registry** — 모든 기능을 한 곳에 나열하는 `features.md` (기능명 → 관련 파일 → 테스트 파일 → 상태)
2. **모듈별 컨텍스트 파일** — 각 주요 모듈마다 해당 모듈의 규칙/결정사항을 담은 파일 (IDE가 지원하면 경로별 자동 로드)
3. **기능 변경 시 Feature Registry 갱신 강제** — Iron Law로 추가

---

## 문제 2: 컨텍스트 유실 — "새 채팅이 열리면 다 날아간다"

### 각 프레임워크의 접근법

| 프레임워크 | 접근 | 장단점 |
|-----------|------|--------|
| **BMAD** | sprint-status.yaml로 상태 기록 | ✅ 상태 유지 ❌ 코드 실제 상태와 동기화 안 됨 |
| **gstack** | `/learn` — 세션 간 패턴/실수/선호 자동 기억 | ✅ 자동 ❌ Claude Code 종속 |
| **Claude Code** | **2계층**: CLAUDE.md(사용자 작성, 팀 공유) + Auto Memory(LLM 작성, 기기 로컬). MEMORY.md를 인덱스로, 토픽 파일은 온디맨드 | ✅ 자동+수동 혼합 ✅ 200줄 자동 로드 + 나머지 온디맨드 |
| **Cursor** | 메모리 시스템 없음. 세션마다 리셋 | ❌ 컨텍스트 유실 |
| **Roo Code** | 모드별 규칙 파일 영속 + Boomerang 서브태스크 요약만 부모에 반환 | ✅ 요약 기반 영속 ❌ 자동 학습 없음 |

### 핵심 인사이트

**Claude Code의 2계층 메모리가 가장 체계적:**

```
계층 1: CLAUDE.md (사용자가 작성)
  → 프로젝트 아키텍처, 빌드 명령, 코딩 표준
  → 팀이 git으로 공유
  → 매 세션 시작 시 자동 로드

계층 2: Auto Memory (LLM이 작성)
  → ~/.claude/projects/<project>/memory/MEMORY.md
  → 첫 200줄만 세션 시작 시 로드
  → 디버깅 인사이트, API 규약, 코드 스타일 선호 등
  → 토픽 파일은 필요할 때 on-demand
```

**gstack의 `/learn`이 문제를 풀기 위한 가장 간결한 접근:**

→ 별도 설정 없이 세션에서 발견된 패턴을 다음 세션에 자동 반영.
→ 하지만 Claude Code 전용이라 VS Code Copilot에서는 직접 사용 불가.

### K-Harness에 적용할 것

**VS Code Copilot은 자동 메모리 기능이 없으므로**, 우리가 "수동 프로토콜"로 이를 보완해야 함:

1. **Session Handoff Protocol** — 채팅이 끝나기 전에 LLM이 반드시 해야 할 일:
   - `project-state.md`에 현재 진행 상황 업데이트
   - `failure-patterns.md`에 새로 발견된 패턴 추가
   - `features.md`에서 변경된 기능 상태 갱신
   - **다음 세션이 읽어야 할 핵심 3줄 요약** 을 project-state.md 상단에 작성

2. **New Session Bootstrap** — 새 세션 시작 시 LLM이 반드시 읽어야 할 파일:
   - `project-state.md` (현재 어디까지 했는지)
   - `features.md` (뭐가 있는지)
   - `failure-patterns.md` (무엇을 조심해야 하는지)

3. **상태 파일 크기 제한** — project-state.md는 200줄 이하로 유지 (Claude Code의 200줄 제한과 동일한 근거)

---

## 문제 3: 사용자별 적응 — "모든 프로젝트가 다르다"

### 각 프레임워크의 접근법

| 프레임워크 | 접근 | 장단점 |
|-----------|------|--------|
| **BMAD** | 고정된 11개 에이전트, 33개 워크플로우. 모든 프로젝트에 동일 구조 강제 | ❌ 경직 ❌ 소규모 프로젝트에 과잉 |
| **gstack** | 고정 스킬 + `/learn`으로 프로젝트별 적응 | ✅ 학습 적응 ❌ 구조 자체는 고정 |
| **Claude Code** | **가장 유연**: `@import`로 외부 파일 참조, `/init`으로 코드베이스 분석 후 초기 설정 자동 생성, 사용자/프로젝트/조직 3계층 | ✅ 완전 맞춤형 |
| **Cursor** | .cursorrules 1파일로 프로젝트별 커스터마이징 | ✅ 단순 ❌ 복잡한 프로젝트에 한 파일로 부족 |
| **Roo Code** | `.roomodes` 프로젝트별 모드 정의 + import/export로 템플릿 공유 | ✅ 프로젝트별 모드 ✅ 팀 간 공유 |

### 핵심 인사이트

**Claude Code의 `/init`이 가장 이상적인 패턴:**

> `/init`을 실행하면 Claude가 코드베이스를 분석하고, 
> 빌드 명령, 테스트 방법, 프로젝트 규약을 자동으로 발견해서 CLAUDE.md를 생성한다.

→ 사용자가 처음부터 모든 규칙을 작성할 필요 없음.
→ 기존 프로젝트에 도입 시 진입장벽 최소화.

**Roo Code의 import/export도 실용적:**

→ 한 프로젝트에서 만든 모드를 YAML 1파일로 export → 다른 프로젝트에 import.
→ 팀 내 워크플로우 표준화에 유용.

**그러나 가장 중요한 것은 "방향 유지":**

모든 프레임워크가 놓치고 있는 것 — **사용자가 처음에 설정한 프로젝트 방향을 끝까지 유지하는 메커니즘**.

- BMAD: PRD/Epic이 있지만 LLM이 실행 중에 참조하지 않음
- gstack: 방향 개념 자체가 없음 (태스크 중심)
- Claude Code: CLAUDE.md에 쓸 수 있지만 강제하지 않음
- Cursor: 방향 개념 없음
- Roo Code: Orchestrator가 있지만 "왜 이걸 하는지"는 사용자가 매번 설명해야 함

### K-Harness에 적용할 것

1. **`project-brief.md`** — 프로젝트 비전, 목표, 비목표, 핵심 결정을 담는 문서
   - 모든 에이전트가 작업 전 참조하도록 강제
   - "왜 이 프로젝트를 하는지"에 대한 single source of truth

2. **Interactive Init** — `npx k-harness init` 시 대화형으로 프로젝트 정보 수집:
   - "프로젝트 이름이 뭐예요?"
   - "어떤 종류예요? (웹앱/API/CLI/라이브러리)"
   - "기술 스택은?"
   - "팀 규모는?"
   - → 답변에 따라 적절한 구조 생성

3. **방향 검증 게이트** — Planner/Reviewer가 새 기능 추가 시 project-brief.md와 대조
   - "이 기능이 프로젝트 목표에 맞는가?"
   - "비목표 영역을 침범하고 있지 않은가?"

---

## 종합 비교: 각 프레임워크의 3대 문제 해결 점수

| 프레임워크 | 기능 추적 | 컨텍스트 유실 | 사용자 적응 | 총점 |
|-----------|----------|-------------|-----------|------|
| BMAD | ★★★★☆ | ★★☆☆☆ | ★★☆☆☆ | 8/15 |
| gstack | ★☆☆☆☆ | ★★★★☆ | ★★★☆☆ | 8/15 |
| Claude Code | ★★★★☆ | ★★★★★ | ★★★★★ | 14/15 |
| Cursor | ★★☆☆☆ | ★☆☆☆☆ | ★★★☆☆ | 6/15 |
| Roo Code | ★★★☆☆ | ★★★☆☆ | ★★★★☆ | 10/15 |
| **K-Harness 현재** | ★★☆☆☆ | ★★★☆☆ | ★★☆☆☆ | 7/15 |

---

## K-Harness 개선 방향 요약

### 추가해야 할 파일/메커니즘

| 파일 | 역할 | 영감 출처 |
|------|------|----------|
| `features.md` | 전체 기능 레지스트리 (기능→파일→테스트→상태) | BMAD Epics의 경량화 |
| `project-brief.md` | 프로젝트 비전/목표/비목표/핵심 결정 | BMAD PRD + Claude Code CLAUDE.md |
| Session Handoff Protocol | 채팅 종료 전 상태 저장 + 다음 세션 부트스트랩 | Claude Code Auto Memory의 수동 버전 |

### 수정해야 할 기존 파일

| 파일 | 변경 사항 |
|------|----------|
| `core-rules.md` | Iron Law #7 "Feature Registry 갱신" 추가 |
| `project-state.md` | 상단에 "3줄 요약" 섹션 추가, 200줄 제한 명시 |
| `planner.md` 에이전트 | project-brief.md 참조 + 방향 검증 게이트 추가 |
| `reviewer.md` 에이전트 | features.md 확인 단계 추가 |

### 추가해야 할 프로토콜

| 프로토콜 | 내용 |
|---------|------|
| **Session Handoff** | 채팅 끝나기 전 → project-state.md 업데이트, failure-patterns.md 갱신 |
| **New Session Bootstrap** | 새 채팅 시작 시 → project-state.md + features.md + failure-patterns.md 읽기 |
| **Direction Guard** | 새 기능 추가 시 → project-brief.md의 목표/비목표와 대조 |

---

## 주의: 검증되지 않은 가설

이 분석에서 도출된 개선 방향은 **아직 검증되지 않았다.**

각 프레임워크에서 "잘 작동한다"고 보이는 패턴을 차용했지만:
- 해당 패턴이 K-Harness 환경(VS Code Copilot)에서도 작동하는지 모름
- features.md 관리가 실제로 LLM의 기능 인지도를 높이는지 데이터 없음
- Session Handoff Protocol을 LLM이 실제로 따르는지 검증 필요
- 파일 수가 늘어나면서 오히려 복잡도가 올라갈 수 있음

**다음 단계:** 실제 프로젝트(MCPHub)에서 파일럿 테스트하여 각 메커니즘의 효과를 측정해야 함.
