const userAPI = sails.hooks['customuserhook'];

module.exports = async function (req, res) {
  try {
    const game =  await sails.helpers.lockGame(req.session.game);
    const user = await userAPI.findUser(req.session.usr);

    let { pNum } = user;
    let bothReady = false;
    const gameUpdates = {};
    switch (pNum) {
      case 0:
        gameUpdates.p0Ready = !game.p0Ready;
        if (game.p1Ready) {
          bothReady = true;
        }
        break;
      case 1:
        gameUpdates.p1Ready = !game.p1Ready;
        if (game.p0Ready) {
          bothReady = true;
        }
        break;
    }
    if (bothReady) {
      // Inform all clients this game has started
      sails.sockets.blast('gameStarted', { gameId: game.id });
      // Ensure game is no longer available for new players to join
      gameUpdates.status = gameService.GameStatus.STARTED;
      // Create Cards
      await gameService.dealCards(game, gameUpdates);
    }

    // Send socket message
    Game.publish([game.id], {
      change: 'ready',
      userId: user.id,
      pNum: user.pNum,
      gameId: game.id,
    });

    const updateGamePromise = Game.updateOne({ id: game.id }).set(gameUpdates);
    const unlockGamePromise = sails.helpers.unlockGame(game.lock);
    await Promise.all([updateGamePromise, unlockGamePromise]);

    return res.ok();
  } catch (err) {
    return res.badRequest(err);
  }
};
