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
  const exists = fs.existsSync(fullPath);
  if (exists && !overwrite) {
    console.log(`  ⏭  Skipped (exists): ${relPath}`);
    return false;
  }
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`  ${exists ? '↻' : '✓'}  ${relPath}`);
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
  { id: 'code-review-pr', desc: 'Review external Pull Requests for quality, security, and direction alignment. Use when reviewing incoming PRs.' },
  { id: 'deployment', desc: 'Pre-deployment validation checklist. Use before deploying, publishing, or creating release tags.' },
];

const AGENTS = [
  { id: 'reviewer', file: 'agents/reviewer.md', desc: 'Code review + auto-fix. Validates quality, security, and test integrity before commits.' },
  { id: 'sprint-manager', file: 'agents/sprint-manager.md', desc: 'Sprint/Story state tracking, next task guidance, scope drift prevention.' },
  { id: 'planner', file: 'agents/planner.md', desc: 'Feature planning and dependency management. Analyze architecture, break down features.' },
  { id: 'architect', file: 'agents/architect.md', desc: 'Design review gate. Validates structural changes against project direction and module boundaries.' },
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
  'agent-memory/architect.md',
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
5. **Pivot Lock**: the \`pivot\` skill must be run on the default branch by the designated authority (per project-brief.md)
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
    ['csharp', ['global.json', 'Directory.Build.props', 'nuget.config']],
    ['php', ['composer.json']],
    ['swift', ['Package.swift']],
    ['dart', ['pubspec.yaml']],
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
  writeFile(targetDir, '.github/copilot-instructions.md', coreRules, true);

  // Skills (.github/skills — VS Code default search path, SKILL.md with frontmatter)
  writeSkills(targetDir, '.github/skills', true, mode);

  // Agents (.github/agents — VS Code uses .agent.md format with frontmatter)
  for (const agent of AGENTS) {
    const content = resolveContent(readTemplate(agent.file), mode);
    const agentMd =
      `---\nname: ${agent.id}\ndescription: "${agent.desc}"\n---\n\n` +
      content;
    writeFile(targetDir, `.github/agents/${agent.id}.agent.md`, agentMd, true);
  }

  // State files (respect user's --overwrite for data files)
  writeStateFiles(targetDir, overwrite, mode);
}

function generateClaude(targetDir, overwrite, mode = 'solo') {
  // .claude/rules/core.md — dispatcher only (no paths = always loaded)
  writeFile(targetDir, '.claude/rules/core.md', resolveContent(readTemplate('core-rules.md'), mode), true);

  // Skills (SKILL.md with frontmatter)
  writeSkills(targetDir, '.claude/skills', true, mode);

  // Agents (.claude/agents/ — Claude Code agent definition files)
  writeAgentsAsMd(targetDir, '.claude/agents', true, mode);

  // State files (respect user's --overwrite for data files)
  writeStateFiles(targetDir, overwrite, mode);
}

function generateCursor(targetDir, overwrite, mode = 'solo') {
  // .cursor/rules/core.mdc — dispatcher only (always active)
  const coreRules = resolveContent(readTemplate('core-rules.md'), mode);
  const coreMdc =
    '---\ndescription: Musher dispatcher — workflow guidance and state file references\nalwaysApply: true\n---\n\n' +
    coreRules;
  writeFile(targetDir, '.cursor/rules/core.mdc', coreMdc, true);

  // Skills (.cursor/skills — invokable by mentioning skill name)
  writeSkills(targetDir, '.cursor/skills', true, mode);

  // Agents (.cursor/agents/ — Cursor subagent definition files)
  writeAgentsAsMd(targetDir, '.cursor/agents', true, mode);

  // State files (respect user's --overwrite for data files)
  writeStateFiles(targetDir, overwrite, mode);
}

function generateCodex(targetDir, overwrite, mode = 'solo') {
  // AGENTS.md — dispatcher only
  writeFile(targetDir, 'AGENTS.md', resolveContent(readTemplate('core-rules.md'), mode), true);

  // Skills (SKILL.md with frontmatter — invokable via $skill-name)
  writeSkills(targetDir, '.agents/skills', true, mode);

  // Agents (.codex/agents/ — Codex TOML agent definition files)
  writeAgentsAsToml(targetDir, '.codex/agents', true, mode);

  // State files (respect user's --overwrite for data files)
  writeStateFiles(targetDir, overwrite, mode);
}

function generateWindsurf(targetDir, overwrite, mode = 'solo') {
  // .windsurf/rules/core.md — dispatcher (trigger: always_on)
  const coreRules = resolveContent(readTemplate('core-rules.md'), mode);
  const coreRule =
    '---\ntrigger: always_on\n---\n\n' +
    coreRules;
  writeFile(targetDir, '.windsurf/rules/core.md', coreRule, true);

  // Skills (.windsurf/skills — Agent Skills standard)
  writeSkills(targetDir, '.windsurf/skills', true, mode);

  // Agents as skills
  writeAgentsAsSkills(targetDir, '.windsurf/skills', true, mode);

  // State files (respect user's --overwrite for data files)
  writeStateFiles(targetDir, overwrite, mode);
}

function generateAntigravity(targetDir, overwrite, mode = 'solo') {
  // GEMINI.md — project context (always loaded by Gemini CLI)
  writeFile(targetDir, 'GEMINI.md', resolveContent(readTemplate('core-rules.md'), mode), true);

  // Skills (.gemini/skills/ — SKILL.md format)
  writeSkills(targetDir, '.gemini/skills', true, mode);

  // Agents (.gemini/agents/ — Gemini CLI subagent definition files)
  writeAgentsAsMd(targetDir, '.gemini/agents', true, mode);

  // State files (respect user's --overwrite for data files)
  writeStateFiles(targetDir, overwrite, mode);
}

// ─── IDE registry ────────────────────────────────────────────
const GENERATORS = {
  vscode:       { name: 'VS Code Copilot',      fn: generateVscode },
  claude:       { name: 'Claude Code',           fn: generateClaude },
  cursor:       { name: 'Cursor',                fn: generateCursor },
  codex:        { name: 'Codex (OpenAI)',         fn: generateCodex },
  windsurf:     { name: 'Windsurf',              fn: generateWindsurf },
  antigravity:  { name: 'Antigravity',           fn: generateAntigravity },
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

function detectExistingInstall(targetDir) {
  // Musher state files — these contain user data that overwrite would destroy
  const stateMarkers = [
    'docs/project-state.md',
    'docs/features.md',
    'docs/dependency-map.md',
    'docs/failure-patterns.md',
    'docs/project-brief.md',
    '.harness/project-state.md',
    '.harness/failure-patterns.md',
  ];
  const existingState = stateMarkers.filter(f => fs.existsSync(path.join(targetDir, f)));

  // IDE config files — always overwritten regardless of user choice
  const ideMarkers = [
    ['.github/copilot-instructions.md', 'vscode'],
    ['.claude/rules/core.md', 'claude'],
    ['.cursor/rules/core.mdc', 'cursor'],
    ['.windsurf/rules/core.md', 'windsurf'],
    ['GEMINI.md', 'antigravity'],
  ];
  // Only count as existing if the file contains 'Musher' (not from other frameworks)
  const existingIde = ideMarkers.filter(([f]) => {
    const fullPath = path.join(targetDir, f);
    if (!fs.existsSync(fullPath)) return false;
    try {
      return fs.readFileSync(fullPath, 'utf8').includes('Musher');
    } catch { return false; }
  });

  return { stateFiles: existingState, ideFiles: existingIde, hasAny: existingState.length > 0 || existingIde.length > 0 };
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
    '     3. Start coding: ask your AI to plan a new feature',
    '',
    '  📖 Docs: https://www.npmjs.com/package/musher-engineering',
    '  ──────────────────────────────────────────',
    '',
  );

  console.log(lines.join('\n'));
}

// ─── Doctor command ──────────────────────────────────────────
function runDoctor(targetDir) {
  console.log('\n  Musher Doctor — Installation Health Check\n');
  const checks = [];
  let passed = 0;
  let failed = 0;

  // Check state files
  for (const file of STATE_FILES) {
    const docsPath = path.join(targetDir, 'docs', file);
    const harnessPath = path.join(targetDir, '.harness', file);
    const exists = fs.existsSync(docsPath) || fs.existsSync(harnessPath);
    if (exists) {
      checks.push(`  ✅  ${file}`);
      passed++;
    } else {
      checks.push(`  ❌  ${file} — not found`);
      failed++;
    }
  }

  // Check agent-memory files
  for (const file of AGENT_MEMORY_FILES) {
    const docsPath = path.join(targetDir, 'docs', file);
    const harnessPath = path.join(targetDir, '.harness', file);
    const exists = fs.existsSync(docsPath) || fs.existsSync(harnessPath);
    if (exists) {
      checks.push(`  ✅  ${file}`);
      passed++;
    } else {
      checks.push(`  ❌  ${file} — not found`);
      failed++;
    }
  }

  // Check for IDE-specific files (detect which IDE was used)
  const ideChecks = [
    ['.github/copilot-instructions.md', 'vscode'],
    ['.claude/rules/core.md', 'claude'],
    ['.cursor/rules/core.mdc', 'cursor'],
    ['AGENTS.md', 'codex'],
    ['.windsurf/rules/core.md', 'windsurf'],
    ['GEMINI.md', 'antigravity'],
  ];

  let detectedIde = null;
  for (const [file, ide] of ideChecks) {
    const fullPath = path.join(targetDir, file);
    if (fs.existsSync(fullPath)) {
      // Verify it's a Musher file, not from another framework
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (!content.includes('Musher') && !content.includes('musher')) continue;
      } catch { continue; }
      detectedIde = ide;
      checks.push(`  ✅  IDE detected: ${GENERATORS[ide].name}`);
      passed++;
      break;
    }
  }
  if (!detectedIde) {
    checks.push('  ❌  No IDE configuration found — run `musher init` first');
    failed++;
  }

  // Detect mode
  const isTeam = fs.existsSync(path.join(targetDir, '.harness'));
  checks.push(`  ℹ️   Mode: ${isTeam ? 'Team' : 'Solo'}`);

  console.log(checks.join('\n'));
  console.log(`\n  Result: ${passed} passed, ${failed} failed\n`);
  return failed === 0;
}

// ─── Validate command ────────────────────────────────────────
function runValidate(targetDir) {
  console.log('\n  Musher Validate — State File Content Check\n');
  const results = [];
  let warnings = 0;

  // Each state file has a known sentinel that only exists in unfilled templates.
  // failure-patterns.md is excluded: it intentionally keeps FP-001~004 as templates
  // after bootstrap (Frequency: 0 is the normal initial state, not a placeholder).
  const templateSentinels = {
    'project-state.md': 'S1-1 | Project scaffolding',
    'dependency-map.md': 'Add new modules above this line',
    'features.md': 'Add new features above this line',
    'project-brief.md': 'This is the north star for all decisions',
  };

  for (const file of STATE_FILES) {
    const docsPath = path.join(targetDir, 'docs', file);
    const harnessPath = path.join(targetDir, '.harness', file);
    const filePath = fs.existsSync(docsPath) ? docsPath : (fs.existsSync(harnessPath) ? harnessPath : null);

    if (!filePath) {
      results.push(`  ❌  ${file} — not found`);
      warnings++;
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const sentinel = templateSentinels[file];

    if (!sentinel) {
      // failure-patterns.md: no sentinel check — template state is normal
      results.push(`  ✅  ${file} — ok (no failures logged yet is normal)`);
    } else if (content.includes(sentinel)) {
      results.push(`  ⚠️   ${file} — placeholder only. Run \`bootstrap\` to fill.`);
      warnings++;
    } else {
      results.push(`  ✅  ${file} — has content`);
    }
  }

  console.log(results.join('\n'));
  console.log(`\n  Result: ${warnings === 0 ? 'All state files have content' : `${warnings} file(s) need attention`}\n`);
  return warnings === 0;
}

