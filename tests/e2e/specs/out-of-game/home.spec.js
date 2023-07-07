import { assertSnackbarError } from '../../support/helpers';
import { Card } from '../../fixtures/cards';
import { myUser, opponentOne, opponentTwo, playerOne, playerTwo } from '../../fixtures/userFixtures';
import { SnackBarError } from '../../fixtures/snackbarError';

function setup() {
  cy.wipeDatabase();
  cy.visit('/');
  cy.signupPlayer(myUser);
  cy.vueRoute('/');
}

function assertSuccessfulJoin(gameState) {
  expect(gameState.id).to.not.eq(null);
  cy.url().should('include', '/lobby/');
  cy.contains('h1', `Lobby for ${gameState.name}`);
}

function toggleInput(selector, checked = false) {
  const before = checked ? 'be.checked' : 'not.be.checked';
  const after = checked ? 'not.be.checked' : 'be.checked';
  cy.get(`${selector} input`)
    .should(before)
    .click({ force: true }) // Force to click hidden input inside switch
    .should(after);
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
    cy.contains('h1', 'Games');
    cy.get('#logo');
  });

  it('Play AI and Rules page links work', () => {
    cy.get('[data-cy=ai-link]').should(
      'have.attr',
      'href',
      'https://human-ai-interaction.github.io/cuttle-bot/',
    );
    cy.get('[data-cy=rules-link]').click();
    cy.hash().should('eq', '#/rules');
  });

  it('Logs user out', () => {
    cy.get('[data-nav=Logout]').click();
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
      cy.get('[data-cy=text-if-no-game]').should('have.text', 'No Active Games');
      cy.contains('p', 'No Active Games');
    });

    it('Adds a new game to the list when one comes in through the socket', () => {
      cy.createGamePlayer({ gameName: '111', isRanked: false });
      cy.createGamePlayer({ gameName: '33', isRanked: false });
      cy.get('[data-cy=game-list-item]').should('have.length', 2);
      cy.signupOpponent(opponentOne);
      cy.createGameOpponent('Game made by other player');
      cy.get('[data-cy=game-list-item]').should('have.length', 3).contains('Game made by other player');
    });

    it('Joins an open game', () => {
      cy.window()
        .its('cuttle.app.config.globalProperties.$store.state.game')
        .then((gameState) => {
          expect(gameState.id).to.eq(null);
        });
      cy.createGamePlayer({ gameName: 'Test Game', isRanked: false });
      cy.get('[data-cy=game-list-item]').contains('button.v-btn', 'Play').click();
      cy.hash().should('contain', '#/lobby');
      cy.window()
        .its('cuttle.app.config.globalProperties.$store.state.game')
        .then((gameState) => {
          assertSuccessfulJoin(gameState);
        });
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
      cy.get('[data-cy=game-list-item]').contains('button.v-btn', 'Play').click();
      // Should have redirected to lobby page and updated store
      cy.hash().should('contain', '#/lobby');
      cy.window()
        .its('cuttle.app.config.globalProperties.$store.state.game')
        .then((gameState) => {
          // expect(gameState.gameId).to.not.eq(null);
          assertSuccessfulJoin(gameState);
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
      cy.contains('button.v-btn', 'Play').should('not.be.disabled');
      // Sign up 2 users and subscribe them to game
      cy.signupOpponent(opponentOne);
      cy.subscribeOpponent(gameData.gameId);
      cy.signupOpponent(opponentTwo);
      cy.subscribeOpponent(gameData.gameId);

      // Test that join button is now disabled
      cy.contains('[data-cy-join-game]', 'Play').should('be.disabled');

      // Manually re-enable join button to confirm backend rejects request
      cy.window().its('cuttle.app.config.globalProperties.$store')
        .invoke('commit', 'updateGameStatus', {id: gameData.gameId, newStatus: true});
      cy.contains('[data-cy-join-game]', 'Play')
        .should('not.be.disabled')
        .click()
        .should('be.disabled');

      assertSnackbarError(SnackBarError.GAME_IS_FULL, 'newgame');


    });
  });

  it('Re-enable join when a user leaves a full lobby', () => {
    /**
     * Set up:
     * Create game, sign up two other users, subscribe them to the game, leave one user
     */
    cy.createGamePlayer({ gameName: 'Test Game', isRanked: false }).then((gameData) => {
      // Test that JOIN button starts enabled
      cy.contains('button.v-btn', 'Play').should('not.be.disabled');
      // Sign up 2 users and subscribe them to game
      cy.signupOpponent(opponentOne);
      cy.subscribeOpponent(gameData.gameId);
      cy.signupOpponent(opponentTwo);
      cy.subscribeOpponent(gameData.gameId);

      // Test that join button is now disabled
      cy.contains('[data-cy-join-game]', 'Play').should('be.disabled');

      cy.leaveLobbyOpponent(gameData.gameId);
      cy.contains('[data-cy-join-game]', 'Play').should('not.be.disabled');
    });
  });

  describe('Spectating games', () => {
    it('Spectates a game', () => {
      cy.createGamePlayer({ gameName: 'Test Game', isRanked: false }).then(({ gameId }) => {
        // Test that JOIN button starts enabled
        cy.contains(`[data-cy-join-game=${gameId}]`, 'Play').should('not.be.disabled');
        // Sign up 2 users and subscribe them to game
        cy.signupOpponent(playerOne);
        cy.subscribeOpponent(gameId);
        // Opponents start game, it appears as spectatable
        cy.readyOpponent(gameId);
        cy.signupOpponent(playerTwo);
        cy.subscribeOpponent(gameId, 1);
        cy.contains(`[data-cy-join-game=${gameId}]`, 'Play').should('be.disabled');

        // Switch to spectate tab
        cy.get('[data-cy-game-list-selector=spectate]').click();
        cy.get('[data-cy=no-spectate-game-text]').should('contain', 'No Games Available to Spectate');

        // The other game starts -- should now appear in spectate list
        cy.readyOpponent(gameId);
        cy.get(`[data-cy-spectate-game=${gameId}]`).click();

        cy.url().should('include', '/spectate/');
        cy.window()
          .its('cuttle.app.config.globalProperties.$store.state.game')
          .then((gameState) => {
            expect(gameState.id).to.not.eq(null);
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
        cy.get(`[data-cy-spectate-game=${gameId}]`).should('be.visible').and('not.be.disabled');
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
        cy.get(`[data-cy-spectate-game=${gameId}]`).should('be.visible').and('not.be.disabled');
        // Disconnect the socket then finish the game -- UI misses the update
        cy.window().its('cuttle.app.config.globalProperties.$store').invoke('dispatch', 'disconnectSocket');
        cy.concedeOpponent();
        cy.window().its('cuttle.app.config.globalProperties.$store').invoke('dispatch', 'reconnectSocket');
        cy.get(`[data-cy-spectate-game=${gameId}]`).click();
        assertSnackbarError('Unable to spectate game', 'newgame');
        // Spectate button should now be disabled
        cy.get(`[data-cy-spectate-game=${gameId}]`).should('be.disabled');
      });
      // Refresh page -- no games available to spectate
      cy.visit('/');
      cy.get('[data-cy-game-list-selector=spectate]').click();
      cy.get('[data-cy=no-spectate-game-text]').should('contain', 'No Games Available to Spectate');
    });

    it('Allows spectating game that has not started yet and displays overlay until game starts', () => {
      cy.signupOpponent(playerOne);
      cy.createGameOpponent('Game where spectator joins before it starts').then(({ gameId }) => {
        cy.subscribeOpponent(gameId);
        cy.readyOpponent(gameId);
        // Second player signs up, joins but does not ready up yet
        cy.signupOpponent(playerTwo);
        cy.subscribeOpponent(gameId);

        // User spectates game that hasn't started yet
        cy.visit('/');
        cy.get('[data-cy-game-list-selector=spectate]').click();
        cy.get(`[data-cy-spectate-game=${gameId}]`).click();

        // User leaves and goes home
        cy.get('#waiting-for-game-to-start-scrim').should('be.visible');
        cy.get('[data-cy=leave-unstarted-game-button]').click();

        // User re-joins same game as spectator
        cy.get('[data-cy-game-list-selector=spectate]').click();
        cy.get(`[data-cy-spectate-game=${gameId}]`).click();
        cy.get('#waiting-for-game-to-start-scrim').should('be.visible');

        // P1 readies up and game starts
        cy.readyOpponent(gameId);
        cy.get('#waiting-for-game-to-start-scrim').should('not.exist');
        cy.get('[data-player-hand-card]').should('have.length', 5);
      });
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
        cy.contains('[data-cy-join-game]', 'Play').should('not.exist');
        // Existing game is available to spectate
        cy.get('[data-cy-game-list-selector=spectate]').click();
        cy.get(`[data-cy-spectate-game=${gameId}]`).click();
      });
    });

    it('Disables spectate button if on home view before game finishes', () => {
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
        p0Hand: [Card.SEVEN_OF_CLUBS],
        p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
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
        p0Hand: [Card.EIGHT_OF_SPADES],
        p0Points: [Card.SEVEN_OF_SPADES, Card.SEVEN_OF_HEARTS],
        p0FaceCards: [],
        p1Hand: [Card.EIGHT_OF_HEARTS],
        p1Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_CLUBS],
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
        p0Hand: [Card.EIGHT_OF_SPADES],
        p0Points: [Card.SEVEN_OF_SPADES, Card.SEVEN_OF_HEARTS],
        p0FaceCards: [],
        p1Hand: [Card.EIGHT_OF_HEARTS],
        p1Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_CLUBS],
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

    cy.get('[data-cy=create-game-btn]').click();
    cy.get('[data-cy=create-game-dialog]').should('be.visible');

    toggleInput('[data-cy=create-game-ranked-switch]');

    cy.get('[data-cy=ranked-info-button]').should('exist');

    // Reload to get a fresh session so we use localStorage
    cy.reload();

    // Should stay checked
    cy.get('[data-cy=create-game-btn]').click();
    cy.get('[data-cy=create-game-dialog]').should('be.visible');

    toggleInput('[data-cy=create-game-ranked-switch]', true);

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
    cy.get('[data-cy=game-list-item]')
      .should('have.length', 1)
      .should('include.text', 'test game')
      .should('include.text', '0 / 2 players');
    // Test store
    cy.window()
      .its('cuttle.app.config.globalProperties.$store.state.gameList.openGames')
      .then((games) => {
        expect(games.length).to.eq(1, 'Expect exactly 1 game in store');
        expect(games[0].numPlayers).to.eq(0, 'Expect 0 players in game in store');
        expect(games[0].status).to.eq(true, 'Expect game to have status true');
      });
  });

  it('Creates a new unranked game by hitting the submit button', () => {
    cy.get('[data-cy=create-game-btn]').click();
    cy.get('[data-cy=create-game-dialog]')
      .should('be.visible')
      .find('[data-cy=game-name-input]')
      .should('be.visible')
      .type('test game');
    cy.get('[data-cy=submit-create-game]').should('be.visible').click();

    cy.get('[data-cy=create-game-dialog]').should('not.be.visible');
    //Test DOM
    cy.get('[data-cy=game-list-item]')
      .should('have.length', 1)
      .should('include.text', 'test game')
      .should('include.text', '0 / 2 players');
    // Test store
    cy.window()
      .its('cuttle.app.config.globalProperties.$store.state.gameList.openGames')
      .then((games) => {
        expect(games.length).to.eq(1, 'Expect exactly 1 game in store');
        expect(games[0].numPlayers).to.eq(0, 'Expect no players in gameLists game in store, but found some');
        expect(games[0].status).to.eq(true, 'Expect game to have status true');
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

    toggleInput('[data-cy=create-game-ranked-switch]');

    cy.get('[data-cy=submit-create-game]').should('be.visible').click();

    // Test store
    cy.window()
      .its('cuttle.app.config.globalProperties.$store.state.gameList.openGames')
      .then((games) => {
        expect(games.length).to.eq(1, 'Expect exactly 1 game in store');
        expect(games[0].numPlayers).to.eq(0, 'Expect no players in gameLists game in store, but found some');
        expect(games[0].status).to.eq(true, 'Expect game to have status true');
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

    cy.get('[data-cy=submit-create-game]').should('be.visible').click();
    assertSnackbarError('Game name cannot exceed 50 characters', 'newgame');
  });

  it('Cancels create game dialog', () => {
    cy.get('[data-cy=create-game-btn]').click();
    cy.get('[data-cy=create-game-dialog]')
      .should('be.visible')
      .find('[data-cy=game-name-input]')
      .should('be.visible')
      .type('test game');
    cy.get('[data-cy=cancel-create-game]').should('be.visible').click();
    // Game name should be empty
    cy.get('[data-cy=create-game-btn]').click();
    cy.get('[data-cy=create-game-dialog]')
      .should('be.visible')
      .find('[data-cy=game-name-input]')
      .should('not.contain', 'test game');
  });

  it('Does not create game without game name', () => {
    cy.get('[data-cy=create-game-btn]').click();
    cy.get('[data-cy=submit-create-game]').should('be.visible').click();
    // Test DOM
    cy.get('[data-cy=game-list-item]').should('have.length', 0); // No games appear
    // Test Store
    cy.window()
      .its('cuttle.app.config.globalProperties.$store.state')
      .then((state) => {
        expect(state.game.gameId).to.eq(undefined, 'Store game should not have id');
        expect(state.gameList.openGames.length).to.eq(0, 'Game list should be empty in store, but is not');
      });
    assertSnackbarError('Game name cannot be blank', 'newgame');
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
