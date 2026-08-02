const { defineConfig } = require('cypress');

// Video-recording config for the playground specs (see .claude/skills/record-video).
// Extends the base cypress.config.js and:
//   - forces a true 1920x1080 recording window — headless browsers otherwise default to a
//     ~1280px-wide window, which clips the top/bottom of the game board (e.g. the opponent
//     username) because the board is laid out with vh/vw units against the real window;
//   - enables video and disables asset-trashing so saved clips accumulate;
//   - clears excludeSpecPattern so the playground specs are runnable headlessly.
// Run with:  npx cypress run --browser chrome --config-file cypress.video.config.js ...
const base = require('./cypress.config');

const RECORD_WIDTH = 1920;
const RECORD_HEIGHT = 1080;
// Chrome's --window-size sets the OUTER window; headless reserves ~88px of height for browser
// chrome, so we pad the requested window height to land the actual web contents on 1080 → a clean
// 1920x1080 (16:9) recording.
const CHROME_HEIGHT_OVERHEAD = 88;

module.exports = defineConfig({
  ...base,
  video: true,
  e2e: {
    ...base.e2e,
    excludeSpecPattern: [],
    setupNodeEvents(on) {
      on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.family === 'chromium') {
          launchOptions.args.push(`--window-size=${RECORD_WIDTH},${RECORD_HEIGHT + CHROME_HEIGHT_OVERHEAD}`);
          launchOptions.args.push('--force-device-scale-factor=1');
          launchOptions.args.push('--hide-scrollbars');
        } else if (browser.name === 'electron') {
          launchOptions.preferences.width = RECORD_WIDTH;
          launchOptions.preferences.height = RECORD_HEIGHT;
        }
        return launchOptions;
      });
    },
  },
  trashAssetsBeforeRuns: false,
});
