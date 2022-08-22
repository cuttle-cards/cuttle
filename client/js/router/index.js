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

const subscribeToGame = async (to, from, next) => {
  const gameId = await store.state.game.id;
  if (gameId) {
    await store.dispatch('requestSubscribe', gameId);
  }
  return next();
};

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    beforeEnter: async (to, from, next) => {
      mustBeAuthenticated(to, from, next);
      // These need to be done in order, first leave any existing lobbies
      // then get the updated game list
      try {
        await store.dispatch('requestLeaveLobby');
        console.log('Leaving any lobbies before requesting the game list');
      } catch {
        // Swallow error, not currently in a lobby
      }
      await store.dispatch('requestGameList');
    },
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
    beforeEnter: async (to, from, next) => {
      mustBeAuthenticated(to, from, next);
      return subscribeToGame(to, from, next);
    },
  },
  {
    name: 'Game',
    path: '/game/:gameId',
    component: GameView,
    beforeEnter: async (to, from, next) => {
      // Requires authentication but the GameView component will allow a user to authenticate
      // via the reconnect dialog so they don't lose their place in the game
      // mustBeAuthenticated(to, from, next);
      return subscribeToGame(to, from, next);
    },
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
