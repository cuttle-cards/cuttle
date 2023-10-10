import { cloneDeep } from 'lodash';
import { io } from '@/plugins/sails.js';
import GameStatus  from '_/utils/GameStatus.json';

class GameSummary {
  constructor(obj) {
    this.id = obj.id ? obj.id : null;
    this.name = obj.name ? obj.name : null;
    this.numPlayers = Object.prototype.hasOwnProperty.call(obj, 'players') ? obj.players.length : 0;
    this.status = Object.prototype.hasOwnProperty.call(obj, 'status') ? obj.status : GameStatus.ARCHIVED;
    this.isRanked = Object.prototype.hasOwnProperty.call(obj, 'isRanked') ? obj.isRanked : false;
    this.isOver = false;
  }
}
export default {
  state: {
    openGames: [],
    spectateGames: [],
  },
  mutations: {
    // Open/Playable Games
    refreshGames(state, { openGames, spectateGames }) {
      state.openGames = openGames.map((game) => new GameSummary(game));
      state.spectateGames = spectateGames.map((game) => new GameSummary(game));
    },
    addGameToList(state, newGame) {
      state.openGames.push(new GameSummary(newGame));
    },
    gameStarted(state, gameId) {
      const gameIndex = state.openGames.findIndex((game) => game.id === gameId);
      if (gameIndex < 0 || gameIndex > state.openGames.length) {
        return;
      }
      const [startedGame] = state.openGames.splice(gameIndex, 1);
      startedGame.status = GameStatus.STARTED;
      state.spectateGames.push(startedGame);
    },
    gameFinished(state, gameId) {
      const game = state.spectateGames.find((game) => game.id === gameId);
      if (!game) {
        return;
      }
      game.isOver = true;
    },
    updateGameStatus(state, data) {
      const updatedGame = state.openGames.find((game) => game.id === data.id);
      if (updatedGame) {
        updatedGame.status = data.newStatus;
      }
    },
    joinGame(state, data) {
      const updatedGame = state.openGames.find((game) => game.id === data.gameId);
      if (updatedGame) {
        updatedGame.numPlayers++;
        updatedGame.status = data.newStatus;
      }
    },
    otherLeftGame(state, gameId) {
      const updatedGame = state.openGames.find((game) => game.id === gameId);
      if (updatedGame) {
        updatedGame.numPlayers--;
      }
    },
    addSpectateGameToList(state, newGame) {
      state.spectateGames.push(new GameSummary(newGame));
    },
  },
  actions: {
    requestGameList(context) {
      return new Promise((resolve, reject) => {
        io.socket.get('/game/getList', function handleResponse(resData, jwres) {
          if (jwres.statusCode === 200) {
            const openGames = cloneDeep(resData.openGames);
            const spectateGames = cloneDeep(resData.spectatableGames);
            context.commit('refreshGames', { openGames, spectateGames });
            return resolve(openGames);
          }
          return reject(new Error('Could not retrieve list of games'));
        });
      });
    },
    requestCreateGame(context, { gameName, isRanked = false }) {
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/create',
          {
            gameName,
            isRanked,
          },
          function handleResponse(resData, jwres) {
            if (jwres.statusCode === 200) {
              return resolve(resData);
            }

            let message;
            if (Object.prototype.hasOwnProperty.call(resData, 'message')) {
              ({ message } = resData);
            } else if (typeof resData === 'string') {
              message = resData;
            } else {
              message = new Error('Unknown error creating game');
            }
            return reject(message);
          },
        );
      });
    },
  },
};
