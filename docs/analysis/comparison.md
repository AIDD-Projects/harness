# 경쟁 분석: BMAD vs gstack vs GSD vs K-Harness

> **목적**: K-Harness가 프로젝트 방향성 관리와 코드 품질 하네스에서 경쟁 프레임워크 대비 어떤 위치에 있는지를 지속적으로 추적하고, 부족한 부분을 식별하여 개선하기 위한 Living Document.  
> **최종 갱신**: 2026-04-07 (K-Harness v0.9.0)

---

## 1. 프로젝트 개요

|  | BMAD | gstack | GSD | K-Harness |
|---|---|---|---|---|
| GitHub | bmad-method | gstack-harness | get-shit-done | k-harness |
| Stars | 43.2k+ | 60.9k+ | 48.1k+ | — |
| 버전 | v6.2.2 | v0.15.1 | v1.33.0 | **v0.9.0** |
| 릴리스 | — | — | 445+ | |
| Contributors | 132 | 261 | 181 | |
| 라이선스 | MIT | MIT | MIT | MIT |
| 원래 타겟 | Claude Code | Claude Code | Claude Code | VS Code Copilot |
| 의존성 | Node 20+ | Bun + Node + Playwright | Node 18+ | Node 18+ (zero dep) |

---

## 2. 핵심 철학 비교

각 프레임워크는 근본적으로 다른 문제를 해결합니다. 이 차이를 인식하는 것이 가장 중요합니다.

| 차원 | BMAD | gstack | GSD | K-Harness |
|---|---|---|---|---|
| 한 줄 정의 | 기업형 Agile AI 개발 방법론 | 1인 소프트웨어 팩토리 | 풀 프로젝트 라이프사이클 자동화 | 프로젝트 방향성 관리 하네스 |
| 핵심 가치 | 체계적 SDLC (Phase-Gate) | 도구 통합 파이프라인 | "설명하면 Claude가 다 만들어줌" | "LLM이 프로젝트를 이해하고 실수 안 해" |
| 복잡도 방향 | 복잡성을 방법론으로 정리 | 복잡성을 도구 체인으로 해결 | 복잡성을 시스템 안에 숨김 | 복잡성 자체를 줄임 |
| 사용자 역할 | PM/개발자 역할 분리 | 1인 개발자 = 모든 역할 | 아이디어 제공자 (코드는 AI가 작성) | 개발자 (AI가 보조) |
| 핵심 혁신 | Knowledge 피라미드 + Phase-Gate | Skill 체인 자동 연결 | Plan-Execute 자동 파이프라인 | Iron Laws + 22줄 디스패처 + 방향 관리 |
| **팀 지원** | Phase-Gate로 간접 지원 | ❌ 1인 전용 | ❌ 1인 전용 | **✅ Team Mode (v0.9.0)** |

---

## 3. 아키텍처 비교

### 3.1 파일 구조 & 규모

|  | BMAD | gstack | GSD | K-Harness |
|---|---|---|---|---|
| 총 파일 수 | 200+ | ~41 | 수백 (agents, commands, hooks, sdk) | ~20 |
| 에이전트 | 12+ (Analyst, Architect, Dev, PM, SM, TEA, UX...) | 0 (skill이 역할 내장) | 다수 (orchestrator + subagents) | 3 (planner, reviewer, sprint-manager) |
| 스킬/워크플로우 | 34+ workflows | 31 skills | 40+ commands (/gsd-*) | 8 skills |
| 모듈 | 5 (BMM, BMB, TEA, BMGD, CIS) | 없음 | SDK + Hooks + Agents | 없음 (flat structure) |
| State 파일 | 분산 | 3 (PLANNING, STATE, HANDOFF) | PROJECT.md + STATE.md | 5 (brief, features, state, deps, failures) |
| **팀 모드 파일** | — | — | — | `.harness/` (개인) + `docs/` (공유) |

### 3.2 룰/규칙 시스템

|  | BMAD | gstack | GSD | K-Harness |
|---|---|---|---|---|
| 규칙 관리 | YAML 매니페스트 + knowledge 파일 | 없음 (skill 프롬프트에 내장) | 없음 (프롬프트가 곧 규칙) | 22줄 디스패처 + 스킬/에이전트 임베딩 |
| 자동 로드 | 매니페스트 기반 간접 참조 | SKILL.md가 자동 로드 | agents 디렉토리 자동 로드 | copilot-instructions.md 자동 로드 |
| Iron Laws 개념 | 없음 | 없음 | 없음 | ✅ (6개 Iron Laws, 스킬에 임베딩) |
| 규칙 토큰 비용 | 높음 (YAML+MD 다수) | 낮음 | 중간 (agent 프롬프트가 김) | 최소 (22줄 디스패처) |

