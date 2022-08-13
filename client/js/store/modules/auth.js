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
        io.socket.get('/user/logout', {}, async function handleResponse(resData, jwres) {
          if (jwres.statusCode === 200) {
            await context.commit('clearAuth');
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
    requestStatus(context) {
      return new Promise((resolve, reject) => {
        io.socket.get('/user/status', {}, function handleResponse(resData, jwres) {
          if (jwres.statusCode !== 200) {
            context.commit('clearAuth');
            return reject(new Error('Error getting user status'));
          }
          const { authenticated, id, username } = resData;
          if (authenticated && username) {
            context.commit('authSuccess', username);
          }
          return resolve(id);
        });
      });
    },
  },
  getters: {
    authenticated(state) {
      return state.authenticated;
    },
  },
};
