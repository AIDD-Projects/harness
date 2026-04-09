'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { run, detectLanguage } = require('../src/init');

// Helper: create a temp directory and clean up after
function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'musher-test-'));
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
      '.claude/agents/reviewer.md',
      '.claude/agents/planner.md',
      '.claude/agents/sprint-manager.md',
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
      '.cursor/agents/reviewer.md',
      'docs/project-state.md',
    ],
  },
  codex: {
    count: 20,
    required: [
      'AGENTS.md',
      '.agents/skills/test-integrity/SKILL.md',
      '.agents/skills/investigate/SKILL.md',
      '.agents/skills/bootstrap/SKILL.md',
      '.agents/skills/learn/SKILL.md',
      '.agents/skills/pivot/SKILL.md',
      '.codex/agents/reviewer.toml',
      '.codex/agents/planner.toml',
      '.codex/agents/sprint-manager.toml',
      'docs/project-state.md',
    ],
  },
  windsurf: {
    count: 20,
    required: [
      '.windsurf/rules/core.md',
      '.windsurf/skills/test-integrity/SKILL.md',
      '.windsurf/skills/bootstrap/SKILL.md',
      '.windsurf/skills/learn/SKILL.md',
      '.windsurf/skills/pivot/SKILL.md',
      '.windsurf/skills/reviewer/SKILL.md',
      'docs/project-state.md',
    ],
  },
  antigravity: {
    count: 20,
    required: [
      'GEMINI.md',
      '.gemini/skills/test-integrity/SKILL.md',
      '.gemini/skills/bootstrap/SKILL.md',
      '.gemini/skills/learn/SKILL.md',
      '.gemini/skills/pivot/SKILL.md',
      '.gemini/agents/planner.md',
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

describe('musher init', () => {
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
      await run(['init', '--ide', 'windsurf', '--mode', 'solo', '--dir', tmpDir]);
      console.log = origLog;

      // Modify a file
      const statePath = path.join(tmpDir, 'docs/project-state.md');
      fs.writeFileSync(statePath, 'CUSTOM CONTENT', 'utf8');

      // Run again without --overwrite
      const skipped = [];
      console.log = (msg) => {
        if (msg && msg.includes('Skipped')) skipped.push(msg);
      };
      await run(['init', '--ide', 'windsurf', '--mode', 'solo', '--dir', tmpDir]);
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
        assert.ok(fs.existsSync(path.join(tmpDir, '.harness/agent-memory/planner.md')), 'Missing .harness/agent-memory/planner.md');
        assert.ok(fs.existsSync(path.join(tmpDir, '.harness/agent-memory/sprint-manager.md')), 'Missing .harness/agent-memory/sprint-manager.md');
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

      it('generates total 22 files (20 base + .gitignore + .gitattributes)', () => {
        assert.equal(countFiles(tmpDir), 22);
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
        const content = fs.readFileSync(path.join(tmpDir, '.github/skills/bootstrap/SKILL.md'), 'utf8');
        assert.ok(content.includes('.harness/project-state.md') || !content.includes('docs/project-state.md'),
          'Should reference .harness/ instead of docs/ for personal files');
      });

      it('skills still reference docs/ for shared files', () => {
        const content = fs.readFileSync(path.join(tmpDir, '.github/skills/bootstrap/SKILL.md'), 'utf8');
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
      for (const ide of Object.keys(EXPECTED_FILES)) {
        it(`--ide ${ide} --mode team generates 22 files`, async () => {
          const tmpDir = makeTmpDir();
          const origLog = console.log;
          console.log = () => {};
          await run(['init', '--ide', ide, '--mode', 'team', '--dir', tmpDir]);
          console.log = origLog;

          assert.equal(countFiles(tmpDir), 22, `${ide} team mode should have 22 files`);
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

      it('Team bootstrap contains onboarding guidance', () => {
        const content = teamFiles['skill:bootstrap'];
        assert.ok(content, 'bootstrap skill should exist');
        assert.ok(content.includes('Joining Developer'), 'Team bootstrap should have Joining Developer guidance');
      });

      it('Team learn contains Pre-Pull guidance', () => {
        const content = teamFiles['skill:learn'];
        assert.ok(content, 'learn skill should exist');
        assert.ok(content.includes('Pre-Pull'), 'Team learn should have Pre-Pull guidance');
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

      it('Team planner contains team coordination', () => {
        const content = teamFiles['agent:planner'];
        assert.ok(content, 'planner agent should exist');
        assert.ok(content.includes('Owner-Aware'), 'Team planner should have Owner-Aware guidance');
      });

      it('Team sprint-manager has ownership context', () => {
        const content = teamFiles['agent:sprint-manager'];
        assert.ok(content, 'sprint-manager agent should exist');
        assert.ok(content.includes('Ownership'), 'Team sprint-manager should have Ownership guidance');
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
});
