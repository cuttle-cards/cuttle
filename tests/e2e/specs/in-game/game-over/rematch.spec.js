import {
  assertLoss,
  assertVictory,
  assertStalemate,
  assertGameOverAsSpectator,
  assertGameState,
  rematchPlayerAsSpectator,
} from '../../../support/helpers';
import { seasonFixtures } from '../../../fixtures/statsFixtures';
import { playerOne, playerTwo, playerThree } from '../../../fixtures/userFixtures';
import { Card } from '../../../fixtures/cards';
import { announcementData } from '../../../../../src/routes/home/components/announcementDialog/data/announcementData';

const dayjs = require('dayjs');

function startRematchPlayerFirst() {
  cy.get('[data-cy=my-rematch-indicator]')
    .find('[data-cy="lobby-card-container"]')
    .should('not.have.class', 'ready');

  cy.get('[data-cy=gameover-rematch]').click()
    .should('be.disabled');

  cy.get('[data-cy=continue-match-banner]').should('be.visible')
    .should('contain', 'Waiting for Opponent');

  cy.get('[data-cy=my-rematch-indicator]')
    .find('[data-cy="lobby-card-container"]')
    .should('have.class', 'ready');

  cy.url().then((url) => {
    const oldGameId = Number(url.split('/').pop());
    cy.rematchAndJoinRematchOpponent({ gameId: oldGameId });
  });
}

function concedePlayer() {
  cy.get('#game-menu-activator').click({ force: true });
  cy.get('#game-menu').should('be.visible')
    .get('[data-cy=concede-initiate]')
    .click();
  cy.get('#request-gameover-dialog').should('be.visible')
    .get('[data-cy=request-gameover-confirm]')
    .click();
}

