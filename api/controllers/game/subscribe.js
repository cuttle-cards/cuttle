var gameAPI = sails.hooks['customgamehook'];
var userAPI = sails.hooks['customuserhook'];

module.exports = function (req, res) {
  if (req.body.id) {
    Game.subscribe(req, [req.body.id]);
    const promiseClearOldGame = gameService.clearGame({ userId: req.session.usr });
    const promiseGame = gameAPI.findGame(req.body.id);
    const promiseUser = userAPI.findUser(req.session.usr);
    Promise.all([promiseGame, promiseUser, promiseClearOldGame])
      .then(async function success(arr) {
        // Catch promise values
        const game = arr[0];
        const user = arr[1];
        let pNum;
        if (game.players) {
          // Determine pNum of new player
          if (game.players.length === 0) {
            pNum = 0;
          } else {
            pNum = (game.players[0].pNum + 1) % 2;
            await Game.updateOne({ id: game.id }).set({
              status: false,
            });
            // For respond() handler
            game.status = false;
            sails.sockets.blast('gameFull', { id: game.id });
          }
        } else {
          pNum = 0;
        }
        // Set session data
        req.session.game = game.id;
        req.session.pNum = pNum;
        // Update models
        const addPlayerToGame = Game.addToCollection(game.id, 'players').members([user.id]);
        const updatePlayer = User.updateOne({ id: user.id }).set({ pNum });

        return Promise.all([game, updatePlayer, addPlayerToGame]);
      })
      .then(function respond(values) {
        const game = values[0];
        const user = values[1];
        // Socket announcement that player joined game
        sails.sockets.blast(
          'join',
          {
            gameId: game.id,
            newPlayer: { username: user.username, pNum: user.pNum },
            newStatus: game.status,
          },
          req
        );
        // Respond with 200
        return res.ok({ game: game, username: user.username, pNum: user.pNum });
      })
      .catch(function failure(error) {
        return res.badRequest(error);
      });
  } else {
    return res.badRequest('No game id received for subscription');
  }
};
