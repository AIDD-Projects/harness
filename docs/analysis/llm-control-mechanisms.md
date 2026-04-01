# LLM 제어 메커니즘 심층 분석

> gstack과 BMAD를 실제 코드 수준에서 분석한 결과,
> LLM이 "올바른 방향"을 유지하게 만드는 핵심 메커니즘 7가지를 도출한다.

---

## 왜 "고삐(Harness)"가 필요한가

LLM은 본질적으로 **확률적 텍스트 생성기**다. 코드를 잘 짠다. 하지만 다음 세 가지에서 실패한다:

1. **장기 방향 유지**: 20분 전 맥락을 잊는다. Sprint 3의 결정을 Sprint 4에서 뒤집는다.
2. **자기 검증 부재**: "완료"라고 말하지만 Mock 미갱신, 타입 불일치를 놓친다.
3. **범위 확장**: "이것도 고치면 좋겠다"고 판단하고 요청하지 않은 파일을 수정한다.

gstack은 이 문제를 **Claude Code의 네이티브 메커니즘**으로 해결했다.
K-Harness는 같은 문제를 **VS Code Copilot의 네이티브 메커니즘**으로 해결해야 한다.

---

## 메커니즘 1: 상태 주입 (State Injection)

### gstack의 방식
gstack의 모든 skill은 ~100줄의 **bash preamble**로 시작한다:

```bash
_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
_LEARN_COUNT=$(wc -l < "$_LEARN_FILE" 2>/dev/null | tr -d ' ')
echo "BRANCH: $_BRANCH"
echo "LEARNINGS: $_LEARN_COUNT entries loaded"
echo "REPO_MODE: $REPO_MODE"
```

이것이 하는 일: **매 세션 시작 시 현재 상태를 LLM 컨텍스트에 강제 주입**.
브랜치, 학습 내용 수, 프로젝트 모드, 라우팅 설정 — LLM이 "지금 어디에 있는지"를 매번 알게 된다.

### K-Harness 번역
VS Code Copilot에서는 bash preamble이 없다. 대신:

| gstack | K-Harness (VS Code) |
|--------|-------------------|
| bash preamble (매번 실행) | `copilot-instructions.md` (매 대화 자동 주입) |
| `_BRANCH`, `_REPO_MODE` | `project-state.md` 참조 지시 |
| `_LEARN_COUNT` | `failure-patterns.md` 참조 지시 |

**핵심**: 비용 0으로 매번 주입되는 채널은 `copilot-instructions.md`뿐이다.
여기에 프로젝트의 핵심 규칙만 넣되, 상세 절차는 skill/agent로 위임한다.

---

## 메커니즘 2: 라우팅 규칙 (Skill Routing)

### gstack의 방식
gstack은 SKILL.md에 **명시적 라우팅 테이블**을 포함한다:

```
- User reports a bug → invoke /investigate
- User asks to ship → invoke /ship
- User asks to review code → invoke /review
```

이것이 해결하는 문제: LLM이 "직접 대답"하려는 본능을 억제한다.
"버그가 있어요"라는 요청에 LLM은 즉시 코드 수정을 시도하지만,
라우팅 규칙이 있으면 **먼저 구조화된 디버깅 절차**를 따르게 된다.

### K-Harness 번역
VS Code Copilot에서는 `@agent-name` 멘션으로 라우팅한다:

```
# copilot-instructions.md
코드 리뷰 요청 시 → @reviewer 에이전트 사용 권장
Sprint/Story 관리 시 → @sprint-manager 에이전트 사용 권장
```

그러나 VS Code에서는 **사용자가 직접 @mention**해야 하므로,
gstack처럼 자동 라우팅은 불가능하다. 대신:
- `copilot-instructions.md`에 "언제 어떤 agent를 사용하라"는 안내
- 각 agent에 **자기 완결형 워크플로우**를 내장

---

## 메커니즘 3: 경직된 워크플로우 (Rigid Workflow)

### gstack의 방식 — /investigate 예시

```
Phase 1: Root Cause Investigation (수집만, 수정 금지)
  → Iron Law: NO FIXES WITHOUT ROOT CAUSE
Phase 2: Scope Lock (freeze로 범위 제한)
Phase 3: Hypothesis + Fix
Phase 4: Verify + Learning 기록
```

**Iron Law**라는 표현이 핵심이다. "가급적" "되도록이면"이 아니라 **"절대 금지"**.
LLM은 soft rule을 무시한다. hard rule만 따른다.

### /careful 예시 — hook 기반 강제

```yaml
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "bash ${CLAUDE_SKILL_DIR}/bin/check-careful.sh"
```

