/**
 * Project scaffolding script for Node/TypeScript projects.
 *
 * Usage:
 *   node init-project.js [--name=<project-name>] [--framework=<vite|nextjs|express|fastify|none>]
 *
 * Creates a directory structure, git repo, and package.json with appropriate deps.
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const childProcess = require('node:child_process');

// ---------------------------------------------------------------------------
// Flag parsing
// ---------------------------------------------------------------------------

const VALID_FRAMEWORKS = ['vite', 'nextjs', 'express', 'fastify', 'none'];

function parseArgs(argv) {
  const flags = { name: null, framework: 'none', skipInstall: false };
  for (const arg of argv.slice(2)) {
    if (arg.startsWith('--name=')) flags.name = arg.slice('--name='.length);
    else if (arg.startsWith('--framework=')) flags.framework = arg.slice('--framework='.length);
    else if (arg === '--skip-install') flags.skipInstall = true;
  }
  if (!VALID_FRAMEWORKS.includes(flags.framework)) {
    console.error('Unknown framework "' + flags.framework + '". Must be one of: ' + VALID_FRAMEWORKS.join(', '));
    process.exit(1);
  }
  return flags;
}

// ---------------------------------------------------------------------------
// Dependency maps
// ---------------------------------------------------------------------------

const FRAMEWORK_DEPS = {
  none:     { dependencies: {}, devDependencies: {} },
  express:  { dependencies: { express: '^5.0.0' }, devDependencies: { '@types/express': '^5.0.0' } },
  fastify:  { dependencies: { fastify: '^5.0.0' }, devDependencies: {} },
  vite:     {
    dependencies: {},
    devDependencies: { vite: '^6.0.0', '@vitejs/plugin-react': '^0.5.0', react: '^19.0.0', 'react-dom': '^19.0.0' },
  },
  nextjs:   {
    dependencies: { next: '^15.0.0', react: '^19.0.0', 'react-dom': '^19.0.0' },
    devDependencies: { '@types/react': '^19.0.0', '@types/node': '^22.0.0' },
  },
};

const TS_DEV_DEPS = {
  typescript: '^5.9.0',
  '@types/node': '^22.0.0',
  tsx: '^4.21.0',
  'oxlint': '^1.54.0',
  'oxlint-tsgolint': '^0.16.0',
  'oxfmt': '^0.39.0',
  'vitest': '^4.0.0',
  '@vitest/coverage-v8': '^4.0.0',
};

const NPM_SCRIPTS = {
  build: 'tsc -p tsconfig.build.json',
  'check': 'pnpm format:check && pnpm lint && pnpm test:coverage',
  clean: 'rimraf dist',
  format: 'oxfmt --write',
  'format:check': 'oxfmt --check',
  lint: 'oxlint --type-aware --tsconfig tsconfig.build.json --config .oxlintrc.json .',
  'lint:fix': 'oxlint --type-aware --tsconfig tsconfig.build.json --config .oxlintrc.json --fix . && pnpm format',
  test: 'vitest run',
  'test:coverage': 'vitest run --coverage',
  'test:coverage:build': 'pnpm build && pnpm test:coverage',
  typecheck: 'tsc -p tsconfig.build.json --noEmit',
  dev: 'tsx src/index.ts',
};

// ---------------------------------------------------------------------------
// Template content generators
// ---------------------------------------------------------------------------

function tsconfigBase() {
  return JSON.stringify({
    compilerOptions: {
      target: 'ES2023',
      lib: ['ES2023', 'DOM'],
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      strict: true,
      esModuleInterop: true,
      forceConsistentCasingInFileNames: true,
      skipLibCheck: true,
      resolveJsonModule: true,
      rootDir: 'src'
    },
    include: ['src/**/*.ts'],
    exclude: ['dist', 'node_modules', 'src/**/*.test.ts']
  }, null, 2) + '\n';
}

function tsconfigBuild() {
  return JSON.stringify({
    extends: './tsconfig.base.json',
    compilerOptions: {
      outDir: './dist/esm',
      rootDir: './src',
      declaration: true,
      declarationDir: './dist/types',
      emitDeclarationOnly: false,
      sourceMap: true
    },
    include: ['src/**/*.ts'],
    exclude: ['dist', 'node_modules', 'src/**/*.test.ts']
  }, null, 2) + '\n';
}

function vitestConfig() {
  return `import { cpus } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const rootDir = dirname(fileURLToPath(import.meta.url));
const cpuCount = Math.max(1, cpus().length);
const envMaxThreads = Number.parseInt(process.env.VITEST_MAX_THREADS ?? "", 10);
const maxThreads = Number.isFinite(envMaxThreads)
  ? envMaxThreads
  : Math.min(8, Math.max(4, Math.floor(cpuCount / 2)));
const coverageReporters = process.env.CI
  ? ["text", "json-summary", "html"]
  : ["text", "json-summary"];

export default defineConfig({
  poolOptions: {
    threads: {
      minThreads: 1,
      maxThreads,
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    setupFiles: ["tests/setup.ts"],
    hookTimeout: 15_000,
    testTimeout: 15_000,
    coverage: {
      provider: "v8",
      reporter: coverageReporters,
      include: ["src/**/*.ts"],
      exclude: [
        "**/*.d.ts",
        "**/dist/**",
        "**/node_modules/**",
        "tests/**",
      ],
      thresholds: {
        branches: 75,
        functions: 75,
        lines: 75,
        statements: 75,
      },
    },
  },
});
`;
}

