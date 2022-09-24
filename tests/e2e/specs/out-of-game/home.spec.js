import { assertSnackbarError } from '../../support/helpers';
import {
  username as playerUsername,
  validPassword as playerPassword,
  opponentUsername,
  opponentPassword,
} from '../../support/helpers';

function setup() {
  cy.wipeDatabase();
  cy.visit('/');
  cy.signupPlayer(playerUsername, playerPassword);
  cy.vueRoute('/');
}
function assertSuccessfulJoin(gameState) {
  expect(gameState.id).to.not.eq(null);
  cy.url().should('include', '/lobby/');
  cy.contains('h1', `Lobby for ${gameState.name}`);
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
      'https://human-ai-interaction.github.io/cuttle-bot/'
    );
    cy.get('[data-cy=rules-link]').click();
    cy.hash().should('eq', '#/rules');
  });
  it('Logs user out', () => {
    cy.get('[data-nav=Logout]').click();
    cy.contains('h1', 'Log In');
    cy.get('[data-nav=Login]').should('be.visible');
    cy.get('[data-nav=Home]').should('not.exist');
  });
  it('Sends list of games when session data includes invalid game id', () => {
    cy.signupOpponent(opponentUsername, opponentPassword);
    cy.setBadSession();
    cy.requestGameList();
    cy.requestGameList();
  });
});

