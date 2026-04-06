'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { run, detectLanguage } = require('../src/init');

// Helper: create a temp directory and clean up after
function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'k-harness-test-'));
}

function rmDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

// ─── File count expectations per IDE ────────────────────────
const EXPECTED_FILES = {
  vscode: {
    count: 20,
    required: [
      '.github/copilot-instructions.md',
      '.github/skills/test-integrity/SKILL.md',
      '.github/skills/investigate/SKILL.md',
      '.github/skills/bootstrap/SKILL.md',
      '.github/skills/learn/SKILL.md',
      '.github/skills/pivot/SKILL.md',
      '.github/agents/reviewer.agent.md',
      'docs/project-state.md',
      'docs/features.md',
    ],
  },
  claude: {
    count: 20,
    required: [
      '.claude/rules/core.md',
      '.claude/skills/test-integrity/SKILL.md',
      '.claude/skills/security-checklist/SKILL.md',
      '.claude/skills/bootstrap/SKILL.md',
      '.claude/skills/learn/SKILL.md',
      '.claude/skills/pivot/SKILL.md',
      '.claude/skills/reviewer/SKILL.md',
      '.claude/skills/planner/SKILL.md',
      '.claude/skills/sprint-manager/SKILL.md',
      'docs/project-state.md',
    ],
  },
  cursor: {
    count: 20,
    required: [
      '.cursor/rules/core.mdc',
      '.cursor/skills/test-integrity/SKILL.md',
      '.cursor/skills/bootstrap/SKILL.md',
      '.cursor/skills/learn/SKILL.md',
      '.cursor/skills/pivot/SKILL.md',
      '.cursor/skills/reviewer/SKILL.md',
      'docs/project-state.md',
    ],
  },
  codex: {
    count: 17,
    required: [
      'AGENTS.md',
      '.agents/skills/test-integrity/SKILL.md',
      '.agents/skills/investigate/SKILL.md',
      '.agents/skills/bootstrap/SKILL.md',
      '.agents/skills/learn/SKILL.md',
      '.agents/skills/pivot/SKILL.md',
      'docs/project-state.md',
    ],
  },
  windsurf: {
    count: 9,
    required: [
      '.windsurfrules',
      'docs/project-state.md',
      'docs/features.md',
    ],
  },
  augment: {
    count: 20,
    required: [
      '.augment/rules/core.md',
      '.augment/skills/test-integrity/SKILL.md',
      '.augment/skills/bootstrap/SKILL.md',
      '.augment/skills/learn/SKILL.md',
      '.augment/skills/pivot/SKILL.md',
      '.augment/skills/reviewer/SKILL.md',
      'docs/project-state.md',
    ],
  },
  antigravity: {
    count: 20,
    required: [
      '.agent/rules/core.md',
      '.agent/skills/test-integrity/SKILL.md',
      '.agent/skills/bootstrap/SKILL.md',
      '.agent/skills/learn/SKILL.md',
      '.agent/skills/pivot/SKILL.md',
      '.agent/skills/planner/SKILL.md',
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

describe('k-harness init', () => {
  for (const [ide, spec] of Object.entries(EXPECTED_FILES)) {
    describe(`--ide ${ide}`, () => {
      let tmpDir;

      before(async () => {
        tmpDir = makeTmpDir();
        // Suppress console output during tests
        const origLog = console.log;
        console.log = () => {};
        await run(['init', '--ide', ide, '--dir', tmpDir]);
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
      await run(['init', '--ide', 'vscode', '--dir', tmpDir]);
      console.log = origLog;
    });

    after(() => {
      rmDir(tmpDir);
    });

    it('VS Code skills have name/description frontmatter', () => {
      const content = fs.readFileSync(
        path.join(tmpDir, '.github/skills/test-integrity/SKILL.md'),
        'utf8',
      );
      assert.ok(content.startsWith('---\n'), 'Missing frontmatter opening');
      assert.ok(content.includes('name: test-integrity'), 'Missing name field');
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
      await run(['init', '--ide', 'windsurf', '--dir', tmpDir]);
      console.log = origLog;

      // Modify a file
      const statePath = path.join(tmpDir, 'docs/project-state.md');
      fs.writeFileSync(statePath, 'CUSTOM CONTENT', 'utf8');

      // Run again without --overwrite
      const skipped = [];
      console.log = (msg) => {
        if (msg && msg.includes('Skipped')) skipped.push(msg);
      };
      await run(['init', '--ide', 'windsurf', '--dir', tmpDir]);
      console.log = origLog;

      assert.ok(skipped.length > 0, 'Should have skipped existing files');
      const content = fs.readFileSync(statePath, 'utf8');
      assert.equal(content, 'CUSTOM CONTENT', 'Should preserve existing file');
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
      await run(['init', '--ide', 'claude', '--dir', tmpDir]);
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
});
