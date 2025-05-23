/**
 * Join the two players into the new game
 */
module.exports = async function (req, res) {
  try {
    const { oldGameId } = req.body;

    const oldGame = await Game.findOne({ id: oldGameId });
    const newGameId = oldGame?.rematchGame;

    const game = await Game.findOne({ id: newGameId });
    Game.subscribe(req, [ game.id ]);

    return res.ok();
  } catch (err) {
    return res.badRequest(err);
  }
};
