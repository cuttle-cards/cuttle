import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/routes/home/HomeView.vue';
import LoginView from '@/routes/login/LoginView.vue';
import LobbyView from '@/routes/lobby/LobbyView.vue';
import GameView from '@/routes/game/GameView.vue';
import RulesView from '@/routes/rules/RulesView.vue';
import StatsView from '@/routes/stats/StatsView.vue';
import { useGameStore } from '@/stores/game';
import { useAuthStore } from '@/stores/auth';
import GameStatus from '_/utils/GameStatus.json';

export const ROUTE_NAME_GAME = 'Game';
export const ROUTE_NAME_SPECTATE_LIST = 'SpectateList';
export const ROUTE_NAME_SPECTATE = 'Spectate';
export const ROUTE_NAME_HOME = 'Home';
export const ROUTE_NAME_LOBBY = 'Lobby';
export const ROUTE_NAME_LOGIN = 'Login';
export const ROUTE_NAME_LOGOUT = 'Logout';
export const ROUTE_NAME_RULES = 'Rules';
export const ROUTE_NAME_SIGNUP = 'Signup';
export const ROUTE_NAME_STATS = 'Stats';

const mustBeAuthenticated = async (to, from, next) => {
  const authStore = useAuthStore();
  if (authStore.authenticated) {
    return next();
  }
  const isReturningUser = await authStore.getIsReturningUser();
  if (isReturningUser === 'true') {
    return next('/login');
  }
  return next('/signup');
};

const logoutAndRedirect = async (to, from, next) => {
  const authStore = useAuthStore();
  await authStore.requestLogout();
  return next('/login');
};

const checkAndSubscribeToLobby = async (to) => {
  const gameStore = useGameStore();
  const authStore = useAuthStore();
  const gameId = parseInt(to.params.gameId);
  try {
    if (Number.isNaN(gameId) || !Number.isFinite(gameId)) {
      throw new Error('home.snackbar.invalidLobbyNumber');
    }

    if (!authStore.authenticated) {
      return { path: `/login/${gameId}` };
    }

    if (gameStore.players.some(({ username }) => username === authStore.username)) {
      return true;
    }

    const { game } = await gameStore.requestSubscribe(gameId);
    if (game.status === GameStatus.STARTED) {
      return { path: `/game/${gameId}` };
    }
    return true;
  } catch (err) {
    return { name: 'Home', query: { gameId: gameId, error: err?.message ?? `Could not load game ${gameId}` } };
  }
};

const getGameState = async (to) => {
  const gameStore = useGameStore();
  const gameId = parseInt(to.params.gameId);
  gameStore.id = gameId;
  const gameStateIndex = parseInt(to.query.gameStateIndex ?? -1);
  try {
    const response = await gameStore.requestGameState(gameId, gameStateIndex, to);
    if (response?.victory?.gameOver && response.game.rematchGame) {
      await gameStore.requestGameState(response.game.rematchGame);
      gameStore.myPNum = (gameStore.myPNum + 1) % 2;
      return { name: to.name, params: { gameId: response.game.rematchGame } };
    }
  } catch (err) {
    return { name: 'Home', query: { gameId: gameId, error: err?.message ?? `Could not load game ${gameId}` } };
  }
  return;
};

const setupSpectate = async (to) => {
  const gameStore = useGameStore();
  let { gameId } = to.params;
  gameId = Number(gameId);
  const { gameStateIndex } = to.query;
  const isValidGameStateIndex = 
    gameStateIndex !== undefined && 
    Number.isInteger(Number(gameStateIndex)) && 
    (Number(gameStateIndex) === -1 || Number(gameStateIndex) >= 0);
  try {
    await gameStore.requestSpectate(gameId, gameStateIndex);
    gameStore.id = gameId;
    if (isValidGameStateIndex) {
      return;
    }
    // Default to latest gameState if game is ongoing
    if (gameStore.status === GameStatus.STARTED) {
      return {
        ...to,
        query: {
          ...to.query,
          gameStateIndex: -1,
        },
        replace: true,
      };
    }
    // Default to first state otherwise
    return {
      ...to,
      query: {
        ...to.query,
        gameStateIndex: 0,
      },
      replace: true,
    };
  } catch (err) {
    return { name: 'Home', query: { gameId: gameId, error: err?.message ?? err ?? `Could not spectate game ${gameId}` } };
  }

};

const routes = [
  {
    path: '/',
    name: ROUTE_NAME_HOME,
    component: HomeView,
    beforeEnter: mustBeAuthenticated,
  },
  {
    name: ROUTE_NAME_SPECTATE_LIST,
    path: '/spectate-list',
    component: HomeView,
    beforeEnter: mustBeAuthenticated
  },
  {
    path: '/login/:lobbyRedirectId?',
    name: ROUTE_NAME_LOGIN,
    component: LoginView,
    meta: {
      hideNavigation: true,
    },
  },
  {
    path: '/signup',
    name: ROUTE_NAME_SIGNUP,
    component: LoginView,
    meta: {
      hideNavigation: true,
    },
  },
  // This route is just a passthrough to make sure the user is fully logged out before putting
  // them on the login screen
  {
    path: '/logout',
    name: ROUTE_NAME_LOGOUT,
    beforeEnter: logoutAndRedirect,
    meta: {
      hideNavigation: true,
    },
  },
  {
    path: '/rules',
    name: ROUTE_NAME_RULES,
    component: RulesView,
  },
  {
    name: ROUTE_NAME_LOBBY,
    path: '/lobby/:gameId?',
    component: LobbyView,
    // TODO: Add logic to redirect if a given game does not exist
    beforeEnter: checkAndSubscribeToLobby,
    meta: {
      hideNavigation: true,
    },
  },
  {
    name: ROUTE_NAME_GAME,
    path: '/game/:gameId?',
    component: GameView,
    beforeEnter: getGameState,
    // TODO: Add logic to redirect if a given game does not exist
    // mustBeAuthenticated intentionally left off here
    // If a user refreshes the relogin modal will fire and allow them to continue playing
    meta: {
      hideNavigation: true,
    },
  },
  {
    name: ROUTE_NAME_SPECTATE,
    path: '/spectate/:gameId?',
    component: GameView,
    meta: {
      hideNavigation: true,
    },
    beforeEnter: setupSpectate,
  },
  {
    path: '/stats/:seasonId?',
    name: ROUTE_NAME_STATS,
    component: StatsView,
    beforeEnter: mustBeAuthenticated,
  },
  // Catch every other unsupported route
  {
    path: '/:pathMatch(.*)*',
    name: 'Not Found',
    component: () => import('@/routes/error/NotFoundView.vue'),
  },
];

const getInitialPath = () => {
  if (window.location.hash.startsWith('#/')) {
    const path = window.location.hash.replace('#/', '');
    window.location.hash = '';
    return path;
  }
  return null;
};

const initialPath = getInitialPath();
if (initialPath) {
  window.history.replaceState({}, '', initialPath);
}

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' };
    } else if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  },
});

router.beforeEach(async (_to, _from, next) => {
  const authStore = useAuthStore();
  // Make sure we try and reestablish a player's session if one exists
  // We do this before the route resolves to preempt the reauth/logout logic
  await authStore.requestStatus();

  next();
});

export default router;
