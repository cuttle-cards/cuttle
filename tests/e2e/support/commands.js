import { getCardIds, hasValidSuitAndRank, cardsMatch, printCard } from './helpers';
import { myUser, opponentOne, playerOne, playerTwo } from '../fixtures/userFixtures';
import MoveType from '../../../utils/MoveType.json';

/**
 * Require & configure socket connection to server
 */
const io = require('sails.io.js')(require('socket.io-client'));
io.sails.url = 'localhost:1337';
io.sails.useCORSRouteToGetCookie = false;
const env = Cypress.env('VITE_USE_GAMESTATE_API');

Cypress.Commands.add('skipOnGameStateApi', () => {
  if (env) {
    cy.state('runnable').ctx.skip();
  }
});

const transformGameUrl = (api, slug, gameId = null) => {
  if (!env) {
    return Cypress.Promise.resolve(`/api/${api}/${slug}`);
  }

  switch (slug) {
    case 'rematch':
      return cy
        .window()
        .its('cuttle.gameStore.id')
        .then((gameId) => `/api/game/${gameId}/rematch`);
    case 'spectate':
      return gameId ? Cypress.Promise.resolve(`/api/game/${gameId}/spectate/join`) :
        cy
          .window()
          .its('cuttle.gameStore.id')
          .then((gameId) => `/api/game/${gameId}/spectate/join`);
    case'draw':
    case'points':
    case'faceCard':
    case'scuttle':
    case'untargetedOneOff':
    case'targetedOneOff':
    case'jack':
    case'counter':
    case'resolve':
    case'resolveThree':
    case'resolveFour':
    case'resolveFive':
    case'seven/points':
    case'seven/scuttle':
    case'seven/faceCard':
    case'seven/jack':
    case'seven/untargetedOneOff':
    case'seven/targetedOneOff':
    case'pass':
    case'concede':
      return gameId ? Cypress.Promise.resolve(`/api/game/${gameId}/move/`) :
        cy
          .window()
          .its('cuttle.gameStore.id')
          .then((gameId) => `/api/game/${gameId}/move/`);
    default:
      return Cypress.Promise.resolve(`/api/${api}/${slug}`);
  }
};

Cypress.Commands.add('makeSocketRequest', (api, slug, data, method = 'POST', gameId = null) => {
  return transformGameUrl(api, slug, gameId).then((url) => {
    return new Cypress.Promise((resolve, reject) => {
      io.socket.request(
        {
          method,
          url,
          data,
        },
        function handleResponse(res, jwres) {
          if (env && jwres.statusCode === 404) {
            reject('This action is not supported yet in GameState API');
          }
          if (jwres.statusCode !== 200) {
            return reject(jwres.error.message);
          }
          return resolve(res);
        },
      );
    });
  });
});

// Pass error logs to the terminal console
// See https://github.com/cypress-io/cypress/issues/3199#issuecomment-1019270203
// Cypress.Commands.overwrite('log', (subject, message) => cy.task('log', message));

Cypress.Commands.add('wipeDatabase', () => {
  cy.request('localhost:1337/api/test/wipeDatabase');
  cy.log('Wiped database');
});

Cypress.Commands.add('refreshOpponentSocket', () => {
  io.socket.disconnect();
  io.socket.reconnect();
});

Cypress.Commands.add('setBadSession', () => {
  return new Cypress.Promise((resolve) => {
    io.socket.get('/api/test/badSession', function () {
      return resolve();
    });
  });
});

Cypress.Commands.add('loadSeasonFixture', (season) => {
  cy.makeSocketRequest('test', 'loadSeasonFixture', season);
});

Cypress.Commands.add('loadMatchFixtures', (matches) => {
  cy.makeSocketRequest('test', 'loadMatchFixtures', matches);
});

Cypress.Commands.add('loadFinishedGameFixtures', (games) => {
  cy.makeSocketRequest('test', 'loadFinishedGameFixtures', games);
});

Cypress.Commands.add('requestGameList', () => {
  cy.makeSocketRequest('game', 'getList');
});

/**
 * Signs up two players, navigates home, creates game, subscribes, ready's up
 * @param {boolean} alreadyAuthenticated: skips setup steps: db wipe, signup, navigate /
 */
Cypress.Commands.add('setupGameAsP0', (alreadyAuthenticated = false, isRanked = false) => {
  if (!alreadyAuthenticated) {
    cy.wipeDatabase();
    cy.visit('/');
    cy.signupPlayer(myUser);
  }
  cy.createGamePlayer({ gameName: 'Test Game', isRanked }).then((gameSummary) => {
    cy.window()
      .its('cuttle.gameStore')
      .then((store) => store.requestSubscribe(gameSummary.gameId));
    cy.log(`Subscribed to game ${gameSummary.gameId}`);
    cy.vueRoute(`/lobby/${gameSummary.gameId}`);
    cy.wrap(gameSummary).as('gameSummary');
    cy.get('[data-cy=ready-button]').click();
    if (!alreadyAuthenticated) {
      cy.signupOpponent(opponentOne);
    }
    try {
      cy.subscribeOpponent(gameSummary.gameId);
    } catch {
      cy.recoverSessionOpponent(opponentOne);
      cy.subscribeOpponent(gameSummary.gameId);
    }
    cy.readyOpponent();
    // Asserting 5 cards in players hand confirms game has loaded
    cy.get('#player-hand-cards .player-card').should('have.length', 5);
  });
});

