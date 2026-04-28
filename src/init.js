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
  { id: 'sync-tests', desc: 'Ensure test mocks stay synchronized when interfaces change. Use when modifying repository or service interfaces.' },
  { id: 'secure', desc: 'Security risk inspection before commits. Use when reviewing code for security issues.' },
  { id: 'debug', desc: 'Investigate and diagnose issues. Use when debugging or analyzing unexpected behavior.' },
  { id: 'check-impact', desc: 'Assess change blast radius. Use when modifying shared modules or interfaces.' },
  { id: 'breakdown', desc: 'Break down features into implementable stories. Use when planning new features.' },
  { id: 'setup', desc: 'Onboard project into kode:harness. Scans codebase and fills state files. Use after harness init or when state files are empty.' },
  { id: 'wrap-up', desc: 'Capture session lessons and update state files. Use at the end of every session.' },
  { id: 'pivot', desc: 'Propagate direction changes across all state files. Use when project goals, technology, scope, or architecture changes.' },
  { id: 'pr-review', desc: 'Review external Pull Requests for quality, security, and direction alignment. Use when reviewing incoming PRs.' },
  { id: 'release', desc: 'Pre-deployment validation checklist. Use before deploying, publishing, or creating release tags.' },
  { id: 'state-check', desc: 'Deterministic verification of state file consistency. Use before STATUS: DONE (Iron Law #10) and when state drift is suspected.' },
];

const AGENTS = [
  { id: 'reviewer', file: 'agents/reviewer.md', desc: 'Code review + auto-fix. Validates quality, security, and test integrity before commits.' },
  { id: 'lead', file: 'agents/lead.md', desc: 'Sprint/Story state tracking, next task guidance, scope drift prevention.' },
  { id: 'pm', file: 'agents/pm.md', desc: 'Feature planning and dependency management. Analyze architecture, break down features.' },
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
  'agent-memory/pm.md',
  'agent-memory/lead.md',
  'agent-memory/architect.md',
];

const PERSONAL_STATE_FILES = ['project-state.md', 'failure-patterns.md'];
const PERSONAL_DIRS = ['agent-memory/'];

const STATE_DEST_DIR = 'docs';
const PERSONAL_DEST_DIR = '.harness';

function hasFrameworkMarker(content) {
  return content.includes('kode:harness')
    || content.includes('harness engineering')
    || content.includes('@kodevibe/harness')
    || content.includes('harness-engineering')
    || content.includes('musher-engineering');
}

function hasIdeLayout(targetDir, ide) {
  const requiredByIde = {
    vscode: '.github/skills/setup/SKILL.md',
    claude: '.claude/skills/setup/SKILL.md',
    cursor: '.cursor/skills/setup/SKILL.md',
    codex: '.agents/skills/setup/SKILL.md',
    windsurf: '.windsurf/skills/setup/SKILL.md',
    antigravity: '.gemini/skills/setup/SKILL.md',
  };

  const requiredPath = requiredByIde[ide];
  return requiredPath ? fs.existsSync(path.join(targetDir, requiredPath)) : false;
}

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

