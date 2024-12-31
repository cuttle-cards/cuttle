import { useGameStore } from '@/stores/game';
import router from '@/router.js';
import { ROUTE_NAME_GAME, ROUTE_NAME_SPECTATE, ROUTE_NAME_LOBBY } from '@/router';
import SocketEvent from '_/types/SocketEvent';
import { sleep } from '@/util/sleep';

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
    ![ SocketEvent.REMATCH, SocketEvent.NEW_GAME_FOR_REMATCH, SocketEvent.JOIN_REMATCH ].includes(
      evData.change,
    ) &&
    (!urlGameId || Number(urlGameId) !== eventGameId)
  ) {
    return;
  }
  // Handle GameOver
  if (evData.victory?.gameOver) {
    sleep(1000).then(() => {
      gameStore.setGameOver(evData.victory);
    });
  }
  switch (evData.change) {
    case SocketEvent.READY: {
      gameStore.updateReady(evData.pNum);
      return;
    }
    case SocketEvent.DEAL: {
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
    case SocketEvent.FIZZLE:
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
    case SocketEvent.SEVEN_DISCARD:
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
      return;
    case SocketEvent.NEW_GAME_FOR_REMATCH: {
      // ignore if not currently in/spectating relevant game
      if (
        Number(urlGameId) !== evData.oldGameId ||
        ![ ROUTE_NAME_GAME, ROUTE_NAME_SPECTATE ].includes(currentRoute.name)
      ) {
        return;
      }
      gameStore.p0Rematch = true;
      gameStore.p1Rematch = true;
      gameStore.rematchGameId = evData.gameId;
      // stop early if spectating and haven't yet chosen to continue spectating
      if (gameStore.isSpectating && !gameStore.iWantToContinueSpectating) {
        return;
      }

      // wait for card flip animations
      await sleep(500);

      const { gameId: oldGameId } = currentRoute.params;

      if (currentRoute.name === ROUTE_NAME_SPECTATE) {
        await gameStore.requestSpectate(evData.gameId);
      } else {
        await gameStore.requestJoinRematch({ oldGameId });
        gameStore.myPNum = null;
        gameStore.resetPNumIfNullThenUpdateGame(evData.newGame);
      }

      router.push({
        name: currentRoute.name,
        params: {
          gameId: evData.gameId,
        },
      });

      gameStore.iWantToContinueSpectating = false;
      gameStore.p0Rematch = null;
      gameStore.p1Rematch = null;
      break;
    }
    case SocketEvent.RE_LOGIN:
    case SocketEvent.SPECTATOR_JOINED:
      gameStore.resetPNumIfNullThenUpdateGame(evData.game);
      break;
    case SocketEvent.SPECTATOR_LEFT:
      if (gameStore.id === evData.gameId) {
        gameStore.removeSpectator(evData.username);
      }
      break;
    case SocketEvent.REQUEST_STALEMATE:
      // Show OpponentRequestedStalemateDialog if opponent requested stalemate
      //   and game is not yet over
      gameStore.consideringOpponentStalemateRequest =
        !evData.victory.gameOver && evData.requestedByPNum !== gameStore.myPNum;
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