function oxlintrc() {
  return JSON.stringify({
    categories: {
      incorrect: 'warn',
      missing: 'warn',
      suspicious: 'warn',
      style: 'off'
    },
    rules: {
      'no-unused-vars': 'error',
      'no-console': 'warn',
      'no-debugger': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
    }
  }, null, 2) + '\n';
}

function oxfmtrc() {
  return JSON.stringify({
    json: true,
    markdown: true,
    includes: ['src/**/*.ts', 'tests/**/*.ts'],
  }, null, 2) + '\n';
}

function gitignore() {
  return `# Dependencies
node_modules/

# Build output
dist/
*.tsbuildinfo

# Test coverage
coverage/
.nyc_output/

# Logs
*.log
logs/

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Temporary files
*.tmp
.cache/

# Test cache
.test-passed
`;
}

function pnpmWorkspace() {
  return `packages:
  - '.'
`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function run(cmd, args, cwd) {
  childProcess.execFileSync(cmd, args, { cwd: cwd, stdio: 'ignore' });
}

function mkdirs(base, dirs) {
  for (const d of dirs) {
    fs.mkdirSync(path.join(base, d), { recursive: true });
  }
}

function buildPackageJson(name, framework) {
  const frameworkDeps = FRAMEWORK_DEPS[framework];
  return {
    name: name,
    version: '1.0.0',
    type: 'module',
    description: '',
    scripts: Object.assign({}, NPM_SCRIPTS, framework === 'vite' ? {
      dev: 'vite',
    } : {}, framework === 'nextjs' ? {
      dev: 'next dev',
    } : {}),
    dependencies: Object.assign({}, frameworkDeps.dependencies),
    devDependencies: Object.assign({}, TS_DEV_DEPS, frameworkDeps.devDependencies),
    engines: {
      node: '>=22'
    },
    packageManager: 'pnpm@10.25.0+sha512.5e82639027af37cf832061bcc6d639c219634488e0f2baebe785028a793de7b525ffcd3f7ff574f5e9860654e098fe852ba8ac5dd5cefe1767d23a020a92f501',
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const flags = parseArgs(process.argv);

  // Resolve working directory
  let projectDir = process.cwd();
  if (flags.name) {
    projectDir = path.join(process.cwd(), flags.name);
    fs.mkdirSync(projectDir, { recursive: true });
  }

  const projectName = path.basename(projectDir);

  // Git init if needed
  if (!fs.existsSync(path.join(projectDir, '.git'))) {
    run('git', ['init'], projectDir);
  }

  // Create package.json only if absent
  const pkgPath = path.join(projectDir, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    const pkg = buildPackageJson(projectName, flags.framework);
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  }

  // Scaffold standard directories
  mkdirs(projectDir, ['src', 'tests', 'scripts', 'docs']);

  // Write TypeScript configs
  fs.writeFileSync(path.join(projectDir, 'tsconfig.base.json'), tsconfigBase());
  fs.writeFileSync(path.join(projectDir, 'tsconfig.build.json'), tsconfigBuild());

  // Write Vitest config
  fs.writeFileSync(path.join(projectDir, 'vitest.config.ts'), vitestConfig());

  // Write linting/formatting configs
  fs.writeFileSync(path.join(projectDir, '.oxlintrc.json'), oxlintrc());
  fs.writeFileSync(path.join(projectDir, '.oxfmtrc.jsonc'), oxfmtrc());

  // Write .gitignore if absent
  const gitignorePath = path.join(projectDir, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, gitignore());
  }

  // Write pnpm-workspace.yaml if absent
  const pnpmPath = path.join(projectDir, 'pnpm-workspace.yaml');
  if (!fs.existsSync(pnpmPath)) {
    fs.writeFileSync(pnpmPath, pnpmWorkspace());
  }

  // Write a minimal src/index.ts
  const indexSrc = path.join(projectDir, 'src', 'index.ts');
  if (!fs.existsSync(indexSrc)) {
    fs.writeFileSync(indexSrc, `/**
 * Main entry point for ${projectName}.
 */

export function main() {
  console.log('Hello from ${projectName}!');
}

main();
`);
  }

  // Write a minimal tests/setup.ts
  const setupSrc = path.join(projectDir, 'tests', 'setup.ts');
  if (!fs.existsSync(setupSrc)) {
    fs.writeFileSync(setupSrc, `// Test setup file - runs before all tests
`);
  }

  // Install dependencies
  if (!flags.skipInstall) {
    run('pnpm', ['install'], projectDir);
  }

  console.log(`Project "${projectName}" scaffolded successfully at ${projectDir}`);
  console.log('');
  console.log('Next steps:');
  console.log('  1. cd ' + (flags.name || '.') );
  console.log('  2. pnpm test               # Run tests');
  console.log('  3. pnpm lint              # Run linter');
  console.log('  4. pnpm check             # Run all checks (format + lint + test)');
}

main();
