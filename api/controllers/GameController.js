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
		console.log(req.body);
		if (req.body.gameName) {
			var promiseCreateGame = gameAPI.createGame(req.body.gameName);
			var promiseUser = userAPI.findUserById(req.session.usr);
			Promise.all([promiseCreateGame, promiseUser]).then(function (array) {
				var game = array[0];
				var player = array[1];
				req.session.game = game.id;
				game.players.add(player);
				game.save();
				res.ok();
				//Maybe do a publish create
			}).catch(function (reason) {
				console.log(reason);
				res.badRequest(reason);
			});
		}
	}
};

