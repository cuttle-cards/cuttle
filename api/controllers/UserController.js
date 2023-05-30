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

  reLogin: async function (req, res) {
    try {
      const { username, password } = req.body;
      const { loggedIn } = req.session;
      const user = await userAPI.findUserByUsername(username);
      // Validate password if not logged in -- will error if incorrect
      if (!loggedIn) {
        await passwordAPI.checkPass(password, user.encryptedPassword);
      }

      // Query for game if user is in one
      const gameId = user.game;
      const unpopulatedGame = gameId ? await gameService.findGame({ gameId }) : null;
      // Get populated game if game has started
      const populatedGame =
        unpopulatedGame && unpopulatedGame.p0Ready && unpopulatedGame.p1Ready
          ? await gameService.populateGame({ gameId })
          : null;

      req.session.loggedIn = true;
      req.session.usr = user.id;

      if (unpopulatedGame) {
        Game.subscribe(req, [unpopulatedGame.id]);
        req.session.game = unpopulatedGame.id;
        req.session.pNum = user.pNum ?? undefined;
      }

      if (populatedGame) {
        Game.publish([populatedGame.id], {
          ...populatedGame.lastEvent,
          game: populatedGame,
        });
      }

      const game = populatedGame ?? unpopulatedGame;
      return res.ok({
        game,
        username: user.username,
        pNum: user.pNum
      });

    } catch (err) {
      return res.badRequest(err);
    }
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
        gameId: game?.id ?? null,
      });
    } catch (err) {
      // Something happened and we couldn't verify the user, log them out
      await sails.helpers.logout(req);
      return res.badRequest(err);
    }
  },
};
