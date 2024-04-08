import { playerOne } from '../../fixtures/userFixtures';

describe('Navigation', () => {
  beforeEach(() => {
    cy.wipeDatabase();
    cy.visit('/');
    cy.signupPlayer(playerOne);
    cy.vueRoute('/');
    window.localStorage.setItem('bannerDismissed', true);
  });

  describe('Desktop Navigation', () => {
    beforeEach(() => {
      cy.viewport(1920, 1080);
    });

    it('When authenticated', () => {
      verifyAuthenticatedLinks();
    });

    it('When authenticated on reload', () => {
      cy.reload();
      verifyAuthenticatedLinks();
    });
  });

  describe('Mobile Navigation', () => {
    beforeEach(() => {
      cy.viewport('iphone-8');
      window.localStorage.setItem('bannerDismissed', true);
    });

    it('When authenticated', () => {
      verifyAuthenticatedLinks();
    });

    it('When authenticated on reload', () => {
      cy.reload();
      verifyAuthenticatedLinks();
    });
  });

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
});