Cypress.Commands.add('setupGameAsP1', (alreadyAuthenticated = false, isRanked = false) => {
  if (!alreadyAuthenticated) {
    cy.wipeDatabase();
    cy.visit('/');
    cy.signupPlayer(myUser);
  }
  cy.createGamePlayer({ gameName: 'Test Game', isRanked }).then((gameSummary) => {
    if (!alreadyAuthenticated) {
      cy.signupOpponent(opponentOne);
    }
    try {
      cy.subscribeOpponent(gameSummary.gameId);
    } catch {
      cy.recoverSessionOpponent(opponentOne);
      cy.subscribeOpponent(gameSummary.gameId);
    }
    cy.readyOpponent();
    cy.window()
      .its('cuttle.gameStore')
      .then((store) => store.requestSubscribe(gameSummary.gameId));
    cy.vueRoute(`/lobby/${gameSummary.gameId}`);
    cy.wrap(gameSummary).as('gameSummary');
    cy.get('[data-cy=ready-button]').click();
    // Asserting 6 cards in players hand confirms game has loaded
    cy.get('#player-hand-cards .player-card').should('have.length', 6);
  });
  cy.log('Finished setting up game as p1');
});
Cypress.Commands.add('setupGameAsSpectator', (isRanked = false) => {
  cy.wipeDatabase();
  cy.visit('/');
  cy.signupPlayer(myUser);
  cy.vueRoute('/');
  cy.createGamePlayer({ gameName: 'Spectator Game', isRanked }).then((gameData) => {
    // Test that JOIN button starts enabled
    cy.get('[data-cy-join-game]').should('not.be.disabled');
    // Sign up 2 users and subscribe them to game
    cy.signupOpponent(playerOne);
    cy.subscribeOpponent(gameData.gameId);
    // Opponents start game, it appears as spectatable
    cy.readyOpponent(gameData.gameId);
    cy.signupOpponent(playerTwo);
    cy.subscribeOpponent(gameData.gameId);
    cy.get('[data-cy-join-game]').should('be.disabled');

    // Switch to spectate tab
    cy.get('[data-cy-game-list-selector=spectate]').click();
    cy.get('[data-cy=no-spectate-game-text]').should('contain', 'No Games Available to Spectate');

    // The other game starts -- should now appear in spectate list
    cy.readyOpponent(gameData.gameId);
    cy.wrap(gameData).as('gameData');
    cy.get('[data-cy-spectate-game]').click();
    cy.url().should('include', '/spectate/');
    cy.window()
      .its('cuttle.gameStore')
      .then((game) => {
        expect(game.id).to.not.eq(null);
      });
  });
});

Cypress.Commands.add('signupOpponent', (opponent) => {
  cy.makeSocketRequest('user', 'signup', {
    username: opponent.username,
    password: opponent.password,
  });
});
Cypress.Commands.add('signupPlayer', (player) => {
  cy.window()
    .its('cuttle.authStore')
    .then((store) => store.requestSignup({ username: player.username, password: player.password }));
  cy.log(`Signed up player ${player.username}`);
});
Cypress.Commands.add('loginPlayer', (player) => {
  cy.window()
    .its('cuttle.authStore')
    .then((store) => store.requestLogin({ username: player.username, password: player.password }));
  cy.log(`Logged in as player ${player.username}`);
});

Cypress.Commands.add('createGameOpponent', (name) => {
  cy.makeSocketRequest('game', 'create', {
    gameName: name,
  });
});

Cypress.Commands.add('createGamePlayer', ({ gameName, isRanked }) => {
  return cy
    .window()
    .its('cuttle.gameListStore')
    .then((store) => store.requestCreateGame({ gameName, isRanked }));
});

Cypress.Commands.add('subscribeOpponent', (gameId) => {
  cy.makeSocketRequest('game', 'subscribe', { gameId });
});

Cypress.Commands.add('setOpponentToSpectate', (gameId) => {
  cy.makeSocketRequest('game', 'spectate', { gameId }, 'POST', gameId);
});

Cypress.Commands.add('setOpponentToLeaveSpectate', (gameId) => {
  const slug = `${gameId}/spectate/leave/`;
  cy.makeSocketRequest('game', slug, { gameId }, 'POST');
});

Cypress.Commands.add('readyOpponent', (id) => {
  cy.makeSocketRequest('game', 'ready', { id });
});

Cypress.Commands.add('setIsRankedOpponent', (isRanked) => {
  cy.makeSocketRequest('game', 'setIsRanked', { isRanked });
});

Cypress.Commands.add('toggleInput', (selector, checked = false) => {
  const before = checked ? 'be.checked' : 'not.be.checked';
  const after = checked ? 'not.be.checked' : 'be.checked';
  cy.get(`${selector} input`)
    .should(before)
    .click({ force: true }) // Force to click hidden input inside switch
    .should(after);
});

