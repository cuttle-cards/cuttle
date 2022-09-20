const dayjs = require('dayjs');
import { setupGameAsP0, setupGameAsP1, Card } from '../../support/helpers';
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
    const [_clubsSeason, diamondsSeason] = seasonFixtures;
    diamondsSeason.startTime = dayjs().subtract(2, 'week').subtract(1, 'day').valueOf();
    diamondsSeason.endTime = dayjs().add(11, 'weeks').valueOf();
    cy.loadSeasonFixture([diamondsSeason]);
  });
  it.only('Creates a match when two players play a ranked game for the first time this week', function () {
    // There should be no matches initially
    cy.request('http://localhost:1337/match').then((res) => {
      expect(res.body.length).to.eq(0);
    });

    // 1st game: Opponent concedes
    cy.concedeOpponent();
    cy.get('[data-cy=gameover-go-home]').click();
    cy.url().should('not.include', '/game');

    // There should now be one match for the two players
    cy.request('http://localhost:1337/match').then((res) => {
      expect(res.body.length).to.eq(1);
      const [match] = res.body;
      expect(match.player1.id).to.eq(this.playerOneId);
      expect(match.player2.id).to.eq(this.playerTwoId);
      expect(match.startTime).to.be.greaterThan(0);
      expect(match.endTime).to.eq(0);
      expect(match.games.length).to.eq(1);
      expect(match.games[0].result).to.eq(0); // P0 should have won the first game
      cy.log('Match data is correct after first game', res.body);
    });
    // 2nd game: Player is now p1 and loses by points
    setupGameAsP1(true, true);
    // Set Up
    cy.loadGameFixture({
      p0Hand: [Card.ACE_OF_SPADES],
      p0Points: [Card.TEN_OF_SPADES, Card.TEN_OF_HEARTS],
      p0FaceCards: [],
      p1Hand: [Card.ACE_OF_DIAMONDS],
      p1Points: [],
      p1FaceCards: [],
    });
    cy.get('[data-player-hand-card]').should('have.length', 1);
    cy.log('Loaded fixture');

    // Opponent wins with points
    cy.playPointsOpponent(Card.ACE_OF_SPADES);
    cy.get('[data-cy=gameover-go-home]').click();
    cy.url().should('not.include', '/game');

    // The match for these two players should now have two games
    cy.request('http://localhost:1337/match').then((res) => {
      expect(res.body.length).to.eq(1);
      const [match] = res.body;
      expect(match.player1.id).to.eq(this.playerOneId);
      expect(match.player2.id).to.eq(this.playerTwoId);
      expect(match.startTime).to.be.greaterThan(0);
      expect(match.endTime).to.eq(0);
      expect(match.games.length).to.eq(2);
      expect(match.games[0].result).to.eq(0); // P0 should have won the first game
      cy.log('Match data is correct after second game', res);
    });
  });

  it('Adds games to the existing match for this week between players and sets winner appropriately', () => {});
  it('Sets game back to unranked and does not update match if the relevant match is already completed', () => {});
  it('Creates a new match if the week changes before the match concludes', () => {});
  it('Does not create or update matches for unranked games', () => {});
});
