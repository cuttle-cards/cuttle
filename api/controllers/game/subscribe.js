const { getPlayerPnumByUsername, pNumIsValid } = require('../../../utils/game-utils.js');

const gameAPI = sails.hooks['customgamehook'];
const userAPI = sails.hooks['customuserhook'];

module.exports = function (req, res) {
  if (!req.body.id) {
    return res.badRequest('No game id received for subscription');
  }
  Game.subscribe(req, [req.body.id]);
  const promiseClearOldGame = gameService.clearGame({ userId: req.session.usr });
  const promiseGame = gameAPI.findGame(req.body.id);
  const promiseUser = userAPI.findUser(req.session.usr);
  Promise.all([promiseGame, promiseUser, promiseClearOldGame])
    .then(async function success(arr) {
      // Catch promise values
      const [game, user] = arr;

      // Fast fail if game is full
      const gameIsFull = sails.helpers.isGameFull(game);
      if (gameIsFull) {
        // Ensure game is closed for future
        await Game.updateOne({ id: game.id })
          .set({
            status: false
          });
        throw { message: `Cannot join that game because it's already full` };
      }
      // Does the user already have a pnum for this game?
      let pNum = getPlayerPnumByUsername(game.players, user.username);
      if (!pNumIsValid(pNum) && game.players) {
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
      } else if (!pNumIsValid(pNum)) {
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
      const [game, user] = values;
      // Socket announcement that player joined game
      sails.sockets.blast(
        'join',
        {
          gameId: game.id,
          newPlayer: { username: user.username, pNum: user.pNum },
          newStatus: game.status,
        },
        req,
      );
      // Respond with 200
      return res.ok({ game: game, username: user.username, pNum: user.pNum });
    })
    .catch(function failure(error) {
      return res.badRequest(error);
    });
};
