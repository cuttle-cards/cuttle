module.exports = function(req, res) {
  return gameService
    .populateGame({ gameId: req.session.game })
    .then(function clearGame(game) {
      return Promise.all([
        Promise.resolve(game),
        gameService.clearGame({ userId: req.session.usr }),
      ]);
    })
    .then(function publishAndRespond(values) {
      const game = values[0];
      var victory = {
        gameOver: true,
        winner: (req.session.pNum + 1) % 2,
        conceded: true,
      };
      Game.publish([game.id], {
        verb: 'updated',
        data: {
          change: 'concede',
          game,
          victory,
        },
      });
      return res.ok();
    })
    .catch(function failed(err) {
      return res.badRequest(err);
    });
};
