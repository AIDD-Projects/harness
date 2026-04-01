# Failure Patterns

Record only actual failures from this project. No theories or assumptions.
Keep resolved patterns for regression prevention.

---

## FP-001: Mock not updated when interface changed

- **Occurred**: <!-- Sprint/Story where this happened -->
- **Frequency**: 0
- **Cause**: LLM treated interface change and mock update as separate tasks. Added method to interface but forgot to update the mock, causing test failures.
- **Prevention**: Update mock in the same commit as the interface change.
- **Applied in**: testing rules, test-integrity skill, reviewer agent
- **Status**: Template — activate when first occurrence is logged

---

## FP-002: Type confusion (enum vs union, wrong parameter count)

- **Occurred**: <!-- Sprint/Story where this happened -->
- **Frequency**: 0
- **Cause**: LLM does not retain type information across sessions. Used enum syntax for union types or called constructors with wrong parameter count.
- **Prevention**: Document core types in global instructions. Read source file before calling constructors.
- **Applied in**: global instructions, backend rules
- **Status**: Template — activate when first occurrence is logged

---

## FP-003: Scope drift / ignoring instructions

- **Occurred**: <!-- Sprint/Story where this happened -->
- **Frequency**: 0
- **Cause**: LLM lost track of current scope in large workflows. Skipped "report and wait for approval" steps.
- **Prevention**: Track current Story in project-state.md. Sprint manager agent detects scope violations.
- **Applied in**: sprint-manager agent, global instructions
- **Status**: Template — activate when first occurrence is logged

---

## FP-004: Dangerous file committed

- **Occurred**: <!-- Sprint/Story where this happened -->
- **Frequency**: 0
- **Cause**: LLM created temp files during work, then ran `git add .` which staged credentials or debug artifacts.
- **Prevention**: Ban `git add .`. Run security-checklist skill before commits. Reviewer agent inspects staging area.
- **Applied in**: security-checklist skill, reviewer agent, backend rules
- **Status**: Template — activate when first occurrence is logged

---

## FP-005: IDE 이름 혼동 (Antigravity → Augment Code)

- **Occurred**: Sprint 2, S2-1
- **Frequency**: 1
- **Cause**: 사용자가 "Antigravity IDE"로 언급했으나 공식 이름은 "Augment Code". LLM이 존재하지 않는 도구를 검색하느라 시간 낭비.
- **Prevention**: IDE 이름이 불확실할 때 BMAD 등 기존 프레임워크의 IDE 설정 디렉토리를 참고하여 교차 확인.
- **Applied in**: failure-patterns.md
- **Status**: ✅ Resolved

---

## FP-006: npm 2FA 토큰 유형 문제

- **Occurred**: Sprint 2, S2-1
- **Frequency**: 1
- **Cause**: npm Security Key(WebAuthn)는 CLI publish에 작동하지 않음. Granular Access Token은 "Require 2FA for write actions" 설정 때문에 E401 실패. 3번의 시도 끝에 Classic Automation Token으로 해결.
- **Prevention**: npm CLI publish 시 Classic Automation Token 사용. 프로젝트 문서에 npm publish 절차 기록.
- **Applied in**: project-state.md, 세션 기록
- **Status**: ✅ Resolved
