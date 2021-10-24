var Promise = require('bluebird');
var userService = require("../../api/services/userService.js");

/**
 * Game result states
 */
const GameResult = Object.freeze({
	INCOMPLETE: -1,
	P0_WINS: 0,
	P1_WINS: 1,
	STALEMATE: 2,
});

/**
 * @returns int <= 0 if card1 is lower rank or same rank & lower suit
 * @param {rank: number, suit: number} card1 
 * @param {rank: number, suit: number} card2 
 */
function comapreByRankThenSuit(card1, card2) {
	let res = card1.rank - card2.rank;
	if (res === 0) {
		res = card1.suit - card2.suit;
	}
	return res;
}
// Used to create fully populated game
function tempUser (usr, points) {
	this.pNum = usr.pNum;
	this.hand = usr.hand;
	this.points = points;
	this.runes = usr.runes;
	this.frozenId = usr.frozenId;
	this.id = usr.id;
	this.userName = userService.truncateEmail(usr.email);

	this.hand.sort(comapreByRankThenSuit);
	this.points.sort(comapreByRankThenSuit);
	this.runes.sort(comapreByRankThenSuit);
};
function tempGame (game, p0, p1) {
	this.id = game.id;
	this.players = [p0, p1];
	this.deck = game.deck;
	this.scrap = game.scrap;
	this.topCard = game.topCard;
	this.secondCard = game.secondCard;
	this.oneOff = game.oneOff;
	this.oneOffTarget = game.oneOffTarget;
	this.twos = game.twos;
	this.log = game.log;
	this.chat = game.chat;
	this.id = game.id;
	this.turn = game.turn;
	this.passes = game.passes;
	this.resolving = game.resolving;
	this.lastEvent = game.lastEvent;
};
module.exports = {
	GameResult,
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
			.populate("resolving")
			.populate("twos", {sort: 'updatedAt'})
			.populate("oneOffTarget")
			.populate("attachedToTarget")
			.exec(function (error, game) {
				if (error || !game) {
					var res;
					if (error) {
						err = error;
					} else {
						err = {message: "Cannot find game: " + options.gameId};
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
		const { game } = options;
		return Game.updateOne({id: game.id})
			.set(game);
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
									return Promise.reject({message: "Can't populate game without two players"}); 
								} 
							} else {
								return Promise.reject({message: "Can't populate game, because it does not have players collection"}); 
							}
						})
						// then find points
						.then(function findPoints (values) {
							var game = values[0];
							var p0 = values[1];
							var p1 = values[2];
							var p0Points = cardService.findPoints({userId: p0.id});
							var p1Points = cardService.findPoints({userId: p1.id});
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

							return resolve(result);
						})
						.catch(function failed (err) {
							return reject(err);
						});
					} else {
						reject({message: "Invalid gameId: Not a number"});
					}
				} else {
					return reject({message: "Cannot populate Game without GameId (options had no gameId)"});
				}
			} else {
				return reject({message: "Cannot populate Game without gameId"});
			}
		});
	}, //End populateGame()
	/* 
	** Checks a game to determine if either player has won
	* @param options = {game: tmpGame, gameModel: GameModel}
	*/
	checkWinGame: async function (options) {
		const res = {
			gameOver: false,
			winner: null,
			conceded: false
		};
		const { game, gameModel } = options;
		const p0Wins = userService.checkWin({user: game.players[0]});
		const p1Wins = userService.checkWin({user: game.players[1]});
			if (p0Wins || p1Wins) {
				res.gameOver = true;
				const gameUpdates = {
					p0: game.players[0].id,
					p1: game.players[1].id
				};
				if (p0Wins) {
					res.winner = 0;
					gameUpdates.result = GameResult.P0_WINS;
				} else if (p1Wins) {
					res.winner = 1;
					gameUpdates.result = GameResult.P1_WINS;
				}
				await Game.updateOne({id: game.id})
				.set(gameUpdates);
			}
			return res;
	},

	/* Takes a user id and clears all game data 
	* from the associated user
	*/
	clearGame: async function (options) {
		return User.findOne(options.userId)
		.populateAll()
		.then(function clearUserData (player) {
			const updatePromises = [
				// Delete User data
				User.replaceCollection(player.id, 'hand')
					.members([]),
				User.replaceCollection(player.id, 'points')
					.members([]),
				User.replaceCollection(player.id, 'runes')
					.members([]),
				User.updateOne({id: player.id})
					.set({
						'frozenId': 0,
						'pNum': null,
					})
			];
			let promiseGame = null;
			if (player.game) {
				promiseGame = gameService.findGame({gameId: player.game.id});
			}
			return Promise.all([promiseGame, player, ...updatePromises])
			.then(function clearGameData (values) {
				const game = values[0];
				const player = values[1];
				const updatePromises = [];
				if (game) {
					const opponent = game.players[(player.pNum + 1) % 2];
					updatePromises.push(
						// Update game
						Game.replaceCollection(game.id, 'players')
							.members([])
					)
					if (opponent) {
						updatePromises.push(
							// Update Opponent
							User.replaceCollection(opponent.id, 'hand')
								.members([]),
							User.replaceCollection(opponent.id, 'points')
								.members([]),
							User.replaceCollection(opponent.id, 'runes')
								.members([]),
							User.updateOne({id: opponent.id})
								.set({
									'frozenId': 0,
									'pNum': null,
								}),
						);
					}
				}
				return Promise.all(updatePromises);
			}) // End clearGameData()
			.catch(function failed (err) {
				console.log('\nError clearing game');
				console.log(err);
				return Promise.reject(err);
			});
		});
	},

/**
 * Used to replace card played via a seven from the deck
 * @param {*} options: {game: GameModel, index: integer}
 * index = 0 iff topcard was played, 1 iff secondCard was played
 * @returns {topCard: int, secondCard: int, cardsToRemove: int[]}
 * Does not change records -- only returns obj for game updates
 * SYNCHRONOUS
 */
	sevenCleanUp: function (options) {
		const { game, index } = options;
		const cardsToRemoveFromDeck = [];
		const res = {
			topCard: game.topCard.id,
			secondCard: null,
			cardsToRemoveFromDeck,
		};
		if (options.index === 0) {
			if (game.secondCard) {
				game.topCard = game.secondCard.id;
			} else {
				game.topCard = null;
			}
		}
		// Re-assign top card if top card was played
		if (index === 0 && game.secondCard) {
			if (game.secondCard) {
				res.topCard = game.secondCard.id;
			}
			else {
				res.topCard = null;
			}
		}
		// If there are more cards in the deck, assign secondCard
		if (game.deck.length > 0) {
			const newSecondCard = _.sample(game.deck).id;
			res.secondCard = newSecondCard;
			cardsToRemoveFromDeck.push(newSecondCard);
		}
		return res;
	},

};