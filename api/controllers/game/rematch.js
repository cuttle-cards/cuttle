/**
 * Endpoint to request/decline playing again
 * If both players accept rematch, creates
 * a new game, switching who goes first
 * 
 * New game will be ranked/casual based on previous match
 * with name "firstPlayerUsername VS secondPlayerUsername {p0wins}-{p1Wins}-{stalemates}"
 */
const gameAPI = sails.hooks['customgamehook'];
module.exports = async function (req, res) {
  try {
    const { usr: userId } = req.session;
    const { gameId: oldGameId, rematch } = req.body;

    let game = await sails.helpers.lockGame(req.session.game);

    // Early return if requesting user was not in the game
    if (!userId || ![ game.p0?.id, game.p1?.id ].includes(userId)) {
      return;
    }

    // Determine whether to start new game
    const oldPNum = game.p0.id === userId ? 0 : 1;
    const rematchVal = { [`p${oldPNum}Rematch`]: rematch };
    const gameUpdates = {
      ...rematchVal,
      lastEvent: {
        change: 'rematch',
        game: { ...game.lastEvent.game, ...rematchVal },
        victory: game.lastEvent.victory
      }
    };
    const { p0Rematch, p1Rematch } = { ...game, ...gameUpdates };
    const bothWantToRematch = p0Rematch && p1Rematch;

    if (!bothWantToRematch) {
      game = await Game.updateOne({ id: game.id }).set(gameUpdates);
      Game.publish([ game.id ], {
        change: 'rematch',
        game,
        pNum: oldPNum,
      });
  
      await sails.helpers.unlockGame(game.lock);
      return res.ok();
    }

    // Get all exisiting rematchGames to compute new game name & isRanked
    const [ rematchGames, players, currentMatch ] = await Promise.all([
      sails.helpers.getRematchGames(game),
      User.find({ id: [ game.p0.id, game.p1.id ] }),
      Match.findOne({ id: game.match })
    ]);
    // Determine who was p0 and p1 in first game in the series
    const [ firstGame ] = rematchGames;
    const seriesP0Id = firstGame.p0;
    const seriesP1Id = firstGame.p1;
    const seriesP0Username = players.find((player) => player.id === seriesP0Id).username;
    const seriesP1Username = players.find((player) => player.id === seriesP1Id).username;
    // Get rematchGame win counts
    const player0Wins = rematchGames.filter(({ winner }) => winner === seriesP0Id).length;
    const player1wins = rematchGames.filter(({ winner }) => winner === seriesP1Id).length;
    const stalemates = rematchGames.filter(({ winner }) => !winner).length;

    // Set game name and isRanked
    const newName = `${seriesP0Username} VS ${seriesP1Username} ${player0Wins}-${player1wins}-${stalemates}`;
    const shouldNewGameBeRanked = currentMatch?.winner ? false : game.isRanked;

    // Create new game
    const newGame = await gameAPI.createGame(
      newName,
      shouldNewGameBeRanked,
      gameService.GameStatus.STARTED,
    );

    // Update old game's rematchGame & add players to new game
    gameUpdates.rematchGame = newGame.id;
    const { p0: newP1, p1: newP0 } = game;
    const [ updatedGame, p0, p1 ] = await Promise.all([
      Game.updateOne({ id: game.id }).set(gameUpdates),
      User.updateOne({ id: newP0.id }).set({ pNum: 0 }),
      User.updateOne({ id: newP1.id }).set({ pNum: 1 }),
      Game.replaceCollection(newGame.id, 'players').members([ newP0.id, newP1.id ]),
    ]);

    // Deal cards in new game
    newGame.players = [ p0, p1 ];
    const newFullGame = await gameService.dealCards(newGame, {});

    Game.publish([ game.id ], {
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
    const message = err.raw?.message ?? err;
    return res.badRequest({ message });
  }
};
