import { playerOne } from '../../fixtures/userFixtures';

describe('Navigation Drawer', () => {
  beforeEach(() => {
    cy.wipeDatabase();
    cy.visit('/');
    cy.signupPlayer(playerOne);
    cy.vueRoute('/');
  });

  describe('Navigates to Rules, Home, Stats, and Login pages', () => {
    function verifyAuthenticatedLinks() {
      // Navigate to Rules
      cy.viewport(1920, 1080);
      cy.get('[data-cy=About]').click();
      cy.hash().should('equal', '#/rules');
      // Navigate to Home (Play)
      cy.get('[data-cy=Play]').click();
      cy.hash().should('equal', '#/');
      // Navigate to Stats
      cy.get('[data-cy=Stats]').click();
      cy.hash().should('equal', '#/stats');
      // Log out
      cy.get('[data-cy="user-menu"]').click();
      cy.get("[data-nav='Log Out']").click();
      cy.hash().should('equal', '#/login');
    }
    it('When authenticated', () => {
      verifyAuthenticatedLinks();
    });
    it('When authenticated on reload', () => {
      cy.reload();
      verifyAuthenticatedLinks();
    });
  });
});
