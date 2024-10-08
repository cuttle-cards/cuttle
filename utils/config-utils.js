import { version } from '_/package.json';

async function initDevtools() {
  try {
    // Check devtools availability
    const response = await fetch('/api/devtools-health');
    const { alive } = await response.json();
    if (!alive) {
      throw new Error('Devtools not available');
    }
    // Add devtools script to the DOM
    const script = document.createElement('script');
    script.src = 'http://localhost:8098';
    script.async = true;
    script.onerror = () => {
      console.error('Failed to load the devtools script');
    };
    document.head.appendChild(script);
  } catch (err) {
    console.warn('Error checking devtools availability:', err.message);
  }
}

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

  // Connect the devtools -- non-prod only
  if (import.meta.env.DEV) {
    document.addEventListener('DOMContentLoaded', initDevtools);
  }
}
