module.exports = function(req, res) {
  userService
    .findUser({ userId: req.session.usr })
    .then(function deleteSessionData(player) {
      Game.unsubscribe(req, [req.session.game]);
      delete req.session.game;
      delete req.session.pNum;
      return res.ok();
    }) //End changeAndSave
    .catch(function failed(err) {
      return res.badRequest(err);
    });
};
