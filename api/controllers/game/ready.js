module.exports = async function (req, res) {
  try {
    // Query for game and users
    const game =  await sails.helpers.lockGame(req.session.game);
    const players = await User.find({game: req.session.game}).sort((p1, p2) => p1.pNum - p2.pNum);
    const user = players[ req.session.pNum ];
    game.players = players;

    // Determine who is ready
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

    // Start game if both players are ready
    if (bothReady) {
      // Inform all clients this game has started
      sails.sockets.blast('gameStarted', { gameId: game.id });
      // Ensure game is no longer available for new players to join
      gameUpdates.status = gameService.GameStatus.STARTED;
      // Deal cards
      await gameService.dealCards(game, gameUpdates);
    }

    // Update game in db
    await Promise.all([
      Game.updateOne({ id: game.id }).set(gameUpdates),
      sails.helpers.unlockGame(game.lock),      
    ]);

    // Send socket message
    Game.publish([game.id], {
      change: 'ready',
      userId: user.id,
      pNum: user.pNum,
      gameId: game.id,
    });

    return res.ok();
  } catch (err) {
    return res.badRequest(err);
  }
};
