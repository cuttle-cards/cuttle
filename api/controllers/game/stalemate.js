/**
 * Handle player requesting a stalemate from opponent
 * or opponent accepting stalemate request
 */
module.exports = async function (req, res) {
  try {
    const { game: gameId, pNum, usr: userId } = req.session;
    // Track which turn each player most recently requested stalemate
    const game = await Game.findOne({ id: gameId }).populate('players');
    let gameUpdates = {};
    const updatePromises = [];
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
    };

    // End in stalemate if both players requested stalemate this turn
    if (playerStalemateVal === opponentStalemateVal && opponentStalemateVal === game.turn) {
      victory.gameOver = true;
      gameUpdates = {
        ...gameUpdates,
        p0: game.players[0].id,
        p1: game.players[1].id,
        result: gameService.GameResult.STALEMATE,
      };
      updatePromises.push(gameService.clearGame({ userId }));
      if (game.ranked) {
        updatePromises.push(sails.helpers.addGameToMatch(game));
      }
    }

    updatePromises.push(Game.updateOne({ id: gameId }).set(gameUpdates));
    await Promise.all(updatePromises);

    Game.publish([game.id], {
      verb: 'updated',
      data: {
        change: 'requestStalemate',
        game,
        victory,
        requestedByPNum: pNum,
      },
    });

    return res.ok();
  } catch (err) {
    return res.badRequest(err);
  }
};
