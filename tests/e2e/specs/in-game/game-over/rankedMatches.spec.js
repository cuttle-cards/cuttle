import GameStatus from '../../../../../utils/GameStatus.json';
import { assertLoss, assertVictory, assertStalemate } from '../../../support/helpers';
import { seasonFixtures } from '../../../fixtures/statsFixtures';
import { playerOne, playerTwo, playerThree } from '../../../fixtures/userFixtures';
import { Card } from '../../../fixtures/cards';

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

function validateMatchResult(match, length, p1, p2, winnerId) {
  expect(match.player1.id).to.eq(p1);
  expect(match.player2.id).to.eq(p2);
  expect(match.startTime).to.not.eq(null);
  expect(match.games.length).to.eq(length);
  if (winnerId) {
    expect(match.winner.id).to.eq(winnerId);
    expect(match.endTime).to.not.eq(null);
  }
}

function validateGameResult({ status, winner }, expectedWinner) {
  cy.expect(status).to.eq(GameStatus.FINISHED);
  cy.expect(winner).to.eq(expectedWinner);
}

describe('Creating And Updating Ranked Matches', () => {
  beforeEach(function () {
    cy.wipeDatabase();
    cy.visit('/');

    // Set up season
    const [ , diamondsSeason ] = seasonFixtures;
    diamondsSeason.startTime = dayjs.utc().subtract(2, 'week')
      .subtract(1, 'day')
      .toDate();
    diamondsSeason.endTime = dayjs.utc().add(11, 'weeks')
      .toDate();
    cy.loadSeasonFixture([ diamondsSeason ]);
    // Sign up to players and store their id's for comparison to match data
    cy.signupOpponent(playerOne).as('playerOneId');
    cy.signupOpponent(playerThree).as('playerThreeId');
    // Opponent will be player 2 (the last one we log in as)
    cy.signupOpponent(playerTwo)
      .as('playerTwoId')
      .then(function () {
        // Create match from last week, which current games don't count towards
        const oldMatchBetweenPlayers = {
          player1: this.playerOneId,
          player2: this.playerTwoId,
          winner: this.playerOneId,
          startTime: dayjs.utc().subtract(1, 'week')
            .subtract(1, 'day')
            .toDate(),
          endTime: dayjs.utc().subtract(1, 'week')
            .subtract(1, 'day')
            .toDate(),
        };

        const currentMatchWithDifferentOpponent = {
          player1: this.playerOneId,
          player2: this.playerThreeId,
          winner: null,
          startTime: dayjs.utc().subtract(1, 'hour')
            .toDate(),
          endTime: dayjs.utc().subtract(1, 'hour')
            .toDate(),
        };

        cy.loadMatchFixtures([ oldMatchBetweenPlayers, currentMatchWithDifferentOpponent ]);
      });
    // Log in as playerOne
    cy.loginPlayer(playerOne);
    cy.setupGameAsP0(true, true);
  });

  it('Leaves a ranked game after first game of match', function () {
    // There should be two matches initially (one from last week and one with a different opponent)
    cy.request('http://localhost:1337/api/test/match').then((res) => {
      expect(res.body.length).to.eq(2);
    });

    // 1st game: Opponent concedes
    cy.concedeOpponent();
    assertVictory();
    cy.window()
      .its('cuttle.gameStore')
      .then((game) => {
        const winners = game.currentMatch.games.map((g) => g.winner);
        cy.expect(winners[0]).to.eq(game.players[0].id);
      });
    cy.get('[data-cy=gameover-rematch]').click();

    cy.get('[data-cy=my-rematch-indicator]')
      .find('[data-cy="lobby-card-container"]')
      .should('have.class', 'ready');

    cy.window()
      .its('cuttle.gameStore')
      .then((game) => {
        const { p0Rematch } = game;
        const { p1Rematch } = game;

        cy.expect(p0Rematch).to.eq(true);
        cy.expect(p1Rematch).to.eq(null);
      });

    cy.get('[data-cy=gameover-go-home]').click();

    cy.url().should('not.include', '/game');
  });

  it('Creates a match when two players play a ranked game for the first time this week', function () {
    cy.skipOnGameStateApi();
    // There should be two matches initially (one from last week and one with a different opponent)
    cy.request('http://localhost:1337/api/test/match').then((res) => {
      expect(res.body.length).to.eq(2);
    });

    // 1st game: Opponent concedes
    cy.concedeOpponent();
    assertVictory();
    cy.window()
      .its('cuttle.gameStore')
      .then((game) => {
        const results = game.currentMatch.games.map(({ status, winner }) => ({ status, winner }));
        validateGameResult(results[0], this.playerOneId);
      });
    cy.get('[data-cy=gameover-go-home]').click();
    cy.url().should('not.include', '/game');

    // There should now be one match for the two players
    cy.request('http://localhost:1337/api/test/match').then((res) => {
      expect(res.body.length).to.eq(3);
      const [ , , currentMatch ] = res.body;
      validateMatchResult(currentMatch, 1, this.playerOneId, this.playerTwoId);
      expect(currentMatch.endTime).to.eq(null);
      validateGameResult(currentMatch.games[0], this.playerOneId); // P0 should have won the first game
      cy.log('Match data is correct after first game', res.body);
    });
    // 2nd game: Player is now p0 and loses by points
    cy.setupGameAsP1(true, true);
    cy.loadGameFixture(1, {
      p0Hand: [ Card.ACE_OF_SPADES ],
      p0Points: [ Card.TEN_OF_SPADES, Card.TEN_OF_HEARTS ],
      p0FaceCards: [],
      p1Hand: [ Card.THREE_OF_CLUBS ],
      p1Points: [],
      p1FaceCards: [],
    });
    // Opponent wins with points
    cy.playPointsOpponent(Card.ACE_OF_SPADES);
    assertLoss();
    cy.window()
      .its('cuttle.gameStore')
      .then((game) => {
        const results = game.currentMatch.games.map(({ status, winner }) => ({ status, winner }));
        validateGameResult(results[0], this.playerOneId);
        validateGameResult(results[1], this.playerTwoId);
      });
    cy.get('[data-cy=gameover-go-home]').click();
    cy.url().should('not.include', '/game');

    // The match for these two players should now have two games
    cy.request('http://localhost:1337/api/test/match').then((res) => {
      expect(res.body.length).to.eq(3);
      const [ , , currentMatch ] = res.body;
      validateMatchResult(currentMatch, 2, this.playerOneId, this.playerTwoId);
      validateGameResult(currentMatch.games[0], this.playerOneId); // P0 should have won the first game
      validateGameResult(currentMatch.games[1], this.playerTwoId); // P1 should have won the first game
      cy.log('Match data is correct after second game', res);
    });

    // 3rd game: Ends via requested stalemate
    cy.setupGameAsP0(true, true);
    // Request stalemate
    cy.get('#game-menu-activator').click();
    cy.get('#game-menu').should('be.visible')
      .get('[data-cy=stalemate-initiate]')
      .click();
    cy.get('#request-gameover-dialog').should('be.visible')
      .get('[data-cy=request-gameover-confirm]')
      .click();
    cy.get('#waiting-for-opponent-stalemate-scrim').should('be.visible');
    // Opponent confirms
    cy.stalemateOpponent();
    assertStalemate();
    cy.window()
      .its('cuttle.gameStore')
      .then((game) => {
        const results = game.currentMatch.games.map(({ status, winner }) => ({ status, winner }));
        validateGameResult(results[0], this.playerOneId);
        validateGameResult(results[1], this.playerTwoId);
        validateGameResult(results[2], null);
      });
    cy.get('[data-cy=gameover-go-home]').click();
    cy.url().should('not.include', '/game');

    // Validate match data
    cy.request('http://localhost:1337/api/test/match').then((res) => {
      expect(res.body.length).to.eq(3);
      const [ , , currentMatch ] = res.body;
      validateMatchResult(currentMatch, 3, this.playerOneId, this.playerTwoId);
      validateGameResult(currentMatch.games[2], null);
      cy.log('Match data is correct after third game', res);
    });

    // 4th game: stalemate due to passing
    cy.setupGameAsP0(true, true);
    cy.loadGameFixture(0, {
      p0Hand: [ Card.SEVEN_OF_CLUBS ],
      p0Points: [ Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS ],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
      deck: [],
    });

    cy.log('Drawing last two cards');
    cy.get('#deck').should('contain', '(2)')
      .click();
    cy.drawCardOpponent();
    cy.log('Deck empty');
    cy.get('#deck').should('contain', '(0)')
      .should('contain', 'PASS')
      .click();
    cy.get('#turn-indicator').contains("OPPONENT'S TURN");
    cy.passOpponent();
    cy.get('#turn-indicator').contains('YOUR TURN');
    cy.get('#deck').should('contain', '(0)')
      .should('contain', 'PASS')
      .click();
    assertStalemate();
    cy.get('[data-cy=gameover-go-home]').click();
    cy.url().should('not.include', '/game');

    // Validate match data
    cy.request('http://localhost:1337/api/test/match').then((res) => {
      expect(res.body.length).to.eq(3);
      const [ , , currentMatch ] = res.body;
      validateMatchResult(currentMatch, 4, this.playerOneId, this.playerTwoId);
      validateGameResult(currentMatch.games[3], null);
      cy.log('Match data is correct after fourth game', res);
    });

    // 5th Game: UNRANKED - does not affect match
    cy.setupGameAsP0(true, false);
    cy.loadGameFixture(0, {
      p0Hand: [ Card.SEVEN_OF_CLUBS ],
      p0Points: [ Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS ],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
      deck: [],
    });

    cy.log('Drawing last two cards');
    cy.get('#deck').should('contain', '(2)')
      .click();
    cy.drawCardOpponent();
    cy.log('Deck empty');
    cy.get('#deck').should('contain', '(0)')
      .should('contain', 'PASS')
      .click();
    cy.get('#turn-indicator').contains("OPPONENT'S TURN");
    cy.passOpponent();
    cy.get('#turn-indicator').contains('YOUR TURN');
    cy.get('#deck').should('contain', '(0)')
      .should('contain', 'PASS')
      .click();
    assertStalemate();
    cy.get('[data-cy=gameover-go-home]').click();
    cy.url().should('not.include', '/game');

    // Validate match data
    cy.request('http://localhost:1337/api/test/match').then((res) => {
      expect(res.body.length).to.eq(3);
      const [ , , currentMatch ] = res.body;
      validateMatchResult(currentMatch, 4, this.playerOneId, this.playerTwoId);
      validateGameResult(currentMatch.games[3], null);
      // Match is incomplete
      expect(currentMatch.winner).to.eq(null);
      cy.log('Match data is correct after fourth game', res);
    });

    // 6th Game: player wins via points and wins match
    cy.setupGameAsP0(true, true);
    cy.loadGameFixture(0, {
      p0Hand: [ Card.ACE_OF_SPADES ],
      p0Points: [ Card.TEN_OF_SPADES, Card.TEN_OF_HEARTS ],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
    });

    // Player wins with points
    cy.get('[data-player-hand-card=1-3]').click();
    cy.get('[data-move-choice=points').click();
    assertVictory();

    cy.get('[data-cy=gameover-go-home]').click();
    cy.url().should('not.include', '/game');

    // Validate match data
    cy.request('http://localhost:1337/api/test/match').then((res) => {
      expect(res.body.length).to.eq(3);
      const [ , , currentMatch ] = res.body;
      validateMatchResult(currentMatch, 5, this.playerOneId, this.playerTwoId, this.playerOneId);
      validateGameResult(currentMatch.games[3], null);
      // Match is complete
      cy.log('Match data is correct after fifth game', res);
    });

    // 7th game - should set back to unranked and not add to match
    cy.setupGameAsP0(true, true);
    cy.concedeOpponent();
    cy.get('[data-cy=gameover-go-home]').click();
    cy.url().should('not.include', '/game');

    // Validate match data
    cy.request('http://localhost:1337/api/test/match').then((res) => {
      expect(res.body.length).to.eq(3);
      const [ oldMatch, , currentMatch ] = res.body;

      // Expect old match to have no games associated with it
      expect(oldMatch.games.length).to.eq(0);
      validateMatchResult(currentMatch, 5, this.playerOneId, this.playerTwoId, this.playerOneId);
      validateGameResult(currentMatch.games[3], null);
      // Match is complete
      cy.log('Match data is correctly unaffected after sixth game', res);

      // Confirm game was set to unranked
      cy.request('http://localhost:1337/api/test/game').then((res) => {
        // Sort games by updatedAt asc
        const games = res.body.sort((game1, game2) => game1.updatedAt - game2.updatedAt);
        expect(games.length).to.eq(7, 'Expected 7 games');
        expect(games[6].isRanked).to.eq(false, 'Expected last game to be set to unranked after completion');
      });
    });
  });
});
