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
					User.findOne(options.userId).populateAll().exec(function (err, usr) {
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
					return reject(err);
				} else {
					return resolve(options.user);
				}
			});
		});
	},

	/*
	**Check whether user has won
	****options = {user: UserModel}
	*/
	// checkWin: function (options) {
	// 	var res = false, user = options.user, points = user.points, runes = user.runes, pointTotal = 0, kings = 0;
	// 	points.forEach(function (point) {
	// 		pointTotal += point.rank;
	// 	});
	// 	runes.forEach(function (rune) {
	// 		kings++;
	// 	});
	// 	switch (kings) {
	// 		case 0:
	// 			if (pointTotal >= 21) res = true;
	// 			break;
	// 		case 1:
	// 			if (pointTotal >= 14) res = true;
	// 			break;
	// 		case 2:
	// 			if (pointTotal >= 10) res = true;
	// 			break;
	// 		case 3:
	// 			if (pointTotal >= 7) res = true;
	// 			break;
	// 		case 4:
	// 			if (pointTotal >= 5) res = true;
	// 			break;
	// 	}
	// 	return res;
	// }
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
	}
};