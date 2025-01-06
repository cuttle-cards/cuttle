/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

//////////////////
// DEPENDENCIES //
//////////////////
const GameStatus = require('../../utils/GameStatus.json');
const userAPI = sails.hooks['customuserhook'];
const passwordAPI = sails.hooks['custompasswordhook'];

module.exports = {
  signup: async function (req, res) {
    try {
      const { username, password } = req.body;
      const foundUser = await User.findOne({ username: username });
      if (foundUser) {
        throw {
          message: 'login.snackbar.usernameIsTaken',
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
          message: 'login.snackbar.userNotFound',
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
      const gameId = (user.game ?? req.session.game) ?? null;

      if (process.env.VITE_USE_GAMESTATE_API) {
        const { unpackGamestate, createSocketEvent } = sails.helpers.gameStates;
        const game = await Game.findOne(gameId)
          .populate('gameStates')
          .populate('p0')
          .populate('p1');
        const gameObject = game.gameStates.length ? await unpackGamestate(game.gameStates.at(-1)) : null;
        const socketEvent = game.gameStates.length ?
          await createSocketEvent(game, gameObject)
          : { game: { ...game, players: game.p1 ? [ game.p0, game.p1 ] : [ game.p0 ] } };
        
        Game.subscribe(req, [ game.id ]);
        req.session.usr = user.id;
        // FIXME: #965 - remove game and pNum
        req.session.game = game.id;
        req.session.pNum = user.pNum ?? undefined;
        Game.publish([ game.id ],socketEvent);

        const pNum = game.p0?.id === user.id ? 0 : 1;
        return res.ok({
          game: socketEvent.game,
          username: user.username,
          pNum
        });
      }
      // FIXME: #965
      // Remove everything between here and catch AFTER gamestate is deployed
      const unpopulatedGame = gameId ? await gameService.findGame({ gameId }) : null;
      const populatedGame =
        unpopulatedGame?.status === GameStatus.STARTED
          ? await gameService.populateGame({ gameId })
          : null;
      req.session.loggedIn = true;
      req.session.usr = user.id;
      if (unpopulatedGame) {
        Game.subscribe(req, [ unpopulatedGame.id ]);
        req.session.game = unpopulatedGame.id;
        req.session.pNum = user.pNum ?? undefined;
      }
      
      if (unpopulatedGame?.lastEvent?.victory) {
        Game.publish([ unpopulatedGame.id ], {
          change: unpopulatedGame.lastEvent.change,
          game: unpopulatedGame.lastEvent.game,
          victory: unpopulatedGame.lastEvent.victory
        });
      }
      
      if (populatedGame) {
        Game.publish([ populatedGame.id ], {
          ...populatedGame.lastEvent,
          game: populatedGame,
        });
      }

      const game = unpopulatedGame?.lastEvent?.game ?? (populatedGame ?? unpopulatedGame);
      return res.ok({
        game,
        username: user.username,
        pNum: user.pNum,
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
