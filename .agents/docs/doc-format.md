# Doc Format

House style for all docs in this repo, including `docs/*.md`, `.agents/docs/*.md`, and skill files.

## Voice

- Imperative, factual, dry. No marketing language.
- State what something does, not how great it is.
- Omit filler phrases: "Note that", "It is worth mentioning", "Please keep in mind".

## Structure

- `#` — document title (one per file).
- `##` — major section.
- `###` — sub-section.
- No level deeper than `###` in most docs; use a list instead.

## Lists

- Flat lists for 3+ parallel items.
- Use a table when items have 2+ attributes.
- Keep bullets to one line when possible.

## Code

- Inline code for: file paths, variable names, command fragments, JSON keys.
- Fenced blocks for: commands the reader runs, file snippets, API responses.
- Name the language on every fenced block.

## Cross-references

- Link to files by repo-relative path: `[game-domain.md](game-domain.md)`.
- Link to skills by name: `ctl-discover`.
- Do not link to line numbers — they rot.

## What to omit

- Do not document uncertainty ("may", "might", "could be"). Verify first, then document the fact.
- Do not annotate intent ("this is needed because...") — that belongs in commit messages or PRs.
- Do not repeat information already in `AGENTS.md`; link to it.
