/**
 * Indicate that the player wants to play again
 */
const gameAPI = sails.hooks['customgamehook'];
module.exports = async function (req, res) {
  try {
    const { pNum, rematchOldGame: oldGameId, rematchOldPNum: oldPNum } = req.session;
    const { rematch } = req.body;

    console.log('rematch test', oldGameId, pNum, oldPNum, rematch);
    const game = await Game.findOne({ id: oldGameId }).populate('players');
    const gameUpdates = { [`p${oldPNum}Rematch`]: rematch };
    console.log('rematch', req.session.usr, 'oldgame', oldGameId, 'oldpnum', oldPNum, gameUpdates);
    if (rematch === false) {
      delete req.session.rematchOldGame;
      delete req.session.rematchOldPNum;
    }

    await Game.updateOne({ id: game.id }).set(gameUpdates);

    // In case other player updated the game at the same time
    const updatedGame = await Game.findOne({ id: game.id }).populate('players');

    const user = await User.findOne({ id: req.session.usr });

    const currentMatch = await Match.findOne({ id: updatedGame.match });
    const shouldNewGameBeRanked = currentMatch?.winner ? false : updatedGame.isRanked;

    const { p0: newP1Id, p1: newP0Id } = updatedGame;
    console.log('rematch old game p0 p1', newP1Id, newP0Id);

    Game.publish([game.id], {
      change: 'rematch',
      game: updatedGame,
      pNum,
    });

    // CHALLENGE: race condition
    const bothWantToRematch =
      (updatedGame.p0Rematch && gameUpdates.p1Rematch) || (updatedGame.p1Rematch && gameUpdates.p0Rematch);

    if (bothWantToRematch) {
      const newGame = await gameAPI.createGame(game.name, shouldNewGameBeRanked);
      console.log('both user want to rematch', user.game, newGame.id, user.id, user.username);
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
      console.log('rematch user game', user.game, newGame.id, user.id, user.username);
      await Game.updateOne({ id: newGame.id }).set({
        status: gameService.GameStatus.STARTED,
      });

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
    }

    return res.ok();
  } catch (err) {
    console.error(err);
    return res.badRequest(err);
  }
};
