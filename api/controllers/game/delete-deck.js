module.exports = function (req, res) {
  return gameService.findGame({gameId: req.session.game})
    .then(function changeAndSave (game) {
      const updatePromises = [
        Game.replaceCollection(game.id, 'deck')
          .members([]),
        Game.addToCollection(game.id, 'scrap')
          .members(game.scrap),
      ];
      return Promise.all([game, ...updatePromises]);
    })
    .then(function populateGame (values) {
      const [ game ] = values;
      return gameService.populateGame({gameId: game.id});
    })
    .then(function publishUpdate (game) {
      Game.publish([game.id], {
        verb: 'updated',
        data: {
          change: 'deleteDeck',
          game,
        },
      });
      return res.ok();
    })
    .catch(function failed (err) {
      return res.badRequest(err);
    });
}
