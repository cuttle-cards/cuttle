const gameAPI = sails.hooks['customgamehook'];

module.exports = async function(req, res) {
  // HANDLE REQ.SESSION.GAME = GAME ID CASE
  sails.sockets.join(req, 'GameList');
  try {
    const games = await gameAPI.findOpenGames();
    let response = {
      inGame: false,
      userId: req.session.usr,
      games,
    };
    if (req.session.game) {
      try {
        // User is currently in game -- find it and subscribe their socket
        const game = await gameService.populateGame({ gameId: req.session.game });
        // Add active game to response data
        response = {
          ...response,
          inGame: true,
          game,
        };
        Game.subscribe(req, [game.id]);
        Game.publish(
          [req.session.game],
          {
            verb: 'updated',
            data: {
              change: 'Initialize',
              pNum: req.session.pNum,
              game: game,
            },
          },
          req
        );
      } catch (e) {
        // Unable to find user's game -- remove it from their session
        delete req.session.game;
        delete req.session.pNum;
      }
    }
    return res.ok(response);
  } catch (e) {
    // Failed to find list of games
    return res.badRequest(e);
  }
};
