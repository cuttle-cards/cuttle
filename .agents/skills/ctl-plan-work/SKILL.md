---
name: ctl-plan-work
description: "Plan work before implementing, following AGENTS.md discover-plan-execute. Use on 'plan this', 'how should I approach', 'outline the work', 'what files will change', or before any non-trivial implementation. Requires discovery before planning."
model: inherit
allowed-tools: Read, Grep, Glob, Bash
---

# Plan Work

Structure implementation plans following AGENTS.md's discover-plan-execute workflow.

## When to use

Before writing code for any task that touches more than one file or introduces new behavior.

## Phase 1: Discovery

Run `ctl-discover` first. No plan without discovery.

```bash
# Find similar implementations
grep -r "relevantPattern" src/ api/ --include="*.{js,vue}" -l

# Check existing patterns in the area
find api/controllers -name "*.js" | head -10
find src/routes -name "*.vue" | head -10
```

Document what you found:
```
Found {N} examples of {pattern}:
- {file}:{line} — {description}
Common pattern: {summary}
```

## Phase 2: Plan template

```
## Plan: {task description}

### Files I'll modify
- `path/to/file.js` — what changes
- `path/to/component.vue` — what changes

### New files (if any)
- `path/to/new-file.js` — purpose

### Patterns I found
- `file:line` — pattern used as model
- `file:line` — pattern used as model

### Approach
1. Step one (with file reference)
2. Step two
3. Step three

### Validation
- [ ] `npm run lint`
- [ ] `npm run test:unit`
- [ ] E2E: describe what to test manually
- [ ] Describe the happy path to verify

Proceed?
```

## Phase 3: Gate

Do not write a single line of code until the plan is approved. Present the plan, wait for "proceed" or equivalent.

## Rules

- One concern per branch. If discovery reveals an adjacent bug: "Same branch or separate?"
- Do not expand scope mid-plan. New discoveries → surface them, don't absorb them.
- Validation steps must be specific (which test, which route, what assertion).
- The plan is a contract. If implementation diverges, update the plan and re-confirm.

## Discovery-to-plan examples

**Adding a new one-off:**
1. `ctl-discover` → find existing one-off controller in `api/controllers/game/`
2. Find the move type in `utils/MoveType.json`
3. Find the socket broadcast pattern in `api/helpers/broadcast-game-event.js`
4. Find the Cypress test for a similar one-off in `tests/e2e/specs/in-game/one-offs/`
5. Plan: new controller, update routes, update store handler, write E2E test

**Adding a Vue dialog:**
1. `ctl-discover` → find `BaseDialog.vue` and similar dialogs in `src/routes/`
2. Find i18n key patterns in `src/i18n/`
3. Find Pinia store actions triggered by the dialog
4. Plan: new component file, new i18n keys, store action update, test

## Full reference

- `AGENTS.md` — "Communication Patterns" → "Plan Before Execute"
- `docs/agentic-development.md` — "AI-Powered Workflow"
