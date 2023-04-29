import store from '@/store/store.js';
import router from '@/router.js';
import { ROUTE_NAME_GAME, ROUTE_NAME_SPECTATE } from '@/router';
import SocketEvent from '../../../types/SocketEvent';

// Handles socket updates of game data
export function handleInGameEvents(evData) {
  switch (evData.verb) {
    case SocketEvent.UPDATED: {
      const currentRoute = router.currentRoute.value;
      // No-op if the event's gameId doesn't match the url
      const { gameId: urlGameId } = currentRoute.params;
      const eventGameId = evData.data?.game?.id ?? evData.data.gameId;
      if (urlGameId && Number(urlGameId) !== eventGameId) {
        return;
      }
      // Handle GameOver
      if (evData.data.victory && evData.data.victory.gameOver) {
        setTimeout(() => {
          store.commit('setGameOver', evData.data.victory);
        }, 1000);
      }
      switch (evData.data.change) {
        case SocketEvent.READY:
          store.commit('updateReady', evData.data.pNum);
          break;
        case SocketEvent.INITIALIZE: {
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
        case SocketEvent.DRAW:
        case SocketEvent.PASS:
        case SocketEvent.POINTS:
        case SocketEvent.FACE_CARD:
        case SocketEvent.LOAD_FIXTURE:
        case SocketEvent.JACK:
        case SocketEvent.DELETE_DECK:
          store.dispatch('updateGameThenResetPNumIfNull', evData.data.game);
          break;
        case SocketEvent.SCUTTLE:
          store.dispatch('processScuttle', evData.data);
          break;
        case SocketEvent.RESOLVE_THREE:
          store.dispatch('updateGameThenResetPNumIfNull', evData.data.game);
          store.commit('setPickingFromScrap', false);
          store.commit('setWaitingForOpponentToPickFromScrap', false);
          break;
        case SocketEvent.RESOLVE_FOUR:
          store.dispatch('updateGameThenResetPNumIfNull', evData.data.game);
          store.commit('setWaitingForOpponentToDiscard', false);
          store.commit('setDiscarding', false);
          break;
        case SocketEvent.RESOLVE:
          store.dispatch('updateGameThenResetPNumIfNull', evData.data.game);
          store.commit('setWaitingForOpponentToCounter', false);
          store.commit('setMyTurnToCounter', false);
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
        case SocketEvent.TARGETED_ONE_OFF:
        case SocketEvent.ONE_OFF:
        case SocketEvent.COUNTER:
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
        case SocketEvent.SEVEN_POINTS:
        case SocketEvent.SEVEN_FACE_CARD:
        case SocketEvent.SEVEN_JACK:
        case SocketEvent.SEVEN_SCUTTLE:
          store.dispatch('updateGameThenResetPNumIfNull', evData.data.game);
          store.commit('setPlayingFromDeck', false);
          store.commit('setWaitingForOpponentToPlayFromDeck', false);
          break;
        case SocketEvent.SEVEN_ONE_OFF:
        case SocketEvent.SEVEN_TARGETED_ONE_OFF:
          store.dispatch('updateGameThenResetPNumIfNull', evData.data.game);
          store.commit('setPlayingFromDeck', false);
          store.commit('setWaitingForOpponentToPlayFromDeck', false);
          if (evData.data.pNum !== store.state.game.myPNum) {
            store.commit('setWaitingForOpponentToCounter', false);
            store.commit('setMyTurnToCounter', true);
          }
          break;
        case SocketEvent.RE_LOGIN:
          store.dispatch('updateGameThenResetPNumIfNull', evData.data.game);
          break;
        case SocketEvent.REQUEST_STALEMATE:
          if (evData.data.requestedByPNum !== store.state.game.myPNum && !evData.data.victory.gameOver) {
            store.commit('setConsideringOpponentStalemateRequest', true);
          }
          break;
        case SocketEvent.REJECT_STALEMATE:
          store.commit('setConsideringOpponentStalemateRequest', false);
          store.commit('setWaitingForOpponentToStalemate', false);
          break;
      }
    }
  }
}
