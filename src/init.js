'use strict';

const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');

const HARNESS_DIR = path.join(__dirname, '..', 'harness');

// ─── Template reader ─────────────────────────────────────────
function readTemplate(name) {
  return fs.readFileSync(path.join(HARNESS_DIR, name), 'utf8');
}

// ─── File writer (mkdir -p + conflict check) ─────────────────
function writeFile(targetDir, relPath, content, overwrite) {
  const fullPath = path.join(targetDir, relPath);
  if (fs.existsSync(fullPath) && !overwrite) {
    console.log(`  ⏭  Skipped (exists): ${relPath}`);
    return false;
  }
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`  ✓  ${relPath}`);
  return true;
}

// ─── Shared definitions ──────────────────────────────────────

const SKILLS = [
  { id: 'test-integrity', desc: 'Ensure test mocks stay synchronized when interfaces change. Use when modifying repository or service interfaces.' },
  { id: 'security-checklist', desc: 'Security risk inspection before commits. Use when reviewing code for security issues.' },
  { id: 'investigate', desc: 'Investigate and diagnose issues. Use when debugging or analyzing unexpected behavior.' },
  { id: 'impact-analysis', desc: 'Assess change blast radius. Use when modifying shared modules or interfaces.' },
  { id: 'feature-breakdown', desc: 'Break down features into implementable stories. Use when planning new features.' },
  { id: 'bootstrap', desc: 'Onboard project into K-Harness. Scans codebase and fills state files. Use after k-harness init or when state files are empty.' },
  { id: 'learn', desc: 'Capture session lessons and update state files. Use at the end of every session.' },
  { id: 'pivot', desc: 'Propagate direction changes across all state files. Use when project goals, technology, scope, or architecture changes.' },
];

const AGENTS = [
  { id: 'reviewer', file: 'agents/reviewer.md', desc: 'Code review + auto-fix. Validates quality, security, and test integrity before commits.' },
  { id: 'sprint-manager', file: 'agents/sprint-manager.md', desc: 'Sprint/Story state tracking, next task guidance, scope drift prevention.' },
  { id: 'planner', file: 'agents/planner.md', desc: 'Feature planning and dependency management. Analyze architecture, break down features.' },
];

const STATE_FILES = [
  'project-state.md',
  'failure-patterns.md',
  'dependency-map.md',
  'features.md',
  'project-brief.md',
];

const AGENT_MEMORY_FILES = [
  'agent-memory/reviewer.md',
  'agent-memory/planner.md',
  'agent-memory/sprint-manager.md',
];

const STATE_DEST_DIR = 'docs';

// ─── Language detection ──────────────────────────────────────
function detectLanguage(targetDir) {
  const markers = [
    ['python', ['requirements.txt', 'pyproject.toml', 'setup.py', 'Pipfile', 'setup.cfg']],
    ['go', ['go.mod']],
    ['java', ['pom.xml', 'build.gradle', 'build.gradle.kts']],
    ['rust', ['Cargo.toml']],
    ['ruby', ['Gemfile']],
  ];
  for (const [lang, files] of markers) {
    for (const f of files) {
      if (fs.existsSync(path.join(targetDir, f))) return lang;
    }
  }
  return 'typescript';
}



// ─── Shared writers ──────────────────────────────────────────

function writeStateFiles(targetDir, overwrite) {
  for (const file of STATE_FILES) {
    writeFile(targetDir, `${STATE_DEST_DIR}/${file}`, readTemplate(file), overwrite);
  }
  for (const file of AGENT_MEMORY_FILES) {
    writeFile(targetDir, `${STATE_DEST_DIR}/${file}`, readTemplate(file), overwrite);
  }
}

function writeSkills(targetDir, skillsDir, overwrite) {
  for (const skill of SKILLS) {
    const content = readTemplate(`skills/${skill.id}.md`);
    const skillMd =
      `---\nname: ${skill.id}\ndescription: '${skill.desc}'\n---\n\n` +
      content;
    writeFile(targetDir, `${skillsDir}/${skill.id}/SKILL.md`, skillMd, overwrite);
  }
}

