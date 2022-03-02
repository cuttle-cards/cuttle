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
    return res.view("homepage", {loggedIn: req.session.loggedIn, game: req.session.game});
  },

  signup: function (req, res) {
    if (req.body.password && req.body.username) {
      // data from client
      const username = req.body.username;
      const pass = req.body.password;
      // promises
      User.find({username: username})
        .then((users) => {
          if (users.length > 0) {
            return Promise.reject({message: "That username is already registered to another user; try logging in!"});
          }
          return passwordAPI.encryptPass(pass);
        })
        .then(function createUser(encryptedPassword) { //Use encrypted password to make new user
          return userAPI.createUser(username, encryptedPassword)
            .then(function setSessionData(user) { //Successfully created User
              req.session.loggedIn = true;
              req.session.usr = user.id;
              return res.ok();
            })
            .catch((reason) => { //Failed to create User
              return res.badRequest(reason);
            });
        })  //End promiseEpass success
        .catch((reason) => { //Password could not be encrypted
          return res.badRequest(reason);
        });
    } else { //Bad data sent from client
      return res.badRequest("You did not submit a username or password");
    }

  },
  login: function (req, res) {
    const username = req.body.username;
    if (username) {
      userAPI.findUserByUsername(username)
        .then((user) => {
          return passwordAPI.checkPass(req.body.password, user.encryptedPassword)
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
          return res.badRequest({message: 'Could not find that user with that username. Try signing up!'});
        });
    } else {
      return res.badRequest({message: 'A username must be provided'});
    }
  },
  reLogin: function (req, res) {
    userAPI.findUserByUsername(req.body.username)
      .then(function gotUser(user) {
        const checkPass = passwordAPI.checkPass(req.body.password, user.encryptedPassword);
        const promiseGame = gameService.populateGame({gameId: user.game});
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
    delete req.session.usr;
    req.session.loggedIn = false;
    return res.ok();
  },
};

