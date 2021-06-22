var Promise = require('bluebird');
var email = require('machinepack-emailaddresses');
module.exports = {
	/*
	**Find User by Id
	****options = {userId: integer}
	*/
	findUser: function (options, done) {
		return new Promise(function (resolve, reject) {
			if (options) {
				if (options.hasOwnProperty("userId") ) {
					return User.findOne({id: options.userId}).populateAll().exec(function (err, usr) {
						if (err) {
							return reject(err);
						} else if(!usr) {
							return reject({message: "Could not find user: " + options.userId});
						} else {
							return resolve(usr);
						}
					});
				// end if options has userId
				} else {
					return reject({message: "No id given when finding user"});
				}
			//end if(options)
			} else {
				return reject({message: "No id given when finding user"});
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
					return reject(err);
				} else {
					return resolve(options.user);
				}
			});
		});
	},

	/*
	**Count number of Queens a given user has (synchronous)
	****options = {user: UserModel}
	*/
	queenCount: function (options) {
		var res = 0, player = options.user;
		player.runes.forEach(function (rune) {
			if (rune.rank === 12) res++;
		});
		return res;
	},

	/*
	**Check if user has won
	***options = {user: UserModel}
	*/
	checkWin: function (options) {
		var res = false;
		var player = options.user;
		var points = 0;
		var kings = 0;
		player.points.forEach(function (point) {
			points += point.rank;
		});
		player.runes.forEach(function (rune) {
			if (rune.rank === 13) kings++;
		});
		switch (kings) {
			case 0:
				if (points >= 21) res = true;
				break;
			case 1:
				if (points >= 14) res = true;
				break;
			case 2:
				if (points >= 10) res = true
				break;
			case 3:
				if (points >= 7) res = true;
				break;
			case 4:
				if (points >= 5) res = true;
				break;
		}
		// return Promise.resolve(res);
		return res;
	},

	validateEmail: function (options) {
		return new Promise(function (resolve, reject) {
			email.validate({string: options.email},
			{
				error: function (err) {
					return reject(error)
				},
				invalid: function () {
					return reject({message: "That's not a valid email address"});
				},
				success: function () {
					return resolve(true);
				}
			})
		}) ;
	},
	// returns email up until @
	truncateEmail: function(email) {
		return email.split("@")[0];
	}
};