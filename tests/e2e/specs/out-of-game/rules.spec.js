import { myUser } from '../../fixtures/userFixtures';

describe('Rules Page', () => {
  beforeEach(() => {
    cy.wipeDatabase();
    cy.visit('/');
    cy.vueRoute('/rules');
  });

  it('Top Home button - Navigates to Login when unauthenticated and home when authenticated', () => {
    cy.get('[data-cy=top-home-button]').click();
    cy.hash().should('eq', '/signup');
    // Log in and try button again
    cy.signupPlayer(myUser);
    cy.vueRoute('/rules');
    cy.get('[data-cy=top-home-button]').click();
    cy.hash().should('eq', '/');
  });

  it('Bottom Home button - Navigates to Login when unauthenticated and home when authenticated', () => {
    cy.get('[data-cy=bottom-home-button]').click();
    cy.hash().should('eq', '/signup');
    // Log in and try button again
    cy.signupPlayer(myUser);
    cy.vueRoute('/rules');
    cy.get('[data-cy=bottom-home-button]').click();
    cy.hash().should('eq', '/');
  });
});
