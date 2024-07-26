import devtools from '@vue/devtools';
import { version } from '_/package.json';

export function initCuttleGlobals(app) {
  // We work under the assumption that this function will only be called in a context
  // where the window object exists. If we plan to ever call this on the server we'll
  // need to revisit the implementation
  const test = window.Cypress != null;
  const cuttle = {
    version,
    // Expose app for debugging/testing in lower envs
    app: test ? app : null,
    test,

  };
  window.cuttle = cuttle;

  // Connect the devtools -- non-prod only
  if (import.meta.env.DEV && import.meta.env.CUTTLE_ENV !== 'test') {
    try {
      devtools.connect(null, 8098);
      console.log('Vue devtools connected');
    } catch(err) {
      console.warn('Failed to connect vue devtools - try running npm run start:devtools');
    }
  }

}
