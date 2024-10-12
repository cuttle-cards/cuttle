import { createRouter, createWebHistory } from 'vue-router';
import { useGameStore } from '@/stores/game';
import { useAuthStore } from '@/stores/auth';

export const ROUTE_NAME_GAME = 'Game';
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

    // Check if the game exists
    const gameExists = await gameStore.checkGameExists(gameId);
    if (!gameExists) {
      return { name: 'Home', query: { error: 'Game does not exist' } };
    }

    if (gameStore.players.some(({ username }) => username === authStore.username)) {
      return true;
    }

    await gameStore.requestSubscribe(gameId);
    return true;
  } catch (err) {
    return { name: 'Home', query: { gameId: gameId, error: err.message } };
  }
};

const routes = [
  {
    path: '/',
    name: ROUTE_NAME_HOME,
    component: () => import('@/routes/home/HomeView.vue'),
    beforeEnter: mustBeAuthenticated,
  },
  {
    path: '/login/:lobbyRedirectId?',
    name: ROUTE_NAME_LOGIN,
    component: () => import('@/routes/login/LoginView.vue'),
    meta: {
      hideNavigation: true,
    },
  },
  {
    path: '/signup',
    name: ROUTE_NAME_SIGNUP,
    component: () => import('@/routes/login/LoginView.vue'),
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
    component: () => import('@/routes/rules/RulesView.vue'),
  },
  {
    name: ROUTE_NAME_LOBBY,
    path: '/lobby/:gameId?',
    component: () => import('@/routes/lobby/LobbyView.vue'),
    // TODO: Add logic to redirect if a given game does not exist
    beforeEnter: checkAndSubscribeToLobby,
    meta: {
      hideNavigation: true,
    },
  },
  {
    name: ROUTE_NAME_GAME,
    path: '/game/:gameId?',
    component: () => import('@/routes/game/GameView.vue'),
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
    component: () => import('@/routes/game/GameView.vue'),
    meta: {
      hideNavigation: true,
    },
  },
  {
    path: '/stats/:seasonId?',
    name: ROUTE_NAME_STATS,
    component: () => import('@/routes/stats/StatsView.vue'),
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

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();
  // Make sure we try and reestablish a player's session if one exists
  // We do this before the route resolves to preempt the reauth/logout logic
  await authStore.requestStatus(to);

  next();
});

export default router;