### 3.3 IDE 지원

|  | BMAD | gstack | GSD | K-Harness |
|---|---|---|---|---|
| 지원 IDE | 20+ (platform-codes.yaml) | 5 | 13 | 6 |
| 통합 방식 | installer가 IDE별 설정 생성 | ./setup --host flag | npx installer + runtime 선택 | IDE 네이티브 포맷 직접 생성 |
| 네이티브 포맷 | ❌ (자체 포맷 변환) | ❌ (SKILL.md 통일) | △ (skills 기반 + .clinerules) | ✅ (.instructions.md, .agent.md, .mdc 등) |

---

## 4. 기능별 심층 비교

### 4.1 프로젝트 방향성 관리 (K-Harness 핵심 영역)

| 기능 | BMAD | gstack | GSD | K-Harness |
|---|---|---|---|---|
| 프로젝트 비전/목표 관리 | 문서에 분산 | ❌ | PROJECT.md | ✅ project-brief.md (Vision/Goals/Non-Goals) |
| Decision Log | ❌ | ❌ | ❌ | ✅ project-brief.md 내장 |
| 방향 변경(Pivot) 관리 | ❌ | ❌ | ❌ | ✅ pivot skill (state files 횡단 갱신) |
| Direction Guard | ❌ | ❌ | ❌ | ✅ planner가 새 기능 vs 프로젝트 방향 대조 |
| Scope Drift 방지 | Phase-Gate로 간접 방지 | ❌ | Roadmap 고정 | ✅ sprint-manager + planner 연동 |

> **판정**: K-Harness가 유일하게 프로젝트 방향성 관리를 명시적 기능으로 제공. 다른 프레임워크는 프로세스 관리로 간접 방지하거나 아예 없음.

### 4.2 프로젝트 라이프사이클 관리

| 기능 | BMAD | gstack | GSD | K-Harness |
|---|---|---|---|---|
| Phase-Gate | ✅ (4단계) | ❌ | ✅ (discuss→plan→execute→verify→ship) | ❌ |
| Sprint/Story | ✅ (풍부) | ❌ | Phase 기반 Roadmap | ✅ (경량, project-state.md) |
| Epic 관리 | ✅ | ❌ | Milestone 단위 | ❌ |
| 병렬 실행 | ❌ | ❌ | ✅ Wave 기반 병렬 subagent | ❌ |
| 자동 커밋 | ❌ | ❌ | ✅ 태스크별 atomic commit | ❌ |
| PR 생성 | ❌ | ❌ | ✅ /gsd-ship | ❌ |

> **판정**: GSD가 압도적. 단, K-Harness는 프로세스 자동화가 목적이 아님 — "올바른 코드를 작성하도록 돕는 하네스"가 목적.

### 4.3 코드 품질 보장

| 기능 | BMAD | gstack | GSD | K-Harness |
|---|---|---|---|---|
| Mock 동기화 강제 | ❌ | ❌ | ❌ | ✅ Iron Law 1 + test-integrity |
| 타입 체크 강제 | ❌ | ❌ | ❌ | ✅ Iron Law 2 |
| 스코프 준수 | Phase-Gate로 간접 | ❌ | Roadmap 기반 | ✅ Iron Law 3 |
| 보안 규칙 | ❌ | /guard, /careful | 빌트인 보안 hardening | ✅ Iron Law 4 + security-checklist |
| 3-Failure Stop | ❌ | ❌ | ❌ | ✅ Iron Law 5 |
| 의존성 맵 갱신 강제 | ❌ | ❌ | ❌ | ✅ Iron Law 6 |
| 코드 리뷰 | Adversarial Review | ❌ | /gsd-review | ✅ reviewer 에이전트 |

> **판정**: K-Harness가 가장 체계적. Iron Laws 6개는 다른 프레임워크에 없는 독자적 개념.

### 4.4 Context Engineering

| 기능 | BMAD | gstack | GSD | K-Harness |
|---|---|---|---|---|
| Context Rot 대응 | 없음 | 없음 | Plan별 fresh context (200k) | 22줄 디스패처로 토큰 최소화 |
| 접근 방식 | N/A | N/A | 문제를 쪼개서 fresh window 할당 | 애초에 context를 적게 사용 |
| State 기반 persistence | 문서 기반 (비구조적) | 출력물 체인 | STATE.md + HANDOFF.json | 5개 state files |
| 학습 누적 | ❌ | ✅ /learn | ❌ | ✅ learn + failure-patterns.md |

