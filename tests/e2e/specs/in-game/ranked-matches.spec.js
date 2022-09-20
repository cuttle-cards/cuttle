const dayjs = require('dayjs');
import { setupGameAsP0 } from '../../support/helpers';
import { seasonFixtures } from '../../fixtures/statsFixtures';
import { playerOne, playerTwo } from '../../fixtures/userFixtures';

describe('Creating And Updating Ranked Matches', () => {
  beforeEach(function () {
    cy.wipeDatabase();
    cy.visit('/');
    // Sign up to players and store their id's for comparison to match data
    cy.signupOpponent(playerOne.username, playerOne.password).as('playerOneId');
    cy.signupOpponent(playerTwo.username, playerTwo.password).as('playerTwoId');
    // Log in as playerOne
    cy.loginPlayer(playerOne.username, playerOne.password);
    setupGameAsP0(true, true);
    // Set up season
    const [clubsSeason, diamondsSeason] = seasonFixtures;
    diamondsSeason.startTime = dayjs().subtract(2, 'week').subtract(1, 'day').valueOf();
    diamondsSeason.endTime = dayjs().add(11, 'weeks').valueOf();
    cy.loadSeasonFixture([diamondsSeason]);
  });
  it.only('Creates a match when two players play a ranked game for the first time this week', () => {
    // Signs up and creates new ranked game
    // There should be no matches initially
    cy.request('http://localhost:1337/match').then((res) => {
      expect(res.body.length).to.eq(0);
    });

    cy.concedeOpponent();
    cy.get('[data-cy=gameover-go-home]').click();
    cy.url().should('not.include', '/game');

    // There should now be one match for the two players
    cy.request('http://localhost:1337/match').then((res) => {
      expect(res.body.length).to.eq(1);
    });
  });

  it('Adds games to the existing match for this week between players and sets winner appropriately', () => {});
  it('Sets game back to unranked and does not update match if the relevant match is already completed', () => {});
  it('Creates a new match if the week changes before the match concludes', () => {});
  it('Does not create or update matches for unranked games', () => {});
});
