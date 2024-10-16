module.exports = function (req, res) {
  const promiseGame = gameService.findGame({ gameId: req.session.game });
  const promisePlayer = userService.findUser({ userId: req.session.usr });
  Promise.all([ promiseGame, promisePlayer ])
    .then(function changeAndSave(values) {
      const [ game, player ] = values;
      const gameUpdates = {};
      const playerUpdates = {
        pNum: null,
      };
      if (player.pNum === 0) {
        gameUpdates.p0Ready = false;
        gameUpdates.p0 = null;
      } else {
        gameUpdates.p1Ready = false;
        gameUpdates.p1 = null;
      }

      // Unsubscribe user from updates to this game
      Game.unsubscribe(req, [ game.id ]);

      // Update records
      const updatePromises = [
        Game.updateOne({ id: game.id }).set(gameUpdates),

        User.updateOne({ id: player.id }).set(playerUpdates),

        Game.removeFromCollection(game.id, 'players').members(player.id),
      ];
      return Promise.all(updatePromises);
    })
    .then(function publishAndRespond(values) {
      // Remove session data for game
      delete req.session.game;
      delete req.session.pNum;
      // Publish update to all users, then respond w/ 200
      sails.sockets.blast('leftGame', { id: values[0].id }, req);
      return res.ok();
    })
    .catch(function failed(err) {
      res.badRequest(err);
    });
};
