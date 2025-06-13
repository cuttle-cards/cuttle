import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { setupGameBetweenTwoUnseenPlayers, assertGameState, assertGameOverAsSpectator, assertSnackbar } from '../../../support/helpers';
import { myUser, playerOne, playerTwo, playerThree } from '../../../fixtures/userFixtures';
import { Card } from '../../../fixtures/cards';
import { seasonFixtures } from '../../../fixtures/statsFixtures';
import GameStatus from '../../../../../utils/GameStatus.json';

dayjs.extend(utc);

function createAndFinishCasualMatch() {
  setupGameBetweenTwoUnseenPlayers('replay');
  
  cy.get('@replayGameId').then((gameId) => {
    cy.loadGameFixture(0, {
      p0Hand: [
        Card.TEN_OF_CLUBS,
        Card.TEN_OF_DIAMONDS,
        Card.TEN_OF_HEARTS,
        Card.TEN_OF_SPADES,
        Card.ACE_OF_CLUBS
      ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [
        Card.TWO_OF_CLUBS,
        Card.TWO_OF_DIAMONDS,
        Card.TWO_OF_HEARTS,
        Card.TWO_OF_SPADES,
        Card.THREE_OF_CLUBS,
        Card.THREE_OF_DIAMONDS
      ],
      p1Points: [],
      p1FaceCards: [],
      topCard: Card.SEVEN_OF_HEARTS,
      secondCard: Card.FOUR_OF_HEARTS,
    }, gameId);

    cy.recoverSessionOpponent(playerOne);
    cy.playPointsOpponent(Card.TEN_OF_CLUBS, gameId);

    cy.recoverSessionOpponent(playerTwo);
    cy.drawCardOpponent(gameId);

    cy.recoverSessionOpponent(playerOne);
    cy.playPointsOpponent(Card.TEN_OF_DIAMONDS, gameId);

    cy.recoverSessionOpponent(playerTwo);
    cy.drawCardOpponent(gameId);

    cy.recoverSessionOpponent(playerOne);
    cy.playPointsOpponent(Card.TEN_OF_HEARTS, gameId);
    
    // Both players rematch and create new game
    cy.rematchOpponent({ gameId, rematch: true, skipDomAssertion: true });
    cy.recoverSessionOpponent(playerTwo);
    cy.rematchOpponent({ gameId, rematch: true, skipDomAssertion: true });
    cy.get(`@game${gameId}RematchId`).then((rematchGameId) => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.ACE_OF_CLUBS, Card.ACE_OF_DIAMONDS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.TWO_OF_CLUBS, Card.TWO_OF_DIAMONDS ],
        p1Points: [],
        p1FaceCards: [],
        topCard: Card.SEVEN_OF_HEARTS,
        secondCard: Card.FOUR_OF_HEARTS,
      }, rematchGameId);
      
      cy.recoverSessionOpponent(playerOne);
      cy.concedeOpponent(rematchGameId);
      cy.rematchOpponent({ gameId: rematchGameId, rematch: false, skipDomAssertion: true });
    });
  });
}

