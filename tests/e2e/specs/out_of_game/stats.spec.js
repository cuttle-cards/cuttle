import { username, validPassword } from '../../support/helpers';
import { playerOne, playerTwo, playerThree, playerFour } from '../../fixtures/userFixtures';
import { seasonFixture } from '../../fixtures/statsFixtures';

function setup() {
  cy.wipeDatabase();
  cy.visit('/');
  cy.signupPlayer(username, validPassword);
  cy.signupOpponent(playerOne.username, playerOne.password).as('playerOneId');
  cy.signupOpponent(playerTwo.username, playerTwo.password).as('playerTwoId');
  cy.signupOpponent(playerThree.username, playerThree.password).as('playerThreeId');
  cy.signupOpponent(playerFour.username, playerFour.password)
    .as('playerFourId')
    .then(function() {
      const season = {
        ...seasonFixture,
        firstPlace: this.playerOneId,
        secondPlace: this.playerTwoId,
        thirdPlace: this.playerThreeId,
        fourthPlace: this.playerFourId,
      };
    });
  cy.vueRoute('/stats');
}

describe('Stats Page', () => {
  beforeEach(setup);

  it('Displays Headers, Cards, and Table', () => {
    cy.get('[data-cy=selected-season-header]');
    cy.get("[points-1='Player 1']").contains('5');
  });

  it.skip('Filters table to display wins, points, or both', () => {
    expect(true).to.eq(false);
  });

  it.skip('Filters table to show selected weeks', () => {
    expect(true).to.eq(false);
  });

  it.skip('Selects different seasons to show their results', () => {
    expect(true).to.eq(false);
  });

  it.skip('Correctly displays table data for a given season', () => {
    expect(true).to.eq(false);
  });
});
