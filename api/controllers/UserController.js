/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const { getLobbyDataByGame } = require('../../utils/game-utils');

//////////////////
// DEPENDENCIES //
//////////////////

const userAPI = sails.hooks['customuserhook'];
const passwordAPI = sails.hooks['custompasswordhook'];

const getAndInitGameDataById = async (id, req) => {
  const game = await gameService.findGame({ gameId: id });
  // Edge case for when a lobby only has one player and reloads the browser
  if (!game || !game.players || game.players.length <= 1) {
    return null;
  }
  const populatedGame = await gameService.populateGame({ gameId: id });
  Game.subscribe(req, [populatedGame.id]);
  sails.sockets.join(req, 'GameList');
  Game.publish([populatedGame.id], {
    verb: 'updated',
    data: {
      ...populatedGame.lastEvent,
      game: populatedGame,
    },
  });
  return populatedGame;
};

module.exports = {
  signup: async function (req, res) {
    // Request was missing data
    if (!req.body.password && !req.body.username) {
      return res.badRequest('You did not submit a username or password');
    }
    try {
      const { username, password } = req.body;
      const users = await User.find({ username: username });
      if (users.length > 0) {
        return res.badRequest({
          message: 'That username is already registered to another user; try logging in!',
        });
      }
      // Encrypt pw and create new user
      const encryptedPassword = await passwordAPI.encryptPass(password);
      const user = await userAPI.createUser(username, encryptedPassword);
      // Successfully created User - Set session data
      req.session.loggedIn = true;
      req.session.usr = user.id;
      return res.ok(user.id);
    } catch (err) {
      return res.badRequest(err);
    }
  },
  login: function (req, res) {
    const { username } = req.body;
    if (username) {
      userAPI
        .findUserByUsername(username)
        .then((user) => {
          return passwordAPI
            .checkPass(req.body.password, user.encryptedPassword)
            .then(() => {
              req.session.loggedIn = true;
              req.session.usr = user.id;
              return res.ok();
            })
            .catch((reason) => {
              return res.badRequest(reason);
            });
        })
        .catch(() => {
          return res.badRequest({
            message: 'Could not find that user with that username. Try signing up!',
          });
        });
    } else {
      return res.badRequest({ message: 'A username must be provided' });
    }
  },
  reLogin: async function (req, res) {
    try {
      const user = await userAPI.findUserByUsername(req.body.username);
      await passwordAPI.checkPass(req.body.password, user.encryptedPassword);
      const game = await getAndInitGameDataById(user.game, req);
      // Set session values manually to log in user and initialize the game
      req.session.loggedIn = true;
      req.session.usr = user.id;
      req.session.game = game.id;
      req.session.pNum = user.pNum;
      return res.ok();
    } catch (err) {
      return res.badRequest(err);
    }
  },

  logout: function (req, res) {
    req.session.destroy(function afterDestroy() {
      return res.ok();
    });
  },

  status: async function (req, res) {
    const { usr: id, loggedIn: authenticated } = req.session;
    if (!authenticated || !id) {
      return res.ok({
        authenticated,
      });
    }
    try {
      const { username, game: gameId } = await userAPI.findUser(id);
      const game = gameId ? await getAndInitGameDataById(gameId, req) : null;
      return res.ok({
        id,
        username,
        authenticated,
        game,
        lobby: getLobbyDataByGame(game),
      });
    } catch (err) {
      return res.badRequest(err);
    }
  },

  ping: function (req, res) {
    return res.send('pong');
  },
};
