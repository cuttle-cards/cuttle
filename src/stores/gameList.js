import { defineStore } from 'pinia';
import { cloneDeep } from 'lodash';
import { io } from '@/plugins/sails.js';
import GameStatus from '_/utils/GameStatus.json';

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
export const useGameListStore = defineStore('gameList', {
  state: () => ({
    openGames: [],
    spectateGames: [],
  }),
  actions: {
    // Open/Playable Games
    refreshGames({ openGames, spectateGames }) {
      this.openGames = openGames.map((game) => new GameSummary(game));
      this.spectateGames = spectateGames.map((game) => new GameSummary(game));
    },
    addGameToList(newGame) {
      this.openGames.push(new GameSummary(newGame));
    },
    gameStarted(gameId) {
      const gameIndex = this.openGames.findIndex((game) => game.id === gameId);
      if (gameIndex < 0 || gameIndex > this.openGames.length) {
        return;
      }
      const [ startedGame ] = this.openGames.splice(gameIndex, 1);
      startedGame.status = GameStatus.STARTED;
      this.spectateGames.push(startedGame);
    },
    gameFinished(gameId) {
      const game = this.spectateGames.find((game) => game.id === gameId);
      if (!game) {
        return;
      }
      game.isOver = true;
    },
    updateGameStatus(data) {
      const updatedGame = this.openGames.find((game) => game.id === data.id);
      if (updatedGame) {
        updatedGame.status = data.newStatus;
      }
    },
    joinGame(data) {
      const updatedGame = this.openGames.find((game) => game.id === data.gameId);
      if (updatedGame) {
        updatedGame.numPlayers = Math.min(2, updatedGame.numPlayers + 1);
        updatedGame.status = data.newStatus;
      }
    },
    otherLeftGame(gameId) {
      const updatedGame = this.openGames.find((game) => game.id === gameId);
      if (updatedGame) {
        updatedGame.numPlayers = Math.max(0, updatedGame.numPlayers - 1);
      }
    },
    setIsRanked({ gameId, isRanked }) {
      const updatedGame = this.openGames.find((game) => game.id === gameId);
      if (updatedGame) {
        updatedGame.isRanked = isRanked;
      }
    },
    addSpectateGameToList(newGame) {
      this.spectateGames.push(new GameSummary(newGame));
    },
    requestGameList() {
      return new Promise((resolve, reject) => {
        io.socket.get('/api/game/getList', (resData, jwres) => {
          if (jwres.statusCode === 200) {
            const openGames = cloneDeep(resData.openGames);
            const spectateGames = cloneDeep(resData.spectatableGames);
            this.refreshGames({ openGames, spectateGames });
            return resolve(openGames);
          }
          return reject(new Error('Could not retrieve list of games'));
        });
      });
    },
    requestCreateGame({ gameName, isRanked = false }) {
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/api/game/create',
          {
            gameName,
            isRanked,
          },
          (resData, jwres) => {
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
});
