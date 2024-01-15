import { assertGameState, assertLoss, assertVictory, assertStalemate } from '../../support/helpers';
import { seasonFixtures } from '../../fixtures/statsFixtures';
import { playerOne, playerTwo, playerThree, myUser, opponentOne } from '../../fixtures/userFixtures';
import { Card } from '../../fixtures/cards';
import GameStatus from '../../../../utils/GameStatus.json';

const dayjs = require('dayjs');

function goHomeJoinNewGame() {
  cy.log('Going home');
  cy.get('[data-cy=gameover-go-home]').click();
  cy.url().should('not.include', '/game');
  // Re-join game and confirm it loads normally
  cy.setupGameAsP0(true);
  cy.get('#game-over-dialog').should('not.exist');
  cy.get('[data-player-hand-card]').should('have.length', 5);
  cy.log('Joined new game successfully');
}

function validateMatchResult(match, length, p1, p2, winnerId) {
  expect(match.player1.id).to.eq(p1);
  expect(match.player2.id).to.eq(p2);
  expect(match.startTime).to.be.greaterThan(0);
  expect(match.games.length).to.eq(length);
  if (winnerId) {
    expect(match.winner.id).to.eq(winnerId);
    expect(match.endTime).to.be.greaterThan(0);
  }
}

function validateGameResult({ status, winner }, expectedWinner) {
  cy.expect(status).to.eq(GameStatus.FINISHED);
  cy.expect(winner).to.eq(expectedWinner);
}

