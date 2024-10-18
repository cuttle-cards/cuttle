module.exports = function (req, res) {
  gameService
    .populateGame({ gameId: req.session.game })
    .then(function gotPop(fullGame) {
      Game.subscribe(req, [ req.session.game ]);
      res.ok({ game: fullGame, pNum: req.session.pNum });
    })
    .catch(function failed(err) {
      res.badRequest(err);
    });
};
