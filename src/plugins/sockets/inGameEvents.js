import { useGameStore } from '@/stores/game';
import router from '@/router.js';
import { ROUTE_NAME_GAME, ROUTE_NAME_SPECTATE, ROUTE_NAME_LOBBY } from '@/router';
import SocketEvent from '_/types/SocketEvent';

// Handles socket updates of game data
export async function handleInGameEvents(evData) {
  const gameStore = useGameStore();
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
      gameStore.setGameOver(evData.victory);
    }, 1000);
  }
  switch (evData.change) {
    case SocketEvent.READY: {
      gameStore.updateReady(evData.pNum);
      return;
    }
    case SocketEvent.INITIALIZE: {
      // Update state
      gameStore.resetState();
      gameStore.updateGameThenResetPNumIfNull(evData.game);
      if (isSpectating) {
        gameStore.myPNum = 0; // always spectate as p0
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
      gameStore.updateGameThenResetPNumIfNull(evData.game);
      break;
    case SocketEvent.SCUTTLE:
      gameStore.processScuttle(evData);
      break;
    case SocketEvent.RESOLVE_THREE:
      gameStore.processThrees(evData.chosenCard, evData.game);
      break;
    case SocketEvent.RESOLVE_FOUR:
      gameStore.processFours(evData.discardedCards, evData.game);
      break;
    case SocketEvent.RESOLVE:
      gameStore.updateGameThenResetPNumIfNull(evData.game);
      gameStore.waitingForOpponentToCounter = false;
      gameStore.myTurnToCounter = false;
      if (evData.happened) {
        switch (evData.oneOff.rank) {
          case 3:
            if (evData.playedBy !== gameStore.myPNum) {
              gameStore.waitingForOpponentToPickFromScrap = true;
            } else {
              gameStore.pickingFromScrap = true;
            }
            break;
          case 4:
            if (evData.playedBy === gameStore.myPNum) {
              gameStore.waitingForOpponentToDiscard = true;
            } else {
              gameStore.discarding = true;
            }
            break;
          case 7:
            if (evData.playedBy === gameStore.myPNum) {
              gameStore.playingFromDeck = true;
            } else {
              gameStore.waitingForOpponentToPlayFromDeck = true;
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
      gameStore.updateGameThenResetPNumIfNull(evData.game);
      if (evData.pNum !== gameStore.myPNum) {
        gameStore.waitingForOpponentToCounter = false;
        gameStore.myTurnToCounter = true;
      } else {
        gameStore.waitingForOpponentToCounter = true;
        gameStore.myTurnToCounter = false;
      }
      break;
    // Sevens
    case SocketEvent.SEVEN_POINTS:
    case SocketEvent.SEVEN_FACE_CARD:
    case SocketEvent.SEVEN_JACK:
    case SocketEvent.SEVEN_SCUTTLE:
      gameStore.updateGameThenResetPNumIfNull(evData.game);
      gameStore.playingFromDeck = false;
      gameStore.waitingForOpponentToPlayFromDeck = false;
      break;
    case SocketEvent.SEVEN_ONE_OFF:
    case SocketEvent.SEVEN_TARGETED_ONE_OFF:
      gameStore.updateGameThenResetPNumIfNull(evData.game);
      gameStore.playingFromDeck = false;
      gameStore.waitingForOpponentToPlayFromDeck = false;
      if (evData.pNum !== gameStore.myPNum) {
        gameStore.waitingForOpponentToCounter = false;
        gameStore.myTurnToCounter = true;
      }
      break;
    case SocketEvent.RE_LOGIN:
    case SocketEvent.SPECTATOR_JOINED:
    case SocketEvent.SPECTATOR_LEFT:
      gameStore.updateGameThenResetPNumIfNull(evData.game);
      break;
    case SocketEvent.REQUEST_STALEMATE:
      if (evData.requestedByPNum !== gameStore.myPNum && !evData.victory.gameOver) {
        gameStore.consideringOpponentStalemateRequest = true;
      }
      break;
    case SocketEvent.REJECT_STALEMATE:
      gameStore.consideringOpponentStalemateRequest = false;
      gameStore.waitingForOpponentToStalemate = false;
      break;
  }

  // Validate current route & navigate if incorrect
  const targetRouteName = isSpectating ? ROUTE_NAME_SPECTATE : ROUTE_NAME_GAME;
  const shouldNavigate = currentRoute.name === ROUTE_NAME_LOBBY;
  if (shouldNavigate) {
    router.push({
      name: targetRouteName,
      params: {
        gameId: gameStore.id,
      },
    });
  }
}
