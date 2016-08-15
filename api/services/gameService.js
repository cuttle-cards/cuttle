var Promise = require('bluebird');
module.exports = {
	/**
	* Find game by id and return it as a Promise
	*/	
	findGame: function (options, done) {
		return new Promise(function (resolve, reject) {
			Game.findOne(options.gameId).exec(function (error, game) {
				if (error || !game) {
					var res;
					if (error) {
						err = error;
					} else {
						err = new Error("Cannot find game: " + options.gameId);
					}
					return reject(err);
				} else {
					return resolve(game);
				}
			});
		});
	},

	/*
	** Save game and return it as a Promise
	*/
	saveGame: function (options, done) {
		return new Promise(function (resolve, reject) {
			options.game.save(function (err) {
				if (err) {
					return reject(err);
				} else {
					return resolve(options.game);
				}
			});
		});
	}

};