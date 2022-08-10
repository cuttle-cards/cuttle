module.exports = async function (req, res) {
  try {
    const game = await Game.findOne({ id: req.session.game }).populate('players');
    let gameUpdates = {};
    const updatePromises = [];

    switch (req.session.pNum) {
      case 0: {
        const newVal = game.turnStalemateWasRequestedByP0 ? game.turn : null;
        gameUpdates.turnStalemateWasRequestedByP0 = newVal;
        game.turnStalemateWasRequestedByP0 = newVal;
        break;
      }
      case 1: {
        const newVal = game.turnStalemateWasRequestedByP1 ? game.turn : null;
        gameUpdates.turnStalemateWasRequestedByP1 = newVal;
        game.turnStalemateWasRequestedByP1 = newVal;
        break;
      }
    }
    const victory = {
      gameOver: false,
      winner: null,
      conceded: false,
    };

    // End in stalemate if both players requested stalemate this turn
    if (
      game.turnStalemateWasRequestedByP0 === game.turnStalemateWasRequestedByP1 &&
      game.turnStalemateWasRequestedByP0 === game.turn
    ) {
      victory.gameOver = true;
      gameUpdates = {
        ...gameUpdates,
        p0: game.players[0].id,
        p1: game.players[1].id,
        result: gameService.GameResult.STALEMATE,
      };
      updatePromises.push(gameService.clearGame({ userId: req.session.usr }));
    }
    updatePromises.push(Game.updateOne({ id: game.id }).set(gameUpdates));
    await Promise.all(updatePromises);
    Game.publish([game.id], {
      verb: 'updated',
      data: {
        change: 'requestStalemate',
        game,
        victory,
      },
    });
    return res.ok();
  } catch (err) {
    return res.badRequest(err);
  }
};
