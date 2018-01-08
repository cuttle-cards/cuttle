var Promise = require('bluebird');
var userService = require("../../api/services/userService.js");
// Used to create fully populated game
function tempUser (usr, points) {
	this.pNum = usr.pNum;
	this.hand = usr.hand;
	this.points = points;
	this.runes = usr.runes;
	this.frozenId = usr.frozenId;
	this.id = usr.id;
};
function tempGame (game, p0, p1) {
	// console.log("\nMaking temp game:");
	// console.log(game);
	this.id = game.id;
	this.players = [p0, p1];
	this.deck = game.deck;
	this.scrap = game.scrap;
	this.topCard = game.topCard;
	this.secondCard = game.secondCard;
	this.oneOff = game.oneOff;
	this.twos = game.twos;
	this.log = game.log;
	this.id = game.id;
	this.turn = game.turn;
	this.passes = game.passes;
};
module.exports = {
	/**
	* Find game by id and return it as a Promise
	**** options = {gameId: integer}
	*/	
	findGame: function (options) {
		return new Promise(function (resolve, reject) {
			Game.findOne(options.gameId)
			.populate("players", {sort: 'pNum'})
			.populate("deck")
			.populate("scrap")
			.populate("topCard")
			.populate("secondCard")
			.populate("oneOff")
			.populate("twos")
			.populate("oneOffTarget")
			.populate("attachedToTarget")
			.exec(function (error, game) {
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
	saveGame: function (options) {
		return new Promise(function (resolve, reject) {
			options.game.save(function (err) {
				if (err) {
					return reject(err);
				} else {
					return resolve(options.game);
				}
			});
		});
	},

	/*
	** Return a fully populated Game as a Promise
	****options = {gameId: gameId}
	*/
	populateGame: function (options, done) {
		return new Promise (function (resolve, reject) {
			if (options) {
				if (options.hasOwnProperty('gameId')) {
					if (typeof(options.gameId) === 'number') {
						// find game
						var promiseGame = gameService.findGame({gameId: options.gameId})
						// then find users
						.then(function findUsers (game) {
							if (game.players) {
								if (game.players.length > 1) {
									var p0 = userService.findUser({userId: game.players[0].id});
									var p1 = userService.findUser({userId: game.players[1].id});
									return Promise.all([Promise.resolve(game), p0, p1]);
								} else {
									return Promise.reject(new Error("Can't populate game without two players")); 
								} 
							} else {
								return Promise.reject (new Error("Can't populate game, because it does not have players collection")); 
							}
						})
						// then find points
						.then(function findPoints (values) {
							var game = values[0];
							var p0 = values[1];
							var p1 = values[2];
							var p0Points = cardService.findPoints({userId: p0.id});
							var p1Points = cardService.findPoints({userId: p1.id});
							// console.log("\n\nFound game for populate:");
							// console.log(game);
							return Promise.all(
								[
									Promise.resolve(game), 
									Promise.resolve(p0), 
									Promise.resolve(p1), 
									p0Points, 
									p1Points
								]
							);
						})
						// then format results & resolve
						.then(function finish (values) {
							var game = values[0];
							var p0Points = values[3];
							var p1Points = values[4];
							var p0 = new tempUser(values[1], p0Points);
							var p1 = new tempUser(values[2], p1Points);
							var result = new tempGame(game, p0, p1);

							// console.log("\n game inside finish:");
							// console.log(game);
							// console.log("\nResult:");
							// console.log(result);
							return resolve(result);
						})
						.catch(function failed (err) {
							return reject(err);
						});
					} else {
						reject(new Error("Invalid gameId: Not a number"));
					}
				} else {
					return reject(new Error("Cannot populate Game without GameId (options had no gameId)"));
				}
			} else {
				return reject(new Error("Cannot populate Game without gameId"));
			}
		});
	}, //End populateGame()
	/*Checks a game to determine if either player has won
	***options = {game: GameModel}
	**SYNCRONOUS
	*/
	checkWinGame: function (options) {
		var res = {
			gameOver: false,
			winner: null
		};
		var p0Wins = userService.checkWin({user: options.game.players[0]});
		var p1Wins = userService.checkWin({user: options.game.players[1]});
			if (p0Wins || p1Wins) res.gameOver = true;
			if (p0Wins) {
				res.winner = 0;
			} else if (p1Wins) {
				res.winner = 1;
			}
			// return Promise.resolve(res);
			return res;
	},

	/*Replaces card played during a seven from the deck
	***options = {game: GameModel, index: integer}
	**index = 0 if played from top card, index = 1 if played from second card
	**SYNCRONOUS
	*/
	sevenCleanUp: function (options) {
		var game = options.game, index = options.index;
		if (options.index === 0) {
			if (game.secondCard) {
				game.topCard = game.secondCard.id;
			} else {
				game.topCard = null;
			}
		}
		// If there are more cards in the deck, assign secondCard
		if (game.deck.length > 0) {
			var min = 0;
			var max = game.deck.length - 1;
			var random = Math.floor((Math.random() * ((max + 1) - min)) + min);
			game.secondCard = game.deck[random]	;
			game.deck.remove(game.deck[random].id);
		} else {
			game.secondCard = null;
		}
		return game;		
	}

};