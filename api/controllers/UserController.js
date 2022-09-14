/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

//////////////////
// DEPENDENCIES //
//////////////////

const userAPI = sails.hooks['customuserhook'];
const passwordAPI = sails.hooks['custompasswordhook'];

module.exports = {
  homepage: function (req, res) {
    return res.view('homepage', { loggedIn: req.session.loggedIn, game: req.session.game });
  },

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
  reLogin: function (req, res) {
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

  logout: async function (req, res) {
    await sails.helpers.logout(req);
    return res.ok();
  },

  status: async function (req, res) {
    const { usr: id, loggedIn: authenticated } = req.session;

    // User is not logged in, get out of here
    if (!authenticated || !id) {
      return res.ok({
        authenticated: false,
      });
    }

    try {
      // If the user is logged in, see if we can find them first to verify they exist
      const { username } = await userAPI.findUser(id);
      return res.ok({
        id,
        username,
        authenticated,
      });
    } catch (err) {
      // Something happened and we couldn't verify the user, log them out
      await sails.helpers.logout(req);
      return res.badRequest(err);
    }
  },
};