Cypress.Commands.add('leaveLobbyOpponent', (id) => {
  cy.makeSocketRequest('game', 'leaveLobby', { id });
});

/**
 * Switches the test-controlled io instance to a specified user's session
 * Used to switch between test-controlled players while spectating
 * @param userFixture: {username: string, password: string}
 *   userFixture should be imported from the userFixtures.js file
 */
Cypress.Commands.add('recoverSessionOpponent', (userFixture) => {
  cy.makeSocketRequest('user', 'reLogin', userFixture);
});

Cypress.Commands.add('drawCardOpponent', () => {
  const moveType = MoveType.DRAW;
  cy.makeSocketRequest('game', 'draw', { moveType });
});

/**
 * @param card {suit: number, rank: number}
 */
Cypress.Commands.add('playPointsOpponent', (card) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error('Cannot play opponent points: Invalid card input');
  }
  return cy
    .window()
    .its('cuttle.gameStore')
    .then(({ opponent }) => {
      const foundCard = opponent.hand.find((handCard) => cardsMatch(card, handCard));
      if (!foundCard) {
        throw new Error(
          `Error playing opponents points: could not find ${card.rank} of ${card.suit} in opponent hand`,
        );
      }
      const cardId = foundCard.id;
      const moveType = MoveType.POINTS;
      cy.makeSocketRequest('game', 'points', { moveType, cardId });
    });
});

/**
 * @param card {suit: number, rank: number}
 */
Cypress.Commands.add('playPointsSpectator', (card, pNum) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error('Cannot play opponent points: Invalid card input');
  }
  return cy
    .window()
    .its('cuttle.gameStore')
    .then((game) => {
      const foundCard = game.players[pNum].hand.find((handCard) => cardsMatch(card, handCard));
      if (!foundCard) {
        throw new Error(
          `Error playing points while spectating: could not find ${card.rank} of ${card.suit} in specified player's hand`,
        );
      }

      const moveType = MoveType.POINTS;
      const cardId = foundCard.id;
      cy.makeSocketRequest('game', 'points', { moveType, cardId });
    });
});

Cypress.Commands.add('playPointsById', (cardId) => {
  cy.makeSocketRequest('game', 'points', { cardId });
});

/**
 * @param card {suit: number, rank: number}
 */
Cypress.Commands.add('playOneOffSpectator', (card, pNum) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error('Cannot play opponent one-off as spectator: Invalid card input');
  }
  return cy
    .window()
    .its('cuttle.gameStore')
    .then((game) => {
      const foundCard = game.players[pNum].hand.find((handCard) => cardsMatch(card, handCard));
      if (!foundCard) {
        throw new Error(
          `Error playing one-off while spectating: could not find ${card.rank} of ${card.suit} in specified player's hand`,
        );
      }

      const moveType = MoveType.ONE_OFF;
      const cardId = foundCard.id;
      const opId = game.players[(pNum + 1) % 2].id;
      cy.makeSocketRequest('game', 'untargetedOneOff', { moveType, cardId, opId });
    });
});

/**
 * @param card {suit: number, rank: number}
 */
Cypress.Commands.add('playFaceCardOpponent', (card) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error('Cannot play opponent Face Card: Invalid card input');
  }
  return cy
    .window()
    .its('cuttle.gameStore')
    .then(({ opponent }) => {
      const foundCard = opponent.hand.find((handCard) => cardsMatch(card, handCard));
      if (!foundCard) {
        throw new Error(
          `Error playing opponents Face Card: could not find ${card.rank} of ${card.suit} in opponent hand`,
        );
      }

      const cardId = foundCard.id;
      const moveType = MoveType.FACE_CARD;
      cy.makeSocketRequest('game', 'faceCard', { moveType, cardId });
    });
});

/**
 * @param card {suit: number, rank: number}
 * @param target {suit: number, rank: number}
 */
Cypress.Commands.add('playJackOpponent', (card, target) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error('Cannot play opponent face card: Invalid card input');
  }
  return cy
    .window()
    .its('cuttle.gameStore')
    .then((game) => {
      const player = game.players[game.myPNum];
      const opponent = game.players[(game.myPNum + 1) % 2];
      const foundCard = opponent.hand.find((handCard) => cardsMatch(card, handCard));
      const foundTarget = player.points.find((pointCard) => cardsMatch(target, pointCard));
      if (!foundCard) {
        throw new Error(
          `Error playing opponents jack: could not find ${card.rank} of ${card.suit} in opponent hand`,
        );
      }
      if (!foundTarget) {
        throw new Error(
          `Error playing opponents jack: could not find ${target.rank} of ${target.suit} in player points`,
        );
      }

      const moveType = MoveType.JACK;
      const cardId = foundCard.id;
      const targetId = foundTarget.id;

      cy.makeSocketRequest('game', 'jack', {
        moveType,
        opId: player.id,
        cardId,
        targetId,
      });
    });
});

/**
 * @param card {suit: number, rank: number}
 * @param target {suit: number, rank: number}
 */
