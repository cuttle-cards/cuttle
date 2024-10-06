import { playerOne } from '../../fixtures/userFixtures';
import { announcementData } from '../../../../src/routes/home/components/announcementDialog/data/announcementData';

function verifyAuthenticatedLinks() {
  // Navigate to Rules
  cy.get('[data-cy=About]').click();
  cy.location('pathname').should('equal', '/rules');
  // Navigate to Home (Play)
  cy.get('[data-cy=Play]').click();
  cy.location('pathname').should('equal', '/');
  // Navigate to Stats
  cy.get('[data-cy=Stats]').click();
  cy.location('pathname').should('equal', '/stats');
  // Log out
  cy.get('[data-cy="user-menu"]').click();
  cy.get("[data-nav='Log Out']").click();
  cy.location('pathname').should('equal', '/login');
}

function verifyUnauthenticatedLinks() {
  // Rules page has TheHeader, but no links other than Signup
  cy.get('[data-cy=rules-link]').click();
  cy.location('pathname').should('equal', '/rules');
  cy.get('[data-cy=nav-drawer]').should('be.visible');
  cy.get('[data-cy=About]').should('not.exist');
  cy.get('[data-cy=Play]').should('not.exist');
  cy.get('[data-cy=Stats]').should('not.exist');

  // First time unauthenticated user sees 'Sign Up' link
  cy.get('[data-cy=login-link]').should('contain', 'Sign Up')
.click();
  cy.location('pathname').should('equal', '/signup');

  // Sign Up, then log out and return to rules
  cy.signupPlayer(playerOne);
  cy.vueRoute('/rules');
  cy.get('[data-cy="user-menu"]').click();
  cy.get("[data-nav='Log Out']").click();
  cy.get('[data-cy=rules-link]').click();
  cy.location('pathname').should('equal', '/rules');

  // Returning unauthenticated users sees 'Log In' link
  cy.get('[data-cy=login-link]').should('contain', 'Log In')
.click();
  cy.location('pathname').should('equal', '/login');
}

describe('Navigation', () => {
  beforeEach(() => {
    cy.wipeDatabase();
    cy.visit('/');
    window.localStorage.setItem('announcement', announcementData.id);
  });

  describe('Authenticated Navigation', () => {
    beforeEach(() => {
      cy.signupPlayer(playerOne);
      cy.vueRoute('/');
    });

    it('Navigates to Rules, Home, Stats and Login when authenticated on DESKTOP', () => {
      cy.viewport(1920, 1080);
      cy.reload();
      verifyAuthenticatedLinks();
    });

    it('Navigates to Rules, Home, Stats and Login when authenticated on MOBILE', () => {
      cy.viewport('iphone-8');
      cy.reload();
      verifyAuthenticatedLinks();
    });
  });

  describe('Unauthenticated Navigation', () => {
    beforeEach(() => {
      window.localStorage.setItem('announcement', announcementData.id);
    });

    it('Navigates between Login and Rules when unauthenticated on DESKTOP', () => {
      cy.viewport(1920, 1080);
      verifyUnauthenticatedLinks();
    });

    it('Navigates between Login and Rules when unauthenticated on MOBILE', () => {
      cy.viewport('iphone-8');
      verifyUnauthenticatedLinks();
    });
  });
});
