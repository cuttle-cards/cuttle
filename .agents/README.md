# .agents

Cross-tool source of truth for Cuttle's agentic infrastructure. All AI assistants load from here via symlinks.

## What lives here

```
skills/       # ctl-* skill prompts, each in their own SKILL.md
agents/       # ctl-* subagent definitions
docs/         # detailed reference docs (skills index into these)
tools/        # shared Node.js utilities called by hooks
```

## How it loads

| Tool | Loads via |
|------|-----------|
| Claude Code | `.claude/skills → .agents/skills`, `.claude/agents → .agents/agents` |
| Gemini CLI | `.gemini/skills → .agents/skills`, `.gemini/agents → .agents/agents` |

`CLAUDE.md → @AGENTS.md` auto-loads the top-level discovery and safety rules every session.

## Skill namespace

All Cuttle skills use the `ctl-` prefix. See `docs/skill-conventions.md` for naming rules.

## Adding a skill

1. Create `skills/ctl-<name>/SKILL.md` with the required frontmatter.
2. Keep the file under ~500 lines.
3. If the skill references detailed examples, put those in `docs/` and link from the skill.
