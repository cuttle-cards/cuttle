import sails from 'sails.io.js';
import socketIoClient from 'socket.io-client';
import { cloneDeep } from 'lodash';
import store from '@/store/store.js';
import router from '@/router.js';

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
          store.commit('resetState');
          store.dispatch('updateGameThenResetPNumIfNull', evData.data.game);
          const gameRoute = `/game/${store.state.game.id}`;
          const currentRoute = router.currentRoute.fullPath;
          if (gameRoute !== currentRoute) {
            router.push(gameRoute);
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

io.socket.on('gameStarting', function (evData) {
  store.commit('removeGame', evData);
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
