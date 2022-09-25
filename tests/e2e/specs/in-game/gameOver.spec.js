import {
  setupGameAsP0,
  setupGameAsP1,
  assertGameState,
  Card,
  username,
  opponentUsername,
} from '../../support/helpers';
import { seasonFixtures } from '../../fixtures/statsFixtures';
import { playerOne, playerTwo } from '../../fixtures/userFixtures';

const dayjs = require('dayjs');

function assertVictory() {
  cy.log('Asserting player victory');
  cy.get('#game-over-dialog')
    .should('be.visible')
    .get('[data-cy=victory-heading]')
    .should('be.visible');
}

function assertLoss() {
  cy.log('Asserting player loss');
  cy.get('#game-over-dialog')
    .should('be.visible')
    .get('[data-cy=loss-heading]')
    .should('be.visible');
  cy.get('[data-cy=loss-img]').should('be.visible');
}

function assertStalemate() {
  cy.log('Asserting stalemate');
  cy.get('#game-over-dialog')
    .should('be.visible')
    .get('[data-cy=stalemate-heading]')
    .should('be.visible');
  cy.get('[data-cy=stalemate-img]').should('be.visible');
}

function goHomeJoinNewGame() {
  cy.log('Going home');
  cy.get('[data-cy=gameover-go-home]').click();
  cy.url().should('not.include', '/game');
  // Re-join game and confirm it loads normally
  setupGameAsP0(true);
  cy.get('#game-over-dialog').should('not.exist');
  cy.get('[data-player-hand-card]').should('have.length', 5);
  cy.log('Joined new game successfully');
}

