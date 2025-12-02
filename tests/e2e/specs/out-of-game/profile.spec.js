import { myUser, playerOne, playerTwo } from '../../fixtures/userFixtures';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import GameStatus from '../../../../utils/GameStatus.json';

dayjs.extend(utc);

describe('Profile Page', () => {
  beforeEach(() => {
    cy.wipeDatabase();
    cy.visit('/');
  });

  describe('Profile page content', function() {
    beforeEach(() => {
      cy.signupPlayer(myUser);
    });

    it('Displays username', function() {
      cy.vueRoute('/my-profile');
      cy.contains('h1', 'My Profile').should('be.visible');
      cy.get('[data-cy=username]').should('contain', myUser.username);
    });

    it('Shows Discord section when not connected', () => {
      cy.vueRoute('/my-profile');
      cy.contains('h2', 'Discord');
      cy.get('[data-cy=not-connected]').should('be.visible');
    });

    it('Shows Discord connected state', function() {
      cy.vueRoute('/my-profile');

      cy.window().its('cuttle.authStore')
        .then((authStore) => {
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
      cy.get('[data-cy=discord-username]')
        .should('be.visible')
        .should('contain', 'TestDiscordUser#1234');
      cy.get('[data-cy=not-connected]').should('not.exist');
    });

    it('Shows fallback when no games', function() {
      cy.vueRoute('/my-profile');
      cy.contains('h1', 'My Profile').should('be.visible');
      cy.contains('No games found').should('be.visible');
    });
  });



  describe('Profile Page - Scrolling and game list tests', () => {
    beforeEach(() => {
      cy.signupOpponent(myUser);
      cy.signupOpponent(playerOne);
    });

    it('Loads more games on scroll', function() {
      const games = Array.from({ length: 30 }).map((_, i) => ({
        name: `Game ${i + 1}`,
        status: GameStatus.FINISHED,
        isRanked: true,
        createdAt: dayjs.utc().subtract(i, 'day')
          .toDate(),
        p0: this[`${playerOne.username}Id`],
        p1: this[`${myUser.username}Id`],
        winner: this[`${myUser.username}Id`],
      }));

      cy.loadFinishedGameFixtures(games);
      cy.loginPlayer(myUser);
      cy.vueRoute('/my-profile');

      cy.get('[data-cy="game-list-item"]')
        .should('have.length', 8);

      cy.get('[data-cy="game-list"]').scrollTo('bottom', { ensureScrollable: false });
      cy.window().its('cuttle.myGamesStore')
        .should(myGamesStore => {
          expect(myGamesStore.games.length).to.eq(20);
        });
      cy.get('[data-cy="game-list-item"]')
        .contains('Game 20', { timeout: 5000 })
        .should('be.visible')
        .scrollIntoView();

      cy.wait(1000);

      cy.get('[data-cy="game-list"]').scrollTo('bottom', { ensureScrollable: false });
      cy.window().its('cuttle.myGamesStore')
        .should(myGamesStore => {
          expect(myGamesStore.games.length).to.eq(30);
        });

      cy.get('[data-cy="game-list-item"]')
        .contains('Game 30', { timeout: 5000 })
        .should('be.visible');
    });

    it('Does not load more games when hasMore is false', function() {
      const games = Array.from({ length: 10 }).map((_, i) => ({
        name: `Game ${i + 1}`,
        status: GameStatus.FINISHED,
        isRanked: true,
        createdAt: dayjs.utc().subtract(i, 'day')
          .toDate(),
        p0: this[`${playerOne.username}Id`],
        p1: this[`${myUser.username}Id`],
        winner: this[`${myUser.username}Id`],
      }));

      cy.loadFinishedGameFixtures(games);
      cy.loginPlayer(myUser);
      cy.vueRoute('/my-profile');

      cy.window().its('cuttle.myGamesStore')
        .then(myGamesStore => {
          myGamesStore.hasMore = false;
          myGamesStore.loading = false;
        });
    });

    it('Resets games on unmount', function() {
      cy.loadFinishedGameFixtures([
        {
          name: 'Temporary Game',
          status: GameStatus.FINISHED,
          isRanked: true,
          createdAt: dayjs.utc().subtract(1, 'day')
            .toDate(),
          p0: this[`${playerOne.username}Id`],
          p1: this[`${myUser.username}Id`],
          winner: this[`${myUser.username}Id`],
        }
      ]);

      cy.loginPlayer(myUser);
      cy.vueRoute('/my-profile');
      cy.get('[data-cy="game-list-item"]').should('exist');

      cy.vueRoute('/');

      cy.window().its('cuttle.myGamesStore')
        .then(myGamesStore => {
          expect(myGamesStore.games.length).to.eq(0);
        });
    });
  });



  describe('Profile Page - Populated game list content', () => {
    beforeEach(() => {
      cy.wipeDatabase();
      cy.visit('/');
      cy.signupOpponent(myUser);
      cy.signupOpponent(playerOne);
      cy.signupOpponent(playerTwo);
    });

    it('Lists finished games with fixture data', function() {
      cy.loadFinishedGameFixtures([
        {
          name: 'Opponent Won Game',
          status: GameStatus.FINISHED,
          isRanked: true,
          createdAt: dayjs.utc().subtract(1, 'day')
            .toDate(),
          p0: this[`${playerOne.username}Id`],
          p1: this[`${myUser.username}Id`],
          winner: this[`${playerOne.username}Id`],
        },
        {
          name: 'Player Won Game',
          status: GameStatus.FINISHED,
          isRanked: true,
          createdAt: dayjs.utc().subtract(1, 'day')
            .toDate(),
          p0: this[`${playerOne.username}Id`],
          p1: this[`${myUser.username}Id`],
          winner: this[`${myUser.username}Id`],
        },
        {
          name: 'Stalemate Game',
          status: GameStatus.FINISHED,
          isRanked: false,
          createdAt: dayjs.utc().subtract(2, 'days')
            .toDate(),
          p0: this[`${playerOne.username}Id`],
          p1: this[`${myUser.username}Id`],
          winner: null,
        }
      ]);

      cy.loginPlayer(myUser);

      cy.vueRoute('/my-profile');
      cy.contains('h1', 'My Profile').should('be.visible');

      cy.contains('No games found').should('not.exist');

      cy.get('[data-cy="game-list-item"]')
        .should('have.length', 3);

      cy.contains('[data-cy="game-list-item"]', 'Player Won Game').should('be.visible');
      cy.contains('[data-cy="game-list-item"]', 'Opponent Won Game').should('be.visible');
      cy.contains('[data-cy="game-list-item"]', 'Stalemate Game').should('be.visible');

      cy.contains('[data-cy="game-list-item"]', 'Player Won Game')
        .find('[data-cy="replay-link"] a, [data-cy="replay-link"]')
        .should('have.attr', 'href')
        .and('include', '/spectate/');
    });

    it('Shows correct icons for win/loss/stalemate', function() {
      cy.loadFinishedGameFixtures([
        {
          name: 'Opponent Won Game',
          status: GameStatus.FINISHED,
          isRanked: true,
          createdAt: dayjs.utc().subtract(1, 'day')
            .toDate(),
          p0: this[`${playerOne.username}Id`],
          p1: this[`${myUser.username}Id`],
          winner: this[`${playerOne.username}Id`],
        },
        {
          name: 'Player Won Game',
          status: GameStatus.FINISHED,
          isRanked: true,
          createdAt: dayjs.utc().subtract(1, 'day')
            .toDate(),
          p0: this[`${playerOne.username}Id`],
          p1: this[`${myUser.username}Id`],
          winner: this[`${myUser.username}Id`],
        },
        {
          name: 'Stalemate Game',
          status: GameStatus.FINISHED,
          isRanked: false,
          createdAt: dayjs.utc().subtract(2, 'days')
            .toDate(),
          p0: this[`${playerOne.username}Id`],
          p1: this[`${myUser.username}Id`],
          winner: null,
        }
      ]);

      cy.loginPlayer(myUser);

      cy.vueRoute('/my-profile');

      cy.contains('No games found').should('not.exist');

      cy.get('[data-cy="game-list-item"]')
        .should('have.length', 3);

      cy.get('[data-cy="game-list-item"]').eq(0)
        .find('[data-cy=loser-icon]')
        .should('exist');

      cy.get('[data-cy="game-list-item"]').eq(1)
        .find('[data-cy=winner-icon]')
        .should('exist');

      cy.get('[data-cy="game-list-item"]').eq(2)
        .find('[data-cy=stalemate-icon]')
        .should('exist');
    });

    it('Shows correct ranked/casual labels', function() {
      cy.loadFinishedGameFixtures([
        {
          name: 'Ranked Game',
          status: GameStatus.FINISHED,
          isRanked: true,
          createdAt: dayjs.utc().subtract(1, 'day')
            .toDate(),
          p0: this[`${playerOne.username}Id`],
          p1: this[`${myUser.username}Id`],
          winner: this[`${myUser.username}Id`],
        },
        {
          name: 'Casual Game',
          status: GameStatus.FINISHED,
          isRanked: false,
          createdAt: dayjs.utc().subtract(2, 'days')
            .toDate(),
          p0: this[`${playerOne.username}Id`],
          p1: this[`${myUser.username}Id`],
          winner: null,
        }
      ]);

      cy.loginPlayer(myUser);

      cy.vueRoute('/my-profile');

      cy.get('[data-cy="game-list-item"]').eq(0)
        .should('contain', 'Ranked');

      cy.get('[data-cy="game-list-item"]').eq(1)
        .should('contain', 'Casual');
    });

    it('Shows opponent names correctly', function() {
      cy.loadFinishedGameFixtures([
        {
          name: 'Game vs PlayerOne',
          status: GameStatus.FINISHED,
          isRanked: true,
          createdAt: dayjs.utc().subtract(1, 'day')
            .toDate(),
          p0: this[`${playerOne.username}Id`],
          p1: this[`${myUser.username}Id`],
          winner: this[`${myUser.username}Id`],
        },
        {
          name: 'Game vs PlayerTwo',
          status: GameStatus.FINISHED,
          isRanked: false,
          createdAt: dayjs.utc().subtract(2, 'days')
            .toDate(),
          p0: this[`${playerTwo.username}Id`],
          p1: this[`${myUser.username}Id`],
          winner: this[`${playerTwo.username}Id`],
        }
      ]);

      cy.loginPlayer(myUser);

      cy.vueRoute('/my-profile');

      cy.get('[data-cy="game-list-item"]').eq(0)
        .should('contain', playerOne.username);

      cy.get('[data-cy="game-list-item"]').eq(1)
        .should('contain', playerTwo.username);
    });
  });
});