Cypress.Commands.add('scuttleOpponent', (card, target) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error('Cannot scuttle as opponent: Invalid card input');
  }
  return cy
    .window()
    .its('cuttle.gameStore')
    .then((game) => {
      const player = game.players[game.myPNum];
      const opponent = game.players[(game.myPNum + 1) % 2];
      const foundCard = opponent.hand.find((handCard) => cardsMatch(card, handCard));
      const foundTarget = player.points.find((pointCard) => cardsMatch(target, pointCard));
      if (!foundCard) {
        throw new Error(
          `Error scuttling as opponent: could not find ${card.rank} of ${card.suit} in opponent hand`,
        );
      }
      if (!foundTarget) {
        throw new Error(
          `Error scuttling as opponent: could not find ${target.rank} of ${target.suit} in player's points`,
        );
      }
      const moveType = MoveType.SCUTTLE;
      cy.makeSocketRequest('game', 'scuttle', {
        moveType,
        opId: player.id,
        cardId: foundCard.id,
        targetId: foundTarget.id,
      });
    });
});

Cypress.Commands.add('playOneOffOpponent', (card) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error('Cannot scuttle as opponent: Invalid card input');
  }
  return cy
    .window()
    .its('cuttle.gameStore')
    .then((game) => {
      const playerId = game.players[game.myPNum].id;
      const opponent = game.players[(game.myPNum + 1) % 2];
      const foundCard = opponent.hand.find((handCard) => cardsMatch(card, handCard));
      if (!foundCard) {
        throw new Error(
          `Error playing untargetted one-off as opponent: could not find ${printCard(card)} in opponent hand`,
        );
      }
      if (foundCard.rank >= 8) {
        throw new Error(
          `Error playing untargetted one-off as opponent: ${printCard(card)} is not a valid oneOff`,
        );
      }

      const moveType = MoveType.ONE_OFF;
      cy.makeSocketRequest('game', 'untargetedOneOff', {
        moveType,
        opId: playerId,
        cardId: foundCard.id,
      });
    });
});

/**
 * @param card {suit: number, rank: number}
 * @param target {suit: number, rank: number}
 * @param targetType string 'faceCard' | 'point' | 'jack'
 */
Cypress.Commands.add('playTargetedOneOffOpponent', (card, target, targetType) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error('Cannot play targeted one-off as opponent: Invalid card input');
  }
  if (!hasValidSuitAndRank(target)) {
    throw new Error('Cannot play targeted one-off as opponent: Invalid target input');
  }
  return cy
    .window()
    .its('cuttle.gameStore')
    .then((game) => {
      const player = game.players[game.myPNum];
      const playerId = player.id;
      const opponent = game.players[(game.myPNum + 1) % 2];
      const foundCard = opponent.hand.find((handCard) => cardsMatch(card, handCard));
      let foundTarget;
      let foundPointCard;
      switch (targetType) {
        case 'point':
          foundTarget = player.points.find((pointCard) => cardsMatch(pointCard, target));
          break;
        case 'faceCard':
          foundTarget = player.faceCards.find((faceCard) => cardsMatch(faceCard, target));
          break;
        case 'jack':
          player.points.forEach((pointCard) => {
            pointCard.attachments.forEach((jack) => {
              if (cardsMatch(jack, target)) {
                foundTarget = jack;
                foundPointCard = pointCard;
              }
            });
          });
          break;
        default:
          throw new Error(
            `Error playing ${printCard(
              card,
            )} as one-off from seven as opponent: invalid target type, ${targetType}`,
          );
      }
      if (!foundCard) {
        throw new Error(
          `Error playing targeted one-off as opponent: could not find ${printCard(card)} in opponent hand`,
        );
      }
      if (!foundTarget) {
        throw new Error(
          `Error playing targeted one-off as opponent: could not find ${printCard(target)} in player field`,
        );
      }
      if (targetType === 'jack' && !foundPointCard) {
        throw new Error(
          'Error playing targeted one-off as opponent: could not find point card in player field',
        );
      }

      const moveType = MoveType.ONE_OFF;
      cy.makeSocketRequest('game', 'targetedOneOff', {
        moveType,
        opId: playerId, // opponent's opponent is the player
        targetId: foundTarget.id,
        cardId: foundCard.id,
        pointId: foundPointCard ? foundPointCard.id : null,
        targetType,
      });
    });
});

/**
 * @param card {suit: number, rank: number}
 */
Cypress.Commands.add('counterOpponent', (card) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error('Cannot play counter as opponent: Invalid card input');
  }
  return cy
    .window()
    .its('cuttle.gameStore')
    .then((game) => {
      const opponent = game.players[(game.myPNum + 1) % 2];
      const opId = game.players[game.myPNum].id;
      const foundCard = opponent.hand.find((handCard) => cardsMatch(card, handCard));
      if (!foundCard) {
        throw new Error(
          `Error countering as opponent: could not find ${card.rank} of ${card.suit} in opponent hand`,
        );
      }

      const moveType = MoveType.COUNTER;
      const cardId = foundCard.id;
      cy.makeSocketRequest('game', 'counter', { moveType, cardId, opId });
    });
});

