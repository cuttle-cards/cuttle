---
name: ctl-discover
description: "Glob/grep recipes for finding existing patterns by area. Use on 'where does X live', 'find existing pattern for', 'how do I discover', 'search for', 'find files'. Returns file paths and brief descriptions before proposing any code."
model: inherit
allowed-tools: Read, Grep, Glob, Bash
---

# Discover

Pattern-first lookup for Cuttle. Always run discovery before proposing code.

## Workflow

1. Identify the area from the request (state, controller, component, test, helper, policy).
2. Run the recipe for that area.
3. Report findings: `Found {N} examples of {pattern}: file:line — description`.
4. Ask "Ready to implement following this pattern?" before writing any code.

## Recipes by area

### State management (Pinia stores)

```bash
grep -r "defineStore" src/stores/ --include="*.js" -l
grep -r "defineStore" src/stores/ --include="*.js" -n
```

Look for: store name, state refs, computed getters, returned actions.

### Frontend components

```bash
# Shared components
find src/components -name "*.vue" | head -20

# Route-specific components
find src/routes -name "*.vue" | head -30
find src/routes -name "components" -type d

# A specific route's entry point
ls src/routes/<routeName>/
```

Pattern: `src/routes/<name>/<Name>View.vue` is the entry point; `src/routes/<name>/components/` holds page-specific components.

### Backend controllers

```bash
find api/controllers -name "*.js" | head -20
# For a specific action
ls api/controllers/game/
cat api/controllers/game/rematch.js
```

Pattern: `module.exports = async function(req, res) { ... }` with try/catch + lock/unlock.

### Helpers

```bash
find api/helpers -name "*.js" | head -20
grep -r "sails.helpers\." api/controllers/ --include="*.js" -h | sort -u | head -20
```

### Policies

```bash
ls api/policies/
grep -r "api/policies" config/policies.js
```

### Socket events

```bash
grep -r "broadcastGameEvent\|publishGameState\|sails.sockets" api/ --include="*.js" -l
grep -r "on('game'" src/ --include="*.js" -l
cat api/helpers/broadcast-game-event.js
```

### E2E tests

```bash
find tests/e2e/specs -name "*.spec.js" | head -20
ls tests/e2e/specs/in-game/
cat tests/e2e/support/helpers.js
```

### Unit tests

```bash
find tests/unit/specs -name "*.spec.js" | head -20
ls tests/unit/specs/sails/
```

### Routes config

```bash
grep -n "game\|move\|rematch" config/routes.js | head -20
```

### Models

```bash
ls api/models/
cat api/models/Game.js
```

## Discovery hierarchy (per AGENTS.md)

1. Existing code (search first)
2. `docs/*.md` for standards
3. Config files (`.eslintrc.js`, `vite.config.mjs`)

## Output format

```
Found {N} examples of {pattern}:
- {file}:{line} — {brief description}
- {file}:{line} — {brief description}

Common pattern: {summary}

Ready to implement following this pattern?
```

Never skip the "Ready to implement?" gate.
