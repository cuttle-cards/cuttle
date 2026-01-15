import GameStatus from '../../../utils/GameStatus.json';
import { useGameStore } from '@/stores/game';
import { useGameHistoryStore } from '@/stores/gameHistory';
import router from '@/router.js';
import { ROUTE_NAME_GAME, ROUTE_NAME_SPECTATE, ROUTE_NAME_LOBBY } from '@/router';
import SocketEvent from '_/types/SocketEvent';
import { sleep } from '@/util/sleep';

// Handles socket updates of game data
export async function handleInGameEvents(evData, newRoute = null) {
  const gameStore = useGameStore();
  const gameHistoryStore = useGameHistoryStore();
  const targetRoute = newRoute ?? router.currentRoute.value;

  const { gameId: urlGameId } = targetRoute.params;
  const eventGameId = evData.game?.id ?? evData.gameId;
  const isSpectating = targetRoute.name === ROUTE_NAME_SPECTATE;
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
    gameStore.setGameOver(evData.victory);
  }
  switch (evData.change) {
    case SocketEvent.READY: {
      gameStore.updateReady(evData.pNum);
      return;
    }
    case SocketEvent.DEAL:
    case SocketEvent.DRAW:
    case SocketEvent.PASS:
    case SocketEvent.POINTS:
    case SocketEvent.FACE_CARD:
    case SocketEvent.LOAD_FIXTURE:
    case SocketEvent.JACK:
    case SocketEvent.DELETE_DECK:
    case SocketEvent.CONCEDE:
    case SocketEvent.RE_LOGIN:
    case SocketEvent.RESOLVE:
    case SocketEvent.FIZZLE:
    case SocketEvent.TARGETED_ONE_OFF:
    case SocketEvent.ONE_OFF:
    case SocketEvent.COUNTER:
    case SocketEvent.SEVEN_POINTS:
    case SocketEvent.SEVEN_FACE_CARD:
    case SocketEvent.SEVEN_JACK:
    case SocketEvent.SEVEN_DISCARD:
    case SocketEvent.SEVEN_ONE_OFF:
    case SocketEvent.SEVEN_TARGETED_ONE_OFF:
    case SocketEvent.STALEMATE_REQUEST:
    case SocketEvent.STALEMATE_ACCEPT:
    case SocketEvent.STALEMATE_REJECT:
      gameStore.updateGame(evData.game);
      break;
    case SocketEvent.SCUTTLE:
    case SocketEvent.SEVEN_SCUTTLE:
      gameStore.processScuttle(evData);
      break;
    case SocketEvent.RESOLVE_THREE:
      gameStore.processThrees(evData.chosenCard, evData.game);
      break;
    case SocketEvent.RESOLVE_FOUR:
      if (evData.playedBy !== gameStore.myPNum) {
        gameStore.processFours(evData.discardedCards, evData.game);
      } else {
        gameStore.updateGame(evData.game);
      }
      break;
    case SocketEvent.RESOLVE_FIVE:
      if (evData.playedBy !== gameStore.myPNum) {
        gameStore.processFives(evData.discardedCards, evData.game);
      } else {
        gameStore.updateGame(evData.game);
      }
      break;

    case SocketEvent.REMATCH:
      gameStore.setRematch({ pNum: evData.pNum, rematch: evData.game[`p${evData.pNum}Rematch`] });
      return;
    case SocketEvent.NEW_GAME_FOR_REMATCH: {
      // ignore if not currently in/spectating relevant game
      if (
        Number(urlGameId) !== evData.oldGameId ||
        ![ ROUTE_NAME_GAME, ROUTE_NAME_SPECTATE ].includes(targetRoute.name)
      ) {
        return;
      }
      gameStore.p0Rematch = true;
      gameStore.p1Rematch = true;
      gameStore.rematchGameId = evData.gameId;
      // stop early if spectating and haven't yet chosen to continue spectating
      if (gameHistoryStore.isSpectating && !gameStore.iWantToContinueSpectating) {
        return;
      }

      // wait for card flip animations
      await sleep(500);
      const route = {
        name: targetRoute.name,
        params: {
          gameId: evData.gameId,
        },
      };
      if (targetRoute.name === ROUTE_NAME_SPECTATE) {
        await gameStore.requestSpectate(evData.gameId, null, route);
        route.query = {
          gameStateIndex: gameStore.status === GameStatus.STARTED ? -1 : 0,
        };
      } else {
        gameStore.updateGame(evData.newGame);
      }

      router.replace(route);

      gameStore.iWantToContinueSpectating = false;
      gameStore.p0Rematch = null;
      gameStore.p1Rematch = null;
      break;
    }
    case SocketEvent.SPECTATOR_LEFT:
      if (gameStore.id === evData.gameId) {
        gameStore.removeSpectator(evData.username);
      }
      break;
    case SocketEvent.SPECTATOR_JOINED:
      if (gameStore.id === evData.gameId) {
        gameStore.addSpectator(evData.username);
      }
      break;
  }

  // Validate current route & navigate if incorrect
  const targetRouteName = isSpectating ? ROUTE_NAME_SPECTATE : ROUTE_NAME_GAME;
  const shouldNavigate = targetRoute.name === ROUTE_NAME_LOBBY;
  if (!newRoute && shouldNavigate) {
    router.replace({
      name: targetRouteName,
      params: {
        gameId: gameStore.id,
      },
    });
  }
  return;
}