Cypress.Commands.add('resolveFiveOpponent', (card) => {
  if (card && !hasValidSuitAndRank(card)) {
    throw new Error('Cannot resolve five as opponent: Invalid card input');
  }
  return cy
    .window()
    .its('cuttle.gameStore')
    .then((game) => {
      const foundCard = card ? game.opponent.hand.find((handCard) => cardsMatch(card, handCard)) : null;
      if (card && !foundCard) {
        throw new Error(
          `Error resolving three as opponent: could not find ${card.rank} of ${card.suit} in opponent hand`,
        );
      }

      const moveType = MoveType.RESOLVE_FIVE;
      const cardId = foundCard?.id ?? null;
      cy.makeSocketRequest('game', 'resolveFive', { moveType, cardId });
    });
});

Cypress.Commands.add('resolveThreeOpponent', (card) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error('Cannot resolve three as opponent: Invalid card input');
  }
  return cy
    .window()
    .its('cuttle.gameStore')
    .then((game) => {
      const opId = game.players[game.myPNum].id;
      const foundCard = game.scrap.find((scrapCard) => cardsMatch(card, scrapCard));
      if (!foundCard) {
        throw new Error(
          `Error resolving three as opponent: could not find ${card.rank} of ${card.suit} in scrap`,
        );
      }

      const moveType = MoveType.RESOLVE_THREE;
      const cardId = foundCard.id;
      cy.makeSocketRequest('game', 'resolveThree', { moveType, cardId, opId });
    });
});

Cypress.Commands.add('resolveOpponent', () => {
  return cy
    .window()
    .its('cuttle.gameStore')
    .then((game) => {
      const moveType = MoveType.RESOLVE;
      const opId = game.players[game.myPNum].id;
      cy.makeSocketRequest('game', 'resolve', { moveType, opId });
    });
});

/**
 * Discards 1-2 cards to resolve four
 * @param card1 {suit: number, rank: number} OPTIONAL
 * @param card2 {suit: number, rank: number} OPTIONAL
 */
Cypress.Commands.add('discardOpponent', (card1, card2) => {
  cy.window()
    .its('cuttle.gameStore')
    .then((game) => {
      let cardId1 = undefined;
      let cardId2 = undefined;
      if (card1) {
        [ cardId1 ] = getCardIds(game, [ card1 ]);
      }
      if (card2) {
        [ cardId2 ] = getCardIds(game, [ card2 ]);
      }

      const moveType = MoveType.RESOLVE_FOUR;
      // dont use makeSocketRequest due to edge case checking error on opponent side
      transformGameUrl('game', 'resolveFour').then((url) => {
        io.socket.request({
          method: 'post',
          url,
          data: {
            moveType,
            cardId1,
            cardId2,
          },
        });
      }),
      function handleResponse(res, jwres) {
        try {
          if (env && jwres.statusCode === 404) {
            throw new Error('This action is not supported yet in GameState API');
          }
          if (jwres.statusCode !== 200) {
            throw new Error(jwres.error.message);
          }
          return res;
        } catch (err) {
          return err;
        }
      };
    });
});

/**
 * @param card {suit: number, rank: number}
 */
Cypress.Commands.add('playPointsFromSevenOpponent', (card) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error('Cannot play opponent points: Invalid card input');
  }
  Cypress.log({
    displayName: 'Opponent seven points',
    name: 'Opponent plays points from seven',
    message: printCard(card),
  });
  return cy
    .window()
    .its('cuttle.gameStore')
    .then((game) => {
      let foundCard;
      let index;
      if (cardsMatch(card, game.topCard)) {
        foundCard = game.topCard;
        index = 0;
      } else if (cardsMatch(card, game.secondCard)) {
        foundCard = game.secondCard;
        index = 1;
      } else {
        throw new Error(
          `Error playing ${printCard(
            card,
          )} for points from seven as opponent: Could not find it in top two cards`,
        );
      }

      const cardId = foundCard.id;
      cy.makeSocketRequest('game', 'seven/points', {
        moveType: MoveType.SEVEN_POINTS,
        cardId,
        index,
      });
    });
});

/**
 * @param card {suit: number, rank: number}
 */
Cypress.Commands.add('playFaceCardFromSevenOpponent', (card) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error('Cannot play opponent face card: Invalid card input');
  }
  Cypress.log({
    displayName: 'Opponent seven face card',
    name: 'Opponent plays face card from seven',
    message: printCard(card),
  });
  return cy
    .window()
    .its('cuttle.gameStore')
    .then((game) => {
      let foundCard;
      let index;
      if (cardsMatch(card, game.topCard)) {
        foundCard = game.topCard;
        index = 0;
      } else if (cardsMatch(card, game.secondCard)) {
        foundCard = game.secondCard;
        index = 1;
      } else {
        throw new Error(
          `Error playing face card: ${printCard(
            card,
          )} from seven as opponent: Could not find it in top two cards`,
        );
      }

      const cardId = foundCard.id;
      cy.makeSocketRequest('game', 'seven/faceCard', {
        moveType: MoveType.SEVEN_FACE_CARD,
        cardId,
        index,
      });
    });
});

/**
 * @param card {suit: number, rank: number}
 * @param target {suit: number, rank: number}
 */
