---
name: docs-generator
description: "Write, organize, and refactor documentation optimized for both humans and AI agents (Cursor, Claude Code, etc.). Use this skill WHENEVER the user wants to: create docs for a new project, refactor old docs, asks \"AI doesn't understand my codebase\", asks about writing context for AI, or mentions \"documentation\", \"context for AI\", \"structured docs\", \"docs for Cursor/Claude Code\", \"restructure README\", \"organize docs\", \"improve doc structure\". Trigger even when the user just says \"help me write docs\", \"AI keeps answering wrong\", \"need to document codebase\"."
---

# Documentation Generator

Create and restructure documentation optimized for both humans and AI agents.

## CRITICAL: Git Workflow First (MANDATORY)

**You MUST complete git workflow BEFORE creating any documentation files.**

### Step 0: Create Feature Branch (MANDATORY - Do First)

1. **Check current branch:**
   ```bash
   git branch --show-current
   ```
   If already on a feature branch for this task, skip to step 2.

2. **Check repo's branch naming convention:**
   ```bash
   git branch -r | head -20
   ```
   Look for patterns like `feat/`, `feature/`, `docs/`, etc.

3. **Create and switch to new branch:**
   ```bash
   git checkout -b feat/docs-generator
   ```
   (Replace `feat/` with the repo's convention if different)

### Step 0.5: Sync with Remote (MANDATORY - Do Second)

**Before creating/updating/deleting ANY files:**

```bash
branch="$(git rev-parse --abbrev-ref HEAD)"
git fetch origin
git pull --rebase origin "$branch"
```

If working tree is not clean, stash first:

```bash
git stash push -u -m "pre-sync"
branch="$(git rev-parse --abbrev-ref HEAD)"
git fetch origin && git pull --rebase origin "$branch"
git stash pop
```

**STOP if:**
- `origin` is missing
- Pull is unavailable
- Rebase or stash conflicts occur

→ **Ask the user before continuing.**

---

## Why This Matters

Good documentation isn't about writing more—it's about writing with **predictable structure**. LLMs process tokens through attention weights: headings, tables, and code blocks receive higher attention than regular prose.

**Domain partitioning formula:**
```
Domain = Responsibility × Change-frequency × Dependency-level
```

---

## Main Workflow

### Step 1: Analyze Project

| Attribute | What to Look For |
|-----------|------------------|
| **Project type** | Library, API, web app, CLI, microservices |
| **Architecture** | Monorepo, multi-package, single module |
| **User personas** | End users, developers, operators |
| **Existing docs** | README files, docs/ folder, inline comments |
| **Gaps** | What exists vs. what's missing |

**Output status report after analysis** (see Status Report format below).

### Step 2: Cluster by Responsibility

Use 4 questions to classify:

| Question | Purpose |
|----------|---------|
| **Change Q**: "If you change X, do you have to change Y?" | X and Y belong in same doc if yes |
| **Break Q**: "If X breaks, what else breaks?" | Determine order |
| **Explain Q**: "Can you explain this concept in 3 minutes?" | If no → split it |
| **Find Q**: "Where would someone look for this info?" | Doc must match mental model |

**Output status report after clustering.**

### Step 3: Create File Structure

**For AI-optimized projects:**
```
docs/
├── 00-architecture-overview.md   # Foundation
├── 01-[core-flow].md
├── 02-[main-worker].md
├── 03-[interface-layer].md
├── 04-[external-services].md
├── 05-[data-layer].md
└── SITE.md                        # Index
```

**For general projects:**
```
docs/
├── architecture.md
├── api-reference.md
├── database.md
├── deployment.md
├── development.md
└── user-guide.md
```

**IMPORTANT: Check if docs/ folder exists before using it in links.**
- If `docs/` exists: use `docs/SITE.md` in README links
- If no `docs/` folder: use `SITE.md` directly (flat structure)

### Step 4: Write Each Doc

**For AI-optimized projects:** Follow skeleton at `references/doc-skeleton.md`

**For general projects:** Use simplified structure:

```markdown
# [Title]

[2-3 sentence overview]

## [Section Name]
[Use tables for config/data]

| Config | Value |
|--------|-------|
| key    | value |

## File Reference
| File | Purpose |
|------|---------|

## Related Docs
| Doc | Relation |
|-----|----------|
```

**Key rules (ALL projects):**
- Config/parameters/routes → **always tables**
- Keep docs at **850–1550 tokens** when AI optimization matters
- Always include **cross-references**

**Output status report after docs created.**

### Step 5: Create SITE.md

For AI-optimized: use `references/site-template.md`

For general: simple index with quick reference table and doc descriptions.

### Step 6: Validate & Present

1. **Verify internal links** - Check all paths exist before adding them
2. **Check code examples** - Ensure syntax is valid
3. **Confirm no orphaned docs** - Everything linked from somewhere
4. **Present summary to user** - Do NOT commit unless explicitly asked

**Output final status report.**

---

## Status Report Format

After each major step, output:

```
◆ [Step Name] ([step N of M] — [context])
··································································
  [Check 1]:          √ pass
  [Check 2]:          √ pass (note if relevant)
  [Check 3]:          × fail — [reason]
  [Check 4]:          √ pass
  [Criteria]:         √ N/M met
  ____________________________
  Result:             PASS | FAIL | PARTIAL
```

### Phase-specific checks

**Git Workflow:**
- `Branch created`
- `Repo synced`

**Project Analysis:**
- `Project analyzed`
- `Gaps identified`

**Clustering:**
- `Domain partitioning applied`
- `Dependency ordering determined`

**Documentation Creation:**
- `Docs created`
- `Frontmatter complete` (AI projects)
- `Diagrams included` (AI projects)
- `Cross-references added`

**Validation:**
- `Links verified` (check paths exist!)
- `Code examples valid`
- `No orphaned docs`

---

## Error Handling

| Situation | Solution |
|-----------|----------|
| No existing docs | Generate from code analysis |
| Conflicting docs | Flag to user, prefer code-derived info |
| Git sync fails | STOP and ask user |
| docs/ folder missing | Use flat structure, adjust links |

---

## Reference Files

| Reference | When to Read |
|-----------|--------------|
| `references/doc-skeleton.md` | Need full AI-optimized doc template |
| `references/site-template.md` | Need to create SITE.md |
| `references/example-doc.md` | Need complete example |
| `references/why-structure.md` | Need to explain tables vs prose |

---

## Anti-patterns to Avoid

| Anti-pattern | Problem | Solution |
|-------------|---------|----------|
| Organize by file type | Feature spans types | Organize by responsibility |
| Alphabetical sorting | No learning path | Sort by dependency |
| One mega-doc | Can't chunk | Split into focused docs |
| Too much prose | AI can't extract | Use tables for data |
| No cross-references | Each doc is island | Always link related docs |
| Assume docs/ folder exists | Links break | Check structure first |
