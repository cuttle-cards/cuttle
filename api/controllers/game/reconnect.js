module.exports = function (req, res) {
  Game.subscribe(req, [ req.session.game ]);
  sails.sockets.join(req, 'GameList');
  return res.ok();
};