function rewatchCasualMatch(firstGameId) {
  cy.visit(`/spectate/${firstGameId}`);

  cy.get('[data-player-hand-card]').should('have.length', 5);
  cy.get('[data-cy=history-log]').should('have.length', 1);

  // Step forward to state 1 (loaded fixture)
  cy.get('[data-cy=playback-controls]')
    .find('[data-cy=step-forward]')
    .click();

  cy.url().should('contain', '?gameStateIndex=1');
  cy.get('[data-cy=history-log]').should('have.length', 2);

  assertGameState(0, {
    p0Hand: [ Card.TEN_OF_CLUBS, Card.TEN_OF_DIAMONDS, Card.TEN_OF_HEARTS, Card.TEN_OF_SPADES, Card.ACE_OF_CLUBS ],
    p0Points: [],
    p0FaceCards: [],
    p1Hand: [
      Card.TWO_OF_CLUBS,
      Card.TWO_OF_DIAMONDS,
      Card.TWO_OF_HEARTS,
      Card.TWO_OF_SPADES,
      Card.THREE_OF_CLUBS,
      Card.THREE_OF_DIAMONDS
    ],
    p1Points: [],
    p1FaceCards: [],
  });

  // Step forward to state 2 (p0 points)
  cy.get('[data-cy=playback-controls]')
    .find('[data-cy=step-forward]')
    .click();

  cy.url().should('contain', '?gameStateIndex=2');
  cy.get('[data-cy=history-log]').should('have.length', 3);

  assertGameState(0, {
    p0Hand: [ Card.TEN_OF_DIAMONDS, Card.TEN_OF_HEARTS, Card.TEN_OF_SPADES, Card.ACE_OF_CLUBS ],
    p0Points: [ Card.TEN_OF_CLUBS ],
    p0FaceCards: [],
    p1Hand: [
      Card.TWO_OF_CLUBS,
      Card.TWO_OF_DIAMONDS,
      Card.TWO_OF_HEARTS,
      Card.TWO_OF_SPADES,
      Card.THREE_OF_CLUBS,
      Card.THREE_OF_DIAMONDS
    ],
    p1Points: [],
    p1FaceCards: [],
  });

  // Step forward to state 3 (p1 draw)
  cy.get('[data-cy=playback-controls]')
    .find('[data-cy=step-forward]')
    .click();

  cy.url().should('contain', '?gameStateIndex=3');
  cy.get('[data-cy=history-log]').should('have.length', 4);

  assertGameState(0, {
    p0Hand: [ Card.TEN_OF_DIAMONDS, Card.TEN_OF_HEARTS, Card.TEN_OF_SPADES, Card.ACE_OF_CLUBS ],
    p0Points: [ Card.TEN_OF_CLUBS ],
    p0FaceCards: [],
    p1Hand: [
      Card.TWO_OF_CLUBS,
      Card.TWO_OF_DIAMONDS,
      Card.TWO_OF_HEARTS,
      Card.TWO_OF_SPADES,
      Card.THREE_OF_CLUBS,
      Card.THREE_OF_DIAMONDS,
      Card.SEVEN_OF_HEARTS,
    ],
    p1Points: [],
    p1FaceCards: [],
  });

  // Step backward to state 2 again (p0 points)
  cy.get('[data-cy=playback-controls]')
    .find('[data-cy=step-backward]')
    .click();

  cy.url().should('contain', '?gameStateIndex=2');
  cy.get('[data-cy=history-log]').should('have.length', 3);

  assertGameState(0, {
    p0Hand: [ Card.TEN_OF_DIAMONDS, Card.TEN_OF_HEARTS, Card.TEN_OF_SPADES, Card.ACE_OF_CLUBS ],
    p0Points: [ Card.TEN_OF_CLUBS ],
    p0FaceCards: [],
    p1Hand: [
      Card.TWO_OF_CLUBS,
      Card.TWO_OF_DIAMONDS,
      Card.TWO_OF_HEARTS,
      Card.TWO_OF_SPADES,
      Card.THREE_OF_CLUBS,
      Card.THREE_OF_DIAMONDS
    ],
    p1Points: [],
    p1FaceCards: [],
  });

  // skip backward to state 0
  cy.get('[data-cy=playback-controls]')
    .find('[data-cy=skip-backward]')
    .click();

  cy.url().should('contain', '?gameStateIndex=0');
  cy.get('[data-cy=history-log]').should('have.length', 1);
  cy.get('[data-player-hand-card]').should('have.length', 5);
  
  // skip forward to state -1 (end of game)
  cy.get('[data-cy=playback-controls]')
    .find('[data-cy=skip-forward]')
    .click();

  cy.url().should('contain', '?gameStateIndex=-1');
  cy.get('[data-cy=history-log]').should('have.length', 7);

  assertGameState(0, {
    p0Hand: [ Card.TEN_OF_SPADES, Card.ACE_OF_CLUBS ],
    p0Points: [ Card.TEN_OF_CLUBS, Card.TEN_OF_DIAMONDS, Card.TEN_OF_HEARTS ],
    p0FaceCards: [],
    p1Hand: [
      Card.TWO_OF_CLUBS,
      Card.TWO_OF_DIAMONDS,
      Card.TWO_OF_HEARTS,
      Card.TWO_OF_SPADES,
      Card.THREE_OF_CLUBS,
      Card.THREE_OF_DIAMONDS,
      Card.SEVEN_OF_HEARTS,
      Card.FOUR_OF_HEARTS,
    ],
    p1Points: [],
    p1FaceCards: [],
  });

  assertGameOverAsSpectator({ p1Wins: 1, p2Wins: 0, stalemates: 0, winner: 'p1', isRanked: false });

  // Navigate to next game
  cy.get('[data-cy=gameover-rematch]').click();

  // Should start on the first state since game is finished
  cy.url().should('contain', '?gameStateIndex=0');

  // Step forward to game 2 state 1 (loaded game fixture)
  cy.get('[data-cy=playback-controls]')
    .find('[data-cy=step-forward]')
    .click();
  cy.url().should('contain', '?gameStateIndex=1');
  cy.get('[data-cy=history-log]').should('have.length', 2);

  assertGameState(0, {
    p0Hand: [ Card.ACE_OF_CLUBS, Card.ACE_OF_DIAMONDS ],
    p0Points: [],
    p0FaceCards: [],
    p1Hand: [ Card.TWO_OF_CLUBS, Card.TWO_OF_DIAMONDS ],
    p1Points: [],
    p1FaceCards: [],
    topCard: Card.SEVEN_OF_HEARTS,
    secondCard: Card.FOUR_OF_HEARTS,
  });

  cy.get('[data-cy=playback-controls]')
    .find('[data-cy=step-forward]')
    .click();
  cy.url().should('contain', '?gameStateIndex=2');
  cy.get('[data-cy=history-log]')
    .should('have.length', 3)
    .should('contain', 'Player1 conceded');

  assertGameOverAsSpectator({ p1Wins: 1, p2Wins: 1, stalemates: 0, winner: 'p2', isRanked: false, rematchWasDeclined: true });
}

