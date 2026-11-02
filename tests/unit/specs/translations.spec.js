import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, it, expect } from 'vitest';

const translationsDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../src/translations',
);

function keyPaths(obj, prefix = '') {
  const paths = [];
  for (const key of Object.keys(obj)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    paths.push(fullPath);
    if (obj[key] !== null && typeof obj[key] === 'object') {
      paths.push(...keyPaths(obj[key], fullPath));
    }
  }
  return paths;
}

function loadLocale(locale) {
  return JSON.parse(fs.readFileSync(path.join(translationsDir, `${locale}.json`), 'utf-8'));
}

describe('translations', () => {
  it('should use en.json as the canonical key order for every locale', () => {
    const canonicalPaths = keyPaths(loadLocale('en'));
    for (const locale of ['de', 'es', 'fr', 'ukr']) {
      expect(keyPaths(loadLocale(locale))).toEqual(canonicalPaths);
    }
  });
});
