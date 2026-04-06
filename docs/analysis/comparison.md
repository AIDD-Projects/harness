# 경쟁 분석: BMAD vs gstack vs GSD vs K-Harness

> **최종 갱신**: 2026-04-06 (K-Harness v0.8.1)
> BMAD v6.2.2 (43.2k ⭐) | gstack v0.15.1 (60.9k ⭐) | GSD v1.33.0 (48.1k ⭐)

---

## 1. 핵심 철학 비교

| 차원 | BMAD | gstack | GSD | K-Harness |
|---|---|---|---|---|
| **한 줄 정의** | 기업형 Agile AI 개발 방법론 | 1인 소프트웨어 팩토리 | 풀 프로젝트 라이프사이클 자동화 | 프로젝트 방향성 관리 하네스 |
| **핵심 가치** | 체계적 SDLC (Phase-Gate) | 도구 통합 파이프라인 | "설명하면 Claude가 다 만들어줌" | "LLM이 프로젝트를 이해하고 실수 안 해" |
| **복잡도 방향** | 복잡성을 방법론으로 정리 | 복잡성을 도구 체인으로 해결 | 복잡성을 시스템 안에 숨김 | 복잡성 자체를 줄임 |

---

## 2. 아키텍처 비교

| | BMAD | gstack | GSD | K-Harness |
|---|---|---|---|---|
| **파일 수** | 200+ | ~41 | 수백 | ~20 |
| **에이전트** | 12+ | 0 | 다수 (orchestrator+subagents) | 3 |
| **스킬/워크플로우** | 34+ | 31 | 40+ commands | 8 skills |
| **규칙 시스템** | YAML 매니페스트 | 없음 | 없음 | 22줄 디스패처 + 임베딩 |
| **LLM 컨텍스트 비용** | 4~6 파일 | 1 파일 | Plan당 fresh 200k | 2~3 파일 |
| **IDE 지원** | 20+ | 5 | 13 | 7 |
| **의존성** | Node 20+ | Bun+Node+Playwright | Node 18+ | Zero dep |

---

## 3. K-Harness 고유 강점

### 🔹 프로젝트 방향성 관리 (BMAD/gstack/GSD 어디에도 없음)
- `project-brief.md`: Vision / Goals / Non-Goals / Decision Log
- `pivot` skill: 방향 변경 시 모든 state files 횡단 갱신
- planner의 Direction Alignment

### 🔹 Iron Laws (6개 불변 규칙)
Mock Sync, Type Check, Scope Compliance, Security, 3-Failure Stop, Dependency Map

### 🔹 22줄 디스패처 패턴
상세 규칙은 스킬/에이전트에 임베딩 → 해당 스킬 실행 시에만 로드

### 🔹 IDE 네이티브 포맷 & Zero Dependencies

---

## 4. 각 프레임워크에서 채택한 것

| 출처 | 채택 | K-Harness 구현 |
|------|------|---------------|
| BMAD | Sprint/Story 추적 | project-state.md 단일 파일 |
| BMAD | Adversarial Review | reviewer 에이전트 |
| BMAD | Phase-Gate 핵심 | planner의 Direction Alignment |
| gstack | 1 Skill = 1 File | 동일 원칙 |
| gstack | 파이프라인 연결 | bootstrap→planner→code→reviewer→learn |
| gstack | /learn 학습 | learn skill + failure-patterns.md |
| gstack | Auto-fix 패턴 | reviewer의 auto-fix + [ASK] |
| GSD | (없음) | 채택할 기능 없음 — 문제 영역이 다름 |

---

## 5. 포지셔닝

- **경쟁 영역**: 방향성 관리 + 코드 품질 하네스 → **명확한 우위**
- **비경쟁 영역**: 풀 자동화(GSD), 기업 SDLC(BMAD), 도구 통합(gstack)
- **원칙**: 비경쟁 영역의 기능을 가져오면 정체성이 흐려짐. 현재 방향 유지.

---

*갱신 주기: 메이저 버전 릴리스 시 또는 경쟁 프레임워크 주요 업데이트 시*
