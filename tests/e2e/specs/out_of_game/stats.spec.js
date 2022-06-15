import { username, validPassword } from '../../support/helpers';
import {
  playerOne,
  playerTwo,
  playerThree,
  playerFour,
  playerFive,
} from '../../fixtures/userFixtures';
import { seasonFixture, matchesFixture } from '../../fixtures/statsFixtures';

function setup() {
  cy.viewport(1980, 1080);
  cy.wipeDatabase();
  cy.visit('/');
  // Signup opponents and store their newly created ids
  cy.signupOpponent(playerOne.username, playerOne.password).as('player1');
  cy.loginPlayer(playerOne.username, playerOne.password);
  cy.signupOpponent(playerTwo.username, playerTwo.password).as('player2');
  cy.signupOpponent(playerThree.username, playerThree.password).as('player3');
  cy.signupOpponent(playerFour.username, playerFour.password).as('player4');
  cy.signupOpponent(playerFive.username, playerFive.password)
    .as('player5')
    .then(function() {
      const season = {
        ...seasonFixture,
        firstPlace: this.playerOneId,
        secondPlace: this.playerTwoId,
        thirdPlace: this.playerThreeId,
        fourthPlace: this.playerFourId,
      };

      // Convert usernames to ids
      const transformMatchFixture = match => {
        // Grab player ids
        const player1 = this[match.player1];
        const player2 = this[match.player2];
        let winner = null;
        if (match.winner === match.player1) {
          winner = player1;
        } else if (match.winner === match.player2) {
          winner = player2;
        }
        return {
          ...match,
          player1,
          player2,
          winner,
        };
      };
      const matches = matchesFixture.map(transformMatchFixture);
      cy.loadMatchFixtures(matches);
      cy.loadSeasonFixture(season);
    });
  cy.vueRoute('/stats');
}

describe('Stats Page', () => {
  beforeEach(setup);

  it('Displays Headers, Cards, and Table', () => {
    cy.get('[data-cy=selected-season-header]');
    cy.get("[points-1='Player1']").contains('5');
    cy.get("[wins-1='Player1']").contains('3');
    cy.get("[wins-1='Player5']").contains('1');
    cy.get('tr.active-user-stats').contains(playerOne.username);
  });

  it.only('Filters table to display wins, points, or both', () => {
    // 7 columns: username, total_points, total_wins, 2 weeks + wins & points
    cy.get('th').should('have.length', 7);
    // Switch to points only
    cy.get('[data-cy=metric-select]').click({ force: true });
    cy.contains('Points Only').click();
    // 4 columns: username, total_points, 1_points, 2_points
    cy.get("[points-1='Player1']").contains('5');
    cy.get("[wins-1='Player1']").should('not.exist');
    cy.get('th').should('have.length', 4);
    // Switch to wins only
    cy.get('[data-cy=metric-select]').click({ force: true });
    cy.contains('Wins Only').click();
    cy.get('th').should('have.length', 4);
    cy.get("[wins-1='Player1']").contains('3');
    cy.get("[points-1='Player1']").should('not.exist');
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
