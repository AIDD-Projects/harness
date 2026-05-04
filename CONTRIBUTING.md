# Contributing to kode:harness

[English](#english) | [한국어](#한국어)

---

## English

Thank you for your interest in contributing to kode:harness!

### Ways to Contribute

#### 🐛 Bug Reports
Found something broken? [Open a Bug Report](https://github.com/AIDD-Projects/harness/issues/new?template=bug-report.yml).

Please include:
- kode:harness version (`npx @kodevibe/harness --version`)
- IDE and mode (Solo/Team)
- Steps to reproduce

#### ✨ Feature Requests
Have an idea? [Open a Feature Request](https://github.com/AIDD-Projects/harness/issues/new?template=feature-request.yml).

We're especially interested in:
- New skills or agents for your workflow
- Team Mode improvements for larger teams
- IDE-specific enhancements

#### 🤖 IDE Compatibility Reports
If an IDE updated its customization paths and kode:harness files aren't recognized, [report it here](https://github.com/AIDD-Projects/harness/issues/new?template=ide-compatibility.yml).

#### 💬 Discussions
Questions, ideas, and experience sharing → [GitHub Discussions](https://github.com/AIDD-Projects/harness/discussions).

### Development Setup

```bash
git clone https://github.com/AIDD-Projects/harness.git
cd @kodevibe/harness
npm test    # Run all tests (Node.js native test runner)
```

### Project Principles

Before contributing, please understand the core principles of kode:harness and harness engineering:

1. **Zero Dependencies** — No external npm packages. Pure Node.js only.
2. **Lightweight by Design** — ~25 files, ~17K tokens. Small LLMs on private networks must work too.
3. **Multi-developer Direction Alignment** — Not "another solo harness". Every feature must serve team direction alignment.
4. **Synchronous I/O** — All file operations use `fs.*Sync` methods.
5. **Native IDE Formats** — Each IDE gets files in its native format. No adapters needed.

### Source of Truth: `harness/` is canonical

`harness/` is the single source of truth for skills, agents, state-file templates, and core rules. The IDE-specific directories that ship in this repo — `.github/`, `.claude/`, `.cursor/`, `.codex/`, `.windsurf/`, `.agents/` — are **generated outputs** of `src/init.js`. Do not edit them by hand.

- Edit `harness/skills/*.md`, `harness/agents/*.md`, or `harness/core-rules.md`.
- Run `npm run harness:sync` to regenerate the IDE-specific copies for this repo.
- `npm run harness:check-drift` (and `bash scripts/qa-check.sh` §11) fails CI if `harness/` and `.github/` go out of sync.

Why: npm users receive the contents of `harness/`. If `.github/` has been hand-patched and we forget to mirror the change back into `harness/`, our package ships stale templates while our own development environment looks fine. Treat any drift as a bug.

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Ensure all tests pass (`npm test`)
5. Submit a PR with a clear description

---

## 한국어

kode:harness에 기여해주셔서 감사합니다!

### 기여 방법

#### 🐛 버그 리포트
문제를 발견하셨나요? [버그 리포트를 작성해주세요](https://github.com/AIDD-Projects/harness/issues/new?template=bug-report.yml).

포함해주실 내용:
- kode:harness 버전 (`npx @kodevibe/harness --version`)
- 사용 중인 IDE와 모드 (Solo/Team)
- 재현 단계

#### ✨ 기능 제안
아이디어가 있으신가요? [기능 요청을 작성해주세요](https://github.com/AIDD-Projects/harness/issues/new?template=feature-request.yml).

특히 다음 사항에 관심이 있습니다:
- 워크플로에 필요한 새 스킬이나 에이전트
- 대규모 팀을 위한 Team Mode 개선
- IDE별 특화 기능

#### 🤖 IDE 호환성 리포트
IDE 업데이트로 커스터마이징 경로가 바뀌어 kode:harness 파일이 인식되지 않는다면 [여기에 리포트해주세요](https://github.com/AIDD-Projects/harness/issues/new?template=ide-compatibility.yml).

#### 💬 토론
질문, 아이디어, 사용 경험 공유 → [GitHub Discussions](https://github.com/AIDD-Projects/harness/discussions).

### 개발 환경 설정

```bash
git clone https://github.com/AIDD-Projects/harness.git
cd @kodevibe/harness
npm test    # 전체 테스트 실행 (Node.js 네이티브 테스트 러너)
```

### 프로젝트 원칙

기여하기 전에 kode:harness와 harness engineering의 핵심 원칙을 이해해주세요:

1. **Zero Dependencies** — 외부 npm 패키지 없음. 순수 Node.js만 사용
2. **경량 설계** — ~25개 파일, ~17K 토큰. 프라이빗 망의 소형 LLM에서도 작동해야 함
3. **멀티 개발자 방향 정렬** — "또 하나의 솔로 harness"가 아님. 모든 기능은 팀 방향 정렬을 지원해야 함
4. **동기식 I/O** — 모든 파일 작업은 `fs.*Sync` 메서드 사용
5. **네이티브 IDE 포맷** — 각 IDE에 고유 포맷으로 파일 생성. 어댑터 불필요

### Source of Truth: `harness/`가 정본

`harness/`가 스킬·에이전트·상태 파일 템플릿·코어 룰의 단일 정본(Source of Truth)입니다. 이 저장소에 함께 들어 있는 IDE별 디렉터리 — `.github/`, `.claude/`, `.cursor/`, `.codex/`, `.windsurf/`, `.agents/` — 는 `src/init.js`가 만든 **생성 산출물**입니다. 손으로 직접 수정하지 마세요.

- `harness/skills/*.md`, `harness/agents/*.md`, `harness/core-rules.md`만 편집하세요.
- `npm run harness:sync`로 이 저장소의 IDE별 파일을 재생성하세요.
- `npm run harness:check-drift`(및 `bash scripts/qa-check.sh` §11)는 `harness/`와 `.github/`가 어긋나면 실패합니다.

이유: npm 사용자는 `harness/` 내용을 그대로 받습니다. `.github/`만 손으로 패치하고 `harness/`로 반영하지 않으면, 우리 패키지는 stale 템플릿을 배포하면서 우리 개발 환경만 정상으로 보입니다. drift는 버그로 취급합니다.

### Pull Request 절차

1. 저장소 포크
2. 기능 브랜치 생성 (`git checkout -b feature/my-feature`)
3. 변경사항 구현
4. 모든 테스트 통과 확인 (`npm test`)
5. 명확한 설명과 함께 PR 제출
