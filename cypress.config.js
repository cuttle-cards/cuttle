const { defineConfig } = require('cypress');

const { isProd } = require('./utils/config-utils');

module.exports = defineConfig({
  // https://docs.cypress.io/guides/references/configuration#Global
  env: {
    ENABLE_VUE_DEVTOOLS: process.env.ENABLE_VUE_DEVTOOLS,
    NODE_ENV: isProd ? 'production' : 'dev',
  },
  // https://docs.cypress.io/guides/references/configuration#e2e
  e2e: {
    baseUrl: process.env.VUE_APP_API_URL || 'http://localhost:8080',
    specPattern: [
      ...(isProd ? ['tests/e2e/specs/**/*.spec.prod.js'] : ['tests/e2e/specs/**/*.spec.dev.js']),
      'tests/e2e/specs/**/*.spec.js',
    ],
    supportFile: 'tests/e2e/support/index.js',
    // https://github.com/javierbrea/cypress-fail-fast
    setupNodeEvents(on, config) {
      require('cypress-fail-fast/plugin')(on, config);
      return config;
    },
  },
  // https://docs.cypress.io/guides/references/configuration#Videos
  video: false,
  // https://docs.cypress.io/guides/references/configuration#Folders-Files
  downloadsFolder: 'tests/e2e/downloads',
  fixturesFolder: 'tests/e2e/fixtures',
  screenshotsFolder: 'tests/e2e/screenshots',
  videosFolder: 'tests/e2e/videos',
});
