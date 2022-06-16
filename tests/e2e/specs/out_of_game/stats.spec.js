import {
  playerOne,
  playerTwo,
  playerThree,
  playerFour,
  playerFive,
} from '../../fixtures/userFixtures';
import { seasonFixtures, matchesFixture } from '../../fixtures/statsFixtures';

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
      const seasons = seasonFixtures.map(season => {
        return {
          ...season,
          firstPlace: season.firstPlace ? this[season.firstPlace] : null,
          secondPlace: season.secondPlace ? this[season.secondPlace] : null,
          thirdPlace: season.thirdPlace ? this[season.thirdPlace] : null,
          fourthPlace: season.fourthPlace ? this[season.fourthPlace] : null,
        };
      });

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
      cy.loadSeasonFixture(seasons);
    });
  cy.vueRoute('/stats');
  // Select Clubs 2022 season
  cy.get('[data-cy=season-select]').click({ force: true });
  cy.get('[role=option]')
    .contains('Clubs 2022')
    .click();
}

describe('Stats Page Error States', () => {
  it('Redirects to login when attempting to navigate to stats while unauthenticated', () => {
    cy.wipeDatabase();
    cy.visit('/#/stats');
    cy.hash().should('eq', '#/login');
  });
});

describe('Stats Page', () => {
  beforeEach(setup);

  it('Displays Headers, Cards, and Table', () => {
    cy.get('[data-cy=selected-season-header]');
    // Tournament Cards
    cy.get('[data-tournament=1st]').should('contain', playerOne.username);
    cy.get('[data-tournament=2nd]').should('contain', playerTwo.username);
    cy.get('[data-tournament=3rd]').should('contain', playerThree.username);
    // Data Table
    cy.get("[points-1='Player1']").contains('5');
    cy.get("[wins-1='Player1']").contains('3');
    cy.get("[wins-1='Player5']").contains('1');
    cy.get('tr.active-user-stats').contains(playerOne.username);
  });

  it('Filters table to display wins, points, or both', () => {
    // 29 columns: username, total_points, total_wins, (points & wins) x 13 weeks
    cy.get('th').should('have.length', 29);
    // Switch to points only
    cy.get('[data-cy=metric-select]').click({ force: true });
    cy.contains('Points Only').click();
    // 15 columns: username, total_points, 1_points, 2_points
    cy.get("[points-1='Player1']").contains('5');
    cy.get("[wins-1='Player1']").should('not.exist');
    cy.get('th').should('have.length', 15);
    // Switch to wins only
    cy.get('[data-cy=metric-select]').click({ force: true });
    cy.contains('Wins Only').click();
    cy.get('th').should('have.length', 15);
    cy.get("[wins-1='Player1']").contains('3');
    cy.get("[points-1='Player1']").should('not.exist');
  });

  it('Filters table to show selected weeks', () => {
    // 29 columns: username, total_points, total_wins, 13 weeks + wins & points
    cy.get('th').should('have.length', 29);
    // Total counts across all weeks
    cy.get('[points-total=Player1]').should('contain', 10);
    cy.get('[wins-total=Player1]').should('contain', 6);
    // Deselect every week except week 1
    cy.get('[data-cy=week-select]').click({ force: true });
    cy.get('[role=option]')
      .contains('Week 2')
      .click();
    cy.get('[role=option]')
      .contains('Week 3')
      .click();
    cy.get('[role=option]')
      .contains('Week 4')
      .click();
    cy.get('[role=option]')
      .contains('Week 5')
      .click();
    cy.get('[role=option]')
      .contains('Week 6')
      .click();
    cy.get('[role=option]')
      .contains('Week 7')
      .click();
    cy.get('[role=option]')
      .contains('Week 8')
      .click();
    cy.get('[role=option]')
      .contains('Week 9')
      .click();
    cy.get('[role=option]')
      .contains('Week 10')
      .click();
    cy.get('[role=option]')
      .contains('Week 11')
      .click();
    cy.get('[role=option]')
      .contains('Week 12')
      .click();
    cy.get('[role=option]')
      .contains('Week 13')
      .click();
    cy.get('body').type('{esc}');

    // Expect 5 columns: username, total_points, total_wins, week_1_points, week_1_wins
    cy.get('th').should('have.length', 5);
    // Total counts should only consider the selected weeks
    cy.get('[points-1=Player1]').should('contain', 5);
    cy.get('[points-total=Player1]').should('contain', 5);
    cy.get('[wins-total=Player1]').should('contain', 3);
  });

  it('Selects different seasons to show their results', () => {
    // Three award cards for Clubs 2022
    cy.get('[data-tournament]').should('have.length', 3);
    // Switch season to diamonds 2022
    cy.get('[data-cy=season-select]').click({ force: true });
    cy.get('[role=option]')
      .contains('Diamonds 2022')
      .click();

    // Award cards should not display (no winners)
    cy.get('[data-tournament]').should('not.exist');

    // Stats data table
    cy.get('[wins-1=Player1]').should('contain', 1);
    cy.get('[points-1=Player1').should('contain', 3);
  });
});
