import { version } from '_/package.json';

import Rollbar from 'rollbar';

const config = {
  accessToken: import.meta.env.VITE_ROLLBAR_ACCESS_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true,
  payload: {
    environment: import.meta.env.PROD ? 'production' : 'development',
    client: {
      javascript: {
        code_version: version,
      }
    }
  },
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
