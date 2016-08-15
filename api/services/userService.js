var Promise = require('bluebird');
module.exports = {
	/*
	**Save User and Return it as a Promise
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
	}
};