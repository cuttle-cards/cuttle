import { useAuthStore } from '@/stores/auth';
import router from '@/router.js';
import { ROUTE_NAME_GAME, ROUTE_NAME_SPECTATE, ROUTE_NAME_HOME } from '@/router';

export function handleConnect() {
  const authUserStore = useAuthStore();
  // Request latest game state if socket reconnects during game
  const { username } = authUserStore;
  switch (router.currentRoute.value.name) {
    case ROUTE_NAME_GAME:
      return authUserStore.requestReauthenticate({ username });
    case ROUTE_NAME_SPECTATE: {
      const gameId = Number(router.currentRoute.value.params.gameId);
      if (!Number.isInteger(gameId)) {
        router.push(ROUTE_NAME_HOME);
        return;
      }
      return authUserStore.requestSpectate(gameId);
    }
    default:
      return;
  }
}
