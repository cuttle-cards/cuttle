import { assertLoss, assertVictory, assertStalemate } from '../../../support/helpers';
import { seasonFixtures } from '../../../fixtures/statsFixtures';
import { playerOne, playerTwo, playerThree } from '../../../fixtures/userFixtures';
import { Card } from '../../../fixtures/cards';

const dayjs = require('dayjs');

function startRematchPlayerFirst() {
  cy.get('[data-cy=my-rematch-indicator]')
    .find('[data-cy="lobby-card-container"]')
    .should('not.have.class', 'ready');

  cy.get('[data-cy=gameover-rematch]')
    .click()
    .should('be.disabled');

  cy.get('[data-cy=continue-match-banner]')
    .should('be.visible')
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
  cy.get('#game-menu')
    .should('be.visible')
    .get('[data-cy=concede-initiate]')
    .click();
  cy.get('#request-gameover-dialog')
    .should('be.visible')
    .get('[data-cy=request-gameover-confirm]')
    .click();
}

describe('Creating And Updating Ranked Matches With Rematch', () => {
  beforeEach(function () {
    cy.viewport(1920, 1080);
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

  it('Wins match played with Rematch/Continue Match button', () => {
    // Game 1: Opponent concedes
    cy.concedeOpponent();
    assertVictory({wins: 1, losses: 0, stalemates: 0});
    cy.get('[data-cy=match-score-counter-wins]')
      .should('contain', 1)
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
      cy.get('[data-cy=my-rematch-indicator]')
        .find('[data-cy="lobby-card-container"]')
          .should('not.have.class', 'ready');
      cy.get('[data-cy=opponent-rematch-indicator]')
        .find('[data-cy="lobby-card-container"]')
          .should('have.class', 'ready');
  
      // Player hits rematch and starts new game
      cy.get('[data-cy=gameover-rematch]').click();

      cy.joinRematchOpponent({ oldGameId });
    });

    // Game 2: Player concedes
    cy.get('[data-player-hand-card]')
      .should('have.length', 6);

    concedePlayer();
    assertLoss({wins: 1, losses: 1, stalemates: 0});

    // Game 3 - Stalemate
    startRematchPlayerFirst();
    cy.get('[data-player-hand-card]')
      .should('have.length', 5);

      // Opponent requests stalemate
      cy.stalemateOpponent();

      // Player accepts stalemate
      cy.get('#opponent-requested-stalemate-dialog')
        .should('be.visible')
        .find('[data-cy=accept-stalemate]')
        .click();

      assertStalemate({wins: 1, losses: 1, stalemates: 1});

      // Game 4 - Player wins match
      startRematchPlayerFirst();
      cy.get('[data-player-hand-card]').should('have.length', 6);

      cy.concedeOpponent();
      assertVictory({wins: 2, losses: 1, stalemates: 1});

      // Rematch button and indicators should not display (match is over)
      cy.get('[data-cy=gameover-rematch]')
        .should('not.exist');
      cy.get('[data-cy=my-rematch-indicator]').should('not.exist');
      cy.get('[data-cy=opponent-rematch-indicator]').should('not.exist');

      // Player1 won and Player2 lost
      cy.get('[data-cy=player-match-result]')
        .find('[data-cy-result-img=won]');
      cy.get('[data-cy=opponent-match-result]')
        .find('[data-cy-result-img=lost]');
  });

  it('Loses a ranked match played with the Rematch/Continue Match button', () => {
    // Game 1 - Player concedes
    concedePlayer();
    assertLoss({wins: 0, losses: 1, stalemates: 0});

    // Game 2 - Opponent concedes
    startRematchPlayerFirst();
    cy.get('[data-player-hand-card]').should('have.length', 6);
    cy.concedeOpponent();
    assertVictory({wins: 1, losses: 1, stalemates: 0});

    // Game 3 - Player concedes & loses match
    startRematchPlayerFirst();
    cy.get('[data-player-hand-card]').should('have.length', 5);
    concedePlayer();
    assertLoss({wins: 1, losses: 2, stalemates: 0});

    // Player1 won and Player2 lost
    cy.get('[data-cy=player-match-result]')
      .find('[data-cy-result-img=lost]');
    cy.get('[data-cy=opponent-match-result]')
      .find('[data-cy-result-img=won]');
  });

  it('Shows when opponent declines continuing your ranked match', () => {
    cy.concedeOpponent();
    assertVictory({wins: 1, losses: 0, stalemates: 0});

    cy.url().then((url) => {
      const oldGameId = Number(url.split('/').pop());
      // Opponent declines rematch
      cy.rematchOpponent({ gameId: oldGameId, rematch: false });
    });

    cy.get('[data-cy=opponent-rematch-indicator]')
      .find('[data-cy="player-declined-rematch"]')
        .should('be.visible');

    cy.get('[data-cy=continue-match-banner]')
      .should('be.visible')
      .should('have.class', 'opponent-left')
      .should('contain', 'Opponent left - click to go home.');

    cy.get('[data-cy=gameover-rematch]')
      .should('be.disabled');
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
});

describe('Creating And Updating Casual Games With Rematch', () => {
  beforeEach(function () {
    cy.viewport(1920, 1080);
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
  
  it.only('Unranked games with rematch', function () {
    // Game 1: Opponent concedes
    cy.concedeOpponent();
    assertVictory({wins: 1, losses: 0, stalemates: 0});

    // Game 2: Player concedes
    startRematchPlayerFirst();
    cy.get('[data-player-hand-card]')
      .should('have.length', 6);
    concedePlayer();
    assertLoss({wins: 1, losses: 1, stalemates: 0});

    // Game 3: Player wins with points
    startRematchPlayerFirst();
    cy.get('[data-player-hand-card]')
      .should('have.length', 5);
    cy.loadGameFixture(0, {
      p0Hand: [Card.TEN_OF_DIAMONDS],
      p0Points: [Card.TEN_OF_HEARTS, Card.TEN_OF_SPADES],
      p0FaceCards: [],
      p1Hand: [Card.THREE_OF_CLUBS],
      p1Points: [],
      p1FaceCards: [],
    });

    cy.get('[data-player-hand-card=10-1]').click();
    cy.get('[data-move-choice=points]').click();
    assertVictory({wins: 2, losses: 1, stalemates: 0});
    // cy.window()
    //   .its('cuttle.gameStore')
    //   .then((game) => {
    //     const results = game.currentMatch;
    //     cy.expect(results).to.eq(null);
    //   });
    // cy.get('[data-cy=gameover-rematch]').click();
    // cy.window()
    //   .its('cuttle.gameStore')
    //   .then((game) => {
    //     const { p0Rematch } = game;
    //     const { p1Rematch } = game;

    //     cy.expect(p0Rematch).to.eq(true);
    //     cy.expect(p1Rematch).to.eq(null);
    //   });
    // cy.get('#waiting-for-game-to-start-scrim').should('be.visible');
    // cy.window()
    //   .its('cuttle.gameStore')
    //   .then((game) => {
    //     cy.rematchAndJoinRematchOpponent({ gameId: game.id });
    //   });
    // cy.window()
    //   .its('cuttle.gameStore')
    //   .then((game) => {
    //     const { p0Rematch } = game;
    //     const { p1Rematch } = game;

    //     cy.expect(p0Rematch).to.eq(true);
    //     cy.expect(p1Rematch).to.eq(null);
    //     cy.log('game data is correct after first game');
    //   });

    // // There should now be NO match for the two players
    // cy.request('http://localhost:1337/match').then((res) => {
    //   expect(res.body.length).to.eq(0);
    // });

    // cy.log('Starting second game');
    // cy.url().should('include', '/game');

    // cy.window()
    //   .its('cuttle.gameStore')
    //   .then((game) => {
    //     const { p0Rematch } = game;
    //     const { p1Rematch } = game;

    //     cy.expect(p0Rematch).to.eq(null);
    //     cy.expect(p1Rematch).to.eq(null);
    //   });

    // // 2nd game: Player concedes
    // cy.get('#game-menu-activator').click();
    // cy.get('#game-menu').should('be.visible').get('[data-cy=concede-initiate]').click();
    // cy.get('#request-gameover-dialog').should('be.visible').get('[data-cy=request-gameover-confirm]').click();

    // assertLoss();

    // cy.log('Opponent requests rematch first');
    // cy.window().its('cuttle.gameStore').then((game) => {
    //   cy.expect(game.name).to.eq('Player1 VS Player2 1-0-0');
    // });
    // cy.url().then((url) => {
    //   const oldGameId = url.split('/').pop();
    //   cy.rematchOpponent({ gameId: oldGameId, rematch: true });

    //   cy.get('#game-over-dialog')
    //     .should('be.visible')
    //     .should('contain', 'Player2 wants to rematch')
    //     .get('[data-cy=gameover-rematch]')
    //     .click();
    //   cy.log('Opponent then joins new game');
    //   cy.joinRematchOpponent({ oldGameId });
    // });

    // cy.url().should('include', '/game');

    // // 3rd game: Ends via requested stalemate
    // // Request stalemate
    // cy.get('#game-menu-activator').click();
    // cy.get('#game-menu').should('be.visible').get('[data-cy=stalemate-initiate]').click();
    // cy.get('#request-gameover-dialog').should('be.visible').get('[data-cy=request-gameover-confirm]').click();
    // cy.get('#waiting-for-opponent-stalemate-scrim').should('be.visible');
    // // Opponent confirms
    // cy.stalemateOpponent();
    // assertStalemate();

    // // Play again
    // cy.get('#game-over-dialog').should('be.visible').get('[data-cy=gameover-rematch]').click();
    // cy.window()
    //   .its('cuttle.gameStore')
    //   .then((game) => {
    //     cy.expect(game.name).to.eq('Player1 VS Player2 1-1-0');
    //     cy.rematchAndJoinRematchOpponent({ gameId: game.id });
    //   });
    // cy.url().should('include', '/game');

    // // 4th game
    // cy.get('#game-menu-activator').click();
    // cy.get('#game-menu').should('be.visible').get('[data-cy=concede-initiate]').click();
    // cy.get('#request-gameover-dialog').should('be.visible').get('[data-cy=request-gameover-confirm]').click();
    // assertLoss();
    // cy.get('#game-over-dialog').should('be.visible').get('[data-cy=gameover-rematch]').click();
    // cy.window()
    //   .its('cuttle.gameStore')
    //   .then((game) => {
    //     cy.expect(game.name).to.eq('Player1 VS Player2 1-1-1');
    //     cy.rematchAndJoinRematchOpponent({ gameId: game.id });
    //   });
    // cy.url().should('include', '/game');
  });
});