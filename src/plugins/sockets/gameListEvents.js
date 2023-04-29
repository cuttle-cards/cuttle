import store from '@/store/store.js';
import { cloneDeep } from 'lodash';

export function handleGameCreated(evData) {
  const newGame = cloneDeep(evData);
  store.commit('addGameToList', newGame);
}

export function handleGameStarted({ gameId }) {
  store.commit('gameStarted', gameId);
}

export function handleGameFinished({ gameId }) {
  store.commit('gameFinished', gameId);
}

export function handleJoin(evData) {
  store.commit('joinGame', {
    gameId: evData.gameId,
    newPlayer: evData.newPlayer,
    newStatus: evData.newStatus,
  });
  // If we are in game: update our game with new player
  if (evData.gameId === store.state.game.id) {
    store.commit('opponentJoined', evData.newPlayer);
  }
}

export function handleLeftGame(evData) {
  if (evData.id === store.state.game.id) {
    store.commit('opponentLeft');
  } else {
    store.commit('otherLeftGame', evData.id);
  }
}
