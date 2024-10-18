const { getPlayerPnumByUsername, pNumIsValid } = require('../../../utils/game-utils.js');

const gameAPI = sails.hooks['customgamehook'];
const userAPI = sails.hooks['customuserhook'];

module.exports = function (req, res) {
  const { gameId } = req.body;
  Game.subscribe(req, [ gameId ]);
  const promiseClearOldGame = gameService.clearGame({ userId: req.session.usr });
  const promiseGame = gameAPI.findGame(req.body.gameId);
  const promiseUser = userAPI.findUser(req.session.usr);
  Promise.all([ promiseGame, promiseUser, promiseClearOldGame ])
    .then(async function success(arr) {
      // Catch promise values
      const [ game, user ] = arr;

      // Fast fail if game is full
      const gameIsFull = sails.helpers.isGameFull(game);
      if (gameIsFull) {
        throw { message: 'home.snackbar.cannotJoin' };
      }
      // Does the user already have a pnum for this game?
      let pNum = getPlayerPnumByUsername(game.players, user.username);
      if (!pNumIsValid(pNum) && game.players) {
        // Determine pNum of new player
        if (game.players.length === 0) {
          pNum = 0;
        } else {
          pNum = (game.players[0].pNum + 1) % 2;
          // For respond() handler
          sails.sockets.blast('gameFull', { id: game.id });
        }
      } else if (!pNumIsValid(pNum)) {
        pNum = 0;
      }
      // Set session data
      req.session.game = game.id;
      req.session.pNum = pNum;
      // Update models
      const addPlayerToGame = Game.addToCollection(game.id, 'players').members([ user.id ]);
      const updatePlayer = User.updateOne({ id: user.id }).set({ pNum });

      // Set game.p0 or game.p1 as requesting user's id
      const pNumUpdate = {};
      const pNumKey = `p${pNum}`;
      pNumUpdate[pNumKey] = user.id;
      game[pNumKey] = user.id;
      const updateGame = Game.updateOne({ id: game.id }).set(pNumUpdate);

      return Promise.all([ game, updatePlayer, addPlayerToGame, updateGame ]);
    })
    .then(function respond(values) {
      const [ game, user ] = values;
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