describe('Winning the game', () => {
  beforeEach(() => {
    setupGameAsP0();
  });

  it('Shows when player wins game with 21 points', () => {
    cy.loadGameFixture({
      p0Hand: [Card.SEVEN_OF_CLUBS],
      p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
    });
    cy.get('[data-player-hand-card]').should('have.length', 1);
    cy.log('Fixture loaded');

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
    cy.loadGameFixture({
      p0Hand: [Card.JACK_OF_CLUBS],
      p0Points: [Card.SEVEN_OF_DIAMONDS],
      p0FaceCards: [Card.KING_OF_SPADES],
      p1Hand: [],
      p1Points: [Card.SEVEN_OF_CLUBS],
      p1FaceCards: [],
      scrap: [Card.TEN_OF_SPADES],
    });
    cy.get('[data-player-hand-card]').should('have.length', 1);
    cy.log('Fixture loaded');

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

  it('Wins the game when opponent concedes', () => {
    cy.loadGameFixture({
      p0Hand: [Card.SEVEN_OF_CLUBS],
      p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
    });
    cy.get('[data-player-hand-card]').should('have.length', 1);
    cy.log('Fixture loaded');

    cy.concedeOpponent();
    assertVictory();
    goHomeJoinNewGame();
  });
});

describe('Losing the game', () => {
  beforeEach(() => {
    setupGameAsP1();
  });

  it('Shows when opponent wins with 21 points', () => {
    cy.loadGameFixture({
      p0Hand: [Card.SEVEN_OF_CLUBS],
      p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
    });
    cy.get('[data-player-hand-card]').should('have.length', 0);
    cy.log('Fixture loaded');

    cy.playPointsOpponent(Card.SEVEN_OF_CLUBS);
    assertLoss();
    goHomeJoinNewGame();
  });

  it('Loses by conceding', () => {
    cy.loadGameFixture({
      p0Hand: [Card.SEVEN_OF_CLUBS],
      p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
    });
    cy.get('[data-player-hand-card]').should('have.length', 0);
    cy.log('Fixture loaded');

    cy.get('#game-menu-activator').click();
    cy.get('#game-menu').should('be.visible').get('[data-cy=concede-initiate]').click();

    // Cancel Concede
    cy.get('#request-gameover-dialog')
      .should('be.visible')
      .get('[data-cy=request-gameover-cancel]')
      .click();
    cy.get('#request-gameover-dialog').should('not.be.visible');
    // Re-open concede menu and confirm concession
    cy.get('#game-menu-activator').click();
    cy.get('#game-menu').should('be.visible').get('[data-cy=concede-initiate]').click();
    cy.get('#request-gameover-dialog')
      .should('be.visible')
      .get('[data-cy=request-gameover-confirm]')
      .click();
    assertLoss();
    goHomeJoinNewGame();
  });
});

describe('Stalemates', () => {
  it('Passes three times for a stalemate', () => {
    setupGameAsP0();
    cy.loadGameFixture({
      p0Hand: [Card.SEVEN_OF_CLUBS],
      p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
    });
    cy.get('[data-player-hand-card]').should('have.length', 1);
    cy.log('Fixture loaded');

    cy.deleteDeck();
    cy.log('Drawing last two cards');
    cy.get('#deck').should('contain', '(2)').click();
    cy.drawCardOpponent();
    cy.log('Deck empty');

    //Pass three times for stalemate
    cy.get('#turn-indicator').contains('YOUR TURN');
    cy.get('#deck').should('contain', '(0)').should('contain', 'PASS').click();
    cy.log('Should log the passing');
    cy.get('#history').contains(`${username} passes`);
    cy.get('#turn-indicator').contains("OPPONENT'S TURN");
    cy.passOpponent();
    cy.get('#history').contains(`${opponentUsername} passes`);
    cy.get('#turn-indicator').contains('YOUR TURN');
    cy.get('#deck').should('contain', '(0)').should('contain', 'PASS').click();

    assertStalemate();
    goHomeJoinNewGame();
  });

  it('Registers stalemate when opponent passes first/last', () => {
    setupGameAsP1();
    cy.loadGameFixture({
      p0Hand: [Card.SEVEN_OF_CLUBS],
      p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
    });
    cy.get('[data-player-hand-card]').should('have.length', 0);
    cy.log('Fixture loaded');

    cy.deleteDeck();
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
      setupGameAsP0();
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
      setupGameAsP1();
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
      setupGameAsP0();
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
      cy.get('#waiting-for-opponent-stalemate-scrim').should('not.be.visible');

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
      cy.get('#waiting-for-opponent-stalemate-scrim').should('not.be.visible');

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
      setupGameAsP1();
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
      setupGameAsP1();
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
      cy.get('#waiting-for-opponent-stalemate-scrim').should('not.be.visible');

      // Opponent requests stalemate
      cy.stalemateOpponent();
      // Player rejects stalemate
      cy.get('#opponent-requested-stalemate-dialog')
        .should('be.visible')
        .find('[data-cy=reject-stalemate]')
        .click();
    });
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
    cy.signupOpponent(playerOne.username, playerOne.password).as('playerOneId');
    cy.signupOpponent(playerTwo.username, playerTwo.password)
      .as('playerTwoId')
      .then(function () {
        // Create match from last week, which current games don't count towards
        const matchFixture = {
          player1: this.playerOneId,
          player2: this.playerTwoId,
          winner: this.playerOneId,
          startTime: dayjs().subtract(1, 'week').subtract(1, 'day').valueOf(),
          endTime: dayjs().subtract(1, 'week').subtract(1, 'day').valueOf(),
        };

        cy.loadMatchFixtures([matchFixture]);
      });
    // Log in as playerOne
    cy.loginPlayer(playerOne.username, playerOne.password);
    setupGameAsP0(true, true);
  });
  it.only('Creates a match when two players play a ranked game for the first time this week', function () {
    // There should be one match initially (from last week)
    cy.request('http://localhost:1337/match').then((res) => {
      expect(res.body.length).to.eq(1);
    });

    // 1st game: Opponent concedes
    cy.concedeOpponent();
    cy.get('[data-cy=gameover-go-home]').click();
    cy.url().should('not.include', '/game');

    // There should now be one match for the two players
    cy.request('http://localhost:1337/match').then((res) => {
      expect(res.body.length).to.eq(2);
      const [, currentMatch] = res.body;
      expect(currentMatch.player1.id).to.eq(this.playerOneId);
      expect(currentMatch.player2.id).to.eq(this.playerTwoId);
      expect(currentMatch.startTime).to.be.greaterThan(0);
      expect(currentMatch.endTime).to.eq(0);
      expect(currentMatch.games.length).to.eq(1);
      expect(currentMatch.games[0].result).to.eq(0); // P0 should have won the first game
      cy.log('Match data is correct after first game', res.body);
    });
    // 2nd game: Player is now p0 and loses by points
    setupGameAsP1(true, true);
    cy.loadGameFixture({
      p0Hand: [Card.ACE_OF_SPADES],
      p0Points: [Card.TEN_OF_SPADES, Card.TEN_OF_HEARTS],
      p0FaceCards: [],
      p1Hand: [Card.THREE_OF_CLUBS],
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
      expect(res.body.length).to.eq(2);
      const [, currentMatch] = res.body;
      expect(currentMatch.player1.id).to.eq(this.playerOneId);
      expect(currentMatch.player2.id).to.eq(this.playerTwoId);
      expect(currentMatch.games.length).to.eq(2);
      expect(currentMatch.startTime).to.be.greaterThan(0);
      // Match is incomplete
      expect(currentMatch.endTime).to.eq(0);
      expect(currentMatch.winner).to.eq(null);
      expect(currentMatch.games[0].result).to.eq(0); // P0 should have won the first game
      expect(currentMatch.games[1].result).to.eq(0); // P1 should have won the first game
      cy.log('Match data is correct after second game', res);
    });

    // 3rd game: Ends via requested stalemate
    setupGameAsP0(true, true);
    // Request stalemate
    cy.get('#game-menu-activator').click();
    cy.get('#game-menu').should('be.visible').get('[data-cy=stalemate-initiate]').click();
    cy.get('#request-gameover-dialog')
      .should('be.visible')
      .get('[data-cy=request-gameover-confirm]')
      .click();
    cy.get('#waiting-for-opponent-stalemate-scrim').should('be.visible');
    // Opponent confirms
    cy.stalemateOpponent();
    cy.get('[data-cy=gameover-go-home]').click();
    cy.url().should('not.include', '/game');

    // Validate match data
    cy.request('http://localhost:1337/match').then((res) => {
      expect(res.body.length).to.eq(2);
      const [, currentMatch] = res.body;
      expect(currentMatch.player1.id).to.eq(this.playerOneId);
      expect(currentMatch.player2.id).to.eq(this.playerTwoId);
      expect(currentMatch.startTime).to.be.greaterThan(0);
      expect(currentMatch.games.length).to.eq(3);
      // Match is incomplete
      expect(currentMatch.endTime).to.eq(0);
      expect(currentMatch.winner).to.eq(null);
      expect(currentMatch.games[2].result).to.eq(2);
      cy.log('Match data is correct after third game', res);
    });

    // 4th game: stalemate due to passing
    setupGameAsP0(true, true);
    cy.loadGameFixture({
      p0Hand: [Card.SEVEN_OF_CLUBS],
      p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
    });
    cy.get('[data-player-hand-card]').should('have.length', 1);
    cy.log('Fixture loaded');

    cy.deleteDeck();
    cy.log('Drawing last two cards');
    cy.get('#deck').should('contain', '(2)').click();
    cy.drawCardOpponent();
    cy.log('Deck empty');
    cy.get('#deck').should('contain', '(0)').should('contain', 'PASS').click();
    cy.get('#turn-indicator').contains("OPPONENT'S TURN");
    cy.passOpponent();
    cy.get('#turn-indicator').contains('YOUR TURN');
    cy.get('#deck').should('contain', '(0)').should('contain', 'PASS').click();
    cy.get('[data-cy=gameover-go-home]').click();
    cy.url().should('not.include', '/game');

    // Validate match data
    cy.request('http://localhost:1337/match').then((res) => {
      expect(res.body.length).to.eq(2);
      const [, currentMatch] = res.body;
      expect(currentMatch.player1.id).to.eq(this.playerOneId);
      expect(currentMatch.player2.id).to.eq(this.playerTwoId);
      expect(currentMatch.startTime).to.be.greaterThan(0);
      expect(currentMatch.games.length).to.eq(4);
      expect(currentMatch.games[3].result).to.eq(2);
      // Match is incomplete
      expect(currentMatch.endTime).to.eq(0);
      expect(currentMatch.winner).to.eq(null);
      cy.log('Match data is correct after fourth game', res);
    });

    // 5th Game: UNRANKED - does not affect match
    setupGameAsP0(true, false);
    cy.loadGameFixture({
      p0Hand: [Card.SEVEN_OF_CLUBS],
      p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
    });
    cy.get('[data-player-hand-card]').should('have.length', 1);
    cy.log('Fixture loaded');

    cy.deleteDeck();
    cy.log('Drawing last two cards');
    cy.get('#deck').should('contain', '(2)').click();
    cy.drawCardOpponent();
    cy.log('Deck empty');
    cy.get('#deck').should('contain', '(0)').should('contain', 'PASS').click();
    cy.get('#turn-indicator').contains("OPPONENT'S TURN");
    cy.passOpponent();
    cy.get('#turn-indicator').contains('YOUR TURN');
    cy.get('#deck').should('contain', '(0)').should('contain', 'PASS').click();
    cy.get('[data-cy=gameover-go-home]').click();
    cy.url().should('not.include', '/game');

    // Validate match data
    cy.request('http://localhost:1337/match').then((res) => {
      expect(res.body.length).to.eq(2);
      const [, currentMatch] = res.body;
      expect(currentMatch.player1.id).to.eq(this.playerOneId);
      expect(currentMatch.player2.id).to.eq(this.playerTwoId);
      expect(currentMatch.startTime).to.be.greaterThan(0);
      expect(currentMatch.games.length).to.eq(4);
      expect(currentMatch.games[3].result).to.eq(2);
      // Match is incomplete
      expect(currentMatch.endTime).to.eq(0);
      expect(currentMatch.winner).to.eq(null);
      cy.log('Match data is correct after fourth game', res);
    });

    // 6th Game: player wins via points and wins match
    setupGameAsP0(true, true);
    cy.loadGameFixture({
      p0Hand: [Card.ACE_OF_SPADES],
      p0Points: [Card.TEN_OF_SPADES, Card.TEN_OF_HEARTS],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
    });
    cy.get('[data-player-hand-card]').should('have.length', 1);
    cy.log('Loaded fixture');

    // Player wins with points
    cy.get('[data-player-hand-card=1-3]').click();
    cy.get('[data-move-choice=points').click();
    cy.get('[data-cy=gameover-go-home]').click();
    cy.url().should('not.include', '/game');

    // Validate match data
    cy.request('http://localhost:1337/match').then((res) => {
      expect(res.body.length).to.eq(2);
      const [, currentMatch] = res.body;
      expect(currentMatch.player1.id).to.eq(this.playerOneId);
      expect(currentMatch.player2.id).to.eq(this.playerTwoId);
      expect(currentMatch.startTime).to.be.greaterThan(0);
      expect(currentMatch.games.length).to.eq(5);
      expect(currentMatch.games[3].result).to.eq(2);
      // Match is complete
      expect(currentMatch.winner.id).to.eq(this.playerOneId);
      expect(currentMatch.endTime).to.be.greaterThan(0);
      cy.log('Match data is correct after fifth game', res);
    });

    // 7th game - should set back to unranked and not add to match
    setupGameAsP0(true, true);
    cy.concedeOpponent();
    cy.get('[data-cy=gameover-go-home]').click();
    cy.url().should('not.include', '/game');

    // Validate match data
    cy.request('http://localhost:1337/match').then((res) => {
      expect(res.body.length).to.eq(2);
      const [oldMatch, currentMatch] = res.body;

      // Expect old match to have no games associated with it
      expect(oldMatch.games.length).to.eq(0);
      expect(currentMatch.player1.id).to.eq(this.playerOneId);
      expect(currentMatch.player2.id).to.eq(this.playerTwoId);
      expect(currentMatch.startTime).to.be.greaterThan(0);
      expect(currentMatch.games.length).to.eq(5);
      expect(currentMatch.games[3].result).to.eq(2);
      // Match is complete
      expect(currentMatch.winner.id).to.eq(this.playerOneId);
      expect(currentMatch.endTime).to.be.greaterThan(0);
      cy.log('Match data is correctly unaffected after sixth game', res);

      // Confirm game was set to unranked
      cy.request('http://localhost:1337/game').then((res) => {
        // Sort games by updatedAt asc
        const games = res.body.sort((game1, game2) => game1.updatedAt - game2.updatedAt);
        expect(games.length).to.eq(7, 'Expected 6 games');
        expect(games[6].ranked).to.eq(
          false,
          'Expected last game to be set to unranked after completion'
        );
      });
    });
  });
});
