import store from '@/store/store.js';
import router from '@/router.js';
import { ROUTE_NAME_GAME, ROUTE_NAME_SPECTATE, ROUTE_NAME_HOME } from '@/router';

export function handleConnect() {
  // Request latest game state if socket reconnects during game
  const { username } = store.state.auth;
  switch (router.currentRoute.value.name) {
    case ROUTE_NAME_GAME:
      return store.dispatch('requestReauthenticate', { username });
    case ROUTE_NAME_SPECTATE: {
      const gameId = Number(router.currentRoute.value.params.gameId);
      if (!Number.isInteger(gameId)) {
        router.push(ROUTE_NAME_HOME);
        return;
      }
      return store.dispatch('requestSpectate', gameId);
    }
    default:
      return;
  }
}
