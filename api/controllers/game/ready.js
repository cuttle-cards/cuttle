const gameAPI = sails.hooks['customgamehook'];
const userAPI = sails.hooks['customuserhook'];

module.exports = function (req, res) {
  if (req.session.game && req.session.usr) {
    const promiseGame = gameAPI.findGame(req.session.game);
    const promiseUser = userAPI.findUser(req.session.usr);
    Promise.all([promiseGame, promiseUser])
      // Assign player readiness
      .then(function foundRecords(values) {
        const [game, user] = values;
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
          return gameService.dealCards(game, gameUpdates);
        }
        Game.publish([game.id], {
          change: 'ready',
          userId: user.id,
          pNum: user.pNum,
          gameId: game.id,
        });
        return Game.updateOne({ id: game.id }).set(gameUpdates);
      }) //End foundRecords
      .then(function respond() {
        return res.ok();
      })
      .catch(function failed(err) {
        console.error("Couldn't subscribe to game", err);
        return res.badRequest(err);
      });
  } else {
    const err = { message: 'Missing game or player id' };
    return res.badRequest(err);
  }
};
