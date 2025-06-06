import { hasValidSuitAndRank, cardsMatch, printCard } from './helpers';
import { myUser, opponentOne, playerOne, playerTwo } from '../fixtures/userFixtures';
import MoveType from '../../../utils/MoveType.json';

/**
 * Require & configure socket connection to server
 */
const io = require('sails.io.js')(require('socket.io-client'));
io.sails.url = 'localhost:1337';
io.sails.useCORSRouteToGetCookie = false;

// TODO #1198: clean this up to remove the unused slugs
const transformGameUrl = (api, slug, gameId = null) => {

  switch (slug) {
    case 'rematch': 
      return gameId ? Cypress.Promise.resolve(`/api/game/${gameId}/rematch`)  :
        cy
          .window()
          .its('cuttle.gameStore.id')
          .then((gameId) => `/api/game/${gameId}/rematch`);
    case 'spectate':
      return gameId ? Cypress.Promise.resolve(`/api/game/${gameId}/spectate`) :
        cy
          .window()
          .its('cuttle.gameStore.id')
          .then((gameId) => `/api/game/${gameId}/spectate`);
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
    case 'stalemate':
    case 'stalemate-accept':
    case 'stalemate-reject':
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
  cy.request({
    method: 'DELETE',
    url: 'localhost:1337/api/test/wipe-database'
  });
  cy.log('Wiped database');
});

Cypress.Commands.add('refreshOpponentSocket', () => {
  io.socket.disconnect();
  io.socket.reconnect();
});

Cypress.Commands.add('loadSeasonFixture', (season) => {
  cy.makeSocketRequest('test', 'seasons', season);
});

Cypress.Commands.add('loadMatchFixtures', (matches) => {
  cy.makeSocketRequest('test', 'matches', matches);
});

Cypress.Commands.add('loadFinishedGameFixtures', (games) => {
  cy.makeSocketRequest('test', 'games', games);
});

