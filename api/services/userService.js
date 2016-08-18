var Promise = require('bluebird');
module.exports = {
	/*
	**Find User by Id
	****options = {userId: integer}
	*/
	findUser: function (options, done) {
		return new Promise(function (resolve, reject) {
			if (options) {
				if (options.hasOwnProperty("userId") ) {
					User.findOne(options.userId).exec(function (err, usr) {
						if (err) {
							return reject(err);
						} else if(!usr) {
							return reject(new Error("Could not find user: " + options.userId));
						} else {
							return resolve(usr);
						}
					});
				// end if options has userId
				} else {
					return reject(new Error("No id given when finding user"));
				}
			//end if(options)
			} else {
				return reject(new Error("No id given when finding user"));
			}  
		});
	},

	/*
	**Save User and Return it as a Promise
	****options = {user: UserModel}
	*/	
	saveUser: function (options, done) {
		return new Promise(function (resolve, reject) {
			options.user.save(function (err) {
				if (err) {
					console.log("error saving user");
					return reject(err);
				} else {
					return resolve(options.user);
				}
			});
		});
	}
};