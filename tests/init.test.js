'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { run, detectLanguage, runDoctor, runValidate } = require('../src/init');

// Helper: create a temp directory and clean up after
function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'harness-test-'));
}

function rmDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

// ─── File count expectations per IDE ────────────────────────
const EXPECTED_FILES = {
  vscode: {
    count: 25,
    required: [
      '.github/copilot-instructions.md',
      '.github/skills/sync-tests/SKILL.md',
      '.github/skills/debug/SKILL.md',
      '.github/skills/setup/SKILL.md',
      '.github/skills/wrap-up/SKILL.md',
      '.github/skills/pivot/SKILL.md',
      '.github/skills/pr-review/SKILL.md',
      '.github/skills/release/SKILL.md',
      '.github/agents/reviewer.agent.md',
      '.github/agents/architect.agent.md',
      'docs/project-state.md',
      'docs/features.md',
      'docs/agent-memory/architect.md',
    ],
  },
  claude: {
    count: 26,
    required: [
      'CLAUDE.md',
      '.claude/rules/core.md',
      '.claude/skills/sync-tests/SKILL.md',
      '.claude/skills/secure/SKILL.md',
      '.claude/skills/setup/SKILL.md',
      '.claude/skills/wrap-up/SKILL.md',
      '.claude/skills/pivot/SKILL.md',
      '.claude/skills/pr-review/SKILL.md',
      '.claude/skills/release/SKILL.md',
      '.claude/agents/reviewer.md',
      '.claude/agents/pm.md',
      '.claude/agents/lead.md',
      '.claude/agents/architect.md',
      'docs/project-state.md',
    ],
  },
  cursor: {
    count: 26,
    required: [
      '.cursor/rules/core.mdc',
      '.cursor/rules/reviewer.mdc',
      '.cursor/rules/pm.mdc',
      '.cursor/rules/lead.mdc',
      '.cursor/rules/architect.mdc',
      'AGENTS.md',
      '.agents/skills/sync-tests/SKILL.md',
      '.agents/skills/setup/SKILL.md',
      '.agents/skills/wrap-up/SKILL.md',
      '.agents/skills/pivot/SKILL.md',
      '.agents/skills/pr-review/SKILL.md',
      '.agents/skills/release/SKILL.md',
      'docs/project-state.md',
    ],
  },
  codex: {
    count: 25,
    required: [
      'AGENTS.md',
      '.agents/skills/sync-tests/SKILL.md',
      '.agents/skills/debug/SKILL.md',
      '.agents/skills/setup/SKILL.md',
      '.agents/skills/wrap-up/SKILL.md',
      '.agents/skills/pivot/SKILL.md',
      '.agents/skills/pr-review/SKILL.md',
      '.agents/skills/release/SKILL.md',
      '.codex/agents/reviewer.toml',
      '.codex/agents/pm.toml',
      '.codex/agents/lead.toml',
      '.codex/agents/architect.toml',
      'docs/project-state.md',
    ],
  },
  windsurf: {
    count: 25,
    required: [
      '.windsurf/rules/core.md',
      '.windsurf/skills/sync-tests/SKILL.md',
      '.windsurf/skills/setup/SKILL.md',
      '.windsurf/skills/wrap-up/SKILL.md',
      '.windsurf/skills/pivot/SKILL.md',
      '.windsurf/skills/pr-review/SKILL.md',
      '.windsurf/skills/release/SKILL.md',
      '.windsurf/skills/reviewer/SKILL.md',
      '.windsurf/skills/architect/SKILL.md',
      'docs/project-state.md',
    ],
  },
  antigravity: {
    count: 26,
    required: [
      'AGENTS.md',
      '.agents/rules/core.md',
      '.agents/rules/reviewer.md',
      '.agents/rules/pm.md',
      '.agents/rules/lead.md',
      '.agents/rules/architect.md',
      '.agents/skills/sync-tests/SKILL.md',
      '.agents/skills/setup/SKILL.md',
      '.agents/skills/wrap-up/SKILL.md',
      '.agents/skills/pivot/SKILL.md',
      '.agents/skills/pr-review/SKILL.md',
      '.agents/skills/release/SKILL.md',
      'docs/project-state.md',
    ],
  },
};

// Count all files recursively
function countFiles(dir) {
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      count += countFiles(path.join(dir, entry.name));
    } else {
      count++;
    }
  }
  return count;
}

// ─── Tests ──────────────────────────────────────────────────

