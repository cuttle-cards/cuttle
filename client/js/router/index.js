import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import LoginSignup from '../views/LoginSignup.vue';
import Lobby from '../views/Lobby.vue';
import GameView from '../views/GameView.vue';
import Rules from '../views/Rules.vue';
import Stats from '../views/Stats.vue';
import store from '../store/store.js';

export const ROUTE_NAME_LOBBY = 'Lobby';
export const ROUTE_NAME_GAME = 'Game';

Vue.use(VueRouter);

const mustBeAuthenticated = (to, from, next) => {
  if (store.state.auth.authenticated) {
    return next();
  }
  return next('/login');
};

const logoutAndRedirect = async (to, from, next) => {
  await store.dispatch('requestLogout');
  return next('/login');
};

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    beforeEnter: mustBeAuthenticated,
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginSignup,
  },
  // This route is just a passthrough to make sure the user is fully logged out before putting
  // them on the login screen
  {
    path: '/logout',
    name: 'Logout',
    beforeEnter: logoutAndRedirect,
  },
  {
    path: '/rules',
    name: 'Rules',
    component: Rules,
  },
  {
    name: ROUTE_NAME_LOBBY,
    path: '/lobby/:gameId',
    component: Lobby,
    // TODO: Add logic to redirect if a given game does not exist
    beforeEnter: mustBeAuthenticated,
  },
  {
    name: ROUTE_NAME_GAME,
    path: '/game/:gameId',
    component: GameView,
    // TODO: Add logic to redirect if a given game does not exist
    // mustBeAuthenticated intentionally left off here
    // If a user refreshes the relogin modal will fire and allow them to continue playing
  },
  {
    path: '/stats',
    name: 'Stats',
    component: Stats,
    beforeEnter: mustBeAuthenticated,
  },
];

const router = new VueRouter({
  routes,
});

router.beforeEach(async (to, _from, next) => {
  // Make sure we try and reestablish a player's session if one exists
  // We do this before the route resolves to preempt the reauth/logout logic
  await store.dispatch('requestStatus', {
    router,
    route: to,
  });
  next();
});

export default router;
