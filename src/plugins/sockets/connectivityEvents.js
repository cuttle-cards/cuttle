import { useAuthStore } from '@/stores/auth';
import { useGameStore } from '@/stores/game';
import router from '@/router.js';
import { ROUTE_NAME_GAME, ROUTE_NAME_SPECTATE, ROUTE_NAME_HOME } from '@/router';

export function handleConnect() {
  const authStore = useAuthStore();
  const gameStore = useGameStore();
  // Request latest game state if socket reconnects during game
  switch (router.currentRoute.value.name) {
    case ROUTE_NAME_GAME:
      authStore.authenticated = null;
      return authStore.requestStatus(router.currentRoute.value);
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
