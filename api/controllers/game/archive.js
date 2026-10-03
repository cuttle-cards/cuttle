const CustomErrorType = require('../../errors/customErrorType');
const ForbiddenError = require('../../errors/forbiddenError');
const NotFoundError = require('../../errors/notFoundError');
const GameStatus = require('../../../utils/GameStatus');

module.exports = async function (req, res) {
  const { gameId } = req.params;
  let game;
  try {
    /**
     * Validate against the UNLOCKED record. lockGame writes `lock`/`lockedAt` to the Game row,
     * which bumps `updatedAt` — the very signal canArchiveGame uses to decide whether the game is
     * dormant. Reading it first keeps that check honest.
     */
    const [ existingGame, currentWeek ] = await Promise.all([
      Game.findOne({ id: gameId }),
      sails.helpers.getCurrentSeasonWeek(),
    ]);

    if (!existingGame) {
      throw new NotFoundError('home.error.notFound');
    }

    // Must be a player in this game
    switch (req.session.usr) {
      case existingGame.p0:
      case existingGame.p1:
        break;
      default:
        throw new ForbiddenError('home.error.forbidden');
    }

    if (!sails.helpers.canArchiveGame(existingGame, currentWeek)) {
      throw new ForbiddenError('home.error.notArchivable');
    }

    game = await sails.helpers.lockGame(gameId);

    // Re-checked under the lock: the opponent may have just won the game
    if (game?.status !== GameStatus.STARTED) {
      throw new ForbiddenError('home.error.notArchivable');
    }

    await Game.updateOne({ id: game.id }).set({ status: GameStatus.ARCHIVED });

    // Drop the game from every client's home page list
    sails.sockets.blast('gameArchived', { gameId: game.id });
    // Tell anyone sitting on the board that the game is over, rather than
    // letting them silently hit rejected moves
    sails.helpers.broadcastGameEvent(game.id, { gameId: game.id, change: 'gameArchived' });

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
      case CustomErrorType.NOT_FOUND:
        return res.status(404).json({ message });
      case CustomErrorType.FORBIDDEN:
        return res.forbidden({ message });
      default:
        return res.serverError({ message });
    }
  }
};
