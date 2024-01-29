/**
 * Indicate that the player wants to play again
 */
const gameAPI = sails.hooks['customgamehook'];
module.exports = async function (req, res) {
  try {
    const { usr: userId } = req.session;
    const { gameId: oldGameId, rematch } = req.body;

    let game =  await sails.helpers.lockGame(req.session.game);

    // Early return if requesting user was not in the game
    if (game.p0 !== userId && game.p1 !== userId) {
      return;
    }

    const oldPNum = game.p0 === userId ? 0 : 1;
    const gameUpdates = { [`p${oldPNum}Rematch`]: rematch };
    const { p0Rematch, p1Rematch } = {...game, ...gameUpdates};
    const bothWantToRematch = p0Rematch && p1Rematch;

    if (!bothWantToRematch) {
      game = await Game.updateOne({ id: game.id }).set(gameUpdates);
      Game.publish([game.id], {
        change: 'rematch',
        game,
        pNum: oldPNum,
      });
  
      await sails.helpers.unlockGame(game.lock);
      return res.ok();
    }

    //Get all exisiting rematchGames
    const [ rematchGames, players, currentMatch ] = await Promise.all([
      sails.helpers.getRematchGames(game),
      User.find({id: [game.p0, game.p1]}),
      Match.findOne({ id: game.match })
    ]);
    // Determine who was p0 and p1 in first game in the series
    const [ firstGame ] = rematchGames;
    const seriesP0Id = firstGame.p0;
    const seriesP1Id = firstGame.p1;
    const seriesP0Username = players.find((player) => player.id === seriesP0Id);
    const seriesP1Username = players.find((player) => player.id === seriesP1Id);
    //Get rematchGame win counts
    const player0Wins = rematchGames.filter(({winner}) => winner === seriesP0Id).length;
    const player1wins = rematchGames.filter(({winner}) => winner === seriesP1Id).length;
    const stalemates = rematchGames.filter(({winner}) => winner === null).length;
    
    const newName = `${seriesP0Username} VS ${seriesP1Username} ${player0Wins}-${player1wins}-${stalemates}`;

    const shouldNewGameBeRanked = currentMatch?.winner ? false : game.isRanked;

    const newGame = await gameAPI.createGame(
      newName,
      shouldNewGameBeRanked,
      gameService.GameStatus.STARTED,
    );
    
    gameUpdates.rematchGame = newGame.id;
    const { p0: newP1Id, p1: newP0Id } = game;

    const [ updatedGame, p0, p1] = await Promise.all([
      Game.updateOne({ id: game.id }).set(gameUpdates),
      User.updateOne({ id: newP0Id }).set({ pNum: 0 }),
      User.updateOne({ id: newP1Id }).set({ pNum: 1 }),
      Game.replaceCollection(newGame.id, 'players').members([newP0Id, newP1Id]),
    ]);

    newGame.players = [p0, p1];
    // Create & deal cards
    const newFullGame = await gameService.dealCards(newGame, {});

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
