#!/usr/bin/env node
/**
 * PreToolUse hook: git guardrails.
 * Blocks destructive git commands and commits/pushes on main.
 *
 * Called via .claude/hooks/git-guardrails.sh shim.
 * Logic is exported so .agents/tools/__tests__/git-guardrails.spec.mjs can test it directly.
 */

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const deny = (reason) =>
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: reason,
    },
  });

const CHAIN_SEP = /\s*(?:&&|\|\||;|\|)\s*/;

const unwrapShell = (cmd) => {
  const m = cmd.match(/^(?:bash|sh|zsh)\s+-c\s+(['"])([\s\S]*)\1\s*$/);
  return m ? m[2] : cmd;
};

const segments = (cmd) =>
  unwrapShell(cmd)
    .split(CHAIN_SEP)
    .map((s) => s.trim())
    .filter(Boolean);

export const RULES = [
  {
    test: (seg) => /^git\s+reset(?:\s|$)/.test(seg) && /\s--hard(?:\s|$)/.test(seg),
    reason: 'git reset --hard discards all uncommitted changes permanently. Use git stash to preserve them.',
  },
  {
    test: (seg) =>
      /^git\s+clean(?:\s|$)/.test(seg) && (/\s-[a-zA-Z]*f/.test(seg) || /--force/.test(seg)),
    reason: 'git clean -f permanently deletes untracked files. List them with git clean -n first.',
  },
  {
    test: (seg) =>
      /^git\s+push(?:\s|$)/.test(seg) &&
      /(?:\s|^)(-f|--force)(?:\s|$)/.test(seg) &&
      !/--force-with-lease/.test(seg),
    reason: 'git push --force overwrites remote history. Use --force-with-lease instead.',
  },
  {
    test: (seg) => /^git\s+push(?:\s|$)/.test(seg) && /(?:[:\s])main(?:\s|$)/.test(seg),
    reason: 'Direct push to main is blocked. Open a PR instead.',
  },
  {
    test: (seg) => /^git\s+checkout\s+(?:--\s+)?\.(?:\s|$|["'\\])/.test(seg),
    reason: 'git checkout . discards all unstaged changes. Restore specific files instead.',
  },
  {
    test: (seg) => /^git\s+checkout\s+main(?:\s|$)/.test(seg),
    reason: 'Use `git fetch origin` and branch off `origin/main` directly. The user updates local main themselves.',
  },
];

export const checkDestructive = (command) => {
  const segs = segments(command);
  for (const rule of RULES) {
    if (segs.some(rule.test)) { return rule.reason; }
  }
};

const isBareCommit = (seg) =>
  /^git\s+commit(?:\s|$)/.test(seg) && !/^git\s+-C\s+\S+\s+commit(?:\s|$)/.test(seg);

const isBarePush = (seg) =>
  /^git\s+push(?:\s|$)/.test(seg) && !/^git\s+-C\s+\S+\s+push(?:\s|$)/.test(seg);

export const isCommitOnMain = (command, branch) =>
  branch === 'main' && segments(command).some(isBareCommit);

export const isPushOnMain = (command, branch) =>
  branch === 'main' && segments(command).some(isBarePush);

export function evaluate(command, branch) {
  if (typeof command !== 'string' || !command.trim()) {
    return 'Unable to parse command from tool input; denying for safety.';
  }

  const reason = checkDestructive(command);
  if (reason) { return reason; }

  if (isCommitOnMain(command, branch)) {
    return 'Cannot commit directly on main. Create a feature branch first: git switch -c feat/your-branch';
  }

  if (isPushOnMain(command, branch)) {
    return 'Direct push from main is blocked. Push from a feature branch and open a PR.';
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const { tool_input: { command } = {} } = JSON.parse(readFileSync(0, 'utf8'));
    const segs = segments(command || '');
    const needsBranch = segs.some(
      (s) => /^git\s+commit(?:\s|$)/.test(s) || /^git\s+push(?:\s|$)/.test(s),
    );
    const branch = needsBranch
      ? execSync('git branch --show-current', { encoding: 'utf8' }).trim()
      : null;
    const reason = evaluate(command, branch);
    if (reason) {
      process.stdout.write(deny(reason));
    }
  } catch (e) {
    process.stderr.write(`[git-guardrails] ${e.message}\n`);
  }
}
