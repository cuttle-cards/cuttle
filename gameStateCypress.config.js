const { defineConfig } = require('cypress');

const excludedFiles = ['tests/e2e/specs/playground.spec.js', 'tests/e2e/specs/in-game/**/*.spec.js'];

module.exports = defineConfig({
  projectId: 'i8bxr8',
  // https://docs.cypress.io/guides/references/configuration#e2e
  e2e: {
    baseUrl: process.env.VITE_API_URL || 'http://localhost:8080',
    specPattern: ['tests/e2e/specs/**/*.spec.js'],
    excludeSpecPattern: excludedFiles,
    supportFile: 'tests/e2e/support/index.js',
  },
  env: {
    gameStateAPI: process.env.VITE_USE_GAMESTATE_API || 'false',
  },
  // Retry tests 2 times headlessly, no retries in UI
  retries: {
    runMode: 2,
    openMode: 0,
  },
  numTestsKeptInMemory: 25,
  // https://docs.cypress.io/guides/references/configuration#Videos
  video: false,
  // https://docs.cypress.io/guides/references/configuration#Folders-Files
  downloadsFolder: 'tests/e2e/downloads',
  fixturesFolder: 'tests/e2e/fixtures',
  screenshotsFolder: 'tests/e2e/screenshots',
  videosFolder: 'tests/e2e/videos',
});
