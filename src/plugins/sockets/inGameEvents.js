import store from '@/store/store.js';
import router from '@/router.js';
import { ROUTE_NAME_GAME, ROUTE_NAME_SPECTATE, ROUTE_NAME_LOBBY } from '@/router';
import SocketEvent from '_/types/SocketEvent';

// Handles socket updates of game data
export async function handleInGameEvents(evData) {
  await router.isReady();
  const currentRoute = router.currentRoute.value;

  const { gameId: urlGameId } = currentRoute.params;
  const eventGameId = evData.game?.id ?? evData.gameId;
  const isSpectating = currentRoute.name === ROUTE_NAME_SPECTATE;
  
  // No-op if the event's gameId doesn't match the url
  if (!urlGameId || Number(urlGameId) !== eventGameId) {
    return;
  }
  // Handle GameOver
  if (evData.victory && evData.victory.gameOver) {
    setTimeout(() => {
      store.commit('setGameOver', evData.victory);
    }, 1000);
  }
  switch (evData.change) {
    case SocketEvent.READY: {
      store.commit('updateReady', evData.pNum);
      return;
    }
    case SocketEvent.INITIALIZE: {
      // Update state
      store.commit('resetState');
      store.dispatch('updateGameThenResetPNumIfNull', evData.game);
      if (isSpectating) {
        store.commit('setMyPNum', 0); // always spectate as p0
      }
      break;
    }
    case SocketEvent.DRAW:
    case SocketEvent.PASS:
    case SocketEvent.POINTS:
    case SocketEvent.FACE_CARD:
    case SocketEvent.LOAD_FIXTURE:
    case SocketEvent.JACK:
    case SocketEvent.DELETE_DECK:
      store.dispatch('updateGameThenResetPNumIfNull', evData.game);
      break;
    case SocketEvent.SCUTTLE:
      store.dispatch('processScuttle', evData);
      break;
    case SocketEvent.RESOLVE_THREE:
      store.dispatch('updateGameThenResetPNumIfNull', evData.game);
      store.commit('setPickingFromScrap', false);
      store.commit('setWaitingForOpponentToPickFromScrap', false);
      break;
    case SocketEvent.RESOLVE_FOUR:
      store.dispatch('updateGameThenResetPNumIfNull', evData.game);
      store.commit('setWaitingForOpponentToDiscard', false);
      store.commit('setDiscarding', false);
      break;
    case SocketEvent.RESOLVE:
      store.dispatch('updateGameThenResetPNumIfNull', evData.game);
      store.commit('setWaitingForOpponentToCounter', false);
      store.commit('setMyTurnToCounter', false);
      if (evData.happened) {
        switch (evData.oneOff.rank) {
          case 3:
            if (evData.playedBy !== store.state.game.myPNum) {
              store.commit('setWaitingForOpponentToPickFromScrap', true);
            } else {
              store.commit('setPickingFromScrap', true);
            }
            break;
          case 4:
            if (evData.playedBy === store.state.game.myPNum) {
              store.commit('setWaitingForOpponentToDiscard', true);
            } else {
              store.commit('setDiscarding', true);
            }
            break;
          case 7:
            if (evData.playedBy === store.state.game.myPNum) {
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
    case SocketEvent.TARGETED_ONE_OFF:
    case SocketEvent.ONE_OFF:
    case SocketEvent.COUNTER:
      store.dispatch('updateGameThenResetPNumIfNull', evData.game);
      if (evData.pNum !== store.state.game.myPNum) {
        store.commit('setWaitingForOpponentToCounter', false);
        store.commit('setMyTurnToCounter', true);
      } else {
        store.commit('setWaitingForOpponentToCounter', true);
        store.commit('setMyTurnToCounter', false);
      }
      break;
    // Sevens
    case SocketEvent.SEVEN_POINTS:
    case SocketEvent.SEVEN_FACE_CARD:
    case SocketEvent.SEVEN_JACK:
    case SocketEvent.SEVEN_SCUTTLE:
      store.dispatch('updateGameThenResetPNumIfNull', evData.game);
      store.commit('setPlayingFromDeck', false);
      store.commit('setWaitingForOpponentToPlayFromDeck', false);
      break;
    case SocketEvent.SEVEN_ONE_OFF:
    case SocketEvent.SEVEN_TARGETED_ONE_OFF:
      store.dispatch('updateGameThenResetPNumIfNull', evData.game);
      store.commit('setPlayingFromDeck', false);
      store.commit('setWaitingForOpponentToPlayFromDeck', false);
      if (evData.pNum !== store.state.game.myPNum) {
        store.commit('setWaitingForOpponentToCounter', false);
        store.commit('setMyTurnToCounter', true);
      }
      break;
    case SocketEvent.RE_LOGIN:
    case SocketEvent.SPECTATOR_JOINED:
    case SocketEvent.SPECTATOR_LEFT:
      store.dispatch('updateGameThenResetPNumIfNull', evData.game);
      break;
    case SocketEvent.REQUEST_STALEMATE:
      if (evData.requestedByPNum !== store.state.game.myPNum && !evData.victory.gameOver) {
        store.commit('setConsideringOpponentStalemateRequest', true);
      }
      break;
    case SocketEvent.REJECT_STALEMATE:
      store.commit('setConsideringOpponentStalemateRequest', false);
      store.commit('setWaitingForOpponentToStalemate', false);
      break;
  }


    // Validate current route & navigate if incorrect
    const targetRouteName = isSpectating ? ROUTE_NAME_SPECTATE : ROUTE_NAME_GAME;
    const shouldNavigate = currentRoute.name === ROUTE_NAME_LOBBY;
    if (shouldNavigate) {
      router.push({
        name: targetRouteName,
        params: {
          gameId: store.state.game.id,
        },
      });
    }
}
