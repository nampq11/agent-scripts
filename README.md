# agent-scripts

questionably useful claude code plugins

## Installation

Add the marketplace:

```bash
claude plugin marketplace add nampq11/agent-scripts
```

Install a plugin:

```bash
claude plugin install harness-engineering
claude plugin install improve-claude-md
```

## Plugins

### harness-engineering

Bootstrap and enforce engineering practices for Node/TypeScript projects. Provides scaffolding with modern tooling, pre-commit hooks, and quality gates.

**Skills:**

- `/harness-engineering` - Set up new TypeScript projects or add quality enforcement to existing projects

**Features:**
- **Modern TypeScript Toolchain**: Uses oxlint (fast linter), oxfmt (fast formatter), Vitest (test runner)
- **Project Scaffolding**: Quick setup for Node/TypeScript with Express, Fastify, Next.js, Vite, or none
- **TypeScript Configs**: Strict mode enabled, separate base/build configs, proper path resolution
- **Quality Enforcement**: Pre-commit hooks for linting, formatting, and secret scanning
- **Pre-push Hooks**: Vitest runner with SHA-based caching to skip unchanged code
- **CLAUDE.md Generation**: Auto-generates project documentation for AI agents
- **Quality Gates**: 300-line file limit, 50-line function limit, complexity checks
- **Coverage Thresholds**: 75% for branches, functions, lines, statements

### improve-claude-md

Rewrites your CLAUDE.md using `<important if>` blocks to improve instruction adherence. Addresses Claude's tendency to ignore "may or may not be relevant" context by providing explicit relevance signals.

**Skills:**

- `/improve-claude-md` - Rewrite a CLAUDE.md file using conditional XML tags

**Principles:**
- Foundational context stays bare, domain guidance gets wrapped
- Conditions must be specific and targeted
- Keep it short — prefer inline progressive disclosure
- Less is more: cut linter/formatter territory, code snippets, and vague instructions

## License

MIT &copy; 2026 Nam Pham
