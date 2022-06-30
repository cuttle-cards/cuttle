module.exports = function (req, res) {
  return gameService.clearGame({ userId: req.session.usr }).then(function postClear() {
    return res.ok();
  });
};
