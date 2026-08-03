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
import { announcementData } from '../../../src/routes/home/components/announcementDialog/data/announcementData';
import { LS_ANNOUNCEMENT } from '../../../utils/local-storage-utils';

const resizeObserverLoopErrRe = /^[^(ResizeObserver loop limit exceeded)]/;
Cypress.on('uncaught:exception', (err) => {
  if (resizeObserverLoopErrRe.test(err.message)) {
    return false;
  }
});

// Hide Vue DevTools panel during tests to prevent it from covering UI elements
Cypress.on('window:before:load', (win) => {
  // Suppress the always-on home announcement in tests so its dialog doesn't cover UI elements.
  // Must be seeded BEFORE the app loads: AnnouncementDialog reads localStorage synchronously at
  // mount, so cy.dismissIntroPopups() (which runs after cy.visit) is too late. Uses the current
  // announcement id via import, so it stays correct across future announcements.
  win.localStorage.setItem(LS_ANNOUNCEMENT, announcementData.id);
  win.document.head.insertAdjacentHTML(
    'beforeend',
    '<style>.vue-devtools__panel { display: none !important; }</style>'
  );
});


// Alternatively you can use CommonJS syntax:
// require('./commands')
