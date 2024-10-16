import { myUser } from '../../fixtures/userFixtures';
import { announcementData } from '../../../../src/routes/home/components/announcementDialog/data/announcementData';

describe('Rules Page', () => {
  beforeEach(() => {
    cy.wipeDatabase();
    cy.visit('/');
    cy.vueRoute('/rules');
    window.localStorage.setItem('announcement', announcementData.id);
  });

  it('Navigates to Login when unauthenticated and home when authenticated using the Ready To Play button', () => {
    cy.get('[data-cy=ready-to-play-button]').should('contain', 'Sign Up')
      .click();
    cy.location('pathname').should('eq', '/signup');
    // Log in and try button again
    cy.signupPlayer(myUser);
    cy.vueRoute('/rules');
    cy.get('[data-cy=ready-to-play-button]').should('contain', 'Find a Game')
      .click();
    cy.location('pathname').should('eq', '/');
  });

  it('It displays rule preview gifs when user clicks "Watch Video"', () => {
    cy.get('[data-cy-open-rule-preview="rules.royals.king"]').click();
    cy.get('[data-cy-preview-gif="King"', { timeout: 5000 }).should('be.visible');
    cy.get('[data-cy="close-preview-gif"]').click();
    cy.get('[data-cy-preview-gif="King"').should('not.exist');
  });
});
