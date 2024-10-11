module.exports = function (req, res) {
  return gameService
    .findGame({ gameId: req.session.game })
    .then(function changeAndSave(game) {
      game.deck.add(game.topCard);
      game.topCard = req.body.cardId;
      game.deck.remove(req.body.cardId);
      return gameService.saveGame({ game: game });
    })
    .then(function populateGame(game) {
      return gameService.populateGame({ gameId: game.id });
    })
    .then(function publishUpdate(game) {
      Game.publish([ game.id ], {
        change: 'stackDeck',
        game,
      });
      return res.ok();
    })
    .catch(function failed(err) {
      return res.badRequest(err);
    });
};
