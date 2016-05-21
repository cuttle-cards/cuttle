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
		if (req.isSocket && req.body.password && req.body.email) {
			// data from client
			var email = req.body.email;
			var pass  = req.body.password;
			// promises
			passwordAPI.encryptPass(pass)
				.then(function (encryptedPassword){ //Use encrypted password to make new user
				return userAPI.createUser(email, encryptedPassword)
				.then(function (user) { //Successfully created User
					console.log(req.session);
					req.session.loggedIn = true;
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
};

