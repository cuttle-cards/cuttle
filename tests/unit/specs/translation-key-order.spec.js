import fs from 'fs';
import path from 'path';
import { describe, it, expect } from 'vitest';
import { rootDir } from '_/utils/path-aliases.js';

const translationDirectory = path.join(rootDir, 'src', 'translations');

const keyPaths = (value, prefix = []) => {
  if (value === null || Array.isArray(value) || typeof value !== 'object') {
    return [];
  }

  return Object.entries(value).flatMap(([ key, child ]) => {
    const currentPath = [ ...prefix, key ];
    return [ currentPath, ...keyPaths(child, currentPath) ];
  });
};

const firstDifferenceIndex = (expected, actual) => {
  const commonLength = Math.min(expected.length, actual.length);
  for (let index = 0; index < commonLength; index += 1) {
    const expectedPath = expected[index];
    const actualPath = actual[index];
    if (
      expectedPath.length !== actualPath.length ||
      expectedPath.some((key, partIndex) => key !== actualPath[partIndex])
    ) {
      return index;
    }
  }

  return expected.length === actual.length ? -1 : commonLength;
};

describe('translation key order', () => {
  it('follows en.json in every locale file', () => {
    const files = fs
      .readdirSync(translationDirectory)
      .filter((file) => file.endsWith('.json'))
      .sort();
    expect(files).toContain('en.json');

    const canonical = JSON.parse(
      fs.readFileSync(path.join(translationDirectory, 'en.json'), 'utf8')
    );
    const canonicalPaths = keyPaths(canonical);

    for (const file of files) {
      if (file === 'en.json') {continue;}

      const locale = JSON.parse(fs.readFileSync(path.join(translationDirectory, file), 'utf8'));
      const localePaths = keyPaths(locale);
      const difference = firstDifferenceIndex(canonicalPaths, localePaths);
      const expected = canonicalPaths[difference]?.join('.') ?? '<end of file>';
      const actual = localePaths[difference]?.join('.') ?? '<end of file>';

      expect(
        difference,
        `${file} key order differs from en.json at position ${difference}: expected ${expected}, got ${actual}`
      ).toBe(-1);
    }
  });
});
