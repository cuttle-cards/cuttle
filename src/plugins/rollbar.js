import { version } from '_/package.json';

import Rollbar from 'rollbar';

// https://docs.rollbar.com/docs/rollbarjs-configuration-reference#notifier
const config = {
  accessToken: import.meta.env.VITE_ROLLBAR_ACCESS_TOKEN,
  // Anonymize IP addresses
  captureIp: 'anonymize',
  // Capture uncaught exceptions and unhandled rejections
  captureUncaught: true,
  captureUnhandledRejections: true,
  // Only allow items to be sent from certain domains
  hostSafeList: [
    'cuttle.cards',
    // 'localhost', // Uncomment to log errors during development
  ],
  payload: {
    environment: import.meta.env.PROD ? 'production' : 'development',
    client: {
      javascript: {
        code_version: version,
        // It would be nice to add these eventuall, but we need to upload them separately during
        // the build process
        source_map_enabled: false,
      }
    },
  },
  // Only send "error" or higher items to Rollbar
  logLevel: 'error',
  reportLevel: 'error',
};

const rollbar = new Rollbar(config);

export default {
  install(app) {
    app.config.errorHandler = (error, vm, info) => {
      rollbar.error(error, { vueComponent: vm, info });
      if (app.config.devtools) {
        console.error(error);
      }
    };
    app.provide('rollbar', rollbar);
  },
};
