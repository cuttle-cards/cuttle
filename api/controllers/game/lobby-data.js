module.exports = function (req, res) {
  gameService.findGame({gameId: req.session.game})
    .then(function sendResponse(game) {
      const players = [];
      if (game.players.length > 0) {
        players.push({username: game.players[0].username, pNum: 0});
        if (game.players.length > 1) {
          players.push({username: game.players[1].username, pNum: 1});
        }
      }
      const lobbyData = {
        id: game.id,
        players: players,
        p0Ready: game.p0Ready,
        p1Ready: game.p1Ready
      }
      return res.ok(lobbyData);
    })
    .catch(function failed(err) {
      return res.badRequest(err);
    });
}
