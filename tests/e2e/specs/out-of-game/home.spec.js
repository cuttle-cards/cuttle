import { assertSnackbar } from '../../support/helpers';
import { Card } from '../../fixtures/cards';
import { myUser, opponentOne, opponentTwo, playerOne, playerTwo } from '../../fixtures/userFixtures';
import { SnackBarError } from '../../fixtures/snackbarError';
import GameStatus from '../../../../utils/GameStatus.json';
import { announcementData } from '../../../../src/routes/home/components/announcementDialog/data/announcementData';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

function setup() {
  cy.wipeDatabase();
  cy.visit('/');
  cy.signupPlayer(myUser);
  cy.vueRoute('/');
  window.localStorage.setItem('announcement', announcementData.id);
}

function assertSuccessfulJoin(gameState) {
  expect(gameState.id).to.not.eq(null);
  cy.url().should('include', '/lobby/');
  cy.contains('h1', `Lobby for`);
  cy.contains('h5', `${gameState.name}`);
}

function setupGameBetweenTwoUnseenPlayers(gameName) {
  cy.createGameOpponent(gameName).then(({ gameId }) => {
    cy.wrap(gameId).as(`${gameName}GameId`);
    cy.recoverSessionOpponent(playerOne);
    cy.subscribeOpponent(gameId);
    cy.readyOpponent(gameId);
    cy.recoverSessionOpponent(playerTwo);
    cy.subscribeOpponent(gameId);
    cy.readyOpponent(gameId);
  });
}

describe('Home - Page Content', () => {
  beforeEach(setup);

  it('Displays headers and logo', () => {
    cy.contains('h1', 'Game Finder');
    cy.get('#logo');
  });

  it('How It Works Dialog And Links Work', () => {
    cy.get('[data-cy=how-it-works-button]').click();
    cy.get('[data-cy=ai-link]').should(
      'have.attr',
      'href',
      'https://human-ai-interaction.github.io/cuttle-bot/',
    );
    cy.get('[data-cy=how-it-works-okay]').click();
    cy.get('[data-cy=how-it-works-button]').click();
    cy.get('[data-cy=rules-link]').click();
    cy.location('pathname').should('eq', '/rules');
  });

  it('Logs user out', () => {
    cy.get('[data-cy="user-menu"]').click();
    cy.get("[data-nav='Log Out']").click();
    cy.contains('p', 'Log In to get Started!');
    cy.get('[data-nav=Home]').should('not.exist');
  });

  it('Sends list of games when session data includes invalid game id', () => {
    cy.signupOpponent(opponentOne);
    cy.setBadSession();
    cy.requestGameList();
    cy.requestGameList();
  });
});

