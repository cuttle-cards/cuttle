var gameAPI = sails.hooks['customgamehook'];

module.exports = function (req, res) {
  const { gameName, ranked = false } = req.body;
  if (req.body.gameName) {
    gameAPI
      .createGame(gameName, ranked)
      .then(function (game) {
        sails.sockets.broadcast('GameList', 'gameCreated', {
          id: game.id,
          name: game.name,
          status: game.status,
          ranked: game.ranked,
          players: [],
        });
        return res.ok({ gameId: game.id });
      })
      .catch(function (reason) {
        res.badRequest(reason);
      });
  }
};
