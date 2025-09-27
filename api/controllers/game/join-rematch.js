/**
 * Join the two players into the new game
 */
module.exports = async function (req, res) {
  try {
    const { oldGameId } = req.body;

    const oldGame = await Game.findOne({ id: oldGameId });
    const newGameId = oldGame?.rematchGame;

    const game = await Game.findOne({ id: newGameId });
    let pNum = game.p0.id === req.session.usr ? 0 : 1;

    // Join socket room for the correct player perspective for this game
    const roomName = `game_${gameId}_p${pNum}`;
    sails.sockets.join(req, roomName);

    return res.ok();
  } catch (err) {
    return res.badRequest(err);
  }
};
