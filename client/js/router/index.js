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
  if (store.state.auth.authenticated) {
    return next();
  }
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
  {
    path: '/rules',
    name: 'Rules',
    component: Rules,
  },
  {
    name: 'Lobby',
    path: '/lobby/:gameId',
    component: Lobby,
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
    beforeEnter: mustBeAuthenticated,
  },
];

const router = new VueRouter({
  routes,
});

export default router;
