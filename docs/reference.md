# K-Harness Reference

All skills, agents, rules, and state files in one document.

---

## Skills (8)

Skills are on-demand procedures. LLM reads the skill file and follows the steps.

### bootstrap

**Purpose**: Onboard a project into K-Harness. Solves the cold-start problem.

**When**: Right after `k-harness init`, when state files are empty, or when joining an existing project.

**What it does**:
1. Scans project root for config files (`package.json`, `go.mod`, `requirements.txt`, etc.)
2. Scans directory structure and imports to detect modules and dependencies
3. Interviews the user: project purpose, goals, non-goals, architecture
4. Auto-fills all 5 state files
5. Presents summary for user review

**Output**: Filled `docs/project-brief.md`, `docs/features.md`, `docs/dependency-map.md`, `docs/project-state.md`. `docs/failure-patterns.md` is left as templates.

---

### learn

**Purpose**: End-of-session wrap-up. Captures failure patterns and refreshes project state.

**When**: Before ending a chat session (recommended as the LAST skill), after debugging, after repeated mistakes.

**What it does**:
1. Reviews session activity via `git log` / `git diff`
2. Detects new failure patterns or increments existing ones
3. Updates `docs/project-state.md` Quick Summary (3 lines)
4. Updates `docs/features.md` if features were added/modified

**Output**: Updated `docs/failure-patterns.md` and `docs/project-state.md`.

---

### pivot

**Purpose**: Propagate direction changes across ALL state files consistently.

**When**: Technology swap, scope change, architecture shift, goal pivot — any time the project's direction changes.

**What it does**:
1. Captures the change and classifies it (Tech Swap / Scope Change / Architecture Shift / Goal Pivot)
2. Scans ALL 5 state files for impact
3. Presents a change plan for user confirmation
4. Updates all state files in order: `docs/project-brief.md` → `docs/features.md` → `docs/dependency-map.md` → `docs/project-state.md` → `docs/failure-patterns.md`
5. Records the decision in `docs/project-brief.md` Decision Log

**Rules**: Never skip confirmation. Never update partially. Always record the "why".

---

### feature-breakdown

**Purpose**: Decompose a feature into dependency-ordered implementation tasks.

**When**: Starting a new feature, a feature touches 3+ modules, unsure which module to build first.

**What it does**:
1. Reads `docs/dependency-map.md` for current module relationships
2. Identifies affected modules and classifies changes (NEW_MODULE, INTERFACE_CHANGE, INTERNAL_CHANGE, TEST_ONLY)
3. Builds dependency order and groups into implementation waves
4. Creates numbered task sequence with files, tests, and dependencies per task

**Updates**: `docs/dependency-map.md`, `docs/features.md`, `docs/project-state.md`.

---

### impact-analysis

**Purpose**: Trace all affected modules before modifying a module's interface. Prevents cascade failures.

**When**: Changing a module's public interface, modifying shared types/DTOs, refactoring 2+ files.

**What it does**:
1. Finds the target module in `docs/dependency-map.md`
2. Lists all dependent modules (the blast radius)
3. For interface changes: traces each dependent's imports and identifies breaking changes
4. Creates a task list of all files that need modification
5. Verifies changes are within current Story scope

**Updates**: `docs/dependency-map.md` Interface Change Log, `docs/project-state.md`.

---

### investigate

**Purpose**: Debug bugs systematically. Prevents "symptom patching" — fixing without understanding root cause.

**When**: Test failures with unclear cause, runtime errors, regression bugs.

**What it does**:
1. **Phase 1 (Evidence)**: Collects error messages, stack traces, recent changes. NO fixes.
2. **Phase 2 (Scope Lock)**: Identifies the root cause module, excludes unrelated files.
3. **Phase 3 (Hypothesis + Fix)**: States root cause hypothesis, implements minimal fix.
4. **Phase 4 (Verify + Record)**: Runs tests, adds regression test, records pattern if applicable.

**Updates**: `docs/failure-patterns.md`, `docs/project-state.md`.

---

### security-checklist

**Purpose**: Inspect for security risks before committing code.

**When**: Before `git add` or commit, when creating/modifying config or auth files.

**What it does**:
1. Checks staging area for forbidden files (`.env`, `*.pem`, `*.key`)
2. Scans staged code for hardcoded secrets (passwords, API keys, tokens)
3. Verifies `.gitignore` covers sensitive patterns
4. Checks for temp files (`tmp_*`, `debug_*`, `coverage_*`)

**Updates**: `docs/failure-patterns.md` (if a security issue was found).

---

### test-integrity

**Purpose**: Ensure test mocks stay synchronized when interfaces change.

**When**: Adding/removing/modifying methods on a repository/service interface, creating new services.

**What it does**:
1. Identifies changed interfaces
2. Maps to corresponding mock files
3. Verifies every interface method exists in the mock with correct return types
4. Checks that use case tests configure the mock correctly for new methods

**Updates**: `docs/failure-patterns.md` (if mock sync was missed), `docs/dependency-map.md` (if module relationships changed).

---

## Agents (3)

Agents are role-based personas that enforce the workflow. Each reads state files and follows a procedure.

### planner

**Role**: Feature planning, dependency analysis, Direction Alignment.

**When to call**: Before coding any new feature. "Plan [feature]", "What depends on [module]?", "I need to refactor [area]".

**Key behaviors**:
- **Step 0**: Checks if state files have content. If all empty → runs `bootstrap` first.
- **Direction Alignment**: Verifies the feature against Goals, Non-Goals, and Decision Log. If a direction change is detected → recommends `pivot`.
- Runs `feature-breakdown` and `impact-analysis` skills internally.
- Updates `docs/project-state.md` and `docs/features.md` with the plan.

