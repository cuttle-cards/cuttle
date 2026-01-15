const CustomErrorType = require('../../errors/customErrorType');
const ForbiddenError = require('../../errors/forbiddenError');
const ConflictError = require('../../errors/conflictError');
const GameStatus = require('../../../utils/GameStatus');

module.exports = async function (req, res) {
  // Query for game
  const { gameId } = req.params;
  let game;
  try {
    
    game =  await sails.helpers.lockGame(gameId);
    game.players = [ game.p0, game.p1 ];

    if (game.status !== GameStatus.CREATED || (game.p0Ready && game.p1Ready)) {
      throw new ConflictError('Game', Number(gameId));
    }

    // Determine who is ready
    let pNum;
    let bothReady = false;
    const gameUpdates = {};
    switch (req.session.usr) {
      case game.p0.id:
        pNum = 0;
        gameUpdates.p0Ready = !game.p0Ready;
        if (game.p1Ready) {
          bothReady = true;
        }
        break;
      case game.p1.id:
        pNum = 1;
        gameUpdates.p1Ready = !game.p1Ready;
        if (game.p0Ready) {
          bothReady = true;
        }
        break;
      default:
        throw new ForbiddenError('lobby.error.forbidden');
    }

    // Start game if both players are ready
    if (bothReady) {
      // Inform all clients this game has started
      sails.sockets.blast('gameStarted', { gameId: game.id });
      gameUpdates.status = GameStatus.STARTED;
      // Deal cards (also emits socket event)
      await Game.updateOne({ id: game.id }).set(gameUpdates);

      await sails.helpers.gameStates.dealCards({ ...game, ...gameUpdates });

    // Otherwise send socket message that player is ready
    } else {
      const { id: gameId } = game;
      await Game.updateOne({ id: gameId }).set(gameUpdates);
      const payload = {
        change: 'ready',
        userId: req.session.usr,
        pNum,
        gameId,
      };
      sails.helpers.broadcastGameEvent(gameId, payload);
    }

    await sails.helpers.unlockGame(game.lock);

    return res.ok();
  } catch (err) {
    ///////////////////
    // Handle Errors //
    ///////////////////
    // Ensure the game is unlocked
    try {
      await sails.helpers.unlockGame(game?.lock);
    } catch (err) {
      // Swallow if unlockGame errors, then respond based on error type
    }

    const message = err?.raw?.message ?? err?.message ?? err;
    switch (err?.code) {
      // Special 409 conflict response if game has already started
      // lets client know to navigate to GameView
      case CustomErrorType.CONFLICT:
        return res.status(409).json({ code: err.code, message: err.message, gameId: err.gameId });
      case CustomErrorType.FORBIDDEN:
        return res.forbidden({ message });
      default:
        return res.serverError({ message });
    }
  }
};