Cypress.Commands.add('scuttleFromSevenOpponent', (card, target) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error('Cannot play opponent points: Invalid card input');
  }
  Cypress.log({
    displayName: 'Opponent seven scuttle',
    name: 'Opponent scuttles from seven',
    message: printCard(card),
  });
  return cy
    .window()
    .its('cuttle.gameStore')
    .then((game) => {
      const player = game.players[game.myPNum];
      const opponent = game.players[(game.myPNum + 1) % 2];
      let foundCard = opponent.hand.find((handCard) => cardsMatch(card, handCard));
      const foundTarget = player.points.find((pointCard) => cardsMatch(target, pointCard));

      let index;
      if (cardsMatch(card, game.topCard)) {
        foundCard = game.topCard;
        index = 0;
      } else if (cardsMatch(card, game.secondCard)) {
        foundCard = game.secondCard;
        index = 1;
      } else {
        throw new Error(
          `Error playing ${printCard(
            card,
          )} for jack from seven as opponent: Could not find it in top two cards`,
        );
      }
      if (!foundTarget) {
        throw new Error(
          `Error playing opponents jack: could not find ${target.rank} of ${target.suit} in player points`,
        );
      }

      const cardId = foundCard.id;
      const targetId = foundTarget.id;
      cy.makeSocketRequest('game', 'seven/scuttle', {
        moveType: MoveType.SEVEN_SCUTTLE,
        cardId,
        index,
        targetId,
        opId: player.id,
      });
    });
});

/**
 * @param card {suit: number, rank: number}
 * @param target {suit: number, rank: number
 */
Cypress.Commands.add('playJackFromSevenOpponent', (card, target) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error('Cannot play opponent points: Invalid card input');
  }

  Cypress.log({
    displayName: 'Opponent seven jack',
    name: 'Opponent plays jack from seven',
    message: printCard(card),
  });

  return cy
    .window()
    .its('cuttle.gameStore')
    .then((game) => {
      const player = game.players[game.myPNum];
      let foundCard;

      let index;
      if (cardsMatch(card, game.topCard)) {
        foundCard = game.topCard;
        index = 0;
      } else if (cardsMatch(card, game.secondCard)) {
        foundCard = game.secondCard;
        index = 1;
      } else {
        throw new Error(
          `Error playing ${printCard(
            card,
          )} for jack from seven as opponent: Could not find it in top two cards`,
        );
      }

      const foundTarget = player.points.find((pointCard) => cardsMatch(target, pointCard));

      if (!foundTarget) {
        throw new Error(
          `Error playing opponents jack: could not find ${target.rank} of ${target.suit} in player points`,
        );
      }

      const cardId = foundCard.id;
      const targetId = foundTarget.id;

      cy.makeSocketRequest('game', 'seven/jack', {
        moveType: MoveType.SEVEN_JACK,
        cardId,
        index,
        targetId,
        opId: player.id,
      });
    });
});

Cypress.Commands.add('sevenDiscardOpponent', (card) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error('Cannot play opponent points: Invalid card input');
  }

  Cypress.log({
    displayName: 'Opponent seven discard',
    name: 'Opponent discards jack from seven',
    message: printCard(card),
  });

  return cy
    .window()
    .its('cuttle.gameStore')
    .then((game) => {
      const player = game.players[game.myPNum];
      let foundCard;
      let index;

      if (cardsMatch(card, game.topCard)) {
        foundCard = game.topCard;
        index = 0;
      } else if (cardsMatch(card, game.secondCard)) {
        foundCard = game.secondCard;
        index = 1;
      } else {
        throw new Error(
          `Error playing ${printCard(
            card,
          )} for jack from seven as opponent: Could not find it in top two cards`,
        );
      }

      const cardId = foundCard.id;

      cy.makeSocketRequest('game', 'seven/jack', {
        moveType: MoveType.SEVEN_DISCARD,
        cardId,
        index,
        targetId: -1,
        opId: player.id,
      });
    });
});

/**
 * @param card {suit: number, rank: number}
 */
Cypress.Commands.add('playOneOffFromSevenOpponent', (card) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error('Cannot play opponent one-off from seven: Invalid card input');
  }
  Cypress.log({
    displayName: 'Opponent seven one-off',
    name: 'Opponent plays one-off from seven',
    message: printCard(card),
  });
  return cy
    .window()
    .its('cuttle.gameStore')
    .then((game) => {
      let foundCard;
      let index;
      if (cardsMatch(card, game.topCard)) {
        foundCard = game.topCard;
        index = 0;
      } else if (cardsMatch(card, game.secondCard)) {
        foundCard = game.secondCard;
        index = 1;
      } else {
        throw new Error(
          `Error playing ${printCard(
            card,
          )} as one-off from seven as opponent: Could not find it in top two cards`,
        );
      }
      const playerId = game.players[game.myPNum].id;
      const cardId = foundCard.id;
      cy.makeSocketRequest('game', 'seven/untargetedOneOff', {
        moveType: MoveType.SEVEN_ONE_OFF,
        cardId,
        index,
        opId: playerId,
      });
    });
});

