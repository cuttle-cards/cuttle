module.exports = async function (req, res) {
  sails.sockets.join(req, 'GameList');
  try {
    const [ openGames, spectatableGames, myCurrentGames ] = await Promise.all([
      sails.helpers.findOpenGames(),
      sails.helpers.findSpectatableGames(),
      sails.helpers.findCurrentGamesForUser(req.session.usr),
    ]);

    const response = {
      inGame: false,
      userId: req.session.usr,
      openGames,
      spectatableGames,
      myCurrentGames,
    };
  
    return res.ok(response);
  } catch (e) {
    // Failed to find list of games
    return res.badRequest(e);
  }
};
