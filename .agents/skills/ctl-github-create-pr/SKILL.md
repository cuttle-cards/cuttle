---
name: ctl-github-create-pr
description: "Create a GitHub pull request for Cuttle using gh CLI. Use on 'create PR', 'open a PR', 'make a pull request', '/ctl-github-create-pr'. Surfaces the version label requirement before drafting the PR body."
model: inherit
allowed-tools: Read, Bash
---

# GitHub Create PR

Create a pull request using `gh` CLI following Cuttle's PR conventions.

## Before drafting

### 1. Confirm branch and commits

```bash
git branch --show-current
git log main..HEAD --oneline
git diff main..HEAD --stat
```

### 2. Ask: Draft or ready for review?

Always ask before creating. Draft PRs skip CI checks. Ready-for-review PRs run the full suite.

### 3. Confirm version label

Every PR requires exactly one version label applied after creation:

| Label | Use when |
|-------|----------|
| `patch-version` | Bug fix, docs, chore, style — no new features |
| `minor-version` | New feature, backward-compatible |
| `major-version` | Breaking change |

Suggest the appropriate label in the PR description. The core team applies it.

### 4. Check for linked issue

If the branch is named `feature/123` or `bug/123`, add `Closes #123` to the PR body.

## Branch naming

From `docs/CONTRIBUTING.md`:
- Features: `feature/[issue-number-or-description]`
- Bug fixes: `bug/[issue-number-or-description]`

## Create the PR

```bash
gh pr create \
  --title "type(scope): subject" \
  --body "$(cat <<'EOF'
## Summary

- Bullet 1
- Bullet 2

## Test plan

- [ ] Run `npm run lint`
- [ ] Run `npm run test:unit`
- [ ] Manual smoke: [describe steps]

## Version label

Suggest: `patch-version` / `minor-version` / `major-version`

Closes #[issue]
EOF
)"
```

For draft: add `--draft` flag.

## After creating

1. Note the PR URL.
2. Remind: a version label must be applied before merge.
3. Do not push additional commits without mentioning they'll re-trigger CI.

## Checks that must pass before requesting review

- `npm run lint` — zero errors
- `npm run test:unit` — all green
- E2E tests pass (CI runs these automatically on non-draft PRs)

## Full reference

`.agents/docs/github.md`
