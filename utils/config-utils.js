import devtools from '@vue/devtools'

import { version } from '_/package.json';

export function initCuttleGlobals(app) {
  if (!window) {
    console.error('No window object found');
  }

  const test = window.Cypress != null;
  const cuttle = {
    version,
    // Expose app for debugging/testing in lower envs
    app: window.Cypress ? app : null,
    test,
  };

  window.cuttle = cuttle;

  if (!import.meta.env.PROD) {
    // Connect the devtools -- non-prod only
    console.log('Connecting devtools');
    devtools.connect(null, 8098);
  }
}
