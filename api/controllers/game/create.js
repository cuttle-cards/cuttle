var gameAPI = sails.hooks['customgamehook'];

module.exports = function(req, res) {
  if (req.body.gameName) {
    gameAPI
      .createGame(req.body.gameName)
      .then(function(game) {
        sails.sockets.broadcast('GameList', 'gameCreated', {
          id: game.id,
          name: game.name,
          status: game.status,
          players: [],
        });
        return res.ok({ gameId: game.id });
      })
      .catch(function(reason) {
        res.badRequest(reason);
      });
  }
};
