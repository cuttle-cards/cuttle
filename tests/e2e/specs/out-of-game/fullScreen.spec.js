import { myUser, opponentOne } from '../../fixtures/userFixtures';
// import en from '../../../../src/translations/es.json';

function setup() {
  cy.wipeDatabase();
    cy.visit('/');
    cy.signupPlayer(myUser);
    cy.createGamePlayer({ gameName: 'Test Game', isRanked: false }).then((gameSummary) => {
      cy.wrap(gameSummary).as('gameSummary');
      // Sign up new (other) user and subscribe them to game
      cy.signupOpponent(opponentOne);
      cy.subscribeOpponent(gameSummary.gameId);
      // Join game as this user and navigate to lobby
      cy.visit('/#');
    });
}


describe('check presence of full screen buttons', () => {
  beforeEach(() => {
    setup();
  });

  it('full screen button in user menu of homepage', () => {
    //in homepage
    cy.get('[data-cy=user-menu]').click();
    cy.get('[data-cy=full-screen-list-item]').should('exist');
    cy.get('i.mdi-fullscreen').should('exist');
    cy.contains('full screen').should('exist');
    // in lobby
    cy.get('[data-cy=game-list-item]').contains('button.v-btn', 'Join Casual').click();
    cy.get('[data-cy="full-screen-icon-button"]').should('exist');
    // in game 
    cy.readyOpponent();
    cy.get('[data-cy=ready-button]').click();
    cy.get('[data-cy="full-screen-icon-button"]').should('exist');
  });
});