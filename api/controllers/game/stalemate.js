module.exports = async function (req, res) {
  try {
    const game = await Game.findOne({ id: req.session.game }).populate('players');
    switch (req.session.pNum) {
      case 0:
        game.turnStalemateWasRequestedByP0 = game.turnStalemateWasRequestedByP0 ? game.turn : null;
        break;
      case 1:
        game.turnStalemateWasRequestedByP1 = game.turnStalemateWasRequestedByP1 ? game.turn : null;
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
      const gameUpdates = {
        p0: game.players[0].id,
        p1: game.players[1].id,
        result: gameService.GameResult.STALEMATE,
      };
      await Promise.all([
        Game.updateOne({ id: game.id }).set(gameUpdates),
        gameService.clearGame({ userId: req.session.usr }),
      ]);
    }
    await Game.publish([game.id], {
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
