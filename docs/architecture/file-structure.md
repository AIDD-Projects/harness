# K-Harness 파일 구조

> VS Code Copilot 네이티브 커스터마이징 파일의 배치와 역할

---

## 1. 전체 구조

```
project-root/
│
├── .github/
│   └── copilot-instructions.md          # 전역 규칙 (자동 주입)
│
├── .vscode/
│   ├── skills/                          # 도메인 지식 파일
│   │   ├── test-integrity.md
│   │   ├── hexagonal-arch.md
│   │   ├── pagination-pattern.md
│   │   └── security-checklist.md
│   │
│   ├── agents/                          # 전문 에이전트
│   │   ├── reviewer.agent.md
│   │   └── sprint-manager.agent.md
│   │
│   └── instructions/                    # 조건부 규칙 (applyTo)
│       ├── backend.instructions.md
│       ├── frontend.instructions.md
│       └── testing.instructions.md
│
├── docs/                                # 프로젝트 상태 문서
│   ├── project-brief.md                 # 프로젝트 비전/목표/비목표
│   ├── project-state.md                 # 현재 스프린트 상태 (자동 갱신)
│   ├── features.md                      # 기능 레지스트리
│   ├── dependency-map.md                # 모듈 의존성 그래프
│   ├── failure-patterns.md              # 실패 패턴 누적
│   └── agent-memory/                    # 에이전트별 영속 메모리
│       ├── planner.md
│       ├── reviewer.md
│       └── sprint-manager.md
│
├── backend/                             # 실제 소스코드
├── frontend/
└── ...
```

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

### `.vscode/skills/` — 도메인 지식
- **주입 시점**: 에이전트가 명시적으로 참조하거나 사용자가 요청할 때
- **명명 규칙**: `{도메인}.md` (kebab-case)
- **내용**: 특정 기술 패턴의 상세 지침 + 체크리스트

### `.vscode/agents/` — 전문 에이전트
- **호출 방법**: `@reviewer 이 PR 검토해줘`
- **명명 규칙**: `{역할}.agent.md`
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
- **위치**: 프로젝트 root (모든 skill/agent가 쉽게 참조)
- **갱신**: 실패 발생 시 수동 추가
- **형식**: FP-001 ~ FP-NNN 번호 체계

### `docs/project-state.md` — 프로젝트 상태
- **위치**: 프로젝트 root
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

## 4. MCPHub 프로젝트 적용 예시

```
mcphub-official/
├── .github/
│   └── copilot-instructions.md          # Hexagonal arch, TypeORM, 필수 규칙
│
├── .vscode/
│   ├── skills/
│   │   ├── test-integrity.md            # Mock 동기화, 테스트 패턴
│   │   ├── hexagonal-arch.md            # Port/Adapter 패턴, DI 규칙
│   │   ├── pagination-pattern.md        # PaginatedResponse, 커서 기반
│   │   └── security-checklist.md        # AES-256-GCM, .env 관리
│   │
│   ├── agents/
│   │   ├── reviewer.agent.md            # 코드 리뷰 + 자동 수정
│   │   └── sprint-manager.agent.md      # Sprint 추적 + 상태 보고
│   │
│   └── instructions/
│       ├── backend.instructions.md      # applyTo: "backend/**"
│       ├── frontend.instructions.md     # applyTo: "frontend/**"
│       └── testing.instructions.md      # applyTo: "**/*.test.ts"
│
├── docs/failure-patterns.md                  # FP-001 ~ FP-011 (Sprint 1-4 실패)
├── docs/project-state.md                     # Sprint 5 진행 상황
│
├── backend/
├── frontend/
└── ...
```

---

## 5. 규모별 구성

### Minimal (1인, 신규 프로젝트)
```
.github/copilot-instructions.md    (1개)
.vscode/instructions/
  backend.instructions.md          (1개)
                                   ── 총 2개 파일
```

### Standard (1~2인, 운영 프로젝트)
```
.github/copilot-instructions.md    (1개)
.vscode/skills/                    (2~4개)
.vscode/instructions/              (2~3개)
docs/failure-patterns.md                (1개)
                                   ── 총 6~9개 파일
```

### Full (2~3인, 장기 프로젝트)
```
.github/copilot-instructions.md    (1개)
.vscode/skills/                    (3~5개)
.vscode/agents/                    (2개)
.vscode/instructions/              (3개)
docs/failure-patterns.md                (1개)
docs/project-state.md                   (1개)
                                   ── 총 11~13개 파일
```

---

## 6. BMAD 대비 파일 수 비교

| 범주 | BMAD | K-Harness Full |
|------|------|---------------|
| 에이전트 정의 | 11 | 2 |
| 워크플로우 | 33 | 0 (agent 내 인라인) |
| 태스크 | 5 | 0 (skill로 통합) |
| 매니페스트 | 6 | 0 |
| 지식/테스트 | 30+ | 1 (docs/failure-patterns.md) |
| Story 파일 | 86 | 0 (docs/project-state.md에 통합) |
| 설정 | 5+ | 0 |
| 기타 | 20+ | 2 (copilot-instructions, project-state) |
| **합계** | **200+** | **≤ 15** |
