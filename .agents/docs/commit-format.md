# Commit Format

Cuttle uses [Conventional Commits](https://www.conventionalcommits.org/) with file/area-based scopes.

## Format

```
<type>(<scope>): <subject>
```

- Subject: lowercase, imperative, no period.
- Scope: the file name (no extension) or the feature area affected.
- Keep subject under 72 characters.

## Types

| Type | When |
|------|------|
| `feat` | New user-facing feature |
| `fix` | Bug fix |
| `test` | Adding or updating tests |
| `style` | Visual/style change, no logic |
| `refactor` | Code restructure, no behavior change |
| `chore` | Build, deps, tooling, agents infrastructure |
| `docs` | Documentation only |

## Scopes mined from git log

Common scopes extracted from recent history:

| Scope | Area |
|-------|------|
| `GameView` | `src/routes/game/GameView.vue` |
| `rematch.js` | `api/controllers/game/rematch.js` |
| `sockets` | Socket event handling |
| `lock-game` | `api/helpers/lock-game.js` |
| `announcementData` | `src/routes/home/components/announcementDialog/data/announcementData.js` |
| `deps` | Dependency updates |
| `agents` | `.agents/` infrastructure |

For new files, use the file name without extension. For features that span multiple files, use the area name.

## Rules

- Never bump `package.json` version in a commit — CI handles this automatically via version labels.
- Do not use `git add -A` or `git add .` — stage specific files.
- Do not use `--no-verify`.

## Examples

```
feat(GameView): add scuttle animation for seven card plays
fix(rematch.js): unlock game on forbidden error path
test(basicMoves.spec.js): add draw-past-limit edge case
chore(agents): add ctl-discover skill
```
