/**
 * Copies enforcement tooling into a target project.
 *
 * Usage:
 *   node install-enforcement.js --target=<project-root> [--skip-install]
 *
 * Actions:
 *   1. Creates scripts/ and scripts/lib/ in target if needed
 *   2. Copies enforcement scripts (skip if already exists)
 *   3. Copies .husky/ hooks
 *   4. Creates .git/hooks/pre-commit and .git/hooks/pre-push
 *   5. Merges npm scripts into package.json
 *   6. Adds lint-staged config to package.json
 *   7. Installs dev deps (unless --skip-install)
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const childProcess = require('node:child_process');

// ---------------------------------------------------------------------------
// Arg parsing
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const flags = { target: null, skipInstall: false };
  for (const arg of argv.slice(2)) {
    if (arg.startsWith('--target=')) flags.target = arg.slice('--target='.length);
    else if (arg === '--skip-install') flags.skipInstall = true;
  }
  if (!flags.target) {
    console.error('Error: --target=<project-root> is required');
    process.exit(1);
  }
  return flags;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function copyIfAbsent(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.copyFileSync(src, dest);
  }
}

function run(cmd, args, cwd) {
  childProcess.execFileSync(cmd, args, { cwd, stdio: 'ignore' });
}

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

const LIB_DIR = path.join(__dirname, 'lib');
const HOOKS_DIR = path.join(__dirname, 'hooks');

const ENFORCEMENT_SCRIPTS = [
  'check-secrets.js',
  'check-file-sizes.js',
  'validate-docs.js',
  'generate-docs.js',
  'generate-docs-helpers.js',
];

const NPM_SCRIPTS = {
  test: 'vitest run',
  'test:all': 'vitest run',
  posttest: 'git rev-parse HEAD > .test-passed',
  'validate-docs': 'node scripts/validate-docs.js --full',
  'generate-docs': 'node scripts/generate-docs.js',
};

const LINT_STAGED_CONFIG = {
  'src/**/*.ts': ['oxlint --type-aware --tsconfig tsconfig.build.json --fix', 'oxfmt --write'],
  'tests/**/*.ts': ['oxlint --type-aware --tsconfig tsconfig.build.json --fix', 'oxfmt --write'],
};

function copyEnforcementScripts(targetDir) {
  const scriptsDir = path.join(targetDir, 'scripts');
  const libDir = path.join(scriptsDir, 'lib');

  fs.mkdirSync(libDir, { recursive: true });
  for (const file of ENFORCEMENT_SCRIPTS) {
    copyIfAbsent(path.join(LIB_DIR, file), path.join(libDir, file));
  }
}

function copyHooks(targetDir) {
  const gitHooksDir = path.join(targetDir, '.git', 'hooks');
  fs.mkdirSync(gitHooksDir, { recursive: true });

  // Copy pre-commit hook
  const preCommitSrc = path.join(HOOKS_DIR, 'pre-commit');
  const preCommitDest = path.join(gitHooksDir, 'pre-commit');
  fs.copyFileSync(preCommitSrc, preCommitDest);
  fs.chmodSync(preCommitDest, 0o755);

  // Copy pre-push hook
  const prePushSrc = path.join(HOOKS_DIR, 'pre-push');
  const prePushDest = path.join(gitHooksDir, 'pre-push');
  fs.copyFileSync(prePushSrc, prePushDest);
  fs.chmodSync(prePushDest, 0o755);
}

function mergePackageJson(targetDir) {
  const pkgPath = path.join(targetDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  // Merge scripts (no overwrite)
  pkg.scripts = pkg.scripts || {};
  for (const [key, value] of Object.entries(NPM_SCRIPTS)) {
    if (!pkg.scripts[key]) pkg.scripts[key] = value;
  }

  // Add lint-staged config if absent
  if (!pkg['lint-staged']) {
    pkg['lint-staged'] = LINT_STAGED_CONFIG;
  }

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const flags = parseArgs(process.argv);
  const targetDir = path.resolve(flags.target);

  copyEnforcementScripts(targetDir);
  copyHooks(targetDir);
  mergePackageJson(targetDir);

  if (!flags.skipInstall) {
    run('pnpm', ['install', '--save-dev', 'lint-staged'], targetDir);
  }

  console.log('Enforcement tooling installed into ' + targetDir);
  console.log('');
  console.log('Git hooks installed:');
  console.log('  .git/hooks/pre-commit  - Runs lint, format check, secret scan, file size check, doc generation');
  console.log('  .git/hooks/pre-push    - Runs tests with SHA-based caching');
}

main();
