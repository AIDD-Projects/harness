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

  // Skills (.github/skills — VS Code default search path)
  writeFile(targetDir, '.github/skills/test-integrity/SKILL.md', readTemplate('skills/test-integrity.md'), overwrite);
  writeFile(targetDir, '.github/skills/security-checklist/SKILL.md', readTemplate('skills/security-checklist.md'), overwrite);
  writeFile(targetDir, '.github/skills/investigate/SKILL.md', readTemplate('skills/investigate.md'), overwrite);
  writeFile(targetDir, '.github/skills/impact-analysis/SKILL.md', readTemplate('skills/impact-analysis.md'), overwrite);
  writeFile(targetDir, '.github/skills/feature-breakdown/SKILL.md', readTemplate('skills/feature-breakdown.md'), overwrite);

  // Agents (.github/agents — VS Code default search path)
  const reviewerContent = readTemplate('agents/reviewer.md');
  const reviewerAgent =
    '---\nname: reviewer\ndescription: "Code review + auto-fix. Validates quality, security, and test integrity before commits."\n---\n\n' +
    reviewerContent;
  writeFile(targetDir, '.github/agents/reviewer.agent.md', reviewerAgent, overwrite);

  const sprintContent = readTemplate('agents/sprint-manager.md');
  const sprintAgent =
    '---\nname: sprint-manager\ndescription: "Sprint/Story state tracking, next task guidance, scope drift prevention."\n---\n\n' +
    sprintContent;
  writeFile(targetDir, '.github/agents/sprint-manager.agent.md', sprintAgent, overwrite);

  const plannerContent = readTemplate('agents/planner.md');
  const plannerAgent =
    '---\nname: planner\ndescription: "Feature planning and dependency management. Analyze architecture, break down features, track module relationships."\n---\n\n' +
    plannerContent;
  writeFile(targetDir, '.github/agents/planner.agent.md', plannerAgent, overwrite);

  // State files
  writeFile(targetDir, 'project-state.md', readTemplate('project-state.md'), overwrite);
  writeFile(targetDir, 'failure-patterns.md', readTemplate('failure-patterns.md'), overwrite);
  writeFile(targetDir, 'dependency-map.md', readTemplate('dependency-map.md'), overwrite);
  writeFile(targetDir, 'features.md', readTemplate('features.md'), overwrite);
  writeFile(targetDir, 'project-brief.md', readTemplate('project-brief.md'), overwrite);
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

  // Skills (Claude uses same SKILL.md format)
  writeFile(targetDir, '.claude/skills/test-integrity/SKILL.md', readTemplate('skills/test-integrity.md'), overwrite);
  writeFile(targetDir, '.claude/skills/security-checklist/SKILL.md', readTemplate('skills/security-checklist.md'), overwrite);
  writeFile(targetDir, '.claude/skills/investigate/SKILL.md', readTemplate('skills/investigate.md'), overwrite);
  writeFile(targetDir, '.claude/skills/impact-analysis/SKILL.md', readTemplate('skills/impact-analysis.md'), overwrite);
  writeFile(targetDir, '.claude/skills/feature-breakdown/SKILL.md', readTemplate('skills/feature-breakdown.md'), overwrite);

  // State files
  writeFile(targetDir, 'project-state.md', readTemplate('project-state.md'), overwrite);
  writeFile(targetDir, 'failure-patterns.md', readTemplate('failure-patterns.md'), overwrite);
  writeFile(targetDir, 'dependency-map.md', readTemplate('dependency-map.md'), overwrite);
  writeFile(targetDir, 'features.md', readTemplate('features.md'), overwrite);
  writeFile(targetDir, 'project-brief.md', readTemplate('project-brief.md'), overwrite);
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
  const skills = ['test-integrity', 'security-checklist', 'investigate', 'impact-analysis', 'feature-breakdown'];
  for (const skill of skills) {
    const content = readTemplate(`skills/${skill}.md`);
    const mdc =
      `---\ndescription: Skill — ${skill}\nalwaysApply: false\n---\n\n` +
      content;
    writeFile(targetDir, `.cursor/rules/${skill}.mdc`, mdc, overwrite);
  }

  // Agents as rules
  const agents = [
    { name: 'reviewer', file: 'agents/reviewer.md' },
    { name: 'sprint-manager', file: 'agents/sprint-manager.md' },
    { name: 'planner', file: 'agents/planner.md' },
  ];
  for (const agent of agents) {
    const content = readTemplate(agent.file);
    const mdc =
      `---\ndescription: Agent — ${agent.name}\nalwaysApply: false\n---\n\n` +
      content;
    writeFile(targetDir, `.cursor/rules/${agent.name}.mdc`, mdc, overwrite);
  }

  // State files
  writeFile(targetDir, 'project-state.md', readTemplate('project-state.md'), overwrite);
  writeFile(targetDir, 'failure-patterns.md', readTemplate('failure-patterns.md'), overwrite);
  writeFile(targetDir, 'dependency-map.md', readTemplate('dependency-map.md'), overwrite);
  writeFile(targetDir, 'features.md', readTemplate('features.md'), overwrite);
  writeFile(targetDir, 'project-brief.md', readTemplate('project-brief.md'), overwrite);
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

  // Skills (Codex uses .agents/skills/ format)
  writeFile(targetDir, '.agents/skills/test-integrity/SKILL.md', readTemplate('skills/test-integrity.md'), overwrite);
  writeFile(targetDir, '.agents/skills/security-checklist/SKILL.md', readTemplate('skills/security-checklist.md'), overwrite);
  writeFile(targetDir, '.agents/skills/investigate/SKILL.md', readTemplate('skills/investigate.md'), overwrite);
  writeFile(targetDir, '.agents/skills/impact-analysis/SKILL.md', readTemplate('skills/impact-analysis.md'), overwrite);
  writeFile(targetDir, '.agents/skills/feature-breakdown/SKILL.md', readTemplate('skills/feature-breakdown.md'), overwrite);

  // State files
  writeFile(targetDir, 'project-state.md', readTemplate('project-state.md'), overwrite);
  writeFile(targetDir, 'failure-patterns.md', readTemplate('failure-patterns.md'), overwrite);
  writeFile(targetDir, 'dependency-map.md', readTemplate('dependency-map.md'), overwrite);
  writeFile(targetDir, 'features.md', readTemplate('features.md'), overwrite);
  writeFile(targetDir, 'project-brief.md', readTemplate('project-brief.md'), overwrite);
}

