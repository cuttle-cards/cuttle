import { useAuthStore } from '@/stores/auth';
import { useGameStore } from '@/stores/game';
import { useGameHistoryStore } from '@/stores/gameHistory';
import { useGameListStore } from '@/stores/gameList';
import router from '@/router.js';
import { ROUTE_NAME_GAME, ROUTE_NAME_SPECTATE, ROUTE_NAME_HOME } from '@/router';

export async function handleConnect() {
  const authStore = useAuthStore();
  const gameStore = useGameStore();
  const gameHistoryStore = useGameHistoryStore();

  const gameListStore = useGameListStore();
  // Request latest game state if socket reconnects during game
  switch (router.currentRoute.value.name) {
    case ROUTE_NAME_GAME: {
      authStore.authenticated = null;
      await authStore.requestStatus(router.currentRoute.value);
      const gameId = Number(router.currentRoute.value.params.gameId);
      const gameStateIndex = gameHistoryStore.currentGameStateIndex;
      const response = await gameStore.requestGameState(gameId, gameStateIndex);
      if (response?.victory?.gameOver && response.game.rematchGame) {
        await gameStore.requestGameState(response.game.rematchGame);
        router.push({ name: ROUTE_NAME_GAME, params: { gameId: response.game.rematchGame } });
      }
      return;
    }
    case ROUTE_NAME_SPECTATE: {
      const gameId = Number(router.currentRoute.value.params.gameId);
      if (!Number.isInteger(gameId)) {
        router.push(ROUTE_NAME_HOME);
        return;
      }

      return gameStore.requestSpectate(gameId, gameHistoryStore.currentGameStateIndex);
    }
    case ROUTE_NAME_HOME: {
      return gameListStore.requestGameList();
    }
    default:
      return;
  }
}
