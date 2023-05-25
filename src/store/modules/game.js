import { cloneDeep } from 'lodash';
import { io } from '@/plugins/sails.js';

function resetState() {
  return {
    id: null,
    chat: [],
    deck: [],
    log: [],
    name: null,
    p0Ready: false,
    p1Ready: false,
    passes: 0,
    players: [],
    spectatingUsers: [],
    scrap: [],
    turn: 0,
    twos: [],
    myPNum: null,
    topCard: null,
    secondCard: null,
    oneOff: null,
    oneOffTarget: null,
    waitingForOpponentToCounter: false,
    myTurnToCounter: false,
    isRanked: false,
    // Threes
    waitingForOpponentToPickFromScrap: false,
    pickingFromScrap: false,
    // Fours
    discarding: false,
    waitingForOpponentToDiscard: false,
    // Sevens
    playingFromDeck: false,
    waitingForOpponentToPlayFromDeck: false,
    // Last Event
    lastEventChange: null,
    lastEventOneOffRank: null,
    lastEventTargetType: null,
    // GameOver
    gameIsOver: false,
    winnerPNum: null,
    conceded: false,
    waitingForOpponentToStalemate: false,
    consideringOpponentStalemateRequest: false,
    currentMatch: null,
  };
}

function handleGameResponse(context, jwres, resolve, reject) {
  switch (jwres.statusCode) {
    case 200:
      return resolve();
    case 403:
      context.commit('setMustReauthenticate', true, { root: true });
      return reject(jwres.body.message);
    default:
      return reject(jwres.body.message);
  }
}

/**
 * @returns number of queens a given player has
 * @param player is the player object
 */
function queenCount(player) {
  if (!player) {
    return null;
  }
  return player.faceCards.reduce((queenCount, card) => queenCount + (card.rank === 12 ? 1 : 0), 0);
}