이것은 **LLM이 bash를 실행할 때마다 물리적으로 개입**하는 메커니즘이다.
`rm -rf`를 실행하려 하면 hook이 가로채서 경고를 표시한다.
LLM의 "의지"에 의존하지 않고 **시스템이 강제**한다.

### K-Harness 번역
VS Code Copilot에는 hook 시스템이 없다. 따라서:

1. **Iron Law를 copilot-instructions.md에 명시**: "인터페이스 변경 시 반드시 Mock도 갱신"
2. **체크리스트를 skill에 내장**: reviewer agent가 PR 전 체크리스트를 실행
3. **금지 사항을 instructions에 패턴 매칭**: `applyTo: "**/*.test.ts"` → 테스트 규칙 자동 주입

hook의 기계적 강제력은 모방할 수 없지만, **매번 자동 주입되는 규칙**으로 대체한다.

---

## 메커니즘 4: 완료 상태 프로토콜 (Completion Status)

### gstack의 방식

```
Status: DONE — All steps completed. Evidence provided.
Status: DONE_WITH_CONCERNS — Completed, but issues noted.
Status: BLOCKED — Cannot proceed. State what blocks.
Status: NEEDS_CONTEXT — Missing info. State exactly what.
```

이것이 해결하는 문제: LLM의 **"대충 끝낸 것 같습니다"** 습관.
구조화된 exit status가 없으면 LLM은 불완전한 작업을 완료로 보고한다.

### gstack의 에스컬레이션 규칙

```
- 3번 시도 실패 → STOP하고 에스컬레이션
- 보안 관련 불확실 → STOP하고 에스컬레이션
- 검증 범위 초과 → STOP하고 에스컬레이션
```

**"나쁜 작업은 작업 안 하는 것보다 나쁘다"** — 이 원칙이 LLM의 무한 재시도를 방지한다.

### K-Harness 번역
이 패턴은 그대로 채택한다:
- reviewer agent의 출력에 완료 상태 프로토콜 포함
- skill 체크리스트에 에스컬레이션 조건 명시
- copilot-instructions.md에 "3회 실패 시 사용자에게 보고" 규칙

---

## 메커니즘 5: 세션 간 학습 (Cross-Session Learning)

### gstack의 방식

```bash
# 학습 기록
echo '{"key":"mock-sync","type":"pitfall","insight":"Repository interface 변경 시 Mock 갱신 필수","files":["src/domain/repositories/*.ts"]}'
  >> ~/.gstack/projects/mcphub/learnings.jsonl

# 다음 세션에서 검색
~/.claude/skills/gstack/bin/gstack-learnings-search --limit 10
```

JSONL 파일에 프로젝트별 학습을 축적한다.
**다음 세션**의 `/investigate`에서 이 학습을 자동으로 검색하여 같은 실수 방지.

### K-Harness 번역

`failure-patterns.md` — gstack의 learnings.jsonl을 사람이 읽을 수 있는 Markdown으로 변환:

```markdown
## FP-001: Repository 인터페이스 변경 시 Mock 미갱신
- 발생: Sprint 4 — S4-1, S4-2, S4-3, S4-4
- 빈도: 4회
- 원인: LLM이 도메인 인터페이스와 테스트 Mock을 별개 작업으로 인식
- 방지: 인터페이스 메서드 추가/변경 시 해당 Mock도 동일 커밋에서 갱신
- 적용: testing.instructions.md, reviewer.agent.md
```

**차이점**: gstack은 CLI 바이너리로 자동 관리. K-Harness는 수동 + reviewer agent 참조.
**장점**: 사람도 읽을 수 있고, git으로 히스토리 추적 가능.

---

## 메커니즘 6: 범위 제한 (Scope Lock)

### gstack의 방식

```bash
# /investigate가 자동으로 실행
echo "src/auth/" > ~/.gstack/.freeze-boundary
# 이후 모든 Edit/Write에 hook이 경로 체크
```

`/freeze`는 LLM이 특정 디렉토리 밖의 파일을 수정하지 못하게 **물리적으로** 막는다.
디버깅 중 "이 파일도 고쳐야 할 것 같습니다"로 시작되는 범위 확장을 원천 차단.

### K-Harness 번역

물리적 hook이 없으므로, **규칙 기반 제한**:

```markdown
# copilot-instructions.md
## 범위 제한 규칙
- 요청받은 파일만 수정하라
- 관련 파일 수정이 필요하면 먼저 사용자에게 보고하고 승인받아라
- "이것도 고치면 좋겠다"는 해당 story/task에 포함된 경우에만
```

더 나아가, `project-state.md`에 **현재 story 범위**를 명시:

