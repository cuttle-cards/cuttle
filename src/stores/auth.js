import { defineStore } from 'pinia';
import { io, reconnectSockets } from '@/plugins/sails.js';
import { getLocalStorage, setLocalStorage, LS_IS_RETURNING_USER_NAME } from '_/utils/local-storage-utils.js';
import { useGameStore } from '@/stores/game';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // This value will ONLY be null on the initial load
    authenticated: null,
    username: null,
    mustReauthenticate: false,
    isReturningUser: null,
  }),
  actions: {
    authSuccess(username) {
      this.authenticated = true;
      this.username = username;
    },
    clearAuth() {
      this.authenticated = false;
      this.username = null;
    },
    async requestLogin({ username, password }) {
      return this.handleLogin(username, password);
    },

    async requestSignup({ username, password }) {
      return this.handleLogin(username, password, true);
    },

    async requestLogout() {
      try {
        await fetch('/api/user/logout', {
          credentials: 'include',
        });
      } catch (err) {
        // We never want to stop a logout request from resolving
        // so we just capture the error and allow it to clearAuth anyway
        console.error(err);
      }
      this.clearAuth();
      return;
    },
    requestReauthenticate({ username, password }) {
      return new Promise((resolve, reject) => {
        // Assume successful login - cancel upon error
        this.authSuccess(username);
        io.socket.get(
          '/api/user/reLogin',
          {
            username,
            password,
          },
          (res, jwres) => {
            if (jwres.statusCode === 200) {
              this.mustReauthenticate = false;
              return resolve(res);
            }
            this.clearAuth();
            return reject(res.message);
          },
        );
      });
    },
    async requestStatus() {
      // If we've authenticated before, fast fail
      if (this.authenticated !== null) {
        return;
      }

      try {
        const response = await fetch('/api/user/status', {
          credentials: 'include',
        });
        const status = await response.json();
        const { authenticated, username } = status;
        // If the user is not authenticated, we're done here
        if (!authenticated) {
          this.clearAuth();
          return;
        }
        // If the user is authenticated and has a username, add it to the store
        if (username) {
          this.authSuccess(username);
        }

        return;
      } catch (err) {
        this.clearAuth();
      }
    },
    disconnectSocket() {
      io.socket.disconnect();
    },
    reconnectSocket() {
      io.socket.reconnect();
    },
    getIsReturningUser() {
      if (this.isReturningUser === null) {
        const val = getLocalStorage(LS_IS_RETURNING_USER_NAME);
        this.isReturningUser = val;
      }
      return this.isReturningUser;
    },
    setIsReturningUser() {
      if (!this.isReturningUser) {
        setLocalStorage(LS_IS_RETURNING_USER_NAME, true);
        this.isReturningUser = true;
      }
    },
    async handleLogin(username, password, signup = false) {
      const authType = signup ? 'signup' : 'login';
      try {
        const response = await fetch(`/api/user/${authType}`, {
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
        this.setIsReturningUser();
        this.authSuccess(username);
        return;
      } catch (err) {
        this.clearAuth();
        throw new Error(err);
      }
    },
  },
});
