import { useAuthStore } from '@/stores/auth';
import { useGameStore } from '@/stores/game';
import router from '@/router.js';
import { ROUTE_NAME_GAME, ROUTE_NAME_SPECTATE, ROUTE_NAME_HOME } from '@/router';

export async function handleConnect() {
  const authStore = useAuthStore();
  const gameStore = useGameStore();
  // Request latest game state if socket reconnects during game
  switch (router.currentRoute.value.name) {
    case ROUTE_NAME_GAME: {
      authStore.authenticated = null;
      await authStore.requestStatus(router.currentRoute.value);
      const gameId = Number(router.currentRoute.value.params.gameId);
      const gameStateIndex = Number(router.currentRoute.value.query.gameStateIndex ?? -1);
      const response = await gameStore.requestGameState(gameId, gameStateIndex);
      if (response?.victory?.gameOver && response.game.rematchGame) {
        await gameStore.requestGameState(response.game.rematchGame);
        gameStore.myPNum = (gameStore.myPNum + 1) % 2;
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
      return gameStore.requestSpectate(gameId);
    }
    default:
      return;
  }
}
