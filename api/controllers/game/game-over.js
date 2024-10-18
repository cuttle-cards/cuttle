/**
 * Unsubscribes requesting user's socket from any games
 * and removes game data from user session
 * @param {*} req - the request
 * @param {*} res - express' response obj
 * @returns 200 with empty body
 */
module.exports = function (req, res) {
  // Unsubscribe socket
  const { game: playedGameId, spectating: spectatedGameId } = req.session;
  const gameIds = [ playedGameId, spectatedGameId ].filter((id) => Number.isInteger(id));
  Game.unsubscribe(req, gameIds);
  // Delete session data about game(s)
  delete req.session.game;
  delete req.session.spectating;
  delete req.session.pNum;

  return res.ok();
};
