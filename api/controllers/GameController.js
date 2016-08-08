/**
 * GameController
 *
 * @description :: Server-side logic for managing Games
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

 ///////////////////
 // Dependencies //
 //////////////////
var Promise = require('bluebird');
var gameAPI = sails.hooks['customgamehook'];
var userAPI = sails.hooks['customuserhook'];


module.exports = {
	create: function(req, res) {
		if (req.body.gameName) {
			var promiseCreateGame = gameAPI.createGame(req.body.gameName);
			var promiseUser = userAPI.findUserById(req.session.usr);
			Promise.all([promiseCreateGame, promiseUser]).then(function (array) {
				var game = array[0];
				var player = array[1];
				req.session.game = game.id;
				game.players.add(player);
				game.save();
				Game.publishCreate({
					id: game.id,
					name: game.name,
					status: game.status
				});
				res.ok();

				// gameAPI.findAllGames()
				// .then(function foundGames (games) {
				// 	res.ok();
				// 	return Game.publishCreate({
				// 		id: 0,
				// 		games: games
				// 	});
				// })
				// .catch(function failed (error) {
				// 	return res.badRequest(error);
				// });
			}).catch(function (reason) {
				console.log(reason);
				res.badRequest(reason);
			});
		}
	},

	getList: function (req, res) {
		Game.watch(req);
		gameAPI.findAllGames()
		.then(function success (games) {
			return res.send(games);
		})
		.catch(function failure (error) {
			return res.badRequest(error);
		});		
	},

	subscribe: function (req, res) {
		if (req.body.id) {
			Game.subscribe(req, req.body.id);
			res.ok();
		} else {
			res.badRequest("No game id received for subscription");
		}
	},

	lobbyView: function (req, res) {
		return res.view("lobbyview");
	}
};

