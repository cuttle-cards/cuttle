/**
 * Join the two players into the new game
 */
module.exports = async function (req, res) {
  try {
    const { usr: userId, game: gameId } = req.session;

    const [user, tmpOldGame] = await Promise.all([
      User.findOne({ id: userId }),
      Game.findOne({ id: gameId }),
    ]);
    const oldGame = tmpOldGame.rematchGame ? tmpOldGame : await Game.findOne(tmpOldGame.rematchOldGame);

    const newGameId = oldGame.rematchGame;
    const game = await Game.findOne({ id: newGameId }).populate('players');
    Game.subscribe(req, [game.id]);

    req.session.game = game.id;
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
    console.log('join rematch', oldGame.id, newGameId, game.id, user.pNum, user.id, user.username);

    return res.ok({ game, pNum: user.pNum, playerUsername: user.username });
  } catch (err) {
    return res.badRequest(err);
  }
};
