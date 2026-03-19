# CLAUDE.md

Claude Code plugin marketplace containing plugins for clean coding principles and productivity tools. Plugins are installed via `claude plugin marketplace add nampq11/agent-scripts`.

## Project map

- `.claude-plugin/marketplace.json` - Plugin marketplace registry
- `plugins/harness-engineering/` - Node/TypeScript project scaffolding and quality enforcement
- `plugins/improve-claude-md/` - CLAUDE.md rewriter using `<important if>` blocks

## Plugin architecture

Each plugin:
```
plugins/<plugin-name>/
├── .claude-plugin/plugin.json    # Metadata (name, version, author)
└── skills/<skill-name>/SKILL.md  # Executable instructions
```

**Key**: SKILL.md files are the primary executable content. When invoked, Claude Code reads and executes the instructions. Scripts referenced in SKILL.md are helper tools.

<important if="you are adding a new plugin or modifying plugin metadata">

1. Create directory under `plugins/<name>/`
2. Create `.claude-plugin/plugin.json` with name, description, version, author
3. Create `skills/<skill-name>/SKILL.md` with executable instructions
4. Add plugin entry to `.claude-plugin/marketplace.json`
5. Test locally with `claude plugin install <name>` from repo root
</important>

<important if="you are working on the harness-engineering plugin">

**Entry point**: `plugins/harness-engineering/skills/harness-engineering/SKILL.md`

6-phase workflow:
1. Detect environment (package.json, pyproject.toml, .git, existing CLAUDE.md)
2. Socratic questions via AskUserQuestion (purpose, stack, framework, name)
3. Scaffold via `scripts/init-project.js`
4. Install enforcement via `scripts/install-enforcement.js`
5. Generate CLAUDE.md via `scripts/generate-claude-md.js`
6. Summary with commands and next steps

**Scripts** (`scripts/`):
- `init-project.js` - Creates package.json, tsconfigs, vitest.config.ts, directories, entry point
- `install-enforcement.js` - Copies lib scripts and git hooks to target project
- `generate-claude-md.js` - Generates CLAUDE.md from templates with framework substitutions

**Enforcement library** (`scripts/lib/`):
- `check-secrets.js` - Secret scanning (OpenRouter, Anthropic, AWS, GitHub, private keys)
- `check-file-sizes.js` - Enforces 300-line file limit
- `validate-docs.js` - CLAUDE.md drift detection (pre-commit warning, --full for blocking)
- `generate-docs.js` - Regenerates `<!-- AUTO:name -->` sections in CLAUDE.md
- `generate-docs-helpers.js` - JSDoc extraction, directory tree builder, module index builder

**Git hooks** (`scripts/hooks/`):
- `pre-commit` - oxlint → oxfmt check → secret scan → file size check → doc generation → drift warning
- `pre-push` - SHA-cached test suite (Vitest) → pnpm audit (warn-only)

**Templates** (`templates/`):
- `project-claude.md` - Base CLAUDE.md with framework-specific command substitutions
- `global-claude.md` - Universal TDD and Claude Code operating principles
- `.env.example` and `gitignore-template` - Standard project files

**References** (`references/`):
- `enforcement-scripts.md` - Enforcement script behavior and adaptation patterns
- `claude-md-guide.md` - Guidelines for writing CLAUDE.md files

**Framework support**: vite, nextjs, express, fastify, none (affects deps, dev command, build command, ESLint rules)
</important>

<important if="you are modifying harness-engineering enforcement behavior">

- Add secret patterns: Edit `scripts/lib/check-secrets.js` CONFIG.patterns
- Change file size limit: Edit `scripts/lib/check-file-sizes.js` CONFIG.maxLines
- Track new directories in docs: Edit `scripts/lib/validate-docs.js` CONFIG.trackedDirs and CONFIG.mappings
- Enforcement scripts must be idempotent and exit 1 on failure (for blocking commits)
</important>

<important if="you are modifying the harness-engineering CLAUDE.md template">

The script performs framework-specific substitutions on `project-claude.md`:
- `devCmd` and `buildCmd` replacement for vite/nextjs/express/fastify
- React ESLint rules insertion for vite/nextjs frameworks
- Template variables like `[Project Name]` remain for manual replacement
</important>

<important if="you are working on the improve-claude-md plugin">

**Entry point**: `plugins/improve-claude-md/skill/improve-claude-md/SKILL.md`

Rewrites CLAUDE.md files using `<important if="condition">` XML blocks to address Claude's tendency to ignore "may or may not be relevant" context.

**Core principles**:
1. Foundational context (project identity, tech stack, directory map) stays bare
2. Domain-specific guidance gets wrapped with targeted conditions
3. Keep it short and inline; avoid sharding
4. Remove linter/formatter territory and code snippets
5. Keep ALL commands from the original
</important>

<important if="you are modifying harness-engineering git hooks, pre-commit behavior, or enforcement script configuration">

**pre-commit**: Fast checks (<2s). Runs oxlint, oxfmt, secret scan, file size check, doc generation, drift warning. Blocks on lint/format/secrets/size; warns on drift.

**pre-push**: Thorough checks. Runs full test suite (skipped if SHA matches .test-passed), then pnpm audit (warn-only, does not block).

**Constraints**:
- File size limit: 300-line max for source files
- SHA-cached testing: `.test-passed` stores last passing SHA; pre-push skips if HEAD unchanged
- Secret scanning allowlist: Tests, specs, and docs allowlisted by default; add paths via CONFIG.allowlistPaths
- AUTO markers: `<!-- AUTO:name -->` sections maintained by generate-docs.js; do not edit manually
- SKILL.md execution: Skills are prompts, not code. They guide Claude through multi-step processes using tool calls
</important>

<important if="you are writing or modifying tests, or implementing features in harness-engineering">

The global template enforces strict TDD:
1. **Red**: Write failing tests first
2. **Green**: Implement minimal code to pass
3. **Refactor**: Clean up while tests pass
4. **Finalize**: Run full suite, check coverage >90%, update docs if src/bin/scripts changed

TDD can be skipped only for: documentation-only changes, config files, simple refactoring with existing coverage, or emergency hotfixes.
</important>