describe('Home - Game List', () => {
  beforeEach(setup);

  describe('Open Games', () => {
    it('Displays a game for every open game on the server', () => {
      cy.createGamePlayer({ gameName: '111', isRanked: false });
      cy.createGamePlayer({ gameName: '33', isRanked: false });
      cy.get('[data-cy=game-list-item]').should('have.length', 2);
    });

    it('Displays placeholder text when no games are available', () => {
      cy.get('[data-cy=text-if-no-game]').should(($el) =>
        expect($el.text().trim()).to.equal('No Active Games'),
      );
    });

    it('Adds a new game to the list when one comes in through the socket', () => {
      cy.createGamePlayer({ gameName: '111', isRanked: false });
      cy.createGamePlayer({ gameName: '33', isRanked: false });
      cy.get('[data-cy=game-list-item]').should('have.length', 2);
      cy.signupOpponent(opponentOne);
      cy.createGameOpponent('Game made by other player');
      cy.get('[data-cy=game-list-item]').should('have.length', 3)
        .contains('Game made by other player');
    });

    it('Displays "Empty" when there are no players', () => {
      const players = [];
      cy.createGamePlayer({ gameName: 'Game with no players', isRanked: false, players });
      cy.get('[data-cy=game-list-item]').contains('Empty');
    });

    it('Displays players\' usernames in the game list item', () => {
      const players = [
        { username: 'playerOne' },
        { username: 'playerTwo' }
      ];
      cy.createGamePlayer({ gameName: 'Game with players', isRanked: false, players });
      cy.get('[data-cy=game-list-item]').contains('playerOne vs playerTwo');
    });

    it('Joins an open game', () => {
      cy.window()
        .its('cuttle.gameStore')
        .then((store) => {
          expect(store.id).to.eq(null);
        });
      cy.createGamePlayer({ gameName: 'Test Game', isRanked: false });
      cy.get('[data-cy=game-list-item]').contains('button.v-btn', 'Join Casual')
        .click();
      cy.location('pathname').should('contain', '/lobby');
      cy.window()
        .its('cuttle.gameStore')
        .then((store) => {
          assertSuccessfulJoin(store);
        });
    });

    it('Does not show games older than 24 hours', () => {
      cy.loadFinishedGameFixtures([
        { name: 'New Game', status: GameStatus.CREATED },
        { name: 'Old Game', status: GameStatus.CREATED, createdAt: dayjs.utc().subtract(1, 'day')
          .toDate() },
      ]);
      cy.visit('/');
      cy.get('[data-cy=game-list-item]').should('have.length', 1);
      cy.get('[data-cy=game-list-item]').should('contain', 'New Game');
    });
  });

  it('Joins a game that already has one player', () => {
    /**
     * Set up:
     * Create game, sign up one other user and subscribe them to the game
     */
    cy.createGamePlayer({ gameName: 'Test Game', isRanked: false }).then((gameData) => {
      // Sign up new user and subscribe them to game
      cy.signupOpponent(opponentOne);
      cy.subscribeOpponent(gameData.gameId);
      // Our user then joins through UI
      cy.get('[data-cy=game-list-item]').contains('button.v-btn', 'Join Casual')
        .click();
      // Should have redirected to lobby page and updated store
      cy.location('pathname').should('contain', '/lobby');
      cy.window()
        .its('cuttle.gameStore')
        .then((store) => {
          // expect(gameState.gameId).to.not.eq(null);
          assertSuccessfulJoin(store);
        });
    });
  });

  it('Disables join when a game becomes full', () => {
    /**
     * Set up:
     * Create game, sign up two other users, subscribe them to the game
     */
    cy.createGamePlayer({ gameName: 'Test Game', isRanked: false }).then((gameData) => {
      // Test that JOIN button starts enabled
      cy.contains('button.v-btn', 'Join Casual').should('not.be.disabled');
      // Sign up 2 users and subscribe them to game
      cy.signupOpponent(opponentOne);
      cy.subscribeOpponent(gameData.gameId);
      cy.signupOpponent(opponentTwo);
      cy.subscribeOpponent(gameData.gameId);

      // Test that join button is now disabled
      cy.contains('[data-cy-join-game]', 'Join Casual').should('be.disabled');

      // Manually re-enable join button to confirm backend rejects request
      cy.window()
        .its('cuttle.gameListStore')
        .then((store) => store.otherLeftGame(gameData.gameId));
      cy.contains('[data-cy-join-game]', 'Join Casual')
        .should('not.be.disabled')
        .click()
        .should('be.disabled');

      assertSnackbar(SnackBarError.GAME_IS_FULL, 'error', 'newgame');
    });
  });

  it('Re-enable join when a user leaves a full lobby', () => {
    /**
     * Set up:
     * Create game, sign up two other users, subscribe them to the game, leave one user
     */
    cy.createGamePlayer({ gameName: 'Test Game', isRanked: false }).then((gameData) => {
      // Test that JOIN button starts enabled
      cy.contains('button.v-btn', 'Join Casual').should('not.be.disabled');
      // Sign up 2 users and subscribe them to game
      cy.signupOpponent(opponentOne);
      cy.subscribeOpponent(gameData.gameId);
      cy.signupOpponent(opponentTwo);
      cy.subscribeOpponent(gameData.gameId);

      // Test that join button is now disabled
      cy.contains('[data-cy-join-game]', 'Join Casual').should('be.disabled');

      cy.leaveLobbyOpponent(gameData.gameId);
      cy.contains('[data-cy-join-game]', 'Join Casual').should('not.be.disabled');
    });
  });

  it('Redirects to game URL when hitting spectate as a player', function () {
    cy.signupOpponent(opponentOne);
    cy.setupGameAsP1(true);
    cy.vueRoute('/');
    cy.get('[data-cy-game-list-selector=spectate]').click();
    cy.get('@gameSummary').then(({ gameId }) => {
      cy.get(`[data-cy-join-game=${gameId}]`).click();
      cy.url().should('include', `/game/${gameId}`);
    });
  });

  describe('Spectating games', () => {
    it('Spectates a game', () => {
      cy.createGamePlayer({ gameName: 'Test Game', isRanked: false }).then(({ gameId }) => {
        // Test that JOIN button starts enabled
        cy.contains(`[data-cy-join-game=${gameId}]`, 'Join Casual').should('not.be.disabled');
        // Sign up 2 users and subscribe them to game
        cy.signupOpponent(playerOne);
        cy.subscribeOpponent(gameId);
        // Opponents start game, it appears as spectatable
        cy.readyOpponent(gameId);
        cy.signupOpponent(playerTwo);
        cy.subscribeOpponent(gameId, 1);
        cy.contains(`[data-cy-join-game=${gameId}]`, 'Join Casual').should('be.disabled');

        // Switch to spectate tab
        cy.get('[data-cy-game-list-selector=spectate]').click();
        cy.get('[data-cy=no-spectate-game-text]').should('contain', 'No Games Available to Spectate');

        // The other game starts -- should now appear in spectate list
        cy.readyOpponent(gameId);
        cy.get(`[data-cy-spectate-game=${gameId}]`).click();

        cy.url().should('include', '/spectate/');
        cy.window()
          .its('cuttle.gameStore')
          .then((store) => {
            expect(store.id).to.not.eq(null);
          });
      });
    });

    it('Does not show open or completed games in spectate tab', () => {
      cy.signupOpponent(playerOne);
      cy.createGameOpponent('Game Created before page visit');
      cy.visit('/');
      cy.get('[data-cy-join-game]').should('have.length', 1);
      cy.createGameOpponent('Game Created after page visit');
      cy.get('[data-cy-join-game]').should('have.length', 2);

      // Switch to spectate tab -- no games available to spectate
      cy.get('[data-cy-game-list-selector=spectate]').click();
      cy.get('[data-cy=no-spectate-game-text]').should('contain', 'No Games Available to Spectate');
      cy.get('[data-cy-spectate-game]').should('have.length', 0);

      // New game is created, started, and finished
      cy.createGameOpponent('Game completed without being spectated').then(({ gameId }) => {
        cy.subscribeOpponent(gameId);
        cy.readyOpponent(gameId);
        // Second player signs up, joins, readies
        cy.signupOpponent(playerTwo);
        cy.subscribeOpponent(gameId);
        cy.readyOpponent(gameId);

        // Game appears as spectatable
        cy.get(`[data-cy-spectate-game=${gameId}]`).should('be.visible')
          .and('not.be.disabled');
        // Game finishes -- Can no longer spectate
        cy.concedeOpponent();
        cy.get(`[data-cy-spectate-game=${gameId}]`).should('be.disabled');
      });

      // Create another game
      // New game is created, started, and finished
      cy.createGameOpponent('2nd Game completed without being spectated').then(({ gameId }) => {
        cy.recoverSessionOpponent(playerOne);
        cy.subscribeOpponent(gameId);
        cy.readyOpponent(gameId);

        cy.recoverSessionOpponent(playerTwo);
        cy.subscribeOpponent(gameId);
        cy.readyOpponent(gameId);

        // Game appears as spectatable
        cy.get(`[data-cy-spectate-game=${gameId}]`)
          .scrollIntoView()
          .should('be.visible')
          .and('not.be.disabled');
        // Disconnect the socket then finish the game -- UI misses the update
        cy.window()
          .its('cuttle.authStore')
          .then((store) => store.disconnectSocket());
        cy.concedeOpponent();
        cy.window()
          .its('cuttle.authStore')
          .then((store) => store.reconnectSocket());
        cy.get(`[data-cy-spectate-game=${gameId}]`).click();
        assertSnackbar('Unable to spectate game', 'error', 'newgame');
        // Spectate button should now be disabled
        cy.get(`[data-cy-spectate-game=${gameId}]`).should('be.disabled');
      });
      // Refresh page -- no games available to spectate
      cy.visit('/');
      cy.get('[data-cy-game-list-selector=spectate]').click();
      cy.get('[data-cy=no-spectate-game-text]').should('contain', 'No Games Available to Spectate');
    });

    it('Shows ongoing games as available to spectate when user navigates to home page', () => {
      cy.signupOpponent(playerOne);
      cy.createGameOpponent('Spectatable game').then(({ gameId }) => {
        cy.subscribeOpponent(gameId);
        cy.readyOpponent(gameId);

        cy.signupOpponent(playerTwo);
        cy.subscribeOpponent(gameId);
        cy.readyOpponent(gameId);

        // Navigate to homepage
        cy.visit('/');
        // No open games appear
        cy.contains('[data-cy-join-game]', 'Join Casual').should('not.exist');
        // Existing game is available to spectate
        cy.get('[data-cy-game-list-selector=spectate]').click();
        cy.get(`[data-cy-spectate-game=${gameId}]`).click();
      });
    });

    it('Disables spectate button if on home view before game finishes', () => {
      cy.skipOnGameStateApi();
      cy.signupOpponent(playerOne);
      cy.signupOpponent(playerTwo);

      // Navigate to homepage and select spectate tab
      cy.visit('/');
      cy.get('[data-cy-game-list-selector=spectate]').click();

      // Finished by conceded
      cy.log('Setup game end by conceding');
      setupGameBetweenTwoUnseenPlayers('conceded');
      cy.concedeOpponent();
      cy.get('@concededGameId').then(function () {
        cy.get(`[data-cy-spectate-game=${this.concededGameId}]`).should('be.disabled');
      });
      cy.log('Game ended by conceding - successfully disabled spectate button');

      // Navigate to homepage and select spectate tab
      cy.reload();
      cy.get('[data-cy-game-list-selector=spectate]').click();

      // Finished by stalemate
      cy.log('Setup game end by stalemate');
      setupGameBetweenTwoUnseenPlayers('stalemate');

      cy.stalemateOpponent();
      cy.recoverSessionOpponent(playerOne);

      // make sure button is still enabled after 1 person stalemates
      cy.get('@stalemateGameId').then(function () {
        cy.get(`[data-cy-spectate-game=${this.stalemateGameId}]`).should('be.not.disabled');
        cy.stalemateOpponent();
        cy.get(`[data-cy-spectate-game=${this.stalemateGameId}]`).should('be.disabled');
        cy.log('Game ended by stalemate - successfully disabled spectate button');
      });

      cy.reload();
      cy.get('[data-cy-game-list-selector=spectate]').click();

      // Finished by pass
      cy.log('Setup game end by passing');
      cy.setupGameAsSpectator();
      cy.loadGameFixture(0, {
        p0Hand: [ Card.SEVEN_OF_CLUBS ],
        p0Points: [ Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS ],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
        deck: [],
      });
      // Draw last two card, both players pass until stalemate
      cy.get('#deck').should('contain', '(2)');
      cy.recoverSessionOpponent(playerOne);
      cy.drawCardOpponent();
      cy.get('#deck').should('contain', '(1)');
      cy.recoverSessionOpponent(playerTwo);
      cy.drawCardOpponent();
      cy.get('#deck').should('contain', '(0)');
      cy.recoverSessionOpponent(playerOne);
      cy.passOpponent();
      cy.get('#history').should('contain', `${playerOne.username} passes`);
      cy.recoverSessionOpponent(playerTwo);
      cy.passOpponent();
      cy.get('#history').should('contain', `${playerTwo.username} passes`);
      cy.recoverSessionOpponent({ username: myUser.username, password: myUser.password });
      cy.vueRoute('/');
      cy.get('[data-cy-game-list-selector=spectate]').click();
      cy.get(`[data-cy-spectate-game]`).should('be.not.disabled');
      cy.recoverSessionOpponent(playerOne);
      cy.passOpponent();
      cy.get(`[data-cy-spectate-game]`).should('be.disabled');
      cy.log('Game ended by passing - successfully disabled spectate button');

      // Finished by P0 Victory
      cy.log('Setup game end by P0 victory');
      cy.setupGameAsSpectator();
      cy.loadGameFixture(0, {
        p0Hand: [ Card.EIGHT_OF_SPADES ],
        p0Points: [ Card.SEVEN_OF_SPADES, Card.SEVEN_OF_HEARTS ],
        p0FaceCards: [],
        p1Hand: [ Card.EIGHT_OF_HEARTS ],
        p1Points: [ Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_CLUBS ],
        p1FaceCards: [],
      });
      cy.recoverSessionOpponent(playerOne);
      cy.vueRoute('/');
      cy.get('[data-cy-game-list-selector=spectate]').click();
      cy.get(`[data-cy-spectate-game]`).should('be.not.disabled');
      cy.playPointsSpectator(Card.EIGHT_OF_SPADES, 0);
      cy.get(`[data-cy-spectate-game]`).should('be.disabled');
      cy.log('Game ended by P0 Victory - successfully disabled spectate button');

      // Finished by P1 Victory
      cy.log('Setup game end by P1 victory');
      cy.setupGameAsSpectator();
      cy.loadGameFixture(0, {
        p0Hand: [ Card.EIGHT_OF_SPADES ],
        p0Points: [ Card.SEVEN_OF_SPADES, Card.SEVEN_OF_HEARTS ],
        p0FaceCards: [],
        p1Hand: [ Card.EIGHT_OF_HEARTS ],
        p1Points: [ Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_CLUBS ],
        p1FaceCards: [],
      });
      cy.recoverSessionOpponent(playerOne);
      cy.drawCardOpponent();
      cy.recoverSessionOpponent(playerTwo);
      cy.vueRoute('/');
      cy.get('[data-cy-game-list-selector=spectate]').click();
      cy.get(`[data-cy-spectate-game]`).should('be.not.disabled');
      cy.playPointsSpectator(Card.EIGHT_OF_HEARTS, 1);
      cy.get(`[data-cy-spectate-game]`).should('be.disabled');
      cy.log('Game ended by P1 Victory - successfully disabled spectate button');
    });
  });
});
describe('Home - Create Game', () => {
  beforeEach(setup);

  it('Saves ranked setting between sessions', () => {
    cy.clearLocalStorage();
    cy.window().then((win) => {
      win.localStorage.setItem('announcement', announcementData.id);
    });
    cy.get('[data-cy=create-game-btn]').click();
    cy.get('[data-cy=create-game-dialog]').should('be.visible');

    cy.toggleInput('[data-cy=create-game-ranked-switch]');

    cy.get('[data-cy=ranked-info-button]').should('exist');

    // Reload to get a fresh session so we use localStorage
    cy.reload();

    // Should stay checked
    cy.get('[data-cy=create-game-btn]').click();
    cy.get('[data-cy=create-game-dialog]').should('be.visible');

    cy.toggleInput('[data-cy=create-game-ranked-switch]', true);

    // Reload to get a fresh session so we use localStorage
    cy.reload();

    // Should stay unchecked
    cy.get('[data-cy=create-game-btn]').click();
    cy.get('[data-cy=create-game-dialog]').should('be.visible');
    cy.get('[data-cy=create-game-ranked-switch]').should('not.be.checked');
  });

  it('Creates a new game by hitting enter in text field', () => {
    cy.get('[data-cy=create-game-btn]').click();
    cy.get('[data-cy=create-game-dialog]')
      .should('be.visible')
      .find('[data-cy=game-name-input]')
      .should('be.visible')
      .type('test game{enter}');

    cy.window()
      .its('cuttle.gameStore')
      .then((store) => {
        assertSuccessfulJoin(store);
      });

    cy.vueRoute('/');

    cy.get('[data-cy=game-list-item]')
      .should('have.length', 1)
      .should('include.text', 'test game')
      .should('include.text', '1 / 2 players');

    // Test store
    cy.window()
      .its('cuttle.gameListStore.openGames')
      .then((games) => {
        expect(games.length).to.eq(1, 'Expect exactly 1 game in store');
        expect(games[0].numPlayers).to.eq(1, 'Expect 1 players in game in store');
        expect(games[0].status).to.eq(GameStatus.CREATED, 'Expect game to have status CREATED');
      });
  });

  it('Creates a new unranked game by hitting the submit button', () => {
    cy.get('[data-cy=create-game-btn]').click();
    cy.get('[data-cy=create-game-dialog]')
      .should('be.visible')
      .find('[data-cy=game-name-input]')
      .should('be.visible')
      .type('test game');
    cy.get('[data-cy=submit-create-game]').should('be.visible')
      .click();

    cy.get('[data-cy=create-game-dialog]').should('not.exist');

    cy.location('pathname').should('contain', '/lobby');
    cy.window()
      .its('cuttle.gameStore')
      .then((store) => {
        assertSuccessfulJoin(store);
      });

    cy.vueRoute('/');

    // Test DOM
    cy.get('[data-cy=game-list-item]')
      .should('have.length', 1)
      .should('include.text', 'test game')
      .should('include.text', '1 / 2 players');
    // Test store
    cy.window()
      .its('cuttle.gameListStore.openGames')
      .then((games) => {
        expect(games.length).to.eq(1, 'Expect exactly 1 game in store');
        expect(games[0].numPlayers).to.eq(1, 'Expect 1 player in gameLists game in store');
        expect(games[0].status).to.eq(GameStatus.CREATED, 'Expect game to have status CREATED');
        expect(games[0].isRanked).to.eq(false, 'Expect game to be ranked');
      });
  });

  it('Creates a new ranked game', () => {
    cy.get('[data-cy=create-game-btn]').click();
    cy.get('[data-cy=create-game-dialog]')
      .should('be.visible')
      .find('[data-cy=game-name-input]')
      .should('be.visible')
      .type('test game');

    cy.toggleInput('[data-cy=create-game-ranked-switch]');

    cy.get('[data-cy=submit-create-game]').should('be.visible')
      .click();

    cy.location('pathname').should('contain', '/lobby');
    cy.window()
      .its('cuttle.gameStore')
      .then((store) => {
        assertSuccessfulJoin(store);
      });

    cy.vueRoute('/');

    // Test DOM
    cy.get('[data-cy=game-list-item]')
      .should('have.length', 1)
      .should('include.text', 'test game')
      .should('include.text', '1 / 2 players');

    // Test store
    cy.window()
      .its('cuttle.gameListStore.openGames')
      .then((games) => {
        expect(games.length).to.eq(1, 'Expect exactly 1 game in store');
        expect(games[0].numPlayers).to.eq(1, 'Expect 1 player in gameLists game in store');
        expect(games[0].status).to.eq(GameStatus.CREATED, 'Expect game to have status CREATED');
        expect(games[0].isRanked).to.eq(true, 'Expect game to be ranked');
      });
  });

  it('Limits the length of the game name for new ranked game', () => {
    cy.get('[data-cy=create-game-btn]').click();
    cy.get('[data-cy=create-game-dialog]')
      .should('be.visible')
      .find('[data-cy=game-name-input]')
      .should('be.visible')
      .type('This game name needs to be more than 50 characters in length');

    cy.get('[data-cy=create-game-ranked-switch]')
      .should('not.be.checked')
      .find('.v-selection-control__input input')
      .click({ force: true }) // Force to click hidden input inside switch
      .should('be.checked');

    cy.get('[data-cy=submit-create-game]').should('be.visible')
      .click();
    assertSnackbar('Game name cannot exceed 50 characters', 'error', 'newgame');
  });

  it('Cancels create game dialog', () => {
    cy.get('[data-cy=create-game-btn]').click();
    cy.get('[data-cy=create-game-dialog]')
      .should('be.visible')
      .find('[data-cy=game-name-input]')
      .should('be.visible')
      .type('test game');
    cy.get('[data-cy=cancel-create-game]').should('be.visible')
      .click();
    // Game name should be empty
    cy.get('[data-cy=create-game-btn]').click();
    cy.get('[data-cy=create-game-dialog]')
      .should('be.visible')
      .find('[data-cy=game-name-input]')
      .should('not.contain', 'test game');
  });

  it('Does not create game without game name', () => {
    cy.get('[data-cy=create-game-btn]').click();
    cy.get('[data-cy=submit-create-game]').should('be.visible')
      .click();
    // Test DOM
    cy.get('[data-cy=game-list-item]').should('have.length', 0); // No games appear
    // Test Store
    cy.window()
      .its('cuttle.gameStore')
      .then((store) => {
        expect(store.gameId).to.eq(undefined, 'Store game should not have id');
      });
    cy.window()
      .its('cuttle.gameListStore')
      .then((store) => {
        expect(store.openGames.length).to.eq(0, 'Game list should be empty in store, but is not');
      });
    assertSnackbar('Game name cannot be blank', 'error', 'newgame');
  });

  it('Removes a game when both players are ready', () => {
    cy.createGamePlayer({ gameName: 'Test Game', isRanked: false }).then((gameData) => {
      // Sign up 2 users and subscribe them to game
      cy.signupOpponent(opponentOne);
      cy.subscribeOpponent(gameData.gameId);
      cy.readyOpponent(gameData.gameId);

      // The game should exist
      cy.get('[data-cy=game-list-item]').should('have.length', 1);

      cy.signupOpponent(opponentTwo);
      cy.subscribeOpponent(gameData.gameId);

      // The game should still be there after the second player joins
      cy.get('[data-cy=game-list-item]').should('have.length', 1);

      cy.readyOpponent(gameData.gameId);

      // The game should go away after the ready
      cy.get('[data-cy=game-list-item]').should('have.length', 0);
    });
  });
});

describe('Announcement Dialogs', () => {
  it('Shows the Announcement Dialog when user navigates to Home Page for the first time', () => {
    cy.wipeDatabase();
    cy.visit('/');
    cy.signupPlayer(myUser);
    cy.vueRoute('/');

    cy.get('[data-cy=announcement-dialog]').should('be.visible');
    cy.get('[data-cy=announcement-dialog-close]').click();

    cy.get('[data-cy=fannouncement-dialog]').should('not.exist');

    cy.reload();
    cy.get('[data-cy=announcement-dialog]').should('not.exist');
  });
});