// ─── CLI entry ───────────────────────────────────────────────
function showHelp() {
  console.log(`
  Musher Engineering — IDE-agnostic AI Harness

  Usage:
    npx musher-engineering init [options]
    npx musher-engineering doctor [--dir <path>]
    npx musher-engineering validate [--dir <path>]

  Commands:
    init             Install Musher files for your IDE
    doctor           Check if Musher files are installed and healthy
    validate         Verify state files have content (not just placeholders)

  Options:
    --ide <name>     IDE target: vscode, claude, cursor, codex, windsurf, antigravity
    --mode <mode>    Project mode: solo (default) or team
    --dir <path>     Target directory (default: current directory)
    --overwrite      Overwrite existing files (including state files)
    --batch          Non-interactive mode (requires --ide; defaults to solo mode)
    --version        Show version number
    --help           Show this help

  Examples:
    npx musher-engineering init
    npx musher-engineering init --ide vscode
    npx musher-engineering init --ide vscode --mode team
    npx musher-engineering init --ide claude --dir ./my-project
    npx musher-engineering doctor
    npx musher-engineering validate
`);
}

function parseArgs(argv) {
  const args = { command: null, ide: null, mode: null, dir: process.cwd(), overwrite: false, help: false, batch: false, version: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === 'init') args.command = 'init';
    else if (arg === 'doctor') args.command = 'doctor';
    else if (arg === 'validate') args.command = 'validate';
    else if (arg === '--ide' && argv[i + 1]) { args.ide = argv[++i]; }
    else if (arg === '--mode' && argv[i + 1]) { args.mode = argv[++i]; }
    else if (arg === '--team') { args.mode = 'team'; }
    else if (arg === '--dir' && argv[i + 1]) { args.dir = path.resolve(argv[++i]); }
    else if (arg === '--overwrite') args.overwrite = true;
    else if (arg === '--batch') args.batch = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else if (arg === '--version') args.version = true;
  }
  return args;
}

