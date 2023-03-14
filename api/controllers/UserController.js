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
  signup: async function (req, res) {
    try {
      const { username, password } = req.body;
      const foundUser = await User.findOne({ username: username });
      if (foundUser) {
        throw {
          message: 'That username is already registered to another user; try logging in!',
        };
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

  login: async function (req, res) {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username: username });
      if (!user) {
        throw {
          message: 'Could not find that user with that username. Try signing up!',
        };
      }
      await passwordAPI.checkPass(password, user.encryptedPassword);
      req.session.loggedIn = true;
      req.session.usr = user.id;
      return res.ok(user.id);
    } catch (err) {
      return res.badRequest(err);
    }
  },

  reLogin: function (req, res) {
    userAPI
      .findUserByUsername(req.body.username)
      .then(function gotUser(user) {
        const { game: gameId, loggedIn } = req.session;
        const checkPass =
          !loggedIn && req.body.password
            ? passwordAPI.checkPass(req.body.password, user.encryptedPassword)
            : null;
        const promiseGame = gameId ? gameService.findGame({ gameId }) : null;
        return Promise.all([promiseGame, Promise.resolve(user), checkPass]);
      })
      .then((values) => {
        const [ game, user ] = values;
        req.session.loggedIn = true;
        req.session.usr = user.id;
        req.session.pNum = user.pNum;
        sails.sockets.join(req, 'GameList');
        // Set session data & send socket msg if in game
        if (game) {
          req.session.game = game.id;
          Game.subscribe(req, [game.id]);
          Game.publish([game.id], {
            verb: 'updated',
            data: {
              ...game.lastEvent,
              game,
            },
          });
        }
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
    const { usr: id, loggedIn: authenticated, game: gameId } = req.session;

    // User is not logged in, get out of here
    if (!authenticated || !id) {
      return res.ok({
        authenticated: false,
      });
    }

    try {
      // If the user is logged in, see if we can find them first to verify they exist
      const { username } = await userAPI.findUser(id);
      const game = gameId ? await gameService.findGame({ gameId }) : null;
      return res.ok({
        id,
        username,
        authenticated,
        // We only want to set the gameId if this is a valid game with 2 players
        // TODO: Refactor this when we add session handling for the lobby
        gameId: game && game.players.length === 2 ? gameId : null,
      });
    } catch (err) {
      // Something happened and we couldn't verify the user, log them out
      await sails.helpers.logout(req);
      return res.badRequest(err);
    }
  },
};