function createAndPlayGameWithOneOffs() {
  setupGameBetweenTwoUnseenPlayers('replay');
  cy.get('@replayGameId').then((gameId) => {
    cy.loadGameFixture(0, {
      p0Hand: [ Card.ACE_OF_CLUBS, Card.TWO_OF_HEARTS ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [ Card.TWO_OF_DIAMONDS ],
      p1Points: [ Card.TEN_OF_CLUBS, Card.TEN_OF_DIAMONDS ],
      p1FaceCards: [],
    }, gameId);

    cy.recoverSessionOpponent(playerOne);
    cy.playOneOffOpponent(Card.ACE_OF_CLUBS, gameId);
    cy.recoverSessionOpponent(playerTwo);
    cy.counterOpponent(Card.TWO_OF_DIAMONDS, gameId);
    cy.recoverSessionOpponent(playerOne);
    cy.counterOpponent(Card.TWO_OF_HEARTS, gameId);
    cy.recoverSessionOpponent(playerTwo);
    cy.resolveOpponent(gameId);

    cy.concedeOpponent(gameId);
    cy.recoverSessionOpponent(playerOne);
    cy.rematchOpponent({ gameId, rematch: true, skipDomAssertion: true });
    cy.recoverSessionOpponent(playerTwo);
    cy.rematchOpponent({ gameId, rematch: true, skipDomAssertion: true });
    cy.get(`@game${gameId}RematchId`).then((rematchGameId) => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.ACE_OF_CLUBS, Card.ACE_OF_DIAMONDS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.TWO_OF_CLUBS, Card.TWO_OF_DIAMONDS ],
        p1Points: [],
        p1FaceCards: [],
        topCard: Card.SEVEN_OF_HEARTS,
        secondCard: Card.FOUR_OF_HEARTS,
      }, rematchGameId);
      cy.recoverSessionOpponent(playerOne);
      cy.concedeOpponent(rematchGameId);
      cy.rematchOpponent({ gameId: rematchGameId, rematch: false, skipDomAssertion: true });
    });
  });
}

