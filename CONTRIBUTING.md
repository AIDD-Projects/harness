# Contributing to Musher Engineering

[English](#english) | [한국어](#한국어)

---

## English

Thank you for your interest in contributing to Musher Engineering!

### Ways to Contribute

#### 🐛 Bug Reports
Found something broken? [Open a Bug Report](https://github.com/KTcorp-Opensource-Projects/harness/issues/new?template=bug-report.yml).

Please include:
- Musher version (`npx musher-engineering --version`)
- IDE and mode (Solo/Team)
- Steps to reproduce

#### ✨ Feature Requests
Have an idea? [Open a Feature Request](https://github.com/KTcorp-Opensource-Projects/harness/issues/new?template=feature-request.yml).

We're especially interested in:
- New skills or agents for your workflow
- Team Mode improvements for larger teams
- IDE-specific enhancements

#### 🤖 IDE Compatibility Reports
If an IDE updated its customization paths and Musher files aren't recognized, [report it here](https://github.com/KTcorp-Opensource-Projects/harness/issues/new?template=ide-compatibility.yml).

#### 💬 Discussions
Questions, ideas, and experience sharing → [GitHub Discussions](https://github.com/KTcorp-Opensource-Projects/harness/discussions).

### Development Setup

```bash
git clone https://github.com/KTcorp-Opensource-Projects/harness.git
cd musher-engineering
npm test    # Run all tests (Node.js native test runner)
```

### Project Principles

Before contributing, please understand Musher's core principles:

1. **Zero Dependencies** — No external npm packages. Pure Node.js only.
2. **Lightweight by Design** — ~25 files, ~17K tokens. Small LLMs on private networks must work too.
3. **Multi-developer Direction Alignment** — Not "another solo harness". Every feature must serve team direction alignment.
4. **Synchronous I/O** — All file operations use `fs.*Sync` methods.
5. **Native IDE Formats** — Each IDE gets files in its native format. No adapters needed.

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Ensure all tests pass (`npm test`)
5. Submit a PR with a clear description

---

## 한국어

Musher Engineering에 기여해주셔서 감사합니다!

### 기여 방법

#### 🐛 버그 리포트
문제를 발견하셨나요? [버그 리포트를 작성해주세요](https://github.com/KTcorp-Opensource-Projects/harness/issues/new?template=bug-report.yml).

포함해주실 내용:
- Musher 버전 (`npx musher-engineering --version`)
- 사용 중인 IDE와 모드 (Solo/Team)
- 재현 단계

#### ✨ 기능 제안
아이디어가 있으신가요? [기능 요청을 작성해주세요](https://github.com/KTcorp-Opensource-Projects/harness/issues/new?template=feature-request.yml).

특히 다음 사항에 관심이 있습니다:
- 워크플로에 필요한 새 스킬이나 에이전트
- 대규모 팀을 위한 Team Mode 개선
- IDE별 특화 기능

#### 🤖 IDE 호환성 리포트
IDE 업데이트로 커스터마이징 경로가 바뀌어 Musher 파일이 인식되지 않는다면 [여기에 리포트해주세요](https://github.com/KTcorp-Opensource-Projects/harness/issues/new?template=ide-compatibility.yml).

#### 💬 토론
질문, 아이디어, 사용 경험 공유 → [GitHub Discussions](https://github.com/KTcorp-Opensource-Projects/harness/discussions).

### 개발 환경 설정

```bash
git clone https://github.com/KTcorp-Opensource-Projects/harness.git
cd musher-engineering
npm test    # 전체 테스트 실행 (Node.js 네이티브 테스트 러너)
```

### 프로젝트 원칙

기여하기 전에 Musher의 핵심 원칙을 이해해주세요:

1. **Zero Dependencies** — 외부 npm 패키지 없음. 순수 Node.js만 사용
2. **경량 설계** — ~25개 파일, ~17K 토큰. 프라이빗 망의 소형 LLM에서도 작동해야 함
3. **멀티 개발자 방향 정렬** — "또 하나의 솔로 harness"가 아님. 모든 기능은 팀 방향 정렬을 지원해야 함
4. **동기식 I/O** — 모든 파일 작업은 `fs.*Sync` 메서드 사용
5. **네이티브 IDE 포맷** — 각 IDE에 고유 포맷으로 파일 생성. 어댑터 불필요

### Pull Request 절차

1. 저장소 포크
2. 기능 브랜치 생성 (`git checkout -b feature/my-feature`)
3. 변경사항 구현
4. 모든 테스트 통과 확인 (`npm test`)
5. 명확한 설명과 함께 PR 제출
