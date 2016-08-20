var Promise = require('bluebird');
module.exports = {
	/**
	* Find game by id and return it as a Promise
	**** options = {gameId: integer}
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
	****options = {game: GameModel}
	*/
	saveGame: function (options, done) {
		console.log("saving game");
		return new Promise(function (resolve, reject) {
			console.log(options.game);
			options.game.save(function (err) {
				if (err) {
					console.log("error saving game");
					return reject(err);
				} else {
					console.log("Saved game successfully");
					return resolve(options.game);
				}
			});
		});
	}

};