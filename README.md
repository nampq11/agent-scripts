# slopfiles

questionably useful claude code plugins

## Installation

Add the marketplace:

```bash
claude plugin marketplace add dexhorthy/slopfiles
```

Install a plugin:

```bash
claude plugin install harness-engineering
claude plugin install improve-claude-md
```

## Plugins

### harness-engineering

Bootstrap and enforce runtime system for AI agents. Helps you set up new projects or add enforcement tooling to existing projects. Provides scaffolding, linting, formatting, testing infrastructure, and quality gates.

**Skills:**

- `/harness-engineering` - Set up new projects or add quality enforcement to existing projects

**Features:**
- Project Scaffolding: Quick setup for Node/TypeScript, Python, C/C++, and Bun projects
- Quality Enforcement: Pre-commit hooks for linting, formatting, and secret scanning
- Pre-push Hooks: Test runner with SHA-based caching to skip unchanged code
- CLAUDE.md Generation: Auto-generates project documentation for AI agents
- Quality Gates: 300-line file limit, 50-line function limit, complexity checks

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
