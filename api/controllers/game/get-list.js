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
        Game.subscribe(req, [ game.id ]);
        Game.publish(
          [ req.session.game ],
          {
            change: 'deal',
            pNum: req.session.pNum,
            game: game,
          },
          req,
        );
      } catch (e) {
        // Unable to find user's game -- remove it from their session
        delete req.session.game;
        delete req.session.pNum;
        delete req.session.spectating;
      }
    }
    return res.ok(response);
  } catch (e) {
    // Failed to find list of games
    return res.badRequest(e);
  }
};
