import fs from 'fs';
import path from 'path';
import { describe, it, expect } from 'vitest';
import { rootDir } from '_/utils/path-aliases.js';

const translationDirectory = path.join(rootDir, 'src', 'translations');

const keyPathsFromJson = (source) => {
  JSON.parse(source);

  const keyPaths = [];
  let index = 0;

  const skipWhitespace = () => {
    while (source[index] !== undefined && source[index].trim() === '') {index += 1;}
  };

  const readString = () => {
    const start = index;
    index += 1;

    while (index < source.length) {
      if (source[index] === String.fromCharCode(92)) {
        index += 2;
      } else if (source[index] === '"') {
        index += 1;
        return JSON.parse(source.slice(start, index));
      } else {
        index += 1;
      }
    }

    throw new SyntaxError('Unterminated JSON string');
  };

  const parseValue = (prefix = [], includePaths = true) => {
    skipWhitespace();

    if (source[index] === '{') {
      index += 1;
      skipWhitespace();
      if (source[index] === '}') {index += 1; return;}

      while (true) {
        skipWhitespace();
        const key = readString();
        skipWhitespace();
        index += 1;

        const currentPath = [ ...prefix, key ];
        if (includePaths) {keyPaths.push(currentPath);}
        parseValue(currentPath, includePaths);

        skipWhitespace();
        if (source[index] === '}') {index += 1; return;}
        index += 1;
      }
    }

    if (source[index] === '[') {
      index += 1;
      skipWhitespace();
      if (source[index] === ']') {index += 1; return;}

      while (true) {
        parseValue(prefix, false);
        skipWhitespace();
        if (source[index] === ']') {index += 1; return;}
        index += 1;
      }
    }

    if (source[index] === '"') {
      readString();
      return;
    }

    const start = index;
    while (index < source.length) {
      const character = source[index];
      if (character.trim() === '' || character === ',' || character === ']' || character === '}') {break;}
      index += 1;
    }
    if (start === index) {throw new SyntaxError('Invalid JSON value');}
  };

  parseValue();
  skipWhitespace();
  if (index !== source.length) {throw new SyntaxError('Unexpected content after JSON value');}

  return keyPaths;
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
  it('preserves numeric object key order from the JSON source', () => {
    const source = '{"stats":{"statsScoring":{"points":{"5":"five","4":"four","3":"three","2":"two","1":"one"}}}}';
    const numericKeys = keyPathsFromJson(source)
      .filter((keys) => keys.length === 4 && keys.slice(0, 3).join('.') === 'stats.statsScoring.points')
      .map((keys) => keys[3]);

    expect(numericKeys).toEqual([ '5', '4', '3', '2', '1' ]);
  });

  it('follows en.json in every locale file', () => {
    const files = fs
      .readdirSync(translationDirectory)
      .filter((file) => file.endsWith('.json'))
      .sort();
    expect(files).toContain('en.json');

    const canonicalPaths = keyPathsFromJson(
      fs.readFileSync(path.join(translationDirectory, 'en.json'), 'utf8')
    );

    for (const file of files) {
      if (file === 'en.json') {continue;}

      const localePaths = keyPathsFromJson(
        fs.readFileSync(path.join(translationDirectory, file), 'utf8')
      );
      const difference = firstDifferenceIndex(canonicalPaths, localePaths);
      const expected = canonicalPaths[difference]?.join('.') ?? '<end of file>';
      const actual = localePaths[difference]?.join('.') ?? '<end of file>';

      expect(
        difference,
        file + ' key order differs from en.json at position ' + difference + ': expected ' + expected + ', got ' + actual
      ).toBe(-1);
    }
  });
});
