import sails from 'sails.io.js';
import socketIoClient from 'socket.io-client';
import { cloneDeep } from 'lodash';
import store from '@/store/store.js';
import router from '@/router.js';
import { ROUTE_NAME_GAME, ROUTE_NAME_SPECTATE, ROUTE_NAME_HOME } from '@/router';

export const io = sails(socketIoClient);

export const reconnectSockets = () => {
  return new Promise((resolve, reject) => {
    io.socket.disconnect();
    io.socket.reconnect();
    const MAX_TRIES = 10; // 10 seconds
    const INTERVAL = 500; // 10 * 500 = 5000 (5 seconds)
    let tries = 1;
    const interval = setInterval(() => {
      // If we are connected to the socket, resolve
      if (io.socket.isConnected()) {
        resolve();
      }

      // If no connection after threshold, reject the promise to prevent an infinite loop
      if (tries >= MAX_TRIES) {
        clearInterval(interval);
        reject();
      }

      tries += 1;
    }, INTERVAL);
  });
};

// Configure socket connection url for dev environments
if (!import.meta.env.PROD) {
  io.sails.url = import.meta.env.VITE_API_URL || 'localhost:1337';
}

io.sails.useCORSRouteToGetCookie = false;
io.sails.reconnection = true;

// Handles socket updates of game data
io.socket.on('game', function (evData) {
  switch (evData.verb) {
    case 'updated':
      // Handle GameOver
      if (evData.data.victory && evData.data.victory.gameOver) {
        setTimeout(() => {
          store.commit('setGameOver', evData.data.victory);
        }, 1000);
      }
      switch (evData.data.change) {
        case 'ready':
          store.commit('updateReady', evData.data.pNum);
          break;
        case 'Initialize': {
          const currentRoute = router.currentRoute.value;
          const isSpectating = currentRoute.name === ROUTE_NAME_SPECTATE;

          // Update state
          store.commit('resetState');
          store.dispatch('updateGameThenResetPNumIfNull', evData.data.game);
          if (isSpectating) {
            store.commit('setMyPNum', 0); // always spectate as p0
          }

          // Validate current route & navigate if incorrect
          const targetRouteName = isSpectating ? ROUTE_NAME_SPECTATE : ROUTE_NAME_GAME;
          const shouldNavigate = currentRoute.name !== targetRouteName;
          if (shouldNavigate) {
            router.push({
              name: targetRouteName,
              params: {
                gameId: store.state.game.id,
              },
            });
          }
          break;
        }
        case 'draw':
        case 'pass':
        case 'points':
        case 'faceCard':
        case 'loadFixture':
        case 'jack':
        case 'deleteDeck':
          store.dispatch('updateGameThenResetPNumIfNull', evData.data.game);
          break;
        case 'scuttle':
          store.dispatch('processScuttle', evData.data);
          break;
        case 'resolveThree':
          store.dispatch('updateGameThenResetPNumIfNull', evData.data.game);
          store.commit('setPickingFromScrap', false);
          store.commit('setWaitingForOpponentToPickFromScrap', false);
          break;
        case 'resolveFour':
          store.dispatch('updateGameThenResetPNumIfNull', evData.data.game);
          store.commit('setWaitingForOpponentToDiscard', false);
          store.commit('setDiscarding', false);
          break;
        case 'resolve':
          store.dispatch('updateGameThenResetPNumIfNull', evData.data.game);
          store.commit('setWaitingForOpponentToCounter', false);
          if (evData.data.happened) {
            switch (evData.data.oneOff.rank) {
              case 3:
                if (evData.data.playedBy !== store.state.game.myPNum) {
                  store.commit('setWaitingForOpponentToPickFromScrap', true);
                } else {
                  store.commit('setPickingFromScrap', true);
                }
                break;
              case 4:
                if (evData.data.playedBy === store.state.game.myPNum) {
                  store.commit('setWaitingForOpponentToDiscard', true);
                } else {
                  store.commit('setDiscarding', true);
                }
                break;
              case 7:
                if (evData.data.playedBy === store.state.game.myPNum) {
                  store.commit('setPlayingFromDeck', true);
                } else {
                  store.commit('setWaitingForOpponentToPlayFromDeck', true);
                }
                break;
              default:
                break;
            }
          }
          break;
        case 'targetedOneOff':
        case 'oneOff':
        case 'counter':
          store.dispatch('updateGameThenResetPNumIfNull', evData.data.game);
          if (evData.data.pNum !== store.state.game.myPNum) {
            store.commit('setWaitingForOpponentToCounter', false);
            store.commit('setMyTurnToCounter', true);
          } else {
            store.commit('setWaitingForOpponentToCounter', true);
            store.commit('setMyTurnToCounter', false);
          }
          break;
        // Sevens
        case 'sevenPoints':
        case 'sevenFaceCard':
        case 'sevenJack':
        case 'sevenScuttle':
          store.dispatch('updateGameThenResetPNumIfNull', evData.data.game);
          store.commit('setPlayingFromDeck', false);
          store.commit('setWaitingForOpponentToPlayFromDeck', false);
          break;
        case 'sevenOneOff':
        case 'sevenTargetedOneOff':
          store.dispatch('updateGameThenResetPNumIfNull', evData.data.game);
          store.commit('setPlayingFromDeck', false);
          store.commit('setWaitingForOpponentToPlayFromDeck', false);
          if (evData.data.pNum !== store.state.game.myPNum) {
            store.commit('setWaitingForOpponentToCounter', false);
            store.commit('setMyTurnToCounter', true);
          }
          break;
        case 'reLogin':
          store.dispatch('updateGameThenResetPNumIfNull', evData.data.game);
          break;
        case 'spectators':
          store.dispatch('updateGameThenResetPNumIfNull', evData.data.game);
          break;
        case 'requestStalemate':
          if (evData.data.requestedByPNum !== store.state.game.myPNum && !evData.data.victory.gameOver) {
            store.commit('setConsideringOpponentStalemateRequest', true);
          }
          break;
        case 'rejectStalemate':
          store.commit('setConsideringOpponentStalemateRequest', false);
          store.commit('setWaitingForOpponentToStalemate', false);
          break;
      }
  }
});

