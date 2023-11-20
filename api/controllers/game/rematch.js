/**
 * Indicate that the player wants to play again
 */
const gameAPI = sails.hooks['customgamehook'];
module.exports = async function (req, res) {
  try {
    const { usr: userId, pNum } = req.session;
    const { gameId, rematch } = req.body;

    const game = await Game.findOne({ id: gameId }).populate('players');
    const oldPNum = game.p0 === userId ? 0 : 1;
    const gameUpdates = { [`p${oldPNum}Rematch`]: rematch };

    await Game.updateOne({ id: game.id }).set(gameUpdates);

    // In case other player updated the game at the same time
    const updatedGame = await Game.findOne({ id: game.id }).populate('players');

    const currentMatch = await Match.findOne({ id: updatedGame.match });
    const shouldNewGameBeRanked = currentMatch?.winner ? false : updatedGame.isRanked;

    const { p0: newP1Id, p1: newP0Id } = updatedGame;

    Game.publish([game.id], {
      change: 'rematch',
      game: updatedGame,
      pNum,
    });

    // CHALLENGE: race condition
    const bothWantToRematch =
      (updatedGame.p0Rematch && gameUpdates.p1Rematch) || (updatedGame.p1Rematch && gameUpdates.p0Rematch);

    if (!bothWantToRematch) {
      return res.ok();
    }

    const newGame = await gameAPI.createGame(
      game.name,
      shouldNewGameBeRanked,
      gameService.GameStatus.STARTED,
    );
    await Promise.all([
      Game.updateOne({ id: updatedGame.id }).set({ rematchGame: newGame.id }),
      Game.replaceCollection(newGame.id, 'players').members([newP0Id, newP1Id]),
      User.updateOne({ id: newP0Id }).set({ pNum: 0 }),
      User.updateOne({ id: newP1Id }).set({ pNum: 1 }),
    ]);
    updatedGame.rematchGame = newGame.id;

    const newGame2 = await Game.findOne({ id: newGame.id }).populate('players');
    // Create Cards
    const newFullGame = await gameService.dealCards(newGame2, gameUpdates);

    Game.publish([game.id], {
      change: 'newGameForRematch',
      game: updatedGame,
      pNum,
      gameId: newGame.id,
      newGame: newFullGame,
    });

    return res.ok({ newGameId: newGame.id });
  } catch (err) {
    return res.ok();
  }
};
