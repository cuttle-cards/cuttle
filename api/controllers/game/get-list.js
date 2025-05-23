module.exports = async function (req, res) {
  sails.sockets.join(req, 'GameList');
  try {
    const [ openGames, spectatableGames ] = await Promise.all([
      sails.helpers.findOpenGames(),
      sails.helpers.findSpectatableGames(),
    ]);

    const response = {
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
