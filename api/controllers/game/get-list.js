const gameAPI = sails.hooks['customgamehook'];

module.exports = async function (req, res) {
  // HANDLE REQ.SESSION.GAME = GAME ID CASE
  sails.sockets.join(req, 'GameList');
  try {
    const [ openGames, spectatableGames ] = await Promise.all([
      gameAPI.findOpenGames(),
      sails.helpers.findSpectatableGames(),
    ]);
    let response = {
      inGame: false,
      userId: req.session.usr,
      openGames,
      spectatableGames,
    };

    return res.ok(response);
  } catch (e) {
    // Failed to find list of games
    return res.badRequest(e);
  }
};
