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

  // Connect the devtools -- non-prod only
  if (!import.meta.env.PROD) {
    try {
      devtools.connect(null, 8098);
    } catch(err) {
      console.warn('Failed to connect vue devtools. Try running npm run start:devtools');
      return;
    }
    console.log('Vue devtools connected');
  }
}
