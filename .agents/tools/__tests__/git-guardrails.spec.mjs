import { describe, it, expect } from 'vitest';
import { checkDestructive, isCommitOnMain, isPushOnMain, evaluate } from '../git-guardrails.mjs';

describe('git-guardrails', () => {
  describe('checkDestructive', () => {
    it('allows a clean commit command', () => {
      expect(checkDestructive('git commit -m "fix: thing"')).toBeUndefined();
    });

    it('allows git log', () => {
      expect(checkDestructive('git log --oneline -10')).toBeUndefined();
    });

    it('allows git status', () => {
      expect(checkDestructive('git status --porcelain')).toBeUndefined();
    });

    it('blocks git reset --hard', () => {
      expect(checkDestructive('git reset --hard HEAD')).toMatch(/reset --hard/);
    });

    it('blocks git reset --hard in a chain', () => {
      expect(checkDestructive('git fetch origin && git reset --hard origin/main')).toMatch(/reset --hard/);
    });

    it('blocks git clean -f', () => {
      expect(checkDestructive('git clean -f')).toMatch(/clean/);
    });

    it('blocks git clean --force', () => {
      expect(checkDestructive('git clean --force')).toMatch(/clean/);
    });

    it('allows git clean -n (dry run)', () => {
      expect(checkDestructive('git clean -n')).toBeUndefined();
    });

    it('blocks git push --force', () => {
      expect(checkDestructive('git push --force')).toMatch(/force/);
    });

    it('blocks git push -f', () => {
      expect(checkDestructive('git push origin main -f')).toMatch(/force/);
    });

    it('allows git push --force-with-lease', () => {
      expect(checkDestructive('git push --force-with-lease')).toBeUndefined();
    });

    it('blocks direct push to main', () => {
      expect(checkDestructive('git push origin main')).toMatch(/main/);
    });

    it('allows push to feature branch', () => {
      expect(checkDestructive('git push origin feat/my-feature')).toBeUndefined();
    });

    it('blocks git checkout .', () => {
      expect(checkDestructive('git checkout .')).toMatch(/checkout/);
    });

    it('blocks git checkout main', () => {
      expect(checkDestructive('git checkout main')).toMatch(/main/);
    });

    it('allows non-git bash commands', () => {
      expect(checkDestructive('npm run lint')).toBeUndefined();
      expect(checkDestructive('ls -la')).toBeUndefined();
      expect(checkDestructive('find . -name "*.js"')).toBeUndefined();
    });
  });

  describe('isCommitOnMain', () => {
    it('returns true for commit on main', () => {
      expect(isCommitOnMain('git commit -m "fix: thing"', 'main')).toBe(true);
    });

    it('returns false for commit on feature branch', () => {
      expect(isCommitOnMain('git commit -m "fix: thing"', 'feat/my-feature')).toBe(false);
    });

    it('returns false for non-commit command on main', () => {
      expect(isCommitOnMain('git log --oneline', 'main')).toBe(false);
    });

    it('returns false for git -C repo commit (submodule-style)', () => {
      expect(isCommitOnMain('git -C subdir commit -m "msg"', 'main')).toBe(false);
    });
  });

  describe('isPushOnMain', () => {
    it('returns true for push on main', () => {
      expect(isPushOnMain('git push origin feat/branch', 'main')).toBe(true);
    });

    it('returns false for push on feature branch', () => {
      expect(isPushOnMain('git push origin feat/branch', 'feat/branch')).toBe(false);
    });
  });

  describe('evaluate', () => {
    it('allows clean commit on feature branch', () => {
      expect(evaluate('git commit -m "fix: thing"', 'feat/my-feature')).toBeUndefined();
    });

    it('blocks commit on main', () => {
      expect(evaluate('git commit -m "fix: thing"', 'main')).toMatch(/main/);
    });

    it('blocks push from main', () => {
      expect(evaluate('git push origin feat/branch', 'main')).toMatch(/main/);
    });

    it('blocks destructive commands regardless of branch', () => {
      expect(evaluate('git reset --hard HEAD', 'feat/my-feature')).toMatch(/reset --hard/);
    });

    it('denies empty/null command', () => {
      expect(evaluate('', 'feat/my-feature')).toMatch(/unable to parse/i);
    });

    it('denies whitespace-only command', () => {
      expect(evaluate('   ', 'feat/my-feature')).toMatch(/unable to parse/i);
    });

    it('allows non-git commands on main', () => {
      expect(evaluate('npm run lint', 'main')).toBeUndefined();
      expect(evaluate('ls -la', 'main')).toBeUndefined();
    });
  });
});
