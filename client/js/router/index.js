import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import LoginSignup from '../views/LoginSignup.vue';
import Lobby from '../views/Lobby.vue';
import GameView from '../views/GameView.vue';
import Rules from '../views/Rules.vue';
import Stats from '../views/Stats.vue';
import store from '../store/store.js';

Vue.use(VueRouter);

const mustBeAuthenticated = (to, from, next) => {
  if (store.getters.authenticated) {
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
    name: 'Lobby',
    path: '/lobby/:gameId',
    component: Lobby,
    beforeEnter: mustBeAuthenticated,
  },
  {
    name: 'Game',
    path: '/game/:gameId',
    component: GameView,
  },
  {
    path: '/stats',
    name: 'Stats',
    component: Stats,
    // TODO update auth, make universal authentication middleware
    beforeEnter: mustBeAuthenticated,
  },
];

const router = new VueRouter({
  routes,
});

export default router;
