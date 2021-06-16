module.exports = function userHook(sails) {
///////////////
// User API  //
///////////////
var Promise = require('bluebird');
	return {
		findUserByEmail: function(email) {
			return new Promise(function (resolve, reject) {
				User.findOne({
					email: email
				}).exec(function (error, user) {
					if (error || !user) {
						var res;
						if (error) {
							res = error;
						} else {
							res = new Error("User does not exist");
						} 
						return reject(res);
					} else {
						return resolve(user);
					}
				});
			});
		},

		findUser: function(id) {
			return new Promise(function (resolve, reject) {
				User.findOne(id).exec(function (error, user) {
					if (error || !user) {
						var res;
						if (error) {
							res = error;
						} else {
							res = new Error("User does not exist");
						} 
						return reject(res);
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
				})
					.fetch()
					.exec((err, user) => {
						if (err || !user) { //Failed user creation
							var res;
							if (err) {res = err}
							else {res = new Error("Could not create user")}
							return reject(res);
						} else { //Made new user
							return resolve(user);
						}
					})
			}); //End of returned promise
		},

		findUserById: function(id) {
			return new Promise(function (resolve, reject) {
				User.findOne({
					id: id
				}).exec(function (error, user) {
					if (error || !user) {
						var res;
						if (error) {
							res = error;
						} else {
							res = new Error("User does not exist");
						}
						return reject(res);
					} else {
						return resolve(user);
					}
				});
			});
		},
	};
}