module.exports = async function (req, res) {
  try {
    // Query for game and users
    const game =  await sails.helpers.lockGame(req.session.game);
    game.players = [ game.p0, game.p1 ];

    // Determine who is ready
    let pNum;
    let bothReady = false;
    const gameUpdates = {};
    switch (req.session.usr) {
      case game.p0.id:
        pNum = 0;
        gameUpdates.p0Ready = !game.p0Ready;
        if (game.p1Ready) {
          bothReady = true;
        }
        break;
      case game.p1.id:
        pNum = 1;
        gameUpdates.p1Ready = !game.p1Ready;
        if (game.p0Ready) {
          bothReady = true;
        }
        break;
      default:
        return res.forbidden({ message: 'You are not a player in this game!' });
    }

    // Start game if both players are ready
    if (bothReady) {
      // Inform all clients this game has started
      sails.sockets.blast('gameStarted', { gameId: game.id });
      gameUpdates.status = gameService.GameStatus.STARTED;
      // Deal cards (also emits socket event)
      await Game.updateOne({ id: game.id }).set(gameUpdates);

      await gameService.dealCards({ ...game, ...gameUpdates }, {});

    // Otherwise send socket message that player is ready
    } else {

      await Game.updateOne({ id: game.id }).set(gameUpdates);

      Game.publish([ game.id ], {
        change: 'ready',
        userId: req.session.usr,
        pNum,
        gameId: game.id,
      });

    }

    await sails.helpers.unlockGame(game.lock);

    return res.ok();
  } catch (err) {
    const message = err.raw?.message ?? err;
    return res.badRequest({ message });
  }
};
