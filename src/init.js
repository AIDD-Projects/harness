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
  { id: 'bootstrap', desc: 'Onboard project into Musher. Scans codebase and fills state files. Use after musher init or when state files are empty.' },
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

const PERSONAL_STATE_FILES = ['project-state.md', 'failure-patterns.md'];
const PERSONAL_DIRS = ['agent-memory/'];

const STATE_DEST_DIR = 'docs';
const PERSONAL_DEST_DIR = '.harness';

// ─── Team mode path resolver ─────────────────────────────────
const TEAM_MODE_SECTION = `

## Team Mode

This project uses Team mode. State files are split into shared and personal.

### File Locations
- **Shared** (docs/, git committed): project-brief.md, features.md, dependency-map.md
- **Personal** (.harness/, gitignored): project-state.md, failure-patterns.md, agent-memory/

### Rules
1. **Pre-Pull**: before modifying any shared file (docs/), run \`git pull\` to get latest changes
2. **Owner Column**: shared files use Owner columns — only modify your own rows
3. **Read-Only**: other developers' Owner rows are READ ONLY
4. **Append-Only**: new rows go at the bottom of the table
5. **Pivot Lock**: the \`pivot\` skill must be run on the main branch by the team lead only
6. **FP Promotion**: if a personal failure pattern (FP-NNN) affects the team, promote it to a shared doc or team channel
`;

function resolveContent(content, mode) {
  if (mode !== 'team') {
    // Solo mode: strip Team-only blocks entirely
    return content.replace(/<!-- TEAM_MODE_START -->[\s\S]*?<!-- TEAM_MODE_END -->\n?/g, '');
  }
  let result = content
    .replaceAll('docs/project-state.md', '.harness/project-state.md')
    .replaceAll('docs/failure-patterns.md', '.harness/failure-patterns.md')
    .replaceAll('docs/agent-memory/', '.harness/agent-memory/');

  // Remove markers, keep Team content
  result = result
    .replaceAll('<!-- TEAM_MODE_START -->\n', '')
    .replaceAll('<!-- TEAM_MODE_START -->', '')
    .replaceAll('<!-- TEAM_MODE_END -->\n', '')
    .replaceAll('<!-- TEAM_MODE_END -->', '');

  // Append Team Mode section to core-rules (detected by the heading)
  if (result.includes('## State Files') && result.includes('## Session Start')) {
    result += TEAM_MODE_SECTION;
  }
  return result;
}

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

function writeStateFiles(targetDir, overwrite, mode = 'solo') {
  for (const file of STATE_FILES) {
    const isPersonal = PERSONAL_STATE_FILES.includes(file);
    const destDir = (mode === 'team' && isPersonal) ? PERSONAL_DEST_DIR : STATE_DEST_DIR;
    const content = resolveContent(readTemplate(file), mode);
    writeFile(targetDir, `${destDir}/${file}`, content, overwrite);
  }
  for (const file of AGENT_MEMORY_FILES) {
    const destDir = mode === 'team' ? PERSONAL_DEST_DIR : STATE_DEST_DIR;
    writeFile(targetDir, `${destDir}/${file}`, readTemplate(file), overwrite);
  }
}

function writeSkills(targetDir, skillsDir, overwrite, mode = 'solo') {
  for (const skill of SKILLS) {
    const content = resolveContent(readTemplate(`skills/${skill.id}.md`), mode);
    const skillMd =
      `---\nname: ${skill.id}\ndescription: '${skill.desc}'\n---\n\n` +
      content;
    writeFile(targetDir, `${skillsDir}/${skill.id}/SKILL.md`, skillMd, overwrite);
  }
}

function writeAgentsAsSkills(targetDir, skillsDir, overwrite, mode = 'solo') {
  for (const agent of AGENTS) {
    const content = resolveContent(readTemplate(agent.file), mode);
    const skillMd =
      `---\nname: ${agent.id}\ndescription: '${agent.desc}'\n---\n\n` +
      content;
    writeFile(targetDir, `${skillsDir}/${agent.id}/SKILL.md`, skillMd, overwrite);
  }
}

function writeAgentsAsMd(targetDir, agentsDir, overwrite, mode = 'solo') {
  for (const agent of AGENTS) {
    const content = resolveContent(readTemplate(agent.file), mode);
    const agentMd =
      `---\nname: ${agent.id}\ndescription: "${agent.desc}"\n---\n\n` +
      content;
    writeFile(targetDir, `${agentsDir}/${agent.id}.md`, agentMd, overwrite);
  }
}

function writeAgentsAsToml(targetDir, agentsDir, overwrite, mode = 'solo') {
  for (const agent of AGENTS) {
    const content = resolveContent(readTemplate(agent.file), mode);
    const toml =
      `name = "${agent.id}"\n` +
      `description = "${agent.desc}"\n` +
      `developer_instructions = """\n${content}\n"""\n`;
    writeFile(targetDir, `${agentsDir}/${agent.id}.toml`, toml, overwrite);
  }
}

