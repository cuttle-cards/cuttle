module.exports = function (req, res) {
  var promiseGame = gameService.findGame({ gameId: req.session.game });
  var promisePlayer = userService.findUser({ userId: req.session.usr });
  return Promise.all([promiseGame, promisePlayer])
    .then(function changeAndSave(values) {
      var game = values[0],
        player = values[1];
      game.chat.push(`${player.username}: ${req.body.msg}`);
      return gameService.saveGame({ game: game });
    })
    .then(function populateGame(game) {
      return gameService.populateGame({ gameId: game.id });
    })
    .then(function publishAndRespond(game) {
      var victory = {
        gameOver: false,
        winner: null,
      };
      Game.publish([game.id], {
        verb: 'updated',
        data: {
          change: 'chat',
          game,
          victory,
        },
      });
      return res.ok();
    })
    .catch(function failed(err) {
      res.badRequest(err);
    });
};
