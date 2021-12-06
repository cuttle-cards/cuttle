/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 //////////////////
 // DEPENDENCIES //
 //////////////////
var Promise = require('bluebird');
//Hooks
var userAPI = sails.hooks['customuserhook'];
var passwordAPI = sails.hooks['custompasswordhook'];


module.exports = {
	homepage: function (req, res) {
		return res.view("homepage", {loggedIn: req.session.loggedIn, game: req.session.game});
	},

	signup: function (req, res) {
		if (req.body.password && req.body.email) {
			// data from client
			var email = req.body.email;
			var pass  = req.body.password;
			// promises
			User.find({email: req.body.email})
			.then(function checkForUniqueEmail (users) {
				if (users.length > 0) return Promise.reject({message: "That email is already registered to another user; try logging in!"});
				return passwordAPI.encryptPass(pass)
			})
			.then(function createUser (encryptedPassword){ //Use encrypted password to make new user
			return userAPI.createUser(email, encryptedPassword)
				.then(function setSessionData (user) { //Successfully created User
					req.session.loggedIn = true;
					req.session.usr = user.id;
					res.ok();
				})
				.catch(function failedCreate (reason) { //Failed to create User
					return res.badRequest(reason);
				});

			})	//End promiseEpass success
			.catch(function failed (reason) { //Password could not be encrypted
				return res.badRequest(reason);
			});
		} else { //Bad data sent from client
			return res.badRequest("You did not submit an email, or password");
		}

	},	
	login: function (req, res) {
		if (req.body.email) {
			var userPromise = userAPI.findUserByEmail(req.body.email)
				.then(function gotUser (user) {
					return passwordAPI.checkPass(req.body.password, user.encryptedPassword)
						.then(function correctPw () {
							req.session.loggedIn = true;
							req.session.usr = user.id;
							res.ok();
						})
						.catch(function failure (reason) {
							return res.badRequest(reason);
						});

					// return true;
				})
				.catch(function noUser (reason) {
					return res.badRequest({message: 'Could not find that User with that Username. Try signing up!'});
				});
		}
	}, //End login
	reLogin: function (req, res) {
		var promiseUser = userAPI.findUserByEmail(req.body.email)
		.then(function gotUser (user) {
			var checkPass = passwordAPI.checkPass(req.body.password, user.encryptedPassword);
			var promiseGame = gameService.populateGame({gameId: user.game});
			return Promise.all([promiseGame, Promise.resolve(user), checkPass]);
		})
		.then(function correctPw (values) {
			var game = values[0];
			var user = values[1];
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
		.catch(function failed (err) {
			return res.badRequest(err);
		});
	},

	logout: function (req, res) {
		delete(req.session.usr);
		req.session.loggedIn = false;
		return res.ok();
	},
};

