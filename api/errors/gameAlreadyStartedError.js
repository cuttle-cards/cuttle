const CustomErrorType = require('./customErrorType');

class GameAlreadyStartedError extends Error {
  constructor(gameId) {
    super(`Game ${gameId} has already started!`);
    this.code = CustomErrorType.GAME_ALREADY_STARTED;
    this.gameId = gameId;
  }
}

module.exports = GameAlreadyStartedError;
