const { defineConfig } = require('cypress');

// TODO: Re-add isProd check
const isProd = false;

module.exports = defineConfig({
  // https://docs.cypress.io/guides/references/legacy-configuration#Folders-Files
  pluginsFile: 'tests/e2e/plugins/index.js',

  // https://docs.cypress.io/guides/references/configuration#e2e
  baseUrl: process.env.VUE_APP_API_URL || 'http://localhost:8080',
  // Always test spec.js files, but switch between spec.prod and spec.dev based on the environment
  testFiles: [...(isProd ? ['**/*.spec.prod.js'] : ['**/*.spec.dev.js']), '**/*.spec.js'],

  // https://docs.cypress.io/guides/references/configuration#Global
  numTestsKeptInMemory: isProd ? 30 : 50,
  // Retry tests in dev scenarios
  ...(isProd
    ? {
        retries: {
          runMode: 2,
          openMode: 2,
        },
      }
    : {}),
  env: {
    ENABLE_VUE_DEVTOOLS: process.env.ENABLE_VUE_DEVTOOLS,
    NODE_ENV: isProd ? 'production' : 'dev',
  },

  // https://docs.cypress.io/guides/references/configuration#Videos
  video: false,
});
