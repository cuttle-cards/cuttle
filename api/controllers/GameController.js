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
			var promiseCreateGame = gameAPI.createGame(req.body.gameName)
			.then(function (game) {
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
			var promiseGame = gameAPI.findGame(req.body.id);
			var promiseUser = userAPI.findUser(req.session.usr);
			Promise.all([promiseGame, promiseUser]).then(function success (arr) {
				// Catch promise values
				var game = arr[0];
				var user = arr[1];
				var pNum;
				if (game.players) {
					pNum = game.players.length;
				} else {
					pNum = 0;
				}
				// Set session data
				req.session.game = game.id;
				req.session.pNum = pNum;
				// Update models
				user.pNum = pNum;
				game.players.add(user.id);
				game.save();
				user.save();
				// Respond with 200
				res.ok();
			})
			.catch(function failure (error) {
				return res.badRequest(error);
			});
		} else {
			res.badRequest("No game id received for subscription");
		}
	},

	ready: function (req, res) {
		if (req.session.game && req.session.usr) {
			var promiseGame = gameAPI.findGame(req.session.game);
			var promiseUser = userAPI.findUser(req.session.usr);
			Promise.all([promiseGame, promiseUser])
			// Assign player readiness
			.then(function foundRecords (values) {
				var game = values[0];
				var user = values[1];
				var pNum = user.pNum;
				var bothReady = false;
				switch (pNum) {
					case 0:
						game.p0Ready = true;
						break;
					case 1:
						game.p1Ready = true;
						break;
				}
				// Check if everyone is ready
				if (game.p0Ready && game.p1Ready) bothReady = true;
				return Promise.resolve([game, user, bothReady]);
			})
			// Deal if both ready
			.then(function dealIfBothReady (values) {
				var game = values[0];
				var user = values[1];
				var bothReady = values[2];
				if (bothReady) {
					// Deal, then publishUpdate
					cardService.createCard({
						suit: 3,
						rank: 1,
						gameId: game.id}).then(function madeCard(newCard) {
							console.log(newCard);
							return Promise.resolve(newCard);
						}).catch(function failedCard(err) {
							console.log(err);
							return Promise.reject(err);
						});
				}
				// This will change once the logic is complete
				return Promise.resolve(values);
			})
			// Save
			.then(function readyToSave (values) {
				var game = values[0];
				var user = values[1];
				var bothReady = values[2];
				// Save records w/ promises
				var saveGame = gameService.saveGame({game: game});
				var saveUser = userService.saveUser({user: user});
				return Promise.all([saveGame, saveUser])
				.then(function successfullySaved (values) {
					var result = values.concat([bothReady]);
					return Promise.resolve(result);
				})
				.catch(function failedToSave (err) {
					return Promise.reject(err);
				});
			})
			// Publish
			.then(function readyToPublish (values) {
				var game = values[0];
				var user = values[1];
				var bothReady = values[2];
				// Handle dealing if both ready
				return res.ok({
					bothReady: bothReady,
					game: game
				});
			})
			// Handle errors
			.catch(function handleError (err) {
				return res.badRequest(err);
			});
		} else {
			var err = new Error("Missing game or player id");
			return res.badRequest(err);
		}
	}

	// lobbyView: function (req, res) {
	// 	return res.view("lobbyview");
	// }
};

