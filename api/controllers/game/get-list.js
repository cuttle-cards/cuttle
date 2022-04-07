var gameAPI = sails.hooks['customgamehook'];

module.exports = function(req, res) {
  // HANDLE REQ.SESSION.GAME = GAME ID CASE
  sails.sockets.join(req, 'GameList');
  if (req.session.game !== null && req.session.game !== undefined) {
    const promiseGame = gameService.populateGame({ gameId: req.session.game.id }).catch(err => {
      return res.badRequest(err);
    });
    const promiseList = gameAPI.findOpenGames();
    Promise.all([promiseGame, promiseList]).then(function publishAndRespond(values) {
      const [game, list] = values;
      if (game) {
        Game.subscribe(req, [game.id]);
        Game.publish(
          [req.session.game],
          {
            verb: 'updated',
            data: {
              change: 'Initialize',
              pNum: req.session.pNum,
              game: game,
            },
          },
          req
        );
        return res.ok({
          inGame: true,
          game: game,
          userId: req.session.usr,
          games: list,
        });
      }
      return res.ok({
        inGame: false,
        userId: req.session.usr,
        games: list,
      });
    });
  } else {
    gameAPI
      .findOpenGames()
      .then(function success(games) {
        return res.send({
          inGame: false,
          games: games,
        });
      })
      .catch(function failure(error) {
        return res.badRequest(error);
      });
  }
};
