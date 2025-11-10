// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

const resizeObserverLoopErrRe = /^[^(ResizeObserver loop limit exceeded)]/;
Cypress.on('uncaught:exception', (err) => {
  if (resizeObserverLoopErrRe.test(err.message)) {
    return false;
  }
});

// Hide Vue DevTools panel during tests to prevent it from covering UI elements
Cypress.on('window:before:load', (win) => {
  win.document.head.insertAdjacentHTML(
    'beforeend',
    '<style>.vue-devtools__panel { display: none !important; }</style>'
  );
});


// Alternatively you can use CommonJS syntax:
// require('./commands')
