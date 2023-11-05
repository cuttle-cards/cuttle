/**
 * Join the two players into the new game
 */
module.exports = async function (req, res) {
  try {
    const { usr: userId } = req.session;

    const user = await User.findOne({ id: userId });
    const oldGame = await Game.findOne({ id: user.rematchOldGame });

    const newGameId = oldGame.rematchGame;
    const game = await gameService.populateGame({ gameId: newGameId });
    Game.subscribe(req, [game.id]);

    req.session.game = game.id;
    req.session.rematchOldGame = game.id;
    req.session.rematchOldPNum = user.pNum;
    req.session.pNum = user.pNum;

    const gameUpdates = {
      lastEvent: { change: 'joinRematch' },
    };

    await Game.updateOne({ id: game.id }).set(gameUpdates);
    Game.publish([oldGame.id], {
      change: 'joinRematch',
      gameId: game.id,
      game,
    });

    return res.ok({ game, pNum: user.pNum, playerUsername: user.username });
  } catch (err) {
    return res.badRequest(err);
  }
};