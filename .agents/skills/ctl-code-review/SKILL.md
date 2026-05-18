---
name: ctl-code-review
description: "Review code changes against Cuttle's discover-plan-execute workflow, safety rules, and AGENTS.md conventions. Use on 'review my changes', 'check this diff', 'review this PR', '/ctl-code-review'. Dispatches to subagents for security, architecture, and performance."
model: inherit
allowed-tools: Read, Grep, Glob, Bash, Agent
---

# Code Review

Compliance review for Cuttle. Checks AGENTS.md rules, then dispatches to specialist subagents.

## Input

Run against staged diff, a branch, or a PR:

```bash
# Current branch vs main
git diff main..HEAD

# Specific PR
gh pr diff <number>
```

## Phase 1: Automated checks

Before reviewing code, verify the basics passed:

```bash
npm run lint
npm run test:unit
```

If either fails, report which checks failed. Do not proceed with review until they're green.

## Phase 2: AGENTS.md compliance

Check against AGENTS.md:

1. **Discovery first** — Were patterns discovered before code was written? Look for evidence of glob/grep discovery in the PR description or commit messages.
2. **Safety rules** — No hardcoded secrets. Session validation present on game-mutating routes. Policies applied (`config/policies.js`).
3. **Pattern consistency** — Controller follows the lock/unlock/catch pattern. Helper follows the `inputs`/`fn`/`exits` structure. Vue SFC uses `<script setup>`.
4. **No banned patterns** — No `.with()` on Sails helpers. No `v-html` with dynamic content. No `git add -A`.
5. **Test coverage** — New behavior has E2E or unit test coverage.

## Phase 3: Subagent dispatch

Dispatch to specialist reviewers in parallel:

```
Agent(ctl-architecture-reviewer): review for module boundaries, race conditions, store mutation hygiene
Agent(ctl-security-reviewer): review for CSRF, XSS, auth gaps, policy chain
Agent(ctl-performance-reviewer): review for socket cleanup, Pinia reactivity, memory leaks
```

Dispatch all three. Collect reports. Do not proceed to Phase 4 until all three return.

## Phase 4: Report

Structure:

```
## Code Review Report

### Automated Checks
✅ lint: passed
✅ test:unit: passed

### AGENTS.md Compliance
- [PASS/FAIL] Discovery evidence present
- [PASS/FAIL] Safety rules
- [PASS/FAIL] Pattern consistency
- [PASS/FAIL] Test coverage

### Architecture (ctl-architecture-reviewer)
[findings]

### Security (ctl-security-reviewer)
[findings]

### Performance (ctl-performance-reviewer)
[findings]

### Verdict
[APPROVE / REQUEST CHANGES / NEEDS DISCUSSION]

### Required actions (if any)
- [specific file:line — what to fix]
```

## Severity levels

- **Block** — must fix before merge (security, data loss, test failure)
- **Request** — should fix before merge (pattern violation, missing test)
- **Suggest** — optional improvement (style, readability)

## Final verification checklist (from AGENTS.md)

- [ ] Implementation matches discovered patterns
- [ ] No secrets hardcoded; policies correctly applied
- [ ] Changes align with existing file and project structures
- [ ] `npm run lint` passes
- [ ] `npm run test:unit` passes
