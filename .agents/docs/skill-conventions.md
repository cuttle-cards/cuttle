# Skill Conventions

## Naming

- Prefix: `ctl-` for all Cuttle skills.
- Kebab-case after the prefix: `ctl-game-domain`, `ctl-sails-patterns`.
- Verb-first for workflow skills: `ctl-git-commit`, `ctl-plan-work`.
- Noun-first for reference/lookup skills: `ctl-game-domain`, `ctl-test-patterns`.

## File structure

Each skill lives at `skills/ctl-<name>/SKILL.md`.

Required frontmatter:

```yaml
---
name: ctl-<name>
description: "<one sentence — front-load the trigger phrases>"
model: inherit
allowed-tools: Read, Grep, Glob, Bash
---
```

- `description` is what the dispatcher reads to decide whether to route here. Start with the trigger phrase, not a generic label.
- `model: inherit` defers to the session model. Override only when the skill requires a specific capability.
- `allowed-tools` — list only what the skill actually needs.

## Size cap

~500 lines per SKILL.md. If a skill grows past this, move detailed examples to `docs/` and link from the skill with a one-liner.

## Trigger writing

Good: `"Invoke on 'where does X live', 'find existing pattern', 'how do I discover'. Glob/grep recipes for finding code by area."`

Bad: `"Helps with discovery"` — not actionable for a dispatcher.

## Subagent definitions

Reviewer subagents live in `agents/ctl-<name>.md`. Use the same frontmatter shape. Reviewers always output a structured report: verdict, evidence, line references, recommended action.
