import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {
  setupSeasons,
  setupGameBetweenTwoUnseenPlayers,
  assertGameState,
  assertGameOverAsSpectator,
  assertSnackbar,
} from '../../../support/helpers';
import { myUser, playerOne, playerTwo, playerThree } from '../../../fixtures/userFixtures';
import { Card } from '../../../fixtures/cards';
import GameStatus from '../../../../../utils/GameStatus.json';
import {
  createAndFinishCasualMatch,
  rewatchCasualMatch,
  createAndPlayGameWithOneOffs,
  selectMatchGame,
} from './replayHelpers';

dayjs.extend(utc);

describe('Rewatching finished games', () => {
  beforeEach(() => {
    cy.wipeDatabase();
    cy.visit('/');
    cy.signupOpponent(playerOne);
    cy.signupOpponent(playerTwo);
  });

  describe('Rewatching a specific casual match', () => {
    beforeEach(createAndFinishCasualMatch);

    it('Rewatches another players casual match as p0', function () {
      cy.visit('/');
      cy.signupPlayer(myUser);
      const pNumToSpectate = 0;

      rewatchCasualMatch(this.replayGameId, pNumToSpectate);
    }); // end it('Watches a finished game clicking through the moves one at a time')

    it('Rewatches another players casual match as p1', function () {
      cy.visit('/');
      cy.signupPlayer(myUser);
      const pNumToSpectate = 1;

      rewatchCasualMatch(this.replayGameId, pNumToSpectate);
    }); // end it('Watches a finished game clicking through the moves one at a time')

    it('Rewatches your own casual match as p0', function () {
      cy.visit('/');
      cy.loginPlayer(playerOne);
      const pNumToSpectate = 0;

      rewatchCasualMatch(this.replayGameId, pNumToSpectate);
    });

    it('Rewatches your own casual match as p1', function () {
      cy.visit('/');
      cy.loginPlayer(playerOne);
      const pNumToSpectate = 1;

      rewatchCasualMatch(this.replayGameId, pNumToSpectate);
    });

    it('Rewatches your own casual match as p1 without specifying pNum query param', function () {
      cy.visit('/');
      cy.loginPlayer(playerTwo);

      const pNum = 1;

      cy.visit(`/spectate/${this.replayGameId}`);

      cy.get('[data-player-hand-card]').should('have.length', 6);
      cy.get('[data-cy=history-log]').should('have.length', 1);

      // Validates pNum query param is auto-added if not specified
      cy.url().should('contain', `gameStateIndex=0&pNum=${pNum}`);
    });

    it('Steps and skips backwards from latest state (-1)', function () {
      cy.visit('/');
      cy.signupPlayer(myUser);
      cy.visit(`/spectate/${this.replayGameId}?gameStateIndex=-1`);

      cy.url().should('contain', '?gameStateIndex=-1');
      cy.get('[data-cy=playback-controls]').find('[data-cy=step-backward]')
        .should('be.visible')
        .click();

      cy.url().should('contain', '?gameStateIndex=7');

      assertGameState(
        0,
        {
          p0Hand: [ Card.ACE_OF_CLUBS, Card.TEN_OF_SPADES ],
          p0Points: [ Card.TEN_OF_DIAMONDS, Card.TEN_OF_HEARTS ],
          p0FaceCards: [],
          p1Hand: [
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
          scrap: [ Card.NINE_OF_CLUBS, Card.TEN_OF_CLUBS ],
        },
        true,
      );
    });
  });

  describe('Navigating between games with the match dropdown', () => {
    it('Jumps forwards and backwards through a casual match, following the same player across the seat swap', function () {
      createAndFinishCasualMatch();
      cy.visit('/');
      cy.signupPlayer(myUser);

      cy.get('@replayGameId').then((gameId) => {
        cy.get(`@game${gameId}RematchId`).then((rematchGameId) => {
          // Game 1 is played with Player1 as p0
          cy.visit(`/spectate/${gameId}?pNum=0`);
          cy.get('[data-player-hand-card]').should('have.length', 5);
          cy.get('#player-username-container').should('contain', playerOne.username);

          cy.get('[data-cy=match-game-selector]').should('be.visible')
            .click();
          cy.get('[role=listbox]').find('[data-cy=match-game-option]')
            .should('have.length', 2);
          cy.get('[role=listbox]').contains('Game 2')
            .click();

          // Players swap seats on rematch, so following Player1 means landing on p1
          cy.url().should('include', `/spectate/${rematchGameId}?gameStateIndex=0&pNum=1`);
          cy.get('#player-username-container').should('contain', playerOne.username);
          cy.get('[data-cy=history-log]').should('have.length', 1);

          // Jump back to the first game -- something the gameover button can't do
          selectMatchGame(1);
          cy.url().should('include', `/spectate/${gameId}?gameStateIndex=0&pNum=0`);
          cy.get('#player-username-container').should('contain', playerOne.username);
          cy.get('[data-player-hand-card]').should('have.length', 5);
        });
      });
    });

    it('Loads the game named in the URL when stepping back through browser history', function () {
      createAndFinishCasualMatch();
      cy.visit('/');
      cy.signupPlayer(myUser);

      cy.get('@replayGameId').then((gameId) => {
        cy.get(`@game${gameId}RematchId`).then((rematchGameId) => {
          cy.visit(`/spectate/${gameId}?pNum=0`);
          cy.get('[data-player-hand-card]').should('have.length', 5);

          selectMatchGame(2);
          cy.url().should('include', `/spectate/${rematchGameId}`);
          cy.get('[data-cy=history-log]').should('have.length', 1);

          // Route guards don't re-run on a param-only change, so the board used to
          // keep showing game 2 while the URL said game 1
          cy.go('back');
          cy.url().should('include', `/spectate/${gameId}`);
          cy.get('[data-cy=match-game-selector]').should('contain', 'Game 1');
          cy.get('[data-player-hand-card]').should('have.length', 5);
          cy.get('#player-username-container').should('contain', playerOne.username);

          cy.go('forward');
          cy.url().should('include', `/spectate/${rematchGameId}`);
          cy.get('[data-cy=match-game-selector]').should('contain', 'Game 2');
          cy.get('#player-username-container').should('contain', playerOne.username);
        });
      });
    });

    it('Hides the dropdown when the match has only one game', () => {
      setupGameBetweenTwoUnseenPlayers('replay');

      cy.get('@replayGameId').then((gameId) => {
        cy.loadGameFixture(0, {
          p0Hand: [ Card.ACE_OF_CLUBS ],
          p0Points: [],
          p0FaceCards: [],
          p1Hand: [ Card.ACE_OF_DIAMONDS ],
          p1Points: [],
          p1FaceCards: [],
        }, gameId);

        cy.recoverSessionOpponent(playerOne);
        cy.concedeOpponent(gameId);

        cy.visit('/');
        cy.signupPlayer(myUser);
        cy.visit(`/spectate/${gameId}`);

        cy.get('[data-cy=playback-controls]').should('be.visible');
        cy.get('[data-cy=match-game-selector]').should('not.exist');
      });
    });

    it('Jumps between the games of a ranked match', () => {
      setupSeasons();
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

          cy.visit('/');
          cy.signupPlayer(myUser);
          cy.vueRoute(`/spectate/${gameId}?pNum=0`);

          selectMatchGame(2);
          cy.url().should('include', `/spectate/${rematchGameId}?gameStateIndex=0&pNum=1`);
          cy.get('#player-username-container').should('contain', playerOne.username);

          selectMatchGame(1);
          cy.url().should('include', `/spectate/${gameId}?gameStateIndex=0&pNum=0`);
        });
      });
    });

    it('Redirects home with an error when the selected game has no gamestates', function () {
      // Seed a match whose second game was never dealt, which can't be spectated
      cy.wipeDatabase();
      cy.visit('/');
      cy.signupOpponent(playerOne).as('playerOneId');
      cy.signupOpponent(playerTwo)
        .as('playerTwoId')
        .then(function () {
          cy.loadMatchFixtures([
            {
              player1: this.playerOneId,
              player2: this.playerTwoId,
              winner: null,
              startTime: dayjs.utc().subtract(1, 'hour')
                .toDate(),
              endTime: dayjs.utc().subtract(1, 'hour')
                .toDate(),
            },
          ]);
        });

      cy.request('/api/test/match').then((matchRes) => {
        const [ match ] = matchRes.body;

        cy.loadFinishedGameFixtures([
          {
            name: 'Finished first game',
            status: GameStatus.FINISHED,
            isRanked: true,
            match: match.id,
            p0: this.playerOneId,
            p1: this.playerTwoId,
            winner: this.playerOneId,
            updatedAt: dayjs.utc().subtract(30, 'minutes')
              .toDate(),
          },
          {
            name: 'Second game that was never dealt',
            status: GameStatus.STARTED,
            isRanked: true,
            match: match.id,
            p0: this.playerTwoId,
            p1: this.playerOneId,
            updatedAt: dayjs.utc().toDate(),
          },
        ]);
      });

      cy.request('/api/test/game').then((gameRes) => {
        const [ firstGame, secondGame ] = gameRes.body.sort((game1, game2) => game1.id - game2.id);

        cy.loadGameFixture(0, {
          p0Hand: [ Card.ACE_OF_CLUBS ],
          p0Points: [],
          p0FaceCards: [],
          p1Hand: [ Card.ACE_OF_DIAMONDS ],
          p1Points: [],
          p1FaceCards: [],
        }, firstGame.id);

        cy.signupPlayer(myUser);
        cy.visit(`/spectate/${firstGame.id}`);
        cy.get('[data-player-hand-card]').should('have.length', 1);

        // Both games are listed; only the first one can actually be spectated
        cy.get('[data-cy=match-game-selector]').should('be.visible')
          .click();
        cy.get('[role=listbox]').find('[data-cy=match-game-option]')
          .should('have.length', 2);
        cy.get('[role=listbox]').contains('Game 2')
          .click();

        cy.url().should('not.include', `/spectate/${secondGame.id}`);
        assertSnackbar('Cannot spectate: game is too old', 'error');
      });
    });
  });

  describe('Rewatching games with overlays and dialogs', () => {
    beforeEach(() => {
      createAndPlayGameWithOneOffs();
      cy.visit('/');
    });

    it('Navigates directly to a particular state of a finished game', () => {
      cy.get('@replayGameId').then((gameId) => {
        cy.visit(`/spectate/${gameId}?gameStateIndex=2`);
      });

      cy.get('#reauthenticate-dialog').should('be.visible');
      cy.get('[data-cy=username]').click()
        .type(playerOne.username);
      cy.get('[data-cy=password]').click()
        .type(playerOne.password);
      cy.get('[data-cy=login]').click();

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

      assertGameState(
        0,
        {
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
        },
        true,
      );
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

        assertGameState(
          0,
          {
            p0Hand: [ Card.ACE_OF_CLUBS, Card.TWO_OF_HEARTS ],
            p0Points: [],
            p0FaceCards: [],
            p1Hand: [ Card.TWO_OF_DIAMONDS ],
            p1Points: [ Card.TEN_OF_CLUBS, Card.TEN_OF_DIAMONDS ],
            p1FaceCards: [],
          },
          true,
        );

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
        assertGameState(
          0,
          {
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
          },
          true,
        );

        // Step forward to state 6: gameover
        cy.get('[data-cy=step-forward]').click();
        cy.url().should('contain', '?gameStateIndex=6');
        assertGameOverAsSpectator({ p1Wins: 1, p2Wins: 0, stalemates: 0, winner: 'p1', isRanked: false });

        // The dialogs a spectator sees belong to the players; the controls are their own
        // navigation, so no overlay may cover them (#1479)
        cy.get('[data-cy=skip-backward]').then(($button) => {
          const { left, top, width, height } = $button[0].getBoundingClientRect();
          const topmost = $button[0].ownerDocument.elementFromPoint(left + width / 2, top + height / 2);
          expect(topmost.closest('[data-cy=skip-backward]'), 'topmost element over skip-backward').to.not.be.null;
        });

        cy.get('[data-cy=gameover-rematch]').click();
        cy.wait(1000);
        cy.get('#game-over-dialog').should('not.exist');
      });
    });
  });

  describe('Rewatching ranked matches', () => {
    beforeEach(() => {
      setupSeasons();
    });

    it('Rewatches a ranked match', () => {
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
          assertGameOverAsSpectator({ p1Wins: 0, p2Wins: 1, stalemates: 0, winner: 'p2', isRanked: true });

          cy.get('[data-cy=gameover-rematch]').click();
          cy.url().should('include', `spectate/${rematchGameId}?gameStateIndex=0`);

          cy.get('[data-cy=skip-forward]').click();
          cy.url().should('include', `spectate/${rematchGameId}?gameStateIndex=-1`);
          assertGameOverAsSpectator({
            p1Wins: 0,
            p2Wins: 2,
            stalemates: 0,
            winner: 'p2',
            isRanked: true,
            rematchWasDeclined: true,
          });
        });
      });
    });
  });

  describe('Creating highlight clips', () => {
    it('Copies the url of the current move as highlight clip as player in a game', () => {
      cy.setupGameAsP0();

      cy.loadGameFixture(0, {
        p0Hand: [ Card.ACE_OF_CLUBS, Card.ACE_OF_DIAMONDS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.TWO_OF_CLUBS, Card.TWO_OF_DIAMONDS ],
        p1Points: [],
        p1FaceCards: [],
        topCard: Card.SEVEN_OF_HEARTS,
        secondCard: Card.FOUR_OF_HEARTS,
      });

      cy.get('#game-menu-activator').click();
      cy.get('#game-menu').should('be.visible');
      cy.get('[data-cy=clip-highlight]').click();

      // Clipboard should have spectate link to current gameState
      cy.window().then((win) => {
        const currentOrigin = win.location.origin;
        cy.window()
          .its('cuttle.gameStore')
          .then((gameStore) => {
            const expectedUrl = `${currentOrigin}/spectate/${gameStore.id}?gameStateIndex=1&pNum=0`;
            cy.wrap(win.navigator.clipboard.readText()).should('eq', expectedUrl);
          });
      });

      // Menu item should show contents are copied
      cy.get('[data-cy=highlight-copied]').should('be.visible')
        .click();
      cy.get('#game-menu').should('not.exist');

      // highlight-copied should switch back on re-opening menu
      cy.get('#game-menu-activator').click();
      cy.get('#game-menu').should('be.visible');
      cy.get('[data-cy=highlight-copied]').should('not.exist');
      cy.get('[data-cy=clip-highlight]').should('be.visible');
    });

    it('Copies the current state url when spectating live', () => {
      setupGameBetweenTwoUnseenPlayers('replay');

      cy.get('@replayGameId').then((gameId) => {
        cy.loadGameFixture(
          0,
          {
            p0Hand: [
              Card.TEN_OF_CLUBS,
              Card.TEN_OF_DIAMONDS,
              Card.TEN_OF_HEARTS,
              Card.TEN_OF_SPADES,
              Card.ACE_OF_CLUBS,
            ],
            p0Points: [],
            p0FaceCards: [],
            p1Hand: [
              Card.TWO_OF_CLUBS,
              Card.TWO_OF_DIAMONDS,
              Card.TWO_OF_HEARTS,
              Card.TWO_OF_SPADES,
              Card.THREE_OF_CLUBS,
              Card.THREE_OF_DIAMONDS,
            ],
            p1Points: [],
            p1FaceCards: [],
            topCard: Card.SEVEN_OF_HEARTS,
            secondCard: Card.FOUR_OF_HEARTS,
          },
          gameId,
        );

        cy.visit('/');
        cy.signupPlayer(myUser);
        cy.visit(`/spectate/${gameId}`);

        cy.get('#game-menu-activator').click();
        cy.get('#game-menu').should('be.visible');
        cy.get('[data-cy=clip-highlight]').click();

        // Clipboard should have spectate link to current gameState
        cy.window().then((win) => {
          const currentOrigin = win.location.origin;
          const expectedUrl = `${currentOrigin}/spectate/${gameId}?gameStateIndex=1&pNum=0`;
          cy.wrap(win.navigator.clipboard.readText()).should('eq', expectedUrl);
        });

        // Menu item should show contents are copied
        cy.get('[data-cy=highlight-copied]').should('be.visible')
          .click();
        cy.get('#game-menu').should('not.exist');

        // highlight-copied should switch back on re-opening menu
        cy.get('#game-menu-activator').click();
        cy.get('#game-menu').should('be.visible');
        cy.get('[data-cy=highlight-copied]').should('not.exist');
        cy.get('[data-cy=clip-highlight]').should('be.visible');
      });
    });

    it('Copies clip highlight link while spectating a finished game', () => {
      createAndPlayGameWithOneOffs();
      cy.get('@replayGameId').then((gameId) => {
        cy.loadGameFixture(
          0,
          {
            p0Hand: [
              Card.TEN_OF_CLUBS,
              Card.TEN_OF_DIAMONDS,
              Card.TEN_OF_HEARTS,
              Card.TEN_OF_SPADES,
              Card.ACE_OF_CLUBS,
            ],
            p0Points: [],
            p0FaceCards: [],
            p1Hand: [
              Card.TWO_OF_CLUBS,
              Card.TWO_OF_DIAMONDS,
              Card.TWO_OF_HEARTS,
              Card.TWO_OF_SPADES,
              Card.THREE_OF_CLUBS,
              Card.THREE_OF_DIAMONDS,
            ],
            p1Points: [],
            p1FaceCards: [],
            topCard: Card.SEVEN_OF_HEARTS,
            secondCard: Card.FOUR_OF_HEARTS,
          },
          gameId,
        );

        cy.visit('/');
        cy.signupPlayer(myUser);
        cy.visit(`/spectate/${gameId}?gameStateIndex=3`);

        cy.get('#game-menu-activator').click();
        cy.get('#game-menu').should('be.visible');
        cy.get('[data-cy=clip-highlight]').click();

        // Clipboard should have spectate link to current gameState
        cy.window().then((win) => {
          const currentOrigin = win.location.origin;
          const expectedUrl = `${currentOrigin}/spectate/${gameId}?gameStateIndex=3&pNum=0`;
          cy.wrap(win.navigator.clipboard.readText()).should('eq', expectedUrl);
        });

        // Menu item should show contents are copied
        cy.get('[data-cy=highlight-copied]').should('be.visible')
          .click();
        cy.get('#game-menu').should('not.exist');

        // highlight-copied should switch back on re-opening menu
        cy.get('#game-menu-activator').click();
        cy.get('#game-menu').should('be.visible');
        cy.get('[data-cy=highlight-copied]').should('not.exist');
        cy.get('[data-cy=clip-highlight]').should('be.visible');
      });
    });

    it('Does not affect live game state when a spectator joins at gameStateIndex=0', () => {
      // Setup a game as p0
      cy.setupGameAsP0();
      cy.get('@gameId').then((gameId) => {
        // Have p0 draw a card
        cy.get('#deck').click();
        // Assert p0 has 6 cards in hand (initial 5 + 1 drawn)
        cy.get('#player-hand-cards .player-card').should('have.length', 6);
        // Sign up another user as opponent/other user
        cy.signupOpponent(playerThree);
        // Use cy.setOpponentToSpectate to subscribe the new user to the game at gameStateIndex=0
        cy.setOpponentToSpectate(gameId, 0);
        cy.wait(1000);
        cy.get('#player-hand-cards .player-card').should('have.length', 6);
      });
    });
  }); // end describe('Creating highlight clips')

  describe('Replaying other game states', () => {
    it('Watches a replay of a game that ends via passes', () => {
      setupGameBetweenTwoUnseenPlayers('replay');

      cy.get('@replayGameId').then((gameId) => {
        cy.loadGameFixture(
          0,
          {
            p0Hand: [ Card.ACE_OF_CLUBS ],
            p0Points: [],
            p0FaceCards: [],
            p1Hand: [ Card.ACE_OF_DIAMONDS ],
            p1Points: [],
            p1FaceCards: [],
            deck: [],
          },
          gameId,
        );

        cy.recoverSessionOpponent(playerOne);
        cy.passOpponent(gameId);
        cy.recoverSessionOpponent(playerTwo);
        cy.passOpponent(gameId);

        cy.recoverSessionOpponent(playerOne);
        cy.passOpponent(gameId);

        cy.visit('/');
        cy.signupPlayer(myUser);
        cy.vueRoute(`/spectate/${gameId}`);
      });

      cy.url().should('contain', '?gameStateIndex=0');
      // Wait and verify game over dialog doesn't appear
      cy.wait(1000);
      cy.get('#game-over-dialog').should('not.exist');
      // Step forward to state 1 (loaded fixture)
      cy.get('[data-cy=playback-controls]').find('[data-cy=step-forward]')
        .click();
      cy.url().should('contain', '?gameStateIndex=1');
      // Step forward to state 2 (pass)
      cy.get('[data-cy=playback-controls]').find('[data-cy=step-forward]')
        .click();
      cy.url().should('contain', '?gameStateIndex=2');
      // Wait and verify game over dialog doesn't appear
      cy.wait(1000);
      cy.get('#game-over-dialog').should('not.exist');
      // Step forward to state 3 (pass)
      cy.get('[data-cy=playback-controls]').find('[data-cy=step-forward]')
        .click();
      cy.url().should('contain', '?gameStateIndex=3');
      // Step forward to state 4 (pass; stalemate)
      cy.get('[data-cy=playback-controls]').find('[data-cy=step-forward]')
        .click();

      assertGameOverAsSpectator({ p1Wins: 0, p2Wins: 0, stalemates: 1, winner: null, isRanked: false });
    });
  });

  describe('Error handling', () => {
    it('Prevents spectating a game that has no gamestates', function () {
      cy.loadFinishedGameFixtures([
        {
          name: 'Game predating game state API',
          status: GameStatus.FINISHED,
          createdAt: dayjs.utc().subtract(1, 'year')
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

        assertSnackbar('Cannot spectate: game is too old', 'error');
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
