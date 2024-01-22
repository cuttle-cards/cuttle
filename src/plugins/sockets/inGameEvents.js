import { useGameStore } from '@/stores/game';
import router from '@/router.js';
import { ROUTE_NAME_GAME, ROUTE_NAME_SPECTATE, ROUTE_NAME_LOBBY, ROUTE_NAME_REMATCH } from '@/router';
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
  if (
    ![SocketEvent.REMATCH, SocketEvent.NEW_GAME_FOR_REMATCH, SocketEvent.JOIN_REMATCH].includes(
      evData.change,
    ) &&
    (!urlGameId || Number(urlGameId) !== eventGameId)
  ) {
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
      if (isSpectating) {
        gameStore.myPNum = 0; // always spectate as p0
        gameStore.isSpectating = true;
      }
      gameStore.resetPNumIfNullThenUpdateGame(evData.game);
      break;
    }
    case SocketEvent.DRAW:
    case SocketEvent.PASS:
    case SocketEvent.POINTS:
    case SocketEvent.FACE_CARD:
    case SocketEvent.LOAD_FIXTURE:
    case SocketEvent.JACK:
    case SocketEvent.DELETE_DECK:
      gameStore.resetPNumIfNullThenUpdateGame(evData.game);
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
    case SocketEvent.RESOLVE_FIVE:
      gameStore.processFives(evData.discardedCards, evData.game);
      break;
    case SocketEvent.RESOLVE:
      gameStore.resetPNumIfNullThenUpdateGame(evData.game);
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
          case 5:
            if (evData.playedBy === gameStore.myPNum) {
              gameStore.showResolveFive = true;
            } else {
              gameStore.waitingForOpponentToDiscard = true;
            }
            break;
          case 4:
            if (evData.playedBy === gameStore.myPNum) {
              gameStore.waitingForOpponentToDiscard = true;
            } else {
              gameStore.showResolveFour = true;
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
      gameStore.resetPNumIfNullThenUpdateGame(evData.game);
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
      gameStore.resetPNumIfNullThenUpdateGame(evData.game);
      gameStore.playingFromDeck = false;
      gameStore.waitingForOpponentToPlayFromDeck = false;
      break;
    case SocketEvent.SEVEN_ONE_OFF:
    case SocketEvent.SEVEN_TARGETED_ONE_OFF:
      gameStore.resetPNumIfNullThenUpdateGame(evData.game);
      gameStore.playingFromDeck = false;
      gameStore.waitingForOpponentToPlayFromDeck = false;
      if (evData.pNum !== gameStore.myPNum) {
        gameStore.waitingForOpponentToCounter = false;
        gameStore.myTurnToCounter = true;
      }
      break;
    case SocketEvent.REMATCH:
      gameStore.setRematch({ pNum: evData.pNum, rematch: evData.game[`p${evData.pNum}Rematch`] });
      if (
        evData.pNum === gameStore.myPNum &&
        currentRoute.name !== ROUTE_NAME_SPECTATE &&
        evData.game[`p${evData.pNum}Rematch`]
      ) {
        router.push({
          name: ROUTE_NAME_REMATCH,
          params: {
            gameId: gameStore.id,
          },
        });
      }
      return;
    case SocketEvent.NEW_GAME_FOR_REMATCH: {
      gameStore.setRematchGameId(evData.gameId);

      if (currentRoute.name === ROUTE_NAME_SPECTATE) {
        gameStore.updateGame(evData.newGame);
      }
      if (currentRoute.name === ROUTE_NAME_REMATCH) {
        const { gameId } = currentRoute.params;
        gameStore.requestJoinRematch({ oldGameId: gameId });
        router
          .push({
            name: ROUTE_NAME_GAME,
            params: {
              gameId: evData.gameId,
            },
          })
          .then(() => {
            window.location.reload();
          });
      }
      break;
    }
    case SocketEvent.JOIN_REMATCH: {
      if (currentRoute.name === ROUTE_NAME_SPECTATE) {
        gameStore.updateGame(evData.game);
        if (parseInt(urlGameId, 10) !== evData.game.id) {
          router
            .push({
              name: ROUTE_NAME_SPECTATE,
              params: {
                gameId: evData.gameId,
              },
            })
            .then(() => {
              gameStore.requestSpectate(evData.gameId);
            });
        }
      }
      break;
    }
    case SocketEvent.RE_LOGIN:
    case SocketEvent.SPECTATOR_JOINED:
    case SocketEvent.SPECTATOR_LEFT:
      gameStore.resetPNumIfNullThenUpdateGame(evData.game);
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
