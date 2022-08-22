module.exports = async function (req, res) {
  try {
    const game = await Game.findOne({ id: req.session.game }).populate('players');
    let gameUpdates = {
      turnStalemateWasRequestedByP0: -1,
      turnStalemateWasRequestedByP1: -1,
    };

    const victory = {
      gameOver: false,
      winner: null,
      conceded: false,
    };

    await Game.updateOne({ id: game.id }).set(gameUpdates);

    Game.publish([game.id], {
      verb: 'updated',
      data: {
        change: 'rejectStalemate',
        game,
        victory,
        requestedByPNum: req.session.pNum,
      },
    });
    return res.ok();
  } catch (err) {
    return res.badRequest(err);
  }
};
