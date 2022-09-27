import { io, reconnectSockets } from '@/plugins/sails.js';
import { ROUTE_NAME_LOBBY, ROUTE_NAME_GAME } from '@/router';

import { getPlayerPnumByUsername } from '_/utils/game-utils.js';

async function handleLogin(context, username, password, signup = false) {
  const authType = signup ? 'signup' : 'login';
  try {
    const response = await fetch(`/user/${authType}`, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({
        username,
        password,
      }),
      credentials: 'include',
    });
    const data = await response.json();
    if (response.status !== 200) {
      throw data.message;
    }
    await reconnectSockets();
    // If the response was successful, the user is logged in
    context.commit('authSuccess', username);
    return;
  } catch (err) {
    context.commit('clearAuth');
    throw new Error(err);
  }
}

export default {
  state: {
    // This value will ONLY be null on the initial load
    authenticated: null,
    username: null,
    mustReauthenticate: false,
  },
  mutations: {
    authSuccess(state, username) {
      state.authenticated = true;
      state.username = username;
    },
    clearAuth(state) {
      state.authenticated = false;
      state.username = null;
    },
    setMustReauthenticate(state, val) {
      state.mustReauthenticate = val;
    },
  },
  actions: {
    async requestLogin(context, { username, password }) {
      return handleLogin(context, username, password);
    },

    async requestSignup(context, { username, password }) {
      return handleLogin(context, username, password, true);
    },

    async requestLogout(context) {
      try {
        await fetch('/user/logout', {
          credentials: 'include',
        });
      } catch (err) {
        // We never want to stop a logout request from resolving
        // so we just capture the error and allow it to clearAuth anyway
        console.error(err);
      }
      context.commit('clearAuth');
      return;
    },
    requestReauthenticate(context, { username, password }) {
      return new Promise((resolve, reject) => {
        // Assume successful login - cancel upon error
        context.commit('authSuccess', username);
        io.socket.get(
          '/user/reLogin',
          {
            username,
            password,
          },
          function handleResponse(res, jwres) {
            if (jwres.statusCode === 200) {
              context.commit('setMustReauthenticate', false);
              const pNum = getPlayerPnumByUsername(context.rootState.game.players, context.state.username);
              context.commit('setMyPNum', pNum);
              return resolve();
            }
            context.commit('clearAuth');
            return reject(res.message);
          },
        );
      });
    },
    async requestStatus(context, { router, route }) {
      const { state } = context;

      // If we've authenticated before, fast fail
      if (state.authenticated !== null) {
        return;
      }

      const { name } = route;
      const isLobby = name === ROUTE_NAME_LOBBY;
      const isGame = name === ROUTE_NAME_GAME;

      try {
        const response = await fetch('/user/status', {
          credentials: 'include',
        });
        const status = await response.json();
        const { authenticated, username, gameId } = status;

        // If the user is not authenticated, we're done here
        if (!authenticated) {
          context.commit('clearAuth');
          return;
        }

        // If the user is authenticated and has a username, add it to the store
        if (username) {
          context.commit('authSuccess', username);
        }

        // If this is a lobby, redirect the user to the game list so they don't have to
        // log back in again
        if (isLobby) {
          return router.push('/');
        }

        // If the user is currently authenticated and part of a game, we need to resubscribe them
        // The sequencing here is a little interesting, but this is what happens to get a user back
        // in to a game in progress:
        //     - `requestStatus` is dispatched when the browser hits the site
        //     - `UserController.status` is called by the action
        //     - `requestReauthenticate` is dispatched
        //     - `UserController.reLogin` is called
        //     - `gameService.populateGame` is called
        //     - `Game.subscribe` is called
        //     - `Game.publish` is called
        if (isGame && gameId) {
          await context.dispatch('requestReauthenticate', { username });
        }

        return;
      } catch (err) {
        context.commit('clearAuth');
      }
    },
  },
};
