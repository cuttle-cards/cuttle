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
				)
					.fetch()
					.exec(function (error, game) {
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
		findOpenGames: function () {
			return new Promise(function (resolve, reject) {
				Game.find({status: true}).populate('players').exec(function (error, games) {
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
		},
		findGame: function (id) {
			return new Promise(function (resolve, reject) {
				Game.findOne(id)
				.populate('players', {sort: 'pNum'})
				.populate('deck')
				.populate('topCard')
				.populate('secondCard')
				.exec(function (error, game) {
					if (error || !game) {
						var res;
						if (error) {
							res = error;
						} else {
							res = new Error("Can't find game");
						}
						return reject(res);
					} else {
						resolve(game);
					}
				});
			});
		}
	}


}