# K-Harness 파일 구조

IDE 네이티브 커스터마이징 파일의 배치와 역할

> **버전**: v0.9.0 (Team Mode 포함)  
> **최종 업데이트**: 2026-04-07

---

## 1. 전체 구조

### Solo Mode (기본값, 1인 개발)

```
project-root/
│
├── .github/
│   ├── copilot-instructions.md          # 22줄 디스패처 (자동 주입)
│   ├── skills/                          # 스킬 (온디맨드 절차)
│   │   ├── bootstrap/SKILL.md
│   │   ├── feature-breakdown/SKILL.md
│   │   ├── impact-analysis/SKILL.md
│   │   ├── investigate/SKILL.md
│   │   ├── learn/SKILL.md
│   │   ├── pivot/SKILL.md
│   │   ├── security-checklist/SKILL.md
│   │   └── test-integrity/SKILL.md
│   └── agents/                          # 전문 에이전트 (3개)
│       ├── planner.agent.md
│       ├── reviewer.agent.md
│       └── sprint-manager.agent.md
│
├── docs/                                # State Files (영속 상태)
│   ├── project-brief.md                 # 프로젝트 방향
│   ├── project-state.md                 # Sprint/Story 상태
│   ├── features.md                      # 기능 목록
│   ├── dependency-map.md                # 모듈 구조
│   ├── failure-patterns.md              # 실패 패턴 기록
│   └── agent-memory/                    # 에이전트 메모리
│       ├── planner.md
│       ├── reviewer.md
│       └── sprint-manager.md
│
├── .cursor/rules/core-rules.md          # Cursor 디스패처
├── .claude/settings.json + skills/      # Claude Code 스킬
├── .codex/instructions.md               # Codex 디스패처
├── .windsurfrules                       # Windsurf 디스패처
└── .antigravity/instructions.md         # AntiGravity 디스패처
```

### Team Mode (소규모 팀, 2~4명) — v0.9.0 신규

```
project-root/
│
├── docs/                                # 공유 State Files (git committed)
│   ├── project-brief.md                 # 프로젝트 방향 (공유)
│   ├── features.md                      # 기능 목록 (Owner 컬럼)
│   └── dependency-map.md                # 모듈 구조 (Owner 컬럼)
│
├── .harness/                            # 개인 State Files (.gitignore)
│   ├── project-state.md                 # 내 Sprint/Story 상태
│   ├── failure-patterns.md              # 내 실패 패턴
│   └── agent-memory/                    # 내 AI 메모리
│       ├── planner.md
│       ├── reviewer.md
│       └── sprint-manager.md
│
├── .github/skills/                      # 스킬 (경로 자동 치환됨)
├── .github/agents/                      # 에이전트 (경로 자동 치환됨)
├── .gitignore                           # .harness/ 자동 추가
├── .gitattributes                       # merge=union 자동 생성
└── ... (IDE 디스패처들)
```

> **핵심 차이**: Team 모드에서는 `project-state.md`, `failure-patterns.md`, `agent-memory/`가 `.harness/`(gitignored)로 이동하여 merge 충돌을 원천 차단합니다.

---

## 2. 각 파일의 역할

### `.github/copilot-instructions.md` — 디스패처 (22줄)
- **주입 시점**: 모든 Copilot Chat 대화에 자동
- **내용**: 워크플로우 안내 (어떤 스킬/에이전트를 언제 호출할지), state 파일 목록
- **크기 제한**: 30줄 이하 (매번 주입되므로 최소화 필수)
- **설계 철학**: 상세 규칙(Iron Laws, Testing Rules 등)은 각 스킬/에이전트에 임베딩. 디스패처는 워크플로우 안내만 담당.

### `.github/skills/` — 스킬 (온디맨드 절차)
- **주입 시점**: 사용자가 명시적으로 호출할 때
- **명명 규칙**: `.github/skills/{skill-name}/SKILL.md`
- **내용**: 절차적 가이드 + 규칙 임베딩

### `.github/agents/` — 전문 에이전트
- **호출 방법**: `@planner 인증 기능 추가하고 싶어`
- **명명 규칙**: `.github/agents/{role}.agent.md`
- **내용**: 역할 정의, 참조할 skills, 절차, 출력 형식 + 규칙 임베딩

### State Files — 영속 상태
- **위치**: Solo → `docs/` 디렉토리 전체 / Team → 공유(`docs/`) + 개인(`.harness/`)
- **갱신**: 스킬/에이전트가 자동으로 갱신
- **역할**: 세션 간 컨텍스트 유지 (연결고리)
- **Git**: Solo → 전부 커밋 / Team → 공유 파일만 커밋 (개인 파일은 gitignored)

