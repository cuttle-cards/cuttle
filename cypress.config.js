const { defineConfig } = require('cypress');
const { loadLocalEnv, resolveDevPorts } = require('./utils/dev-ports');

const isRunMode = !!process.env.CYPRESS_RUN_BINARY;

// Target the same stack the developer is running -- see utils/dev-ports.js
loadLocalEnv();
const { apiUrl, frontendUrl } = resolveDevPorts();

// The `e2e:server` scripts (and CI) test the built client as served by the sails server; every
// other mode tests the vite dev server. `CYPRESS_BASE_URL` overrides both.
const baseUrl = process.env.CUTTLE_E2E_TARGET === 'server' ? apiUrl : frontendUrl;

const cypressConfig = {
  projectId: 'i8bxr8',
  // https://docs.cypress.io/guides/references/configuration#e2e
  e2e: {
    baseUrl,
    specPattern: [ 'tests/e2e/specs/**/*.spec.js' ],
    // Exclude playground specs from headless mode
    excludeSpecPattern: isRunMode ? [] : [ 'tests/e2e/specs/playground/**/*.js' ],
    supportFile: 'tests/e2e/support/index.js',
  },
  // Retry tests 2 times headlessly, no retries in UI
  retries: {
    runMode: 2,
    openMode: 0,
  },
  numTestsKeptInMemory: 25,
  viewportWidth: 1920,
  viewportHeight: 1080,
  // https://docs.cypress.io/guides/references/configuration#Videos
  video: false,
  // https://docs.cypress.io/guides/references/configuration#Folders-Files
  downloadsFolder: 'tests/e2e/downloads',
  fixturesFolder: 'tests/e2e/fixtures',
  screenshotsFolder: 'tests/e2e/screenshots',
  videosFolder: 'tests/e2e/videos',
  // Available to specs as `Cypress.env('apiUrl')` for requests made straight to the server
  env: {
    apiUrl,
  },
};

module.exports = defineConfig(cypressConfig);
