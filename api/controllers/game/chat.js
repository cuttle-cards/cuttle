module.exports = function (req, res) {
  const promiseGame = gameService.findGame({ gameId: req.session.game });
  const promisePlayer = userService.findUser({ userId: req.session.usr });
  return Promise.all([ promiseGame, promisePlayer ])
    .then(function changeAndSave(values) {
      const [ game, player ] = values;
      game.chat.push(`${player.username}: ${req.body.msg}`);
      return gameService.saveGame({ game: game });
    })
    .then(function populateGame(game) {
      return gameService.populateGame({ gameId: game.id });
    })
    .then(function publishAndRespond(game) {
      const victory = {
        gameOver: false,
        winner: null,
      };
      Game.publish([ game.id ], {
        change: 'chat',
        game,
        victory,
      });
      return res.ok();
    })
    .catch(function failed(err) {
      res.badRequest(err);
    });
};
