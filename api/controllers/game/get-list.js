var gameAPI = sails.hooks['customgamehook'];

module.exports = function (req, res) {
  // HANDLE REQ.SESSION.GAME = GAME ID CASE
  sails.sockets.join(req, 'GameList');
  if (req.session.game !== null) {
    var promiseGame = gameService.populateGame({gameId: req.session.game})
    var promiseList = gameAPI.findOpenGames();
    Promise.all([promiseGame, promiseList])
      .then(function publishAndRespond (values) {
        var game = values[0], list = values[1];
        Game.subscribe(req, [game.id]);
        Game.publish([req.session.game],
          {
            verb: 'updated',
            data: {
              change: 'Initialize',
              pNum: req.session.pNum,
              game: game,
            }
          });
        return res.ok({
          inGame: true,
          game: game,
          userId: req.session.usr,
          games: list
        });
      });
  } else {
    gameAPI.findOpenGames()
      .then(function success (games) {
        return res.send({
          inGame: false,
          games: games
        });
      })
      .catch(function failure (error) {
        return res.badRequest(error);
      });
  }
}
