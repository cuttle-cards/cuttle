// DEVELOPMENT ONLY
// This policy deletes the user's session data to simulate a timeout
module.exports = function (req, res) {
  delete req.session.usr;
  delete req.session.loggedIn;
  delete req.session.game;
  return res.badRequest('Session Deleted for testing');
};