Cypress.Commands.add('requestGameList', () => {
  cy.makeSocketRequest('game', '', {}, 'GET');
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
  cy.createGamePlayer({ gameName: 'Test Game', isRanked }).then(({ gameId }) => {
    cy.window()
      .its('cuttle.gameStore')
      .then((store) => store.requestSubscribe(gameId));
    cy.log(`Subscribed to game ${gameId}`);
    cy.vueRoute(`/lobby/${gameId}`);
    cy.wrap(gameId).as('gameId');
    cy.get('[data-cy=ready-button]').click();
    if (!alreadyAuthenticated) {
      cy.signupOpponent(opponentOne);
    }
    try {
      cy.subscribeOpponent(gameId);
    } catch {
      cy.recoverSessionOpponent(opponentOne);
      cy.subscribeOpponent(gameId);
    }
    cy.readyOpponent(gameId);
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
  cy.createGamePlayer({ gameName: 'Test Game', isRanked }).then(({ gameId }) => {
    if (!alreadyAuthenticated) {
      cy.signupOpponent(opponentOne);
    }
    try {
      cy.subscribeOpponent(gameId);
    } catch {
      cy.recoverSessionOpponent(opponentOne);
      cy.subscribeOpponent(gameId);
    }
    cy.readyOpponent(gameId);
    cy.window()
      .its('cuttle.gameStore')
      .then((store) => store.requestSubscribe(gameId));
    cy.vueRoute(`/lobby/${gameId}`);
    cy.wrap(gameId).as('gameId');
    cy.get('[data-cy=ready-button]').click();
    // Asserting 6 cards in players hand confirms game has loaded
    cy.get('#player-hand-cards .player-card').should('have.length', 6);
  });
  cy.log('Finished setting up game as p1');
});
Cypress.Commands.add('setupGameAsSpectator', (isRanked = false, gameIdAlias = 'gameId') => {
  cy.wipeDatabase();
  cy.visit('/');
  cy.signupPlayer(myUser);
  cy.vueRoute('/');
  cy.createGamePlayer({ gameName: 'Spectator Game', isRanked }).then(({ gameId }) => {
    // Test that JOIN button starts enabled
    cy.get('[data-cy-join-game]').should('not.be.disabled');
    // Sign up 2 users and subscribe them to game
    cy.signupOpponent(playerOne);
    cy.subscribeOpponent(gameId);
    // Opponents start game, it appears as spectatable
    cy.readyOpponent(gameId);
    cy.signupOpponent(playerTwo);
    cy.subscribeOpponent(gameId);
    cy.get('[data-cy-join-game]').should('be.disabled');

    // Switch to spectate tab
    cy.get('[data-cy-game-list-selector=spectate]').click();
    cy.get('[data-cy=no-spectate-game-text]').should('contain', 'No Games Available to Spectate');

    // The other game starts -- should now appear in spectate list
    cy.readyOpponent(gameId);
    cy.wrap(gameId).as(gameIdAlias);
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
  }).as(`${opponent.username}Id`);
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
  cy.makeSocketRequest('game', '', {
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
  cy.makeSocketRequest(`game/${gameId}`, 'join');
});

Cypress.Commands.add('setOpponentToSpectate', (gameId) => {
  cy.makeSocketRequest('game', 'spectate', { gameId }, 'POST', gameId);
});

Cypress.Commands.add('setOpponentToLeaveSpectate', (gameId) => {
  const slug = `${gameId}/spectate`;
  cy.makeSocketRequest('game', slug, { gameId }, 'DELETE');
});

Cypress.Commands.add('readyOpponent', (id) => {
  cy.makeSocketRequest(`game/${id}`, 'ready');
});

Cypress.Commands.add('setIsRankedOpponent', (gameId, isRanked) => {
  cy.makeSocketRequest(`game/${gameId}`, 'is-ranked', { isRanked }, 'PATCH');
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
  cy.makeSocketRequest(`game/${id}`, 'leave');
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

Cypress.Commands.add('drawCardOpponent', (gameId = null) => {
  const moveType = MoveType.DRAW;
  cy.makeSocketRequest('game', 'draw', { moveType }, 'POST', gameId);
});

/**
 * @param card {suit: number, rank: number}
 */
Cypress.Commands.add('playPointsOpponent', (card, gameId = null) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error(`Cannot play opponent points with invalid card ${card}`);
  }
  const cardId = card.id;
  const moveType = MoveType.POINTS;
  cy.makeSocketRequest('game', 'points', { moveType, cardId }, 'POST', gameId);
});

/**
 * @param card {suit: number, rank: number}
 */
Cypress.Commands.add('playPointsSpectator', (card) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error(`Cannot play points as spectator with invalid card: ${card}`);
  }

  const moveType = MoveType.POINTS;
  const cardId = card.id;
  cy.makeSocketRequest('game', 'points', { moveType, cardId });
});

Cypress.Commands.add('playPointsById', (cardId, gameId = null) => {
  cy.makeSocketRequest('game', 'points', { cardId, moveType: MoveType.POINTS }, 'POST', gameId);
});

/**
 * @param card {suit: number, rank: number}
 */
Cypress.Commands.add('playOneOffSpectator', (card) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error(`Cannot play opponent one-off as spectator with invalid card: ${card}`);
  }
  const moveType = MoveType.ONE_OFF;
  const cardId = card.id;
  cy.makeSocketRequest('game', 'untargetedOneOff', { moveType, cardId });
});

/**
 * @param card {suit: number, rank: number}
 */
Cypress.Commands.add('playFaceCardOpponent', (card) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error(`Cannot play opponent Face Card with invalid card: ${card}`);
  }

  const cardId = card.id;
  const moveType = MoveType.FACE_CARD;
  cy.makeSocketRequest('game', 'faceCard', { moveType, cardId });
});

/**
 * @param card {suit: number, rank: number}
 * @param target {suit: number, rank: number}
 */
Cypress.Commands.add('playJackOpponent', (card, target) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error(`Cannot play jack as opponent with invalid card ${card}`);
  }

  if (!hasValidSuitAndRank(target)) {
    throw new Error(`Cannot play jack as opponent with invalid target ${target}`);
  }

  const moveType = MoveType.JACK;
  const cardId = card.id;
  const targetId = target.id;

  cy.makeSocketRequest('game', 'jack', {
    moveType,
    cardId,
    targetId,
  });
});

/**
 * @param card {suit: number, rank: number}
 * @param target {suit: number, rank: number}
 */
Cypress.Commands.add('scuttleOpponent', (card, target) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error(`Cannot scuttle as opponent with invalid card ${card}`);
  }

  if (!hasValidSuitAndRank(target)) {
    throw new Error(`Cannot scuttle as opponent with invalid target ${target}`);
  }

  const moveType = MoveType.SCUTTLE;
  cy.makeSocketRequest('game', 'scuttle', {
    moveType,
    cardId: card.id,
    targetId: target.id,
  });
});

