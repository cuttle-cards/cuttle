/**
 * Shared path aliases
 *
 * This module is bundled into vite's config as well as required by eslint and vitest,
 * so it deliberately has no imports or requires at all (see utils/dev-ports.js).
 */
const rootDir = __dirname.replace(/[/\\]utils$/, '');
const srcDir = `${rootDir}/src`;

const aliases = {
  _: rootDir,
  '@': srcDir,
};

const jsconfigPaths = {
  '_/*': [ './*' ],
  '@/*': [ './src/*' ],
};

module.exports = {
  rootDir,
  srcDir,
  aliases,
  jsconfigPaths,
};
