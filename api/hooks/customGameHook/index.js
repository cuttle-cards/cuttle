module.exports = function gameHook(sails) {
//////////////
// Game API //
//////////////
var Promise = require('bluebird');
	return {
		createGame: function (gameName) {
			return new Promise(function (resolve, reject) {
				Game.create(
				{
					name: gameName,
					status: true,
				}
				).exec(function (error, game) {
					if (error || !game) {
						var res;
						if (error) {
							res = error;
						} else {
							res = new Error("Can't create game");
						}
						return reject(res);
					} else {
						return resolve(game);
					}
				})
			});
		},
		findAllGames: function () {
			return new Promise(function (resolve, reject) {
				Game.find({}).exec(function (error, games) {
					if (error || !games) {
						var res;
						if (error) {
							res = error;
						} else {
							res = new Error("Can't find games");
						}
						return reject(res);
					} else {
						return resolve(games);
					}
				});
			});
		}
	}


}