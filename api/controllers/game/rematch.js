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
      pNum,
      gameId: newGame.id,
      newGame: newFullGame,
    });

    return res.ok({ newGameId: newGame.id });
  } catch (err) {
    return res.ok();
  }
};
