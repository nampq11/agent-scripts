<!-- Template: Replace [bracketed placeholders] with your project details -->

# CLAUDE.md

[Project Name] — a [brief one-line description of what this is, built with TypeScript, and its purpose].

## Project map

- `src/` — Application source code
- `tests/` — Test files mirroring src structure
- `scripts/` — Enforcement and documentation scripts
- `docs/` — Topic-specific documentation

<important if="you need to run commands to build, test, lint, or generate code">

### Development
```bash
pnpm dev                     # Run with tsx (hot reload for dev)
pnpm build                   # Production build (tsc)
pnpm typecheck               # TypeScript type checking
pnpm lint                    # Run oxlint
pnpm lint:fix                # Fix linting issues
pnpm format                  # Format code with oxfmt
```

### Testing
```bash
pnpm test                           # Unit tests
pnpm test:coverage                  # Coverage report
pnpm test:coverage:build            # Coverage after build
pnpm test tests/some-file.test.ts   # Single file (preferred during dev)
```

### Quality Gates
```bash
pnpm check                    # Run all checks (format + lint + test)
pnpm validate-docs            # Full CLAUDE.md drift check
```

### Enforcement
```bash
node scripts/lib/check-secrets.js        # Scan staged files for secrets
node scripts/lib/check-file-sizes.js     # Check staged files against 300-line limit
node scripts/lib/generate-docs.js        # Regenerate auto sections in CLAUDE.md
node scripts/lib/generate-docs.js --check # Verify auto sections are current (CI mode)
node scripts/lib/validate-docs.js        # Pre-commit: warn if CLAUDE.md may need update
node scripts/lib/validate-docs.js --full # Full: compare CLAUDE.md against codebase
```
</important>

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   [Your App]                     │
│                      |                           │
│          ┌───────────┼───────────┐               │
│          |           |           |               │
│          v           v           v               │
│     [Layer 1]   [Layer 2]   [Layer 3]           │
└─────────────────────────────────────────────────┘
```

Data flow: `User action → [Entry point] → [Service layer] → [Data layer] → Response`

<!-- AUTO:tree -->
src/
├── index.ts           # Application entry point
├── routes/
│   ├── api.ts         # API route definitions
│   └── auth.ts        # Authentication routes
├── services/
│   ├── user.ts        # User business logic
│   └── billing.ts     # Billing service
└── utils/
    ├── logger.ts      # Structured logger
    └── validators.ts  # Input validation helpers
<!-- /AUTO:tree -->

<!-- AUTO:modules -->
| Module | Purpose | Key Exports |
|--------|---------|-------------|
| `index.ts` | Application entry point | `main()`, `start()`, `stop()` |
| `services/user.ts` | User business logic | `createUser()`, `findUser()`, `updateUser()` |
<!-- /AUTO:modules -->

<important if="you are creating or modifying files">

### File size limits (hard limits)
- Any file: 300 lines max
- Any function: 50 lines max
- If exceeded, MUST refactor immediately
</important>

<important if="you are adding, removing, or renaming files in src/, bin/, or scripts/">

### Documentation sync (hard rule)
Any commit that adds, removes, or renames files in these directories MUST include a CLAUDE.md update in the same commit. The pre-commit hook will warn if CLAUDE.md is not staged alongside tracked file changes.
</important>

<important if="you are writing or modifying code">

### Complexity red flags
STOP and refactor immediately if you see:
- **>5 nested if/else statements** → Extract to separate functions
- **>3 try/catch blocks in one function** → Split error handling
- **>10 imports** → Consider splitting the module
- **Duplicate logic** → Extract to shared utilities

```bash
# Monitor file sizes
find src -name "*.ts" -exec wc -l {} + | sort -n
```
</important>

<important if="you are committing or pushing code">

### Git hooks

**pre-commit** (fast, <2s): oxlint → oxfmt check → secret scan → file size check → doc generation → doc drift warning

**pre-push** (thorough): `pnpm test` (Vitest, SHA-cached) → `pnpm audit` (warn-only)

Test caching: `.test-passed` stores SHA of last successful test run. If HEAD matches, tests are skipped.
</important>

<important if="you are adding logging or output">

Use centralized logger module, not `console.log`. Route logs to stderr if stdout is used for program output. See `src/utils/logger.ts`.
</important>

<important if="you are writing or modifying TypeScript code">

### TypeScript standards
- `strict: true` is enabled in tsconfig
- Use type annotations for function returns
- Prefer `interface` for object shapes, `type` for unions
- Use JSDoc comments (`/** */`) for public APIs
- Run `pnpm typecheck` before committing

```bash
# Type check without emitting
pnpm typecheck

# Type check specific file
npx tsc --noEmit src/some-file.ts
```
</important>

<important if="you encounter unexpected errors or silent failures">

## Critical gotchas

<!-- TIP: Document non-obvious things that cause silent failures or confusing errors. -->

- **[Gotcha 1]**: [Brief explanation of the trap and the correct approach]
- **[Gotcha 2]**: [Brief explanation of the trap and the correct approach]
</important>

## Docs map

| Topic | File |
|-------|------|
| API reference and CLI commands | `docs/usage.md` |
| Testing strategy and patterns | `docs/testing.md` |
| Configuration and environment variables | `docs/configuration.md` |
| Troubleshooting common issues | `docs/troubleshooting.md` |

---

Auto-generated sections (`<!-- AUTO:name -->`) are maintained by `scripts/lib/generate-docs.js`. Do NOT edit by hand.
