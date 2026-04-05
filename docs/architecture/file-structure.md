# K-Harness 파일 구조

> VS Code Copilot 네이티브 커스터마이징 파일의 배치와 역할

---

## 1. 전체 구조

```
project-root/
│
├── .github/
│   ├── copilot-instructions.md          # 전역 규칙 (자동 주입)
│   ├── skills/                          # 스킬 (온디맨드 절차)
│   │   ├── bootstrap/SKILL.md
│   │   ├── feature-breakdown/SKILL.md
│   │   ├── impact-analysis/SKILL.md
│   │   ├── investigate/SKILL.md
│   │   ├── learn/SKILL.md
│   │   ├── pivot/SKILL.md
│   │   ├── security-checklist/SKILL.md
│   │   └── test-integrity/SKILL.md
│   └── agents/                          # 에이전트 (역할 기반)
│       ├── planner.agent.md
│       ├── reviewer.agent.md
│       └── sprint-manager.agent.md
│
├── .vscode/
│   └── instructions/                    # 조건부 규칙 (applyTo)
│       ├── backend.instructions.md
│       └── testing.instructions.md
│
├── docs/                                # 프로젝트 상태 문서
│   ├── project-brief.md                 # 프로젝트 비전/목표/비목표
│   ├── project-state.md                 # 현재 스프린트 상태
│   ├── features.md                      # 기능 레지스트리
│   ├── dependency-map.md                # 모듈 의존성 그래프
│   ├── failure-patterns.md              # 실패 패턴 누적
│   └── agent-memory/                    # 에이전트별 영속 메모리
│       ├── planner.md
│       ├── reviewer.md
│       └── sprint-manager.md
│
├── src/                                 # 실제 소스코드
└── ...
```

> 위 구조는 VS Code 기준. 다른 IDE는 Section 4 IDE 매핑 참조.

---

## 2. 각 파일의 역할

### `.github/copilot-instructions.md` — 전역 규칙
- **주입 시점**: 모든 Copilot Chat 대화에 자동
- **내용**: 프로젝트 아키텍처, 기술 스택, 필수 규칙
- **크기 제한**: 200줄 이하 (매번 주입되므로 최소화 필수)

```markdown
# 프로젝트 규칙

## 아키텍처
- Hexagonal Architecture (Port + Adapter 패턴)
- Domain → Application → Adapter 의존성 방향

## 기술 스택  
- Backend: TypeScript, Express, TypeORM, PostgreSQL
- Frontend: React 18, Mantine v8, Zustand

## 필수 규칙
- ServerType은 union type ("STDIO" | "SSE" | "STREAMABLE_HTTP"), enum 아님
- Repository 인터페이스 변경 시 반드시 Mock 동기화
- 모든 API는 PaginatedResponse<T> 형태

## 현재 상태
- Sprint 4 완료, Sprint 5 진행 중
- 현재 브랜치: feature/sprint-5-xxx
```

### `.github/skills/` — 스킬 (온디맨드 절차)
- **주입 시점**: 사용자가 명시적으로 호출할 때 (`"bootstrap 실행해줘"`)
- **명명 규칙**: `.github/skills/{skill-name}/SKILL.md`
- **내용**: 절차적 가이드 (언제, 무엇을, 어떻게)

### `.github/agents/` — 전문 에이전트
- **호출 방법**: `@planner 인증 기능 추가하고 싶어`
- **명명 규칙**: `.github/agents/{role}.agent.md`
- **내용**: 역할 정의, 참조할 skills, 절차, 출력 형식

### `.vscode/instructions/` — 조건부 규칙
- **주입 시점**: `applyTo` glob 패턴에 매칭되는 파일 편집 시 자동
- **명명 규칙**: `{영역}.instructions.md`
- **헤더 형식**:
```markdown
---
applyTo: "backend/**/*.ts"
---
# Backend 코드 규칙
...
```

