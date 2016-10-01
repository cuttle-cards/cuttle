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
				return res.ok();

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
				res.ok({playerId: user.id});
			})
			.catch(function failure (error) {
				return res.badRequest(error);
			});
		} else {
			res.badRequest("No game id received for subscription");
		}
	},

	ready: function (req, res) {
		console.log("\nReady");
		if (req.session.game && req.session.usr) {
			var promiseGame = gameAPI.findGame(req.session.game);
			var promiseUser = userAPI.findUser(req.session.usr);
			// Promise.all([promiseGame, promiseUser])
			// // Assign player readiness
			// .then(function foundRecords (values) {
			// 	var game = values[0];
			// 	var user = values[1];
			// 	var pNum = user.pNum;
			// 	var bothReady = false;
			// 	switch (pNum) {
			// 		case 0:
			// 			game.p0Ready = true;
			// 			break;
			// 		case 1:
			// 			game.p1Ready = true;
			// 			break;
			// 	}
			// 	// Check if everyone is ready
			// 	if (game.p0Ready && game.p1Ready) bothReady = true;
			// 	return Promise.resolve([game, user, bothReady]);
			// })
			// // Deal if both ready
			// .then(function makeDeckIfBothReady (values) {
			// 	var game = values[0];
			// 	var user = values[1];
			// 	var bothReady = values[2];
			// 	var promiseDeck = [];
			// 	if (bothReady) {
			// 		var findP0 = userService.findUser(game.players[0]);
			// 		var findP1 = userService.findUser(game.players[1]);
			// 		var data = [findP0, findP1];
			// 		// Deal, then publishUpdate
			// 		for (suit = 0; suit<4; suit++) {
			// 			for (rank = 1; rank < 14; rank++) {
			// 				var promiseCard = cardService.createCard({
			// 					gameId: game.id,
			// 					suit: suit,
			// 					rank: rank
			// 				});
			// 				data.push(promiseCard);
			// 			}
			// 		};

			// 		Promise.all(data)
			// 		// Then deal cards into hands
			// 		.then(function deal (playersAndDeck) {
			// 			var p0 = playersAndDeck[0];
			// 			var p1 = playersAndDeck[1];
			// 			var deck = playersAndDeck.slice(2);

			// 		})
			// 		.catch(function failedDealing (err) {
			// 			return Promise.reject(err);
			// 		});

			// 		// cardService.createCard({
			// 		// 	suit: 3,
			// 		// 	rank: 1,
			// 		// 	gameId: game.id}).then(function madeCard(newCard) {
			// 		// 		console.log(newCard);
			// 		// 		return Promise.resolve(newCard);
			// 		// 	}).catch(function failedCard(err) {
			// 		// 		console.log(err);
			// 		// 		return Promise.reject(err);
			// 		// 	});
			// 	}
			// 	return Promise.resolve(values);
			// })
			// // Save
			// .then(function readyToSave (values) {
			// 	var game = values[0];
			// 	var user = values[1];
			// 	var bothReady = values[2];
			// 	if (bothReady) {
			// 		var cards = values[3];
			// 	}
			// 	// Save records w/ promises
			// 	var saveGame = gameService.saveGame({game: game});
			// 	var saveUser = userService.saveUser({user: user});
			// 	return Promise.all([saveGame, saveUser])
			// 	.then(function successfullySaved (values) {
			// 		var result = values.concat([bothReady]);
			// 		return Promise.resolve(result);
			// 	})
			// 	.catch(function failedToSave (err) {
			// 		return Promise.reject(err);
			// 	});
			// })
			// // Publish
			// .then(function readyToPublish (values) {
			// 	var game = values[0];
			// 	var user = values[1];
			// 	var bothReady = values[2];
			// 	// Handle dealing if both ready
			// 	return res.ok({
			// 		bothReady: bothReady,
			// 		game: game
			// 	});
			// })
			// // Handle errors
			// .catch(function handleError (err) {
			// 	return res.badRequest(err);
			// });





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
				if (game.p0Ready && game.p1Ready) {
					bothReady = true;
					return new Promise(function makeDeck (resolveMakeDeck, rejectmakeDeck) {
						var findP0 = userService.findUser({userId: game.players[0].id});
						var findP1 = userService.findUser({userId: game.players[1].id});
						var data = [findP0, findP1];
						for (suit = 0; suit<4; suit++) {
							for (rank = 1; rank < 14; rank++) {
								var promiseCard = cardService.createCard({
									gameId: game.id,
									suit: suit,
									rank: rank
								});
								data.push(promiseCard);
							}
						};
						return resolveMakeDeck(Promise.all(data));			
					})
					.then(function deal (values) {
						var p0 = values[0];
						var p1 = values[1];
						var deck = values.slice(2);
						var dealt = []; //Prevents doubly dealing one card
						var min = 0;
						var max = 51;
						var random = Math.floor((Math.random() * ((max + 1) - min)) + min);

						// Deal one extra card to p1
						p1.hand.add(deck[random]);
						game.deck.remove(deck[random].id);
						dealt.push(random);
						// Then deal 5 cards to each player
						for (var i = 0; i < 5; i++) {
							// deal to p1
							while (dealt.indexOf(random) >= 0) {
								random = random = Math.floor((Math.random() * ((max + 1) - min)) + min);
							}
							p1.hand.add(deck[random]);
							game.deck.remove(deck[random].id);
							dealt.push(random);
							// deal to p0
							while (dealt.indexOf(random) >= 0) {
								random = Math.floor((Math.random() * ((max + 1) - min)) + min);
							}
							p0.hand.add(deck[random]);
							game.deck.remove(deck[random].id);
							dealt.push(random);
						} // end dealing
						// Now assign top card
						while (dealt.indexOf(random) >= 0) {
							random = Math.floor((Math.random() * ((max + 1) - min)) + min);
						}
						game.topCard = deck[random];
						game.deck.remove(deck[random].id);
						dealt.push(random);
						// Then assign secon card
						while (dealt.indexOf(random) >= 0) {
							random = Math.floor((Math.random() * ((max + 1) - min)) + min);
						}
						game.secondCard = deck[random];
						game.deck.remove(deck[random].id);
						dealt.push(random);		
						
					/////////////////////////////////////////////////////////////////
					// ADD CARDS TO POINTS, AND ATTACHMENTS TO TEST POPULATEGAME() //
					/////////////////////////////////////////////////////////////////

					// p0.points.add([deck[0].id, deck[1].id, deck[3].id]);
					// p1.points.add([deck[4].id, deck[5].id]);
					// deck[0].attachments.add(deck[2].id);
					// deck[0].save();

						return Promise.resolve([game, p0, p1]);
					})
					.then(function save (values) {
						var saveGame = gameService.saveGame({game: game})
						var saveP0 = userService.saveUser({user: values[1]});
						var saveP1 = userService.saveUser({user: values[2]});
						return Promise.all([saveGame, saveP0, saveP1]);
					})
					.then(function getPopulatedGame (values) {
						return gameService.populateGame({gameId: values[0].id});
					})
					.then(function publish (fullGame) {
						Game.publishUpdate(fullGame.id, {change: "Initialize", game: fullGame});
						return Promise.resolve(fullGame);
					})
					.catch(function failedToDeal (err) {
						return Promise.reject(err);
					});
				// If this player is first to be ready, save and respond
				} else {
					return new Promise(function save (resolveSave, rejectSave) {
						var saveGame = gameService.saveGame({game: game});
						var saveUser = userService.saveUser({user: user});
						return Promise.all([saveGame, saveUser]);
					});
				}

			}) //End foundRecords
			.then(function respond (values) {
				res.ok();
				return Promise.resolve(values);
			})
			.catch(function failed (err) {
				return res.badRequest(err);
			});



		} else {
			var err = new Error("Missing game or player id");
			return res.badRequest(err);
		}
	},

	draw: function (req, res) {
		// console.log("\nDrawing Card for p" + req.session.pNum + " in game: " + req.session.game);
		var pGame = gameService.findGame({gameId: req.session.game})
		.then(function checkTurn (game) {
			if (req.session.pNum === game.turn % 2) {
				return Promise.resolve(game);
			} else {
				return Promise.reject(new Error("It's not your turn."));
			}
		});

		var pUser = userService.findUser({userId: req.session.usr})
		.then(function handLimit (user) {
			if (user.hand.length < 8) {
				return Promise.resolve(user);
			} else {
				return Promise.reject(new Error("You are at the hand limit; you cannot draw."));
			}
		});

		// Make changes after finding records
		Promise.all([pGame, pUser])
		.then(function changeAndSave (values) {
			var game = values[0], user=values[1];
			user.hand.add(game.topCard.id);
			game.topCard = game.secondCard;
			var min = 0;
			var max = game.deck.length;
			var random = Math.floor((Math.random() * ((max + 1) - min)) + min);
			game.secondCard = game.deck[random];
			game.deck.remove(game.deck[random].id);	
			game.log.push("Player " + user.pNum + " Drew a card");
			game.turn++;
			var saveGame = gameService.saveGame({game: game})		;
			var saveUser = userService.saveUser({user: user});
			return Promise.all([saveGame, saveUser]);

		}) //End changeAndSave
		.then(function getPopulatedGame (values) {
			var game = values[0], user=values[1];
			return gameService.populateGame({gameId: game.id});
		}) //End getPopulatedGame
		.then(function publishAndRespond (fullGame) {
			Game.publishUpdate(fullGame.id,
				{
					change: 'draw',
					game: fullGame
				}
			);
			return res.ok();
		}) //End publishAndRespond
		.catch(function failed (err) {
			return res.badRequest(err);
		});
	},

	points: function (req, res) {
		var promiseGame = gameService.findGame({gameId: req.session.game});
		var promisePlayer = userService.findUser({userId: req.session.usr});
		var promiseCard = cardService.findCard({cardId: req.body.cardId});
		Promise.all([promiseGame, promisePlayer, promiseCard])
		.then(function changeAndSave (values) {
			var game = values [0], player = values[1], card = values[2];
			if (game.turn % 2 === player.pNum) {
				if (card.hand === player.id) {
					if (card.rank <= 10) {
						// Move is legal; make changes
						player.points.add(card.id);
						player.hand.remove(card.id);
						game.log.push("Player " + player.pNum + " played the " + card.name + " for points");
						game.turn++;
						var saveGame = gameService.saveGame({game: game});
						var savePlayer = userService.saveUser({user: player});
						return Promise.all([saveGame, savePlayer]);
					} else {
						return Promise.reject(new Error("You can only play a number card as points."));
					}
				} else {
					return Promise.reject(new Error("You can only play a card that is in your hand."));
				}
			} else {
				return Promise.reject(new Error("It's not your turn."));
			}
		})
		.then(function populateGame (values) {
			var game = values[0];
			return gameService.populateGame({gameId: game.id});
		})
		.then(function publishAndRespond (fullGame) {
			// var game = values[0], victory = values[1];
			var victory = gameService.checkWinGame({game: fullGame});
			Game.publishUpdate(fullGame.id, {
				change: "points",
				game: fullGame,
				victory: victory
			});
			return res.ok();
		})
		.catch(function failed (err) {
			return res.badRequest(err);
		});
	},

	runes: function (req, res) {
		var promiseGame = gameService.findGame({gameId: req.session.game});
		var promisePlayer = userService.findUser({userId: req.session.usr});
		var promiseCard = cardService.findCard({cardId: req.body.cardId});
		Promise.all([promiseGame, promisePlayer, promiseCard])
		.then(function changeAndSave (values) {
			var game = values[0], player = values[1], card = values[2];
			console.log("\nplaying rune:");
			console.log(player);
			console.log(card);
			if (game.turn % 2 === player.pNum) {
				if (card.hand === player.id) {
					if ((card.rank >= 12 && card.rank <= 13) || card.rank === 8) {
						// Everything okay; make changes
						player.runes.add(card.id);
						player.hand.remove(card.id);
						game.log.push("Player " + player.pNum + " played the " + card.name + " as a rune");
						game.turn++;
						var saveGame = gameService.saveGame({game: game});
						var savePlayer = userService.saveUser({user: player});
						return Promise.all([saveGame, savePlayer]);
					} else {
						return Promise.reject(new Error("Only Kings, Queens, and Eights may be played as Runes without a target"));
					}
				} else {
					return Promise.reject(new Error("You can only play a card that is in your hand.") );
				}
			} else {
				return Promise.reject(new Error ("It's not your turn."));
			}
		})
		.then(function populateGame (values) {
			return gameService.populateGame({gameId: values[0].id});
		})
		.then(function publishAndRespond (fullGame) {
			var victory = gameService.checkWinGame({game: fullGame});
			Game.publishUpdate(fullGame.id, {
				change: "runes",
				game: fullGame,
				victory: victory
			});
			return res.ok();
		})
		.catch(function failed (err) {
			return res.badRequest(err);
		});
	},

	scuttle: function (req, res) {
		var promiseGame = gameService.findGame({gameId: req.session.game});
		var promisePlayer = userService.findUser({userId: req.session.usr});
		var promiseOpponent = userService.findUser({userId: req.body.opId});
		var promiseCard = cardService.findCard({cardId: req.body.cardId});
		var promiseTarget = cardService.findCard({cardId: req.body.targetId});
		Promise.all([promiseGame, promisePlayer, promiseOpponent, promiseCard, promiseTarget])
		.then(function changeAndSave (values) {
			var game = values[0], player = values[1], opponent = values[2], card = values[3], target = values[4];
			if (game.turn  % 2 === player.pNum) {
				if (card.hand === player.id) {
					if (target.points === opponent.id) {
						if (card.rank > target.rank || (card.rank === target.rank && card.suit > target.suit)) {
							// Everything is good; make changes
								// Remove attachments from target
							target.attachments.forEach(function (jackId) {
								target.attachments.remove(jackId);
								game.scrap.add(jackId);
							});
							game.scrap.add(target.id);
							game.scrap.add(card.id);
							opponent.points.remove(points.id);
							player.hand.remove(card.id);
							game.log.push("Player " + player.pNum + " scuttled Player " + opponent.pNum + "'s " + target.name + " with the " + card.name);
							game.turn++;
							// Save changes
							var saveGame = gameService.saveGame({game: game});
							var savePlayer = userService.saveUser({user: player});
							var saveOpponent = userService.saveUser({user: opponent});
							return Promise.all([saveGame, savePlayer, saveOpponent]);
						} else {
							return Promise.reject(new Error("You can only scuttle an opponent's point card with a higher rank point card, or the same rank with a higher suit. Suit order (low to high) is: Clubs < Diamonds < Hearts < Spades"));
						}
					} else {
						return Promise.reject(new Error("You can only scuttle a card your opponent has played for points"));
					}
				} else {
					return Promise.reject(new Error("You can only play a card that is in your hand"));
				}
			} else {
				return Promise.reject(new Error("It's not your turn."));
			}
		})
		.then(function populateGame (values) {
			return gameService.populateGame({gameId: values[0].id});
		})
		.then(function publishAndRespond (fullGame) {
			var victory = gameService.checkWinGame({game: fullGame});
			Game.publishUpdate(fullGame.id, {
				change: "scuttle",
				game: fullGame,
				victory: victory
			});
			return res.ok();
		})
		.catch(function failed (err) {
			return res.badRequest(err);
		});
	},

	populateGameTest: function (req, res) {
		console.log("\npopulate game test");
		var popGame = gameService.populateGame({gameId: req.session.game})
		.then(function gotPop(fullGame) {
			res.ok(fullGame);
		})
		.catch(function failed (err) {
			console.log(err);
			res.badRequest(err);
		});
	}
};

