/**
 * Join the two players into the new game
 */
module.exports = async function (req, res) {
  try {
    const { usr: userId } = req.session;
    const { oldGameId } = req.body;

    const [ user, oldGame ] = await Promise.all([
      User.findOne({ id: userId }),
      Game.findOne({ id: oldGameId }),
    ]);

    const newGameId = oldGame?.rematchGame;

    const game = await Game.findOne({ id: newGameId });
    Game.subscribe(req, [ game.id ]);

    req.session.game = game.id;
    req.session.pNum = user.pNum;

    return res.ok();
  } catch (err) {
    return res.badRequest(err);
  }
};