Cypress.Commands.add('playTargetedOneOffFromSevenOpponent', (card, target, targetType) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error(
      `Cannot play targeted one-off from seven for opponent: Invalid card to play: ${JSON.stringify(card)}`,
    );
  }
  if (!hasValidSuitAndRank(target)) {
    throw new Error(
      `Cannot play targeted one-off from seven for opponent: Invalid target: ${JSON.stringify(target)}`,
    );
  }
  Cypress.log({
    displayName: 'Opponent seven targeted one-off',
    name: 'Opponent plays one-off from seven',
    message: printCard(card),
  });
  let foundCard;
  let foundTarget;
  let foundPointCard;
  let index;
  return cy
    .window()
    .its('cuttle.gameStore')
    .then((game) => {
      const player = game.players[game.myPNum];
      if (cardsMatch(card, game.topCard)) {
        foundCard = game.topCard;
        index = 0;
      } else if (cardsMatch(card, game.secondCard)) {
        foundCard = game.secondCard;
        index = 1;
      } else {
        throw new Error(
          `Error playing ${printCard(
            card,
          )} as one-off from seven as opponent: Could not find it in top two cards`,
        );
      }
      // Find target by suit & rank
      switch (targetType) {
        case 'point':
          foundTarget = player.points.find((pointCard) => cardsMatch(pointCard, target));
          break;
        case 'faceCard':
          foundTarget = player.faceCards.find((faceCard) => cardsMatch(faceCard, target));
          break;
        case 'jack':
          player.points.forEach((pointCard) => {
            pointCard.attachments.forEach((jack) => {
              if (cardsMatch(jack, target)) {
                foundTarget = jack;
                foundPointCard = pointCard;
              }
            });
          });
          break;
        default:
          throw new Error(
            `Error playing ${printCard(
              card,
            )} as one-off from seven as opponent: invalid target type, ${targetType}`,
          );
      }
      if (!foundTarget) {
        throw new Error(
          `Error: Could not find target ${printCard(target)} when playing ${printCard(
            card,
          )} as one-off from seven for opponent`,
        );
      }
      if (targetType === 'jack' && !foundPointCard) {
        throw new Error(
          `Error: Could not find point card when playing ${printCard(
            card,
          )} as one-off from seven for opponent`,
        );
      }
      const playerId = player.id;
      const cardId = foundCard.id;
      const targetId = foundTarget.id;
      const pointId = foundPointCard ? foundPointCard.id : null;
      cy.makeSocketRequest('game', 'seven/targetedOneOff', {
        moveType: MoveType.SEVEN_ONE_OFF,
        cardId,
        index,
        targetId,
        targetType,
        pointId,
        opId: playerId,
      });
    });
});

Cypress.Commands.add('passOpponent', () => {
  cy.log('Opponent Passes');
  const moveType = MoveType.PASS;
  cy.makeSocketRequest('game', 'pass', { moveType });
});

Cypress.Commands.add('concedeOpponent', (gameId = null) => {
  cy.makeSocketRequest('game', 'concede', { moveType: MoveType.CONCEDE }, 'POST', gameId);
});

Cypress.Commands.add('stalemateOpponent', () => {
  cy.log('Opponent requests/accepts stalemate');
  cy.makeSocketRequest('game', 'stalemate', null);
});

Cypress.Commands.add('rejectStalemateOpponent', () => {
  cy.log('Opponent rejects stalemate request');
  cy.makeSocketRequest('game', 'reject-stalemate', null);
});

Cypress.Commands.add('reconnectOpponent', (opponent) => {
  cy.log('Opponent Reconnects');
  cy.makeSocketRequest('user', 'relogin', {
    username: opponent.username,
    password: opponent.password,
  });
});

Cypress.Commands.add('rematchAndJoinRematchOpponent', ({ gameId }) => {
  cy.makeSocketRequest('game', 'rematch', { gameId, rematch: true });
  cy.makeSocketRequest('game', 'join-rematch', { oldGameId: gameId });
});

/**
 * @description Requests to accept/reject rematch on behalf of the test-controlled user
 *  Note that when spectating, the caller needs to first update session data to match
 *  the expected userFixture with cy.recoverSessionOpponent().
 *  See helpers.js' rematchPlayerAsSpectator() for how this is done
 *
 * @param { Object } data - Specifies which game, whether to accept rematch, and on behalf of whom
 * @param { Number } data.gameId - Which game to request the rematch for
 * @param { Boolean } data.rematch - Whether specified user should accept (true) or reject (false) the rematch
 * @param { 'my' | 'opponent' } [data.whichPlayer] - Optionally specify whether this user
 *  is originalP0 ('my') or originalP1 ('opponent'). For use when spectating
 */
