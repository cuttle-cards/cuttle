import fs from 'fs';
import path from 'path';
import { describe, it, expect } from 'vitest';
import jsconfig from '_/jsconfig.json';
import { aliases, rootDir, srcDir, jsconfigPaths } from '_/utils/path-aliases.js';

describe('path-aliases', () => {
  it('should export rootDir and srcDir that exist on the filesystem', () => {
    expect(fs.existsSync(rootDir)).toBe(true);
    expect(fs.existsSync(path.join(rootDir, 'package.json'))).toBe(true);
    expect(fs.existsSync(srcDir)).toBe(true);
    expect(path.resolve(srcDir)).toBe(path.resolve(rootDir, 'src'));
  });

  it('should define _ and @ aliases pointing to rootDir and srcDir', () => {
    expect(aliases._).toBe(rootDir);
    expect(aliases['@']).toBe(srcDir);
  });

  it('should match jsconfig.json compilerOptions.paths', () => {
    expect(jsconfig.compilerOptions.paths).toEqual(jsconfigPaths);
    expect(jsconfig.compilerOptions.paths).toEqual({
      '_/*': [ './*' ],
      '@/*': [ './src/*' ],
    });
  });
});
