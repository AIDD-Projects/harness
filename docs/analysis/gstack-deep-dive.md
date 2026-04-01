# gstack 프레임워크 상세 분석

> 분석 대상: https://github.com/garrytan/gstack
> 버전: v0.14.3 (2026-04-01 기준)
> 제작자: Garry Tan (Y Combinator CEO)
> 스타: 59.5k | 포크: 7.8k | 기여자: 26명
> 라이선스: MIT

---

## 1. 핵심 철학

> "gstack is a process, not a collection of tools."

gstack은 **가상 엔지니어링 팀**을 slash command로 제공합니다:
- CEO가 제품을 재정의하고
- Eng Manager가 아키텍처를 확정하고
- Staff Engineer가 프로덕션 버그를 찾고
- QA Lead가 실제 브라우저를 열고
- Release Engineer가 PR을 올림

**1인 개발자가 20인 팀처럼** 일하는 것이 목표.

---

## 2. 설계 원칙

### 2-1. 1 Skill = 1 File

```
review/
└── SKILL.md          ← 이 파일 하나만 읽으면 /review 실행 가능
```

매니페스트, 에이전트 정의, 태스크 파일 등의 indirection이 없음.
LLM이 명령어를 받으면 해당 폴더의 `SKILL.md` 1개만 컨텍스트에 로드.

### 2-2. 선형 파이프라인

```
Think → Plan → Build → Review → Test → Ship → Reflect
```

각 단계의 출력이 다음 단계의 입력으로 자동 연결:
- `/office-hours` → design doc 생성
- `/plan-ceo-review` → design doc 읽고 검증
- `/plan-eng-review` → test plan 생성
- `/review` → 코드 리뷰 + auto-fix
- `/qa` → 실제 브라우저 테스트
- `/ship` → 테스트 + 커버리지 + PR

### 2-3. 학습 누적

`/learn` — 세션 간 패턴, 실수, 선호를 기억:
- 프로젝트별 학습이 다음 세션에 자동 반영
- 반복 실패 패턴이 자연스럽게 방지됨

### 2-4. 안전장치 내장

| 명령어 | 기능 |
|--------|------|
| `/careful` | 파괴적 명령(rm -rf, DROP TABLE, force-push) 전 경고 |
| `/freeze` | 편집 범위를 특정 디렉토리로 제한 |
| `/guard` | careful + freeze 동시 활성화 |
| `/investigate` | 디버깅 시 해당 모듈만 자동 freeze |

---

## 3. Skill 전체 목록 (31개)

### 3-1. 스프린트 워크플로우 (순서대로)

| Skill | 역할 | 기능 |
|-------|------|------|
| `/office-hours` | YC Office Hours | 제품 프레이밍, 전제 도전, 설계 문서 생성 |
| `/plan-ceo-review` | CEO / Founder | 문제 재정의, 10-star 제품 발견, 범위 조정 |
| `/plan-eng-review` | Eng Manager | 아키텍처, 데이터 플로우, 엣지 케이스, 테스트 |
| `/plan-design-review` | Senior Designer | 디자인 차원별 0-10 평가, AI Slop 감지 |
| `/design-consultation` | Design Partner | 디자인 시스템 처음부터 구축, 모 업 |
| `/design-shotgun` | Design Explorer | 다중 AI 디자인 변형 + 비교 보드 |
| `/design-html` | Design Engineer | 프로덕션 HTML + Pretext 레이아웃 |
| `/review` | Staff Engineer | CI 통과하지만 프로덕션 장애 일으킬 버그 탐지, auto-fix |
| `/investigate` | Debugger | 체계적 근인 분석, 3회 실패 후 중단 |
| `/design-review` | Designer Who Codes | 디자인 감사 + 직접 수정, atomic commit |
| `/qa` | QA Lead | 실제 앱 테스트 + 버그 수정 + 회귀 테스트 자동 생성 |
| `/qa-only` | QA Reporter | 버그 리포트만 (코드 변경 없음) |
| `/cso` | Chief Security Officer | OWASP Top 10 + STRIDE, 8/10+ 신뢰도 게이트 |
| `/ship` | Release Engineer | main 동기화 + 테스트 + 커버리지 + PR |
| `/land-and-deploy` | Release Engineer | PR 머지 → CI → 배포 → 프로덕션 헬스 확인 |
| `/canary` | SRE | 배포 후 모니터링 (콘솔 에러, 성능 회귀) |
| `/benchmark` | Performance Engineer | 페이지 로드, Core Web Vitals, 리소스 크기 |
| `/document-release` | Technical Writer | 변경사항에 맞춰 모든 문서 자동 업데이트 |
| `/retro` | Eng Manager | 주간 회고, 개인별 분석, 전체 프로젝트 크로스 |
| `/autoplan` | Review Pipeline | CEO → 디자인 → 엔지니어링 리뷰 자동 실행 |
| `/learn` | Memory | 세션 간 학습 관리, 검색, 가지치기, 내보내기 |