describe('Creating And Updating Ranked Matches With Rematch', () => {
  beforeEach(function () {
    cy.viewport(1920, 1080);
    cy.wipeDatabase();
    cy.visit('/');
    window.localStorage.setItem('announcement', announcementData.id);

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

  it('Wins match played with Rematch/Continue Match button', function () {
    // Game 1: Opponent concedes
    cy.log('Game 1: opponent concedes');
    cy.concedeOpponent();
    assertVictory({ wins: 1, losses: 0, stalemates: 0 });
    cy.get('[data-cy=match-score-counter-wins]').should('contain', 1)
      .should('have.class', 'selected');

    // Neither player has requested rematch yet
    cy.get('[data-cy=my-rematch-indicator]')
      .find('[data-cy="lobby-card-container"]')
      .should('not.have.class', 'ready');
    cy.get('[data-cy=opponent-rematch-indicator]')
      .find('[data-cy="lobby-card-container"]')
      .should('not.have.class', 'ready');

    cy.url().then((url) => {
      const oldGameId = Number(url.split('/').pop());
      cy.rematchOpponent({ gameId: oldGameId, rematch: true });

      // Player hits rematch and starts new game
      cy.get('[data-cy=my-rematch-indicator]')
        .find('[data-cy="lobby-card-container"]')
        .should('not.have.class', 'ready');
      cy.get('[data-cy=gameover-rematch]').click();

      cy.joinRematchOpponent({ oldGameId });
    });

    // Match should be incomplete with one game
    cy.request('http://localhost:1337/api/test/match').then((res) => {
      expect(res.body.length).to.eq(3);
      const [ , , currentMatch ] = res.body;
      expect(currentMatch.player1.id).to.eq(this.playerOneId);
      expect(currentMatch.player2.id).to.eq(this.playerTwoId);
      expect(currentMatch.startTime).to.not.eq(null);
      expect(currentMatch.endTime).to.eq(null);
      expect(currentMatch.games.length).to.eq(1);
    });

    // Game 2: Player concedes
    cy.log('Game 2: Player concedes');
    cy.get('[data-player-hand-card]').should('have.length', 6);

    concedePlayer();
    assertLoss({ wins: 1, losses: 1, stalemates: 0 });

    // Match should be incomplete with two games
    cy.request('http://localhost:1337/api/test/match').then((res) => {
      expect(res.body.length).to.eq(3);
      const [ , , currentMatch ] = res.body;
      expect(currentMatch.player1.id).to.eq(this.playerOneId);
      expect(currentMatch.player2.id).to.eq(this.playerTwoId);
      expect(currentMatch.games.length).to.eq(2);
      expect(currentMatch.startTime).to.not.eq(null);
      // Match is incomplete
      expect(currentMatch.endTime).to.eq(null);
      expect(currentMatch.winner).to.eq(null);
    });

    // Game 3 - Stalemate
    cy.log('Game 3: stalemate via player request');
    startRematchPlayerFirst();
    cy.get('[data-player-hand-card]').should('have.length', 5);

    // Opponent requests stalemate
    cy.stalemateOpponent();

    // Player accepts stalemate
    cy.get('#opponent-requested-stalemate-dialog')
      .should('be.visible')
      .find('[data-cy=accept-stalemate]')
      .click();

    assertStalemate({ wins: 1, losses: 1, stalemates: 1 });

    // Match should be incomplete with three games
    cy.request('http://localhost:1337/api/test/match').then((res) => {
      expect(res.body.length).to.eq(3);
      const [ , , currentMatch ] = res.body;
      expect(currentMatch.player1.id).to.eq(this.playerOneId);
      expect(currentMatch.player2.id).to.eq(this.playerTwoId);
      expect(currentMatch.games.length).to.eq(3);
      expect(currentMatch.startTime).to.not.eq(null);
      // Match is incomplete
      expect(currentMatch.endTime).to.eq(null);
      expect(currentMatch.winner).to.eq(null);
    });

    // Game 4 - Player wins match
    startRematchPlayerFirst();
    cy.get('[data-player-hand-card]').should('have.length', 6);

    cy.concedeOpponent();
    assertVictory({ wins: 2, losses: 1, stalemates: 1 });

    // Rematch button and indicators should not display (match is over)
    cy.get('[data-cy=gameover-rematch]').should('not.exist');
    cy.get('[data-cy=my-rematch-indicator]').should('not.exist');
    cy.get('[data-cy=opponent-rematch-indicator]').should('not.exist');

    // Player1 won and Player2 lost
    cy.get('[data-cy=player-match-result]').find('[data-cy-result-img=won]');
    cy.get('[data-cy=opponent-match-result]').find('[data-cy-result-img=lost]');

    // Match should be completed with 4 games
    cy.request('http://localhost:1337/api/test/match').then((res) => {
      expect(res.body.length).to.eq(3);
      const [ , , currentMatch ] = res.body;
      expect(currentMatch.player1.id).to.eq(this.playerOneId);
      expect(currentMatch.player2.id).to.eq(this.playerTwoId);
      expect(currentMatch.games.length).to.eq(4);
      expect(currentMatch.startTime).to.not.eq(null);
      // Match is over - Player1 wins
      expect(currentMatch.endTime).to.not.eq(null);
      expect(currentMatch.winner.id).to.eq(this.playerOneId);
    });
  });

  it('Loses a ranked match played with the Rematch/Continue Match button', () => {
    // Game 1 - Player concedes
    concedePlayer();
    assertLoss({ wins: 0, losses: 1, stalemates: 0 });

    // Game 2 - Opponent concedes
    startRematchPlayerFirst();
    cy.get('[data-player-hand-card]').should('have.length', 6);
    cy.concedeOpponent();
    assertVictory({ wins: 1, losses: 1, stalemates: 0 });

    // Game 3 - Player concedes & loses match
    startRematchPlayerFirst();
    cy.get('[data-player-hand-card]').should('have.length', 5);
    concedePlayer();
    assertLoss({ wins: 1, losses: 2, stalemates: 0 });

    // Player2 won and Player1 (visible player) lost
    cy.get('[data-cy=player-match-result]')
      .should('contain', 'Player1')
      .find('[data-cy-result-img=lost]')
      .should('have.attr', 'alt', 'Player1 lost the match');
    cy.get('[data-cy=opponent-match-result]')
      .should('contain', 'Player2')
      .find('[data-cy-result-img=won]')
      .should('have.attr', 'alt', 'Player2 won the match');
  });

  it('Shows when opponent declines continuing your ranked match', () => {
    cy.concedeOpponent();
    assertVictory({ wins: 1, losses: 0, stalemates: 0 });

    cy.url().then((url) => {
      const oldGameId = Number(url.split('/').pop());
      // Opponent declines rematch
      cy.rematchOpponent({ gameId: oldGameId, rematch: false });
    });
  });
});

describe('Creating And Updating Casual Games With Rematch', () => {
  beforeEach(function () {
    cy.viewport(1920, 1080);
    cy.wipeDatabase();
    cy.visit('/');
    window.localStorage.setItem('announcement', announcementData.id);

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
    // Game 1: Opponent concedes
    cy.concedeOpponent();
    assertVictory({ wins: 1, losses: 0, stalemates: 0 });

    // Game 2: Player concedes
    startRematchPlayerFirst();
    cy.get('[data-player-hand-card]').should('have.length', 6);

    // Snackbar about empty deck should not appear
    cy.get('[data-cy=game-snackbar] .v-snackbar__wrapper').should('not.exist');

    concedePlayer();
    assertLoss({ wins: 1, losses: 1, stalemates: 0 });

    // Game 3: Player wins with points
    startRematchPlayerFirst();
    cy.get('[data-player-hand-card]').should('have.length', 5);
    cy.loadGameFixture(0, {
      p0Hand: [ Card.TEN_OF_DIAMONDS ],
      p0Points: [ Card.TEN_OF_HEARTS, Card.TEN_OF_SPADES ],
      p0FaceCards: [],
      p1Hand: [ Card.THREE_OF_CLUBS ],
      p1Points: [],
      p1FaceCards: [],
    });

    cy.get('[data-player-hand-card=10-1]').click();
    cy.get('[data-move-choice=points]').click();
    assertVictory({ wins: 2, losses: 1, stalemates: 0 });

    // Game 4: Stalemate via passes
    startRematchPlayerFirst();
    cy.get('[data-player-hand-card]').should('have.length', 6);

    cy.loadGameFixture(1, {
      p0Hand: [ Card.TEN_OF_DIAMONDS ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [ Card.TEN_OF_SPADES ],
      p1Points: [],
      p1FaceCards: [],
      topCard: Card.ACE_OF_CLUBS,
      secondCard: Card.ACE_OF_DIAMONDS,
      deck: [],
    });

    cy.log('Drawing last two cards');
    cy.drawCardOpponent();
    cy.get('#deck').should('contain', '(1)')
      .click();
    cy.log('Deck empty');

    assertGameState(1, {
      p0Hand: [ Card.TEN_OF_DIAMONDS, Card.ACE_OF_CLUBS ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [ Card.TEN_OF_SPADES, Card.ACE_OF_DIAMONDS ],
      p1Points: [],
      p1FaceCards: [],
      scrap: [ Card.TWO_OF_CLUBS, Card.THREE_OF_CLUBS, Card.FOUR_OF_CLUBS, Card.FIVE_OF_CLUBS,
        Card.SIX_OF_CLUBS, Card.SEVEN_OF_CLUBS, Card.EIGHT_OF_CLUBS, Card.NINE_OF_CLUBS,
        Card.TEN_OF_CLUBS, Card.JACK_OF_CLUBS, Card.QUEEN_OF_CLUBS, Card.KING_OF_CLUBS,
        Card.TWO_OF_DIAMONDS, Card.THREE_OF_DIAMONDS, Card.FOUR_OF_DIAMONDS, Card.FIVE_OF_DIAMONDS,
        Card.SIX_OF_DIAMONDS, Card.SEVEN_OF_DIAMONDS, Card.EIGHT_OF_DIAMONDS, Card.NINE_OF_DIAMONDS,
        Card.JACK_OF_DIAMONDS, Card.QUEEN_OF_DIAMONDS, Card.KING_OF_DIAMONDS, Card.ACE_OF_HEARTS,
        Card.TWO_OF_HEARTS, Card.THREE_OF_HEARTS, Card.FOUR_OF_HEARTS, Card.FIVE_OF_HEARTS,
        Card.SIX_OF_HEARTS, Card.SEVEN_OF_HEARTS, Card.EIGHT_OF_HEARTS, Card.NINE_OF_HEARTS,
        Card.TEN_OF_HEARTS, Card.JACK_OF_HEARTS, Card.QUEEN_OF_HEARTS, Card.KING_OF_HEARTS,
        Card.ACE_OF_SPADES, Card.TWO_OF_SPADES, Card.THREE_OF_SPADES, Card.FOUR_OF_SPADES,
        Card.FIVE_OF_SPADES, Card.SIX_OF_SPADES, Card.SEVEN_OF_SPADES, Card.EIGHT_OF_SPADES,
        Card.NINE_OF_SPADES, Card.JACK_OF_SPADES, Card.QUEEN_OF_SPADES, Card.KING_OF_SPADES ]
    });

    // Players pass to end game
    cy.passOpponent();
    cy.get('#turn-indicator').contains('YOUR TURN');
    cy.get('#deck').should('contain', '(0)')
      .should('contain', 'PASS')
      .click();
    cy.get('#turn-indicator').contains("OPPONENT'S TURN");
    cy.passOpponent();

    assertStalemate({ wins: 2, losses: 1, stalemates: 1 });
    // Opponent leaves
    cy.url().then((url) => {
      const oldGameId = Number(url.split('/').pop());
      cy.rematchOpponent({ gameId: oldGameId, rematch: false });
    });
  });
});

describe('Spectating Rematches', () => {
  describe('Spectating Casual Rematches', () => {
    beforeEach(() => {
      cy.viewport(1920, 1080);
      cy.setupGameAsSpectator();
      window.localStorage.setItem('announcement', announcementData.id);
    });

    it('Spectates a casual match using rematch', () => {
      cy.skipOnGameStateApi();
      cy.log('Game 1: player1 wins via opponent conceding');
      cy.recoverSessionOpponent(playerTwo);
      cy.concedeOpponent();
      assertGameOverAsSpectator({ p1Wins: 1, p2Wins: 0, stalemates: 0, winner: 'p1', isRanked: false });

      // P0 and P1 request rematch, then spectator
      rematchPlayerAsSpectator(playerTwo);
      rematchPlayerAsSpectator(playerOne);

      // Wait to confirm dialog stays open
      cy.wait(1000);
      cy.get('#game-over-dialog').should('be.visible')
        .find('[data-cy=gameover-rematch]')
        .click();

      // Game 2
      cy.log('Game 2: player1 wins via concede again');
      cy.get('[data-cy=player-username]').should('contain', playerTwo.username);
      cy.recoverSessionOpponent(playerTwo);
      cy.concedeOpponent();

      assertGameOverAsSpectator({ p1Wins: 2, p2Wins: 0, stalemates: 0, winner: 'p1', isRanked: false });
      cy.get('[data-cy=gameover-rematch').should('not.be.disabled')
        .click()
        .should('be.disabled');

      cy.get('[data-cy=continue-match-banner]').should('be.visible')
        .should('contain', 'Waiting for Players');

      rematchPlayerAsSpectator(playerOne);
      rematchPlayerAsSpectator(playerTwo);

      // Game 3 -- Stalemate then player2 declines rematch
      cy.log('Game 3: Stalemate via request stalemate');
      cy.get('[data-cy=player-username]').should('contain', playerOne.username);

      cy.recoverSessionOpponent(playerTwo);
      cy.stalemateOpponent();

      cy.recoverSessionOpponent(playerOne);
      cy.stalemateOpponent();

      cy.get('[data-cy=gameover-rematch').should('not.be.disabled');

      // Player 2 declines rematch
      rematchPlayerAsSpectator(playerTwo, false);

      cy.get('[data-cy=gameover-go-home]').click();
      cy.url().should('not.include', '/spectate');
    });
  });

  describe('Spectating Ranked Matches', () => {
    beforeEach(() => {
      cy.viewport(1920, 1080);
      cy.setupGameAsSpectator(true);
      window.localStorage.setItem('announcement', announcementData.id);
      const [ , , currentSeason ] = seasonFixtures;
      cy.loadSeasonFixture([ currentSeason ]);
    });

    it('Specates a ranked match using rematch', () => {
      cy.skipOnGameStateApi();
      // Game 1: playerOne wins with points
      cy.log('Game 1: player1 wins with points');
      cy.loadGameFixture(0, {
        p0Hand: [ Card.TEN_OF_DIAMONDS ],
        p0Points: [ Card.TEN_OF_HEARTS, Card.TEN_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [ Card.THREE_OF_CLUBS ],
        p1Points: [],
        p1FaceCards: [],
      });

      cy.recoverSessionOpponent(playerOne);
      cy.playPointsSpectator(Card.TEN_OF_DIAMONDS, 0);
      assertGameOverAsSpectator({ p1Wins: 1, p2Wins: 0, stalemates: 0, winner: 'p1', isRanked: true });

      // playerOne rematches, then spectator, then playerTwo
      rematchPlayerAsSpectator(playerTwo);

      cy.get('[data-cy=gameover-rematch').should('not.be.disabled')
        .click()
        .should('be.disabled');

      cy.get('[data-cy=continue-match-banner]').should('be.visible')
        .should('contain', 'Waiting for Players');

      rematchPlayerAsSpectator(playerOne);

      // Game 2: playerTwo wins by playerOne conceding
      cy.log('Game 2: player2 wins via player1 conceding');
      cy.get('[data-cy=player-username]').should('contain', playerTwo.username);

      cy.recoverSessionOpponent(playerOne);
      cy.concedeOpponent();
      assertGameOverAsSpectator({ p1Wins: 1, p2Wins: 1, stalemates: 0, winner: 'p2', isRanked: true });

      // Both players rematch, then spectator
      rematchPlayerAsSpectator(playerTwo);
      rematchPlayerAsSpectator(playerOne);

      cy.get('[data-cy=gameover-rematch').should('not.be.disabled')
        .click();

      // Game 3: stalemate via passes
      cy.log('Game 3: stalemate via passes');
      cy.get('[data-cy=player-username]').should('contain', playerOne.username);

      cy.recoverSessionOpponent(playerOne);

      cy.loadGameFixture(0, {
        p0Hand: [ Card.TEN_OF_DIAMONDS ],
        p0Points: [ Card.TEN_OF_HEARTS, Card.TEN_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [ Card.THREE_OF_CLUBS ],
        p1Points: [],
        p1FaceCards: [],
        deck: [],
      });

      cy.drawCardOpponent();
      cy.get('[data-player-hand-card]').should('have.length', 2);
      cy.recoverSessionOpponent(playerTwo);
      cy.drawCardOpponent();
      cy.get('[data-opponent-hand-card]').should('have.length', 2);
      cy.recoverSessionOpponent(playerOne);
      cy.passOpponent();
      cy.get('#turn-indicator').contains("OPPONENT'S TURN");
      cy.recoverSessionOpponent(playerTwo);
      cy.passOpponent();
      cy.get('#turn-indicator').contains('YOUR TURN');
      cy.recoverSessionOpponent(playerOne);
      cy.passOpponent();

      assertGameOverAsSpectator({ p1Wins: 1, p2Wins: 1, stalemates: 1, winner: null, isRanked: true });

      // Specator requests rematch, then players
      cy.get('[data-cy=gameover-rematch').should('not.be.disabled')
        .click()
        .should('be.disabled');

      cy.get('[data-cy=continue-match-banner]').should('be.visible')
        .should('contain', 'Waiting for Players');

      rematchPlayerAsSpectator(playerOne);
      rematchPlayerAsSpectator(playerTwo);

      // Game 4: players stalemate by requesting stalemate
      cy.log('Game 4: stalemate via stalemate request');
      cy.get('[data-cy=player-username]').should('contain', playerTwo.username);
      cy.recoverSessionOpponent(playerOne);
      cy.stalemateOpponent();
      cy.get('#opponent-requested-stalemate-dialog').should('be.visible');
      cy.recoverSessionOpponent(playerTwo);
      cy.stalemateOpponent();

      assertGameOverAsSpectator({ p1Wins: 1, p2Wins: 1, stalemates: 2, winner: null, isRanked: true });

      // Specator requests rematch, then players
      cy.get('[data-cy=gameover-rematch').should('not.be.disabled')
        .click()
        .should('be.disabled');

      cy.get('[data-cy=continue-match-banner]').should('be.visible')
        .should('contain', 'Waiting for Players');

      rematchPlayerAsSpectator(playerOne);
      rematchPlayerAsSpectator(playerTwo);

      // Game 5 -- playerOne wins the match with points
      cy.log('Game 5: player1 wins via points and wins match');
      cy.get('[data-cy=player-username]').should('contain', playerOne.username);
      cy.recoverSessionOpponent(playerOne);
      cy.loadGameFixture(0, {
        p0Hand: [ Card.FOUR_OF_CLUBS ],
        p0Points: [ Card.TEN_OF_HEARTS ],
        p0FaceCards: [ Card.KING_OF_DIAMONDS ],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
      });

      cy.recoverSessionOpponent(playerOne);
      cy.playPointsSpectator(Card.FOUR_OF_CLUBS, 0);

      assertGameOverAsSpectator({ p1Wins: 2, p2Wins: 1, stalemates: 2, winner: 'p1', isRanked: true });

      cy.get('[data-cy=player-match-result] [data-cy-result-img=won]').should('be.visible');

      cy.get('[data-cy=opponent-match-result] [data-cy-result-img=lost]').should('be.visible');

      // Go home
      cy.get('[data-cy=gameover-rematch').should('not.exist');
      cy.get('[data-cy=gameover-go-home]').click();
      cy.url().should('not.include', '/spectate');
    });

    it('Shows when player1 declines rematch while spectating ranked match', () => {
      cy.skipOnGameStateApi();
      cy.recoverSessionOpponent(playerOne);
      cy.concedeOpponent();
      assertGameOverAsSpectator({ p1Wins: 0, p2Wins: 1, stalemates: 0, winner: 'p2', isRanked: true });
      rematchPlayerAsSpectator(playerOne, false);
    });

    it('Shows when player2 declines rematch while spectating ranked match', () => {
      cy.skipOnGameStateApi();
      cy.recoverSessionOpponent(playerTwo);
      cy.concedeOpponent();
      assertGameOverAsSpectator({ p1Wins: 1, p2Wins: 0, stalemates: 0, winner: 'p1', isRanked: true });
      rematchPlayerAsSpectator(playerTwo, false);
    });

    it('Spectates a ranked match where player 2 wins the match', () => {
      cy.skipOnGameStateApi();
      cy.recoverSessionOpponent(playerOne);
      cy.concedeOpponent();
      assertGameOverAsSpectator({ p1Wins: 0, p2Wins: 1, stalemates: 0, winner: 'p2', isRanked: true });

      // Both players rematch, then spectator
      rematchPlayerAsSpectator(playerOne);
      rematchPlayerAsSpectator(playerTwo);

      cy.get('[data-cy=gameover-rematch').should('not.be.disabled')
        .click();

      cy.get('[data-cy=player-username]').should('contain', playerTwo.username);
      cy.recoverSessionOpponent(playerOne);
      cy.concedeOpponent();

      assertGameOverAsSpectator({ p1Wins: 0, p2Wins: 2, stalemates: 0, winner: 'p2', isRanked: true });

      // Player2 won and Player1 lost
      cy.get('[data-cy=player-match-result]').find('[data-cy-result-img=lost]');
      cy.get('[data-cy=opponent-match-result]').find('[data-cy-result-img=won]');
    });
  });
});
