import { io } from '../../plugins/sails.js';
let _ = require('lodash');

class GameSummary {
	constructor(obj) {
		this.id = obj.id ? obj.id : null;
		this.name = obj.name ? obj.name : null;
		this.numPlayers = Object.prototype.hasOwnProperty.call(obj, 'players')
			? obj.players.length
			: 0;
		this.status = Object.prototype.hasOwnProperty.call(obj, 'status')
			? obj.status
			: false;
	}
}
export default {
	state: {
		games: [],
	},
	mutations: {
		refreshGames(state, newList) {
			state.games = newList.map((game) => new GameSummary(game));
		},
		addGameToList(state, newGame) {
			state.games.push(new GameSummary(newGame));
		},
		removeGame(state, data) {
			state.games = state.games.filter((game) => game.id !== data.gameId );
		},
		updateGameStatus(state, data) {
			const updatedGame = state.games.find((game) => game.id === data.id);
			if (updatedGame) {
				updatedGame.status = data.newStatus;
			}
		},
		joinGame(state, data) {
			const updatedGame = state.games.find((game) => game.id === data.gameId);
			if (updatedGame) {
				updatedGame.numPlayers++;
				updatedGame.status = data.newStatus;
			}
		},
		otherLeftGame(state, gameId) {
			const updatedGame = state.games.find((game) => game.id === gameId);
			if (updatedGame) {
				updatedGame.numPlayers--;
				updatedGame.status = true;
			}
		},
	},
	actions: {
		requestGameList(context) {
			return new Promise((resolve, reject) => {
				io.socket.get('/game/getList', function handleResponse(resData, jwres) {
					if (jwres.statusCode === 200) {
						const games = _.cloneDeep(resData.games);
						context.commit('refreshGames', games);
						return resolve(resData.games);
					}
					return reject(new Error('Could not retrieve list of games'));
				});
			});
		},
		requestCreateGame(context, newGameName) {
			return new Promise((resolve, reject) => {
				io.socket.get(
					'/game/create',
					{
						gameName: newGameName,
					},
					function handleResponse(resData, jwres) {
						if (jwres.statusCode === 200) {
							return resolve(resData);
						}

						let message;
						if (Object.prototype.hasOwnProperty.call(resData, 'message')) {
							message = resData.message;
						} else if (typeof resData === 'string') {
							message = resData;
						} else {
							message = new Error('Unknown error creating game');
						}
						return reject(message);
					}
				);
			});
		},
	},
};