function writeAgentsAsSkills(targetDir, skillsDir, overwrite) {
  for (const agent of AGENTS) {
    const content = readTemplate(agent.file);
    const skillMd =
      `---\nname: ${agent.id}\ndescription: '${agent.desc}'\n---\n\n` +
      content;
    writeFile(targetDir, `${skillsDir}/${agent.id}/SKILL.md`, skillMd, overwrite);
  }
}

// ─── IDE Generators ──────────────────────────────────────────

function generateVscode(targetDir, overwrite) {
  const coreRules = readTemplate('core-rules.md');

  // Global instructions (dispatcher only — rules are embedded in skills)
  writeFile(targetDir, '.github/copilot-instructions.md', coreRules, overwrite);

  // Skills (.github/skills — VS Code default search path, SKILL.md with frontmatter)
  writeSkills(targetDir, '.github/skills', overwrite);

  // Agents (.github/agents — VS Code uses .agent.md format with frontmatter)
  for (const agent of AGENTS) {
    const content = readTemplate(agent.file);
    const agentMd =
      `---\nname: ${agent.id}\ndescription: "${agent.desc}"\n---\n\n` +
      content;
    writeFile(targetDir, `.github/agents/${agent.id}.agent.md`, agentMd, overwrite);
  }

  // State files
  writeStateFiles(targetDir, overwrite);
}

function generateClaude(targetDir, overwrite) {
  // .claude/rules/core.md — dispatcher only (no paths = always loaded)
  writeFile(targetDir, '.claude/rules/core.md', readTemplate('core-rules.md'), overwrite);

  // Skills (SKILL.md with frontmatter)
  writeSkills(targetDir, '.claude/skills', overwrite);

  // Agents as skills (Claude Code skills pattern)
  writeAgentsAsSkills(targetDir, '.claude/skills', overwrite);

  // State files
  writeStateFiles(targetDir, overwrite);
}

function generateCursor(targetDir, overwrite) {
  // .cursor/rules/core.mdc — dispatcher only (always active)
  const coreRules = readTemplate('core-rules.md');
  const coreMdc =
    '---\ndescription: K-Harness dispatcher — workflow guidance and state file references\nalwaysApply: true\n---\n\n' +
    coreRules;
  writeFile(targetDir, '.cursor/rules/core.mdc', coreMdc, overwrite);

  // Skills (.cursor/skills — invokable by mentioning skill name)
  writeSkills(targetDir, '.cursor/skills', overwrite);

  // Agents as skills
  writeAgentsAsSkills(targetDir, '.cursor/skills', overwrite);

  // State files
  writeStateFiles(targetDir, overwrite);
}

function generateCodex(targetDir, overwrite) {
  // AGENTS.md — dispatcher only
  writeFile(targetDir, 'AGENTS.md', readTemplate('core-rules.md'), overwrite);

  // Skills (SKILL.md with frontmatter for slash commands)
  writeSkills(targetDir, '.agents/skills', overwrite);

  // State files
  writeStateFiles(targetDir, overwrite);
}

function generateWindsurf(targetDir, overwrite) {
  // .windsurfrules — dispatcher only (rules are embedded in skills)
  writeFile(targetDir, '.windsurfrules', readTemplate('core-rules.md'), overwrite);

  // State files
  writeStateFiles(targetDir, overwrite);
}

function generateAugment(targetDir, overwrite) {
  // .augment/rules/core.md — dispatcher only
  const coreRules = readTemplate('core-rules.md');
  const coreRule =
    '---\ndescription: K-Harness dispatcher — workflow guidance and state file references\ntype: always\n---\n\n' +
    coreRules;
  writeFile(targetDir, '.augment/rules/core.md', coreRule, overwrite);

  // .augment/skills/ — SKILL.md format (enables / slash commands)
  writeSkills(targetDir, '.augment/skills', overwrite);
  writeAgentsAsSkills(targetDir, '.augment/skills', overwrite);

  // State files
  writeStateFiles(targetDir, overwrite);
}

