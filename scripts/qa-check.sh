#!/usr/bin/env bash
# kode:harness — QA 자동 점검 스크립트
# 사용법: bash scripts/qa-check.sh [--oss] [--all]
#   (기본)   로컬 프레임워크 점검만 실행
#   --oss    GitHub OSS 프로젝트 건강성도 점검
#   --all    전부 실행 (로컬 + OSS)

set -euo pipefail
cd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)"

# ─── 색상 ───
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[0;33m'; CYAN='\033[0;36m'; NC='\033[0m'
ok()   { echo -e "  ${GREEN}✅${NC} $1"; }
warn() { echo -e "  ${YELLOW}⚠️${NC}  $1"; }
fail() { echo -e "  ${RED}❌${NC} $1"; FAILS=$((FAILS+1)); }
header() { echo -e "\n${CYAN}[$1/$TOTAL] $2${NC}"; }

FAILS=0
WARNS=0
CHECK_OSS=false

for arg in "$@"; do
  case $arg in
    --oss|--all) CHECK_OSS=true ;;
  esac
done

if $CHECK_OSS; then TOTAL=13; else TOTAL=10; fi

echo "============================================"
echo "  kode:harness QA 자동 점검"
echo "  $(date +%Y-%m-%d) | $(git rev-parse --short HEAD 2>/dev/null || echo 'N/A')"
echo "============================================"

# ═══════════════════════════════════════════════
# 1. 경량성 예산
# ═══════════════════════════════════════════════
header 1 "경량성 예산"

if [ -d "harness/" ]; then
  file_count=$(find harness/ -name "*.md" | wc -l | tr -d ' ')
  [ "$file_count" -le 30 ] && ok "총 파일: ${file_count}개 (≤30)" || fail "총 파일: ${file_count}개 — 상한 30 초과!"

  # Lightness budget rationale (recalibrated v0.9.5):
  # - Token estimate is `words × 1.3`, which has ±20% drift on markdown with tables/code blocks.
  # - v0.8 budgets (35K/1300/2300) were tight for v0.9.x feature additions:
  #   Iron Law #9 (Common First), #10 (Self-Verify), 🟣 Crew Pipeline, state-check skill,
  #   IDE adapter doc-cite comments. Recalibrated to 40K/1500/2500 to provide realistic
  #   headroom while preserving the OSS lightness intent (still ≤50% of typical context window).
  total_words=$(find harness/ -name "*.md" -exec cat {} + | wc -w | tr -d ' ')
  est_tokens=$((total_words * 13 / 10))
  [ "$est_tokens" -le 40000 ] && ok "추정 토큰: ${est_tokens} (≤40K)" || fail "추정 토큰: ${est_tokens} — 상한 40K 초과!"

  if [ -f "harness/core-rules.md" ]; then
    disp_words=$(wc -w < harness/core-rules.md | tr -d ' ')
    [ "$disp_words" -le 1500 ] && ok "디스패처: ${disp_words}단어 (≤1500)" || fail "디스패처: ${disp_words}단어 — 상한 초과!"
  else
    warn "harness/core-rules.md 없음 (디스패처 점검 스킵)"
  fi

  max_line=$(find harness/ -name "*.md" -exec wc -w {} + | sort -rn | head -2 | tail -1)
  max_words=$(echo "$max_line" | awk '{print $1}')
  max_name=$(echo "$max_line" | awk '{$1=""; print $0}' | xargs)
  [ "$max_words" -le 2500 ] && ok "최대 파일: ${max_name} (${max_words}단어, ≤2500)" || fail "최대 파일: ${max_name} (${max_words}단어) — 상한 초과!"

  state_files="harness/project-brief.md harness/project-state.md harness/features.md harness/dependency-map.md harness/failure-patterns.md"
  existing_states=""
  for sf in $state_files; do [ -f "$sf" ] && existing_states="$existing_states $sf"; done
  if [ -n "$existing_states" ]; then
    state_words=$(cat $existing_states | wc -w | tr -d ' ')
    [ "$state_words" -le 3000 ] && ok "State 합계: ${state_words}단어 (≤3000)" || fail "State 합계: ${state_words}단어 — 상한 초과!"
  fi
else
  warn "harness/ 디렉토리 없음 — 경량성 점검 스킵"
fi

# ═══════════════════════════════════════════════
# 2. 테스트
# ═══════════════════════════════════════════════
header 2 "테스트"

if [ -f "package.json" ] && grep -q '"test"' package.json; then
  test_output=$(npm test 2>&1) && ok "npm test 통과" || fail "npm test 실패"
  test_count=$(echo "$test_output" | grep -c "pass\|ok\|✓\|# tests" || echo "0")
  echo "    테스트 수: ~${test_count}건"
else
  warn "package.json에 test 스크립트 없음"
fi

# ═══════════════════════════════════════════════
# 3. 버전 정합성 (로컬)
# ═══════════════════════════════════════════════
header 3 "버전 정합성 (로컬)"

if [ -f "package.json" ]; then
  PKG_VER=$(node -e "console.log(require('./package.json').version)" 2>/dev/null || echo "N/A")
  echo "    package.json: v${PKG_VER}"

  if [ -f "README.md" ]; then
    README_VER=$(sed -n 's/.*\*\*v\([0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*\).*/\1/p' README.md | head -1)
    [ "$PKG_VER" = "$README_VER" ] && ok "README.md: v${README_VER}" || fail "README.md: v${README_VER:-없음} ≠ package.json v${PKG_VER}"
  fi

  if [ -f "README.ko.md" ]; then
    README_KO_VER=$(sed -n 's/.*\*\*v\([0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*\).*/\1/p' README.ko.md | head -1)
    [ "$PKG_VER" = "$README_KO_VER" ] && ok "README.ko.md: v${README_KO_VER}" || fail "README.ko.md: v${README_KO_VER:-없음} ≠ package.json v${PKG_VER}"
  fi

  if [ -f "CHANGELOG.md" ]; then
    CL_VER=$(sed -n 's/.*\[\([0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*\)\].*/\1/p' CHANGELOG.md | head -1)
    [ "$PKG_VER" = "$CL_VER" ] && ok "CHANGELOG.md: v${CL_VER}" || fail "CHANGELOG.md: v${CL_VER:-없음} ≠ package.json v${PKG_VER}"
  fi
else
  warn "package.json 없음"
fi

# ═══════════════════════════════════════════════
# 4. 포지셔닝 키워드
# ═══════════════════════════════════════════════
header 4 "포지셔닝 키워드"

if [ -f "README.md" ]; then
  pos_count=$(grep -c -i -E "multi.*developer|direction.*alignment|every developer" README.md || echo "0")
  [ "$pos_count" -ge 3 ] && ok "README.md 핵심 키워드: ${pos_count}회 (≥3)" || fail "README.md 핵심 키워드: ${pos_count}회 — 최소 3회 필요"

  grep -q -i -E "1-person|Solo developer" README.md && ok "비교 테이블: Solo vs Multi 구분 존재" || warn "비교 테이블에 Solo/1-person 구분 미확인"
fi

if [ -f "package.json" ]; then
  desc=$(grep '"description"' package.json || echo "")
  echo "$desc" | grep -q -i -E "direction|multi.*developer" && ok "package.json description: 방향 정렬 키워드 포함" || fail "package.json description: direction/multi-developer 키워드 없음"
fi

# ═══════════════════════════════════════════════
# 5. 구조적 무결성 — 방향성 가드
# ═══════════════════════════════════════════════
header 5 "구조적 무결성 — Direction Guard"

if [ -d "harness/" ]; then
  for f in harness/agents/pm.md harness/agents/reviewer.md harness/agents/architect.md harness/skills/breakdown.md; do
    if [ -f "$f" ]; then
      grep -q "project-brief" "$f" && ok "$(basename $f): project-brief 참조" || fail "$(basename $f): project-brief 참조 없음 — 가드 끊어짐!"
    fi
  done

  # failure-patterns 참조 (≥6)
  fp_count=$(grep -r -l "failure-patterns" harness/ 2>/dev/null | wc -l | tr -d ' ')
  [ "$fp_count" -ge 6 ] && ok "failure-patterns 참조: ${fp_count}개 (≥6)" || fail "failure-patterns 참조: ${fp_count}개 — 최소 6 필요"

  # dependency-map 참조 (≥7)
  dep_count=$(grep -r -l "dependency-map" harness/ 2>/dev/null | wc -l | tr -d ' ')
  [ "$dep_count" -ge 7 ] && ok "dependency-map 참조: ${dep_count}개 (≥7)" || fail "dependency-map 참조: ${dep_count}개 — 최소 7 필요"

  # Scope Compliance (≥3)
  scope_count=$(grep -r -l -E "Scope Compliance|Story scope|scope.*Story" harness/ 2>/dev/null | wc -l | tr -d ' ')
  [ "$scope_count" -ge 3 ] && ok "Scope Guard 참조: ${scope_count}개 (≥3)" || fail "Scope Guard 참조: ${scope_count}개 — 최소 3 필요"
else
  warn "harness/ 없음 — 구조적 무결성 스킵"
fi

# ═══════════════════════════════════════════════
# 6. 구조적 무결성 — 세션 연속성 & 마커
# ═══════════════════════════════════════════════
header 6 "구조적 무결성 — 세션 연속성 & 마커"

if [ -d "harness/" ]; then
  # 디스패처 → project-state 참조
  if [ -f "harness/core-rules.md" ]; then
    grep -q "project-state" harness/core-rules.md && ok "디스패처: project-state 참조" || fail "디스패처: project-state 참조 없음"
    grep -q "Common First" harness/core-rules.md && ok "Iron Law #9 Common First 존재" || fail "Iron Law #9 Common First 없음"
  fi

  # 에이전트 → agent-memory 참조
  for agent in architect pm reviewer lead; do
    if [ -f "harness/agents/$agent.md" ]; then
      grep -q "agent-memory/$agent" "harness/agents/$agent.md" && ok "$agent: agent-memory 참조" || fail "$agent: agent-memory 참조 없음 — 세션 학습 끊어짐"
    fi
  done

  # TEAM_MODE 마커 (최소 14개 — 스킬 추가 시 증가 가능)
  tm_count=$(grep -r -l "TEAM_MODE_START" harness/ 2>/dev/null | wc -l | tr -d ' ')
  [ "$tm_count" -ge 14 ] && ok "TEAM_MODE 마커: ${tm_count}개 (≥14)" || warn "TEAM_MODE 마커: ${tm_count}개 (최소 14 필요)"

  # TEAM_MODE START/END 쌍 검증
  for f in $(grep -r -l "TEAM_MODE_START" harness/ 2>/dev/null); do
    starts=$(grep -c "TEAM_MODE_START" "$f")
    ends=$(grep -c "TEAM_MODE_END" "$f")
    [ "$starts" -eq "$ends" ] || fail "$(basename $f): TEAM_MODE START($starts) ≠ END($ends)"
  done

  # Common First — crew 마커 밖 키워드 검증
  for f in $(grep -r -l "CREW_MODE_START" harness/ 2>/dev/null); do
    content=$(sed '/CREW_MODE_START/,/CREW_MODE_END/d' "$f")
    for kw in "Validation Tracker" "Crew Artifact" "ARB Fail" "KPI Coverage"; do
      if echo "$content" | grep -q "$kw"; then
        fail "$(basename $f): '$kw'가 crew 마커 밖에 존재 — Common First 위반"
      fi
    done
  done
  ok "Common First: crew 마커 격리 확인"
fi

# ═══════════════════════════════════════════════
# 7. Agent Chaining & Learn 보증
# ═══════════════════════════════════════════════
header 7 "Agent Chaining & Learn 보증"

if [ -d "harness/" ]; then
  # cross-agent: "새 채팅"
  for f in harness/agents/lead.md harness/core-rules.md; do
    if [ -f "$f" ]; then
      grep -q "새 채팅" "$f" && ok "$(basename $f): cross-agent '새 채팅' 안내" || fail "$(basename $f): cross-agent '새 채팅' 안내 누락"
    fi
  done

  # same-agent: "새 프롬프트"
  if [ -f "harness/agents/reviewer.md" ]; then
    grep -q "새 프롬프트" harness/agents/reviewer.md && ok "reviewer: same-agent '새 프롬프트' 안내" || fail "reviewer: '새 프롬프트' 안내 누락"
  fi

  # wrap-up MANDATORY (≥4)
  if [ -f "harness/skills/wrap-up.md" ]; then
    mand=$(grep -c "MANDATORY" harness/skills/wrap-up.md)
    [ "$mand" -ge 4 ] && ok "wrap-up MANDATORY: ${mand}개 (≥4)" || fail "wrap-up MANDATORY: ${mand}개 — 최소 4 필요"

    self=$(grep -c "Self-check" harness/skills/wrap-up.md)
    [ "$self" -ge 3 ] && ok "wrap-up Self-check: ${self}개 (≥3)" || fail "wrap-up Self-check: ${self}개 — 최소 3 필요"
  fi

  # reviewer Cross-check
  if [ -f "harness/agents/reviewer.md" ]; then
    grep -q "Cross-check features" harness/agents/reviewer.md && ok "reviewer: features Cross-check 존재" || fail "reviewer: features Cross-check 누락"
  fi
fi

# ═══════════════════════════════════════════════
# 8. 사내 키워드 유출 방지
# ═══════════════════════════════════════════════
header 8 "사내 키워드 유출 방지"

# CREW_MODE 마커 블록 안의 kode:crew는 허용 — 블록 밖에서만 검출
LEAK=""
while IFS= read -r f; do
  [ -f "$f" ] || continue
  # 마커 블록 제거 후 검사 (CREW_MODE 안의 키워드는 무시)
  content=$(sed '/CREW_MODE_START/,/CREW_MODE_END/d' "$f" 2>/dev/null)
  if echo "$content" | grep -qE "kode:musher|kode:crew|ktspace|CNCORE|ktspace\.atlassian"; then
    LEAK="$LEAK $f"
  fi
done < <(git ls-files 2>/dev/null | grep -v 'scripts/qa-check.sh')
LEAK=$(echo "$LEAK" | xargs)
if [ -z "$LEAK" ]; then
  ok "git 추적 파일에 사내 키워드 없음 (CREW_MODE 블록 제외)"
else
  fail "사내 키워드 노출 파일 (CREW_MODE 밖):"
  for f in $LEAK; do echo "    - $f"; done
fi

# API 키/토큰 패턴
SECRET=$(git ls-files 2>/dev/null | grep -E '\.(js|json|md)$' | xargs grep -l -E "(ghp_[a-zA-Z0-9]{36}|sk-[a-zA-Z0-9]{48}|password[[:space:]]*[:=])" 2>/dev/null | grep -v package-lock || true)
if [ -z "$SECRET" ]; then
  ok "API 키/토큰 패턴 미검출"
else
  fail "의심 파일:"
  echo "$SECRET" | while read f; do echo "    - $f"; done
fi

# ═══════════════════════════════════════════════
# 9. npm 배포 준비
# ═══════════════════════════════════════════════
header 9 "npm 배포 준비"

if [ -f "package.json" ]; then
  name=$(node -e "console.log(require('./package.json').name)" 2>/dev/null)
  version=$(node -e "console.log(require('./package.json').version)" 2>/dev/null)
  echo "    name: $name | version: $version"

  # files 필드
  node -e "const p=require('./package.json'); if(!p.files) process.exit(1)" 2>/dev/null && ok "files 필드 존재" || warn "files 필드 없음"

  # bin 필드
  node -e "const p=require('./package.json'); if(!p.bin) process.exit(1)" 2>/dev/null && ok "bin 필드 존재" || warn "bin 필드 없음"

  # engines
  node -e "const p=require('./package.json'); if(!p.engines) process.exit(1)" 2>/dev/null && ok "engines 필드 존재" || warn "engines 필드 없음"
fi

# ═══════════════════════════════════════════════
# 10. IDE 어댑터 경로 회귀 (v0.9.4+)
# ═══════════════════════════════════════════════
# 공식 docs와 어긋나는 stale 경로가 src/init.js / 템플릿 / README에 살아있는지 검증.
# 회귀 발생 시 사용자가 init 했을 때 잘못된 디렉토리가 만들어진다.
header 10 "IDE 어댑터 경로 회귀"

# 10-1. src/init.js 에서 stale 경로 패턴 검출 (코드만; 주석/문서 인용 제외)
# - .gemini/ → Antigravity는 .agents/ 사용 (공식)
# - .cursor/skills/ → Cursor는 .cursor/rules/ + cross-tool .agents/skills/
# - .cursor/agents/ → Cursor는 .cursor/rules/<agent>.mdc
# 주석 라인(// 또는 *)은 의도적인 doc-cite 인 경우가 많아 제외.
STALE=$(grep -nE "\.gemini/|\.cursor/skills/|\.cursor/agents/" src/init.js 2>/dev/null \
  | grep -vE "^[0-9]+:[[:space:]]*(//|\*|#)" \
  | grep -vE "legacy|musher-engineering" || true)
if [ -z "$STALE" ]; then
  ok "src/init.js stale 경로 없음"
else
  fail "src/init.js stale IDE 경로 검출:"
  echo "$STALE" | while read line; do echo "    $line"; done
fi

# 10-2. README/한글 README 동기화
README_STALE=$(grep -nE "\.gemini/|\.cursor/skills/|\.cursor/agents/|\.codex/agents/[^|]*\.md" README.md README.ko.md 2>/dev/null || true)
if [ -z "$README_STALE" ]; then
  ok "README IDE 경로 표 최신"
else
  fail "README stale IDE 경로:"
  echo "$README_STALE" | while read line; do echo "    $line"; done
fi

# 10-3. Codex agents 가 .toml 인지 (.md가 아닌지) generator에서 확인
if grep -q "writeAgentsAsToml" src/init.js 2>/dev/null; then
  ok "Codex agents writeAgentsAsToml 사용 중"
else
  fail "Codex agents가 .toml 형식이 아님 (writeAgentsAsToml 호출 누락)"
fi

# 10-4. Antigravity 가 .agents/ 만 사용하는지 (.gemini/ 미사용)
if grep -q "generateAntigravity" src/init.js 2>/dev/null; then
  if grep -A 50 "function generateAntigravity" src/init.js | grep -qE "'\.gemini" ; then
    fail "generateAntigravity 가 여전히 .gemini/ 를 생성"
  else
    ok "generateAntigravity .agents/ 만 사용"
  fi
fi

# ═══════════════════════════════════════════════
# OSS 점검 (--oss 또는 --all)
# ═══════════════════════════════════════════════
if $CHECK_OSS; then

  OWNER="AIDD-Projects"
  REPO="harness"

  # gh CLI 확인
  if ! command -v gh &>/dev/null; then
    echo -e "\n${RED}gh CLI가 설치되어 있지 않습니다. --oss 점검을 건너뜁니다.${NC}"
  else

  # ═══════════════════════════════════════════════
  # 10. GitHub 버전 정합성
  # ═══════════════════════════════════════════════
  header 11 "GitHub 버전 정합성"

  PKG_VER=$(node -e "console.log(require('./package.json').version)" 2>/dev/null || echo "N/A")
  NPM_VER=$(npm view @kodevibe/harness version 2>/dev/null || echo "N/A")
  RELEASE_TAG=$(gh api "repos/$OWNER/$REPO/releases/latest" --jq '.tag_name' 2>/dev/null || echo "N/A")

  echo "    package.json: v${PKG_VER} | npm: v${NPM_VER} | release: ${RELEASE_TAG}"

  [ "$PKG_VER" = "$NPM_VER" ] && ok "npm = package.json" || warn "npm(v${NPM_VER}) ≠ package.json(v${PKG_VER}) — npm publish 필요?"
  [ "v$PKG_VER" = "$RELEASE_TAG" ] && ok "Release tag = package.json" || fail "Release(${RELEASE_TAG}) ≠ package.json(v${PKG_VER})"

  # 유령 태그
  ghost_count=0
  while read tag; do
    ver=${tag#v}
    npm view "@kodevibe/harness@$ver" version >/dev/null 2>&1 || { warn "유령 태그: $tag (npm에 없음)"; ghost_count=$((ghost_count+1)); }
  done < <(gh api "repos/$OWNER/$REPO/tags" --jq '.[].name' 2>/dev/null)
  [ "$ghost_count" -eq 0 ] && ok "유령 태그 없음"

  # ═══════════════════════════════════════════════
  # 11. CI 상태
  # ═══════════════════════════════════════════════
  header 12 "CI 상태"

  CI_JSON=$(gh api "repos/$OWNER/$REPO/actions/runs" --jq '.workflow_runs[0]' 2>/dev/null || echo "{}")
  CI_STATUS=$(echo "$CI_JSON" | jq -r '.conclusion // "unknown"')
  CI_SHA=$(echo "$CI_JSON" | jq -r '.head_sha[:8] // "N/A"')

  [ "$CI_STATUS" = "success" ] && ok "최신 CI: success (${CI_SHA})" || fail "최신 CI: $CI_STATUS (${CI_SHA})"

  # badge
  if [ -f "README.md" ]; then
    grep -q "actions/workflows/ci.yml/badge" README.md && ok "CI badge 존재" || warn "CI badge 없음"
  fi

  # ═══════════════════════════════════════════════
  # 12. GitHub 커뮤니티 & 설정
  # ═══════════════════════════════════════════════
  header 13 "GitHub 커뮤니티 & 설정"

  for f in LICENSE CODE_OF_CONDUCT.md SECURITY.md .github/PULL_REQUEST_TEMPLATE.md .github/workflows/ci.yml; do
    gh api "repos/$OWNER/$REPO/contents/$f" --jq '.name' >/dev/null 2>&1 \
      && ok "$f" || fail "$f 없음"
  done

  REPO_JSON=$(gh api "repos/$OWNER/$REPO" 2>/dev/null || echo "{}")
  DESC=$(echo "$REPO_JSON" | jq -r '.description // ""')
  TOPICS=$(echo "$REPO_JSON" | jq -r '.topics | length')
  DISC=$(echo "$REPO_JSON" | jq -r '.has_discussions')

  echo "$DESC" | grep -qi 'multi.developer' && ok "description: multi-developer 포함" || fail "description: multi-developer 누락"
  [ "$TOPICS" -ge 15 ] && ok "Topics: ${TOPICS}개 (≥15)" || warn "Topics: ${TOPICS}개 — 15개 이상 권장"
  [ "$DISC" = "true" ] && ok "Discussions: 활성화" || warn "Discussions: 비활성"

  fi # gh CLI check end
fi # CHECK_OSS end

# ═══════════════════════════════════════════════
# 결과 요약
# ═══════════════════════════════════════════════
echo ""
echo "============================================"
if [ "$FAILS" -eq 0 ]; then
  echo -e "  ${GREEN}✅ 전체 점검 통과${NC} (실패 0건)"
else
  echo -e "  ${RED}❌ ${FAILS}건 실패${NC} — 위 항목을 확인하세요"
fi
echo "============================================"

exit $FAILS