describe('harness init', () => {
  for (const [ide, spec] of Object.entries(EXPECTED_FILES)) {
    describe(`--ide ${ide}`, () => {
      let tmpDir;

      before(async () => {
        tmpDir = makeTmpDir();
        // Suppress console output during tests
        const origLog = console.log;
        console.log = () => {};
        await run(['init', '--ide', ide, '--mode', 'solo', '--dir', tmpDir]);
        console.log = origLog;
      });

      after(() => {
        rmDir(tmpDir);
      });

      it(`generates exactly ${spec.count} files`, () => {
        assert.equal(countFiles(tmpDir), spec.count);
      });

      for (const file of spec.required) {
        it(`creates ${file}`, () => {
          const fullPath = path.join(tmpDir, file);
          assert.ok(fs.existsSync(fullPath), `Missing: ${file}`);
        });
      }
    });
  }

  describe('SKILL.md frontmatter', () => {
    let tmpDir;

    before(async () => {
      tmpDir = makeTmpDir();
      const origLog = console.log;
      console.log = () => {};
      await run(['init', '--ide', 'vscode', '--mode', 'solo', '--dir', tmpDir]);
      console.log = origLog;
    });

    after(() => {
      rmDir(tmpDir);
    });

    it('VS Code skills have name/description frontmatter', () => {
      const content = fs.readFileSync(
        path.join(tmpDir, '.github/skills/sync-tests/SKILL.md'),
        'utf8',
      );
      assert.ok(content.startsWith('---\n'), 'Missing frontmatter opening');
      assert.ok(content.includes('name: sync-tests'), 'Missing name field');
      assert.ok(content.includes('description:'), 'Missing description field');
    });

    it('VS Code agents have name/description frontmatter', () => {
      const content = fs.readFileSync(
        path.join(tmpDir, '.github/agents/reviewer.agent.md'),
        'utf8',
      );
      assert.ok(content.startsWith('---\n'), 'Missing frontmatter opening');
      assert.ok(content.includes('name: reviewer'), 'Missing name field');
    });
  });

  // ─── IDE-specific dispatcher / format checks (multi-IDE coverage) ──
  describe('IDE-specific dispatcher and agent formats', () => {
    async function build(ide) {
      const tmpDir = makeTmpDir();
      const origLog = console.log;
      console.log = () => {};
      await run(['init', '--ide', ide, '--mode', 'solo', '--batch', '--dir', tmpDir]);
      console.log = origLog;
      return tmpDir;
    }

    it('Claude writes CLAUDE.md at project root with dispatcher content', async () => {
      const dir = await build('claude');
      const claudeMd = path.join(dir, 'CLAUDE.md');
      assert.ok(fs.existsSync(claudeMd), 'CLAUDE.md missing — Claude Code will not auto-load instructions');
      const content = fs.readFileSync(claudeMd, 'utf8');
      assert.ok(content.includes('## Session Start'), 'CLAUDE.md should contain dispatcher content');
      assert.ok(content.includes('Iron Laws'), 'CLAUDE.md should contain Iron Laws');
      rmDir(dir);
    });

    it('Cursor writes AGENTS.md at root (Cursor CLI compatibility)', async () => {
      const dir = await build('cursor');
      const agentsMd = path.join(dir, 'AGENTS.md');
      assert.ok(fs.existsSync(agentsMd), 'AGENTS.md missing — Cursor CLI will not pick up rules');
      rmDir(dir);
    });

    it('Cursor core.mdc has alwaysApply frontmatter', async () => {
      const dir = await build('cursor');
      const content = fs.readFileSync(path.join(dir, '.cursor/rules/core.mdc'), 'utf8');
      assert.ok(content.startsWith('---\n'), 'core.mdc missing frontmatter');
      assert.ok(content.includes('alwaysApply: true'), 'core.mdc must declare alwaysApply: true');
      rmDir(dir);
    });

    it('Codex writes agents as TOML (.toml), not markdown', async () => {
      const dir = await build('codex');
      for (const agent of ['reviewer', 'pm', 'lead', 'architect']) {
        const tomlPath = path.join(dir, '.codex/agents', `${agent}.toml`);
        const mdPath = path.join(dir, '.codex/agents', `${agent}.md`);
        assert.ok(fs.existsSync(tomlPath), `Missing TOML agent: ${agent}.toml`);
        assert.ok(!fs.existsSync(mdPath), `Stale markdown agent should not exist: ${agent}.md`);
        const content = fs.readFileSync(tomlPath, 'utf8');
        assert.ok(content.includes(`name = "${agent}"`), `${agent}.toml missing name field`);
        assert.ok(content.includes('description = '), `${agent}.toml missing description field`);
        assert.ok(content.includes('developer_instructions = '), `${agent}.toml missing developer_instructions field`);
      }
      rmDir(dir);
    });

    it('Codex AGENTS.md contains dispatcher (only file Codex CLI auto-loads)', async () => {
      const dir = await build('codex');
      const content = fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8');
      assert.ok(content.includes('## Session Start'), 'AGENTS.md must carry dispatcher');
      assert.ok(content.includes('Iron Laws'), 'AGENTS.md must include Iron Laws');
      rmDir(dir);
    });

    it('Windsurf core.md has trigger: always_on frontmatter', async () => {
      const dir = await build('windsurf');
      const content = fs.readFileSync(path.join(dir, '.windsurf/rules/core.md'), 'utf8');
      assert.ok(content.startsWith('---\n'), 'core.md missing frontmatter');
      assert.ok(content.includes('trigger: always_on'), 'core.md must use trigger: always_on');
      rmDir(dir);
    });

    it('Antigravity writes AGENTS.md + .agents/rules/core.md (no project-root GEMINI.md)', async () => {
      const dir = await build('antigravity');
      assert.ok(fs.existsSync(path.join(dir, 'AGENTS.md')), 'Missing AGENTS.md (cross-tool compat)');
      assert.ok(fs.existsSync(path.join(dir, '.agents/rules/core.md')), 'Missing .agents/rules/core.md (Antigravity workspace rules)');
      assert.ok(!fs.existsSync(path.join(dir, 'GEMINI.md')), 'Antigravity should not emit project-root GEMINI.md (global only at ~/.gemini/GEMINI.md)');
      rmDir(dir);
    });

    it('Antigravity does NOT create legacy .gemini/ directory (regression guard)', async () => {
      const dir = await build('antigravity');
      assert.ok(!fs.existsSync(path.join(dir, '.gemini')),
        'Antigravity must not create .gemini/ — official spec uses .agents/ (workspace) and ~/.gemini/ (global only)');
      rmDir(dir);
    });

    it('Cursor does NOT create unofficial .cursor/skills/ or .cursor/agents/ (regression guard)', async () => {
      const dir = await build('cursor');
      assert.ok(!fs.existsSync(path.join(dir, '.cursor/skills')),
        'Cursor must not create .cursor/skills/ — not in Cursor official docs; use .agents/skills/ (cross-tool)');
      assert.ok(!fs.existsSync(path.join(dir, '.cursor/agents')),
        'Cursor must not create .cursor/agents/ — not in Cursor official docs; agents live in .cursor/rules/<id>.mdc');
      rmDir(dir);
    });

    it('VS Code keeps single-source dispatcher at .github/copilot-instructions.md', async () => {
      const dir = await build('vscode');
      assert.ok(fs.existsSync(path.join(dir, '.github/copilot-instructions.md')));
      // VS Code generator must not also write AGENTS.md/CLAUDE.md/GEMINI.md (backward compat)
      assert.ok(!fs.existsSync(path.join(dir, 'AGENTS.md')), 'VS Code should not emit AGENTS.md');
      assert.ok(!fs.existsSync(path.join(dir, 'CLAUDE.md')), 'VS Code should not emit CLAUDE.md');
      assert.ok(!fs.existsSync(path.join(dir, 'GEMINI.md')), 'VS Code should not emit GEMINI.md');
      rmDir(dir);
    });
  });

  describe('--overwrite behavior', () => {
    let tmpDir;

    before(() => {
      tmpDir = makeTmpDir();
    });

    after(() => {
      rmDir(tmpDir);
    });

    it('skips existing files without --overwrite', async () => {
      const origLog = console.log;
      console.log = () => {};
      await run(['init', '--ide', 'windsurf', '--mode', 'solo', '--batch', '--dir', tmpDir]);
      console.log = origLog;

      // Modify a file
      const statePath = path.join(tmpDir, 'docs/project-state.md');
      fs.writeFileSync(statePath, 'CUSTOM CONTENT', 'utf8');

      // Run again without --overwrite (batch mode skips interactive prompt)
      const skipped = [];
      console.log = (msg) => {
        if (msg && msg.includes('Skipped')) skipped.push(msg);
      };
      await run(['init', '--ide', 'windsurf', '--mode', 'solo', '--batch', '--dir', tmpDir]);
      console.log = origLog;

      assert.ok(skipped.length > 0, 'Should have skipped existing files');
      const content = fs.readFileSync(statePath, 'utf8');
      assert.equal(content, 'CUSTOM CONTENT', 'Should preserve existing file');
    });

    it('backs up existing IDE files before overwriting them', async () => {
      const dir = makeTmpDir();
      const origLog = console.log;
      console.log = () => {};

      try {
        await run(['init', '--ide', 'vscode', '--mode', 'solo', '--batch', '--dir', dir]);

        const dispatcherPath = path.join(dir, '.github/copilot-instructions.md');
        fs.writeFileSync(dispatcherPath, 'CUSTOM IDE CONFIG', 'utf8');

        await run(['init', '--ide', 'vscode', '--mode', 'solo', '--batch', '--dir', dir]);

        const backupRoot = path.join(dir, '.harness/init-backups');
        const backupRuns = fs.readdirSync(backupRoot);
        assert.equal(backupRuns.length, 1, 'Should create one backup run directory');

        const backupPath = path.join(backupRoot, backupRuns[0], '.github/copilot-instructions.md');
        assert.equal(fs.readFileSync(backupPath, 'utf8'), 'CUSTOM IDE CONFIG');
        assert.notEqual(fs.readFileSync(dispatcherPath, 'utf8'), 'CUSTOM IDE CONFIG');
      } finally {
        console.log = origLog;
        rmDir(dir);
      }
    });
  });

  describe('invalid IDE', () => {
    it('exits with error for unknown IDE', async () => {
      const origExit = process.exit;
      const origError = console.error;
      let exitCode = null;
      let errorMsg = '';

      process.exit = (code) => {
        exitCode = code;
        throw new Error('EXIT');
      };
      console.error = (msg) => { errorMsg += msg; };

      try {
        await run(['init', '--ide', 'nonexistent']);
      } catch (e) {
        // expected
      }

      process.exit = origExit;
      console.error = origError;

      assert.equal(exitCode, 1);
      assert.ok(errorMsg.includes('Unknown IDE'), 'Should show unknown IDE error');
    });
  });

  describe('--version flag', () => {
    it('prints version and exits with code 0', async () => {
      const origExit = process.exit;
      const origLog = console.log;
      let exitCode = null;
      let output = '';

      process.exit = (code) => {
        exitCode = code;
        throw new Error('EXIT');
      };
      console.log = (msg) => { output += msg; };

      try {
        await run(['--version']);
      } catch (e) {
        // expected
      }

      process.exit = origExit;
      console.log = origLog;

      assert.equal(exitCode, 0);
      assert.match(output, /^\d+\.\d+\.\d+/, 'Should print semver version');
    });
  });

  describe('language detection', () => {
    it('detects Python from requirements.txt', () => {
      const tmpDir = makeTmpDir();
      fs.writeFileSync(path.join(tmpDir, 'requirements.txt'), 'flask\n');
      assert.equal(detectLanguage(tmpDir), 'python');
      rmDir(tmpDir);
    });

    it('detects Python from pyproject.toml', () => {
      const tmpDir = makeTmpDir();
      fs.writeFileSync(path.join(tmpDir, 'pyproject.toml'), '[project]\n');
      assert.equal(detectLanguage(tmpDir), 'python');
      rmDir(tmpDir);
    });

    it('detects Go from go.mod', () => {
      const tmpDir = makeTmpDir();
      fs.writeFileSync(path.join(tmpDir, 'go.mod'), 'module example\n');
      assert.equal(detectLanguage(tmpDir), 'go');
      rmDir(tmpDir);
    });

    it('detects Java from pom.xml', () => {
      const tmpDir = makeTmpDir();
      fs.writeFileSync(path.join(tmpDir, 'pom.xml'), '<project/>\n');
      assert.equal(detectLanguage(tmpDir), 'java');
      rmDir(tmpDir);
    });

    it('detects Java from build.gradle', () => {
      const tmpDir = makeTmpDir();
      fs.writeFileSync(path.join(tmpDir, 'build.gradle'), 'plugins {}\n');
      assert.equal(detectLanguage(tmpDir), 'java');
      rmDir(tmpDir);
    });

    it('detects Rust from Cargo.toml', () => {
      const tmpDir = makeTmpDir();
      fs.writeFileSync(path.join(tmpDir, 'Cargo.toml'), '[package]\n');
      assert.equal(detectLanguage(tmpDir), 'rust');
      rmDir(tmpDir);
    });

    it('detects Ruby from Gemfile', () => {
      const tmpDir = makeTmpDir();
      fs.writeFileSync(path.join(tmpDir, 'Gemfile'), 'source "https://rubygems.org"\n');
      assert.equal(detectLanguage(tmpDir), 'ruby');
      rmDir(tmpDir);
    });

    it('detects C# from global.json', () => {
      const tmpDir = makeTmpDir();
      fs.writeFileSync(path.join(tmpDir, 'global.json'), '{"sdk":{}}\n');
      assert.equal(detectLanguage(tmpDir), 'csharp');
      rmDir(tmpDir);
    });

    it('detects PHP from composer.json', () => {
      const tmpDir = makeTmpDir();
      fs.writeFileSync(path.join(tmpDir, 'composer.json'), '{"require":{}}\n');
      assert.equal(detectLanguage(tmpDir), 'php');
      rmDir(tmpDir);
    });

    it('detects Swift from Package.swift', () => {
      const tmpDir = makeTmpDir();
      fs.writeFileSync(path.join(tmpDir, 'Package.swift'), 'import PackageDescription\n');
      assert.equal(detectLanguage(tmpDir), 'swift');
      rmDir(tmpDir);
    });

    it('detects Dart from pubspec.yaml', () => {
      const tmpDir = makeTmpDir();
      fs.writeFileSync(path.join(tmpDir, 'pubspec.yaml'), 'name: myapp\n');
      assert.equal(detectLanguage(tmpDir), 'dart');
      rmDir(tmpDir);
    });

    it('defaults to typescript for empty directory', () => {
      const tmpDir = makeTmpDir();
      assert.equal(detectLanguage(tmpDir), 'typescript');
      rmDir(tmpDir);
    });
  });

  describe('language-aware globs', () => {
    it('core.md should only have core rules, not testing/backend', async () => {
      const tmpDir = makeTmpDir();
      fs.writeFileSync(path.join(tmpDir, 'requirements.txt'), 'flask\n');

      const origLog = console.log;
      console.log = () => {};
      await run(['init', '--ide', 'claude', '--mode', 'solo', '--dir', tmpDir]);
      console.log = origLog;

      // core.md should only have core rules, not testing/backend
      const core = fs.readFileSync(
        path.join(tmpDir, '.claude/rules/core.md'),
        'utf8',
      );
      assert.ok(!core.includes('No `any` type casting'), 'core.md should NOT contain testing rules');

      rmDir(tmpDir);
    });
  });

  // ─── Team mode tests ────────────────────────────────────────

  describe('team mode', () => {
    describe('file placement (vscode)', () => {
      let tmpDir;

      before(async () => {
        tmpDir = makeTmpDir();
        const origLog = console.log;
        console.log = () => {};
        await run(['init', '--ide', 'vscode', '--mode', 'team', '--dir', tmpDir]);
        console.log = origLog;
      });

      after(() => {
        rmDir(tmpDir);
      });

      it('places personal state files in .harness/', () => {
        assert.ok(fs.existsSync(path.join(tmpDir, '.harness/project-state.md')), 'Missing .harness/project-state.md');
        assert.ok(fs.existsSync(path.join(tmpDir, '.harness/failure-patterns.md')), 'Missing .harness/failure-patterns.md');
      });

      it('places agent-memory in .harness/', () => {
        assert.ok(fs.existsSync(path.join(tmpDir, '.harness/agent-memory/reviewer.md')), 'Missing .harness/agent-memory/reviewer.md');
        assert.ok(fs.existsSync(path.join(tmpDir, '.harness/agent-memory/pm.md')), 'Missing .harness/agent-memory/pm.md');
        assert.ok(fs.existsSync(path.join(tmpDir, '.harness/agent-memory/lead.md')), 'Missing .harness/agent-memory/lead.md');
        assert.ok(fs.existsSync(path.join(tmpDir, '.harness/agent-memory/architect.md')), 'Missing .harness/agent-memory/architect.md');
      });

      it('places shared state files in docs/', () => {
        assert.ok(fs.existsSync(path.join(tmpDir, 'docs/features.md')), 'Missing docs/features.md');
        assert.ok(fs.existsSync(path.join(tmpDir, 'docs/dependency-map.md')), 'Missing docs/dependency-map.md');
        assert.ok(fs.existsSync(path.join(tmpDir, 'docs/project-brief.md')), 'Missing docs/project-brief.md');
      });

      it('does NOT place personal files in docs/', () => {
        assert.ok(!fs.existsSync(path.join(tmpDir, 'docs/project-state.md')), 'docs/project-state.md should not exist in team mode');
        assert.ok(!fs.existsSync(path.join(tmpDir, 'docs/failure-patterns.md')), 'docs/failure-patterns.md should not exist in team mode');
      });

      it('generates total 27 files (25 base + .gitignore + .gitattributes)', () => {
        assert.equal(countFiles(tmpDir), 27);
      });
    });

    describe('content resolution (vscode)', () => {
      let tmpDir;

      before(async () => {
        tmpDir = makeTmpDir();
        const origLog = console.log;
        console.log = () => {};
        await run(['init', '--ide', 'vscode', '--mode', 'team', '--dir', tmpDir]);
        console.log = origLog;
      });

      after(() => {
        rmDir(tmpDir);
      });

      it('core-rules contain Team Mode section', () => {
        const content = fs.readFileSync(path.join(tmpDir, '.github/copilot-instructions.md'), 'utf8');
        assert.ok(content.includes('## Team Mode'), 'Missing Team Mode section');
        assert.ok(content.includes('.harness/'), 'Missing .harness/ reference');
      });

      it('skills reference .harness/ for personal files', () => {
        const content = fs.readFileSync(path.join(tmpDir, '.github/skills/setup/SKILL.md'), 'utf8');
        assert.ok(content.includes('.harness/project-state.md') || !content.includes('docs/project-state.md'),
          'Should reference .harness/ instead of docs/ for personal files');
      });

      it('skills still reference docs/ for shared files', () => {
        const content = fs.readFileSync(path.join(tmpDir, '.github/skills/setup/SKILL.md'), 'utf8');
        if (content.includes('features.md')) {
          assert.ok(content.includes('docs/features.md'), 'Shared files should remain in docs/');
        }
      });
    });

    describe('git helpers', () => {
      let tmpDir;

      before(async () => {
        tmpDir = makeTmpDir();
        const origLog = console.log;
        console.log = () => {};
        await run(['init', '--ide', 'cursor', '--mode', 'team', '--dir', tmpDir]);
        console.log = origLog;
      });

      after(() => {
        rmDir(tmpDir);
      });

      it('creates .gitignore with .harness/ entry', () => {
        const content = fs.readFileSync(path.join(tmpDir, '.gitignore'), 'utf8');
        assert.ok(content.includes('.harness/'), '.gitignore should contain .harness/');
      });

      it('creates .gitattributes with merge=union', () => {
        const content = fs.readFileSync(path.join(tmpDir, '.gitattributes'), 'utf8');
        assert.ok(content.includes('docs/features.md merge=union'), 'Missing features.md merge=union');
        assert.ok(content.includes('docs/dependency-map.md merge=union'), 'Missing dependency-map.md merge=union');
      });

      it('does not duplicate .gitignore entry on re-run', async () => {
        const origLog = console.log;
        console.log = () => {};
        await run(['init', '--ide', 'cursor', '--mode', 'team', '--dir', tmpDir]);
        console.log = origLog;

        const content = fs.readFileSync(path.join(tmpDir, '.gitignore'), 'utf8');
        const matches = content.match(/\.harness\//g);
        assert.equal(matches.length, 1, '.harness/ should appear only once in .gitignore');
      });
    });

    describe('all 6 IDEs team mode file count', () => {
      for (const [ide, spec] of Object.entries(EXPECTED_FILES)) {
        const teamCount = spec.count + 2; // +.gitignore +.gitattributes
        it(`--ide ${ide} --mode team generates ${teamCount} files`, async () => {
          const tmpDir = makeTmpDir();
          const origLog = console.log;
          console.log = () => {};
          await run(['init', '--ide', ide, '--mode', 'team', '--dir', tmpDir]);
          console.log = origLog;

          assert.equal(countFiles(tmpDir), teamCount, `${ide} team mode should have ${teamCount} files`);
          rmDir(tmpDir);
        });
      }
    });

    describe('solo mode does NOT create team extras', () => {
      let tmpDir;

      before(async () => {
        tmpDir = makeTmpDir();
        const origLog = console.log;
        console.log = () => {};
        await run(['init', '--ide', 'vscode', '--mode', 'solo', '--dir', tmpDir]);
        console.log = origLog;
      });

      after(() => {
        rmDir(tmpDir);
      });

      it('does not create .gitignore', () => {
        assert.ok(!fs.existsSync(path.join(tmpDir, '.gitignore')), '.gitignore should not exist in solo mode');
      });

      it('does not create .gitattributes', () => {
        assert.ok(!fs.existsSync(path.join(tmpDir, '.gitattributes')), '.gitattributes should not exist in solo mode');
      });

      it('does not create .harness/ directory', () => {
        assert.ok(!fs.existsSync(path.join(tmpDir, '.harness')), '.harness/ should not exist in solo mode');
      });

      it('core-rules do NOT contain Team Mode section', () => {
        const content = fs.readFileSync(path.join(tmpDir, '.github/copilot-instructions.md'), 'utf8');
        assert.ok(!content.includes('## Team Mode'), 'Solo mode should not have Team Mode section');
      });
    });
  });

  // ─── CLI parsing ───────────────────────────────────────────

  describe('--team flag', () => {
    it('--team flag sets mode to team', async () => {
      const origExit = process.exit;
      const origLog = console.log;
      const origError = console.error;
      let exitCode = null;

      process.exit = (code) => {
        exitCode = code;
        throw new Error('EXIT');
      };
      console.error = () => {};
      console.log = () => {};

      // Use --team without a mode value but with valid IDE
      const tmpDir = makeTmpDir();
      try {
        await run(['init', '--ide', 'vscode', '--team', '--dir', tmpDir]);
      } catch (e) {
        // only catch EXIT errors
      }
      process.exit = origExit;
      console.error = origError;
      console.log = origLog;

      // If it didn't exit with error, team mode was accepted
      if (exitCode === null) {
        // Check that .harness/ was created (proof of team mode)
        assert.ok(fs.existsSync(path.join(tmpDir, '.harness')), '--team should activate team mode');
      }
      rmDir(tmpDir);
    });

    it('--mode team and --team are equivalent', async () => {
      const tmpDir1 = makeTmpDir();
      const tmpDir2 = makeTmpDir();
      const origLog = console.log;
      console.log = () => {};
      await run(['init', '--ide', 'claude', '--mode', 'team', '--dir', tmpDir1]);
      await run(['init', '--ide', 'claude', '--team', '--dir', tmpDir2]);
      console.log = origLog;

      assert.equal(countFiles(tmpDir1), countFiles(tmpDir2), '--mode team and --team should produce same file count');
      rmDir(tmpDir1);
      rmDir(tmpDir2);
    });

    it('invalid mode exits with error', async () => {
      const origExit = process.exit;
      const origError = console.error;
      let exitCode = null;
      let errorMsg = '';

      process.exit = (code) => {
        exitCode = code;
        throw new Error('EXIT');
      };
      console.error = (msg) => { errorMsg += msg; };

      try {
        await run(['init', '--ide', 'vscode', '--mode', 'invalid']);
      } catch (e) {
        // expected
      }

      process.exit = origExit;
      console.error = origError;

      assert.equal(exitCode, 1);
      assert.ok(errorMsg.includes('Unknown mode'), 'Should show unknown mode error');
    });
  });

  // ─── TEAM_MODE marker tests ──────────────────────────────────

  describe('TEAM_MODE marker handling', () => {
    describe('Solo mode strips Team blocks entirely', () => {
      let tmpDir;
      let soloFiles = {};

      before(async () => {
        tmpDir = makeTmpDir();
        const origLog = console.log;
        console.log = () => {};
        await run(['init', '--ide', 'vscode', '--mode', 'solo', '--dir', tmpDir]);
        console.log = origLog;

        // Read all skills
        const skillDir = path.join(tmpDir, '.github/skills');
        for (const skill of fs.readdirSync(skillDir)) {
          const skillFile = path.join(skillDir, skill, 'SKILL.md');
          if (fs.existsSync(skillFile)) {
            soloFiles[`skill:${skill}`] = fs.readFileSync(skillFile, 'utf8');
          }
        }
        // Read agents
        const agentDir = path.join(tmpDir, '.github/agents');
        if (fs.existsSync(agentDir)) {
          for (const agent of fs.readdirSync(agentDir)) {
            const agentFile = path.join(agentDir, agent);
            if (agentFile.endsWith('.md')) {
              soloFiles[`agent:${path.basename(agent, '.agent.md')}`] = fs.readFileSync(agentFile, 'utf8');
            }
          }
        }
      });

      after(() => {
        rmDir(tmpDir);
      });

      it('no Solo file contains TEAM_MODE markers', () => {
        for (const [name, content] of Object.entries(soloFiles)) {
          assert.ok(!content.includes('TEAM_MODE_START'), `${name} should not contain TEAM_MODE_START`);
          assert.ok(!content.includes('TEAM_MODE_END'), `${name} should not contain TEAM_MODE_END`);
        }
      });

      it('Solo skills do NOT contain Team guidance keywords', () => {
        const teamKeywords = ['Pre-Pull', 'Owner-Scoped', 'Pivot Lock', 'FP Promotion', 'Joining Developer'];
        for (const [name, content] of Object.entries(soloFiles)) {
          for (const kw of teamKeywords) {
            assert.ok(!content.includes(kw), `${name} should not contain Team keyword "${kw}"`);
          }
        }
      });
    });

    describe('Team mode keeps content, removes markers', () => {
      let tmpDir;
      let teamFiles = {};

      before(async () => {
        tmpDir = makeTmpDir();
        const origLog = console.log;
        console.log = () => {};
        await run(['init', '--ide', 'vscode', '--mode', 'team', '--dir', tmpDir]);
        console.log = origLog;

        // Read all skills
        const skillDir = path.join(tmpDir, '.github/skills');
        for (const skill of fs.readdirSync(skillDir)) {
          const skillFile = path.join(skillDir, skill, 'SKILL.md');
          if (fs.existsSync(skillFile)) {
            teamFiles[`skill:${skill}`] = fs.readFileSync(skillFile, 'utf8');
          }
        }
        // Read agents
        const agentDir = path.join(tmpDir, '.github/agents');
        if (fs.existsSync(agentDir)) {
          for (const agent of fs.readdirSync(agentDir)) {
            const agentFile = path.join(agentDir, agent);
            if (agentFile.endsWith('.md')) {
              teamFiles[`agent:${path.basename(agent, '.agent.md')}`] = fs.readFileSync(agentFile, 'utf8');
            }
          }
        }
      });

      after(() => {
        rmDir(tmpDir);
      });

      it('no Team file contains TEAM_MODE markers', () => {
        for (const [name, content] of Object.entries(teamFiles)) {
          assert.ok(!content.includes('TEAM_MODE_START'), `${name} should not contain TEAM_MODE_START`);
          assert.ok(!content.includes('TEAM_MODE_END'), `${name} should not contain TEAM_MODE_END`);
        }
      });

      it('Team setup contains onboarding guidance', () => {
        const content = teamFiles['skill:setup'];
        assert.ok(content, 'setup skill should exist');
        assert.ok(content.includes('Joining Developer'), 'Team setup should have Joining Developer guidance');
      });

      it('Team wrap-up contains Pre-Pull guidance', () => {
        const content = teamFiles['skill:wrap-up'];
        assert.ok(content, 'wrap-up skill should exist');
        assert.ok(content.includes('Pre-Pull'), 'Team wrap-up should have Pre-Pull guidance');
      });

      it('Team pivot contains Pivot Lock guidance', () => {
        const content = teamFiles['skill:pivot'];
        assert.ok(content, 'pivot skill should exist');
        assert.ok(content.includes('Pivot Lock'), 'Team pivot should have Pivot Lock guidance');
      });

      it('Team reviewer contains Owner-Scoped guidance', () => {
        const content = teamFiles['agent:reviewer'];
        assert.ok(content, 'reviewer agent should exist');
        assert.ok(content.includes('Owner-Scoped'), 'Team reviewer should have Owner-Scoped guidance');
      });

      it('Team pm contains team coordination', () => {
        const content = teamFiles['agent:pm'];
        assert.ok(content, 'pm agent should exist');
        assert.ok(content.includes('Owner-Aware'), 'Team pm should have Owner-Aware guidance');
      });

      it('Team lead has ownership context', () => {
        const content = teamFiles['agent:lead'];
        assert.ok(content, 'lead agent should exist');
        assert.ok(content.includes('Ownership'), 'Team lead should have Ownership guidance');
      });
    });

    describe('Team mode content line count > Solo', () => {
      let soloLen = 0;
      let teamLen = 0;

      before(async () => {
        const soloDir = makeTmpDir();
        const teamDir = makeTmpDir();
        const origLog = console.log;
        console.log = () => {};
        await run(['init', '--ide', 'claude', '--mode', 'solo', '--dir', soloDir]);
        await run(['init', '--ide', 'claude', '--mode', 'team', '--dir', teamDir]);
        console.log = origLog;

        // Sum up all skill + agent file lengths
        for (const dir of ['.claude/skills']) {
          const base = path.join(soloDir, dir);
          if (fs.existsSync(base)) {
            for (const skill of fs.readdirSync(base)) {
              const f = path.join(base, skill, 'SKILL.md');
              if (fs.existsSync(f)) soloLen += fs.readFileSync(f, 'utf8').length;
            }
          }
          const baseT = path.join(teamDir, dir);
          if (fs.existsSync(baseT)) {
            for (const skill of fs.readdirSync(baseT)) {
              const f = path.join(baseT, skill, 'SKILL.md');
              if (fs.existsSync(f)) teamLen += fs.readFileSync(f, 'utf8').length;
            }
          }
        }
        // Also sum agent files (.claude/agents/*.md)
        const soloAgents = path.join(soloDir, '.claude/agents');
        if (fs.existsSync(soloAgents)) {
          for (const a of fs.readdirSync(soloAgents)) {
            if (a.endsWith('.md')) soloLen += fs.readFileSync(path.join(soloAgents, a), 'utf8').length;
          }
        }
        const teamAgents = path.join(teamDir, '.claude/agents');
        if (fs.existsSync(teamAgents)) {
          for (const a of fs.readdirSync(teamAgents)) {
            if (a.endsWith('.md')) teamLen += fs.readFileSync(path.join(teamAgents, a), 'utf8').length;
          }
        }

        rmDir(soloDir);
        rmDir(teamDir);
      });

      it('Team skills have more content than Solo (Team blocks preserved)', () => {
        assert.ok(teamLen > soloLen, `Team content (${teamLen}) should be larger than Solo (${soloLen})`);
      });
    });
  });

  // ─── CREW_MODE marker tests ─────────────────────────────────

  describe('CREW_MODE marker handling', () => {
    describe('Solo without --crew strips Crew blocks entirely', () => {
      let tmpDir;
      let soloFiles = {};

      before(async () => {
        tmpDir = makeTmpDir();
        const origLog = console.log;
        console.log = () => {};
        await run(['init', '--ide', 'vscode', '--mode', 'solo', '--dir', tmpDir]);
        console.log = origLog;

        // Read all skills
        const skillDir = path.join(tmpDir, '.github/skills');
        for (const skill of fs.readdirSync(skillDir)) {
          const skillFile = path.join(skillDir, skill, 'SKILL.md');
          if (fs.existsSync(skillFile)) {
            soloFiles[`skill:${skill}`] = fs.readFileSync(skillFile, 'utf8');
          }
        }
        // Read agents
        const agentDir = path.join(tmpDir, '.github/agents');
        if (fs.existsSync(agentDir)) {
          for (const agent of fs.readdirSync(agentDir)) {
            const agentFile = path.join(agentDir, agent);
            if (agentFile.endsWith('.md')) {
              soloFiles[`agent:${path.basename(agent, '.agent.md')}`] = fs.readFileSync(agentFile, 'utf8');
            }
          }
        }
        // Read core-rules
        const coreRulesPath = path.join(tmpDir, '.github/copilot-instructions.md');
        if (fs.existsSync(coreRulesPath)) {
          soloFiles['core-rules'] = fs.readFileSync(coreRulesPath, 'utf8');
        }
      });

      after(() => {
        rmDir(tmpDir);
      });

      it('no Solo file contains CREW_MODE markers', () => {
        for (const [name, content] of Object.entries(soloFiles)) {
          assert.ok(!content.includes('CREW_MODE_START'), `${name} should not contain CREW_MODE_START`);
          assert.ok(!content.includes('CREW_MODE_END'), `${name} should not contain CREW_MODE_END`);
        }
      });

      it('Solo files do NOT contain Crew-specific keywords', () => {
        const crewKeywords = ['Phase 1.5', 'Validation Tracker', 'Crew Artifact'];
        for (const [name, content] of Object.entries(soloFiles)) {
          for (const kw of crewKeywords) {
            assert.ok(!content.includes(kw), `${name} should not contain Crew keyword "${kw}"`);
          }
        }
      });

      it('Solo state files do NOT contain CI Artifact Index template', () => {
        const projectBriefPath = path.join(tmpDir, 'docs/project-brief.md');
        assert.ok(fs.existsSync(projectBriefPath), 'docs/project-brief.md should exist');
        const content = fs.readFileSync(projectBriefPath, 'utf8');
        assert.ok(!content.includes('CI Artifact Index'), 'Solo project-brief.md should NOT contain CI Artifact Index');
        assert.ok(!content.includes('CREW_MODE_START'), 'Solo project-brief.md should NOT contain CREW_MODE markers');
      });

      it('Solo rules files do NOT contain CI Standards content', () => {
        const ciKeywords = ['CI Standards Compliance', 'CI Artifact Index', '[CI-STANDARD]'];
        for (const [name, content] of Object.entries(soloFiles)) {
          for (const kw of ciKeywords) {
            assert.ok(!content.includes(kw), `${name} should not contain CI keyword "${kw}"`);
          }
        }
      });
    });

    describe('Solo with --crew keeps Crew content, removes markers', () => {
      let tmpDir;
      let crewFiles = {};

      before(async () => {
        tmpDir = makeTmpDir();
        const origLog = console.log;
        console.log = () => {};
        await run(['init', '--ide', 'vscode', '--mode', 'solo', '--crew', '--dir', tmpDir]);
        console.log = origLog;

        // Read all skills
        const skillDir = path.join(tmpDir, '.github/skills');
        for (const skill of fs.readdirSync(skillDir)) {
          const skillFile = path.join(skillDir, skill, 'SKILL.md');
          if (fs.existsSync(skillFile)) {
            crewFiles[`skill:${skill}`] = fs.readFileSync(skillFile, 'utf8');
          }
        }
        // Read agents
        const agentDir = path.join(tmpDir, '.github/agents');
        if (fs.existsSync(agentDir)) {
          for (const agent of fs.readdirSync(agentDir)) {
            const agentFile = path.join(agentDir, agent);
            if (agentFile.endsWith('.md')) {
              crewFiles[`agent:${path.basename(agent, '.agent.md')}`] = fs.readFileSync(agentFile, 'utf8');
            }
          }
        }
      });

      after(() => {
        rmDir(tmpDir);
      });

      it('no --crew file contains CREW_MODE markers', () => {
        for (const [name, content] of Object.entries(crewFiles)) {
          assert.ok(!content.includes('CREW_MODE_START'), `${name} should not contain CREW_MODE_START`);
          assert.ok(!content.includes('CREW_MODE_END'), `${name} should not contain CREW_MODE_END`);
        }
      });

      it('--crew setup contains Phase 1.5', () => {
        const content = crewFiles['skill:setup'];
        assert.ok(content, 'setup skill should exist');
        assert.ok(content.includes('Phase 1.5'), '--crew setup should have Phase 1.5');
      });

      it('--crew pm contains Crew Artifact', () => {
        const content = crewFiles['agent:pm'];
        assert.ok(content, 'pm agent should exist');
        assert.ok(content.includes('Crew Artifact'), '--crew pm should have Crew Artifact content');
      });

      it('--crew reviewer contains Crew Artifact Compliance', () => {
        const content = crewFiles['agent:reviewer'];
        assert.ok(content, 'reviewer agent should exist');
        assert.ok(content.includes('Crew Artifact'), '--crew reviewer should have Crew Artifact Compliance');
      });

      it('--crew wrap-up contains Validation Tracker', () => {
        const content = crewFiles['skill:wrap-up'];
        assert.ok(content, 'wrap-up skill should exist');
        assert.ok(content.includes('Validation Tracker'), '--crew wrap-up should have Validation Tracker');
      });

      it('--crew lead contains Validation Dashboard', () => {
        const content = crewFiles['agent:lead'];
        assert.ok(content, 'lead agent should exist');
        assert.ok(content.includes('Validation Dashboard'), '--crew lead should have Validation Dashboard');
      });

      it('--crew reviewer contains CI Standards Compliance step', () => {
        const content = crewFiles['agent:reviewer'];
        assert.ok(content, 'reviewer agent should exist');
        assert.ok(content.includes('CI Standards Compliance'), '--crew reviewer should have CI Standards Compliance step');
      });

      it('--crew release contains CI Standards step', () => {
        const content = crewFiles['skill:release'];
        assert.ok(content, 'release skill should exist');
        assert.ok(content.includes('CI Standards'), '--crew release should have CI Standards content');
      });
    });

    describe('Crew content line count > non-crew', () => {
      let noCrewLen = 0;
      let crewLen = 0;

      before(async () => {
        const noCrewDir = makeTmpDir();
        const crewDir = makeTmpDir();
        const origLog = console.log;
        console.log = () => {};
        await run(['init', '--ide', 'claude', '--mode', 'solo', '--dir', noCrewDir]);
        await run(['init', '--ide', 'claude', '--mode', 'solo', '--crew', '--dir', crewDir]);
        console.log = origLog;

        // Sum up all skill + agent file lengths
        for (const dir of ['.claude/skills']) {
          const base = path.join(noCrewDir, dir);
          if (fs.existsSync(base)) {
            for (const skill of fs.readdirSync(base)) {
              const f = path.join(base, skill, 'SKILL.md');
              if (fs.existsSync(f)) noCrewLen += fs.readFileSync(f, 'utf8').length;
            }
          }
          const baseC = path.join(crewDir, dir);
          if (fs.existsSync(baseC)) {
            for (const skill of fs.readdirSync(baseC)) {
              const f = path.join(baseC, skill, 'SKILL.md');
              if (fs.existsSync(f)) crewLen += fs.readFileSync(f, 'utf8').length;
            }
          }
        }
        // Also sum agent files
        const noCrewAgents = path.join(noCrewDir, '.claude/agents');
        if (fs.existsSync(noCrewAgents)) {
          for (const a of fs.readdirSync(noCrewAgents)) {
            if (a.endsWith('.md')) noCrewLen += fs.readFileSync(path.join(noCrewAgents, a), 'utf8').length;
          }
        }
        const crewAgents = path.join(crewDir, '.claude/agents');
        if (fs.existsSync(crewAgents)) {
          for (const a of fs.readdirSync(crewAgents)) {
            if (a.endsWith('.md')) crewLen += fs.readFileSync(path.join(crewAgents, a), 'utf8').length;
          }
        }

        rmDir(noCrewDir);
        rmDir(crewDir);
      });

      it('--crew output has more content than non-crew (Crew blocks preserved)', () => {
        assert.ok(crewLen > noCrewLen, `Crew content (${crewLen}) should be larger than non-crew (${noCrewLen})`);
      });
    });
  });

  // ─── Batch mode tests ──────────────────────────────────────

  describe('--batch mode', () => {
    it('--batch with --ide works without interactive prompts', async () => {
      const tmpDir = makeTmpDir();
      const origLog = console.log;
      console.log = () => {};
      await run(['init', '--ide', 'vscode', '--batch', '--dir', tmpDir]);
      console.log = origLog;

      assert.equal(countFiles(tmpDir), 25, 'Batch mode should generate 25 files (solo default)');
      rmDir(tmpDir);
    });

    it('--batch without --ide exits with error', async () => {
      const origExit = process.exit;
      const origError = console.error;
      const origLog = console.log;
      let exitCode = null;
      let errorMsg = '';

      process.exit = (code) => {
        exitCode = code;
        throw new Error('EXIT');
      };
      console.error = (msg) => { errorMsg += msg; };
      console.log = () => {};

      try {
        await run(['init', '--batch']);
      } catch (e) {
        // expected
      }

      process.exit = origExit;
      console.error = origError;
      console.log = origLog;

      assert.equal(exitCode, 1);
      assert.ok(errorMsg.includes('--batch requires --ide'), 'Should show batch requires IDE error');
    });

    it('--batch defaults to solo mode', async () => {
      const tmpDir = makeTmpDir();
      const origLog = console.log;
      console.log = () => {};
      await run(['init', '--ide', 'claude', '--batch', '--dir', tmpDir]);
      console.log = origLog;

      assert.ok(!fs.existsSync(path.join(tmpDir, '.harness')), 'Batch default should be solo (no .harness/)');
      rmDir(tmpDir);
    });

    it('--batch with --team works', async () => {
      const tmpDir = makeTmpDir();
      const origLog = console.log;
      console.log = () => {};
      await run(['init', '--ide', 'cursor', '--batch', '--team', '--dir', tmpDir]);
      console.log = origLog;

      assert.ok(fs.existsSync(path.join(tmpDir, '.harness')), 'Batch with --team should create .harness/');
      rmDir(tmpDir);
    });
  });

  // ─── Doctor command tests ──────────────────────────────────

  describe('doctor command', () => {
    it('returns true for a fully installed project', async () => {
      const tmpDir = makeTmpDir();
      const origLog = console.log;
      console.log = () => {};
      await run(['init', '--ide', 'vscode', '--mode', 'solo', '--dir', tmpDir]);

      const result = runDoctor(tmpDir);
      console.log = origLog;

      assert.equal(result, true, 'Doctor should pass for fully installed project');
      rmDir(tmpDir);
    });

    it('returns false for empty directory', () => {
      const tmpDir = makeTmpDir();
      const origLog = console.log;
      console.log = () => {};

      const result = runDoctor(tmpDir);
      console.log = origLog;

      assert.equal(result, false, 'Doctor should fail for empty directory');
      rmDir(tmpDir);
    });

    it('detects team mode', async () => {
      const tmpDir = makeTmpDir();
      const origLog = console.log;
      const logs = [];
      console.log = (msg) => { if (msg) logs.push(msg); };
      await run(['init', '--ide', 'claude', '--mode', 'team', '--dir', tmpDir]);
      logs.length = 0;

      runDoctor(tmpDir);
      console.log = origLog;

      const output = logs.join('\n');
      assert.ok(output.includes('Team'), 'Doctor should detect team mode');
      rmDir(tmpDir);
    });
  });

  // ─── Validate command tests ────────────────────────────────

  describe('validate command', () => {
    it('returns false for placeholder-only state files', async () => {
      const tmpDir = makeTmpDir();
      const origLog = console.log;
      console.log = () => {};
      await run(['init', '--ide', 'vscode', '--mode', 'solo', '--dir', tmpDir]);

      const result = runValidate(tmpDir);
      console.log = origLog;

      // Freshly installed state files only have placeholders/TODOs
      assert.equal(result, false, 'Validate should fail for placeholder-only files');
      rmDir(tmpDir);
    });

    it('returns false for missing state files', () => {
      const tmpDir = makeTmpDir();
      const origLog = console.log;
      console.log = () => {};

      const result = runValidate(tmpDir);
      console.log = origLog;

      assert.equal(result, false, 'Validate should fail for missing files');
      rmDir(tmpDir);
    });
  });

  // ─── New skills and agents content tests ───────────────────

  describe('new skills and agents', () => {
    let tmpDir;

    before(async () => {
      tmpDir = makeTmpDir();
      const origLog = console.log;
      console.log = () => {};
      await run(['init', '--ide', 'vscode', '--mode', 'solo', '--dir', tmpDir]);
      console.log = origLog;
    });

    after(() => {
      rmDir(tmpDir);
    });

    it('pr-review skill has direction alignment step', () => {
      const content = fs.readFileSync(
        path.join(tmpDir, '.github/skills/pr-review/SKILL.md'),
        'utf8',
      );
      assert.ok(content.includes('Direction Alignment'), 'pr-review should have direction alignment');
    });

    it('release skill has version check step', () => {
      const content = fs.readFileSync(
        path.join(tmpDir, '.github/skills/release/SKILL.md'),
        'utf8',
      );
      assert.ok(content.includes('Version Check'), 'release should have version check');
    });

    it('architect agent has design evaluation', () => {
      const content = fs.readFileSync(
        path.join(tmpDir, '.github/agents/architect.agent.md'),
        'utf8',
      );
      assert.ok(content.includes('Design Evaluation'), 'architect should have design evaluation');
    });

    it('core-rules contains Iron Laws', () => {
      const content = fs.readFileSync(
        path.join(tmpDir, '.github/copilot-instructions.md'),
        'utf8',
      );
      assert.ok(content.includes('Iron Laws'), 'core-rules should contain Iron Laws');
    });

    it('state-check skill is generated with frontmatter', () => {
      const content = fs.readFileSync(
        path.join(tmpDir, '.github/skills/state-check/SKILL.md'),
        'utf8',
      );
      assert.ok(content.startsWith('---\n'), 'Missing frontmatter opening');
      assert.ok(content.includes('name: state-check'), 'Missing name field');
      assert.ok(content.includes('Deterministic'), 'Missing description');
      assert.ok(content.includes('PASS') && content.includes('WARN') && content.includes('FAIL'),
        'state-check should describe PASS/WARN/FAIL outcomes');
    });

    it('core-rules contains Iron Law #10 (Self-Verify) and Confirmation Gate Defaults', () => {
      const content = fs.readFileSync(
        path.join(tmpDir, '.github/copilot-instructions.md'),
        'utf8',
      );
      assert.ok(content.includes('Self-Verify'), 'core-rules should contain Iron Law #10 Self-Verify');
      assert.ok(content.includes('Confirmation Gate Defaults'), 'core-rules should contain Confirmation Gate Defaults section');
    });

    it('pm agent invokes state-check after post-approval writes', () => {
      const content = fs.readFileSync(
        path.join(tmpDir, '.github/agents/pm.agent.md'),
        'utf8',
      );
      assert.ok(content.includes('state-check'), 'pm should reference state-check skill');
    });

    it('reviewer agent references state-check in Step 8', () => {
      const content = fs.readFileSync(
        path.join(tmpDir, '.github/agents/reviewer.agent.md'),
        'utf8',
      );
      assert.ok(content.includes('state-check'), 'reviewer Step 8 should reference state-check');
    });
  });
});