function resolveContent(content, mode, crew = false) {
  // Crew mode: strip Crew-only blocks unless --crew is specified
  if (!crew) {
    content = content.replace(/<!-- CREW_MODE_START -->[\s\S]*?<!-- CREW_MODE_END -->\n?/g, '');
  } else {
    // Remove markers, keep Crew content
    content = content
      .replaceAll('<!-- CREW_MODE_START -->\n', '')
      .replaceAll('<!-- CREW_MODE_START -->', '')
      .replaceAll('<!-- CREW_MODE_END -->\n', '')
      .replaceAll('<!-- CREW_MODE_END -->', '');
  }

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

function writeStateFiles(targetDir, overwrite, mode = 'solo', crew = false) {
  for (const file of STATE_FILES) {
    const isPersonal = PERSONAL_STATE_FILES.includes(file);
    const destDir = (mode === 'team' && isPersonal) ? PERSONAL_DEST_DIR : STATE_DEST_DIR;
    const content = resolveContent(readTemplate(file), mode, crew);
    writeFile(targetDir, `${destDir}/${file}`, content, overwrite);
  }
  for (const file of AGENT_MEMORY_FILES) {
    const destDir = mode === 'team' ? PERSONAL_DEST_DIR : STATE_DEST_DIR;
    writeFile(targetDir, `${destDir}/${file}`, readTemplate(file), overwrite);
  }
}

function writeSkills(targetDir, skillsDir, overwrite, mode = 'solo', crew = false) {
  for (const skill of SKILLS) {
    const content = resolveContent(readTemplate(`skills/${skill.id}.md`), mode, crew);
    const skillMd =
      `---\nname: ${skill.id}\ndescription: '${skill.desc}'\n---\n\n` +
      content;
    writeFile(targetDir, `${skillsDir}/${skill.id}/SKILL.md`, skillMd, overwrite);
  }
}

function writeAgentsAsSkills(targetDir, skillsDir, overwrite, mode = 'solo', crew = false) {
  for (const agent of AGENTS) {
    const content = resolveContent(readTemplate(agent.file), mode, crew);
    const skillMd =
      `---\nname: ${agent.id}\ndescription: '${agent.desc}'\n---\n\n` +
      content;
    writeFile(targetDir, `${skillsDir}/${agent.id}/SKILL.md`, skillMd, overwrite);
  }
}

function writeAgentsAsMd(targetDir, agentsDir, overwrite, mode = 'solo', crew = false) {
  for (const agent of AGENTS) {
    const content = resolveContent(readTemplate(agent.file), mode, crew);
    const agentMd =
      `---\nname: ${agent.id}\ndescription: "${agent.desc}"\n---\n\n` +
      content;
    writeFile(targetDir, `${agentsDir}/${agent.id}.md`, agentMd, overwrite);
  }
}

function writeAgentsAsToml(targetDir, agentsDir, overwrite, mode = 'solo', crew = false) {
  for (const agent of AGENTS) {
    const content = resolveContent(readTemplate(agent.file), mode, crew);
    const toml =
      `name = "${agent.id}"\n` +
      `description = "${agent.desc}"\n` +
      `developer_instructions = """\n${content}\n"""\n`;
    writeFile(targetDir, `${agentsDir}/${agent.id}.toml`, toml, overwrite);
  }
}

// ─── IDE Generators ──────────────────────────────────────────

function generateVscode(targetDir, overwrite, mode = 'solo', crew = false) {
  const coreRules = resolveContent(readTemplate('core-rules.md'), mode, crew);

  // Global instructions (dispatcher only — rules are embedded in skills)
  writeFile(targetDir, '.github/copilot-instructions.md', coreRules, true);

  // Skills (.github/skills — VS Code default search path, SKILL.md with frontmatter)
  writeSkills(targetDir, '.github/skills', true, mode, crew);

  // Agents (.github/agents — VS Code uses .agent.md format with frontmatter)
  for (const agent of AGENTS) {
    const content = resolveContent(readTemplate(agent.file), mode, crew);
    const agentMd =
      `---\nname: ${agent.id}\ndescription: "${agent.desc}"\n---\n\n` +
      content;
    writeFile(targetDir, `.github/agents/${agent.id}.agent.md`, agentMd, true);
  }

  // State files (respect user's --overwrite for data files)
  writeStateFiles(targetDir, overwrite, mode, crew);
}

function generateClaude(targetDir, overwrite, mode = 'solo', crew = false) {
  const coreRules = resolveContent(readTemplate('core-rules.md'), mode, crew);

  // CLAUDE.md — Claude Code's canonical project memory file (auto-loaded at session start)
  writeFile(targetDir, 'CLAUDE.md', coreRules, true);

  // .claude/rules/core.md — secondary dispatcher (also auto-loaded by Claude Code's
  // InstructionsLoaded mechanism; kept for redundancy and rule-discovery tooling)
  writeFile(targetDir, '.claude/rules/core.md', coreRules, true);

  // Skills (SKILL.md with frontmatter)
  writeSkills(targetDir, '.claude/skills', true, mode, crew);

  // Agents (.claude/agents/ — Claude Code agent definition files)
  writeAgentsAsMd(targetDir, '.claude/agents', true, mode, crew);

  // State files (respect user's --overwrite for data files)
  writeStateFiles(targetDir, overwrite, mode, crew);
}

function generateCursor(targetDir, overwrite, mode = 'solo', crew = false) {
  // .cursor/rules/core.mdc — dispatcher only (always active)
  const coreRules = resolveContent(readTemplate('core-rules.md'), mode, crew);
  const coreMdc =
    '---\ndescription: kode:harness dispatcher — workflow guidance and state file references\nalwaysApply: true\n---\n\n' +
    coreRules;
  writeFile(targetDir, '.cursor/rules/core.mdc', coreMdc, true);

  // AGENTS.md — Cursor CLI also reads project-root AGENTS.md as a rule
  writeFile(targetDir, 'AGENTS.md', coreRules, true);

  // Skills (.cursor/skills — invokable by mentioning skill name)
  writeSkills(targetDir, '.cursor/skills', true, mode, crew);

  // Agents (.cursor/agents/ — Cursor subagent definition files)
  writeAgentsAsMd(targetDir, '.cursor/agents', true, mode, crew);

  // State files (respect user's --overwrite for data files)
  writeStateFiles(targetDir, overwrite, mode, crew);
}

function generateCodex(targetDir, overwrite, mode = 'solo', crew = false) {
  // AGENTS.md — Codex CLI's canonical project instructions file (the only file
  // Codex CLI auto-loads). All skill/agent references must be discoverable from here.
  writeFile(targetDir, 'AGENTS.md', resolveContent(readTemplate('core-rules.md'), mode, crew), true);

  // Skills (SKILL.md with frontmatter — invokable via $skill-name)
  writeSkills(targetDir, '.agents/skills', true, mode, crew);

  // Agents (.codex/agents/ — markdown subagent files with YAML frontmatter,
  // matching the Cursor/Claude convention used as a Codex compat directory)
  writeAgentsAsMd(targetDir, '.codex/agents', true, mode, crew);

  // State files (respect user's --overwrite for data files)
  writeStateFiles(targetDir, overwrite, mode, crew);
}

function generateWindsurf(targetDir, overwrite, mode = 'solo', crew = false) {
  // .windsurf/rules/core.md — dispatcher (trigger: always_on)
  const coreRules = resolveContent(readTemplate('core-rules.md'), mode, crew);
  const coreRule =
    '---\ntrigger: always_on\n---\n\n' +
    coreRules;
  writeFile(targetDir, '.windsurf/rules/core.md', coreRule, true);

  // Skills (.windsurf/skills — Agent Skills standard)
  writeSkills(targetDir, '.windsurf/skills', true, mode, crew);

  // Agents as skills
  writeAgentsAsSkills(targetDir, '.windsurf/skills', true, mode, crew);

  // State files (respect user's --overwrite for data files)
  writeStateFiles(targetDir, overwrite, mode, crew);
}

function generateAntigravity(targetDir, overwrite, mode = 'solo', crew = false) {
  const coreRules = resolveContent(readTemplate('core-rules.md'), mode, crew);

  // GEMINI.md — Gemini CLI / Antigravity's canonical project context file
  writeFile(targetDir, 'GEMINI.md', coreRules, true);

  // AGENTS.md — Antigravity also follows the AGENTS.md convention shared by
  // Codex / Cursor CLI; emitting it broadens compatibility with no downside
  writeFile(targetDir, 'AGENTS.md', coreRules, true);

  // Skills (.gemini/skills/ — SKILL.md format)
  writeSkills(targetDir, '.gemini/skills', true, mode, crew);

  // Agents (.gemini/agents/ — Gemini CLI subagent definition files)
  writeAgentsAsMd(targetDir, '.gemini/agents', true, mode, crew);

  // State files (respect user's --overwrite for data files)
  writeStateFiles(targetDir, overwrite, mode, crew);
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
  const entry = '\n# kode:harness personal state (Team mode)\n.harness/\n';
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
  // kode:harness state files — these contain user data that overwrite would destroy
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
  // Only count as existing if the file contains a framework marker (not from other frameworks)
  const existingIde = ideMarkers.filter(([f, ide]) => {
    const fullPath = path.join(targetDir, f);
    if (!fs.existsSync(fullPath)) return false;
    if (hasIdeLayout(targetDir, ide)) return true;
    try {
      return hasFrameworkMarker(fs.readFileSync(fullPath, 'utf8'));
    } catch { return false; }
  });

  return { stateFiles: existingState, ideFiles: existingIde, hasAny: existingState.length > 0 || existingIde.length > 0 };
}

function writeGitattributes(targetDir) {
  const content =
    '# kode:harness Team mode — merge strategy for shared state files\n' +
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
    '  ✅ kode:harness initialized successfully!',
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
    '     1. Ask your AI: "Run setup to onboard this project"',
    '     2. AI scans your codebase and fills state files automatically',
    '     3. Start coding: ask your AI to plan a new feature',
    '',
    '  ⚙️  IDE Settings (large projects):',
    '',
    '     VS Code      → settings.json: "chat.agent.maxRequests": 100',
    '     Cursor        → Default OK (auto-managed)',
    '     Windsurf      → Default OK (auto-managed)',
    '     Claude Code   → Default OK (terminal-based)',
    '',
    '  📖 Docs: https://www.npmjs.com/package/@kodevibe/harness',
    '  ──────────────────────────────────────────',
    '',
  );

  console.log(lines.join('\n'));
}