describe('Home - Game List', () => {
  beforeEach(setup);

  it('Displays a game for every open game on the server', () => {
    cy.createGamePlayer({ gameName: '111', ranked: false });
    cy.createGamePlayer({ gameName: '33', ranked: false });
    cy.get('[data-cy=game-list-item]').should('have.length', 2);
  });
  it('Displays placeholder text when no games are available', () => {
    cy.get('[data-cy=text-if-no-game]').should('have.text', 'No Active Games');
    cy.contains('p', 'No Active Games');
  });
  it('Adds a new game to the list when one comes in through the socket', () => {
    cy.createGamePlayer({ gameName: '111', ranked: false });
    cy.createGamePlayer({ gameName: '33', ranked: false });
    cy.get('[data-cy=game-list-item]').should('have.length', 2);
    cy.signupOpponent(opponentUsername, opponentPassword);
    cy.createGameOpponent('Game made by other player');
    cy.get('[data-cy=game-list-item]')
      .should('have.length', 3)
      .contains('Game made by other player');
  });
  it('Joins an open game', () => {
    cy.window()
      .its('cuttle.app.$store.state.game')
      .then((gameState) => {
        expect(gameState.id).to.eq(null);
      });
    cy.createGamePlayer({ gameName: 'Test Game', ranked: false });
    cy.get('[data-cy=game-list-item]').contains('button.v-btn', 'JOIN').click();
    cy.hash().should('contain', '#/lobby');
    cy.window()
      .its('cuttle.app.$store.state.game')
      .then((gameState) => {
        assertSuccessfulJoin(gameState);
      });
  });
  it('Joins a game that already has one player', () => {
    /**
     * Set up:
     * Create game, sign up one other user and subscribe them to the game
     */
    cy.createGamePlayer({ gameName: 'Test Game', ranked: false }).then((gameData) => {
      // Sign up new user and subscribe them to game
      cy.signupOpponent('secondUser@aol.com', 'myNewPassword');
      cy.subscribeOpponent(gameData.gameId);
      // Our user then joins through UI
      cy.get('[data-cy=game-list-item]').contains('button.v-btn', 'JOIN').click();
      // Should have redirected to lobby page and updated store
      cy.hash().should('contain', '#/lobby');
      cy.window()
        .its('cuttle.app.$store.state.game')
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
    cy.createGamePlayer({ gameName: 'Test Game', ranked: false }).then((gameData) => {
      // Test that JOIN button starts enabled
      cy.contains('button.v-btn', 'JOIN').should('not.be.disabled');
      // Sign up 2 users and subscribe them to game
      cy.signupOpponent('secondUser@aol.com', 'myNewPassword');
      cy.subscribeOpponent(gameData.gameId);
      cy.signupOpponent('thirdUser@facebook.com', 'anotherUserPw');
      cy.subscribeOpponent(gameData.gameId);

      // Test that join button is now disabled
      cy.contains('button.v-btn', 'JOIN').should('be.disabled');
    });
  });

  it('Re-enable join when a user leaves a full lobby', () => {
    /**
     * Set up:
     * Create game, sign up two other users, subscribe them to the game, leave one user
     */
    cy.createGamePlayer({ gameName: 'Test Game', ranked: false }).then((gameData) => {
      // Test that JOIN button starts enabled
      cy.contains('button.v-btn', 'JOIN').should('not.be.disabled');
      // Sign up 2 users and subscribe them to game
      cy.signupOpponent('secondUser@aol.com', 'myNewPassword');
      cy.subscribeOpponent(gameData.gameId);
      cy.signupOpponent('thirdUser@facebook.com', 'anotherUserPw');
      cy.subscribeOpponent(gameData.gameId);

      // Test that join button is now disabled
      cy.contains('button.v-btn', 'JOIN').should('be.disabled');

      cy.leaveLobbyOpponent(gameData.gameId);
      cy.contains('button.v-btn', 'JOIN').should('not.be.disabled');
    });
  });
});

describe('Home - Create Game', () => {
  beforeEach(setup);
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
      .its('cuttle.app.$store.state.gameList.games')
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
      .its('cuttle.app.$store.state.gameList.games')
      .then((games) => {
        expect(games.length).to.eq(1, 'Expect exactly 1 game in store');
        expect(games[0].numPlayers).to.eq(
          0,
          'Expect no players in gameLists game in store, but found some'
        );
        expect(games[0].status).to.eq(true, 'Expect game to have status true');
        expect(games[0].ranked).to.eq(false, 'Expect game to be ranked');
      });
  });

  it('Creates a new ranked game', () => {
    cy.get('[data-cy=create-game-btn]').click();
    cy.get('[data-cy=create-game-dialog]')
      .should('be.visible')
      .find('[data-cy=game-name-input]')
      .should('be.visible')
      .type('test game');

    cy.get('[data-cy=create-game-ranked-switch]')
      .should('not.be.checked')
      .click({ force: true }) // Force to click hidden input inside switch
      .should('be.checked');

    cy.get('[data-cy=submit-create-game]').should('be.visible').click();
    // Test store
    cy.window()
      .its('app.$store.state.gameList.games')
      .then((games) => {
        expect(games.length).to.eq(1, 'Expect exactly 1 game in store');
        expect(games[0].numPlayers).to.eq(
          0,
          'Expect no players in gameLists game in store, but found some'
        );
        expect(games[0].status).to.eq(true, 'Expect game to have status true');
        expect(games[0].ranked).to.eq(true, 'Expect game to be ranked');
      });
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
      .its('cuttle.app.$store.state')
      .then((state) => {
        expect(state.game.gameId).to.eq(undefined, 'Store game should not have id');
        expect(state.gameList.games.length).to.eq(
          0,
          'Game list should be empty in store, but is not'
        );
      });
    assertSnackbarError('Game name cannot be blank', 'newgame');
  });
  it('Removes a game when both players are ready', () => {
    cy.createGamePlayer({ gameName: 'Test Game', ranked: false }).then((gameData) => {
      // Sign up 2 users and subscribe them to game
      cy.signupOpponent('remotePlayer1@cuttle.cards', 'myNewPassword');
      cy.subscribeOpponent(gameData.gameId);
      cy.readyOpponent(gameData.gameId);

      // The game should exist
      cy.get('[data-cy=game-list-item]').should('have.length', 1);

      cy.signupOpponent('remotePlayer2@cuttle.cards', 'anotherUserPw');
      cy.subscribeOpponent(gameData.gameId);

      // The game should still be there after the second player joins
      cy.get('[data-cy=game-list-item]').should('have.length', 1);

      cy.readyOpponent(gameData.gameId);

      // The game should go away after the ready
      cy.get('[data-cy=game-list-item]').should('have.length', 0);
    });
  });
});
