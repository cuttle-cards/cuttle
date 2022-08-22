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
  // We have to be defensive here when querying for a game, if it's null sails will throw
  // an error and break the Vue frontend
  if (!id) {
    return null;
  }

  // A game can't be subscribed to unless there are two players
  const game = await gameService.findGame({ gameId: id });
  if (!game || game.players.length < 2) {
    return game;
  }

  // Otherwise if we have two players we can actually populate the game
  // This is used for the reconnect logic
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
    userAPI
      .findUserByUsername(req.body.username)
      .then(function gotUser(user) {
        const checkPass = passwordAPI.checkPass(req.body.password, user.encryptedPassword);
        const promiseGame = gameService.populateGame({ gameId: user.game });
        return Promise.all([promiseGame, Promise.resolve(user), checkPass]);
      })
      .then((values) => {
        const game = values[0];
        const user = values[1];
        req.session.loggedIn = true;
        req.session.usr = user.id;
        req.session.game = game.id;
        req.session.pNum = user.pNum;
        Game.subscribe(req, [game.id]);
        sails.sockets.join(req, 'GameList');
        Game.publish([game.id], {
          verb: 'updated',
          data: {
            ...game.lastEvent,
            game,
          },
        });

        return res.ok();
      })
      .catch((err) => {
        return res.badRequest(err);
      });
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
      // Can't lookup a game without a valid id or sails will throw an error
      const game = gameId ? await gameService.findGame({ gameId }) : null;
      // If no game exists this is defensive and will return null
      const lobby = getLobbyDataByGame(game);
      return res.ok({
        id,
        username,
        authenticated,
        game,
        lobby,
      });
    } catch (err) {
      return res.badRequest(err);
    }
  },

  // TODO: See if this can be combined with the status call, possibly converting the socket
  // to a REST request to have the cookie set as part of the operation
  ping: function (req, res) {
    return res.send('pong');
  },
};
