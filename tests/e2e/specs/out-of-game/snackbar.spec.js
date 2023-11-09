import { myUser } from '../../fixtures/userFixtures';
import en from '../../../../src/translations/en.json';

describe('Lobby - Page Content of ranked game', () => {
  beforeEach(() => {
    setup();
  });

  it('Changes games type. snackbar is visible', () => {
    //switch to ranked
    clickGameModeSwitch();
    cy.get('[data-cy=edit-snackbar]').should('exist');
    
  });

  it('Changes games type. check appropriate text', () => {
    clickGameModeSwitch();
    cy.get('[data-cy=edit-snackbar]').contains(`${en.lobby.rankedChangedAlert} ${en.global.ranked}`);
    clickGameModeSwitch();
    cy.get('[data-cy=edit-snackbar]').contains(`${en.lobby.rankedChangedAlert} ${en.global.casual}`);
  });

  it('Changes games type. close snackbar', () => {    
    clickGameModeSwitch();
    cy.get('[data-cy=close-snackbar]').click();
    cy.get('[data-cy=edit-snackbar]').should('not.exist');
  });
});

// helper functions

function setup(isRanked = false) {
  cy.wipeDatabase();
  cy.visit('/');
  cy.signupPlayer(myUser);
  cy.createGamePlayer({ gameName: 'Test Game', isRanked }).then((gameSummary) => {
    cy.window()
      .its('cuttle.gameStore')
      .then((store) => store.requestSubscribe(gameSummary.gameId));
    cy.vueRoute(`/lobby/${gameSummary.gameId}`);
    cy.wrap(gameSummary).as('gameSummary');
  });
}

function clickGameModeSwitch() {
  cy.get('[data-cy=edit-game-ranked-switch]').click();
}