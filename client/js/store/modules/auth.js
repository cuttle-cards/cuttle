import { io } from '../../plugins/sails.js';
import { ROUTE_NAME_LOBBY, ROUTE_NAME_GAME } from '@/router';

import { getPlayerPnumByUsername } from '_/utils/game-utils.js';

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
    requestLogin(context, data) {
      return new Promise((resolve, reject) => {
        io.socket.post(
          '/user/login',
          {
            username: data.username,
            password: data.password,
          },
          function handleResponse(resData, jwres) {
            if (jwres.statusCode === 200) {
              context.commit('authSuccess', data.username);
              return resolve();
            }
            context.commit('clearAuth');
            return reject(jwres.body.message);
          }
        );
      });
    },

    requestSignup(context, data) {
      return new Promise((resolve, reject) => {
        io.socket.put(
          '/user/signup',
          {
            username: data.username,
            password: data.password,
          },
          function handleResponse(resData, jwres) {
            if (jwres.statusCode === 200) {
              context.commit('authSuccess', data.username);
              return resolve();
            }
            let message;
            if (Object.prototype.hasOwnProperty.call(resData, 'message')) {
              message = resData.message;
            } else if (typeof resData === 'string') {
              message = resData;
            } else {
              message = new Error('Unknown error signing up');
            }
            context.commit('clearAuth');
            return reject(message);
          }
        );
      });
    },

    requestLogout(context) {
      return new Promise((resolve, reject) => {
        io.socket.get('/user/logout', {}, function handleResponse(resData, jwres) {
          if (jwres.statusCode === 200) {
            context.commit('clearAuth');
            return resolve();
          }
          return reject(new Error('Error logging out :('));
        });
      });
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
              const pNum = getPlayerPnumByUsername(
                context.rootState.game.players,
                context.state.username
              );
              context.commit('setMyPNum', pNum);
              return resolve();
            }
            context.commit('clearAuth');
            return reject(res.message);
          }
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
