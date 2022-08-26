import { io } from '../../plugins/sails.js';

export default {
  state: {
    authenticated: false,
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
              let myPNum = context.rootState.game.players.findIndex(
                (player) => player.username === context.state.username
              );
              if (myPNum === -1) {
                myPNum = null;
              }
              context.commit('setMyPNum', myPNum);
              return resolve();
            }
            context.commit('clearAuth');
            return reject(res.message);
          }
        );
      });
    },
    async requestStatus(context) {
      if (!window) {
        // Swallow error, this call is only supported client side
        return;
      }

      const { location } = window;
      const isLobby = location.hash.startsWith('#/lobby');
      const isGame = location.hash.startsWith('#/game');
      // We first need to check if this is a game route, if it is we can not auth the user or
      // it will break the game until we add reconnect/subscribe logic
      // By stopping here, Vue will allow the user to reconnect via the relogin dialog instead
      if (isGame) {
        return;
      }

      try {
        const response = await fetch('/user/status', {
          credentials: 'include',
        });
        const status = await response.json();
        const { authenticated, username } = status;

        // If the user is not authenticated, we're done here
        if (!authenticated) {
          return response;
        }

        // If the user is authenticated and has a username, add it to the store
        if (username) {
          context.commit('authSuccess', username);
        }

        // If this is a lobby, redirect the user to the game list so they don't have to
        // log back in again
        if (isLobby) {
          location.href = '/#/';
          return;
        }

        return response;
      } catch (err) {
        context.commit('clearAuth');
        throw new Error(err);
      }
    },
  },
};
