#!/usr/bin/env node
// Drift guard between harness/ (Source of Truth) and this repo's generated IDE files.
// Re-runs `init` into a tmp directory and diffs .github/skills + .github/agents
// against the committed copy. Drift = developer forgot to regenerate after editing harness/.
//
// Notes:
// - Runs without --crew (the published default).
// - Skill/Agent/core dispatcher files MUST stay 1:1 with harness/ to avoid shipping stale templates.
//
// Exit 0 = in sync. Exit 1 = drift (prints offending paths + remediation hint).

'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-drift-'));

try {
  execSync(
    `node "${path.join(repoRoot, 'bin', 'cli.js')}" init --ide vscode --batch --dir "${tmpRoot}" --overwrite`,
    { stdio: 'pipe' }
  );

  const targets = [
    { rel: '.github/skills', label: 'skills' },
    { rel: '.github/agents', label: 'agents' },
    { rel: '.github/copilot-instructions.md', label: 'core dispatcher' },
  ];

  let drifted = false;

  for (const t of targets) {
    const generated = path.join(tmpRoot, t.rel);
    const committed = path.join(repoRoot, t.rel);
    if (!fs.existsSync(generated) || !fs.existsSync(committed)) {
      console.error(`drift-check: missing ${t.rel} (generated=${fs.existsSync(generated)}, committed=${fs.existsSync(committed)})`);
      drifted = true;
      continue;
    }
    try {
      execSync(`diff -r "${generated}" "${committed}"`, { stdio: 'pipe' });
    } catch (e) {
      drifted = true;
      const out = (e.stdout || Buffer.from('')).toString();
      console.error(`\n❌ drift in ${t.rel} — committed copy differs from harness/ regeneration:`);
      console.error(out.trim().split('\n').slice(0, 30).join('\n'));
    }
  }

  if (drifted) {
    console.error(
      '\nFix: re-run `npm run harness:sync` to regenerate `.github` files from `harness/`.\n' +
      'Source of Truth is `harness/`. Edit there, then sync.'
    );
    process.exit(1);
  }

  console.log('✅ harness/ ↔ .github/ in sync (skills + agents + core dispatcher)');
  process.exit(0);
} finally {
  try { fs.rmSync(tmpRoot, { recursive: true, force: true }); } catch (_) { /* ignore */ }
}