> **판정**: GSD와 K-Harness는 정반대 전략으로 같은 문제를 해결. GSD는 "더 많은 context를 제공" (fresh window), K-Harness는 "더 적은 context로 해결" (22줄 디스패처).

### 4.5 Cold Start & Onboarding

| 기능 | BMAD | gstack | GSD | K-Harness |
|---|---|---|---|---|
| 신규 프로젝트 | 수동 설정 | 수동 | /gsd-new-project (질문→리서치→로드맵) | bootstrap (스캔→인터뷰→state 자동 생성) |
| 기존 프로젝트 합류 | 수동 | 수동 | /gsd-map-codebase | bootstrap (코드 스캔 + 인터뷰) |
| 설치 복잡도 | npx bmad-method install | git clone && ./setup | npx get-shit-done-cc | npx k-harness init |
| Zero-config 가능 | ❌ | ❌ | ❌ (질문 필수) | ❌ (bootstrap 필수) |

### 4.6 팀 협업 지원 (v0.9.0 신규 비교 축)

| 기능 | BMAD | gstack | GSD | K-Harness |
|---|---|---|---|---|
| 멀티 개발자 지원 | Phase-Gate로 간접 | ❌ | ❌ | ✅ Team Mode (`--team`) |
| State file 충돌 방지 | ❌ | ❌ | ❌ | ✅ 공유/개인 분리 |
| .gitattributes merge=union | ❌ | ❌ | ❌ | ✅ 자동 생성 |
| 개인 작업 격리 | ❌ | ❌ | ❌ | ✅ `.harness/` (gitignored) |

> **판정**: K-Harness가 유일하게 팀 협업 시 State file merge 충돌 문제를 해결. 다른 프레임워크는 1인 개발자 가정.

---

## 5. 포지셔닝 맵

```
프로세스 자동화 (높음)
                           │
                    GSD ●   │
                           │
              BMAD ●        │
                           │
─────────────────────────────────────────── 프로젝트 규모
  소규모                    │                 대규모
                           │
          gstack ●          │
                           │
                  K-Harness ● (Solo + Team)
                           │
           프로세스 자동화 (낮음)
```

```
코드 품질 보장 (강함)
                  │
       K-Harness ●│
                  │
          BMAD ●  │   ● GSD
                  │
──────────────────│────────────────── 자동화 수준
  수동            │                자동
                  │
        gstack ●  │
                  │
          코드 품질 보장 (약함)
```

---

## 6. 각 프레임워크에서 배운 것 & 채택 현황

### BMAD에서

| 아이디어 | 채택 여부 | K-Harness 구현 |
|---|---|---|
| Sprint/Story 추적 | ✅ 축소 채택 | 86개 story 파일 → project-state.md 단일 파일 |
| Adversarial Review | ✅ 채택 | reviewer 에이전트 |
| Phase-Gate 핵심 | ✅ 추출 | planner의 Direction Alignment |
| 12+ 에이전트 | ❌ 거부 | 3개로 충분 (1~3인 팀) |
| YAML 매니페스트 | ❌ 거부 | 파일 시스템 convention이 레지스트리 |
| 30개 테스트 지식 파일 | ❌ 거부 | failure-patterns.md 1개 |

### gstack에서

| 아이디어 | 채택 여부 | K-Harness 구현 |
|---|---|---|
| 1 Skill = 1 File | ✅ 채택 | 동일 원칙 |
| 파이프라인 자동 연결 | ✅ 채택 | bootstrap→planner→code→reviewer→learn |
| /learn 학습 | ✅ 채택 | learn skill + failure-patterns.md |
| Auto-fix 패턴 | ✅ 채택 | reviewer의 auto-fix + [ASK] |
| Playwright/배포 | ❌ 거부 | 범위 밖 (zero dep 원칙) |
| Claude Code 전용 기능 | ❌ 거부 | IDE 중립 |

### GSD에서

| 아이디어 | 채택 여부 | 근거 |
|---|---|---|
| Plan별 fresh context | ❌ 거부 | K-Harness는 context를 줄이는 전략. 반대 방향. |
| Wave 기반 병렬 실행 | ❌ 거부 | 프로세스 자동화 범위 밖 |
| Discuss Phase | ❌ 거부 | feature-breakdown이 이미 동일 역할 |
| HANDOFF.json | ❌ 거부 | learn skill이 이미 존재 |
| UAT 워크플로우 | ❌ 거부 | reviewer + test-integrity로 커버 |
| Forensics | ❌ 거부 | investigate + failure-patterns로 커버 |
| XML 프롬프트 포맷 | ❌ 거부 | Markdown 기반 유지 (IDE 호환성) |

