module.exports = async function (req, res) {
  try {
    const { gameId } = req.params;
    const promiseGame = gameService.findGame({ gameId });
    const promisePlayer = userService.findUser({ userId: req.session.usr });
    const [ game, player ] = await Promise.all([ promiseGame, promisePlayer ]);
  
    const gameUpdates = {};
    switch (req.session.usr) {
      case game.p0.id:
        gameUpdates.p0Ready = false;
        gameUpdates.p0 = null;
        break;
      case game.p1.id:
        gameUpdates.p1Ready = false;
        gameUpdates.p1 = null;
        break;
      default:
        throw new Error('You are not a player in this game!');
    }

    Game.unsubscribe(req, [ game.id ]);
  
    const playerUpdates = {
      pNum: null,
    };
    const updatePromises = [
      Game.updateOne({ id: game.id }).set(gameUpdates),
  
      User.updateOne({ id: player.id }).set(playerUpdates),
  
      Game.removeFromCollection(game.id, 'players').members(player.id),
    ];
  
    await Promise.all(updatePromises);
  
    // Remove session data for game
    delete req.session.game;
    delete req.session.pNum;
    // Publish update to all users, then respond w/ 200
    sails.sockets.blast('leftGame', { id: game.id }, req);
    return res.ok();
  } catch (err) {
    res.badRequest(err);
  }
};
