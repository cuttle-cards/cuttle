---
name: ctl-git-commit
description: "Create a git commit on the current branch using Cuttle's conventional commit format. Use on 'commit', 'save changes', 'create a commit', or when changes are ready to commit. Mines git log for scope, never invents one."
model: inherit
allowed-tools: Read, Bash
---

# Git Commit

Stage and commit changes using Cuttle's conventional commit format.

## Hard rules

- Never `git add -A` or `git add .` — stage specific files only.
- Never `--no-verify` or any hook bypass.
- Never bump `package.json` version — CI handles this automatically.
- Commits on `main` are blocked by the git-guardrails hook. Create a feature branch first.

## Workflow

### 1. Check status

```bash
git status --porcelain
git diff --stat
```

If nothing is staged, show unstaged changes and ask what to stage.

### 2. Mine scope from git log

```bash
git log --format="%s" --no-merges | grep -oP '^\w+\([^)]+\)' | sort | uniq -c | sort -rn | head -15
```

Use the most relevant existing scope. Do not invent new scopes unless the change truly belongs to a new area.

### 3. Determine type

| Type | When |
|------|------|
| `feat` | New user-facing feature |
| `fix` | Bug fix |
| `test` | Adding or updating tests |
| `style` | Visual/style change, no logic |
| `refactor` | Code restructure, no behavior change |
| `chore` | Build, deps, tooling, agents infrastructure |
| `docs` | Documentation only |

### 4. Format message

```
<type>(<scope>): <subject>
```

- Subject: lowercase, imperative, no period.
- Subject under 72 characters.
- Body: optional, explains WHY not WHAT.

### 5. Show and confirm

Present the staged files and proposed message. Wait for approval.

### 6. Commit

```bash
git commit -m "$(cat <<'EOF'
type(scope): subject
EOF
)"
```

### 7. Hook failure

If the guardrails hook blocks the commit (e.g., committing on `main`), diagnose and fix. Never use `--no-verify`.

## Common scopes (mined from history)

| Scope | Area |
|-------|------|
| `GameView` | `src/routes/game/GameView.vue` |
| `rematch.js` | `api/controllers/game/rematch.js` |
| `sockets` | Socket event handling |
| `lock-game` | `api/helpers/lock-game.js` |
| `announcementData` | Announcement dialog data |
| `deps` | Dependency updates |
| `agents` | `.agents/` infrastructure |

## Full reference

`.agents/docs/commit-format.md`
