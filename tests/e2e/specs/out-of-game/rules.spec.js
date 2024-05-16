import { myUser } from '../../fixtures/userFixtures';

describe('Rules Page', () => {
  beforeEach(() => {
    cy.wipeDatabase();
    cy.visit('/');
    cy.vueRoute('/rules');
    window.localStorage.setItem('fiveChangeBannerDismissed', true);
  });

  it('Navigates to Login when unauthenticated and home when authenticated using the Ready To Play button', () => {
    cy.get('[data-cy=ready-to-play-button]').should('contain', 'Sign Up').click();
    cy.location('pathname').should('eq', '/signup');
    // Log in and try button again
    cy.signupPlayer(myUser);
    cy.vueRoute('/rules');
    cy.get('[data-cy=ready-to-play-button]').should('contain', 'Find a Game').click();
    cy.location('pathname').should('eq', '/');
  });
});