function generateWindsurf(targetDir, overwrite) {
  // .windsurfrules — everything in one file
  const sections = [
    readTemplate('core-rules.md'),
    readTemplate('testing-rules.md'),
    readTemplate('backend-rules.md'),
    '---\n\n# Skills\n\n',
    readTemplate('skills/test-integrity.md'),
    readTemplate('skills/security-checklist.md'),
    readTemplate('skills/investigate.md'),
    readTemplate('skills/impact-analysis.md'),
    readTemplate('skills/feature-breakdown.md'),
    '---\n\n# Agents\n\n',
    readTemplate('agents/reviewer.md'),
    readTemplate('agents/sprint-manager.md'),
    readTemplate('agents/planner.md'),
  ];
  writeFile(targetDir, '.windsurfrules', sections.join('\n\n---\n\n'), overwrite);

  // State files
  writeFile(targetDir, 'project-state.md', readTemplate('project-state.md'), overwrite);
  writeFile(targetDir, 'failure-patterns.md', readTemplate('failure-patterns.md'), overwrite);
  writeFile(targetDir, 'dependency-map.md', readTemplate('dependency-map.md'), overwrite);
  writeFile(targetDir, 'features.md', readTemplate('features.md'), overwrite);
  writeFile(targetDir, 'project-brief.md', readTemplate('project-brief.md'), overwrite);
}

// ─── IDE registry ────────────────────────────────────────────
const GENERATORS = {
  vscode:   { name: 'VS Code Copilot',  fn: generateVscode },
  claude:   { name: 'Claude Code',      fn: generateClaude },
  cursor:   { name: 'Cursor',           fn: generateCursor },
  codex:    { name: 'Codex (OpenAI)',    fn: generateCodex },
  windsurf: { name: 'Windsurf',         fn: generateWindsurf },
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

  const answer = await askQuestion('  Choice (1-5): ');
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
    --ide <name>     IDE target: vscode, claude, cursor, codex, windsurf
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