describe('Rewatching finished games', () => {
  beforeEach(() => {
    cy.wipeDatabase();
    cy.visit('/');
    cy.signupOpponent(playerOne);
    cy.signupOpponent(playerTwo);
  });

  describe('Rewatching a specific casual match', () => {

    beforeEach(createAndFinishCasualMatch);

    it('Rewatches someone else\'s casual match', function () {  
      cy.visit('/');
      cy.signupPlayer(myUser);

      rewatchCasualMatch(this.replayGameId);
    }); // end it('Watches a finished game clicking through the moves one at a time')
  
    it('Rewatches your own casual match', function () {
      cy.visit('/');
      cy.loginPlayer(playerOne);
      rewatchCasualMatch(this.replayGameId);
    });

    it('Steps and skips backwards from latest state (-1)', function () {
      cy.visit('/');
      cy.signupPlayer(myUser);
      cy.visit(`/spectate/${this.replayGameId}?gameStateIndex=-1`);

      cy.url().should('contain', '?gameStateIndex=-1');
      cy.get('[data-cy=playback-controls]')
        .find('[data-cy=step-backward]')
        .should('be.visible')
        .click();

      cy.url().should('contain', '?gameStateIndex=5');

      assertGameState(0, {
        p0Hand: [ Card.TEN_OF_SPADES, Card.ACE_OF_CLUBS, Card.TEN_OF_HEARTS ],
        p0Points: [ Card.TEN_OF_CLUBS, Card.TEN_OF_DIAMONDS ],
        p0FaceCards: [],
        p1Hand: [
          Card.TWO_OF_CLUBS,
          Card.TWO_OF_DIAMONDS,
          Card.TWO_OF_HEARTS,
          Card.TWO_OF_SPADES,
          Card.THREE_OF_CLUBS,
          Card.THREE_OF_DIAMONDS,
          Card.SEVEN_OF_HEARTS,
          Card.FOUR_OF_HEARTS,
        ],
        p1Points: [],
        p1FaceCards: [],
      });
    });
  });

  describe('Rewatching games with overlays and dialogs', () => {
    beforeEach(() => {
      createAndPlayGameWithOneOffs();
      cy.visit('/');
    });

    it('Navigates directly to a particular state of a finished game', () => {
      cy.loginPlayer(playerOne);
      cy.get('@replayGameId').then((gameId) => {
        cy.visit(`/spectate/${gameId}?gameStateIndex=2`);
      });

      cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');

      // Step backward to step 1: load fixture
      cy.get('[data-cy=step-backward]').click();
      cy.url().should('contain', '?gameStateIndex=1');
      cy.get('#waiting-for-opponent-counter-scrim').should('not.exist');

      cy.get('[data-cy=step-forward]').click();
      cy.url().should('contain', '?gameStateIndex=2');
      cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');

      cy.get('@replayGameId').then((gameId) => {
        cy.visit(`/spectate/${gameId}?gameStateIndex=5`);
      });

      assertGameState(0, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
        scrap: [
          Card.ACE_OF_CLUBS,
          Card.TWO_OF_HEARTS,
          Card.TWO_OF_DIAMONDS,
          Card.TEN_OF_CLUBS,
          Card.TEN_OF_DIAMONDS,
        ],
      });
    });

    it('Allows navigating across states when dialogs and overlays appear', () => {
      cy.get('@replayGameId').then((gameId) => {
        // Spectate
        cy.signupPlayer(myUser);
        cy.visit(`/spectate/${gameId}`);
        cy.url().should('include', '?gameStateIndex=0');
        // Begin on state 0
        cy.get('[data-player-hand-card]').should('have.length', 5);

        // Step forward to state 1: load fixture
        cy.get('[data-cy=step-forward]').click();

        assertGameState(0, {
          p0Hand: [ Card.ACE_OF_CLUBS, Card.TWO_OF_HEARTS ],
          p0Points: [],
          p0FaceCards: [],
          p1Hand: [ Card.TWO_OF_DIAMONDS ],
          p1Points: [ Card.TEN_OF_CLUBS, Card.TEN_OF_DIAMONDS ],
          p1FaceCards: [],
        });

        // Step forward to state 2: play ace one-off
        cy.get('[data-cy=step-forward]').click();
        cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');

        // Step forward to state 3: opponent counters
        cy.get('[data-cy=step-forward]').click();
        cy.get('#counter-dialog').should('be.visible');

        // Step forward to state 4: player counters back
        cy.get('[data-cy=step-forward]').click();
        cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');

        // Step forward to state 5
        cy.get('[data-cy=step-forward]').click();
        cy.url().should('contain', '?gameStateIndex=5');
        assertGameState(0, {
          p0Hand: [],
          p0Points: [],
          p0FaceCards: [],
          p1Hand: [],
          p1Points: [],
          p1FaceCards: [],
          scrap: [
            Card.ACE_OF_CLUBS,
            Card.TWO_OF_HEARTS,
            Card.TWO_OF_DIAMONDS,
            Card.TEN_OF_CLUBS,
            Card.TEN_OF_DIAMONDS,
          ]
        });

        // Step forward to state 6: gameover
        cy.get('[data-cy=step-forward]').click();
        cy.url().should('contain', '?gameStateIndex=6');
        assertGameOverAsSpectator({ p1Wins: 1, p2Wins: 0, stalemates: 0, winner: 'p1', isRanked: false });

        cy.get('[data-cy=gameover-rematch]').click();
        cy.wait(1000);
        cy.get('#game-over-dialog').should('not.exist');
      });
    });
  });

  describe('Rewatching ranked matches', () => {
    beforeEach(() => {
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
    });

    it.only('Rewatches a ranked match', () => {

      setupGameBetweenTwoUnseenPlayers('replay', true);
      cy.get('@replayGameId').then((gameId) => {
        cy.recoverSessionOpponent(playerOne);
        cy.concedeOpponent(gameId);
        cy.rematchOpponent({ gameId, rematch: true, skipDomAssertion: true });
        cy.recoverSessionOpponent(playerTwo);
        cy.rematchOpponent({ gameId, rematch: true, skipDomAssertion: true });
        cy.get(`@game${gameId}RematchId`).then((rematchGameId) => {
          cy.recoverSessionOpponent(playerOne);
          cy.concedeOpponent(rematchGameId);
          cy.rematchOpponent({ gameId: rematchGameId, rematch: false, skipDomAssertion: true });
          cy.recoverSessionOpponent(playerTwo);
          cy.rematchOpponent({ gameId: rematchGameId, rematch: false, skipDomAssertion: true });

          cy.visit('/');
          cy.signupPlayer(myUser);
          cy.vueRoute(`/spectate/${gameId}`);

          cy.get('[data-cy=skip-forward]').click();
          assertGameOverAsSpectator({ p1Wins: 0, p2Wins: 1, stalemates: 0, winner: 'p2', isRanked: true });
          cy.reload();
        });
      });

    });
  });

  
  describe('Error handling', () => {
    it('Prevents spectating a game that has no gamestates', function() {
      cy.loadFinishedGameFixtures([
        {
          name: 'Game predating game state API',
          status: GameStatus.FINISHED,
          createdAt: dayjs
            .utc()
            .subtract(1, 'year')
            .toDate(),
          p0: this[`${playerOne.username}Id`],
          p1: this[`${playerTwo.username}Id`],
        },
      ]);
  
      cy.request('/api/test/game').then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body?.length).to.eq(1);
  
        const [ game ] = res.body;
  
        cy.signupPlayer(myUser);
        cy.visit(`/spectate/${game.id}`);
  
        assertSnackbar('Cannot spectate: game is too old', 'error', 'newgame');
        cy.url().should('not.include', `/spectate/${game.id}`);
      });
    });

    it('Prevents making moves in finished games', function () {
      createAndPlayGameWithOneOffs();
      cy.visit('/');
      cy.loginPlayer(playerOne);
      cy.get('@replayGameId').then((gameId) => {
        cy.visit(`/spectate/${gameId}`);
      });

      cy.get('#deck').click();
      assertSnackbar('Can\'t make move: this game is over');
    });
  }); // describe('Error Handling')
}); // describe('Rewatching finished games')