---

## 7. K-Harness 고유 강점 (다른 프레임워크에 없는 것)

### 프로젝트 방향성 관리 체계

- project-brief.md: Vision / Goals / Non-Goals / Decision Log
- pivot skill: 방향 변경 시 모든 state files 횡단 갱신
- planner의 Direction Alignment: 새 기능이 프로젝트 방향에 부합하는지 자동 검증
- BMAD, gstack, GSD 어디에도 이 수준의 명시적 방향 관리는 없음

### Iron Laws (6개 불변 규칙)

1. Mock Sync — 인터페이스 변경 시 mock 동기화 강제
2. Type Check — 생성자/팩토리 호출 전 실제 소스 확인 강제
3. Scope Compliance — 현재 스토리 범위 밖 변경 금지
4. Security — 코드/커밋에 credential 금지
5. 3-Failure Stop — 동일 접근 3회 실패 시 중단 보고
6. Dependency Map — 모듈 추가/변경 시 dependency-map 갱신 강제

> 다른 프레임워크에서 "규칙"을 명시적으로 코드화한 사례 없음

### 22줄 디스패처 패턴

- 매 대화에 자동 로드되는 파일을 22줄로 최소화
- 상세 규칙은 스킬/에이전트에 임베딩 → 해당 스킬 실행 시에만 로드
- Context 효율에서 압도적 우위 (BMAD 4~6파일, GSD agent 프롬프트 수천 줄 vs K-Harness 22줄)

### IDE 네이티브 포맷 생성

- 각 IDE가 자체적으로 인식하는 표준 포맷으로 직접 생성
- `.instructions.md` (VS Code), `.mdc` (Cursor), `.claude/rules/core.md` (Claude), `AGENTS.md` (Codex) 등
- 다른 프레임워크는 자체 포맷을 IDE에 맞추는 변환 방식

### Zero Dependencies

- K-Harness는 런타임 의존성 0개
- BMAD: Node 20+, installer binary / gstack: Bun + Node + Playwright (수백 MB) / GSD: Node 18+

### Team Mode (v0.9.0, 유일)

- 팀 개발 환경에서 State file merge 충돌을 원천 차단
- 공유(docs/) + 개인(.harness/) 분리, .gitattributes merge=union 자동 생성
- 다른 프레임워크는 1인 개발자만 가정

---

## 8. K-Harness 보완 필요 영역 (Watchlist)

> 아래 항목은 "채택할 것"이 아니라 "경쟁 동향 모니터링 대상"입니다.

| 영역 | 현재 상태 | 모니터링 대상 | 비고 |
|---|---|---|---|
| 프로세스 자동화 | 범위 밖 | GSD의 discuss→plan→execute 자동화 | K-Harness 정체성과 충돌. 채택 안 함. |
| Context Rot 대응 | 22줄로 최소화 | GSD의 fresh context 전략 | 접근 방식이 다름. 디스패처 전략 유지. |
| IDE 지원 범위 | 6개 | GSD 13개, BMAD 20+ | OpenCode, Gemini CLI, Kilo, Trae, Cline 미지원. 수요 발생 시 추가. |
| 보안 자동화 | security-checklist 스킬 | GSD의 빌트인 injection detection | 스킬 수준으로 충분. 런타임 hook 불필요. |

---

## 9. 결론: 포지셔닝

### K-Harness가 경쟁하는 영역

> "LLM이 프로젝트 방향을 잃지 않고, 반복 실수 없이, 올바른 코드를 작성하도록 돕는 하네스"

이 영역에서 K-Harness는 BMAD, gstack, GSD 대비 명확한 우위:

- **방향성 관리**: 유일한 명시적 구현 (project-brief + pivot + Direction Guard)
- **규칙 체계**: 유일한 Iron Laws 시스템
- **토큰 효율**: 22줄 디스패처 (최소)
- **설치 장벽**: zero dependencies
- **팀 지원**: 유일한 Team Mode (v0.9.0)

### K-Harness가 경쟁하지 않는 영역

- 풀 프로젝트 자동화 (GSD 영역)
- 기업형 SDLC 관리 (BMAD 영역)
- 도구 통합 파이프라인 (gstack 영역)

> 이 구분을 유지하는 것이 핵심. 경쟁하지 않는 영역의 기능을 가져오면 정체성이 흐려짐.

---

_이 문서는 경쟁 프레임워크 업데이트 시 갱신합니다. (갱신 주기: 메이저 버전 릴리스 시)_