function generateAntigravity(targetDir, overwrite) {
  // .agent/rules/core.md — dispatcher only
  const coreRules = readTemplate('core-rules.md');
  const coreRule =
    '---\ndescription: K-Harness dispatcher — workflow guidance and state file references\ntype: always\n---\n\n' +
    coreRules;
  writeFile(targetDir, '.agent/rules/core.md', coreRule, overwrite);

  // .agent/skills/ — SKILL.md format (enables / slash commands)
  writeSkills(targetDir, '.agent/skills', overwrite);
  writeAgentsAsSkills(targetDir, '.agent/skills', overwrite);

  // State files
  writeStateFiles(targetDir, overwrite);
}

// ─── IDE registry ────────────────────────────────────────────
const GENERATORS = {
  vscode:       { name: 'VS Code Copilot',      fn: generateVscode },
  claude:       { name: 'Claude Code',           fn: generateClaude },
  cursor:       { name: 'Cursor',                fn: generateCursor },
  codex:        { name: 'Codex (OpenAI)',         fn: generateCodex },
  windsurf:     { name: 'Windsurf',              fn: generateWindsurf },
  augment:      { name: 'Augment Code',          fn: generateAugment },
  antigravity:  { name: 'Google Antigravity',    fn: generateAntigravity },
};

// ─── Interactive prompt ──────────────────────────────────────
function askQuestion(query) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function promptIde() {
  const keys = Object.keys(GENERATORS);
  console.log('\n  Select your IDE:\n');
  keys.forEach((key, i) => {
    console.log(`    ${i + 1}. ${GENERATORS[key].name}`);
  });
  console.log();

  const answer = await askQuestion(`  Choice (1-${keys.length}): `);
  const idx = parseInt(answer, 10) - 1;
  if (idx < 0 || idx >= keys.length || isNaN(idx)) {
    console.error('  Invalid choice.');
    process.exit(1);
  }
  return keys[idx];
}

// ─── CLI entry ───────────────────────────────────────────────
function showHelp() {
  console.log(`
  K-Harness — LLM Development Harness

  Usage:
    npx k-harness init [options]

  Options:
    --ide <name>     IDE target: vscode, claude, cursor, codex, windsurf, augment, antigravity
    --dir <path>     Target directory (default: current directory)
    --overwrite      Overwrite existing files
    --help           Show this help

  Examples:
    npx k-harness init
    npx k-harness init --ide vscode
    npx k-harness init --ide claude --dir ./my-project
`);
}

function parseArgs(argv) {
  const args = { command: null, ide: null, dir: process.cwd(), overwrite: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === 'init') args.command = 'init';
    else if (arg === '--ide' && argv[i + 1]) { args.ide = argv[++i]; }
    else if (arg === '--dir' && argv[i + 1]) { args.dir = path.resolve(argv[++i]); }
    else if (arg === '--overwrite') args.overwrite = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
  }
  return args;
}

async function run(argv) {
  const args = parseArgs(argv);

  if (args.help || !args.command) {
    showHelp();
    process.exit(args.help ? 0 : 1);
  }

  if (args.command === 'init') {
    console.log('\n  K-Harness — LLM Development Harness\n');

    // Determine IDE
    let ide = args.ide;
    if (ide && !GENERATORS[ide]) {
      console.error(`  Unknown IDE: ${ide}`);
      console.error(`  Available: ${Object.keys(GENERATORS).join(', ')}`);
      process.exit(1);
    }
    if (!ide) {
      ide = await promptIde();
    }

    const gen = GENERATORS[ide];
    const lang = detectLanguage(args.dir);
    console.log(`\n  Installing for ${gen.name}... (detected language: ${lang})\n`);
    gen.fn(args.dir, args.overwrite);
    console.log(`\n  Done! Run "bootstrap" in your AI chat to auto-fill state files and rules.\n`);
  }
}

module.exports = { run, detectLanguage };
