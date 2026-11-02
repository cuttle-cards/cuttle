import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, it, expect } from 'vitest';

const translationsDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../src/translations',
);

// Key paths in the order the keys are written in the JSON source.
// JSON.parse followed by Object.keys cannot be used here: it sorts
// integer-like keys, so a locale that lists '5' down to '1' in a
// different order would still compare equal.
function keyPathsFromSource(source) {
  let pos = 0;
  const paths = [];

  function skipWhitespace() {
    while (pos < source.length && /\s/.test(source[pos])) {
      pos += 1;
    }
  }

  function parseString() {
    const start = pos;
    pos += 1;
    while (pos < source.length) {
      if (source[pos] === '\\') {
        pos += 2;
      } else if (source[pos] === '"') {
        pos += 1;
        break;
      } else {
        pos += 1;
      }
    }
    return JSON.parse(source.slice(start, pos));
  }

  function parseValue(prefix) {
    skipWhitespace();
    if (source[pos] === '{') {
      parseObject(prefix);
    } else if (source[pos] === '[') {
      parseArray(prefix);
    } else if (source[pos] === '"') {
      parseString();
    } else {
      while (pos < source.length && !/[,\]}]/.test(source[pos])) {
        pos += 1;
      }
    }
  }

  function parseObject(prefix) {
    pos += 1;
    skipWhitespace();
    if (source[pos] === '}') {
      pos += 1;
      return;
    }
    while (true) {
      skipWhitespace();
      const key = parseString();
      const fullPath = prefix ? `${prefix}.${key}` : key;
      paths.push(fullPath);
      skipWhitespace();
      pos += 1;
      parseValue(fullPath);
      skipWhitespace();
      if (source[pos] === ',') {
        pos += 1;
      } else {
        pos += 1;
        break;
      }
    }
  }

  function parseArray(prefix) {
    pos += 1;
    skipWhitespace();
    if (source[pos] === ']') {
      pos += 1;
      return;
    }
    let index = 0;
    while (true) {
      const fullPath = prefix ? `${prefix}.${index}` : `${index}`;
      paths.push(fullPath);
      parseValue(fullPath);
      index += 1;
      skipWhitespace();
      if (source[pos] === ',') {
        pos += 1;
      } else {
        pos += 1;
        break;
      }
    }
  }

  parseValue('');
  return paths;
}

function loadLocaleSource(locale) {
  return fs.readFileSync(path.join(translationsDir, `${locale}.json`), 'utf-8');
}

describe('translations', () => {
  it('should use en.json as the canonical key order for every locale', () => {
    const canonicalPaths = keyPathsFromSource(loadLocaleSource('en'));
    for (const locale of [ 'de', 'es', 'fr', 'ukr' ]) {
      expect(keyPathsFromSource(loadLocaleSource(locale))).toEqual(canonicalPaths);
    }
  });

  it('should detect numeric key order changes', () => {
    const enSource = loadLocaleSource('en');
    const lines = enSource.split('\n');
    // stats.statsScoring.points lists its keys from '5' down to '1'.
    const pointsIndex = lines.findIndex((line, index) => {
      if (!line.includes('"points"')) {
        return false;
      }
      const nextKeyLine = lines
        .slice(index + 1)
        .find((candidate) => /^\s*"/.test(candidate));
      return nextKeyLine !== undefined && /^\s*"5"\s*:/.test(nextKeyLine);
    });
    const fiveIndex = lines.findIndex(
      (line, index) => index > pointsIndex && /^\s*"5"\s*:/.test(line),
    );
    expect(fiveIndex).toBeGreaterThan(pointsIndex);
    const swapped = [ ...lines ];
    [ swapped[fiveIndex], swapped[fiveIndex + 1] ] = [
      swapped[fiveIndex + 1],
      swapped[fiveIndex],
    ];
    expect(keyPathsFromSource(swapped.join('\n'))).not.toEqual(
      keyPathsFromSource(enSource),
    );
  });
});