// ─── IDE Generators ──────────────────────────────────────────

function generateVscode(targetDir, overwrite, mode = 'solo') {
  const coreRules = resolveContent(readTemplate('core-rules.md'), mode);

  // Global instructions (dispatcher only — rules are embedded in skills)
  writeFile(targetDir, '.github/copilot-instructions.md', coreRules, overwrite);

  // Skills (.github/skills — VS Code default search path, SKILL.md with frontmatter)
  writeSkills(targetDir, '.github/skills', overwrite, mode);

  // Agents (.github/agents — VS Code uses .agent.md format with frontmatter)
  for (const agent of AGENTS) {
    const content = resolveContent(readTemplate(agent.file), mode);
    const agentMd =
      `---\nname: ${agent.id}\ndescription: "${agent.desc}"\n---\n\n` +
      content;
    writeFile(targetDir, `.github/agents/${agent.id}.agent.md`, agentMd, overwrite);
  }

  // State files
  writeStateFiles(targetDir, overwrite, mode);
}

function generateClaude(targetDir, overwrite, mode = 'solo') {
  // .claude/rules/core.md — dispatcher only (no paths = always loaded)
  writeFile(targetDir, '.claude/rules/core.md', resolveContent(readTemplate('core-rules.md'), mode), overwrite);

  // Skills (SKILL.md with frontmatter)
  writeSkills(targetDir, '.claude/skills', overwrite, mode);

  // Agents (.claude/agents/ — Claude Code agent definition files)
  writeAgentsAsMd(targetDir, '.claude/agents', overwrite, mode);

  // State files
  writeStateFiles(targetDir, overwrite, mode);
}

function generateCursor(targetDir, overwrite, mode = 'solo') {
  // .cursor/rules/core.mdc — dispatcher only (always active)
  const coreRules = resolveContent(readTemplate('core-rules.md'), mode);
  const coreMdc =
    '---\ndescription: Musher dispatcher — workflow guidance and state file references\nalwaysApply: true\n---\n\n' +
    coreRules;
  writeFile(targetDir, '.cursor/rules/core.mdc', coreMdc, overwrite);

  // Skills (.cursor/skills — invokable by mentioning skill name)
  writeSkills(targetDir, '.cursor/skills', overwrite, mode);

  // Agents (.cursor/agents/ — Cursor subagent definition files)
  writeAgentsAsMd(targetDir, '.cursor/agents', overwrite, mode);

  // State files
  writeStateFiles(targetDir, overwrite, mode);
}

function generateCodex(targetDir, overwrite, mode = 'solo') {
  // AGENTS.md — dispatcher only
  writeFile(targetDir, 'AGENTS.md', resolveContent(readTemplate('core-rules.md'), mode), overwrite);

  // Skills (SKILL.md with frontmatter — invokable via $skill-name)
  writeSkills(targetDir, '.agents/skills', overwrite, mode);

  // Agents (.codex/agents/ — Codex TOML agent definition files)
  writeAgentsAsToml(targetDir, '.codex/agents', overwrite, mode);

  // State files
  writeStateFiles(targetDir, overwrite, mode);
}

function generateWindsurf(targetDir, overwrite, mode = 'solo') {
  // .windsurf/rules/core.md — dispatcher (trigger: always_on)
  const coreRules = resolveContent(readTemplate('core-rules.md'), mode);
  const coreRule =
    '---\ntrigger: always_on\n---\n\n' +
    coreRules;
  writeFile(targetDir, '.windsurf/rules/core.md', coreRule, overwrite);

  // Skills (.windsurf/skills — Agent Skills standard)
  writeSkills(targetDir, '.windsurf/skills', overwrite, mode);

  // Agents as skills
  writeAgentsAsSkills(targetDir, '.windsurf/skills', overwrite, mode);

  // State files
  writeStateFiles(targetDir, overwrite, mode);
}

function generateAntigravity(targetDir, overwrite, mode = 'solo') {
  // GEMINI.md — project context (always loaded by Gemini CLI)
  writeFile(targetDir, 'GEMINI.md', resolveContent(readTemplate('core-rules.md'), mode), overwrite);

  // Skills (.gemini/skills/ — SKILL.md format)
  writeSkills(targetDir, '.gemini/skills', overwrite, mode);

  // Agents (.gemini/agents/ — Gemini CLI subagent definition files)
  writeAgentsAsMd(targetDir, '.gemini/agents', overwrite, mode);

  // State files
  writeStateFiles(targetDir, overwrite, mode);
}

