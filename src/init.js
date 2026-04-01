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

// ─── Shared writers ──────────────────────────────────────────

function writeStateFiles(targetDir, overwrite) {
  for (const file of STATE_FILES) {
    writeFile(targetDir, file, readTemplate(file), overwrite);
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
  const testingRules = readTemplate('testing-rules.md');
  const backendRules = readTemplate('backend-rules.md');

  // Global instructions
  writeFile(targetDir, '.github/copilot-instructions.md', coreRules, overwrite);

  // File-scoped instructions (add VS Code applyTo frontmatter)
  const testingWithFrontmatter =
    '---\napplyTo: "**/*.test.ts,**/*.test.js,**/*.spec.ts,**/*.spec.js,**/__mocks__/**,**/__tests__/**"\n---\n\n' +
    testingRules;
  writeFile(targetDir, '.vscode/instructions/testing.instructions.md', testingWithFrontmatter, overwrite);

  const backendWithFrontmatter =
    '---\napplyTo: "src/**/*.ts,src/**/*.js"\n---\n\n' +
    backendRules;
  writeFile(targetDir, '.vscode/instructions/backend.instructions.md', backendWithFrontmatter, overwrite);

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
  // CLAUDE.md — merge core + testing + backend rules
  const merged = [
    readTemplate('core-rules.md'),
    '\n---\n\n',
    readTemplate('testing-rules.md'),
    '\n---\n\n',
    readTemplate('backend-rules.md'),
  ].join('');
  writeFile(targetDir, 'CLAUDE.md', merged, overwrite);

  // Skills (SKILL.md with frontmatter for slash commands)
  writeSkills(targetDir, '.claude/skills', overwrite);

  // State files
  writeStateFiles(targetDir, overwrite);
}

function generateCursor(targetDir, overwrite) {
  // .cursor/rules/*.mdc — each needs frontmatter
  const coreRules = readTemplate('core-rules.md');
  const coreMdc =
    '---\ndescription: Core project rules — Iron Laws, completion protocol, concreteness\nalwaysApply: true\n---\n\n' +
    coreRules;
  writeFile(targetDir, '.cursor/rules/core.mdc', coreMdc, overwrite);

  const testingRules = readTemplate('testing-rules.md');
  const testingMdc =
    '---\ndescription: Testing rules — mock sync, forbidden patterns\nglobs: "**/*.test.*,**/*.spec.*,**/__mocks__/**,**/__tests__/**"\nalwaysApply: false\n---\n\n' +
    testingRules;
  writeFile(targetDir, '.cursor/rules/testing.mdc', testingMdc, overwrite);

  const backendRules = readTemplate('backend-rules.md');
  const backendMdc =
    '---\ndescription: Backend code rules — architecture enforcement, type safety\nglobs: "src/**/*.ts,src/**/*.js"\nalwaysApply: false\n---\n\n' +
    backendRules;
  writeFile(targetDir, '.cursor/rules/backend.mdc', backendMdc, overwrite);

  // Skills as rules
  for (const skill of SKILLS) {
    const content = readTemplate(`skills/${skill.id}.md`);
    const mdc =
      `---\ndescription: Skill — ${skill.id}\nalwaysApply: false\n---\n\n` +
      content;
    writeFile(targetDir, `.cursor/rules/${skill.id}.mdc`, mdc, overwrite);
  }

  // Agents as rules
  for (const agent of AGENTS) {
    const content = readTemplate(agent.file);
    const mdc =
      `---\ndescription: Agent — ${agent.id}\nalwaysApply: false\n---\n\n` +
      content;
    writeFile(targetDir, `.cursor/rules/${agent.id}.mdc`, mdc, overwrite);
  }

  // State files
  writeStateFiles(targetDir, overwrite);
}

function generateCodex(targetDir, overwrite) {
  // AGENTS.md — merge core + testing + backend rules
  const merged = [
    readTemplate('core-rules.md'),
    '\n---\n\n',
    readTemplate('testing-rules.md'),
    '\n---\n\n',
    readTemplate('backend-rules.md'),
  ].join('');
  writeFile(targetDir, 'AGENTS.md', merged, overwrite);

  // Skills (SKILL.md with frontmatter for slash commands)
  writeSkills(targetDir, '.agents/skills', overwrite);

  // State files
  writeStateFiles(targetDir, overwrite);
}

function generateWindsurf(targetDir, overwrite) {
  // .windsurfrules — everything in one file
  const sections = [
    readTemplate('core-rules.md'),
    readTemplate('testing-rules.md'),
    readTemplate('backend-rules.md'),
    '---\n\n# Skills\n\n',
  ];
  for (const skill of SKILLS) {
    sections.push(readTemplate(`skills/${skill.id}.md`));
  }
  sections.push('---\n\n# Agents\n\n');
  for (const agent of AGENTS) {
    sections.push(readTemplate(agent.file));
  }
  writeFile(targetDir, '.windsurfrules', sections.join('\n\n---\n\n'), overwrite);

  // State files
  writeStateFiles(targetDir, overwrite);
}

function generateAugment(targetDir, overwrite) {
  // .augment/rules/ — Always-type rules for core, testing, backend
  const coreRules = readTemplate('core-rules.md');
  const coreRule =
    '---\ndescription: Core project rules — Iron Laws, completion protocol, concreteness\ntype: always\n---\n\n' +
    coreRules;
  writeFile(targetDir, '.augment/rules/core.md', coreRule, overwrite);

  const testingRules = readTemplate('testing-rules.md');
  const testingRule =
    '---\ndescription: Testing rules — mock sync, forbidden patterns\ntype: auto\nglobs: "**/*.test.*,**/*.spec.*,**/__mocks__/**,**/__tests__/**"\n---\n\n' +
    testingRules;
  writeFile(targetDir, '.augment/rules/testing.md', testingRule, overwrite);

  const backendRules = readTemplate('backend-rules.md');
  const backendRule =
    '---\ndescription: Backend code rules — architecture enforcement, type safety\ntype: auto\nglobs: "src/**/*.ts,src/**/*.js"\n---\n\n' +
    backendRules;
  writeFile(targetDir, '.augment/rules/backend.md', backendRule, overwrite);

  // .augment/skills/ — SKILL.md format (enables / slash commands)
  writeSkills(targetDir, '.augment/skills', overwrite);
  writeAgentsAsSkills(targetDir, '.augment/skills', overwrite);

  // State files
  writeStateFiles(targetDir, overwrite);
}

function generateAntigravity(targetDir, overwrite) {
  // .agent/rules/ — Always-type rules (same as Augment format, read by Antigravity)
  const coreRules = readTemplate('core-rules.md');
  const coreRule =
    '---\ndescription: Core project rules — Iron Laws, completion protocol, concreteness\ntype: always\n---\n\n' +
    coreRules;
  writeFile(targetDir, '.agent/rules/core.md', coreRule, overwrite);

  const testingRules = readTemplate('testing-rules.md');
  const testingRule =
    '---\ndescription: Testing rules — mock sync, forbidden patterns\ntype: auto\nglobs: "**/*.test.*,**/*.spec.*,**/__mocks__/**,**/__tests__/**"\n---\n\n' +
    testingRules;
  writeFile(targetDir, '.agent/rules/testing.md', testingRule, overwrite);

  const backendRules = readTemplate('backend-rules.md');
  const backendRule =
    '---\ndescription: Backend code rules — architecture enforcement, type safety\ntype: auto\nglobs: "src/**/*.ts,src/**/*.js"\n---\n\n' +
    backendRules;
  writeFile(targetDir, '.agent/rules/backend.md', backendRule, overwrite);

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
    console.log(`\n  Installing for ${gen.name}...\n`);
    gen.fn(args.dir, args.overwrite);
    console.log(`\n  Done! Edit project-state.md to set up your first sprint.\n`);
  }
}

module.exports = { run };
