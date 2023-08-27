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
      cy.get('[data-nav]').should('have.length', 4);
      cy.hash().should('equal', '#/');
      // Navigate to Rules
      cy.get('[data-nav=Rules]').click();
      cy.hash().should('equal', '#/rules');
      // Navigate to Home (Play)
      cy.get('[data-nav=Play]').click();
      cy.hash().should('equal', '#/');
      // Navigate to Stats
      cy.get('[data-nav=Stats]').click();
      cy.hash().should('equal', '#/stats');
      // Log out
      cy.get('[data-cy="logout-button"]').click();
      cy.get("[data-nav='Log Out']").click();
      cy.hash().should('equal', '#/login');
    }
    beforeEach(() => {
      cy.wipeDatabase();
      cy.visit('/');
      cy.signupPlayer(playerOne);
      cy.vueRoute('/');
    });
    it('When authenticated', () => {
      verifyAuthenticatedLinks();
    });
    it('When authenticated on reload', () => {
      cy.reload();
      verifyAuthenticatedLinks();
    });
  });
});