// ─── Doctor command ──────────────────────────────────────────
function runDoctor(targetDir) {
  console.log('\n  kode:harness Doctor — Installation Health Check\n');
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

  // Check for IDE-specific files (detect which IDE was used).
  // Order matters: IDE-unique markers MUST be checked before AGENTS.md,
  // because Cursor and Antigravity now also emit AGENTS.md for compat.
  const ideChecks = [
    ['.github/copilot-instructions.md', 'vscode'],
    ['.claude/rules/core.md', 'claude'],
    ['.cursor/rules/core.mdc', 'cursor'],
    ['.windsurf/rules/core.md', 'windsurf'],
    ['GEMINI.md', 'antigravity'],
    ['AGENTS.md', 'codex'],
  ];

  let detectedIde = null;
  for (const [file, ide] of ideChecks) {
    const fullPath = path.join(targetDir, file);
    if (fs.existsSync(fullPath)) {
      if (hasIdeLayout(targetDir, ide)) {
        detectedIde = ide;
        checks.push(`  ✅  IDE detected: ${GENERATORS[ide].name}`);
        passed++;
        break;
      }
      // Verify it's a kode:harness-managed file, not from another framework
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (!hasFrameworkMarker(content)) continue;
      } catch { continue; }
      detectedIde = ide;
      checks.push(`  ✅  IDE detected: ${GENERATORS[ide].name}`);
      passed++;
      break;
    }
  }
  if (!detectedIde) {
    checks.push('  ❌  No IDE configuration found — run `harness init` first');
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
  console.log('\n  kode:harness Validate — State File Content Check\n');
  const results = [];
  let warnings = 0;

  // Each state file has a known sentinel that only exists in unfilled templates.
  // failure-patterns.md is excluded: it intentionally keeps FP-001~004 as templates
  // after setup (Frequency: 0 is the normal initial state, not a placeholder).
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
      results.push(`  ⚠️   ${file} — placeholder only. Run \`setup\` to fill.`);
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
  kode:harness — Harness Engineering

  Usage:
    npx @kodevibe/harness init [options]
    npx @kodevibe/harness doctor [--dir <path>]
    npx @kodevibe/harness validate [--dir <path>]

  Commands:
    init             Install kode:harness files for your IDE
    doctor           Check if kode:harness files are installed and healthy
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
    npx @kodevibe/harness init
    npx @kodevibe/harness init --ide vscode
    npx @kodevibe/harness init --ide vscode --mode team
    npx @kodevibe/harness init --ide claude --dir ./my-project
    npx @kodevibe/harness doctor
    npx @kodevibe/harness validate
`);
}

function parseArgs(argv) {
  const args = { command: null, ide: null, mode: null, dir: process.cwd(), overwrite: false, help: false, batch: false, version: false, crew: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === 'init') args.command = 'init';
    else if (arg === 'doctor') args.command = 'doctor';
    else if (arg === 'validate') args.command = 'validate';
    else if (arg === '--ide' && argv[i + 1]) { args.ide = argv[++i]; }
    else if (arg === '--mode' && argv[i + 1]) { args.mode = argv[++i]; }
    else if (arg === '--team') { args.mode = 'team'; }
    else if (arg === '--crew') args.crew = true;
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
    console.log('\n  kode:harness — Harness Engineering\n');

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
        console.log('  ⚠  Existing kode:harness files detected:\n');
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
    const crew = args.crew;
    const lang = detectLanguage(args.dir);
    const modeDesc = crew ? `${mode} + crew` : mode;
    console.log(`\n  Installing for ${gen.name} (${modeDesc} mode)... (detected language: ${lang})\n`);
    gen.fn(args.dir, overwrite, mode, crew);

    // Team mode extras
    if (mode === 'team') {
      appendGitignore(args.dir);
      writeGitattributes(args.dir);
    }

    showPostInstallGuide(gen.name, mode);
  }
}

module.exports = { run, detectLanguage, runDoctor, runValidate };