Cypress.Commands.add('playOneOffOpponent', (card) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error(`Cannot play one-off as opponent with invalid card ${card}`);
  }

  const moveType = MoveType.ONE_OFF;
  cy.makeSocketRequest('game', 'untargetedOneOff', {
    moveType,
    cardId: card.id,
  });
});

/**
 * @param card {suit: number, rank: number}
 * @param target {suit: number, rank: number}
 * @param targetType string 'faceCard' | 'point' | 'jack'
 */
Cypress.Commands.add('playTargetedOneOffOpponent', (card, target, targetType) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error(`Cannot play targeted one-off with invalid card ${card}`);
  }

  if (!hasValidSuitAndRank(target)) {
    throw new Error(`Cannot play targeted one-off with invalid target ${target}`);
  }

  const moveType = MoveType.ONE_OFF;
  cy.makeSocketRequest('game', 'targetedOneOff', {
    moveType,
    targetId: target.id,
    cardId: card.id,
    targetType,
  });
});

/**
 * @param card {suit: number, rank: number}
 */
Cypress.Commands.add('counterOpponent', (card) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error(`Cannot counter one-off with invalid card ${card}`);
  }

  const moveType = MoveType.COUNTER;
  const cardId = card.id;
  cy.makeSocketRequest('game', 'counter', { moveType, cardId });
});

Cypress.Commands.add('resolveFiveOpponent', (card) => {
  const moveType = MoveType.RESOLVE_FIVE;
  const cardId = card?.id ?? null;
  cy.makeSocketRequest('game', 'resolveFive', { moveType, cardId });
});

Cypress.Commands.add('resolveThreeOpponent', (card) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error(`Cannot resolve three with invalid card ${card}`);
  }

  const moveType = MoveType.RESOLVE_THREE;
  const cardId = card.id;
  cy.makeSocketRequest('game', 'resolveThree', { moveType, cardId });
});

Cypress.Commands.add('resolveOpponent', () => {
  const moveType = MoveType.RESOLVE;
  cy.makeSocketRequest('game', 'resolve', { moveType });
});

/**
 * Discards 1-2 cards to resolve four
 * @param card1 {suit: number, rank: number} OPTIONAL
 * @param card2 {suit: number, rank: number} OPTIONAL
 */
Cypress.Commands.add('discardOpponent', (card1, card2) => {

  const moveType = MoveType.RESOLVE_FOUR;
  // dont use makeSocketRequest due to edge case checking error on opponent side
  transformGameUrl('game', 'resolveFour').then((url) => {
    io.socket.request({
      method: 'post',
      url,
      data: {
        moveType,
        cardId1: card1?.id,
        cardId2: card2?.id,
      },
    });
  }),
  function handleResponse(res, jwres) {
    try {
      if (jwres.statusCode !== 200) {
        throw new Error(jwres.error.message);
      }
      return res;
    } catch (err) {
      return err;
    }
  };
});

/**
 * @param card {suit: number, rank: number}
 */
Cypress.Commands.add('playPointsFromSevenOpponent', (card) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error(`Cannot play points from seven with invalid card ${card}`);
  }
  Cypress.log({
    displayName: 'Opponent seven points',
    name: 'Opponent plays points from seven',
    message: printCard(card),
  });

  const cardId = card.id;
  cy.makeSocketRequest('game', 'seven/points', {
    moveType: MoveType.SEVEN_POINTS,
    cardId,
  });
});

/**
 * @param card {suit: number, rank: number}
 */
Cypress.Commands.add('playFaceCardFromSevenOpponent', (card) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error(`Cannot play face card from seven with invalid card ${card}`);
  }

  Cypress.log({
    displayName: 'Opponent seven face card',
    name: 'Opponent plays face card from seven',
    message: printCard(card),
  });

  const cardId = card.id;
  cy.makeSocketRequest('game', 'seven/faceCard', {
    moveType: MoveType.SEVEN_FACE_CARD,
    cardId,
  });
});

/**
 * @param card {suit: number, rank: number}
 * @param target {suit: number, rank: number}
 */
Cypress.Commands.add('scuttleFromSevenOpponent', (card, target) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error(`Cannot scuttle via seven with invalid card ${card}`);
  }
  if (!hasValidSuitAndRank(target)) {
    throw new Error(`Cannot scuttle via seven with invalid card ${target}`);
  }
  Cypress.log({
    displayName: 'Opponent seven scuttle',
    name: 'Opponent scuttles from seven',
    message: printCard(card),
  });
  cy.makeSocketRequest('game', 'seven/scuttle', {
    moveType: MoveType.SEVEN_SCUTTLE,
    cardId: card.id,
    targetId: target.id,
  });
});