### `docs/failure-patterns.md` — 실패 패턴
- **위치**: `docs/` 디렉토리 (모든 skill/agent가 참조)
- **갱신**: 실패 발생 시 수동 추가
- **형식**: FP-001 ~ FP-NNN 번호 체계

### `docs/project-state.md` — 프로젝트 상태
- **위치**: `docs/` 디렉토리
- **갱신**: Sprint 단위 또는 주요 변경 시
- **내용**: 현재 Sprint 목표, 완료/진행 중 story, 기술적 결정 사항

---

## 3. 파일 간 참조 규칙

### 허용되는 참조
```
copilot-instructions.md  ──→  docs/failure-patterns.md (간접 참조: "docs/failure-patterns.md 참고")
agent.md                 ──→  skills/*.md (명시적 참조: "test-integrity.md skill 적용")
instructions.md          ──→  skills/*.md (필요시 참조)
```

### 금지되는 참조
```
❌ skill A → skill B → skill C (체인 참조)
❌ manifest.csv → agent.yaml → workflow.md → task.md (다단계 간접)
❌ 외부 URL 참조 (LLM이 접근 불가)
```

### 참조 깊이 제한
- 최대 1단계: `agent → skill` 또는 `instructions → skill`
- **절대로 2단계 이상 체인 금지**

---

## 4. IDE별 파일 매핑

| IDE | 전역 규칙 | 조건부 규칙 | 스킬 | 에이전트 |
|-----|----------|-----------|------|--------|
| **VS Code** | `.github/copilot-instructions.md` | `.vscode/instructions/*.instructions.md` | `.github/skills/*/SKILL.md` | `.github/agents/*.agent.md` |
| **Claude Code** | `CLAUDE.md` | (통합) | `.claude/skills/*/SKILL.md` | (통합) |
| **Cursor** | `.cursor/rules/core.mdc` | `.cursor/rules/*.mdc` | (통합) | (통합) |
| **Codex** | `AGENTS.md` | (통합) | `.agents/skills/*/SKILL.md` | (통합) |
| **Windsurf** | `.windsurfrules` | (통합) | (통합) | (통합) |
| **Augment** | `.augment/rules/core.md` | `.augment/rules/*.md` | `.augment/skills/*/SKILL.md` | `.augment/skills/*/SKILL.md` |
| **Antigravity** | `.agent/rules/core.md` | `.agent/rules/*.md` | `.agent/skills/*/SKILL.md` | `.agent/skills/*/SKILL.md` |

> 모든 IDE에서 상태 파일은 `docs/` 디렉토리에 생성됩니다.

---

## 5. 규모별 구성

### Minimal (1인, 신규 프로젝트)
```
.github/copilot-instructions.md    (1개)
.vscode/instructions/
  backend.instructions.md          (1개)
docs/
  project-brief.md                 (1개)
                                   ── 총 3개 파일
```

### Standard (1~2인, 운영 프로젝트)
```
.github/copilot-instructions.md    (1개)
.github/skills/                    (4~6개)
.vscode/instructions/              (2개)
docs/                              (5개)
                                   ── 총 12~14개 파일
```

### Full (2~3인, 장기 프로젝트)
```
.github/copilot-instructions.md    (1개)
.github/skills/                    (8개)
.github/agents/                    (3개)
.vscode/instructions/              (2개)
docs/                              (5개 + agent-memory 3개)
                                   ── 총 ~22개 파일
```

---

## 6. BMAD 대비 파일 수 비교

| 범주 | BMAD | K-Harness Full |
|------|------|---------------|
| 에이전트 정의 | 11 | 3 |
| 워크플로우 | 33 | 0 (agent 내 인라인) |
| 태스크 | 5 | 0 (skill로 통합) |
| 매니페스트 | 6 | 0 |
| 지식/테스트 | 30+ | 1 (docs/failure-patterns.md) |
| Story 파일 | 86 | 0 (docs/project-state.md에 통합) |
| 설정 | 5+ | 0 |
| 기타 | 20+ | 3 (copilot-instructions, instructions 2개) |
| **합계** | **200+** | **~20** |
