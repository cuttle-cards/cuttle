const { defineConfig } = require('cypress');

module.exports = defineConfig({
  // https://docs.cypress.io/guides/references/configuration#e2e
  e2e: {
    baseUrl: process.env.VITE_API_URL || 'http://localhost:8080',
    specPattern: ['tests/e2e/specs/**/*.spec.js'],
    excludeSpecPattern: ['tests/e2e/specs/playground.spec.js'],
    supportFile: 'tests/e2e/support/index.js',
    // https://github.com/javierbrea/cypress-fail-fast
    setupNodeEvents(on, config) {
      require('cypress-fail-fast/plugin')(on, config);
      // Log errors to the terminal console
      // Also requires the log to be overridden in commands.js
      // See https://github.com/cypress-io/cypress/issues/3199#issuecomment-1019270203
      // on('task', {
      //   log(message) {
      //     console.log(`[log]: ${message}`);
      //     return null;
      //   },
      // });
      return config;
    },
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
