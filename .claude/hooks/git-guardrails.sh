#!/usr/bin/env bash
# Thin shim — delegates to .agents/tools/git-guardrails.mjs.
# Resolves repo root via git so CWD doesn't matter.
REPO_ROOT="$(git -C "$CLAUDE_PROJECT_DIR" rev-parse --show-toplevel 2>/dev/null || echo "$CLAUDE_PROJECT_DIR")"
exec node "$REPO_ROOT/.agents/tools/git-guardrails.mjs"