io.socket.on('gameCreated', function (evData) {
  const newGame = cloneDeep(evData);
  store.commit('addGameToList', newGame);
});

io.socket.on('gameStarted', function ({ gameId }) {
  store.commit('gameStarted', gameId);
});

io.socket.on('gameFinished', function ({ gameId }) {
  store.commit('gameFinished', gameId);
});

io.socket.on('join', function (evData) {
  store.commit('joinGame', {
    gameId: evData.gameId,
    newPlayer: evData.newPlayer,
    newStatus: evData.newStatus,
  });
  // If we are in game: update our game with new player
  if (evData.gameId === store.state.game.id) {
    store.commit('opponentJoined', evData.newPlayer);
  }
});

io.socket.on('leftGame', function (evData) {
  if (evData.id === store.state.game.id) {
    store.commit('opponentLeft');
  } else {
    store.commit('otherLeftGame', evData.id);
  }
});

//////////////////
// Connectivity //
//////////////////
io.socket.on('connect', () => {
  // Request latest game state if socket reconnects during game
  const { username } = store.state.auth;
  switch (router.currentRoute.value.name) {
    case ROUTE_NAME_GAME:
      return store.dispatch('requestReauthenticate', { username });
    case ROUTE_NAME_SPECTATE: {
      const gameId = Number(router.currentRoute.value.params.gameId);
      if (!Number.isInteger(gameId)) {
        router.push(ROUTE_NAME_HOME);
        return;
      }
      return store.dispatch('requestSpectate', gameId);
    }
    default:
      return;
  }
});
