/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

//////////////////
// DEPENDENCIES //
//////////////////

import { Game, User } from '../interfaces';
const gameService = require('../services/gameService');

/*
 * Note: This usage merely proves that we CAN use types here. It should be
 * replaced with types to reflect Request/Handlers used by the Sails flavor
 * of Expressjs.
 */
type BaseRequest = {
  session: {
    loggedIn: boolean;
    game: number;
    usr: number;
  };
  _sails: {
    models: { game: Game; user: User };
    hooks: {
      custompasswordhook: Record<string, any>;
    };
  };
};

type HomepageRequest = BaseRequest;
type SignupRequest = BaseRequest & {
  body: { username: string; password: string };
};

module.exports = {
  homepage: function(req: HomepageRequest, res) {
    return res.view('homepage', { loggedIn: req.session.loggedIn, game: req.session.game });
  },

  signup: async function(req: SignupRequest, res) {
    const { _sails: sails } = req;
    const passwordAPI = sails.hooks['custompasswordhook'];
    const { user: User } = sails.models;

    // Request was missing data
    if (!req.body.password && !req.body.username) {
      return res.badRequest('You did not submit a username or password');
    }
    try {
      const { username, password } = req.body;
      const users = await User.find({ username });
      if (users.length > 0) {
        return res.badRequest({
          message: 'That username is already registered to another user; try logging in!',
        });
      }
      // Encrypt pw and create new user
      const encryptedPassword = await passwordAPI.encryptPass(password);
      const { _sails: sails } = req;
      const userAPI = sails.hooks['customuserhook'];
      const user = await userAPI.createUser(username, encryptedPassword);
      // Successfully created User - Set session data
      req.session.loggedIn = true;
      req.session.usr = user.id;
      return res.ok();
    } catch (err) {
      return res.badRequest(err);
    }
  },
  login: function(req, res) {
    const { username } = req.body;
    const { _sails: sails } = req;
    const userAPI = sails.hooks['customuserhook'];
    const passwordAPI = sails.hooks['custompasswordhook'];

    if (username) {
      userAPI
        .findUserByUsername(username)
        .then(user => {
          return passwordAPI
            .checkPass(req.body.password, user.encryptedPassword)
            .then(() => {
              req.session.loggedIn = true;
              req.session.usr = user.id;
              return res.ok();
            })
            .catch(reason => {
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
  reLogin: function(req, res) {
    const { _sails: sails } = req;
    const userAPI = sails.hooks['customuserhook'];
    const passwordAPI = sails.hooks['custompasswordhook'];
    const { game: Game } = sails.models;

    userAPI
      .findUserByUsername(req.body.username)
      .then(function gotUser(user) {
        const checkPass = passwordAPI.checkPass(req.body.password, user.encryptedPassword);
        const promiseGame = gameService.populateGame({ gameId: user.game });
        return Promise.all([promiseGame, Promise.resolve(user), checkPass]);
      })
      .then(values => {
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
      .catch(err => {
        return res.badRequest(err);
      });
  },

  logout: function(req, res) {
    delete req.session.usr;
    req.session.loggedIn = false;
    return res.ok();
  },
};
