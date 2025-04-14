/**
 * Reject an opponent's request for stalemate
 */
module.exports = async function (req, res) {
  try {
    const game = await Game.findOne({ id: req.session.game }).populate('players');

    const victory = {
      gameOver: false,
      winner: null,
      conceded: false,
    };

    Game.publish([ game.id ], {
      change: 'stalemateReject',
      game,
      victory,
      playedBy: req.session.pNum,
    });

    return res.ok();
  } catch (err) {
    return res.badRequest(err);
  }
};