```markdown
## 현재 작업
- Story: S5-2 — 사용자 인증 리팩토링
- 범위: src/auth/, src/middleware/auth.ts, tests/auth/
- 범위 밖 수정 금지 (다른 story로 분리)
```

---

## 메커니즘 7: Voice/Tone 인코딩

### gstack의 방식 — 매우 상세한 톤 규칙

```
- No em dashes. Use commas, periods, or "..."
- No AI vocabulary: delve, crucial, robust, comprehensive, nuanced...
- No banned phrases: "here's the kicker", "let me break this down"...
- Sound like typing fast. Incomplete sentences sometimes.
- Name specifics. Real file names, real function names, real numbers.
```

이것이 하는 일: LLM의 **"AI스러운" 기본 출력 패턴**을 억제한다.
구체적 파일명과 라인 번호를 강제하면, LLM이 모호한 답변을 하지 못한다.

### K-Harness 번역
K-Harness는 톤 규칙을 최소화하되, **구체성 규칙**은 채택:

```markdown
# copilot-instructions.md
- 파일 수정 시 정확한 경로와 라인 번호를 명시하라
- "이것을 수정해야 합니다"가 아니라 "src/auth/login.ts:47의 validateToken()을 수정"
- 테스트 실패 시 실패한 테스트 이름과 에러 메시지를 인용하라
```

---

## 종합: gstack vs BMAD vs K-Harness 제어 비교

| 메커니즘 | BMAD | gstack | K-Harness |
|---------|------|--------|-----------|
| 상태 주입 | 없음 (LLM이 찾아 읽기) | bash preamble (100줄/skill) | copilot-instructions.md (자동 주입) |
| 라우팅 | 매니페스트 3단계 참조 | SKILL.md 라우팅 테이블 | @agent 멘션 + instructions 안내 |
| 워크플로우 강제 | 33개 워크플로우 (too many) | Iron Law + numbered phases | 체크리스트 + gate 규칙 |
| 물리적 안전장치 | 없음 | hook 기반 (careful/freeze) | 규칙 기반 (soft enforcement) |
| 완료 상태 | 없음 | DONE/BLOCKED/NEEDS_CONTEXT | 채택 (동일 프로토콜) |
| 세션 간 학습 | 없음 | JSONL learnings 자동 축적 | failure-patterns.md 수동 축적 |
| 범위 제한 | 없음 | /freeze (파일시스템 level) | project-state.md (규칙 level) |
| 에스컬레이션 | 없음 | 3회 실패 → STOP | 채택 (동일 규칙) |
| 구체성 강제 | 없음 | Voice rules (no AI vocabulary) | 구체성 규칙 (파일명/라인 필수) |

---

## K-Harness가 gstack에서 가져가는 것

1. **Completion Status Protocol** — DONE / DONE_WITH_CONCERNS / BLOCKED / NEEDS_CONTEXT
2. **에스컬레이션 규칙** — 3회 실패 시 STOP, 보안 불확실 시 STOP
3. **Iron Law 패턴** — soft rule 대신 hard rule ("반드시", "절대 금지")
4. **구체성 강제** — 파일명, 함수명, 라인 번호 명시 의무
5. **범위 명시** — project-state.md에 현재 작업 범위 기록
6. **학습 축적** — failure-patterns.md에 실패 패턴 FP-NNN 축적

## K-Harness가 gstack과 다르게 가는 것

1. **IDE 네이티브**: bash preamble 대신 copilot-instructions.md 자동 주입
2. **수동 학습**: JSONL 자동 축적 대신 사람이 읽는 Markdown failure-patterns
3. **최소 파일**: gstack 31개 skill 대신 skill 3~5개 + agent 2개
4. **프로젝트 관리**: gstack에 없는 Sprint/Story 추적 (sprint-manager agent)
5. **Soft enforcement**: hook 기반 물리적 강제 없이 규칙 기반 제어

---

## 결론: Harness의 본질

"고삐(Harness)"의 본질은 **LLM이 이탈할 수 있는 모든 지점에 가드레일을 설치하는 것**이다.

gstack은 이것을 **CLI 바이너리 + hook + 31개 skill**로 달성했다. 강력하지만 무겁다.
BMAD는 이것을 **200+ 파일 + 11 에이전트 + 매니페스트**로 시도했다. 의도는 좋지만 LLM 컨텍스트를 압살한다.

K-Harness는 이것을 **≤15개 파일 + 자동 주입 + 명시적 규칙**으로 달성하려 한다.
물리적 강제력은 떨어지지만, **매 대화마다 0 비용으로 주입되는 규칙**이 보상한다.

핵심 원리: **LLM은 기억하지 않는다. 매번 주입하라. 모호하면 무시한다. 명확하게 말하라.**
