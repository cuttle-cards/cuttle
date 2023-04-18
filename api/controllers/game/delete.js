const gameAPI = sails.hooks['customgamehook'];

module.exports = async function (req, res) {
  const { gameName, isRanked = false } = req.body;
  this.status = false


  /*if (req.body.gameName) {
    gameAPI
      .createGame(gameName, isRanked)
      .then(function (game) {
        sails.sockets.broadcast('GameList', 'gameCreated', {
          id: game.id,
          name: game.name,
          status: game.status,
          isRanked: game.isRanked,
          players: [],
        });
        return res.ok({ gameId: game.id });
      })
      .catch(function (reason) {
        res.badRequest(reason);
      });
  }
  */
};
