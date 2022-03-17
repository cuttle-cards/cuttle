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
		authFailure(state) {
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
						context.commit('authFailure');
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
						context.commit('authFailure');
						return reject(message);
					}
				);
			});
		},

		requestLogout(context) {
			return new Promise((resolve, reject) => {
				io.socket.get('/user/logout', {}, function handleResponse(
					resData,
					jwres
				) {
					if (jwres.statusCode === 200) {
						return resolve();
					}
					return reject(new Error('Error logging out :('));
				});
			});
		},
		requestReauthenticate(context, {username, password}) {
			return new Promise((resolve, reject) => {
				// Assume successful login - cancel upon error
				context.commit('authSuccess', username);
				io.socket.get('/user/reLogin', {
					username,
					password
				}, function handleResponse(res, jwres) {
					if (jwres.statusCode === 200) {
						context.commit('setMustReauthenticate', false);
						let myPNum = context.rootState.game.players.findIndex((player) => player.username === context.state.username);
						console.log('a', myPNum);
						if (myPNum === -1) {
							myPNum = null;
						}
						context.commit('setMyPNum', myPNum);
						return resolve();
					}
					context.commit('authFailure');
					return reject(res.message);
				});
			});
		},
	},
};