/**
 * @param card {suit: number, rank: number}
 * @param target {suit: number, rank: number
 */
Cypress.Commands.add('playJackFromSevenOpponent', (card, target) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error(`Cannot play jack via seven with invalid card ${card}`);
  }
  if (!hasValidSuitAndRank(target)) {
    throw new Error(`Cannot play jack via seven with invalid card ${target}`);
  }

  Cypress.log({
    displayName: 'Opponent seven jack',
    name: 'Opponent plays jack from seven',
    message: printCard(card),
  });

  const cardId = card.id;
  const targetId = target.id;

  cy.makeSocketRequest('game', 'seven/jack', {
    moveType: MoveType.SEVEN_JACK,
    cardId,
    targetId,
  });
});

Cypress.Commands.add('sevenDiscardOpponent', (card) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error(`Cannot discard jack via seven with invalid card ${card}`);
  }

  Cypress.log({
    displayName: 'Opponent seven discard',
    name: 'Opponent discards jack from seven',
    message: printCard(card),
  });

  const cardId = card.id;
  cy.makeSocketRequest('game', 'seven/jack', {
    moveType: MoveType.SEVEN_DISCARD,
    cardId,
  });
});

/**
 * @param card {suit: number, rank: number}
 */
Cypress.Commands.add('playOneOffFromSevenOpponent', (card) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error(`Cannot play one-off via seven with invalid card ${card}`);
  }
  Cypress.log({
    displayName: 'Opponent seven one-off',
    name: 'Opponent plays one-off from seven',
    message: printCard(card),
  });

  const cardId = card.id;
  cy.makeSocketRequest('game', 'seven/untargetedOneOff', {
    moveType: MoveType.SEVEN_ONE_OFF,
    cardId,
  });
});

Cypress.Commands.add('playTargetedOneOffFromSevenOpponent', (card, target, targetType) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error(`Cannot play targeted one-off via seven with invalid card ${card}`);
  }
  if (!hasValidSuitAndRank(target)) {
    throw new Error(`Cannot play targeted one-off via seven with invalid card ${target}`);
  }
  Cypress.log({
    displayName: 'Opponent seven targeted one-off',
    name: 'Opponent plays one-off from seven',
    message: printCard(card),
  });

  const cardId = card.id;
  const targetId = target.id;
  cy.makeSocketRequest('game', 'seven/targetedOneOff', {
    moveType: MoveType.SEVEN_ONE_OFF,
    cardId,
    targetId,
    targetType,
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

Cypress.Commands.add('stalemateOpponent', (gameId = null) => {
  cy.log('Opponent requests stalemate');
  cy.makeSocketRequest('game', 'stalemate', { moveType: MoveType.STALEMATE_REQUEST }, 'POST', gameId);
});

Cypress.Commands.add('acceptStalemateOpponent', (gameId = null) => {
  cy.log('Opponent accepts stalemate');
  cy.makeSocketRequest('game', 'stalemate-accept', { moveType: MoveType.STALEMATE_ACCEPT }, 'POST', gameId);
});

Cypress.Commands.add('rejectStalemateOpponent', (gameId = null) => {
  cy.log('Opponent rejects stalemate request');
  cy.makeSocketRequest('game', 'stalemate-reject', { moveType: MoveType.STALEMATE_REJECT }, 'POST', gameId);
});

Cypress.Commands.add('reconnectOpponent', (opponent) => {
  cy.log('Opponent Reconnects');
  cy.makeSocketRequest('user', 'reLogin', {
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
  cy.makeSocketRequest('game', 'rematch', { rematch }, 'POST', gameId).then((res) => {
    if (res?.newGameId) {
      cy.wrap(res.newGameId).as(`game${gameId}RematchId`);
    }
  });

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
Cypress.Commands.add('loadGameFixture', (pNum, fixture, gameId = null) => {
  if (gameId) {
    cy.makeSocketRequest(`game/${gameId}`, 'game-state',  fixture ).then(() => {
      return;
    });
    return;
  }

  cy
    .window()
    .its('cuttle.gameStore.id')
    .then(async (gameIdFromStore) => {
      await cy.makeSocketRequest(`game/${gameIdFromStore}`, 'game-state',  fixture );
      const playerHandLength = pNum === 0 ? fixture.p0Hand.length : fixture.p1Hand.length;
      cy.get('[data-player-hand-card]').should('have.length', playerHandLength);
      return;
    });
});
