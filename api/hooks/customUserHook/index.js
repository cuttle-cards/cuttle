module.exports = function userHook(sails) {
///////////////
// User API  //
///////////////
var Promise = require('bluebird');
	return {
		findUserbyEmail: function(email) {
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
		},

		createUser: function (email, encryptedPassword) {
			return new Promise(function (resolve, reject) {
				User.create({
					email: email,
					encryptedPassword: encryptedPassword
				}, 
				function (err, user) {
					if (err || !user) { //Failed user creation
						return reject(err);
					} else { //Made new user
						console.log(user);
						return resolve(user);
					}
				}); //End of User.create
			}); //End of returned promise
		}

	};
}