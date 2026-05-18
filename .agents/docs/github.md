# GitHub Workflow

## Branch naming

From `docs/CONTRIBUTING.md`:

- Features: `feature/[issue-number-or-description]`
- Bug fixes: `bug/[issue-number-or-description]`

## Pull requests

### Version label (required)

Every PR merged to `main` must have exactly one version label. The label drives the automated version bump via GitHub Actions (`bump-version.yml`):

| Label | Effect |
|-------|--------|
| `patch-version` | `x.y.Z → x.y.Z+1` |
| `minor-version` | `x.y.z → x.Y+1.0` |
| `major-version` | `x.y.z → X+1.0.0` |

The label is applied by the core team, not the contributor. However, the PR author should suggest the appropriate level in the PR description.

Do not manually bump `package.json` — CI commits the bump after the PR merges.

### PR template

Fill the template completely. Link the PR to its issue with `Closes #N` in the body.

### Draft PRs

CI checks are skipped for draft PRs (the `draft` job exits 1 immediately). Convert to "Ready for review" only when lint and unit tests pass locally.

### Automated version flow

1. PR merges to `main` → "Prepare Version Bump" workflow fires.
2. "Prepare Version Bump" reads the version label, writes `version.txt` artifact.
3. "Bump Version" workflow reads artifact, runs `npm version <type>`, commits, tags, pushes to `main`, creates GitHub release.

## Labels

Version labels: `patch-version`, `minor-version`, `major-version`

Other common labels are for categorization (`bug`, `enhancement`, `documentation`). These do not affect versioning.

## `gh` CLI usage

All GitHub operations use the `gh` CLI. Do not add Octokit or other GitHub libraries.

```bash
gh pr create --title "..." --body "..."
gh pr list --state open
gh pr view <number>
gh label list
```