const initialState = resetState();
export default {
  state: initialState,
  getters: {
    discarding(state) {
      return state.discarding;
    },
    player(state) {
      return state.players[state.myPNum];
    },
    playerPointTotal(state, getters) {
      if (!getters.player) {
        return 0;
      }
      return getters.player.points.reduce((total, card) => total + card.rank, 0) || 0;
    },
    playerQueenCount(state, getters) {
      return queenCount(getters.player);
    },
    playerUsername(state, getters) {
      if (!getters.player) {
        return null;
      }
      return getters.player.username;
    },
    opponent(state) {
      if (state.players.length < 2) {
        return null;
      }
      return state.players[(state.myPNum + 1) % 2];
    },
    opponentIsReady(state, getters) {
      if (!getters.opponent) {
        return null;
      }
      return state.myPNum === 0 ? state.p1Ready : state.p0Ready;
    },
    opponentUsername(state, getters) {
      if (!getters.opponent) {
        return null;
      }
      return getters.opponent.username;
    },
    opponentPointTotal(state, getters) {
      if (!getters.opponent) {
        return 0;
      }
      return getters.opponent.points.reduce((total, card) => total + card.rank, 0) || 0;
    },
    opponentQueenCount(state, getters) {
      return queenCount(getters.opponent);
    },
    playerWins(state) {
      return state.gameIsOver && state.winnerPNum === state.myPNum;
    },
    resolvingSeven(state) {
      return state.playingFromDeck || state.waitingForOpponentToPlayFromDeck;
    },
    isPlayersTurn(state) {
      return state.turn % 2 === state.myPNum;
    },
    hasGlassesEight(state, getters) {
      return getters.player.faceCards.filter((card) => card.rank === 8).length > 0;
    },
  },
  mutations: {
    setGameId(state, val) {
      state.id = val;
    },
    updateGame(state, newGame) {
      if (Object.hasOwnProperty.call(newGame, 'lastEvent')) {
        if (Object.hasOwnProperty.call(newGame.lastEvent, 'change')) {
          state.lastEventChange = newGame.lastEvent.change;
        } else {
          state.lastEventChange = null;
        }
        if (Object.hasOwnProperty.call(newGame.lastEvent, 'oneOff')) {
          state.lastEventOneOffRank = newGame.lastEvent.oneOff.rank;
        } else {
          state.lastEventOneOffRank = null;
        }
        if (Object.hasOwnProperty.call(newGame.lastEvent, 'oneOffTargetType')) {
          state.lastEventTargetType = newGame.lastEvent.oneOffTargetType;
        } else {
          state.lastEventTargetType = null;
        }
      }
      state.waitingForOpponentToStalemate = false;
      if (Object.hasOwnProperty.call(newGame, 'id')) state.id = newGame.id;
      if (Object.hasOwnProperty.call(newGame, 'turn')) state.turn = newGame.turn;
      if (Object.hasOwnProperty.call(newGame, 'chat')) state.chat = cloneDeep(newGame.chat);
      if (Object.hasOwnProperty.call(newGame, 'deck')) state.deck = cloneDeep(newGame.deck);
      if (Object.hasOwnProperty.call(newGame, 'scrap')) state.scrap = cloneDeep(newGame.scrap);
      if (Object.hasOwnProperty.call(newGame, 'log')) state.log = cloneDeep(newGame.log);
      if (Object.hasOwnProperty.call(newGame, 'name')) state.name = newGame.name;
      if (Object.hasOwnProperty.call(newGame, 'p0Ready')) state.p0Ready = newGame.p0Ready;
      if (Object.hasOwnProperty.call(newGame, 'p1Ready')) state.p1Ready = newGame.p1Ready;
      if (Object.hasOwnProperty.call(newGame, 'passes')) state.passes = newGame.passes;
      if (Object.hasOwnProperty.call(newGame, 'players')) state.players = cloneDeep(newGame.players);
      if (Object.hasOwnProperty.call(newGame, 'spectatingUsers')) {
        state.spectatingUsers = newGame.spectatingUsers;
      }
      if (Object.hasOwnProperty.call(newGame, 'twos')) state.twos = cloneDeep(newGame.twos);

      if (Object.hasOwnProperty.call(newGame, 'topCard')) state.topCard = cloneDeep(newGame.topCard);
      else state.topCard = null;

      if (Object.hasOwnProperty.call(newGame, 'secondCard')) state.secondCard = cloneDeep(newGame.secondCard);
      else state.secondCard = null;

      if (Object.hasOwnProperty.call(newGame, 'oneOff')) state.oneOff = cloneDeep(newGame.oneOff);
      else state.oneOff = null;

      if (Object.hasOwnProperty.call(newGame, 'oneOffTarget'))
        state.oneOffTarget = cloneDeep(newGame.oneOffTarget);
      else state.oneOffTarget = null;

      if (Object.hasOwnProperty.call(newGame, 'isRanked')) state.isRanked = newGame.isRanked;
      if (Object.hasOwnProperty.call(newGame, 'currentMatch')) state.currentMatch = newGame.currentMatch;
    },
    setMyPNum(state, val) {
      state.myPNum = val;
    },
    opponentJoined(state, newPlayer) {
      state.players.push(cloneDeep(newPlayer));
      state.players.sort((player, opponent) => player.pNum - opponent.pNum);
    },
    successfullyJoined(state, player) {
      state.players.push(cloneDeep(player));
    },
    resetState(state) {
      // Must use Object.assign to preserve reactivity
      Object.assign(state, resetState());
    },
    updateReady(state, pNum) {
      if (pNum === 0) {
        state.p0Ready = !state.p0Ready;
      } else {
        state.p1Ready = !state.p1Ready;
      }
    },
    opponentLeft(state) {
      state.players = state.players.filter((player) => player.pNum === state.myPNum);
    },
    setMyTurnToCounter(state, val) {
      state.myTurnToCounter = val;
    },
    // Countering
    setWaitingForOpponentToCounter(state, val) {
      state.waitingForOpponentToCounter = val;
    },
    // Threes
    setPickingFromScrap(state, val) {
      state.pickingFromScrap = val;
    },
    setWaitingForOpponentToPickFromScrap(state, val) {
      state.waitingForOpponentToPickFromScrap = val;
    },
    // Fours
    setDiscarding(state, val) {
      state.discarding = val;
    },
    setWaitingForOpponentToDiscard(state, val) {
      state.waitingForOpponentToDiscard = val;
    },
    // Sevens
    setPlayingFromDeck(state, val) {
      state.playingFromDeck = val;
    },
    setWaitingForOpponentToPlayFromDeck(state, val) {
      state.waitingForOpponentToPlayFromDeck = val;
    },
    // Game Over
    setGameOver(state, { gameOver, conceded, winner, currentMatch }) {
      state.gameIsOver = gameOver;
      state.conceded = conceded;
      state.winnerPNum = winner;
      state.currentMatch = currentMatch;
    },
    setWaitingForOpponentToStalemate(state, value) {
      state.waitingForOpponentToStalemate = value;
    },
    setConsideringOpponentStalemateRequest(state, value) {
      state.consideringOpponentStalemateRequest = value;
    },
  },
  actions: {
    updateGameThenResetPNumIfNull(context, game) {
      context.commit('updateGame', game);
      context.dispatch('resetPNumIfNull');
    },
    resetPNumIfNull(context) {
      // Set my pNum if it is null
      if (context.state.myPNum === null) {
        let myPNum = context.state.players.findIndex(
          (player) => player.username === context.rootState.auth.username,
        );
        if (myPNum === -1) {
          myPNum = null;
        }
        context.commit('setMyPNum', myPNum);
      }
    },
    /**
     * Updates gamestate to animate scuttle. First removes card from op hand
     * and places it on top of player's point card, then waits 1s
     * and updates complete game which will put both cards in the scrap
     * @returns void
     */
    processScuttle(context, { game, playedCardId, targetCardId, playedBy }) {
      // Update in one step if this player scuttled or if pNum is not set
      if (!context.getters.player) {
        context.dispatch('updateGameThenResetPNumIfNull', game);
        return;
      }

      const scuttlingPlayer = context.state.players[playedBy];
      const scuttledPlayer = context.state.players[(playedBy + 1) % 2];

      // Remove played card from scuttling player's hand and temporarily add to target's attachments
      const playedCardIndex = scuttlingPlayer.hand.findIndex((card) => card.id === playedCardId);
      const targetCardIndex = scuttledPlayer.points.findIndex((card) => card.id === targetCardId);

      // Update game in one-step if moved cards are not found
      if (playedCardIndex === undefined || targetCardIndex === undefined) {
        context.dispatch('updateGameThenResetPNumIfNull', game);
        return;
      }

      const [playedCard] = scuttlingPlayer.hand.splice(playedCardIndex, 1);
      const targetCard = scuttledPlayer.points[targetCardIndex];
      targetCard.scuttledBy = playedCard;

      // Finish complete update of the game state after 1s
      setTimeout(() => {
        context.dispatch('updateGameThenResetPNumIfNull', game);
      }, 1000);
    },

    async requestSubscribe(context, id) {
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/subscribe',
          {
            id,
          },
          function handleResponse(res, jwres) {
            if (jwres.statusCode === 200) {
              context.commit('updateGame', res.game);
              context.commit('setMyPNum', res.pNum);
              context.commit('successfullyJoined', {
                username: res.playerUsername,
                pNum: res.pNum,
              });
              return resolve();
            }
            const message = res.message ?? 'error subscribing';
            return reject(new Error(message));
          },
        );
      });
    },

    async requestSpectate(context, gameId) {
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/spectate',
          {
            gameId,
          },
          function handleResponse(res, jwres) {
            if (jwres.statusCode === 200) {
              context.commit('updateGame', res);
              context.commit('setMyPNum', 0);
              return resolve();
            }
            return reject(new Error('Unable to spectate game'));
          },
        );
      });
    },
    async requestSpectateLeave(context) {
      return new Promise((resolve, reject) => {
        io.socket.get('/game/spectateLeave', function handleResponse(res, jwres) {
          if (jwres.statusCode === 200) {
            context.commit('resetState');
            return resolve();
          }
          return reject(new Error('Error leaving game as spectator'));
        });
      });
    },
    async requestLeaveLobby(context) {
      return new Promise((resolve, reject) => {
        io.socket.post('/game/leaveLobby', function handleResponse(res, jwres) {
          if (jwres.statusCode === 200) {
            context.commit('resetState');
            return resolve();
          }
          return reject(new Error('Error leaving lobby'));
        });
      });
    },
    async requestReady() {
      return new Promise((resolve, reject) => {
        io.socket.post('/game/ready', function handleResponse(res, jwres) {
          if (jwres.statusCode === 200) {
            return resolve(res);
          }
          return reject(new Error('Error readying for game'));
        });
      });
    },
    ///////////////////
    // In-Game Moves //
    ///////////////////
    async requestDrawCard(context) {
      return new Promise((resolve, reject) => {
        io.socket.get('/game/draw', function handleResponse(res, jwres) {
          return handleGameResponse(context, jwres, resolve, reject);
        });
      });
    },
    async requestPlayPoints(context, cardId) {
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/points',
          {
            cardId,
          },
          function handleResponse(res, jwres) {
            return handleGameResponse(context, jwres, resolve, reject);
          },
        );
      });
    },
    async requestPlayFaceCard(context, cardId) {
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/faceCard',
          {
            cardId,
          },
          function handleResponse(res, jwres) {
            return handleGameResponse(context, jwres, resolve, reject);
          },
        );
      });
    },
    /**
     *
     * @param cardData @example {cardId: number, targetId: number}
     */
    async requestScuttle(context, cardData) {
      const { cardId, targetId } = cardData;
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/scuttle',
          {
            cardId,
            targetId,
            opId: context.getters.opponent.id,
          },
          function handleResponse(res, jwres) {
            return handleGameResponse(context, jwres, resolve, reject);
          },
        );
      });
    },
    async requestPlayOneOff(context, cardId) {
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/untargetedOneOff',
          {
            cardId,
            opId: context.getters.opponent.id,
          },
          function handleResponse(res, jwres) {
            return handleGameResponse(context, jwres, resolve, reject);
          },
        );
      }).then(() => {
        context.commit('setWaitingForOpponentToCounter', true);
        return Promise.resolve();
      });
    },
    async requestPlayTargetedOneOff(context, { cardId, targetId, pointId, targetType }) {
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/targetedOneOff',
          {
            cardId,
            targetId,
            pointId,
            targetType,
            opId: context.getters.opponent.id,
          },
          function handleResponse(res, jwres) {
            return handleGameResponse(context, jwres, resolve, reject);
          },
        );
      }).then(() => {
        context.commit('setWaitingForOpponentToCounter', true);
      });
    },
    async requestPlayJack(context, { cardId, targetId }) {
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/jack',
          {
            cardId,
            targetId,
            opId: context.getters.opponent.id,
          },
          function handleResponse(res, jwres) {
            return handleGameResponse(context, jwres, resolve, reject);
          },
        );
      });
    },
    /**
     *
     * @param {required} cardId1
     * @param {optional} cardId2
     */
    async requestDiscard(context, { cardId1, cardId2 }) {
      let reqData = {
        cardId1,
      };
      if (cardId2) {
        reqData = {
          cardId1,
          cardId2,
        };
      }
      return new Promise((resolve, reject) => {
        io.socket.get('/game/resolveFour', reqData, function (res, jwres) {
          return handleGameResponse(context, jwres, resolve, reject);
        });
      });
    },
    async requestResolve(context) {
      context.commit('setMyTurnToCounter', false);

      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/resolve',
          {
            opId: context.getters.opponent.id,
          },
          function handleResponse(res, jwres) {
            return handleGameResponse(context, jwres, resolve, reject);
          },
        );
      });
    },
    async requestResolveThree(context, cardId) {
      context.commit('setMyTurnToCounter', false);
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/resolveThree',
          {
            cardId,
            opId: context.getters.opponent.id,
          },
          function handleResponse(res, jwres) {
            return handleGameResponse(context, jwres, resolve, reject);
          },
        );
      }).then(() => {
        context.commit('setWaitingForOpponentToCounter', false);
      });
    },
    async requestResolveSevenDoubleJacks(context, { cardId, index }) {
      context.commit('setMyTurnToCounter', false);
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/seven/jack',
          {
            cardId,
            index, // 0 if topCard, 1 if secondCard
            targetId: -1, // -1 for the double jacks with no points to steal case
            opId: context.getters.opponent.id,
          },
          function handleResponse(res, jwres) {
            return handleGameResponse(context, jwres, resolve, reject);
          },
        );
      });
    },
    async requestCounter(context, twoId) {
      context.commit('setMyTurnToCounter', false);

      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/counter',
          {
            cardId: twoId,
            opId: context.getters.opponent.id,
          },
          function handleResponse(res, jwres) {
            return handleGameResponse(context, jwres, resolve, reject);
          },
        );
      }).then(() => {
        context.commit('setWaitingForOpponentToCounter', true);
      });
    },
    ////////////
    // Sevens //
    ////////////
    async requestPlayPointsSeven(context, { cardId, index }) {
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/seven/points',
          {
            cardId,
            index, // 0 if topCard, 1 if secondCard
          },
          function handleResponse(res, jwres) {
            return handleGameResponse(context, jwres, resolve, reject);
          },
        );
      });
    },
    async requestScuttleSeven(context, { cardId, index, targetId }) {
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/seven/scuttle',
          {
            cardId,
            index,
            targetId,
            opId: context.getters.opponent.id,
          },
          function handleResponse(res, jwres) {
            return handleGameResponse(context, jwres, resolve, reject);
          },
        );
      });
    },
    async requestPlayJackSeven(context, { cardId, index, targetId }) {
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/seven/jack',
          {
            cardId,
            index, // 0 if topCard, 1 if secondCard
            targetId,
            opId: context.getters.opponent.id,
          },
          function handleResponse(res, jwres) {
            return handleGameResponse(context, jwres, resolve, reject);
          },
        );
      });
    },
    async requestPlayFaceCardSeven(context, { index, cardId }) {
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/seven/faceCard',
          {
            cardId,
            index,
          },
          function handleResponse(res, jwres) {
            return handleGameResponse(context, jwres, resolve, reject);
          },
        );
      });
    },
    async requestPlayOneOffSeven(context, { cardId, index }) {
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/seven/untargetedOneOff',
          {
            cardId,
            index, // 0 if topCard, 1 if secondCard
            opId: context.getters.opponent.id,
          },
          function handleResponse(res, jwres) {
            return handleGameResponse(context, jwres, resolve, reject);
          },
        );
      }).then(() => {
        context.commit('setWaitingForOpponentToCounter', true);
      });
    },
    async requestPlayTargetedOneOffSeven(context, { cardId, index, targetId, pointId, targetType }) {
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/seven/targetedOneOff',
          {
            cardId,
            targetId,
            pointId,
            targetType,
            index, // 0 if topCard, 1 if secondCard
            opId: context.getters.opponent.id,
          },
          function handleResponse(res, jwres) {
            return handleGameResponse(context, jwres, resolve, reject);
          },
        );
      }).then(() => {
        context.commit('setWaitingForOpponentToCounter', true);
      });
    },
    async requestPass(context) {
      return new Promise((resolve, reject) => {
        io.socket.get('/game/pass', function handleResponse(res, jwres) {
          return handleGameResponse(context, jwres, resolve, reject);
        });
      });
    },
    async requestConcede(context) {
      return new Promise((resolve, reject) => {
        io.socket.get('/game/concede', function handleResponse(res, jwres) {
          return handleGameResponse(context, jwres, resolve, reject);
        });
      });
    },
    async requestStalemate(context) {
      return new Promise((resolve, reject) => {
        io.socket.get('/game/stalemate', function handleResponse(res, jwres) {
          return handleGameResponse(context, jwres, resolve, reject);
        });
      });
    },
    async rejectStalemate(context) {
      return new Promise((resolve, reject) => {
        io.socket.get('/game/reject-stalemate', function handleResponse(res, jwres) {
          return handleGameResponse(context, jwres, resolve, reject);
        });
      });
    },
    async requestUnsubscribeFromGame(context) {
      return new Promise((resolve, reject) => {
        io.socket.get('/game/over', function handleResponse(res, jwres) {
          return handleGameResponse(context, jwres, resolve, reject);
        });
      });
    },
  }, // End actions
}; // End game module
