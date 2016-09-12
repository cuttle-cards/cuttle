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
	signup: function (req, res) {
		console.log("received signup request");
		if (req.body.password && req.body.email) {
			// data from client
			var email = req.body.email;
			var pass  = req.body.password;
			// promises
			passwordAPI.encryptPass(pass)
				.then(function (encryptedPassword){ //Use encrypted password to make new user
				return userAPI.createUser(email, encryptedPassword)
					.then(function (user) { //Successfully created User
						req.session.loggedIn = true;
						req.session.usr = user.id;
						res.ok();
					})
					.catch(function (reason) { //Failed to create User
						console.log(reason);
						res.badRequest(reason);
					});

			})	//End promiseEpass success
			.catch(function (reason) { //Password could not be encrypted
				console.log("Failed to create user:");
				console.log(reason);
				res.badRequest(reason);
			});
		} else { //Bad data sent from client
			res.badRequest("You did not submit an email, or password");
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
							console.log(reason);
							res.badRequest(reason);
						});

					// return true;
				})
				.catch(function noUser (reason) {
					res.badRequest(reason);
				});
		}
	}
};

