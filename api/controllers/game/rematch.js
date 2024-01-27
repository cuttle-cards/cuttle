/**
 * Indicate that the player wants to play again
 */
const gameAPI = sails.hooks['customgamehook'];
module.exports = async function (req, res) {
  try {
    const { usr: userId } = req.session;
    const { gameId: oldGameId, rematch } = req.body;

    const game =  await sails.helpers.lockGame(req.session.game);

    // Early return if requesting user was not in the game
    if (game.p0 !== userId && game.p1 !== userId) {
      return;
    }
    const oldPNum = game.p0 === userId ? 0 : 1;
    const gameUpdates = { [`p${oldPNum}Rematch`]: rematch };

    const updatedGame = await Game.updateOne({ id: game.id }).set(gameUpdates);

    const currentMatch = await Match.findOne({ id: updatedGame.match });
    const shouldNewGameBeRanked = currentMatch?.winner ? false : updatedGame.isRanked;

    const { p0: newP1Id, p1: newP0Id } = updatedGame;

    const bothWantToRematch =
      (updatedGame.p0Rematch && gameUpdates.p1Rematch) || (updatedGame.p1Rematch && gameUpdates.p0Rematch);

    if (!bothWantToRematch) {
      Game.publish([game.id], {
        change: 'rematch',
        game: updatedGame,
        pNum: oldPNum,
      });
  
      await sails.helpers.unlockGame(game.lock);
      return res.ok();
    }

    const newGame = await gameAPI.createGame(
      game.name,
      shouldNewGameBeRanked,
      gameService.GameStatus.STARTED,
    );
    const [ , , p0, p1] = await Promise.all([
      Game.updateOne({ id: updatedGame.id }).set({ rematchGame: newGame.id }),
      Game.replaceCollection(newGame.id, 'players').members([newP0Id, newP1Id]),
      User.updateOne({ id: newP0Id }).set({ pNum: 0 }),
      User.updateOne({ id: newP1Id }).set({ pNum: 1 }),
    ]);
    updatedGame.rematchGame = newGame.id;

    //Get all exisiting rematchGames
    const rematchGames = [];
    const getRematchGames = async (gameId) => {
      const gameToAdd = await Game.findOne({ rematchGame: gameId });
      if (!gameToAdd) {
        return;
      }
      rematchGames.unshift(gameToAdd);
      if (!gameToAdd.rematchGame) {
        return; 
      }
      await getRematchGames(gameToAdd.id);
    };
    await getRematchGames(newGame.id);
    const seriesP0 = [p0, p1].find(({ id }) => id === rematchGames[0].p0);
    const seriesP1 = [p0, p1].find(({ id }) => id === rematchGames[0].p1);
    //Get rematchGame win counts
    const player0Wins = rematchGames.filter(({winner}) => winner === seriesP0.id).length;
    const player1wins = rematchGames.filter(({winner}) => winner === seriesP1.id).length;
    const stalemates = rematchGames.filter(({winner}) => winner === null).length;
    
    const newName = `${seriesP0.username} VS ${seriesP1.username} ${player0Wins}-${player1wins}-${stalemates}`;
    await Game.updateOne({ id: newGame.id }).set({ name: newName });

    const newGame2 = await Game.findOne({ id: newGame.id }).populate('players');
    // Create Cards
    const newFullGame = await gameService.dealCards(newGame2, gameUpdates);

    Game.publish([game.id], {
      change: 'newGameForRematch',
      game: updatedGame,
      pNum: oldPNum,
      oldGameId,
      gameId: newGame.id,
      newGame: newFullGame,
    });

    await sails.helpers.unlockGame(game.lock);
    return res.ok({ newGameId: newGame.id });
  } catch (err) {
    return res.ok();
  }
};