// ─── IDE registry ────────────────────────────────────────────
const GENERATORS = {
  vscode:       { name: 'VS Code Copilot',      fn: generateVscode },
  claude:       { name: 'Claude Code',           fn: generateClaude },
  cursor:       { name: 'Cursor',                fn: generateCursor },
  codex:        { name: 'Codex (OpenAI)',         fn: generateCodex },
  windsurf:     { name: 'Windsurf',              fn: generateWindsurf },
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

async function promptMode() {
  console.log('  Project mode:\n');
  console.log('    1. Solo  — Single developer (all state files in docs/)');
  console.log('    2. Team  — Multiple developers (personal state in .harness/, shared in docs/)');
  console.log();

  const answer = await askQuestion('  Choice (1-2, default: 1): ');
  if (answer === '2' || answer.toLowerCase() === 'team') return 'team';
  return 'solo';
}

// ─── Team mode helpers ───────────────────────────────────────
function appendGitignore(targetDir) {
  const gitignorePath = path.join(targetDir, '.gitignore');
  const entry = '\n# Musher personal state (Team mode)\n.harness/\n';
  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, 'utf8');
    if (content.includes('.harness/')) {
      console.log('  ⏭  Skipped (exists): .gitignore entry');
      return;
    }
    fs.appendFileSync(gitignorePath, entry);
  } else {
    fs.writeFileSync(gitignorePath, entry.trimStart());
  }
  console.log('  ✓  .gitignore — added .harness/');
}

function writeGitattributes(targetDir) {
  const content =
    '# Musher Team mode — merge strategy for shared state files\n' +
    'docs/features.md merge=union\n' +
    'docs/dependency-map.md merge=union\n';
  writeFile(targetDir, '.gitattributes', content, false);
}

// ─── Post-install guide ──────────────────────────────────────
function showPostInstallGuide(ideName, mode) {
  const modeLabel = mode === 'team' ? 'Team' : 'Solo';
  const lines = [
    '',
    '  ──────────────────────────────────────────',
    '  ✅ Musher initialized successfully!',
    '',
    `  Mode: ${modeLabel}`,
    `  IDE:  ${ideName}`,
    '',
  ];

  if (mode === 'team') {
    lines.push(
      '  📁 Files:',
      '     docs/           — shared state (git committed)',
      '     .harness/       — personal state (gitignored)',
      '     .gitignore      — .harness/ added',
      '     .gitattributes  — merge=union for shared files',
    );
  } else {
    lines.push(
      '  📁 Files:',
      '     docs/           — all state files',
    );
  }

  lines.push(
    '',
    '  🚀 Next steps:',
    '     1. Ask your AI: "Run bootstrap to onboard this project"',
    '     2. AI scans your codebase and fills state files automatically',
    '     3. Start coding with: @planner "Add [feature name]"',
    '',
    '  📖 Docs: https://www.npmjs.com/package/musher-engineering',
    '  ──────────────────────────────────────────',
    '',
  );

  console.log(lines.join('\n'));
}

// ─── CLI entry ───────────────────────────────────────────────
function showHelp() {
  console.log(`
  Musher Engineering — IDE-agnostic AI Harness

  Usage:
    npx musher-engineering init [options]

  Options:
    --ide <name>     IDE target: vscode, claude, cursor, codex, windsurf, antigravity
    --mode <mode>    Project mode: solo (default) or team
    --dir <path>     Target directory (default: current directory)
    --overwrite      Overwrite existing files
    --help           Show this help

  Examples:
    npx musher-engineering init
    npx musher-engineering init --ide vscode
    npx musher-engineering init --ide vscode --mode team
    npx musher-engineering init --ide claude --dir ./my-project
`);
}

function parseArgs(argv) {
  const args = { command: null, ide: null, mode: null, dir: process.cwd(), overwrite: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === 'init') args.command = 'init';
    else if (arg === '--ide' && argv[i + 1]) { args.ide = argv[++i]; }
    else if (arg === '--mode' && argv[i + 1]) { args.mode = argv[++i]; }
    else if (arg === '--team') { args.mode = 'team'; }
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
    console.log('\n  Musher Engineering — IDE-agnostic AI Harness\n');

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

    // Determine mode
    let mode = args.mode;
    if (mode && !['solo', 'team'].includes(mode)) {
      console.error(`  Unknown mode: ${mode}`);
      console.error('  Available: solo, team');
      process.exit(1);
    }
    if (!mode) {
      mode = await promptMode();
    }

    const gen = GENERATORS[ide];
    const lang = detectLanguage(args.dir);
    console.log(`\n  Installing for ${gen.name} (${mode} mode)... (detected language: ${lang})\n`);
    gen.fn(args.dir, args.overwrite, mode);

    // Team mode extras
    if (mode === 'team') {
      appendGitignore(args.dir);
      writeGitattributes(args.dir);
    }

    showPostInstallGuide(gen.name, mode);
  }
}

module.exports = { run, detectLanguage };
