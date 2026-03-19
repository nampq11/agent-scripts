---
name: harness-engineering
description: Use when the user wants to set up new Node/TypeScript projects or add enforcement tooling to an existing project. Also use when the user says "set up my project", "add quality enforcement", or "initialize typescript project".
---

## Resource Resolution Preamble

Before any other step, resolve the skill's install directory:

```bash
SKILL_DIR=$(find ~/.claude/plugins -path "*/harness-engineering/SKILL.md" -print -quit | xargs dirname)
SCRIPTS_DIR=$SKILL_DIR/scripts
TEMPLATES_DIR=$SKILL_DIR/templates
REFERENCES_DIR=$SKILL_DIR/references
```

If `SKILL_DIR` is empty, halt and tell the user: "Could not locate the setup plugin directory under ~/.claude/plugins. Verify the plugin is installed."

---

## Phase 1: Detect Environment

Check the working directory for these manifest files: `package.json`, `pyproject.toml`, `Makefile`.

Also check for: `.git/`, `src/`, existing `CLAUDE.md`.

Determine:
- **New project** — no manifest, no `.git/`, effectively an empty directory
- **Existing project** — manifest file present; infer language and stack from it

For existing projects, record the detected stack so Phase 2 question can be skipped where answers are already known.

---

## Phase 2: Socratic Questions

Use the AskUserQuestion tool for each question, one at a time. Adapt or skip questions based on what was detected in Phase 1.

**Q1 — Purpose** (always ask):
"What are you building?" — understand whether this is a web app, REST API, CLI tool, data pipeline, library, etc.

**Q2 — Language/stack** (skip if inferred from manifest):
"What language/stack would you like to use?"

Recommend based on the answer to Q1:
- UI/web app → Node/TypeScript (default recommendation)
- Backend API → Node/TypeScript or Python
- CLI tool → Node/TypeScript or Bun
- Library → Node/TypeScript

**Q3 — Framework** (skip if inferred; options depend on stack chosen):
- Node/TS: Express, Fastify, Next.js, Vite, or none
- Bun/TS: Commander or none

**Q4 — Project name** (new projects only):
"What should the project be called?" — suggest the current directory name as the default.

Do not ask about things you can infer.

---

## Phase 3: Scaffold (New projects only)

Skip this phase entirely for existing projects.

**Node/TypeScript path (fast path - script does the work):**

```bash
node $SCRIPTS_DIR/init-project.js --name=<name> --framework=<framework>
```

The script creates:
- `package.json` with TypeScript, oxlint, oxfmt, Vitest deps
- `tsconfig.base.json` and `tsconfig.build.json`
- `vitest.config.ts` with coverage thresholds (75%)
- `.oxlintrc.json` and `.oxfmtrc.jsonc` for linting/formatting
- `.gitignore`, `pnpm-workspace.yaml`
- `src/`, `tests/`, `scripts/`, `docs/` directories
- Minimal `src/index.ts` entry point
- `tests/setup.ts` test setup file

**All other stacks (adaptive path - Claude does the work):**

1. `git init`
2. Create standard directories: `src/`, `tests/`, `scripts/`, `docs/`
3. Generate the appropriate manifest file with tooling recommendations
4. Install dependencies using the stack's package manager
5. Create a minimal entry point and test placeholder

---

## Phase 4: Install Enforcement

READ `$REFERENCES_DIR/enforcement-scripts.md` first to understand the enforcement principles and the secret-scanning regex patterns before writing any scripts.

**Node/TypeScript path (fast path):**

```bash
node $SCRIPTS_DIR/install-enforcement.js --target=<project-root>
```

This installs:
- Git hooks: `.git/hooks/pre-commit` and `.git/hooks/pre-push`
- Enforcement scripts in `scripts/lib/`:
  - `check-secrets.js` - Scan for API keys, tokens
  - `check-file-sizes.js` - Enforce 300-line file limit
  - `validate-docs.js` - CLAUDE.md drift detection
  - `generate-docs.js` - Auto-generate doc sections
  - `generate-docs-helpers.js` - Helper functions

**Pre-commit hook** runs:
1. oxlint on staged TypeScript/JavaScript files
2. oxfmt format check
3. Secret scanning
4. File size check (300-line limit)
5. Doc regeneration
6. Drift warning

**Pre-push hook** runs:
1. Full test suite (Vitest) with SHA-based caching
2. Dependency audit (warn-only)

**All other stacks (adaptive path - Claude creates equivalent enforcement):**

Use the equivalents table to choose the right tools:
| Enforcement     | Node/TS             | Python               |
|-----------------|---------------------|----------------------|
| Linter          | oxlint              | ruff                 |
| Formatter       | oxfmt               | ruff format          |
| Test runner     | Vitest              | pytest               |
| Pre-commit mgr  | git hooks           | pre-commit framework |

---

## Phase 5: Generate CLAUDE.md

Read `$REFERENCES_DIR/claude-md-guide.md` first for quality guidelines - the goal is a dense, high-signal file where every line saves a future session from re-discovery.

Read `$TEMPLATES_DIR/project-claude.md` as the base pattern to follow.

**Node/TypeScript:**

```bash
node $SCRIPTS_DIR/generate-claude-md.js --target=<project-root> --framework=<framework>
```

**All stacks (or if the script doesn't exist yet) - Claude generates CLAUDE.md directly:**

Adapt the template to include:
- **Commands section**: stack-appropriate build, test, lint, typecheck commands
- **Architecture section**: describe `src/`, `tests/`, `scripts/` layout and what goes where
- **Enforcement scripts section**: document the installed scripts and what triggers them
- **Quality gates**: 300-line file limit, 50-line function limit, complexity red flags
- **Critical Gotchas section**: include the capture instruction
- **TypeScript specifics**: typecheck command, strict mode enabled

If no global CLAUDE.md exists in the project's parent directory, read `$TEMPLATES_DIR/global-claude.md` and generate an adapted version.

---

## Phase 6: Summary

After all phases complete, output a summary that includes:

1. **What was installed** - list every file created or modified
2. **Key commands** for Node/TypeScript projects:
   - `pnpm test` - Run tests
   - `pnpm lint` - Run oxlint
   - `pnpm lint:fix` - Fix linting issues
   - `pnpm format` - Format with oxfmt
   - `pnpm typecheck` - TypeScript type checking
   - `pnpm check` - Run all checks (format + lint + test)
3. **TDD reminder**: "Write tests first. Red (failing test) → Green (passing) → Refactor. Never write implementation before a test exists."
4. **Suggested next steps**:
   - Fill in the `[bracketed placeholders]` in CLAUDE.md
   - Review and expand the Architecture section
   - Add the first real feature with a test
   - Make the first commit to initialize git history
