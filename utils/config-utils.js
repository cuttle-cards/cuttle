import { version } from '_/package.json';

export async function initCuttleGlobals(app) {
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
}
