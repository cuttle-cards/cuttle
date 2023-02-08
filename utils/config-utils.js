import devtools from '@vue/devtools'

import { version } from '_/package.json';

export function initCuttleGlobals(app) {
  if (!window) {
    console.error('No window object found');
  }

  // This is required to mock a prod-like scenario in Cypress to check the existence (or lack
  // there-of) of the devtools instance
  const isMockProd = new URLSearchParams(window.location.search).get('mock-prod') === 'true';
  const includeDevtools = (!import.meta.env.PROD || window.Cypress) && !isMockProd;

  const test = window.Cypress != null;
  const cuttle = {
    version,
    // Expose app for debugging/testing in lower envs
    app: includeDevtools ? app : null,
    test,
  };

  window.cuttle = cuttle;

  if (includeDevtools) {
    // Connect the devtools -- non-prod only
    console.log('Connecting devtools');
    devtools.connect(null, 8098);
  }
}
