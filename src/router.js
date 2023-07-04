import { createRouter, createWebHashHistory } from 'vue-router';


import HomeView from '@/views/HomeView.vue';
import LoginView from '@/views/LoginView.vue';
import LobbyView from '@/views/LobbyView.vue';
import GameView from '@/views/GameView.vue';
import RulesView from '@/views/RulesView.vue';
import StatsView from '@/views/StatsView.vue';
import store from '@/store/store.js';

export const ROUTE_NAME_GAME = 'Game';
export const ROUTE_NAME_SPECTATE = 'Spectate';
export const ROUTE_NAME_HOME = 'Home';
export const ROUTE_NAME_LOBBY = 'Lobby';
export const ROUTE_NAME_LOGIN = 'Login';
export const ROUTE_NAME_LOGOUT = 'Logout';
export const ROUTE_NAME_RULES = 'Rules';
export const ROUTE_NAME_SIGNUP = 'Signup';
export const ROUTE_NAME_STATS = 'Stats';
export const ROUTE_NAME_STATS_SEASON = 'StatsBySeason';

const mustBeAuthenticated = async (to, from, next) => {
  if (store.state.auth.authenticated) {
    return next();
  }
  await store.dispatch('getReturningUser');
  if (store.state.auth.isReturningUser) {
    return next('/login');
  }
  return next('/signup');
};

const logoutAndRedirect = async (to, from, next) => {
  await store.dispatch('requestLogout');
  return next('/login');
};

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    beforeEnter: mustBeAuthenticated,
  },
  {
    path: '/login',
    name: ROUTE_NAME_LOGIN,
    component: LoginView,
  },
  {
    path: '/signup',
    name: ROUTE_NAME_SIGNUP,
    component: LoginView,
  },
  // This route is just a passthrough to make sure the user is fully logged out before putting
  // them on the login screen
  {
    path: '/logout',
    name: ROUTE_NAME_LOGOUT,
    beforeEnter: logoutAndRedirect,
  },
  {
    path: '/rules',
    name: ROUTE_NAME_RULES,
    component: RulesView,
  },
  {
    name: ROUTE_NAME_LOBBY,
    path: '/lobby/:gameId',
    component: LobbyView,
    // TODO: Add logic to redirect if a given game does not exist
    beforeEnter: mustBeAuthenticated,
    meta: {
      hideNavigation: true,
    },
  },
  {
    name: ROUTE_NAME_GAME,
    path: '/game/:gameId',
    component: GameView,
    // TODO: Add logic to redirect if a given game does not exist
    // mustBeAuthenticated intentionally left off here
    // If a user refreshes the relogin modal will fire and allow them to continue playing
    meta: {
      hideNavigation: true,
    },
  },
  {
    name: ROUTE_NAME_SPECTATE,
    path: '/spectate/:gameId',
    component: GameView,
    meta: {
      hideNavigation: true,
    },
  },
  {
    path: '/stats',
    name: ROUTE_NAME_STATS,
    component: StatsView,
    beforeEnter: mustBeAuthenticated,
  },
  {
    path: '/stats/:seasonId',
    name: ROUTE_NAME_STATS_SEASON,
    component: StatsView,
    beforeEnter: mustBeAuthenticated,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach(async (to, _from, next) => {
  // Make sure we try and reestablish a player's session if one exists
  // We do this before the route resolves to preempt the reauth/logout logic
  await store.dispatch('requestStatus', to);
  next();
});

export default router;