async function run(argv) {
  const args = parseArgs(argv);

  if (args.version) {
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
    console.log(pkg.version);
    process.exit(0);
  }

  if (args.help || !args.command) {
    showHelp();
    process.exit(args.help ? 0 : 1);
  }

  if (args.command === 'doctor') {
    const ok = runDoctor(args.dir);
    process.exit(ok ? 0 : 1);
  }

  if (args.command === 'validate') {
    const ok = runValidate(args.dir);
    process.exit(ok ? 0 : 1);
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
      if (args.batch) {
        console.error('  --batch requires --ide to be specified');
        process.exit(1);
      }
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
      if (args.batch) {
        mode = 'solo';
      } else {
        mode = await promptMode();
      }
    }

    // Determine overwrite — prompt only in interactive terminal
    let overwrite = args.overwrite;
    if (!overwrite && !args.batch && process.stdin.isTTY) {
      const existing = detectExistingInstall(args.dir);
      if (existing.hasAny) {
        console.log('  ⚠  Existing Musher files detected:\n');
        if (existing.stateFiles.length > 0) {
          console.log('  📄 State files (contain your project data):');
          for (const f of existing.stateFiles) {
            console.log(`     • ${f}`);
          }
        }
        if (existing.ideFiles.length > 0) {
          console.log('  🔧 IDE configs (always updated to latest version):');
          for (const [f, ide] of existing.ideFiles) {
            console.log(`     • ${f} (${ide})`);
          }
        }
        console.log();
        if (existing.stateFiles.length > 0) {
          console.log('  Overwrite resets state files to blank templates.');
          console.log('  Choose N to keep your existing data (recommended).\n');
          const answer = await askQuestion('  Overwrite state files? (y/N): ');
          overwrite = answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
        } else {
          console.log('  No state files to overwrite — proceeding with install.\n');
        }
      }
    }

    const gen = GENERATORS[ide];
    const lang = detectLanguage(args.dir);
    console.log(`\n  Installing for ${gen.name} (${mode} mode)... (detected language: ${lang})\n`);
    gen.fn(args.dir, overwrite, mode);

    // Team mode extras
    if (mode === 'team') {
      appendGitignore(args.dir);
      writeGitattributes(args.dir);
    }

    showPostInstallGuide(gen.name, mode);
  }
}

module.exports = { run, detectLanguage, runDoctor, runValidate };