describe('Winning the game', () => {
  beforeEach(() => {
    cy.setupGameAsP0();
  });

  it('Shows when player wins game with 21 points', () => {
    cy.loadGameFixture(0, {
      p0Hand: [Card.SEVEN_OF_CLUBS],
      p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
    });

    // Play Seven of Clubs
    cy.get('[data-player-hand-card=7-0]').click();
    cy.get('[data-move-choice=points]').click();
    assertGameState(0, {
      p0Hand: [],
      p0Points: [Card.SEVEN_OF_CLUBS, Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
    });
    assertVictory();
    goHomeJoinNewGame();
  });

  it('Shows when player wins game with 14 points and one king', () => {
    cy.loadGameFixture(0, {
      p0Hand: [Card.JACK_OF_CLUBS],
      p0Points: [Card.SEVEN_OF_DIAMONDS],
      p0FaceCards: [Card.KING_OF_SPADES],
      p1Hand: [],
      p1Points: [Card.SEVEN_OF_CLUBS],
      p1FaceCards: [],
      scrap: [Card.TEN_OF_SPADES],
    });

    // Play Jack of Clubs
    cy.get('[data-player-hand-card=11-0]').click();
    cy.get('[data-move-choice=jack]').click();
    cy.get('[data-opponent-point-card=7-0]').click();

    assertGameState(0, {
      p0Hand: [],
      p0Points: [Card.SEVEN_OF_CLUBS, Card.SEVEN_OF_DIAMONDS],
      p0FaceCards: [Card.KING_OF_SPADES],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
      scrap: [Card.TEN_OF_SPADES],
    });
    assertVictory();
    goHomeJoinNewGame();
  });

  it('Shows when player wins game with 0 points and four kings', () => {
    cy.loadGameFixture(0, {
      p0Hand: [Card.KING_OF_HEARTS],
      p0Points: [],
      p0FaceCards: [Card.KING_OF_SPADES, Card.KING_OF_CLUBS, Card.KING_OF_DIAMONDS],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
      scrap: [],
    });

    // Play King of Hearts
    cy.get('[data-player-hand-card=13-2]').click();
    cy.get('[data-move-choice=faceCard]').click();

    assertGameState(0, {
      p0Hand: [],
      p0Points: [],
      p0FaceCards: [Card.KING_OF_SPADES, Card.KING_OF_CLUBS, Card.KING_OF_DIAMONDS, Card.KING_OF_HEARTS],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
      scrap: [],
    });
    assertVictory();
    goHomeJoinNewGame();
  });

  it('Wins the game when opponent concedes', () => {
    cy.loadGameFixture(0, {
      p0Hand: [Card.SEVEN_OF_CLUBS],
      p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
    });

    cy.concedeOpponent();
    assertVictory();
    goHomeJoinNewGame();
  });
});

describe('Losing the game', () => {
  beforeEach(() => {
    cy.setupGameAsP1();
  });

  it('Shows when opponent wins with 21 points', () => {
    cy.loadGameFixture(1, {
      p0Hand: [Card.SEVEN_OF_CLUBS],
      p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
    });

    cy.playPointsOpponent(Card.SEVEN_OF_CLUBS);
    assertLoss();
    goHomeJoinNewGame();
  });

  it('Loses by conceding', () => {
    cy.loadGameFixture(1, {
      p0Hand: [Card.SEVEN_OF_CLUBS],
      p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
    });

    cy.get('#game-menu-activator').click();
    cy.get('#game-menu').should('be.visible').get('[data-cy=concede-initiate]').click();

    // Cancel Concede
    cy.get('#request-gameover-dialog').should('be.visible').get('[data-cy=request-gameover-cancel]').click();
    cy.get('#request-gameover-dialog').should('not.be.visible');
    // Re-open concede menu and confirm concession
    cy.get('#game-menu-activator').click();
    cy.get('#game-menu').should('be.visible').get('[data-cy=concede-initiate]').click();
    cy.get('#request-gameover-dialog').should('be.visible').get('[data-cy=request-gameover-confirm]').click();
    assertLoss();
    goHomeJoinNewGame();
  });
});

describe('Stalemates', () => {
  it('Passes three times for a stalemate', () => {
    cy.setupGameAsP0();
    cy.loadGameFixture(0, {
      p0Hand: [Card.SEVEN_OF_CLUBS],
      p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
      deck: [],
    });

    cy.log('Drawing last two cards');
    cy.get('#deck').should('contain', '(2)').click();
    cy.drawCardOpponent();
    cy.log('Deck empty');

    //Pass three times for stalemate
    cy.get('#turn-indicator').contains('YOUR TURN');
    cy.get('#deck').should('contain', '(0)').should('contain', 'PASS').click();
    cy.log('Should log the passing');
    cy.get('#history').contains(`${myUser.username} passes`);
    cy.get('#turn-indicator').contains("OPPONENT'S TURN");
    cy.passOpponent();
    cy.get('#history').contains(`${opponentOne.username} passes`);
    cy.get('#turn-indicator').contains('YOUR TURN');
    cy.get('#deck').should('contain', '(0)').should('contain', 'PASS').click();

    assertStalemate();
    goHomeJoinNewGame();
  });

  it('Registers stalemate when opponent passes first/last', () => {
    cy.setupGameAsP1();
    cy.loadGameFixture(1, {
      p0Hand: [Card.SEVEN_OF_CLUBS],
      p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
      deck: [],
    });

    cy.get('#deck').should('contain', '(2)');
    cy.log('Drawing last two cards');
    cy.drawCardOpponent();
    cy.get('#deck').should('contain', '(1)').click();
    cy.log('Deck empty');

    cy.get('#turn-indicator').contains("OPPONENT'S TURN");
    cy.passOpponent();
    cy.get('#turn-indicator').contains('YOUR TURN');
    cy.get('#deck').should('contain', '(0)').should('contain', 'PASS').click();
    cy.get('#turn-indicator').contains("OPPONENT'S TURN");
    cy.passOpponent();

    assertStalemate();
    goHomeJoinNewGame();
  });

  describe('Requesting a stalemate', () => {
    it('Ends in stalemate when player requests stalemate and opponent agrees', () => {
      cy.setupGameAsP0();
      cy.get('[data-player-hand-card]').should('have.length', 5);
      cy.log('Game loaded');

      cy.get('#game-menu-activator').click();
      cy.get('#game-menu').should('be.visible').get('[data-cy=stalemate-initiate]').click();
      // Cancel Stalemate
      cy.get('#request-gameover-dialog')
        .should('be.visible')
        .get('[data-cy=request-gameover-cancel]')
        .click();

      cy.get('#request-gameover-dialog').should('not.be.visible');

      cy.get('#game-menu-activator').click();
      cy.get('#game-menu').should('be.visible').get('[data-cy=stalemate-initiate]').click();
      // Request Stalemate
      cy.get('#request-gameover-dialog')
        .should('be.visible')
        .get('[data-cy=request-gameover-confirm]')
        .click();

      cy.get('#waiting-for-opponent-stalemate-scrim').should('be.visible');

      cy.stalemateOpponent();
      assertStalemate();
    });

    it('Ends in a stalemate when opponent requests a stalemate and player agrees', () => {
      cy.setupGameAsP1();
      cy.get('[data-player-hand-card]').should('have.length', 6);
      cy.log('Game loaded');

      // Opponent requests stalemate
      cy.stalemateOpponent();

      // Player accepts stalemate
      cy.get('#opponent-requested-stalemate-dialog')
        .should('be.visible')
        .find('[data-cy=accept-stalemate]')
        .click();

      assertStalemate();
    });

    it('Cancels the stalemate when player requests a stalemate and opponent rejects', () => {
      cy.setupGameAsP0();
      cy.get('[data-player-hand-card]').should('have.length', 5);
      cy.log('Game loaded');

      // Request Stalemate
      cy.get('#game-menu-activator').click();
      cy.get('#game-menu').should('be.visible').get('[data-cy=stalemate-initiate]').click();
      cy.get('#request-gameover-dialog')
        .should('be.visible')
        .get('[data-cy=request-gameover-confirm]')
        .click();
      cy.get('#waiting-for-opponent-stalemate-scrim').should('be.visible');

      // Opponent rejects stalemate
      cy.rejectStalemateOpponent();
      cy.get('#waiting-for-opponent-stalemate-scrim').should('not.exist');

      // Player requests stalemate again -- process starts over
      cy.get('#game-menu-activator').click();
      cy.get('#game-menu').should('be.visible').get('[data-cy=stalemate-initiate]').click();
      cy.get('#request-gameover-dialog')
        .should('be.visible')
        .get('[data-cy=request-gameover-confirm]')
        .click();
      cy.get('#waiting-for-opponent-stalemate-scrim').should('be.visible');

      // Opponent rejects stalemate
      cy.rejectStalemateOpponent();
      cy.get('#waiting-for-opponent-stalemate-scrim').should('not.exist');

      // Opponent requests stalemate - Does not immediately stalemate
      cy.stalemateOpponent();
      // Player accepts stalemate
      cy.get('#opponent-requested-stalemate-dialog')
        .should('be.visible')
        .find('[data-cy=accept-stalemate]')
        .click();

      assertStalemate();
    });

    it('Cancels the stalemate when opponent requests and player rejects', () => {
      cy.setupGameAsP1();
      cy.get('[data-player-hand-card]').should('have.length', 6);
      cy.log('Game loaded');

      // Opponent requests stalemate
      cy.stalemateOpponent();

      // Player rejects stalemate
      cy.get('#opponent-requested-stalemate-dialog')
        .should('be.visible')
        .find('[data-cy=reject-stalemate]')
        .click();

      cy.get('#opponent-requested-stalemate-dialog').should('not.be.visible');

      // Opponent requests stalemate again
      cy.stalemateOpponent();

      // Player rejects stalemate
      cy.get('#opponent-requested-stalemate-dialog')
        .should('be.visible')
        .find('[data-cy=reject-stalemate]')
        .click();
    });

    it('Cancels stalemate after an additional turn passes', () => {
      cy.setupGameAsP1();
      cy.get('[data-player-hand-card]').should('have.length', 6);
      cy.log('Game loaded');

      // Request Stalemate
      cy.get('#game-menu-activator').click();
      cy.get('#game-menu').should('be.visible').get('[data-cy=stalemate-initiate]').click();
      cy.get('#request-gameover-dialog')
        .should('be.visible')
        .get('[data-cy=request-gameover-confirm]')
        .click();
      cy.get('#waiting-for-opponent-stalemate-scrim').should('be.visible');

      cy.drawCardOpponent();
      cy.get('#waiting-for-opponent-stalemate-scrim').should('not.exist');

      // Opponent requests stalemate
      cy.stalemateOpponent();
      // Player rejects stalemate
      cy.get('#opponent-requested-stalemate-dialog')
        .should('be.visible')
        .find('[data-cy=reject-stalemate]')
        .click();
    });

    it('Player requests stalemate, then reloads before opponent accepts', () => {
      cy.setupGameAsP1();
      cy.get('#game-menu-activator').click();
      cy.get('#game-menu').should('be.visible').get('[data-cy=stalemate-initiate]').click();
      cy.get('#request-gameover-dialog')
      .should('be.visible')
      .get('[data-cy=request-gameover-confirm]')
        .click();
      cy.get('#waiting-for-opponent-stalemate-scrim').should('be.visible');
      cy.reload();
      cy.get('#waiting-for-opponent-stalemate-scrim').should('be.visible');
      cy.stalemateOpponent();
      assertStalemate();
    });

  });
});

describe('Conceding while a oneOff is being resolved - prevents resolving oneOff state from persisting to new game', () => {
  beforeEach(() => {
    cy.setupGameAsP0();
  });

  it('Opponent concedes while seven oneOff is being resolved', () => {
    cy.loadGameFixture(0, {
      p0Hand: [Card.SEVEN_OF_CLUBS],
      p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
      topCard: Card.FOUR_OF_CLUBS,
      secondCard: Card.SIX_OF_DIAMONDS,
    });

    cy.playOneOffAndResolveAsPlayer(Card.SEVEN_OF_CLUBS);

    cy.get('[data-top-card=4-0]').should('exist').and('be.visible');
    cy.get('[data-second-card=6-1]').should('exist').and('be.visible');

    cy.concedeOpponent();
    assertVictory();
    goHomeJoinNewGame();

    cy.loadGameFixture(0, {
      p0Hand: [Card.SEVEN_OF_CLUBS],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
      topCard: Card.FOUR_OF_CLUBS,
      secondCard: Card.SIX_OF_DIAMONDS,
    });

    cy.get('[data-top-card=4-0]').should('not.exist');
    cy.get('[data-second-card=6-1]').should('not.exist');
  });

  it('Concede game while resolving a four', () => {
    cy.loadGameFixture(0, {
      p0Hand: [Card.FOUR_OF_CLUBS],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
      p1Points: [],
      p1FaceCards: [],
    });

    cy.playOneOffAndResolveAsPlayer(Card.FOUR_OF_CLUBS);

    cy.get('#game-menu-activator').click({ force: true });
    cy.get('#game-menu').should('be.visible').get('[data-cy=concede-initiate]').click();
    cy.get('#request-gameover-dialog').should('be.visible').get('[data-cy=request-gameover-confirm]').click();
    assertLoss();
    goHomeJoinNewGame();

    cy.get('#waiting-for-opponent-discard-scrim').should('not.exist');
  });
});

describe('Creating And Updating Ranked Matches', () => {
  beforeEach(function () {
    cy.wipeDatabase();
    cy.visit('/');

    // Set up season
    const [, diamondsSeason] = seasonFixtures;
    diamondsSeason.startTime = dayjs().subtract(2, 'week').subtract(1, 'day').valueOf();
    diamondsSeason.endTime = dayjs().add(11, 'weeks').valueOf();
    cy.loadSeasonFixture([diamondsSeason]);
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
          startTime: dayjs().subtract(1, 'week').subtract(1, 'day').valueOf(),
          endTime: dayjs().subtract(1, 'week').subtract(1, 'day').valueOf(),
        };

        const currentMatchWithDifferentOpponent = {
          player1: this.playerOneId,
          player2: this.playerThreeId,
          winner: null,
          startTime: dayjs().subtract(1, 'hour').valueOf(),
          endTime: dayjs().subtract(1, 'hour').valueOf(),
        };

        cy.loadMatchFixtures([oldMatchBetweenPlayers, currentMatchWithDifferentOpponent]);
      });
    // Log in as playerOne
    cy.loginPlayer(playerOne);
    cy.setupGameAsP0(true, true);
  });
  it('Creates a match when two players play a ranked game for the first time this week', function () {
    // There should be two matches initially (one from last week and one with a different opponent)
    cy.request('http://localhost:1337/match').then((res) => {
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
    cy.request('http://localhost:1337/match').then((res) => {
      expect(res.body.length).to.eq(3);
      const [, , currentMatch] = res.body;
      validateMatchResult(currentMatch, 1, this.playerOneId, this.playerTwoId);
      expect(currentMatch.endTime).to.eq(null);
      validateGameResult(currentMatch.games[0], this.playerOneId); // P0 should have won the first game
      cy.log('Match data is correct after first game', res.body);
    });
    // 2nd game: Player is now p0 and loses by points
    cy.setupGameAsP1(true, true);
    cy.loadGameFixture(1, {
      p0Hand: [Card.ACE_OF_SPADES],
      p0Points: [Card.TEN_OF_SPADES, Card.TEN_OF_HEARTS],
      p0FaceCards: [],
      p1Hand: [Card.THREE_OF_CLUBS],
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
    cy.request('http://localhost:1337/match').then((res) => {
      expect(res.body.length).to.eq(3);
      const [, , currentMatch] = res.body;
      validateMatchResult(currentMatch, 2, this.playerOneId, this.playerTwoId);
      validateGameResult(currentMatch.games[0], this.playerOneId); // P0 should have won the first game
      validateGameResult(currentMatch.games[1], this.playerTwoId); // P1 should have won the first game
      cy.log('Match data is correct after second game', res);
    });

    // 3rd game: Ends via requested stalemate
    cy.setupGameAsP0(true, true);
    // Request stalemate
    cy.get('#game-menu-activator').click();
    cy.get('#game-menu').should('be.visible').get('[data-cy=stalemate-initiate]').click();
    cy.get('#request-gameover-dialog').should('be.visible').get('[data-cy=request-gameover-confirm]').click();
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
    cy.request('http://localhost:1337/match').then((res) => {
      expect(res.body.length).to.eq(3);
      const [, , currentMatch] = res.body;
      validateMatchResult(currentMatch, 3, this.playerOneId, this.playerTwoId);
      validateGameResult(currentMatch.games[2], null);
      cy.log('Match data is correct after third game', res);
    });

    // 4th game: stalemate due to passing
    cy.setupGameAsP0(true, true);
    cy.loadGameFixture(0, {
      p0Hand: [Card.SEVEN_OF_CLUBS],
      p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
      deck: [],
    });

    cy.log('Drawing last two cards');
    cy.get('#deck').should('contain', '(2)').click();
    cy.drawCardOpponent();
    cy.log('Deck empty');
    cy.get('#deck').should('contain', '(0)').should('contain', 'PASS').click();
    cy.get('#turn-indicator').contains("OPPONENT'S TURN");
    cy.passOpponent();
    cy.get('#turn-indicator').contains('YOUR TURN');
    cy.get('#deck').should('contain', '(0)').should('contain', 'PASS').click();
    assertStalemate();
    cy.get('[data-cy=gameover-go-home]').click();
    cy.url().should('not.include', '/game');

    // Validate match data
    cy.request('http://localhost:1337/match').then((res) => {
      expect(res.body.length).to.eq(3);
      const [, , currentMatch] = res.body;
      validateMatchResult(currentMatch, 4, this.playerOneId, this.playerTwoId);
      validateGameResult(currentMatch.games[3], null);
      cy.log('Match data is correct after fourth game', res);
    });

    // 5th Game: UNRANKED - does not affect match
    cy.setupGameAsP0(true, false);
    cy.loadGameFixture(0, {
      p0Hand: [Card.SEVEN_OF_CLUBS],
      p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
      deck: [],
    });

    cy.log('Drawing last two cards');
    cy.get('#deck').should('contain', '(2)').click();
    cy.drawCardOpponent();
    cy.log('Deck empty');
    cy.get('#deck').should('contain', '(0)').should('contain', 'PASS').click();
    cy.get('#turn-indicator').contains("OPPONENT'S TURN");
    cy.passOpponent();
    cy.get('#turn-indicator').contains('YOUR TURN');
    cy.get('#deck').should('contain', '(0)').should('contain', 'PASS').click();
    assertStalemate();
    cy.get('[data-cy=gameover-go-home]').click();
    cy.url().should('not.include', '/game');

    // Validate match data
    cy.request('http://localhost:1337/match').then((res) => {
      expect(res.body.length).to.eq(3);
      const [, , currentMatch] = res.body;
      validateMatchResult(currentMatch, 4, this.playerOneId, this.playerTwoId);
      validateGameResult(currentMatch.games[3], null);
      // Match is incomplete
      expect(currentMatch.winner).to.eq(null);
      cy.log('Match data is correct after fourth game', res);
    });

    // 6th Game: player wins via points and wins match
    cy.setupGameAsP0(true, true);
    cy.loadGameFixture(0, {
      p0Hand: [Card.ACE_OF_SPADES],
      p0Points: [Card.TEN_OF_SPADES, Card.TEN_OF_HEARTS],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
    });

    // Player wins with points
    cy.get('[data-player-hand-card=1-3]').click();
    cy.get('[data-move-choice=points').click();
    assertVictory();
    cy.get('[data-cy=match-winner-message]').contains('You won');
    cy.get('[data-cy=gameover-go-home]').click();
    cy.url().should('not.include', '/game');

    // Validate match data
    cy.request('http://localhost:1337/match').then((res) => {
      expect(res.body.length).to.eq(3);
      const [, , currentMatch] = res.body;
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
    cy.request('http://localhost:1337/match').then((res) => {
      expect(res.body.length).to.eq(3);
      const [oldMatch, , currentMatch] = res.body;

      // Expect old match to have no games associated with it
      expect(oldMatch.games.length).to.eq(0);
      validateMatchResult(currentMatch, 5, this.playerOneId, this.playerTwoId, this.playerOneId);
      validateGameResult(currentMatch.games[3], null);
      // Match is complete
      cy.log('Match data is correctly unaffected after sixth game', res);

      // Confirm game was set to unranked
      cy.request('http://localhost:1337/game').then((res) => {
        // Sort games by updatedAt asc
        const games = res.body.sort((game1, game2) => game1.updatedAt - game2.updatedAt);
        expect(games.length).to.eq(7, 'Expected 7 games');
        expect(games[6].isRanked).to.eq(false, 'Expected last game to be set to unranked after completion');
      });
    });
  });
});

describe('Creating And Updating Ranked Matches With Rematch', () => {
  beforeEach(function () {
    cy.wipeDatabase();
    cy.visit('/');

    // Set up season
    const [, diamondsSeason] = seasonFixtures;
    diamondsSeason.startTime = dayjs().subtract(2, 'week').subtract(1, 'day').valueOf();
    diamondsSeason.endTime = dayjs().add(11, 'weeks').valueOf();
    cy.loadSeasonFixture([diamondsSeason]);
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
          startTime: dayjs().subtract(1, 'week').subtract(1, 'day').valueOf(),
          endTime: dayjs().subtract(1, 'week').subtract(1, 'day').valueOf(),
        };

        const currentMatchWithDifferentOpponent = {
          player1: this.playerOneId,
          player2: this.playerThreeId,
          winner: null,
          startTime: dayjs().subtract(1, 'hour').valueOf(),
          endTime: dayjs().subtract(1, 'hour').valueOf(),
        };

        cy.loadMatchFixtures([oldMatchBetweenPlayers, currentMatchWithDifferentOpponent]);
      });
    // Log in as playerOne
    cy.loginPlayer(playerOne);
    cy.setupGameAsP0(true, true);
  });
  
  it('Creates a match when two players play a ranked game for the first time this week, finish the match with rematch', function () {
    // There should be two matches initially (one from last week and one with a different opponent)
    cy.request('http://localhost:1337/match').then((res) => {
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
    cy.window()
      .its('cuttle.gameStore')
      .then((game) => {
        const { p0Rematch, p1Rematch } = game;

        cy.expect(p0Rematch).to.eq(true);
        cy.expect(p1Rematch).to.eq(null);
      });
    cy.get('#waiting-for-game-to-start-scrim').should('be.visible');
    cy.window()
      .its('cuttle.gameStore')
      .then((game) => {
        cy.rematchAndJoinRematchOpponent({ gameId: game.id });
      });
    cy.window()
      .its('cuttle.gameStore')
      .then((game) => {
        const { p0Rematch, p1Rematch } = game;

        cy.expect(p0Rematch).to.eq(true);
        cy.expect(p1Rematch).to.eq(null);
        cy.log('game data is correct after first game');
      });

    // There should now be one match for the two players
    cy.request('http://localhost:1337/match').then((res) => {
      expect(res.body.length).to.eq(3);
      const [, , currentMatch] = res.body;
      expect(currentMatch.player1.id).to.eq(this.playerOneId);
      expect(currentMatch.player2.id).to.eq(this.playerTwoId);
      expect(currentMatch.startTime).to.be.greaterThan(0);
      expect(currentMatch.endTime).to.eq(null);
      expect(currentMatch.games.length).to.eq(1);
    });

    cy.log('Starting second game');
    cy.url().should('include', '/game');

    cy.window()
      .its('cuttle.gameStore')
      .then((game) => {
        const { p0Rematch } = game;
        const { p1Rematch } = game;

        cy.expect(p0Rematch).to.eq(null);
        cy.expect(p1Rematch).to.eq(null);
      });

    // 2nd game: Player concedes
    cy.get('#game-menu-activator').click();
    cy.get('#game-menu').should('be.visible').get('[data-cy=concede-initiate]').click();
    cy.get('#request-gameover-dialog').should('be.visible').get('[data-cy=request-gameover-confirm]').click();

    assertLoss();

    cy.window()
      .its('cuttle.gameStore')
      .then((game) => {
        const winners = game.currentMatch.games.map((g) => g.winner);
        cy.expect(winners[1]).to.eq(game.players[0].id);
      });

    cy.log('Opponent requests rematch first');
    cy.url().then((url) => {
      const oldGameId = url.split('/').pop();
      cy.rematchOpponent({ gameId: oldGameId, rematch: true });
      cy.get('#game-over-dialog')
        .should('be.visible')
        .should('contain', 'Player2 wants to rematch')
        .get('[data-cy=gameover-rematch]')
        .click();

      cy.joinRematchOpponent({ oldGameId });
    });

    cy.url().should('include', '/game');

    // The match for these two players should now have two games
    cy.request('http://localhost:1337/match').then((res) => {
      expect(res.body.length).to.eq(3);
      const [, , currentMatch] = res.body;
      expect(currentMatch.player1.id).to.eq(this.playerOneId);
      expect(currentMatch.player2.id).to.eq(this.playerTwoId);
      expect(currentMatch.games.length).to.eq(2);
      expect(currentMatch.startTime).to.be.greaterThan(0);
      // Match is incomplete
      expect(currentMatch.endTime).to.eq(null);
      expect(currentMatch.winner).to.eq(null);
    });

    // 3rd game: Ends via requested stalemate
    // Request stalemate
    cy.get('#game-menu-activator').click();
    cy.get('#game-menu').should('be.visible').get('[data-cy=stalemate-initiate]').click();
    cy.get('#request-gameover-dialog').should('be.visible').get('[data-cy=request-gameover-confirm]').click();
    cy.get('#waiting-for-opponent-stalemate-scrim').should('be.visible');
    // Opponent confirms
    cy.stalemateOpponent();
    assertStalemate();
    
    cy.window()
      .its('cuttle.gameStore')
      .then((game) => {
        const winners = game.currentMatch.games.map((g) => g.winner);
        cy.expect(winners[2]).to.eq(null);
      });

    // Play again
    cy.get('#game-over-dialog').should('be.visible').get('[data-cy=gameover-rematch]').click();
    cy.window()
      .its('cuttle.gameStore')
      .then((game) => {
        cy.rematchAndJoinRematchOpponent({ gameId: game.id });
      });
    cy.url().should('include', '/game');

    // Validate match data
    cy.request('http://localhost:1337/match').then((res) => {
      expect(res.body.length).to.eq(3);
      const [, , currentMatch] = res.body;
      expect(currentMatch.player1.id).to.eq(this.playerOneId);
      expect(currentMatch.player2.id).to.eq(this.playerTwoId);
      expect(currentMatch.startTime).to.be.greaterThan(0);
      expect(currentMatch.games.length).to.eq(3);
      // Match is incomplete
      expect(currentMatch.endTime).to.eq(null);
      expect(currentMatch.winner).to.eq(null);
      cy.log('Match data is correct after third game', res);
    });

    // 4th game
    cy.get('#game-menu-activator').click();
    cy.get('#game-menu').should('be.visible').get('[data-cy=concede-initiate]').click();
    cy.get('#request-gameover-dialog').should('be.visible').get('[data-cy=request-gameover-confirm]').click();
    assertLoss();

    cy.window()
      .its('cuttle.gameStore')
      .then((game) => {
        const winners = game.currentMatch.games.map((g) => g.winner);
        cy.expect(winners[3]).to.eq(game.players[0].id);
      });

    cy.get('#game-over-dialog').should('be.visible').get('[data-cy=gameover-rematch]').click();
    cy.window()
      .its('cuttle.gameStore')
      .then((game) => {
        cy.rematchAndJoinRematchOpponent({ gameId: game.id });
      });
    cy.url().should('include', '/game');

    // Game now should be unranked
    // Validate match data
    cy.request('http://localhost:1337/match').then((res) => {
      expect(res.body.length).to.eq(3);
      const [oldMatch, , currentMatch] = res.body;

      // Expect old match to have no games associated with it
      expect(oldMatch.games.length).to.eq(0);
      expect(currentMatch.player1.id).to.eq(this.playerOneId);
      expect(currentMatch.player2.id).to.eq(this.playerTwoId);
      expect(currentMatch.startTime).to.be.greaterThan(0);
      expect(currentMatch.games.length).to.eq(4);
      // Match is complete
      expect(currentMatch.winner.id).to.eq(this.playerTwoId);
      expect(currentMatch.endTime).to.be.greaterThan(0);
      cy.log('Match data is correctly unaffected after sixth game', res);

      // Confirm game was set to unranked
      cy.request('http://localhost:1337/game').then((res) => {
        // Sort games by updatedAt asc
        const games = res.body.sort((game1, game2) => game1.updatedAt - game2.updatedAt);
        expect(games.length).to.eq(5, 'Expected 5 games');
        expect(games[4].isRanked).to.eq(false, 'Expected last game to be set to unranked after completion');
      });
    });
  });
  
  it('Creates a match when two players play a ranked game for the first time this week, leave game during rematch', function () {
    // There should be two matches initially (one from last week and one with a different opponent)
    cy.request('http://localhost:1337/match').then((res) => {
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
    cy.get('#waiting-for-game-to-start-scrim').should('be.visible');
    cy.window()
      .its('cuttle.gameStore')
      .then((game) => {
        const { p0Rematch } = game;
        const { p1Rematch } = game;

        cy.expect(p0Rematch).to.eq(true);
        cy.expect(p1Rematch).to.eq(null);
      });
    cy.get('[data-cy=leave-unstarted-game-button]').should('be.visible').click();

    cy.url().should('not.include', '/game');
  });
  
  it('Disables the rematch button in the GameOverDialog when opponent declines a rematch before the player makes a choice', function () {
    // There should be two matches initially (one from last week and one with a different opponent)
    cy.request('http://localhost:1337/match').then((res) => {
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
    // Opponent leaves game, we should see rematch button disabled
    cy.window()
      .its('cuttle.gameStore')
      .then((game) => {
        cy.rematchOpponent({ gameId: game.id, rematch: false });
      });
    cy.get('[data-cy=gameover-rematch]').should('be.disabled');
  });
});

describe('Creating And Updating Unranked Matches With Rematch', () => {
  beforeEach(function () {
    cy.wipeDatabase();
    cy.visit('/');

    // Sign up players
    cy.signupOpponent(playerOne).as('playerOneId');
    cy.signupOpponent(playerThree).as('playerThreeId');
    // Opponent will be player 2 (the last one we log in as)
    cy.signupOpponent(playerTwo).as('playerTwoId');

    // Log in as playerOne
    cy.loginPlayer(playerOne);
    cy.setupGameAsP0(true, false);
  });
  
  it('Unranked games with rematch', function () {
    // 1st game: Opponent concedes
    cy.concedeOpponent();
    assertVictory();
    cy.window()
      .its('cuttle.gameStore')
      .then((game) => {
        const results = game.currentMatch;
        cy.expect(results).to.eq(null);
      });
    cy.get('[data-cy=gameover-rematch]').click();
    cy.window()
      .its('cuttle.gameStore')
      .then((game) => {
        const { p0Rematch } = game;
        const { p1Rematch } = game;

        cy.expect(p0Rematch).to.eq(true);
        cy.expect(p1Rematch).to.eq(null);
      });
    cy.get('#waiting-for-game-to-start-scrim').should('be.visible');
    cy.window()
      .its('cuttle.gameStore')
      .then((game) => {
        cy.rematchAndJoinRematchOpponent({ gameId: game.id });
      });
    cy.window()
      .its('cuttle.gameStore')
      .then((game) => {
        const { p0Rematch } = game;
        const { p1Rematch } = game;

        cy.expect(p0Rematch).to.eq(true);
        cy.expect(p1Rematch).to.eq(null);
        cy.log('game data is correct after first game');
      });

    // There should now be NO match for the two players
    cy.request('http://localhost:1337/match').then((res) => {
      expect(res.body.length).to.eq(0);
    });

    cy.log('Starting second game');
    cy.url().should('include', '/game');

    cy.window()
      .its('cuttle.gameStore')
      .then((game) => {
        const { p0Rematch } = game;
        const { p1Rematch } = game;

        cy.expect(p0Rematch).to.eq(null);
        cy.expect(p1Rematch).to.eq(null);
      });

    // 2nd game: Player concedes
    cy.get('#game-menu-activator').click();
    cy.get('#game-menu').should('be.visible').get('[data-cy=concede-initiate]').click();
    cy.get('#request-gameover-dialog').should('be.visible').get('[data-cy=request-gameover-confirm]').click();

    assertLoss();

    cy.log('Opponent requests rematch first');
    cy.window().its('cuttle.gameStore').then((game) => {
      cy.expect(game.name).to.eq('Player1 VS Player2 1-0-0');
    });
    cy.url().then((url) => {
      const oldGameId = url.split('/').pop();
      cy.rematchOpponent({ gameId: oldGameId, rematch: true });

      cy.get('#game-over-dialog')
        .should('be.visible')
        .should('contain', 'Player2 wants to rematch')
        .get('[data-cy=gameover-rematch]')
        .click();
      cy.log('Opponent then joins new game');
      cy.joinRematchOpponent({ oldGameId });
    });

    cy.url().should('include', '/game');

    // 3rd game: Ends via requested stalemate
    // Request stalemate
    cy.get('#game-menu-activator').click();
    cy.get('#game-menu').should('be.visible').get('[data-cy=stalemate-initiate]').click();
    cy.get('#request-gameover-dialog').should('be.visible').get('[data-cy=request-gameover-confirm]').click();
    cy.get('#waiting-for-opponent-stalemate-scrim').should('be.visible');
    // Opponent confirms
    cy.stalemateOpponent();
    assertStalemate();

    // Play again
    cy.get('#game-over-dialog').should('be.visible').get('[data-cy=gameover-rematch]').click();
    cy.window()
      .its('cuttle.gameStore')
      .then((game) => {
        cy.expect(game.name).to.eq('Player1 VS Player2 1-1-0');
        cy.rematchAndJoinRematchOpponent({ gameId: game.id });
      });
    cy.url().should('include', '/game');

    // 4th game
    cy.get('#game-menu-activator').click();
    cy.get('#game-menu').should('be.visible').get('[data-cy=concede-initiate]').click();
    cy.get('#request-gameover-dialog').should('be.visible').get('[data-cy=request-gameover-confirm]').click();
    assertLoss();
    cy.get('#game-over-dialog').should('be.visible').get('[data-cy=gameover-rematch]').click();
    cy.window()
      .its('cuttle.gameStore')
      .then((game) => {
        cy.expect(game.name).to.eq('Player1 VS Player2 1-1-1');
        cy.rematchAndJoinRematchOpponent({ gameId: game.id });
      });
    cy.url().should('include', '/game');
  });
});
