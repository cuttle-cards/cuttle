import { myUser } from '../../fixtures/userFixtures';

describe('Profile Page', () => {
  beforeEach(() => {
    cy.wipeDatabase();
    cy.visit('/');
    cy.signupPlayer(myUser);
  });

  it('Displays username', () => {
    cy.vueRoute('/my-profile');
    cy.contains('h1', 'My Profile').should('be.visible');
    cy.contains('p', 'Username: myUsername').should('exist');
  });

  it('Shows Discord section when not connected', () => {
    cy.vueRoute('/my-profile');
    cy.contains('h2', 'Discord');
    cy.contains('span', 'Not connected');
  });

  it('Shows Discord connected state', () => {
    cy.vueRoute('/my-profile');

    // Patch auth store to simulate Discord connection
    cy.window().then((win) => {
      const pinia = win.cuttle.app.config.globalProperties.$pinia;
      const authStore = pinia._s.get('auth');

      authStore.$patch({
        identities: [
          {
            provider: 'discord',
            username: 'TestDiscordUser#1234'
          }
        ]
      });
    });

    cy.contains('h2', 'Discord').should('be.visible');
    cy.contains('span', 'Connected as TestDiscordUser#1234').should('be.visible');
    cy.contains('span', 'Not connected').should('not.exist');
  });

  it('Shows fallback when no games', () => {
    cy.vueRoute('/my-profile');
    cy.contains('h1', 'My Profile').should('be.visible');
    cy.contains('No games found').should('be.visible');
  });

  it('Lists mocked finished games and can replay', () => {
    cy.vueRoute('/my-profile');
    cy.contains('h1', 'My Profile').should('be.visible');
    cy.contains('No games found').should('be.visible');
    cy.wait(500);

    // Patch store with mock game data
    cy.window().then((win) => {
      const pinia = win.cuttle.app.config.globalProperties.$pinia;
      const gameHistoryStore = pinia._s.get('gameHistory');

      gameHistoryStore.$patch({
        games: [
          {
            id: 'game-123',
            name: 'Mocked Game',
            isRanked: true,
            winnerLabel: 'You',
            opponentName: 'OpponentUser',
            createdAt: '2025-01-01T00:00:00Z',
          },
          {
            id: 'game-456',
            name: 'Second Game',
            isRanked: false,
            winnerLabel: 'Opponent',
            opponentName: 'AnotherUser',
            createdAt: '2025-02-01T00:00:00Z',
          },
        ],
        loading: false,
      });
    });

    cy.contains('No games found').should('not.exist');
    cy.get('[data-test="game-list-item"]', { timeout: 5000 })
      .should('have.length', 2);
    cy.contains('[data-test="game-list-item"]', 'Mocked Game').should('be.visible');
    cy.contains('[data-test="game-list-item"]', 'Second Game').should('be.visible');

    // Test goToReplay function
    cy.get('[data-test="game-list-item"]')
      .contains('Mocked Game')
      .parents('[data-test="game-list-item"]')
      .find('button')
      .contains('Replay')
      .click();

    cy.url().should('include', '/spectate/game-123');
  });

  it('Shows fallback when loadMyGames fails', () => {
    // Stub console.error to verify error logging
    cy.visit('/').then((win) => {
      cy.stub(win.console, 'error').as('consoleError');
    });

    // Stub loadMyGames before component mounts
    cy.window().then((win) => {
      const pinia = win.cuttle.app.config.globalProperties.$pinia;
      const gameHistoryStore = pinia._s.get('gameHistory');

      cy.stub(gameHistoryStore, 'loadMyGames').rejects(new Error('Network error'));
    });

    cy.vueRoute('/my-profile');
    cy.contains('h1', 'My Profile').should('be.visible');
    cy.contains('No games found').should('be.visible');
    cy.get('[data-test="game-list-item"]').should('not.exist');
    cy.get('@consoleError').should('be.calledWithMatch', 'Failed to fetch games');
  });
});
