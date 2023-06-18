/**
 * Indicate that the player wants to play again
 */
const gameAPI = sails.hooks['customgamehook'];
module.exports = async function (req, res) {
  try {
    const { pNum, game: gameId } = req.session;
    const { rematch } = req.body;

    const game = await Game.findOne({ id: gameId }).populate('players');
    const gameUpdates = { [`p${pNum}Rematch`]: rematch };

    await Game.updateOne({ id: game.id }).set(gameUpdates);

    // In case other player updated the game at the same time
    const updatedGame = await Game.findOne({ id: game.id }).populate('players');

    const user = await User.findOne({ id: req.session.usr });

    const currentMatch = await Match.findOne({ id: updatedGame.match });
    const shouldNewGameBeRanked = currentMatch?.winner ? false : updatedGame.isRanked;
    const newGame =
      user.game === null
        ? await gameAPI.createGame(game.name, shouldNewGameBeRanked)
        : await Game.findOne({ id: typeof user.game === 'number' ? user.game : user.game.id });

    console.log('rematch user game', user.game, newGame.id, user.id, user.username);
    const { p0: newP1Id, p1: newP0Id } = updatedGame;
    if (user.game === null) {
      // Switch pNums
      await Promise.all([
        Game.updateOne({ id: newGame.id }).set({ rematchOldGame: updatedGame.id }),
        Game.updateOne({ id: updatedGame.id }).set({ rematchGame: newGame.id }),
        Game.replaceCollection(newGame.id, 'players').members([newP0Id, newP1Id]),
      ]);
      updatedGame.rematchGame = newGame.id;
      await Promise.all([
        User.updateOne({ id: newP0Id }).set({ pNum: 0 }),
        User.updateOne({ id: newP1Id }).set({ pNum: 1 }),
      ]);
    }

    Game.publish([game.id], {
      change: 'rematch',
      game: updatedGame,
      pNum,
    });

    // CHALLENGE: race condition
    const bothWantToRematch =
      (updatedGame.p0Rematch && gameUpdates.p1Rematch) || (updatedGame.p1Rematch && gameUpdates.p0Rematch);

    if (bothWantToRematch) {
      await Game.updateOne({ id: newGame.id }).set({
        status: gameService.GameStatus.STARTED,
      });

      const newGame2 = await Game.findOne({ id: newGame.id }).populate('players');
      // Create Cards
      await gameService.dealCards(newGame2, gameUpdates);

      Game.publish([game.id], {
        change: 'newGameForRematch',
        game: updatedGame,
        pNum,
        gameId: newGame.id,
      });

      return res.ok({ newGameId: newGame.id });
    }

    return res.ok();
  } catch (err) {
    console.error(err);
    return res.badRequest(err);
  }
};
