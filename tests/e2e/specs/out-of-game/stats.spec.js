import { playerOne, playerTwo, playerThree, playerFour, playerFive } from '../../fixtures/userFixtures';
import { seasonFixtures, matchesFixture, gameFixtures } from '../../fixtures/statsFixtures';
import { announcementData } from '../../../../src/routes/home/components/announcementDialog/data/announcementData';
const dayjs = require('dayjs');

function setup() {
  cy.viewport(1980, 1080);
  cy.wipeDatabase();
  cy.visit('/');
  window.localStorage.setItem('announcement', announcementData.id);
  // Signup opponents and store their newly created ids
  cy.signupOpponent(playerOne).as('player1');
  cy.loginPlayer(playerOne);
  cy.signupOpponent(playerTwo).as('player2');
  cy.signupOpponent(playerThree).as('player3');
  cy.signupOpponent(playerFour).as('player4');
  cy.signupOpponent(playerFive)
    .as('player5')
    .then(function () {
      const seasons = seasonFixtures.map((season) => {
        return {
          ...season,
          firstPlace: this[season.firstPlace] ?? null,
          secondPlace: this[season.secondPlace] ?? null,
          thirdPlace: this[season.thirdPlace] ?? null,
          fourthPlace: this[season.fourthPlace] ?? null,
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

      const games = gameFixtures.map((game) => {
        let winner = null;
        if (game.winner) {
          winner = game.winner === game.p0 ? this[game.p0] : this[game.p1];
        }
        return {
          ...game,
          p0: this[game.p0] ?? null,
          p1: this[game.p1] ?? null,
          winner,
        };
      });
      cy.loadMatchFixtures(matches);
      cy.loadSeasonFixture(seasons).as('seasons');
      cy.loadFinishedGameFixtures(games);
    });
  cy.vueRoute('/stats');
  // Select Clubs 2022 season
  cy.get('[data-cy=season-select]').click();
  cy.get('[role=listbox]').contains('Clubs 2022')
    .click();
}

describe('Stats Page Error States', () => {
  it('Redirects to login when attempting to navigate to stats while unauthenticated', () => {
    cy.wipeDatabase();
    cy.visit('/stats');
    cy.location('pathname').should('eq', '/signup');
  });
});

describe('Stats Page', () => {
  beforeEach(setup);

  it('Displays Headers, Cards, and Table', () => {
    const [ seasonOne ] = seasonFixtures;
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
    cy.get("[data-week-2='Player4']").contains('W: 0, P: 1');
    cy.get('tr.active-user-stats').contains(playerOne.username);
    // Player result menus (Week without losses)
    cy.get("[data-week-1='Player1']").click();
    cy.get('[data-players-beaten=Player1-week-1]').should('contain', 'Player2, Player3, Player4');
    cy.get('[data-players-lost-to=Player1-week-1]').should('not.contain', 'Player');
    cy.get('[data-players-lost-to=Player1-week-1]').should('contain', 'None');
    cy.get('[data-player-results=Player1-week-1]').should('contain', 'Player1 Week 1');
    cy.get('[data-win-rate=Player1-week-1]').should('contain', '100%');
    cy.get('[data-win-rate=Player1-week-1]').should('contain', '4 Won');
    cy.get('[data-win-rate=Player1-week-1]').should('contain', '0 Lost');
    cy.get('[data-win-rate=Player1-week-1]').should('contain', '4 Total');
    cy.get('[data-cy=close-player-results]').click();
    cy.get('[data-players-beaten=Player1-week-1').should('not.exist');
    cy.get('[data-players-lost-to=Player1-week-1').should('not.exist');
    // Player result menus (Week with losses)
    cy.get("[data-week-1='Player2']").click();
    cy.get('[data-players-beaten=Player2-week-1]').should('contain', 'Player3, Player4');
    cy.get('[data-players-lost-to=Player2-week-1]').should('contain', 'Player1');
    cy.get('[data-player-results=Player2-week-1]').should('contain', 'Player2 Week 1');
    cy.get('[data-player-results=Player2-week-1]').find('[data-cy=close-player-results]')
      .click();
    cy.get('[data-win-rate=Player2-week-1]').should('contain', '66%');
    cy.get('[data-win-rate=Player2-week-1]').should('contain', '2 Won');
    cy.get('[data-win-rate=Player2-week-1]').should('contain', '1 Lost');
    cy.get('[data-win-rate=Player2-week-1]').should('contain', '3 Total');
    cy.get('[data-players-beaten=Player2-week-1').should('not.exist');
    cy.get('[data-players-lost-to=Player2-week-1').should('not.exist');
    // Player result menus (Total)
    cy.get("[data-week-total='Player3']").click();
    cy.get('[data-players-beaten=Player3-week-total]').should('contain', 'Player5 (2), Player4 (1)');
    cy.get('[data-players-lost-to=Player3-week-total]').should(
      'contain',
      'Player1 (3), Player2 (2), Player4 (1)',
    );
    cy.get('[data-player-results=Player3-week-total]').should('contain', 'Player3 Clubs 2022');
    cy.get('[data-win-rate=Player3-week-total]').should('contain', '33%');
    cy.get('[data-win-rate=Player3-week-total]').should('contain', '3 Won');
    cy.get('[data-win-rate=Player3-week-total]').should('contain', '6 Lost');
    cy.get('[data-win-rate=Player3-week-total]').should('contain', '9 Total');
    cy.get('[data-player-results=Player3-week-total]').find('[data-cy=close-player-results]')
      .click();
    cy.get('[data-players-beaten=Player3-week-total').should('not.exist');
    cy.get('[data-players-lost-to=Player3-week-total').should('not.exist');

    // Players should be sorted in rank order
    cy.get('[data-rank]').eq(0)
      .should('contain', '1');
    cy.get('[data-rank]').eq(1)
      .should('contain', '1');
    cy.get('[data-rank]').eq(2)
      .should('contain', '3');
    cy.get('[data-rank]').eq(3)
      .should('contain', '4');
    cy.get('[data-rank]').eq(4)
      .should('contain', '5');

    // Incomplete match should not contribute to points
    cy.get("[data-week-3='Player1']").should('not.exist');
    cy.get("[data-week-3='Player2']").should('not.exist');
  });

  it('Filters table to display wins, points, or both', () => {
    // 16 columns: username, rank, total, + 13 weeks
    cy.get('th').should('have.length', 16);
    // Switch to points only
    cy.get('[data-cy=metric-select]').click();
    cy.contains('Points Only').click();
    // Only points are displayed
    cy.get("[data-week-1='Player1']").contains('5')
      .should('not.contain', 'W:');
    cy.get('th').should('have.length', 16);
    // Switch to wins only
    cy.get('[data-cy=metric-select]').click();
    cy.contains('Wins Only').click();
    cy.get('th').should('have.length', 16);
    // Only wins are displayed
    cy.get("[data-week-1='Player1']").contains('4')
      .should('not.contain', 'P:');
    cy.get("[points-1='Player1']").should('not.exist');
  });

  it('Filters table to show selected weeks', () => {
    // 16 columns: username, rank, total, 13 weeks
    cy.get('th').should('have.length', 16);
    // Total counts across all weeks
    cy.get('[data-week-total=Player1]').should('contain', 'W: 7, P: 9');
    // Deselect every week except week 1
    cy.get('[data-cy=week-select]').click();
    cy.get('[role=listbox]').contains('Week 2')
      .click();
    cy.get('[role=listbox]').contains('Week 3')
      .click();
    cy.get('[role=listbox]').contains('Week 4')
      .click();
    cy.get('[role=listbox]').contains('Week 5')
      .click();
    cy.get('[role=listbox]').contains('Week 6')
      .click();
    cy.get('[role=listbox]').contains('Week 7')
      .click();
    cy.get('[role=listbox]').contains('Week 8')
      .click();
    cy.get('[role=listbox]').contains('Week 9')
      .click();
    cy.get('[role=listbox]').contains('Week 10')
      .click();
    cy.get('[role=listbox]').contains('Week 11')
      .click();
    cy.get('[role=listbox]').contains('Week 12')
      .click();
    cy.get('[role=listbox]').contains('Week 13')
      .click();
    cy.get('body').type('{esc}');

    // Expect 5 columns: username, rank, total, week_1
    cy.get('th').should('have.length', 4);
    // Total counts should only consider the selected weeks
    cy.get('[data-week-1=Player1]').should('contain', 'W: 4, P: 5');
    cy.get('[data-week-total=Player1]').should('contain', 'W: 7, P: 9');
  });

  it('Selects different seasons to show their results', () => {
    // Three award cards for Clubs 2022
    cy.get('[data-tournament]').should('have.length', 3);
    // Switch season to diamonds 2022
    cy.get('[data-cy=season-select]').click();
    cy.get('[role=listbox]').contains('Diamonds 2022')
      .click();

    // Award cards should not display (no winners)
    cy.get('[data-tournament]').should('not.exist');

    // Stats data table
    cy.get('[data-week-1=Player1]').should('contain', 'W: 1, P: 3');

    // Switch back to Clubs 2022
    cy.get('[data-cy=season-select]').click();
    cy.get('[role=listbox]').contains('Clubs 2022')
      .click();
    // Stats data table
    cy.get('[data-week-total=Player1]').should('contain', 'W: 7, P: 9');
    cy.get('[data-week-2=Player1]').should('contain', 'W: 3, P: 4');
  });

  it('Hides season that should not be available', () => {
    cy.get('[data-cy=season-select]').click();
    cy.get('[role=listbox]').contains('Future Spades Season')
      .should('not.exist');
  });

  it('Hides stats table when matches are not available', () => {
    // Select World Championship
    cy.get('[data-cy=season-select]').click();
    cy.get('[role=listbox]').contains('World Championship Season')
      .click();
    cy.get('[data-cy=stats-leaderboard]').should('not.exist');

    const worldChampionshipSeason = seasonFixtures[seasonFixtures.length - 1];
    // Tournament Data
    cy.get('[data-cy=tournament-bracket-link]').should(
      'have.attr',
      'href',
      worldChampionshipSeason.bracketLink,
    );
    cy.get('[data-cy=tournament-footage-link]').should(
      'have.attr',
      'href',
      worldChampionshipSeason.footageLink,
    );
    // Award Cards
    cy.get('[data-tournament=1st]').should('contain', playerOne.username);
    cy.get('[data-tournament=2nd]').should('contain', playerTwo.username);
    cy.get('[data-tournament=3rd]').should('contain', playerThree.username);
  });

  it('Navigates to correct season by Url, and changes url when season changes', () => {
    cy.get('@seasons').then((seasons) => {
      const [ seasonOne, seasonTwo ] = seasons;
      cy.vueRoute(`/stats/${seasonOne.id}`);
      cy.location('pathname').should('contain', seasonOne.id);
      cy.get('[data-cy=season-select]').should('contain', seasonOne.name)
        .click();
      cy.get('[role=listbox]').contains(seasonTwo.name)
        .click();
      cy.location('pathname').should('contain', seasonTwo.id);
      cy.get('[data-cy=season-select]').should('contain', seasonTwo.name);
    });
  });
});

describe('Usage stats', () => {
  beforeEach(setup);

  it('Displays the site usage stats in the stats usage page', () => {
    cy.get('#usage-stats-section').find('#usage-stats-chart');
  });

  it('Sends the counts of games played and unique players for each week of each season', () => {
    cy.request('http://localhost:1337/api/stats/seasons/current').then(({ body: seasons }) => {
      const populateSeason = (season) => {
        return new Cypress.Promise((resolve, reject) => {
          cy.request(`http://localhost:1337/api/stats/seasons/${season.id}`).then(({ body }) => {
            if (!body) {
              reject(new Error('error populating season'));
            }
            resolve({
              ...season,
              gameCounts: body.gameCounts,
              rankings: body.rankings,
              uniquePlayersPerWeek: body.uniquePlayersPerWeek,
            });
          });
        });
      };

      cy.wrap(
        Cypress.Promise.all(
          seasons.map((season) => {
            if (season.rankings.length) {
              return season;
            }
            return populateSeason(season);
          }),
        ),
      ).then((updatedSeasons) => {
        // Clubs 2022 stats
        const clubs2022 = updatedSeasons.find(({ name }) => name === 'Clubs 2022');
        expect(clubs2022).not.to.be.undefined;
        // Week 1 stats
        expect(clubs2022.gameCounts[0]).to.eq(4);
        expect(clubs2022.uniquePlayersPerWeek[0]).to.eq(3);
        // Week 2 stats
        expect(clubs2022.gameCounts[1]).to.eq(2);
        expect(clubs2022.uniquePlayersPerWeek[1]).to.eq(4);
        // Week 3 stats
        expect(clubs2022.gameCounts[2]).to.eq(0);
        expect(clubs2022.uniquePlayersPerWeek[2]).to.eq(0);
        // Week 3 stats
        expect(clubs2022.gameCounts[3]).to.eq(1);
        expect(clubs2022.uniquePlayersPerWeek[3]).to.eq(2);

        // Diamonds 2022 stats
        const diamonds2022 = updatedSeasons.find(({ name }) => name === 'Diamonds 2022');
        expect(diamonds2022).not.to.be.undefined;
        // Week 1 stats
        expect(diamonds2022.gameCounts[0]).to.eq(1);
        expect(diamonds2022.uniquePlayersPerWeek[0]).to.eq(2);
        // Week 2 stats
        expect(diamonds2022.gameCounts[1]).to.eq(2);
        expect(diamonds2022.uniquePlayersPerWeek[1]).to.eq(2);

        // Current Season stats
        const currentSeason = updatedSeasons.find(({ name }) => name === 'Current Season');
        expect(currentSeason).not.to.be.undefined;
        // Week 1 stats
        expect(currentSeason.gameCounts[0]).to.eq(1);
        expect(currentSeason.uniquePlayersPerWeek[0]).to.eq(2);
        // Week 2 stats
        expect(currentSeason.gameCounts[1]).to.eq(2);
        expect(currentSeason.uniquePlayersPerWeek[1]).to.eq(2);
      });
    });
  });
});
