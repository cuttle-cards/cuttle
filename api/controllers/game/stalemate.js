/**
 * Handle player requesting a stalemate from opponent
 * or opponent accepting stalemate request
 */
module.exports = async function (req, res) {
  try {
    const { game: gameId, pNum, usr: userId } = req.session;
    // Track which turn each player most recently requested stalemate
    let game = await Game.findOne({ id: gameId })
      .populate('players', { sort: 'pNum' });
    let gameUpdates = {};
    const keyPrefix = 'turnStalemateWasRequestedByP';
    const playerStalemateKey = `${keyPrefix}${pNum}`;
    const playerStalemateVal = game.turn;
    gameUpdates[playerStalemateKey] = playerStalemateVal;
    const opponentStalemateKey = `${keyPrefix}${(pNum + 1) % 2}`;
    const opponentStalemateVal = game[opponentStalemateKey];

    const victory = {
      gameOver: false,
      winner: null,
      conceded: false,
      currentMatch: null,
    };

    gameUpdates.lastEvent = { change: 'requestStalemate', requestedByPNum: pNum };
    // End in stalemate if both players requested stalemate this turn
    if (playerStalemateVal === opponentStalemateVal && opponentStalemateVal === game.turn) {
      gameUpdates = {
        ...gameUpdates,
        p0: game.players[0].id,
        p1: game.players[1].id,
        status: gameService.GameStatus.FINISHED,
        winner: null,
      };
      
      await Game.updateOne({ id: gameId }).set(gameUpdates);
      game = await gameService.populateGame({ gameId }); 
      
      victory.gameOver = true;
      victory.currentMatch = await sails.helpers.addGameToMatch(game);
      
      await Game.updateOne({ id: gameId }).set({
        lastEvent: {
          change: 'requestStalemate',
          game: game,
          victory
        }
      });      
      await gameService.clearGame({ userId });
    } else {
      await Game.updateOne({ id: gameId }).set(gameUpdates);
    }
    Game.publish([ game.id ], {
      change: 'requestStalemate',
      game,
      victory,
      requestedByPNum: pNum,
    });

    return res.ok();
  } catch (err) {
    return res.badRequest(err);
  }
};
