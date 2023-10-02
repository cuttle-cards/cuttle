module.exports = function (req, res) {
  const { isRanked } = req.body;
  const promiseGame = gameService.findGame({ gameId: req.session.game });
  const promisePlayer = userService.findUser({ userId: req.session.usr });
  Promise.all([promiseGame, promisePlayer])
    .then(function changeAndSave(values) {
      const [game, player] = values;

      const gameUpdates = {isRanked};

      Game.publish([game.id], {
        change:'editmode',
        userId: player.id,
        pNum: player.pNum,
        gameId: game.id,
        isRanked: isRanked,
      });
      return Game.updateOne({ id: game.id }).set(gameUpdates);
    })
    .then(function respond() {
      return res.ok();
    })
    .catch(function failed(err) {
      res.badRequest(err);
    });
};
