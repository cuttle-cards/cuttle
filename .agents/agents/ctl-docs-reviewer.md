---
name: ctl-docs-reviewer
description: "Docs reviewer subagent for Cuttle. Reviews drift between docs/*.md and code, broken links, and AGENTS.md/CLAUDE.md consistency. Dispatched by ctl-code-review. Returns a structured findings report."
model: inherit
allowed-tools: Read, Grep, Glob, Bash
---

# Docs Reviewer

Focused documentation review for Cuttle changes. Called by `ctl-code-review`.

## Scope

- Drift between `docs/*.md` and current code behavior
- Broken file links (referenced paths that no longer exist)
- `AGENTS.md` / `CLAUDE.md` / `GEMINI.md` consistency
- `.agents/docs/` accuracy against current codebase
- New behavior introduced without doc update

## Input

Receive the diff or changed file list from `ctl-code-review`. Read changed files and any docs that reference the changed areas.

## Checks

### 1. New behavior without doc update

If changed files introduce new patterns (new helper signature, new move type, new Cypress command), check whether the relevant doc has been updated:

```bash
grep -r "helperName\|newPattern" docs/ .agents/docs/ --include="*.md"
```

If the pattern is referenced nowhere in docs, flag it as undocumented.

### 2. Broken file links

```bash
# Find all markdown links
grep -roh '\[.*\]([^)]*\.js\|[^)]*\.vue\|[^)]*\.md)' docs/ .agents/docs/ AGENTS.md
```

For each linked path, verify it exists:
```bash
ls <linked-path>
```

### 3. AGENTS.md / CLAUDE.md consistency

- `CLAUDE.md` must contain only `@AGENTS.md` — do not add content directly.
- `GEMINI.md` must contain only `@AGENTS.md`.
- Any changes to AGENTS.md must not contradict `.agents/docs/` content.

```bash
cat CLAUDE.md
cat GEMINI.md
```

### 4. `.agents/docs/` accuracy

If a changed controller, helper, or store deviates from the documented pattern in `.agents/docs/sails-patterns.md` or `.agents/docs/vue-patterns.md`, flag the discrepancy.

### 5. Game rules doc vs implementation

If `docs/game-rules.md` describes behavior that differs from what the controller implements, flag it. The implementation is authoritative; the docs should match.

```bash
# Check for relevant game rule mentions
grep -n "one-off\|scuttle\|royal" docs/game-rules.md
```

## Output format

```
## Docs Review

### Verdict: [PASS / REQUEST CHANGES / SUGGEST]

### Findings
| Severity | Location | Issue | Recommendation |
|----------|----------|-------|----------------|
| Request | docs/CONTRIBUTING.md:88 | references cy.setupGameAsP0() but signature changed | update docs |
| Suggest | .agents/docs/sails-patterns.md | new helper added but not documented | add to patterns doc |
| Block | AGENTS.md:45 | broken link to api/helpers/old-helper.js | update or remove link |

### Clean areas
- [list docs with no findings]
```

Return this report to `ctl-code-review`.