### 3-2. 파워 도구

| Skill | 기능 |
|-------|------|
| `/codex` | OpenAI Codex CLI로 독립 코드 리뷰 (크로스 모델 분석) |
| `/careful` | 파괴적 명령 경고 |
| `/freeze` | 편집 범위 제한 |
| `/guard` | careful + freeze |
| `/unfreeze` | freeze 해제 |
| `/connect-chrome` | Chrome Side Panel로 실시간 브라우저 제어 |
| `/browse` | 헤드리스 브라우저 제어 |
| `/setup-browser-cookies` | 실제 브라우저 쿠키 가져오기 |
| `/setup-deploy` | 배포 플랫폼 자동 감지 + 설정 |
| `/gstack-upgrade` | 자체 업그레이드 |

---

## 4. 기술 구현

### 4-1. 파일 구조

```
gstack/
├── SKILL.md                  ← 루트 스킬 (자체 설명서)
├── AGENTS.md                 ← 멀티 에이전트 지원
├── CLAUDE.md                 ← Claude Code 전용 설정
├── ARCHITECTURE.md           ← 설계 결정 문서
├── ETHOS.md                  ← 빌더 철학 문서
├── conductor.json            ← 병렬 실행 설정
│
├── review/SKILL.md           ← /review 스킬 정의
├── qa/SKILL.md               ← /qa 스킬 정의
├── ship/SKILL.md             ← /ship 스킬 정의
├── ...                       ← 31개 스킬 각각 폴더/SKILL.md
│
├── lib/                      ← 공유 라이브러리
├── browse/                   ← Playwright 브라우저 엔진
├── bin/                      ← CLI 바이너리
├── scripts/                  ← 설치/업그레이드 스크립트
├── extension/                ← Chrome Side Panel 확장
│
├── setup                     ← 설치 스크립트
├── package.json              ← Bun 의존성
└── bun.lock
```

### 4-2. IDE 지원

| IDE/Agent | 설치 위치 | 발견 방식 |
|-----------|-----------|-----------|
| Claude Code | `~/.claude/skills/gstack/` | SKILL.md 자동 발견 |
| Codex | `~/.codex/skills/gstack/` | .agents/skills/ 자동 발견 |
| Gemini CLI | `~/.codex/skills/gstack/` | Codex 호환 |
| Cursor | `.agents/skills/gstack/` | SKILL.md 표준 |
| Factory Droid | `~/.factory/skills/gstack-*/` | 자동 스캔 |

### 4-3. 기술 스택

- **TypeScript** (71%) — 핵심 로직
- **Go Template** (19.5%) — SKILL.md 템플릿 생성
- **Shell** (4.2%) — 설치/설정 스크립트
- **Bun** — 런타임 & 패키지 관리
- **Playwright** — 브라우저 자동화
- **Supabase** — opt-in 텔레메트리

---

## 5. 핵심 차별점

### 5-1. BMAD와의 근본적 차이

| 차원 | BMAD | gstack |
|------|------|--------|
| Skill 호출 | CSV → YAML → MD (3단계) | SKILL.md 1개 |
| 컨텍스트 비용 | 매번 70+ 파일에서 탐색 | 해당 skill 폴더 1개만 |
| 에이전트 연결 | manifest → config → agent 간접 참조 | 출력물을 다음 skill이 직접 읽음 |
| 학습 | 세션 독립 (매번 새로 파악) | `/learn`으로 세션 간 누적 |
| 안전장치 | 없음 (LLM 재량) | `/careful`, `/freeze`, `/guard` 내장 |

### 5-2. 왜 gstack이 작동하는가

1. **컨텍스트 최소화**: 1 command = 1 file. LLM이 읽어야 할 양이 최소
2. **파이프라인 자동화**: 출력 → 입력 연결이 명시적 → LLM이 순서 이탈 안 함
3. **안전장치**: 파괴적 동작 전 자동 경고 → "rm -rf" 류 사고 방지
4. **학습 루프**: 반복 실패가 다음 세션에서 자동 방지
5. **멀티 IDE**: 동일한 skill이 Claude Code, Codex, Cursor 모두에서 작동

### 5-3. gstack의 한계

1. **Claude Code 중심**: 핵심 기능(호출, 브라우저)은 Claude Code에 최적화
2. **SKILL.md 표준 의존**: VS Code Copilot은 SKILL.md가 아닌 자체 체계 사용
3. **프로젝트 관리 부재**: Sprint/Story/Epic 같은 장기 프로젝트 추적 기능 없음
4. **팀 협업 미고려**: 1인 개발자 최적화, 멀티 개발자 워크플로우 부재
5. **학습이 로컬**: 팀 간 학습 공유 메커니즘 없음
