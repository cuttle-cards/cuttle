/**
 * Endpoint to request/decline playing again
 * If both players accept rematch, creates
 * a new game, switching who goes first
 * 
 * New game will be ranked/casual based on previous match
 * with name "firstPlayerUsername VS secondPlayerUsername {p0wins}-{p1Wins}-{stalemates}"
 */
const GameStatus = require('../../../utils/GameStatus.json');
module.exports = async function (req, res) {
  try {
    const { usr: userId } = req.session;
    const { gameId: oldGameId } = req.params;
    const { rematch } = req.body;

    let game = await sails.helpers.lockGame(req.session.game);

    // Early return if requesting user was not in the game
    if (![ game.p0?.id, game.p1?.id ].includes(userId)) {
      return res.forbidden({ message: `You aren't a player in this game` });
    }

    // Determine whether to start new game
    const oldPNum = game.p0.id === userId ? 0 : 1;
    const rematchVal = { [`p${oldPNum}Rematch`]: rematch };

    let gameUpdates = { ...rematchVal };

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
    const [ rematchGames, currentMatch ] = await Promise.all([
      sails.helpers.getRematchGames(game),
      Match.findOne({ id: game.match }),
    ]);

    // Determine who was p0 and p1 in first game in the series
    const [ { p0: firstP0Id } ] = rematchGames;
    const [ p0, p1 ] = game.p0.id === firstP0Id ? [ game.p0, game.p1 ] : [ game.p1, game.p0 ];
    // Get rematchGame win counts
    const player0Wins = rematchGames.filter(({ winner }) => winner === p0.id).length;
    const player1wins = rematchGames.filter(({ winner }) => winner === p1.id).length;
    const stalemates = rematchGames.filter(({ winner }) => !winner).length;

    // Set game name and isRanked
    const newName = `${p0.username} VS ${p1.username} ${player0Wins}-${player1wins}-${stalemates}`;
    const shouldNewGameBeRanked = currentMatch?.winner ? false : game.isRanked;

    // Create new game
    const { p0: newP1, p1: newP0 } = game;
    const newGame = await Game.create({
      name: newName,
      isRanked: shouldNewGameBeRanked,
      status: GameStatus.STARTED,
      p0: newP0.id,
      p1: newP1.id,
      p0Ready: true,
      p1Ready: true,
      players: [ newP0.id, newP1.id ]
    }).fetch();

    // Update old game's rematchGame & add players to new game
    gameUpdates.rematchGame = newGame.id;
    await Game.updateOne({ id: game.id }).set(gameUpdates),
   
    newGame.gameStates = [];
    newGame.p0 = { ...newP0 };
    newGame.p1 = { ...newP1 };
    // Deal cards in new game
    const newFullGame = await gameService.dealCards(newGame, {});
    const socketEvent = await sails.helpers.gameStates.createSocketEvent(newGame, newFullGame);

    Game.publish([ game.id ], {
      change: 'newGameForRematch',
      oldGameId : Number(oldGameId),
      gameId: newGame.id,
      newGame: socketEvent.game
    });
    
    await sails.helpers.unlockGame(game.lock);
    return res.ok({ newGameId: newGame.id });
  } catch (err) {
    const message = err.raw?.message ?? err;
    return res.badRequest({ message });
  }
};