### agent-memory/ — 에이전트 메모리
- **위치**: Solo → `docs/agent-memory/` / Team → `.harness/agent-memory/`
- **갱신**: learn 스킬이 세션 종료 시 갱신
- **역할**: 에이전트별 학습 축적

---

## 3. Team Mode 경로 치환 (resolveContent)

Team 모드에서 `npx k-harness init --team` 실행 시, 모든 스킬·에이전트 파일 내용에서 경로가 자동 치환됩니다:

| 원본 경로 | Team 모드 치환 |
|---|---|
| `docs/project-state.md` | `.harness/project-state.md` |
| `docs/failure-patterns.md` | `.harness/failure-patterns.md` |
| `docs/agent-memory/` | `.harness/agent-memory/` |

> **주의**: `docs/project-brief.md`, `docs/features.md`, `docs/dependency-map.md`는 공유 파일이므로 치환되지 않습니다.

---

## 4. 파일 간 참조 규칙

### 허용되는 참조
```
copilot-instructions.md  ──→  docs/failure-patterns.md (간접 참조: "docs/failure-patterns.md 참고")
agent.md                 ──→  skills/*.md (명시적 참조: "test-integrity.md skill 적용")
```

### 금지되는 참조
```
❌ skill A → skill B → skill C (체인 참조)
❌ manifest.csv → agent.yaml → workflow.md → task.md (다단계 간접)
❌ 외부 URL 참조 (LLM이 접근 불가)
```

### 참조 깊이 제한
- 최대 1단계: `agent → skill`
- **절대로 2단계 이상 체인 금지**

---

## 5. IDE별 파일 매핑

| IDE | 디스패철 (always-on) | 스킬 | 에이전트 |
|-----|------------------------|스킬|--------|
| **VS Code** | `.github/copilot-instructions.md` | `.github/skills/*/SKILL.md` | `.github/agents/*.agent.md` |
| **Claude Code** | `.claude/rules/core.md` | `.claude/skills/*/SKILL.md` | `.claude/skills/*/SKILL.md` |
| **Cursor** | `.cursor/rules/core-rules.md` | `.cursor/rules/skills/*.md` | `.cursor/rules/agents/*.md` |
| **Codex** | `.codex/instructions.md` | Inline | Inline |
| **Windsurf** | `.windsurfrules` | Inline | Inline |
| **AntiGravity** | `.antigravity/instructions.md` | Inline | Inline |

> 6개 IDE에서 동일한 규칙/스킬/에이전트 콘텐츠를 각 IDE 네이티브 형식으로 생성합니다.

---

## 6. 규모별 구성

### Minimal (1인, 신규 프로젝트)
```
.github/copilot-instructions.md    (1개)
docs/project-brief.md              (1개)
                                   ── 총 2개 파일
```

### Standard (1~2인, 운영 프로젝트)
```
.github/copilot-instructions.md    (1개)
.github/skills/                    (4~6개)
docs/                              (5개)
                                   ── 총 10~12개 파일
```

### Full Solo (1~2인, 장기 프로젝트)
```
.github/copilot-instructions.md    (1개)
.github/skills/                    (8개)
.github/agents/                    (3개)
docs/                              (5개 + agent-memory 3개)
                                   ── 총 20개 파일
```

### Full Team (2~4인, 장기 프로젝트) — v0.9.0
```
.github/copilot-instructions.md    (1개)
.github/skills/                    (8개)
.github/agents/                    (3개)
docs/                              (3개, 공유만)
.harness/                          (2개 + agent-memory 3개, 개인)
.gitignore                         (.harness/ 추가)
.gitattributes                     (merge=union 규칙)
                                   ── 총 20개 파일 + git 설정 2개
```

---

## 7. BMAD 대비 파일 수 비교

| 범주 | BMAD | K-Harness Full |
|------|------|---------------|
| 에이전트 정의 | 11 | 3 |
| 워크플로우 | 3 | 0 (agent 내 인라인) |
| 태스크 | 5 | 0 (skill로 통합) |
| 매니페스트 | 6 | 0 |
| 지식/테스트 | 30+ | 1 (docs/failure-patterns.md) |
| Story 파일 | 8~60 | 0 (docs/project-state.md에 통합) |
| 설정 | 5+ | 0 |
| 기타 | 20+ | 1 (copilot-instructions) |
| **합계** | **200+** | **~20** |

---

_이 문서는 K-Harness v0.9.0 파일 구조의 레퍼런스입니다. Solo/Team 모드에 따라 State File 배치가 달라집니다._
