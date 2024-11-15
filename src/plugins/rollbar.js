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
    ...(!import.meta.env.PROD) ? [
      'localhost',
    ] : [],
  ],
  payload: {
    environment: import.meta.env.PROD ? 'production' : 'development',
    client: {
      javascript: {
        code_version: version,
        source_map_enabled: true,
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
