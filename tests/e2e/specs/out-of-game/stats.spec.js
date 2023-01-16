import { playerOne, playerTwo, playerThree, playerFour, playerFive } from '../../fixtures/userFixtures';
import { seasonFixtures, matchesFixture } from '../../fixtures/statsFixtures';
const dayjs = require('dayjs');

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
    .then(function () {
      const seasons = seasonFixtures.map((season) => {
        return {
          ...season,
          firstPlace: season.firstPlace ? this[season.firstPlace] : null,
          secondPlace: season.secondPlace ? this[season.secondPlace] : null,
          thirdPlace: season.thirdPlace ? this[season.thirdPlace] : null,
          fourthPlace: season.fourthPlace ? this[season.fourthPlace] : null,
        };
      });
      // Convert usernames to ids
      const transformMatchFixture = (match) => {
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
  cy.get('[role=option]').contains('Clubs 2022').click();
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

  it.skip('Displays Headers, Cards, and Table', () => {
    const [seasonOne] = seasonFixtures;
    cy.get('[data-cy=selected-season-header]');
    cy.get('[data-cy=season-start-date').should('contain', dayjs(seasonOne.startTime).format('YYYY/MM/DD'));
    cy.get('[data-cy=season-end-date').should('contain', dayjs(seasonOne.endTime).format('YYYY/MM/DD'));
    // Tournament Data
    cy.get('[data-cy=tournament-bracket-link]').should('have.attr', 'href', seasonOne.bracketLink);
    cy.get('[data-cy=tournament-footage-link]').should('have.attr', 'href', seasonOne.footageLink);
    cy.get('[data-tournament=1st]').should('contain', playerOne.username);
    cy.get('[data-tournament=2nd]').should('contain', playerTwo.username);
    cy.get('[data-tournament=3rd]').should('contain', playerThree.username);
    // Data Table
    cy.get('th').should('have.length', 16);
    cy.get('[data-rank=Player2]').contains(1);
    cy.get("[data-week-1='Player1']").contains('W: 4, P: 5');
    cy.get("[data-week-total='Player1']").contains('W: 7, P: 9');
    cy.get('[data-week-total=Player2]').contains('W: 7, P: 9');
    cy.get("[data-week-1='Player5']").contains('W: 1, P: 3');
    cy.get('tr.active-user-stats').contains(playerOne.username);
    // Player result menus (Week without losses)
    cy.get("[data-week-1='Player1']").click();
    cy.get('[data-players-beaten=Player1-week-1]').should('contain', 'Player2, Player3, Player4');
    cy.get('[data-players-lost-to=Player1-week-1]').should('not.contain', 'Player');
    cy.get('[data-players-lost-to=Player1-week-1]').should('contain', 'None');
    cy.get('[data-player-results=Player1-week-1]').should('contain', 'Player1 Week 1');
    cy.get('[data-player-results=Player1-week-1]').find('[data-cy=close-player-results]').click();
    cy.get('[data-players-beaten=Player1-week-1').should('not.be.visible');
    cy.get('[data-players-lost-to=Player1-week-1').should('not.be.visible');
    cy.get('[data-win-rate=Player1-week-1]').should('contain', '100%');
    cy.get('[data-win-rate=Player1-week-1]').should('contain', '4 Won');
    cy.get('[data-win-rate=Player1-week-1]').should('contain', '0 Lost');
    cy.get('[data-win-rate=Player1-week-1]').should('contain', '4 Total');
    // Player result menus (Week with losses)
    cy.get("[data-week-1='Player2']").click();
    cy.get('[data-players-beaten=Player2-week-1]').should('contain', 'Player3, Player4');
    cy.get('[data-players-lost-to=Player2-week-1]').should('contain', 'Player1');
    cy.get('[data-player-results=Player2-week-1]').should('contain', 'Player2 Week 1');
    cy.get('[data-player-results=Player2-week-1]').find('[data-cy=close-player-results]').click();
    cy.get('[data-players-beaten=Player2-week-1').should('not.be.visible');
    cy.get('[data-players-lost-to=Player2-week-1').should('not.be.visible');
    cy.get('[data-win-rate=Player2-week-1]').should('contain', '66%');
    cy.get('[data-win-rate=Player2-week-1]').should('contain', '2 Won');
    cy.get('[data-win-rate=Player2-week-1]').should('contain', '1 Lost');
    cy.get('[data-win-rate=Player2-week-1]').should('contain', '3 Total');
    // Player result menus (Total)
    cy.get("[data-week-total='Player3']").click();
    cy.get('[data-players-beaten=Player3-week-total]').should('contain', 'Player5 (2), Player4 (1)');
    cy.get('[data-players-lost-to=Player3-week-total]').should(
      'contain',
      'Player1 (3), Player2 (2), Player4 (1)',
    );
    cy.get('[data-player-results=Player3-week-total]').should('contain', 'Player3 Clubs 2022');
    cy.get('[data-player-results=Player3-week-total]').find('[data-cy=close-player-results]').click();
    cy.get('[data-players-beaten=Player3-week-total').should('not.be.visible');
    cy.get('[data-players-lost-to=Player3-week-total').should('not.be.visible');
    cy.get('[data-win-rate=Player3-week-total]').should('contain', '33%');
    cy.get('[data-win-rate=Player3-week-total]').should('contain', '3 Won');
    cy.get('[data-win-rate=Player3-week-total]').should('contain', '6 Lost');
    cy.get('[data-win-rate=Player3-week-total]').should('contain', '9 Total');
  });

  it.skip('Filters table to display wins, points, or both', () => {
    // 16 columns: username, rank, total, + 13 weeks
    cy.get('th').should('have.length', 16);
    // Switch to points only
    // Need 'force' because vuetify injects the data-cy attribute on unclickable <input>
    cy.get('[data-cy=metric-select]').click({ force: true });
    cy.contains('Points Only').click();
    // Only points are displayed
    cy.get("[data-week-1='Player1']").contains('5').should('not.contain', 'W:');
    cy.get('th').should('have.length', 16);
    // Switch to wins only
    cy.get('[data-cy=metric-select]').click({ force: true });
    cy.contains('Wins Only').click();
    cy.get('th').should('have.length', 16);
    // Only wins are displayed
    cy.get("[data-week-1='Player1']").contains('4').should('not.contain', 'P:');
    cy.get("[points-1='Player1']").should('not.exist');
  });

  it.skip('Filters table to show selected weeks', () => {
    // 16 columns: username, rank, total, 13 weeks
    cy.get('th').should('have.length', 16);
    // Total counts across all weeks
    cy.get('[data-week-total=Player1]').should('contain', 'W: 7, P: 9');
    // Deselect every week except week 1
    cy.get('[data-cy=week-select]').click({ force: true });
    cy.get('[role=option]').contains('Week 2').click();
    cy.get('[role=option]').contains('Week 3').click();
    cy.get('[role=option]').contains('Week 4').click();
    cy.get('[role=option]').contains('Week 5').click();
    cy.get('[role=option]').contains('Week 6').click();
    cy.get('[role=option]').contains('Week 7').click();
    cy.get('[role=option]').contains('Week 8').click();
    cy.get('[role=option]').contains('Week 9').click();
    cy.get('[role=option]').contains('Week 10').click();
    cy.get('[role=option]').contains('Week 11').click();
    cy.get('[role=option]').contains('Week 12').click();
    cy.get('[role=option]').contains('Week 13').click();
    cy.get('body').type('{esc}');

    // Expect 5 columns: username, rank, total, week_1
    cy.get('th').should('have.length', 4);
    // Total counts should only consider the selected weeks
    cy.get('[data-week-1=Player1]').should('contain', 'W: 4, P: 5');
    cy.get('[data-week-total=Player1]').should('contain', 'W: 7, P: 9');
  });

  it.skip('Selects different seasons to show their results', () => {
    // Three award cards for Clubs 2022
    cy.get('[data-tournament]').should('have.length', 3);
    // Switch season to diamonds 2022
    cy.get('[data-cy=season-select]').click({ force: true });
    cy.get('[role=option]').contains('Diamonds 2022').click();

    // Award cards should not display (no winners)
    cy.get('[data-tournament]').should('not.exist');

    // Stats data table
    cy.get('[data-week-1=Player1]').should('contain', 'W: 1, P: 3');

    // Switch back to Clubs 2022
    cy.get('[data-cy=season-select]').click({ force: true });
    cy.get('[role=option]').contains('Clubs 2022').click();
    // Stats data table
    cy.get('[data-week-total=Player1]').should('contain', 'W: 7, P: 9');
    cy.get('[data-week-2=Player1]').should('contain', 'W: 3, P: 4');
  });

  it.skip('Hides season that should not be available', () => {
    cy.get('[data-cy=season-select]').click({ force: true });
    cy.get('[role=option]').contains('Future Spades Season').should('not.exist');
  });

  it.skip('Hides stats table when matches are not available', () => {
    // Select World Championship
    cy.get('[data-cy=season-select]').click({ force: true });
    cy.get('[role=option]').contains('World Championship Season').click();
    cy.get('[data-cy=stats-leaderboard]').should('not.exist');

    const worldChampionshipSeason = seasonFixtures[seasonFixtures.length - 1];
    // Tournament Data
    cy.get('[data-cy=tournament-bracket-link]').should(
      'have.attr',
      'href',
      worldChampionshipSeason.bracketLink
    );
    cy.get('[data-cy=tournament-footage-link]').should(
      'have.attr',
      'href',
      worldChampionshipSeason.footageLink
    );
    // Award Cards
    cy.get('[data-tournament=1st]').should('contain', playerOne.username);
    cy.get('[data-tournament=2nd]').should('contain', playerTwo.username);
    cy.get('[data-tournament=3rd]').should('contain', playerThree.username);
  });
});
