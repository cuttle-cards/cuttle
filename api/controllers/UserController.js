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
		return res.view("homepage", {loggedIn: req.session.loggedIn});
	},

	signup: function (req, res) {
		if (req.body.password && req.body.email) {
			// data from client
			var email = req.body.email;
			var pass  = req.body.password;
			// promises
			User.find({email: req.body.email})
			.then(function checkForUniqueEmail (users) {
				if (users.length > 0) return Promise.reject(new Error("That email is already registered to another user; try logging in!"));
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
					// console.log(reason);
					return res.badRequest(reason);
				});

			})	//End promiseEpass success
			.catch(function failed (reason) { //Password could not be encrypted
				// console.log("Failed to create user:");
				// console.log(reason);
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
							console.log("failed to login");
							console.log(reason);
							return res.badRequest(reason);
						});

					// return true;
				})
				.catch(function noUser (reason) {
					console.log("couldn't find user");
					return res.badRequest(reason);
				});
		}
	}, //End login
	reLogin: function (req, res) {
		console.log("relog requested");
		var promiseUser = userAPI.findUserByEmail(req.body.email)
		.then(function gotUser (user) {
			var checkPass = passwordAPI.checkPass(req.body.password, user.encryptedPassword);
			var promiseGame = gameService.populateGame({gameId: user.game});
			return Promise.all([promiseGame, Promise.resolve(user), checkPass]);
		})
		.then(function correctPw (values) {
			console.log("correctPw");
			console.log(values);
			var game = values[0];
			var user = values[1];
			req.session.loggedIn = true;
			req.session.usr = user.id;
			Game.subscribe(req, game.id);
			Game.publishUpdate(game.id,
			{
				change: 'reLogin',
				game: game,
			});
			return res.ok();
		})
		.catch(function failed (err) {
			console.log("failed relog");
			console.log(err);
			return res.badRequest(err);
		});
	},

	logout: function (req, res) {
		delete(req.session.usr);
		req.session.loggedIn = false;
		return res.ok();
	},
};