Cypress.Commands.add('rematchOpponent', ({ gameId, rematch, whichPlayer, skipDomAssertion }) => {
  cy.makeSocketRequest('game', 'rematch', { gameId, rematch });

  if (skipDomAssertion) {
    return;
  }

  const cardSelector = whichPlayer ?? 'opponent';
  if (rematch) {
    cy.get(`[data-cy=${cardSelector}-rematch-indicator]`)
      .find('[data-cy="lobby-card-container"]')
      .should('have.class', 'ready');
  } else {
    cy.get(`[data-cy=${cardSelector}-rematch-indicator]`)
      .find('[data-cy="player-declined-rematch"]')
      .should('be.visible');

    const playerOrOpponent = whichPlayer ? 'Player' : 'Opponent';
    cy.get('[data-cy=continue-match-banner]')
      .should('be.visible')
      .should('have.class', 'opponent-left')
      .should('contain', `${playerOrOpponent} left - click to go home.`);

    cy.get('[data-cy=gameover-rematch]').should('be.disabled');
  }
});

Cypress.Commands.add('joinRematchOpponent', ({ oldGameId = null }) => {
  cy.makeSocketRequest('game', 'join-rematch', { oldGameId });
});

/**
 * @param card: {suit: number, rank: number}
 */
Cypress.Commands.add('playOneOffAndResolveAsPlayer', (card) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error(`Cannot one-off & resolve: Invalid card to play: ${JSON.stringify(card)}`);
  }
  Cypress.log({
    displayName: 'Play & Resolve One-Off',
    name: 'Play one-off, opponent resolves',
    message: printCard(card),
  });
  cy.window()
    .its('cuttle.gameStore')
    .then((game) => {
      const foundCard = game.players[game.myPNum].hand.find((handCard) => cardsMatch(card, handCard));
      if (!foundCard) {
        throw new Error(`Cannot one-off & resolve: cannot find ${printCard(card)} in player's hand`);
      }
      // Play chosen card as one-off
      cy.get(`[data-player-hand-card=${card.rank}-${card.suit}]`).click();
      cy.get('[data-move-choice=oneOff]').should('not.have.class', 'v-card--disabled')
        .click();
      cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
      // Opponent does not counter (resolves stack)
      cy.resolveOpponent();
      cy.get('#waiting-for-opponent-counter-scrim').should('not.exist');
    });
});

Cypress.Commands.add('vueRoute', (route) => {
  cy.window()
    .its('cuttle.app.config.globalProperties.$router')
    .then((router) => router.push(route));
});

/**
 * Set the current game into a state specified by a fixture object :
 *
 * @param pNum{ 0 | 1 -- whether viewing game from perspective of player 0 or player 1 }
 * @param fixture
 * {
 * 	 p0Hand: {suit: number, rank: number}[],
 *   p0Points: {suit: number, rank: number}[],
 *   p0FaceCards: {suit: number, rank: number}[],
 *   p1Hand: {suit: number, rank: number}[],
 *   p1Points: {suit: number, rank: number}[],
 *   p1FaceCards: {suit: number, rank: number}[],
 *   topCard?: {suit: number, rank: number}
 *   secondCard?: {suit: number, rank: number}
 *   deck?: {suit: number, rank: number}[] deletes all cards except these from the deck
 * }
 */
Cypress.Commands.add('loadGameFixture', (pNum, fixture) => {
  if (env) {
    return cy
      .window()
      .its('cuttle.gameStore.id')
      .then(async (gameId) => {
        await cy.makeSocketRequest(`game/${gameId}`, 'loadFixtureGameState',  fixture );
        const playerHandLength = pNum === 0 ? fixture.p0Hand.length : fixture.p1Hand.length;
        cy.get('[data-player-hand-card]').should('have.length', playerHandLength);
        return;
      });
  }

  return cy
    .window()
    .its('cuttle.gameStore')
    .then((game) => {
      const p0HandCardIds = getCardIds(game, fixture.p0Hand);
      const p0PointCardIds = getCardIds(game, fixture.p0Points);
      const p0FaceCardIds = getCardIds(game, fixture.p0FaceCards);
      const p1HandCardIds = getCardIds(game, fixture.p1Hand);
      const p1PointCardIds = getCardIds(game, fixture.p1Points);
      const p1FaceCardIds = getCardIds(game, fixture.p1FaceCards);
      // build request body
      let reqBody = {
        p0Id: game.players[0].id,
        p1Id: game.players[1].id,
        p0HandCardIds,
        p1HandCardIds,
        p0PointCardIds,
        p1PointCardIds,
        p0FaceCardIds,
        p1FaceCardIds,
      };
      // Get top card & second cards if specified
      if (fixture.topCard) {
        const [ topCardId ] = getCardIds(game, [ fixture.topCard ]);
        reqBody.topCardId = topCardId;
      }
      if (fixture.secondCard) {
        const [ secondCardId ] = getCardIds(game, [ fixture.secondCard ]);
        reqBody.secondCardId = secondCardId;
      }
      // Get scrap if specified
      if (fixture.scrap) {
        const scrapCardIds = getCardIds(game, fixture.scrap);
        reqBody.scrapCardIds = scrapCardIds;
      }

      if (fixture.deck) {
        const deck = getCardIds(game, fixture.deck);
        reqBody.deck = deck;
      }

      cy.makeSocketRequest('game', 'loadFixture', reqBody);
      const playerHandLength = pNum === 0 ? p0HandCardIds.length : p1HandCardIds.length;
      cy.get('[data-player-hand-card]').should('have.length', playerHandLength);
    });
});
