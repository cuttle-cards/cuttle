/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 //////////////////
 // DEPENDENCIES //
 //////////////////
var passwords = require("machinepack-passwords");
var Promise = require('bluebird');

//////////////////
// PASSWORD API //
//////////////////

var encryptPass = function(pass) {
	return new Promise(function (resolve, reject) {
		passwords.encryptPassword({password: pass}).exec({
			error: function(err) {
				return reject(err);
			},
			success: function (encryptedPass) {
				return resolve(encryptedPass);
			}
		});
	});
};

var checkPass = function(pass, encryptedPass) {
	return new Promise(function (resolve, reject) {
		passwords.checkPassword({
			passwordAttempt: pass,
			encryptedPassword: encryptedPass
		}).exec({
			error: function(err) {
				console.log("Error checking pass");
				console.log(err);
				return reject(err);
			},
			incorrect: function() {
				console.log("Wrong password");
				return reject("Wrong password");
			}, 
			success: function() {
				console.log("Correct password, red leader standing by");
				return resolve(true);
			}
		});
	});
};

///////////////
// Model API //
///////////////
var findUserbyEmail = function(email) {
	return new Promise(function (resolve, reject) {
		User.findOne({
			email: email
		}).exec(function (error, user) {
			if (error || !user) {
				console.log("Got error or user doesn't exist");
				console.log(error);
				return reject(error);
			} else {
				return resolve(user);
			}
		});
	});
};
///////////////////////////////////////////////
//	BROKEN FUNCTION - DOES NOT RETURN PROMISE//
///////////////////////////////////////////////
var createUser = function (email, encryptedPassword) {
	return new Promise(function (resolve, reject) {
		User.create({
			email: email,
			encryptedPassword: encryptedPassword
		}).exec(function (err, user) {
			if (err || !user) { //Failed user creation
				return reject(err);
			} else { //Made new user
				console.log(user);
				return resolve(user);
			}
		});
	});
};



module.exports = {
	signup: function (req, res) {
		console.log("Signing up");
		console.log(req.body);
		if (req.isSocket && req.body.password && req.body.email) {
			// data from client
			var email = req.body.email;
			var pass  = req.body.password;
			// promises
			var promiseEPass = encryptPass(pass);
			promiseEPass.then(function (encryptedPassword){ //Use encrypted password to make new user
				var promiseUser = createUser(email, encryptedPassword);
				User.create({
					email: email,
					encryptedPassword: encryptedPassword
				}).exec(function (err, user) {
					console.log(user);
				});
			})	//End promiseEpass success
			.catch(function (reason) { //Password could not be encrypted
				console.log(reason);
				res.badRequest(reason);
			});
		} else { //Bad data sent from client
			res.badRequest("You did not submit an email, or password");
		}

	},	
};

