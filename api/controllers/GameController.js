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


module.exports = {
	create: function(req, res) {
		console.log(req.body);
		if (req.body.gameName) {
			gameAPI.createGame(req.body.gameName).then(function (game) {
				res.ok();
				//Maybe do a publish create
			}).catch(function (reason) {
				console.log(reason);
				res.badRequest(reason);
			});
		}
	}
};