**Output**: Implementation plan with waves, dependency map changes, and risk notes.

---

### reviewer

**Role**: Code review + State File Audit. Finds issues and auto-fixes where safe.

**When to call**: Before commit or PR. "Review my changes."

**Key behaviors**:
- **Steps 1-5**: Architecture rules, test integrity, security check, failure pattern cross-check.
- **Step 6**: Feature registry check — new features must be in `docs/features.md`.
- **Step 7**: Dependency map check — new modules must be in `docs/dependency-map.md`.
- **Step 8 (State File Audit)**: Verifies that ALL 5 state files were actually updated. Flags missing updates as `[STATE-AUDIT]`.

**Output**: Review result with auto-fixes, warnings, and pass/fail per category.

---

### sprint-manager

**Role**: Sprint/Story state management, scope drift prevention, next step guidance.

**When to call**: "Where are we?", "Story done", "Next task", "New sprint".

**Key behaviors**:
- **Step 0**: Checks if `docs/project-state.md` has content. If empty → recommends `bootstrap`.
- **Next Step Recommendation**: After every status check, recommends the next action based on context (e.g., "Run `learn`", "Continue Story S1-2", "Run `pivot`").
- **Scope Check**: Warns if a file modification is outside current Story scope.

**Output**: Sprint status table with progress, next action recommendation.

---

## Rules (3)

Rules are always-active instructions. LLM reads them automatically — no need to invoke.

### core-rules

**File**: `core-rules.md` (global instructions)

**Contains**:
- **Iron Laws**: 8 hard rules (mock sync, type check, scope compliance, security, 3-failure stop, dependency map registration, feature registry, session handoff)
- **Direction Guard**: Before ANY coding task, reads `docs/project-brief.md` and checks Goals/Non-Goals/Decision Log
- **New Session Bootstrap**: Reads state files at session start
- **Workflow Pipeline**: Defines execution order (bootstrap → planner → code → reviewer → sprint-manager → learn)
- **Completion Status Protocol**: DONE / DONE_WITH_CONCERNS / BLOCKED / NEEDS_CONTEXT

### testing-rules

**File**: `testing-rules.md` (applied to test files only)

**Contains**:
- Interface changes require mock updates in the same commit
- Mocks must implement ALL interface methods
- No `any` type casting for mocks
- No `skip` / `only` in committed tests
- No debugging statements in tests

### backend-rules

**File**: `backend-rules.md` (applied to source files only)

**Contains**:
- Follow project architecture patterns strictly
- Read source file before calling constructors (FP-002 prevention)
- No dependency direction violations
- No hardcoded environment variables
- No `git add .` — use explicit per-file staging

---

## State Files (5)

State files persist project knowledge across LLM sessions. They live at the project root.

### docs/project-brief.md — The "Why"

**Purpose**: Project vision, goals, non-goals, and Decision Log.

**Used by**: Direction Guard (every request), planner (Direction Alignment), pivot (source of truth).

**Key sections**:
- **Vision**: One-sentence project description
- **Goals**: 3-5 concrete, measurable goals
- **Non-Goals**: Explicitly out-of-scope items (triggers warnings from planner)
- **Key Technical Decisions**: Architecture and technology choices
- **Decision Log**: Records why decisions were made (Change/Reason/Impact/Alternatives format)

### docs/project-state.md — The "Where"

**Purpose**: Current sprint, stories, and progress tracking.

**Used by**: sprint-manager (core file), reviewer (scope check), planner (sprint context).

**Key sections**:
- **Quick Summary**: 3-line summary updated every session end (what was done / what's in progress / what's next)
- **Story Status**: Table with ID, title, status, assignee
- **Module Registry**: Summary of current modules

### docs/features.md — The "What"

**Purpose**: Living feature registry so LLMs know what exists in the project.

**Used by**: planner (what already exists), reviewer (feature registry check), learn (feature updates).

**Key sections**:
- **Feature List**: Table with feature name, status (✅ done / 🔧 active / ⬜ planned / ❌ dropped), key files, test files, owner

### docs/dependency-map.md — The "How"

**Purpose**: Module dependency graph for impact analysis.

**Used by**: impact-analysis (blast radius), feature-breakdown (dependency order), planner (architecture understanding).

**Key sections**:
- **Module Registry**: Table with module, layer, purpose, depends on, depended by
- **Dependency Rules**: No circular deps, layer direction enforcement, interface boundaries

### docs/failure-patterns.md — The "Watch Out"

**Purpose**: Project-specific failure log that prevents repeat mistakes.

**Used by**: reviewer (cross-check), investigate (pattern matching), learn (pattern recording).

**Key sections**:
- **FP-NNN entries**: Each with Occurred, Frequency, Cause, Prevention, Applied in, Status
- Pre-loaded templates: FP-001 (Mock not updated), FP-002 (Type confusion), FP-003 (Scope drift), FP-004 (Dangerous file committed)

---

## Workflow Pipeline

### New Feature
```
bootstrap (if state files empty) → planner → [code] → reviewer → sprint-manager → learn
```

### Bug Fix
```
investigate → [fix] → test-integrity → reviewer → learn
```

### Session Lifecycle
```
[session start] → sprint-manager ("where are we?") → [work] → learn → [session end]
```

### Direction Change
```
pivot → [resume normal workflow]
```

---

## Templates

Templates are in `templates/` for creating custom skills, agents, and rules:

- `skill.template.md` — Skill file template with required sections
- `agent.template.md` — Agent file template with role, skills, procedure
- `instructions.template.md` — File-scoped rule template with applyTo pattern
