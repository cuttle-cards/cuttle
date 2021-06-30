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
	///////////////////////////////////
	// Outside of Game Actions       //
	// (creating, connecting, etc.)  //
	///////////////////////////////////
	reconnect: function (req, res) {
		Game.subscribe(req, req.session.game);
		Game.watch(req);
		return res.ok();
	},
	create: function(req, res) {
		if (req.body.gameName) {
			var promiseCreateGame = gameAPI.createGame(req.body.gameName)
			.then(function (game) {
				Game.publishCreate({
					id: game.id,
					name: game.name,
					status: game.status,
					players: [],
				});
				return res.ok({gameId: game.id});
			}).catch(function (reason) {
				res.badRequest(reason);
			});
		}
	}, //End create()

	getList: function (req, res) {
		// HANDLE REQ.SESSION.GAME = GAME ID CASE
		Game.watch(req);
		if (req.session.game != null) {
			var promiseGame = gameService.populateGame({gameId: req.session.game})
			var promiseList = gameAPI.findOpenGames();
			Promise.all([promiseGame, promiseList])
			.then(function publishAndRespond (values) {
				var game = values[0], list = values[1];
				Game.subscribe(req, game.id);
				Game.publishUpdate(req.session.game,
					{
					change: 'Initialize',
					pNum: req.session.pNum,
					game: game,
					pNum: req.session.pNum
				});
				return res.ok({
					inGame: true,
					game: game,
					userId: req.session.usr,
					games: list
				});
			});
		} else {
			gameAPI.findOpenGames()
			.then(function success (games) {
				return res.send({
					inGame: false,
					games: games
				});
			})
			.catch(function failure (error) {
				return res.badRequest(error);
			});
		}
	}, //End getList()

	subscribe: function (req, res) {
		if (req.body.id) {
			Game.subscribe(req, req.body.id);
			var promiseClearOldGame = gameService.clearGame({userId: req.session.usr});
			var promiseGame = gameAPI.findGame(req.body.id);
			var promiseUser = userAPI.findUser(req.session.usr);
			Promise.all([promiseGame, promiseUser, promiseClearOldGame]).then(function success (arr) {
				// Catch promise values
				var game = arr[0];
				var user = arr[1];
				var pNum;
				if (game.players) {
					// Determine pNum of new player
					if (game.players.length === 0) {
						pNum = 0;
					} else {
						pNum = (game.players[0].pNum + 1) % 2;
						game.status = false;
						sails.sockets.blast("gameFull", {id: game.id});
					}
				} else {
					pNum = 0;
				}
				// Set session data
				req.session.game = game.id;
				req.session.pNum = pNum;
				// Update models
				user.pNum = pNum;
				game.players.add(user.id);
				var saveGame = gameService.saveGame({game: game});
				var savePlayer = userService.saveUser({user: user});
				return Promise.all([saveGame, savePlayer]);

			})
			.then(function respond (values) {
				var game = values [0];
				var user = values[1];
				// Socket announcement that player joined game
				sails.sockets.blast('join',
					{
						gameId: game.id,
						newPlayer: {email: user.email, pNum: user.pNum},
						newStatus: game.status,
					},
					req);
				// Respond with 200
				return res.ok({game: game, playerEmail: user.email, pNum: user.pNum});
			})
			.catch(function failure (error) {
				return res.badRequest(error);
			});
		} else {
			return res.badRequest("No game id received for subscription");
		}
	}, //End subscribe()

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
						game.p0Ready = !game.p0Ready;
						break;
					case 1:
						game.p1Ready = !game.p1Ready;
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
						// Then assign second card
						while (dealt.indexOf(random) >= 0) {
							random = Math.floor((Math.random() * ((max + 1) - min)) + min);
						}
						game.secondCard = deck[random];
						game.deck.remove(deck[random].id);
						dealt.push(random);

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
					var saveGame = gameService.saveGame({game: game});
					var saveUser = userService.saveUser({user: user});
					Game.publishUpdate(game.id,
					{
						change: 'ready',
						userId: user.id,
						pNum: user.pNum
					})
					return Promise.all([saveGame, saveUser]);
				}
			}) //End foundRecords
			.then(function respond (values) {
				return res.ok();
			})
			.catch(function failed (err) {
				return res.badRequest(err);
			});
		} else {
			var err = new Error("Missing game or player id");
			return res.badRequest(err);
		}
	}, //End ready()

	leaveLobby: function (req, res) {
		var promiseGame = gameService.findGame({gameId: req.session.game});
		var promisePlayer = userService.findUser({userId: req.session.usr});
		Promise.all([promiseGame, promisePlayer])
		.then(function changeAndSave (values) {
			var game = values[0], player = values[1];
			if (player.pNum === 0) {
				game.p0Ready = false;
			} else {
				game.p1Ready = false;
			}
			// Update models
			player.pNum = null;
			game.players.remove(player.id);
			game.status = true;

			// Unsubscribe user from updates to this game
			Game.unsubscribe(req, game.id);

			// Save changes
			var saveGame = gameService.saveGame({game: game});
			var savePlayer = userService.saveUser({user: player});
			return Promise.all([saveGame, savePlayer]);
		})
		.then(function publishAndRespond (values) {
			// Remove session data for game
			delete(req.session.game);
			delete(req.session.pNum);
			// Publish update to all users, then respond w/ 200
			sails.sockets.blast("leftGame", {id: values[0].id}, req);
			return res.ok();
		})
		.catch(function failed (err) {
			res.badRequest(err);
		});
	}, //End leaveLobby()


	/////////////////////
	// In-Game actions //
	// (plays, etc.)   //
	/////////////////////

	draw: function (req, res) {
		var pGame = gameService.findGame({gameId: req.session.game})
		.then(function checkTurn (game) {
			if (req.session.pNum === game.turn % 2) {
				if (game.topCard) {
					return Promise.resolve(game);
				} else {
					return Promise.reject(new Error("The deck is empty; you cannot draw"));
				}
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
			game.topCard = null;
			if (game.secondCard) {
				game.topCard = game.secondCard;
				if (game.deck.length > 0) {
					var min = 0;
					var max = game.deck.length - 1;
					var random = Math.floor((Math.random() * ((max + 1) - min)) + min);
					game.secondCard = game.deck[random];
					game.deck.remove(game.deck[random].id);
				} else {
					game.secondCard = null;
				}
			}
			user.frozenId = null;
			game.log.push(userService.truncateEmail(user.email) + " drew a card");
			game.turn++;
			var saveGame = gameService.saveGame({game: game});
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
	}, //End draw()

	// Pass turn to other player (when deck has run out)
	pass: function (req, res) {
		var promiseGame = gameService.findGame({gameId: req.session.game});
		var promisePlayer = userService.findUser({userId: req.session.usr});
		Promise.all([promiseGame, promisePlayer])
		.then(function changeAndSave (values) {
			var game = values[0], player = values[1];
			if ( (game.turn % 2) === player.pNum) {
				// Passing is only allowed if the deck is empty
				if (!game.topCard) {
					player.frozenId = null;
					game.turn++;
					game.passes++;
					game.log.push(userService.truncateEmail(player.email) + " passes.");
				} else {
					return Promise.reject(new Error("You can only pass when there are no cards in the deck"));
				}
				var saveGame = gameService.saveGame({game: game});
				var savePlayer = userService.saveUser({user: player});
				return Promise.all([saveGame, savePlayer]);
			} else {
				return Promise.reject(new Error("It's not your turn."));
			}
		})
		.then(function populateGame (values) {
			return Promise.all([gameService.populateGame({gameId: values[0].id}), values[0]])
		})
		.then(function publishAndRespond (values) {
			// populated game to send to client
			const game = values[0];
			// game model for saving updates
			const gameModel = values[1];
			// Game ends in stalemate if 3 passes are made consecutively
			var victory = {
				gameOver: false,
				winner: null
			};
			if (game.passes > 2) {
				victory.gameOver = true;
				gameModel.p0 = game.players[0];
				gameModel.p1 = game.players[1];
				gameModel.result = gameService.GameResult.STALEMATE;
				gameService.saveGame({game: gameModel});
			}
			Game.publishUpdate(game.id,
			{
				change: "pass",
				game: game,
				victory: victory
			});
			return res.ok();
		})
		.catch(function failed (err) {
			return res.badRequest(err);
		});
	}, //End pass()

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
							if (player.frozenId != card.id) {
								// Move is legal; make changes
								player.points.add(card.id);
								player.hand.remove(card.id);
								player.frozenId = null;
								game.log.push(userService.truncateEmail(player.email) + " played the " + card.name + " for points");
								game.passes = 0;
								game.turn++;
								var saveGame = gameService.saveGame({game: game});
								var savePlayer = userService.saveUser({user: player});
								return Promise.all([saveGame, savePlayer]);
							} else {
								return Promise.reject(new Error("That card is frozen! You must wait a turn to play it"));
							}
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
			return Promise.all([gameService.populateGame({gameId: game.id}), game]);
		})
		.then(function publishAndRespond (values) {
			const fullGame = values[0];
			const gameModel = values[1];
			var victory = gameService.checkWinGame({
				game: fullGame,
				gameModel,
			});
			Game.publishUpdate(fullGame.id, {
				change: "points",
				game: fullGame,
				victory: victory
			});
			// If the game is over, clean it up
			if (victory.gameOver) gameService.clearGame({userId: req.session.usr})
			return res.ok();
		})
		.catch(function failed (err) {
			return res.badRequest(err);
		});
	}, //End points()

	runes: function (req, res) {
		var promiseGame = gameService.findGame({gameId: req.session.game});
		var promisePlayer = userService.findUser({userId: req.session.usr});
		var promiseCard = cardService.findCard({cardId: req.body.cardId});
		Promise.all([promiseGame, promisePlayer, promiseCard])
		.then(function changeAndSave (values) {
			var game = values[0], player = values[1], card = values[2];
			if (game.turn % 2 === player.pNum) {
				if (card.hand === player.id) {
					if ((card.rank >= 12 && card.rank <= 13) || card.rank === 8) {
						if (player.frozenId != card.id) {
							// Everything okay; make changes
							player.runes.add(card.id);
							player.hand.remove(card.id);
							player.frozenId = null;
							let logEntry = userService.truncateEmail(player.email) + " played the " + card.name;
							if (card.rank === 8) {
								logEntry += ' as a Glasses Eight';
							}
							game.log.push(logEntry);
							game.passes = 0;
							game.turn++;
							var saveGame = gameService.saveGame({game: game});
							var savePlayer = userService.saveUser({user: player});
							return Promise.all([saveGame, savePlayer]);
						} else {
							return Promise.reject(new Error("That card is frozen! You must wait a turn to play it"));
						}
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
			return Promise.all([gameService.populateGame({gameId: values[0].id}), values[0]]);
		})
		.then(function publishAndRespond (values) {
			const fullGame = values[0];
			const gameModel = values[1];
			var victory = gameService.checkWinGame({
				game: fullGame,
				gameModel,
			});
			Game.publishUpdate(fullGame.id, {
				change: "runes",
				game: fullGame,
				victory: victory
			});
			// If the game is over, clean it up
			if (victory.gameOver) gameService.clearGame({userId: req.session.usr})
			return res.ok();
		})
		.catch(function failed (err) {
			return res.badRequest(err);
		});
	}, //End runes()

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
							if (player.frozenId != card.id) {
								// Move is legal; make changes
								// Remove attachments from target
								target.attachments.forEach(function (jack) {
									target.attachments.remove(jack.id);
									game.scrap.add(jack.id);
								});
								game.scrap.add(target.id);
								game.scrap.add(card.id);
								opponent.points.remove(target.id);
								player.hand.remove(card.id);
								player.frozenId = null;
								game.log.push(userService.truncateEmail(player.email) + " scuttled " + userService.truncateEmail(opponent.email) + "'s " + target.name + " with the " + card.name);
								game.passes = 0;
								game.turn++;
								// Save changes
								var saveGame = gameService.saveGame({game: game});
								var savePlayer = userService.saveUser({user: player});
								var saveOpponent = userService.saveUser({user: opponent});
								var saveTarget = cardService.saveCard({card: target});
								return Promise.all([saveGame, savePlayer, saveOpponent, saveTarget]);
							} else {
								return Promise.reject(new Error("That card is frozen! You must wait a turn to play it."));
							}
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
			return Promise.all([gameService.populateGame({gameId: values[0].id}), values[0]]);
		})
		.then(function publishAndRespond (values) {
			const fullGame = values[0];
			const gameModel = values[1];
			var victory = gameService.checkWinGame({
				game: fullGame,
				gameModel,
			});
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
	}, //End scuttle()

	jack: function (req, res) {
		var game = gameService.findGame({gameId: req.session.game});
		var player = userService.findUser({userId: req.session.usr});
		var opponent = userService.findUser({userId: req.body.opId});
		var card = cardService.findCard({cardId: req.body.cardId});
		var target = cardService.findCard({cardId: req.body.targetId});
		Promise.all([game, player, opponent, card, target])
		.then(function changeAndSave (values) {
			var game = values[0], player = values[1], opponent = values[2], card = values[3], target = values[4];
			if (game.turn % 2 === player.pNum) {
				if (card.hand === player.id) {
					if (card.rank === 11)  {
						if (target.points === opponent.id) {
							var queenCount = userService.queenCount({user: opponent});
							if (queenCount === 0) {
								if (player.frozenId != card.id) {
									// Everything good; change and save
									player.points.add(target.id); //This also removes card from opponent's points (foreign key is 1:1)
									player.hand.remove(card.id);
									player.frozenId = null;
									card.index = target.attachments.length;
									target.attachments.add(card.id);
									game.log.push(userService.truncateEmail(player.email) + " stole " + userService.truncateEmail(opponent.email) + "'s " + target.name + " with the " + card.name);
									game.passes = 0;
									game.turn++;
									var saveGame = gameService.saveGame({game: game});
									var savePlayer = userService.saveUser({user: player});
									var saveOpponent = userService.saveUser({user: opponent});
									var saveCard = cardService.saveCard({card: card});
									var saveTarget = cardService.saveCard({card: target});
									return Promise.all([saveGame, savePlayer, saveOpponent, saveCard, saveTarget]);
								} else {
									return Promise.reject(new Error("That card is frozen! You must wait a turn to play it"));
								}

							} else {
								return Promise.reject(new Error("You cannot use a Jack while your opponent has a Queen."));
							}
						} else {
							return Promise.reject(new Error("You can only play a Jack on an opponent's Point card."));
						}
					} else {
						return Promise.reject(new Error("You can only use a Jack to steal an opponent's Point card"));
					}
				} else {
					return Promise.reject(new Error("You can only play a card that is in your hand"));
				}
			} else {
				return Promise.reject(new Error("It's not your turn"));
			}
		}) //End changeAndSave()
		.then(function populateGame (values) {
			return Promise.all([gameService.populateGame({gameId: values[0].id}), values[0]]);
		})
		.then(function publishAndRespond (values) {
			const fullGame = values[0];
			const gameModel = values[1];
			var victory = gameService.checkWinGame({
				game: fullGame,
				gameModel,
			});
			Game.publishUpdate(fullGame.id,
			{
				change: 'jack',
				game: fullGame,
				victory: victory
			});
			// If the game is over, clean it up
			if (victory.gameOver) gameService.clearGame({userId: req.session.usr})
			return res.ok();
		})
		.catch(function failed (err) {
			return res.badRequest(err);
		});

	}, //End jack()

	// Play an untargeted one-off
	untargetedOneOff: function (req, res) {
		var promiseGame = gameService.findGame({gameId: req.session.game});
		var promisePlayer = userService.findUser({userId: req.session.usr});
		var promiseCard = cardService.findCard({cardId: req.body.cardId});
		var promiseOpponent = userService.findUser({userId: req.body.opId});
		Promise.all([promiseGame, promisePlayer, promiseCard, promiseOpponent])
		.then(function changeAndSave (values) {
			var game = values[0], player = values[1], card = values[2], opponent = values[3];
			if (game.turn % 2 === player.pNum) { //Check Turn
				if (!game.oneOff) { //Check that no other one-off is in play
					if (card.hand === player.id) { //Check that card was in hand
						switch (card.rank) {
							case 1:
							case 3:
							case 4:
							case 5:
							case 6:
							case 7:
								//Check for legality of move (edge cases, per one-off)
								switch (card.rank) {
									case 3:
										if (game.scrap.length < 1) return Promise.reject(new Error("You can only play a 3 as a one-off, if there are cards in the scrap pile"));
										break;
									case 4:
										if (opponent.hand.length === 0) return Promise.reject(new Error("You cannot play a 4 as a one-off while your opponent has no cards in hand"));
										break;
									case 5:
									case 7:
										if (!game.topCard) return Promise.reject(new Error("You can't play that card as a one-off, unless there are cards in the deck"));
										break;
									default:
										break;
								}
								if (player.frozenId != card.id) {
									game.oneOff = card;
									player.hand.remove(card.id);
									game.log.push(userService.truncateEmail(player.email) + " played the " + card.name + " as a one-off to" + card.ruleText);
									var saveGame = gameService.saveGame({game: game});
									var savePlayer = userService.saveUser({user: player});
									return Promise.all([saveGame, savePlayer]);
								} else {
									return Promise.reject(new Error("That card is frozen! You must wait a turn to play it"));
								}
							default:
								return Promise.reject(new Error("You cannot play that card as a one-off without a target."));
						}
					} else {
						return Promise.reject(new Error("You cannot play a card that is not in your hand"));
					}
				} else {
					return Promise.reject(new Error("There is already a one-off in play; You cannot play any card, except a two to counter."));
				}
			} else {
				return Promise.reject(new Error("It's not your turn"));
			}
		})
		.then(function populateGame (values) {
			return Promise.all([gameService.populateGame({gameId: values[0].id}), values[0]]);
		})
		.then(function publishAndRespond (values) {
			const fullGame = values[0];
			const gameModel = values[1];
			var victory = gameService.checkWinGame({
				game: fullGame,
				gameModel,
			});
			Game.publishUpdate(fullGame.id, {
				change: 'oneOff',
				game: fullGame,
				pNum: req.session.pNum,
				victory: victory
			});
			return res.ok();
		})
		.catch(function failed (err) {
			return res.badRequest(err);
		});
	}, //End untargetedOneOff()

	targetedOneOff: function (req, res) {
		var promiseGame = gameService.findGame({gameId: req.session.game});
		var promisePlayer = userService.findUser({userId: req.session.usr});
		var promiseOpponent = userService.findUser({userId: req.body.opId});
		var promiseCard = cardService.findCard({cardId: req.body.cardId});
		var promiseTarget = cardService.findCard({cardId: req.body.targetId});
		var promisePoint = null;
		var targetType = req.body.targetType;
		if (targetType === "jack") {
			promisePoint = cardService.findCard({cardId: req.body.pointId});
		} else {
			promisePoint = Promise.resolve(null);
		}
		Promise.all([promiseGame, promisePlayer, promiseOpponent, promiseCard, promiseTarget, Promise.resolve(targetType), promisePoint])
		.then(function changeAndSave (values) {
			var game = values[0], player = values[1], opponent = values[2], card = values[3], target = values[4], targetType = values[5], point = values[6];
			if (player.pNum === game.turn % 2) {
				if (!game.oneOff) {
					if (card.hand === player.id) {
						if (card.rank === 2 || card.rank === 9) {
							var queenCount = userService.queenCount({user: opponent});
							switch (queenCount) {
								case 0:
									break;
								case 1:
									if (target.runes === opponent.id && target.rank === 12) {
									} else {
										return Promise.reject(new Error("Your opponent's queen prevents you from targeting their other cards"))
									}
									break;
								default:
									return Promise.reject(new Error("You cannot play a Targeted One-Off (Two, Nine) when your opponent has more than one Queen"));
							}
							if (player.frozenId != card.id) {
								game.oneOff = card;
								player.hand.remove(card.id);
								game.oneOffTarget = target;
								game.oneOffTargetType = targetType;
								game.attachedToTarget = null;
								if (point) game.attachedToTarget = point;
								game.log.push(userService.truncateEmail(player.email) + " played the " + card.name + " as a " + card.ruleText + ", targeting the " + target.name);
								var saveGame = gameService.saveGame({game: game});
								var savePlayer = userService.saveUser({user: player});
								return Promise.all([saveGame, savePlayer]);
							} else {
								return Promise.reject(new Error("That card is frozen! You must wait a turn to play it"));
							}

						} else {
							return Promise.reject(new Error("You can only play a 2, or a 9 as targeted one-offs."));
						}
					} else {
						return Promise.reject(new Error("You cannot play a card that is not in your hand"));
					}
				} else {
					return Promise.reject(new Error("There is already a one-off in play; you cannot play any card, except a two to counter."));
				}
			} else {
				return Promise.reject(new Error("It's not your turn."));
			}
		}) //End changeAndSave()
		.then(function populateGame (values) {
			return Promise.all([gameService.populateGame({gameId: values[0].id}), values[0]]);
		})
		.then(function publishAndRespond (values) {
			const fullGame = values[0];
			const gameModel = values[1];
			var victory = gameService.checkWinGame({
				game: fullGame,
				gameModel,
			});
			Game.publishUpdate(fullGame.id,
			{
				change: 'targetedOneOff',
				game: fullGame,
				victory: victory,
				pNum: req.session.pNum
			});
			return res.ok();
		}) //End publishAndRespond
		.catch(function failed (err) {
			return res.badRequest(err);
		});
	}, //End targetedOneOff

	counter: function (req, res) {
		var promiseGame = gameService.findGame({gameId: req.session.game});
		var promisePlayer = userService.findUser({userId: req.session.usr});
		var promiseOpponent = userService.findUser({userId: req.body.opId});
		var promiseCard = cardService.findCard({cardId: req.body.cardId});
		Promise.all([promiseGame, promisePlayer, promiseOpponent, promiseCard])
		.then(function changeAndSave (values) {
			var game = values[0], player = values[1], opponent = values[2], card = values[3];

			var opHasQueen = false;
			opponent.runes.forEach(function (rune) {
				if (rune.rank === 12) opHasQueen = true;
			});
			if (card.hand === player.id) {
				if (game.oneOff) {
					if (card.rank === 2) {
						if (!opHasQueen) {
							if (game.twos.length > 0) {
								game.log.push(userService.truncateEmail(player.email) + " played the " + card.name + " to counter " + userService.truncateEmail(opponent.email) + "'s " + game.twos[game.twos.length - 1].name + ".");
							} else {
								game.log.push(userService.truncateEmail(player.email) + " played the " + card.name + " to counter " + userService.truncateEmail(opponent.email) + "'s " +  game.oneOff.name + ".");
							}
							game.twos.add(card.id);
							player.hand.remove(card.id);
							var saveGame = gameService.saveGame({game: game});
							var savePlayer = userService.saveUser({user: player});
							return Promise.all([saveGame, savePlayer]);
						} else {
							return (Promise.reject(new Error("You cannot counter your opponent's one-off while they have a Queen.")));
						}
					} else {
						return Promise.reject(new Error("You can only play a Two to counter a one-off"));
					}
				} else {
					return Promise.reject(new Error("You can only counter a one-off that is already in play"));
				}
			} else {
				return Promise.reject(new Error("You can only play a card that is in your hand"));
			}

		}) //End changeAndSave
		.then(function populateGame (values) {
			return Promise.all([gameService.populateGame({gameId: values[0].id}), values[0]]);
		})
		.then(function publishAndRespond (values) {
			const fullGame = values[0];
			const gameModel = values[1];
			var victory = gameService.checkWinGame({
				game: fullGame,
				gameModel,
			});
			Game.publishUpdate(fullGame.id,
			{
				change: "counter",
				game: fullGame,
				pNum: req.session.pNum,
				victory: victory,

			});
			return res.ok();
		})
		.catch(function failed (err) {
			return res.badRequest(err);
		});
	}, //End counter()

	resolve: function (req, res) {

		//Note: the player calling resolve is the opponent of the one playing the one-off, if it resolves
		var promiseGame = gameService.findGame({gameId: req.session.game});
		var promisePlayer = userService.findUser({userId: req.body.opId});
		var promiseOpponent = userService.findUser({userId: req.session.usr});
		var promisePlayerPoints = cardService.findPoints({userId: req.body.opId});
		var promiseOpPoints = cardService.findPoints({userId: req.session.usr});
		Promise.all([promiseGame, promisePlayer, promiseOpponent, promisePlayerPoints, promiseOpPoints])
		.then(function changeAndSave (values) {
			var game = values[0], player = values[1], opponent = values[2], playerPoints = values[3], opPoints = values[4];
			var happened = true;
			var cardsToSave = [];

			if (game.twos.length % 2 === 1) {
				// One of is countered
				opponent.frozenId = null;
				game.passes = 0;
				game.turn++;
				game.log.push("The " + game.oneOff.name + " is countered, and all cards played this turn are scrapped.");
				happened = false;
			} else {
				player.frozenId = null;
				// One Off will resolve; perform effect
				var cardsToSave = [];
				// handle different one-offs
				switch (game.oneOff.rank) {
					case 1:
						// Player's points
						if (playerPoints) {
							playerPoints.forEach(function (point) {
								// Remove jacks
								point.attachments.forEach(function (jack) {
									point.attachments.remove(jack.id);
									game.scrap.add(jack.id);
								});
								//Scrap points
								game.scrap.add(point.id);
								player.points.remove(point.id);
								cardsToSave.push(cardService.saveCard({card: point}));
							});
						}
						// Opponent's points
						if (opPoints) {
							opPoints.forEach(function (point) {
								// Remove jacks
								point.attachments.forEach(function (jack) {
									point.attachments.remove(jack.id);
									game.scrap.add(jack);
								});
								// Scrap points
								game.scrap.add(point.id);
								opponent.points.remove(point.id);
								cardsToSave.push(cardService.saveCard({card: point}));
							});
						}
						game.passes = 0;
						game.turn++;
						game.log.push("The " + game.oneOff.name + " one-off resolves; all point cards are scrapped.");
						break; //End resolve ACE
					case 2:
						game.log.push("The " + game.oneOff.name + " resolves; the " + game.oneOffTarget.name + " is scrapped.");
						game.scrap.add(game.oneOffTarget.id);
						switch (game.oneOffTargetType) {
							case 'rune':
								opponent.runes.remove(game.oneOffTarget.id);
								break;
							case 'jack':
								game.oneOffTarget.attachedTo = null;
								cardsToSave.push(cardService.saveCard({card: game.oneOffTarget}));
								player.points.add(game.attachedToTarget.id);
								game.oneOffTarget = null;
								game.attachedToTarget = null;
								break;
						} //End switch(oneOffTargetType)
						game.oneOffTargetType = null;
						game.oneOffTarget = null;
						game.passes = 0;
						game.turn++;
						break; //End resolve TWO
					case 3:
						game.resolving = game.oneOff;
						game.log.push("The " + game.oneOff.name + " one-off resolves; " + userService.truncateEmail(player.email) + " will draw one card of their choice from the Scrap pile");
						break;
					case 4:
						game.resolving = game.oneOff;
						game.log.push("The " + game.oneOff.name + " one-off resolves; " + userService.truncateEmail(opponent.email) + " must discard two cards");
						break;
					case 5:
						//Draw top card
						var handLen = player.hand.length;
						player.hand.add(game.topCard.id);
						game.topCard = null;
						if (handLen < 7) {
							//Draw second card, if it exists
							if (game.secondCard) {
								game.log.push("The " + game.oneOff.name + " one-off resolves; " + userService.truncateEmail(player.email) + " draws two cards.");
								player.hand.add(game.secondCard.id);
								game.secondCard = null;
								//Replace top card, if there's a card in deck
								if (game.deck.length > 0) {
									var min = 0;
									var max = game.deck.length - 1;
									var random = Math.floor((Math.random() * ((max + 1) - min)) + min);
									game.topCard = game.deck[random].id;
									game.deck.remove(game.deck[random].id);
									// Replace second card, if possible
									if (game.deck.length > 0) {
										min = 0;
										max = game.deck.length - 1;
										random = Math.floor((Math.random() * ((max + 1) - min)) + min);
										game.secondCard = game.deck[random].id;
										game.deck.remove(game.deck[random].id);
									}
								}
							} else {
								game.log.push("The " + game.oneOff.name + " one-off resolves; " + userService.truncateEmail(player.email) + " draws the last card.");
							}
						//Player could only draw one card, due to hand limit
						} else {
							// Replace top card with second card, if second card exists
							if (game.secondCard) {
								game.topCard = game.secondCard;
								var min = 0;
								var max = game.deck.length - 1;
								var random = Math.floor((Math.random() * ((max + 1) - min)) + min);
								game.topCard = game.deck[random].id;
								game.deck.remove(game.deck[random].id);
								// If more cards are left in deck, replace second card with card from deck
								if (game.deck.length > 0) {
									game.log.push("The " + game.oneOff.name + " one-off resolves; " + userService.truncateEmail(player.email) + " draws one card to reach the hand limit.");
									min = 0;
									max = game.deck.length - 1;
									random = Math.floor((Math.random() * ((max + 1) - min)) + min);
									game.secondCard = game.deck[random].id;
									game.deck.remove(game.deck[random].id);
									// Player draws last card in deck, to reach hand limit (only draws 1)
								} else {
									game.log.push("The " + game.oneOff.name + " one-off resolves; " + userService.truncateEmail(player.email) + " draws one card (last in deck) to reach the hand limit.");
								}
							}
						}
						game.passes = 0;
						game.turn++;
						break; //End resolve FIVE
					case 6:
						player.runes.forEach(function (rune) {
							game.scrap.add(rune.id);
							player.runes.remove(rune.id);
						});
						opponent.runes.forEach(function (rune) {
							game.scrap.add(rune.id);
							opponent.runes.remove(rune.id);
						});
						if (playerPoints) {
							playerPoints.forEach(function (point) {
								var jackCount = point.attachments.length;
								if (jackCount > 0) {
									point.attachments.forEach(function (jack) {
										game.scrap.add(jack.id);
										point.attachments.remove(jack.id);
										cardsToSave.push(cardService.saveCard({card: point}));
									});
									// If odd number of jacks were attached, switch control
									if (jackCount % 2 === 1) {
										opponent.points.add(point.id);
									}
								} //End jackCount > 0
							});
						}
						if (opPoints) {
							opPoints.forEach(function (point) {
								var jackCount = point.attachments.length;
								if (jackCount > 0) {
									point.attachments.forEach(function (jack) {
										game.scrap.add(jack.id);
										point.attachments.remove(jack.id);
										cardsToSave.push(cardService.saveCard({card: point}));
									});
									// If odd number of jacks were attached, switch control
									if (jackCount % 2 === 1) {
										//This switches the card to the other player's points
										player.points.add(point.id);
									}
								} //End jackCount > 0
							});
						}
						game.passes = 0;
						game.turn++;
						game.log.push("The " + game.oneOff.name + " resolves; all face cards are scrapped");
						break; //End resolve SIX
					case 7:
						game.resolving = game.oneOff;
						if (game.secondCard) {
							game.log.push("The " + game.oneOff.name + " resolves; they will play one card from the top two in the deck. Top two cards: " + game.topCard.name + " and " + game.secondCard.name);
						} else {
							game.log.push("The " + game.oneOff.name + " resolves. They will play the " + game.topCard.name + " as it is the last card in the deck");
						}
						break; //End resolve SEVEN
					case 9:
						opponent.hand.add(game.oneOffTarget.id);
						game.log.push("The " + game.oneOff.name + " resolves on the" + game.oneOffTarget.name + ". The " + game.oneOffTarget.name + " is returned to " + userService.truncateEmail(opponent.email) + "'s hand, and they may not play it next turn" );
						opponent.frozenId = game.oneOffTarget.id;
						switch(game.oneOffTargetType) {
							case 'rune':
								opponent.runes.remove(game.oneOffTarget.id);
								break;
							case 'point':
								// Remove jacks from targeted point (and scrap them)
								opPoints.forEach(function (point) {
									if (point.id === game.oneOffTarget.id) {
										point.attachments.forEach(function (jack) {
											game.scrap.add(jack.id);
											point.attachments.remove(jack.id);
										});
										cardsToSave.push(cardService.saveCard({card: point}));
									}
								});
								opponent.points.remove(game.oneOffTarget.id);
                game.oneOffTarget = null

								break;
							case 'jack':
								game.oneOffTarget.attachedTo = null;
								cardsToSave.push(cardService.saveCard({card: game.oneOffTarget}));
								player.points.add(game.attachedToTarget.id);
								game.oneOffTarget = null;
								game.attachedToTarget = null;
								break;
						}
						game.passes = 0;
						game.turn++;
						break; //End resolve NINE
				} //End switch on oneOff rank
			}
			var oneOff = game.oneOff;
			if (oneOff.rank != 3 || !happened) {
				game.scrap.add(game.oneOff.id);
				game.oneOff = null;
			}
			game.twos.forEach(function (two) {
				game.scrap.add(two.id);
				game.twos.remove(two.id);
			});
			var saveGame = gameService.saveGame({game: game});
			var savePlayer = userService.saveUser({user: player});
			var saveOpponent = userService.saveUser({user: opponent});
			return Promise.all([saveGame, Promise.resolve(oneOff), Promise.resolve(player.pNum), Promise.resolve(happened), savePlayer, saveOpponent].concat(cardsToSave));
		}) //End changeAndSave
		.then(function populateGame (values) {
			return Promise.all([gameService.populateGame({gameId: values[0].id}), Promise.resolve(values[1]), Promise.resolve(values[2]), Promise.resolve(values[3]), values[0]]);
		})
		.then(function publishAndRespond (values) {
			const fullGame = values[0], oneOff = values[1];
			var pNum = values[2];
			var happened = values[3];
			var gameModel = values[4];
			var victory = gameService.checkWinGame({
				game: fullGame,
				gameModel,
			});

			Game.publishUpdate(fullGame.id,
			{
				change: "resolve",
				oneOff: oneOff,
				game: fullGame,
				victory: victory,
				playedBy: pNum,
				happened: happened
			});
			// If the game is over, clean it up
			if (victory.gameOver) gameService.clearGame({userId: req.session.usr})
			return res.ok();
		})
		.catch(function failed (err) {
			return res.badRequest(err);
		});
	}, //End resolve()

	resolveFour: function (req, res) {
		var promiseGame = gameService.findGame({gameId: req.session.game});
		var promisePlayer = userService.findUser({userId: req.session.usr});
		var promiseCard1 = cardService.findCard({cardId: req.body.cardId1});
		if ( req.body.hasOwnProperty("cardId2") ) {
			var promiseCard2 = cardService.findCard({cardId: req.body.cardId2});
		} else {
			var promiseCard2 = Promise.resolve(null);
		}
		Promise.all([promiseGame, promisePlayer, promiseCard1, promiseCard2])
		.then(function changeAndSave (values) {
			var game = values[0], player = values[1], card1 = values[2], card2 = values[3];
			game.scrap.add(card1.id);
			player.hand.remove(card1.id);
			if (card2 != null) {
				game.scrap.add(card2.id);
				player.hand.remove(card2.id);
				game.log.push(userService.truncateEmail(player.email) + " discarded the " + card1.name + " and the " + card2.name + ".");
			} else {
				game.log.push(userService.truncateEmail(player.email) + " discarded the " + card1.name + ".");
			}
			game.passes = 0;
			game.turn++;
			game.resolving = null;
			var saveGame = gameService.saveGame({game: game});
			var savePlayer = userService.saveUser({user: player});
			return Promise.all([saveGame, savePlayer]);
		}) // End changeAndSave
		.then(function populateGame (values) {
			return Promise.all([gameService.populateGame({gameId: values[0].id}), values[0]]);
		})
		.then(function publishAndRespond (values) {
			const fullGame = values[0];
			const gameModel = values[1];
			var victory = gameService.checkWinGame({
				game: fullGame,
				gameModel,
			});
			Game.publishUpdate(fullGame.id,
			{
				change: "resolveFour",
				game: fullGame,
				victory: victory
			});
			return res.ok();
		})
		.catch(function failed (err) {
			return res.badRequest(err);
		})
	}, //End resolveFour()

	resolveThree: function (req, res) {
		var promiseGame = gameService.findGame({gameId: req.session.game});
		var promisePlayer = userService.findUser({userId: req.session.usr});
		var promiseCard = cardService.findCard({cardId: req.body.cardId});
		Promise.all([promiseGame, promisePlayer, promiseCard])
		.then(function changeAndSave (values) {
			var game = values[0], player = values[1], card = values[2];
			player.hand.add(card.id);
			player.frozenId = null;
			game.scrap.remove(card.id);
			game.scrap.add(game.oneOff.id);
			game.oneOff = null;
			game.log.push(userService.truncateEmail(player.email) + " took the " + card.name + " from the scrap pile to their hand");
			game.passes = 0;
			game.turn++;
			game.resolving = null;
			//Save changes
			var saveGame = gameService.saveGame({game: game});
			var savePlayer = userService.saveUser({user: player});
			return Promise.all([saveGame, savePlayer]);
		})
		.then(function populateGame (values) {
			return Promise.all([gameService.populateGame({gameId: values[0].id}),values[0]]);
		})
		.then(function publishAndRespond (values) {
			const fullGame = values[0];
			const gameModel = values[1];
			var victory = gameService.checkWinGame({
				game: fullGame,
				gameModel,
			});
			Game.publishUpdate(fullGame.id,
			{
				change: 'resolveThree',
				game: fullGame,
				victory: victory
			});
			return res.ok();
		})
		.catch(function failed (err) {
			return res.badRequest(err);
		});
	}, //End resolveThree()

	/*
	***Seven-Resolution Plays
	*/
	sevenPoints: function (req, res) {
		var promiseGame = gameService.findGame({gameId: req.session.game});
		var promisePlayer = userService.findUser({userId: req.session.usr});
		var promiseCard = cardService.findCard({cardId: req.body.cardId});
		Promise.all([promiseGame, promisePlayer, promiseCard])
		.then(function changeAndSave (values) {
			var game = values[0], player = values[1], card = values[2];
			if (game.turn % 2 === player.pNum) {
				if (game.topCard.id === card.id || game.secondCard.id === card.id) {
					if (card.rank < 11) {
						player.points.add(card.id);
						player.frozenId = null;
						game = gameService.sevenCleanUp({game: game, index: req.body.index});
						game.log.push(userService.truncateEmail(player.email) + " played the " + card.name + " off the top of the deck as points");
						game.passes = 0;
						game.turn++;
						game.resolving = null;
						var saveGame = gameService.saveGame({game: game})					;
						var savePlayer = userService.saveUser({user: player});
						return Promise.all([saveGame, savePlayer]);
					} else {
						return Promise.reject(new Error("You can only play Ace - Ten cards as points"));
					}
				} else {
					return Promise.reject(new Error("You must pick a card from the deck to play when resolving a seven"));
				}
			} else {
				return Promise.reject(new Error("It's not your turn"));
			}
		})
		.then(function populateGame (values) {
			return Promise.all([gameService.populateGame({gameId: values[0].id}), values[0]]);
		})
		.then(function publishAndRespond (values) {
			const fullGame = values[0];
			const gameModel = values[1];
			var victory = gameService.checkWinGame({
				game: fullGame,
				gameModel,
			});
			Game.publishUpdate(fullGame.id,
			{
				change: 'sevenPoints',
				game: fullGame,
				victory: victory
			});
			// If the game is over, clean it up
			if (victory.gameOver) gameService.clearGame({userId: req.session.usr})
			return res.ok();
		})
		.catch(function failed (err) {
			return res.badRequest(err);
		});
	}, //End sevenPoints

	sevenRunes: function (req, res) {
		var promiseGame = gameService.findGame({gameId: req.session.game});
		var promisePlayer = userService.findUser({userId: req.session.usr});
		var promiseCard = cardService.findCard({cardId: req.body.cardId});
		Promise.all([promiseGame, promisePlayer, promiseCard])
		.then(function changeAndSave (values) {
			var game = values[0], player = values[1], card = values[2];
			if (game.turn % 2 === player.pNum) {
				if (game.topCard.id === card.id || game.secondCard.id === card.id) {
					if (card.rank === 12 || card.rank === 13 || card.rank === 8) {
						player.runes.add(card.id);
						player.frozenId = null;
						game = gameService.sevenCleanUp({game: game, index: req.body.index});
						game.log.push(userService.truncateEmail(player.email) + " played the " + card.name + " off the top of the deck, as a rune");
						game.passes = 0;
						game.turn++;
						game.resolving = null;
						var saveGame = gameService.saveGame({game: game});
						var savePlayer = userService.saveUser({user: player});
						return Promise.all([saveGame, savePlayer]);
					} else {
						return Promise.reject(new Error("You can only play Kings, Queens, and Eights as runes, without a TARGET"));
					}
				} else {
					return Promise.reject(new Error("You must pick a card from the deck to play when resolving a seven"));
				}
			} else {
				return Promise.reject(new Error("It's not your turn"));
			}
		})
		.then(function populateGame (values) {
			return Promise.all([gameService.populateGame({gameId: values[0].id}), values[0]]);
		})
		.then(function publishAndRespond (values) {
			const fullGame = values[0];
			const gameModel = values[1];
			var victory = gameService.checkWinGame({
				game: fullGame,
				gameModel,
			});
			Game.publishUpdate(fullGame.id,
			{
				change: 'sevenRunes',
				game: fullGame,
				victory: victory
			});
			// If the game is over, clean it up
			if (victory.gameOver) gameService.clearGame({userId: req.session.usr})
			return res.ok();
		})
		.catch(function failed (err) {
			return res.badRequest(err);
		});
	}, //End sevenRunes

	sevenScuttle: function (req, res) {
		var promiseGame = gameService.findGame({gameId: req.session.game});
		var promisePlayer = userService.findUser({userId: req.session.usr});
		var promiseOpponent = userService.findUser({userId: req.body.opId});
		var promiseCard = cardService.findCard({cardId: req.body.cardId});
		var promiseTarget = cardService.findCard({cardId: req.body.targetId});
		Promise.all([promiseGame, promisePlayer, promiseOpponent, promiseCard, promiseTarget])
		.then(function changeAndSave (values) {
			var game = values[0], player = values[1], opponent = values[2], card = values[3], target = values[4];
			if (game.turn % 2 === player.pNum) {
				if (card.id === game.topCard.id || card.id === game.secondCard.id) {
					if (card.rank < 11) {
						if (target.points === opponent.id) {
							if (card.rank > target.rank || (card.rank === target.rank && card.suit > target.suit)) {
								// Move is legal; make changes
									// Remove attachments from target
								target.attachments.forEach(function (jack) {
									target.attachments.remove(jack.id);
									game.scrap.add(jack.id);
								});
								opponent.points.remove(target.id);
								player.hand.remove(card.id);
								player.frozenId = null;
								game.scrap.add(target.id);
								game.scrap.add(card.id);
								game = gameService.sevenCleanUp({game: game, index: req.body.index});
								game.log.push(userService.truncateEmail(player.email) + " scuttled " + userService.truncateEmail(opponent.email) + "'s " + target.name + " with the " + card.name + " from the top of the deck");
								game.passes = 0;
								game.turn++;
								game.resolving = null;
								var saveGame = gameService.saveGame({game: game});
								var savePlayer = userService.saveUser({user: player});
								var saveOpponent = userService.saveUser({user: opponent});
								var saveTarget = cardService.saveCard({card: target});
								return Promise.all([saveGame, savePlayer, saveOpponent, saveTarget]);
							} else {
								return Promise.reject(new Error("You can only scuttle if your card's rank is higher, or the rank is the same, and your suit is higher (Clubs < Diamonds < Hearts < Spades)"));
							}
						} else {
							return Promise.reject(new Error("You can only scuttle a card in your oppponent's points"));
						}
					} else {
						return Promise.reject(new Error("You can only scuttle with an ace through ten"));;
					}
				} else {
					return Promise.reject(new Error("You can only one of the top two cards from the deck while resolving a seven"));
				}
			} else {
				return Promise.reject(new Error("It's not your turn"));
			}
		}) //End changeAndSave()
		.then(function populateGame (values) {
			return Promise.all([gameService.populateGame({gameId: values[0].id}), values[0]]);
		})
		.then(function publishAndRespond (values) {
			const fullGame = values[0];
			const gameModel = values[1];
			var victory = gameService.checkWinGame({
				game: fullGame,
				gameModel,
			});
			Game.publishUpdate(fullGame.id,
			{
				change: 'sevenScuttle',
				game: fullGame,
				victory: victory
			});
			return res.ok();
		})
		.catch(function failed (err) {
			return res.badRequest(err);
		});
	}, //End sevenScuttle()

	sevenJack: function (req, res) {
		var promiseGame = gameService.findGame({gameId: req.session.game});
		var promisePlayer = userService.findUser({userId: req.session.usr});
		var promiseOpponent = userService.findUser({userId: req.body.opId});
		var promiseCard = cardService.findCard({cardId: req.body.cardId});
		var promiseTarget = req.body.targetId !== -1 ? cardService.findCard({cardId: req.body.targetId}) : -1; // -1 for double jacks with no points to steal special case
    let promises = [promiseGame, promisePlayer, promiseOpponent, promiseCard];
    if (promiseTarget !== -1) {
      promises.push(promiseTarget);
    }
		Promise.all(promises)
		.then(function changeAndSave (values) {
			var game = values[0], player = values[1], opponent = values[2], card = values[3], target;
      if (promiseTarget !== -1) target = values[4];
			if (game.turn % 2 === player.pNum) {
				if (card.id === game.topCard.id || card.id === game.secondCard.id) {
          if (!target){ // special case - seven double jacks with no points to steal
            game = gameService.sevenCleanUp({game: game, index: req.body.index});
            game.log.push(userService.truncateEmail(player.email) + " put " + card.name + " into scrap, since there is no point cards to steal on " + userService.truncateEmail(opponent.email) + "'s field");
            game.passes = 0;
            game.turn ++;
            game.resolving = null;
            game.scrap.add(card.id);
            var saveGame = gameService.saveGame({game: game});
            var savePlayer = userService.saveUser({user: player});
            return Promise.all([saveGame, savePlayer]);
          } else {
            var queenCount = userService.queenCount({user: opponent});
						switch (queenCount) {
							case 0:
								break;
							case 1:
								if (target.runes === opponent.id && target.rank === 12) {
								} else {
									return Promise.reject(new Error("Your opponent's queen prevents you from targeting their other cards"));
								}
								break;
							default:
								return Promise.reject(new Error("You cannot play a targeted one-off when your opponent has more than one Queen"));
						} //End queenCount validation
            // Normal sevens
            if (target.points === opponent.id) {
              if (card.rank === 11) {
                card.index = target.attachments.length;
                target.attachments.add(card.id);
                player.points.add(target.id);
                player.frozenId = null;
                game = gameService.sevenCleanUp({game: game, index: req.body.index});
                game.log.push(userService.truncateEmail(player.email) + " stole " + userService.truncateEmail(opponent.email) + "'s " + target.name + " with the " + card.name + " from the top of the deck");
                game.passes = 0;
                game.turn++;
                game.resolving = null;
                var saveGame = gameService.saveGame({game: game});
                var savePlayer = userService.saveUser({user: player});
                var saveTarget = cardService.saveCard({card: target});
                return Promise.all([saveGame, savePlayer, saveTarget]);
              } else {
                return Promise.reject(new Error("You can only steal your opponent's points with a jack"));
              }
            } else {
              return Promise.reject(new Error("You can only jack your opponent's point cards"));
            }
          }
				} else {
					return Promise.reject(new Error("You can only one of the top two cards from the deck while resolving a seven"));
				}
			} else {
				return Promise.reject(new Error("It's not your turn"));
			}
		})
		.then(function populateGame (values) {
			return Promise.all([gameService.populateGame({gameId: values[0].id}), values[0]]);
		})
		.then(function publishAndRespond (values) {
			const fullGame = values[0];
			const gameModel = values[1];
			var victory = gameService.checkWinGame({
				game: fullGame,
				gameModel,
			});
			Game.publishUpdate(fullGame.id,
			{
				change: 'sevenJack',
				game: fullGame,
				victory: victory
			});
			// If the game is over, clean it up
			if (victory.gameOver) gameService.clearGame({userId: req.session.usr})
			return res.ok();
		})
		.catch(function failed (err) {
			return res.badRequest(err);
		});
	}, //End sevenJack()

	sevenUntargetedOneOff: function (req, res) {
		var promiseGame = gameService.findGame({gameId: req.session.game});
		var promisePlayer = userService.findUser({userId: req.session.usr});
		var promiseCard = cardService.findCard({cardId: req.body.cardId});
		var promiseOpponent = userService.findUser({userId: req.body.opId});
		Promise.all([promiseGame, promisePlayer, promiseCard, promiseOpponent])
		.then(function changeAndSave (values) {
			var game = values[0], player = values[1], card = values[2], opponent = values[3];
			if (game.turn % 2 === player.pNum) {
				if (game.topCard.id === card.id || game.secondCard.id === card.id) {
					switch (card.rank) {
						case 1:
						case 3:
						case 4:
						case 5:
						case 6:
						case 7:
							switch (card.rank) {
								case 3:
									if (game.scrap.length === 0) return Promise.reject(new Error("You can only play a 3 ONE-OFF if there are cards in the scrap pile"));
									break;
								case 4:
									if (opponent.hand.length === 0) return Promise.reject(new Error("You cannot play a 4 as a one-off while your opponent has no cards in hand"));
									break;
								case 5:
								case 7:
									if (!game.topCard) return Promise.reject(new Error("You can only play a " + card.rank + " as a ONE-OFF if there are cards in the deck"))
									break;
							}
							// Move is legal; proceed
							game.resolving = null;
							game.oneOff = card;
							game = gameService.sevenCleanUp({game: game, index: req.body.index});
							game.log.push(userService.truncateEmail(player.email) + " played the " + card.name + " from the top of the deck as a " + card.ruleText);
							var saveGame = gameService.saveGame({game: game});
							var savePlayer = userService.saveUser({user: player});
							return Promise.all([saveGame, savePlayer]);
						default:
							return Promise.reject(new Error("You cannot play that card as a ONE-OFF without a target"));
					}
				} else {
					return Promise.reject(new Error("You can only play cards from the top of the deck while resolving a seven"));
				}
			} else {
				return Promise.reject(new Error("It's not your turn"));
			}
		})
		.then(function populateGame (values) {
			return Promise.all([gameService.populateGame({gameId: values[0].id}), values[0]]);
		})
		.then(function publishAndRespond (values) {
			const fullGame = values[0];
			const gameModel = values[1];
			var victory = gameService.checkWinGame({
				game: fullGame,
				gameModel,
			});
			Game.publishUpdate(fullGame.id,
			{
				change: 'sevenOneOff',
				game: fullGame,
				pNum: req.session.pNum,
				victory: victory
			});
			return res.ok();
		})
		.catch(function failed (err) {
			return res.badRequest(err);
		});
	}, //End sevenUntargetedOneOff()

	sevenTargetedOneOff: function (req, res) {
		var promiseGame = gameService.findGame({gameId: req.session.game});
		var promisePlayer = userService.findUser({userId: req.session.usr});
		var promiseOpponent = userService.findUser({userId: req.body.opId});
		var promiseCard = cardService.findCard({cardId: req.body.cardId});
		var promiseTarget = cardService.findCard({cardId: req.body.targetId});
		var promisePoint = null;
		var targetType = req.body.targetType;
		if (targetType === "jack") {
			promisePoint = cardService.findCard({cardId: req.body.pointId});
		} else {
			promisePoint = Promise.resolve(null);
		}
		Promise.all([promiseGame, promisePlayer, promiseOpponent, promiseCard, promiseTarget, Promise.resolve(targetType), promisePoint])
		.then(function changeAndSave (values) {
			var game = values[0], player = values[1], opponent = values[2], card = values[3], target = values[4], targetType = values[5], point = values[6];
			if (game.turn % 2 === player.pNum) {
				if (card.id === game.topCard.id || card.id === game.secondCard.id) {
					if (card.rank === 2 || card.rank === 9) {
						var queenCount = userService.queenCount({user: opponent});
						switch (queenCount) {
							case 0:
								break;
							case 1:
								if (target.runes === opponent.id && target.rank === 12) {
								} else {
									return Promise.reject(new Error("Your opponent's queen prevents you from targeting their other cards"));
								}
								break;
							default:
								return Promise.reject(new Error("You cannot play a targeted one-off when your opponent has more than one Queen"));
						} //End queenCount validation
							game.resolving = null;
							game.oneOff = card;
							game.oneOffTarget = target;
							game.oneOffTargetType = targetType;
							game.attachedToTarget = null;
							if (point) game.attachedToTarget = point;
							game.log.push(userService.truncateEmail(player.email) + " played the " + card.name + " as a " + card.ruleText + ", targeting the " + target.name);
							game = gameService.sevenCleanUp({game: game, index: req.body.index});
							var saveGame = gameService.saveGame({game: game});
							var savePlayer = userService.saveUser({user: player});
							return Promise.all([saveGame, savePlayer]);
					}
				} else {
					return Promise.reject(new Error("You can only play cards from the top of the deck while resolving a seven"));
				}
			} else {
				return Promise.reject(new Error("It's not your turn"));
			}
		})
		.then(function populateGame (values) {
			return Promise.all([gameService.populateGame({gameId: values[0].id}), values[0]]);
		})
		.then(function publishAndRespond (values) {
			const fullGame = values[0];
			const gameModel = values[1];
			var victory = gameService.checkWinGame({
				game: fullGame,
				gameModel,
			});
			Game.publishUpdate(fullGame.id,
			{
				change: 'sevenTargetedOneOff',
				game: fullGame,
				pNum: req.session.pNum,
				victory: victory
			});
			return res.ok();
		})
		.catch(function failed (err) {
			return res.badRequest(err);
		});
	}, //End sevenTargetedOneOff

	// Player requests to concede game
	concede: function (req, res) {
		return gameService.populateGame({gameId: req.session.game})
		.then(function clearGame (game) {
			return  Promise.all([Promise.resolve(game), gameService.clearGame({userId: req.session.usr})]);
		})
		.then(function publishAndRespond (values) {
			game = values[0];
			var victory = {
				gameOver: true,
				winner: (req.session.pNum + 1) % 2,
				conceded: true
			};
			Game.publishUpdate(game.id,
			{
				change: 'concede',
				game: game,
				victory: victory
			});
			return res.ok();
		}).catch(function failed (err) {
			return res.badRequest(err);
		});
	},

	gameOver: function (req, res) {
		var promisePlayer = userService.findUser({userId: req.session.usr})
		.then(function deleteSessionData (player) {
			Game.unsubscribe(req, req.session.game);
			delete(req.session.game);
			delete(req.session.pNum);
			return res.ok();
		}) //End changeAndSave
		.catch(function failed(err) {
			return res.badRequest(err);
		});
	},

	gameData: function (req, res) {
		var popGame = gameService.populateGame({gameId: req.session.game})
		.then(function gotPop(fullGame) {
			Game.subscribe(req, req.session.game);
			res.ok({'game': fullGame, 'pNum': req.session.pNum});
		})
		.catch(function failed (err) {
			console.log(err);
			res.badRequest(err);
		});
	},

	lobbyData: function (req, res) {
		gameService.findGame({gameId: req.session.game})
		.then(function sendResponse(game) {
			const players = [];
			if (game.players.length > 0) {
				players.push({email: game.players[0].email, pNum: 0});
				if (game.players.length > 1) {
					players.push({email: game.players[1].email, pNum: 1});
				}
			}
			const lobbyData = {
				id: game.id,
				players: players,
				p0Ready: game.p0Ready,
				p1Ready: game.p1Ready
			}
			return res.ok(lobbyData);
		})
		.catch(function failed (err) {
			return res.badRequest(err);
		});
	},

	chat: function (req, res) {
		var promiseGame = gameService.findGame({"gameId": req.session.game});
		var promisePlayer = userService.findUser({"userId": req.session.usr});
		return Promise.all([promiseGame, promisePlayer])
		.then(function changeAndSave (values) {
			var game = values [0], player = values[1];
			game.chat.push(userService.truncateEmail(player.email) + ": " + req.body.msg);
			return gameService.saveGame({game: game});
		})
		.then(function populateGame (game) {
			return gameService.populateGame({gameId: game.id});
		})
		.then(function publishAndRespond (game) {
			var victory = {
				gameOver: false,
				winner: null
			}
			 Game.publishUpdate(game.id,
			 {
			 	change: 'chat',
			 	game: game,
			 	victory: victory
			 });
			 return res.ok();
		})
		.catch(function failed (err) {
			console.log(err);
			res.badRequest(err);
		});

	},

	clearGame: function (req, res) {
		gameService.clearGame({userId: req.session.usr}).then(function postClear (result) {
			return res.ok();
		});
	},


	/////////////////////////////////////////
	// DEVELOPMENT ONLY - TESTING HELPERS //
	////////////////////////////////////////

	//Places card of choice on top of deck
	stackDeck: function (req, res) {
		var promiseGame = gameService.findGame({gameId: req.session.game})
		.then(function changeAndSave (game) {
			game.deck.add(game.topCard);
			game.topCard = req.body.cardId;
			game.deck.remove(req.body.cardId);
			return gameService.saveGame({game: game});
		})
		.then(function populateGame (game) {
			return gameService.populateGame({gameId: game.id});
		})
		.then(function publishUpdate (game) {
			Game.publishUpdate(game.id,
			{
				change: 'stackDeck',
				game: game,
			});
			return res.ok();
		})
		.catch(function failed (err) {
			console.log(err);
			return res.badRequest(err);
		});
	}, //End stackDeck

	deleteDeck: function (req, res) {
		var promiseGame = gameService.findGame({gameId: req.session.game})
		.then(function changeAndSave (game) {
			game.deck.forEach(function (card) {
				game.deck.remove(card.id);
				game.scrap.add(card.id);
			});
			return gameService.saveGame({game: game});
		})
		.then(function populateGame (game) {
			return gameService.populateGame({gameId: game.id});
		})
		.then(function publishUpdate (game) {
			Game.publishUpdate(game.id,
			{
				change: 'deleteDeck',
				game: game,
			})
			return res.ok();
		})
		.catch(function failed (err) {
			console.log(err);
			return res.badRequest(err);
		});
	}, //End deleteDeck

	loadFixture: async function(req, res) {
		let p0HandCardIds;
		let p1HandCardIds;
		let p0PointCardIds;
		let p1PointCardIds;
		let p0FaceCardIds;
		let p1FaceCardIds;
		let topCardId;
		let secondCardId;
    let scrapCardIds;
		let game;
		let p0;
		let p1;


		try {
			game = await Game.findOne({id: req.session.game});
			p0 = await User.findOne({id: req.body.p0Id}).populateAll();
			p1 = await User.findOne({id: req.body.p1Id}).populateAll();
			({
				p0HandCardIds,
				p1HandCardIds,
				p0PointCardIds,
				p1PointCardIds,
				p0FaceCardIds,
				p1FaceCardIds,
				topCardId,
				secondCardId,
				scrapCardIds
			} = req.body);
		}
		catch (err) {
			console.log('Error finding records to load fixture');
			console.log(err);
			return res.badRequest(err);
		}
		// Clear hands
		p0.hand.forEach((card) => {
			if (!p0HandCardIds.includes(card.id)) {
				p0.hand.remove(card.id);
				game.deck.add(card.id);
			}
		});
		p1.hand.forEach((card) => {
			if (!p1HandCardIds.includes(card.id)) {
				p1.hand.remove(card.id);
				game.deck.add(card.id);
			}
		});
		// P0 Hand
		p0HandCardIds.forEach((cardId) => {
			// Remove cards from wherever they are
			p0.points.remove(cardId);
			p0.runes.remove(cardId);
			p1.points.remove(cardId);
			p1.runes.remove(cardId);
			game.deck.remove(cardId);
			game.scrap.remove(cardId);
			// Add cards to p0's hand
			p0.hand.add(cardId);
		});
		// P1 Hand
		p1HandCardIds.forEach((cardId) => {
			// Remove cards from wherever they are
			p0.points.remove(cardId);
			p0.runes.remove(cardId);
			p1.points.remove(cardId);
			p1.runes.remove(cardId);
			game.deck.remove(cardId);
			game.scrap.remove(cardId);
			// Add cards to p1's hand
			p1.hand.add(cardId);
		});
		// P0 Points
		p0PointCardIds.forEach((cardId) => {
			// Remove cards from wherever they are
			p0.runes.remove(cardId);
			p0.hand.remove(cardId);
			p1.runes.remove(cardId);
			p1.hand.remove(cardId);
			game.deck.remove(cardId);
			game.scrap.remove(cardId);
			// Add cards to p0's points
			p0.points.add(cardId);
		});
		// P1 Points
		p1PointCardIds.forEach((cardId) => {
			// Remove cards from wherever they are
			p0.hand.remove(cardId);
			p0.runes.remove(cardId);
			p1.hand.remove(cardId);
			p1.runes.remove(cardId);
			game.deck.remove(cardId);
			game.scrap.remove(cardId);
			// Add cards to p1's points
			p1.points.add(cardId);
		});
		// P0 Face Cards
		p0FaceCardIds.forEach((cardId) => {
			// Remove cards from wherever they are
			p0.hand.remove(cardId);
			p0.points.remove(cardId);
			p1.hand.remove(cardId);
			p1.points.remove(cardId);
			game.deck.remove(cardId);
			game.scrap.remove(cardId);
			// Add cards to p0's face cards
			p0.runes.add(cardId);
		});
		// P1 Face Cards
		p1FaceCardIds.forEach((cardId) => {
			// Remove cards from wherever they are
			p0.hand.remove(cardId);
			p0.points.remove(cardId);
			p1.hand.remove(cardId);
			p1.points.remove(cardId);
			game.deck.remove(cardId);
			game.scrap.remove(cardId);
			// Add cards to p1's face cards
			p1.runes.add(cardId);
		});
		// Top & Second Cards
		if (topCardId) {
			p0.hand.remove(topCardId);
			p0.points.remove(topCardId);
			p0.runes.remove(topCardId);
			p1.hand.remove(topCardId);
			p1.points.remove(topCardId);
			p1.runes.remove(topCardId);
			game.deck.remove(topCardId);
			game.scrap.remove(topCardId);

			game.topCard = topCardId;
		}
		if (secondCardId) {
			p0.hand.remove(secondCardId);
			p0.points.remove(secondCardId);
			p0.runes.remove(secondCardId);
			p1.hand.remove(secondCardId);
			p1.points.remove(secondCardId);
			p1.runes.remove(secondCardId);
			game.deck.remove(secondCardId);
			game.scrap.remove(secondCardId);

			game.secondCard = secondCardId;
		}
    if (scrapCardIds) {
      scrapCardIds.forEach((cardId) => {
			  // Remove cards from wherever they ar
			  game.deck.remove(cardId);
			  // Add cards to scrap
			  game.scrap.add(cardId);
		  });
    }
		try {
			await Promise.all([game.save(), p0.save(), p1.save()])
			game = await gameService.populateGame({gameId: req.session.game});
		}
		catch (err) {
			console.log('error saving or populating game for update when loading fixture');
			console.log(err);
			return res.badRequest(err);
		}
		let replacedTopOrSecondCard = false;
		if (!game.topCard) {
			game.topCard = game.deck[0];
			game.deck.remove(game.deck[0]);
			replacedTopOrSecondCard = true;
		}
		if (!game.secondCard) {
			game.secondCard = game.deck[1];
			game.deck.remove(game.deck[0]);
			replacedTopOrSecondCard = true;
		}
		if (replacedTopOrSecondCard) {
			game = await game.save();
			game = await gameService.populateGame({gameId: req.session.game});
		}
		Game.publishUpdate(game.id,
			{
				change: 'loadFixture',
				game,
			}
		);
		return res.ok(game);
	},
};

