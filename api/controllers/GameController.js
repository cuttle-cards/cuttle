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
			var promiseGame = gameAPI.findGame(req.body.id);
			var promiseUser = userAPI.findUser(req.session.usr);
			Promise.all([promiseGame, promiseUser]).then(function success (arr) {
				// Catch promise values
				var game = arr[0];
				var user = arr[1];
				var pNum;
				if (game.players) {
					pNum = game.players.length;

					if (game.players.length === 1) {
						sails.sockets.blast("gameFull", {id: game.id});
						game.status = false;
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
				// Respond with 200
				var user = values[1];
				return res.ok({playerId: user.id});
			})
			.catch(function failure (error) {
				return res.badRequest(error);
			});
		} else {
			res.badRequest("No game id received for subscription");
		}
	}, //End subscribe()

	ready: function (req, res) {
		// console.log("\nReady");
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

	draw: function (req, res) {
		var pGame = gameService.findGame({gameId: req.session.game})
		.then(function checkTurn (game) {
			if (req.session.pNum === game.turn % 2) {
				if (game.topCard) {
					return Promise.resolve(game);
				} else {
					// TODO: Handle passing
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
					game.log.push("Player " + player.pNum + " passes.");
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
			return gameService.populateGame({gameId: values[0].id});
		})
		.then(function publishAndRespond (game) {
			// Game ends in stalemate if 3 passes are made consecutively
			var victory = {
				gameOver: false,
				winner: null
			};
			if (game.passes > 2) {
				console.log("Game is a stalemate");
				victory.gameOver = true
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
								game.log.push("Player " + player.pNum + " played the " + card.name + " for points");
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
							game.log.push("Player " + player.pNum + " played the " + card.name + " as a rune");
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
	}, //End rune()

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
								game.log.push("Player " + player.pNum + " scuttled Player " + opponent.pNum + "'s " + target.name + " with the " + card.name);
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
									game.log.push("Player " + player.pNum + " stole Player " + opponent.pNum + "'s " + target.name + " with the " + card.name);
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
			return gameService.populateGame({gameId: values[0].id});
		})
		.then(function publishAndRespond (fullGame) {
			var victory = gameService.checkWinGame({game: fullGame});
			Game.publishUpdate(fullGame.id,
			{
				change: 'jack',
				game: fullGame,
				victory: victory
			});
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
									game.log.push("Player " + player.pNum + " played the " + card.name + " as a " + card.ruleText);
									var saveGame = gameService.saveGame({game: game});
									var savePlayer = userService.saveUser({user: player});
									return Promise.all([saveGame, savePlayer]);
								} else {
									return Promise.reject(new Error("That card is frozen! You must wait a turn to play it"));
								}
								break;
							default:
							return Promise.reject(new Error("You cannot play that card as a one-off without a target."));
								break;
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
			return gameService.populateGame({gameId: values[0].id});
		})
		.then(function publishAndRespond (fullGame) {
			var victory = gameService.checkWinGame({game: fullGame});
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
										return Promise.reject(new Error("You may only TARGET your opponent's queen, while she has one."))
									}
									break;
								default:
									return Promise.reject(new Error("You cannot play a TARGETTED ONE-OFF when your opponent has more than one Queen"));
									break;
							}
							if (player.frozenId != card.id) {
								game.oneOff = card;
								player.hand.remove(card.id);
								game.oneOffTarget = target;
								game.oneOffTargetType = targetType;
								game.attachedToTarget = null;
								if (point) game.attachedToTarget = point;
								game.log.push("Player " + player.pNum + " played the " + card.name + " as a " + card.ruleText + ", targeting the " + target.name);							
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
			return gameService.populateGame({gameId: values[0].id})
		})
		.then(function publishAndRespond (fullGame) {
			var victory = gameService.checkWinGame({game: fullGame});
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
								var opPnum = (player.pNum + 1) % 2;
								if (game.twos.length > 0) {
									game.log.push("Player " + player.pNum + " played the " + card.name + " to COUNTER Player " + opPnum + "'s " + game.twos[game.twos.length - 1].name + ".");
								} else {
									game.log.push("Player " + player.pNum + " played the " + card.name + " to COUNTER Player " + opPnum + "'s " +  game.oneOff.name + ".");
								}
								game.twos.add(card.id);
								player.hand.remove(card.id);
								var saveGame = gameService.saveGame({game: game});
								var savePlayer = userService.saveUser({user: player});
								return Promise.all([saveGame, savePlayer]);
							} else {
								return (Promise.reject(new Error("You cannot COUNTER your opponent's one-off, if she has a QUEEN.")));
							}
						} else {
							return Promise.reject(new Error("You can only play a TWO to counter a one-off"));
						}
					} else {
						return Promise.reject(new Error("You can only counter a one-off that is already in play"));
					}
				} else {
					return Promise.reject(new Error("You can only play a card that is in your hand"));
				}

		}) //End changeAndSave
		.then(function populateGame (values) {
			return gameService.populateGame({gameId: values[0].id});
		})
		.then(function publishAndRespond (fullGame) {
			var victory = gameService.checkWinGame({game: fullGame});
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
						player.points.forEach(function (point) {
							game.scrap.add(point.id);
							player.points.remove(point.id);
						});
						opponent.points.forEach(function (point) {
							game.scrap.add(point.id);
							player.points.remove(point.id);
						});
						game.passes = 0;
						game.turn++;
						game.log.push("The " + game.oneOff.name + " one-off resolves; all POINT cards are destroyed.");
						break; //End resolve ACE
					case 2:
						game.log.push("The " + game.oneOff.name + " resolves; the " + game.oneOffTarget.name + " is DESTROYED.");
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
						game.log.push("The " + game.oneOff.name + " one-off resolves; player " + player.pNum + " will draw one card of her choice from the SCRAP pile");
						break;
					case 4:
						game.log.push("The " + game.oneOff.name + " one-off resolves; player " + opponent.pNum + " must discard two cards");
						break;
					case 5:
						//Draw top card
						var handLen = player.hand.length;
						player.hand.add(game.topCard.id);
						game.topCard = null;
						if (handLen < 7) {						
							//Draw second card, if it exists
							if (game.secondCard) {
								game.log.push("The " + game.oneOff.name + " one-off resolves; player " + player.pNum + " draws two cards.");
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
								game.log.push("The " + game.oneOff.name + " one-off resolves; player" + player.pNum + " draws the last card.");
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
									game.log.push("The " + game.oneOff.name + " one-off resolves; player " + player.pNum + " draws one card to reach the hand limit.");							
									min = 0;
									max = game.deck.length - 1;
									random = Math.floor((Math.random() * ((max + 1) - min)) + min);
									game.secondCard = game.deck[random].id;
									game.deck.remove(game.deck[random].id);		
									// Player draws last card in deck, to reach hand limit (only draws 1)
								} else {
									game.log.push("The " + game.oneOff.name + " one-off resolves; player " + player.pNum + " draws one card (last in deck) to reach the hand limit.")
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
							player.runes.remove(rune.id);
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
										// player.points.remove(point.id);
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
						game.log.push("The " + game.oneOff.name + " resolves; all RUNES are destroyed");					
						break; //End resolve SIX
					case 7:
						if (game.secondCard) {
							game.log.push("The " + game.oneOff.name + " resolves; she will choose one card from the top two in the deck, and play it however she likes. Top two cards: " + game.topCard.name + " and " + game.secondCard.name);
						} else {
							game.log.push("The " + game.oneOff.name + " resolves, but there is only one card in the deck; she will that card any way she likes");
						}
						break; //End resolve SEVEN
					case 9:
						opponent.hand.add(game.oneOffTarget.id);
						game.log.push("The " + game.oneOff.name + " resolves on the" + game.oneOffTarget.name + ". The " + game.oneOffTarget.name + " is returned to player " + opponent.pNum + "'s hand, and she may not play it next turn" );
						opponent.frozenId = game.oneOffTarget.id;
						switch(game.oneOffTargetType) {
							case 'rune':
								opponent.runes.remove(game.oneOffTarget.id);
								break;
							case 'point':
								opponent.points.remove(game.oneOffTarget.id);
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
			game.twos.forEach(function (two, index) {
				game.scrap.add(two.id);
				game.twos.remove(two.id);
			});
			var saveGame = gameService.saveGame({game: game});
			var savePlayer = userService.saveUser({user: player});
			var saveOpponent = userService.saveUser({user: opponent});
			return Promise.all([saveGame, Promise.resolve(oneOff), Promise.resolve(player.pNum), Promise.resolve(happened), savePlayer, saveOpponent].concat(cardsToSave));
		}) //End changeAndSave
		.then(function populateGame (values) {
			return Promise.all([gameService.populateGame({gameId: values[0].id}), Promise.resolve(values[1]), Promise.resolve(values[2]), Promise.resolve(values[3])]);
		})
		.then(function publishAndRespond (values) {
			var fullGame = values[0], oneOff = values[1];
			var pNum = values[2];
			var happened = values[3];
			var victory = gameService.checkWinGame({game: fullGame});
			Game.publishUpdate(fullGame.id, 
			{
				change: "resolve",
				oneOff: oneOff,
				game: fullGame,
				victory: victory,
				playedBy: pNum,
				happened: happened
			});
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
				game.log.push("Player " + player.pNum + " discarded the " + card1.name + " and the " + card2.name + ".");
			} else {
				game.log.push("Player " + player.pNum + " discarded the " + card1.name + ".");
			}
			game.passes = 0;
			game.turn++;
			var saveGame = gameService.saveGame({game: game});
			var savePlayer = userService.saveUser({user: player});
			return Promise.all([saveGame, savePlayer]);
		}) // End changeAndSave
		.then(function populateGame (values) {
			return gameService.populateGame({gameId: values[0].id});
		})
		.then(function publishAndRespond (fullGame) {
			var victory = gameService.checkWinGame({game: fullGame});
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
			game.log.push("Player " + player.pNum + " took the " + card.name + " from the scrap pile to her hand");
			game.passes = 0;
			game.turn++;
			//Save changes
			var saveGame = gameService.saveGame({game: game});
			var savePlayer = userService.saveUser({user: player});
			return Promise.all([saveGame, savePlayer]);
		})
		.then(function populateGame (values) {
			return gameService.populateGame({gameId: values[0].id});
		})
		.then(function publishAndRespond (fullGame) {
			var victory = gameService.checkWinGame({game: fullGame});
			Game.publishUpdate(fullGame.id,
			{
				change: 'resolveFour',
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
						game.log.push("Player " + player.pNum + " played the " + card.name + " off the top of the deck as points");
						game.passes = 0;
						game.turn++;	
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
			return gameService.populateGame({gameId: values[0].id});
		})
		.then(function publishAndRespond (fullGame) {
			var victory = gameService.checkWinGame({game: fullGame});
			Game.publishUpdate(fullGame.id,
			{
				change: 'sevenPoints',
				game: fullGame,
				victory: victory
			});
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
						game.log.push("Player " + player.pNum + " played the " + card.name + " off the top of the deck, as a rune");
						game.passes = 0;
						game.turn++;
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
			return gameService.populateGame({gameId: values[0].id});
		})
		.then(function publishAndRespond (fullGame) {
			var victory = gameService.checkWinGame({game: fullGame});
			Game.publishUpdate(fullGame.id,
			{
				change: 'sevenRunes',
				game: fullGame,
				victory: victory
			});
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
								game.log.push("Player " + player.pNum + " scuttled player " + opponent.pNum + "'s " + target.name + " with the " + card.name + " from the top of the deck");
								game.passes = 0;
								game.turn++;
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
			return gameService.populateGame({gameId: values[0].id});
		})
		.then(function publishAndRespond (fullGame) {
			var victory = gameService.checkWinGame({game: fullGame});
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
		var promiseTarget = cardService.findCard({cardId: req.body.targetId});
		Promise.all([promiseGame, promisePlayer, promiseOpponent, promiseCard, promiseTarget])
		.then(function changeAndSave (values) {
			var game = values[0], player = values[1], opponent = values[2], card = values[3], target = values[4];
			if (game.turn % 2 === player.pNum) {
				if (card.id === game.topCard.id || card.id === game.secondCard.id) {
					if (target.points === opponent.id) {
						if (card.rank === 11) {
							card.index = target.attachments.length;
							target.attachments.add(card.id);
							player.points.add(target.id);
							player.frozenId = null;
							game = gameService.sevenCleanUp({game: game, index: req.body.index});
							game.log.push("Player " + player.pNum + " stole player " + opponent.pNum + "'s " + target.name + " with the " + card.name + " from the top of the deck");
							game.passes = 0;
							game.turn++;
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
				} else {
					return Promise.reject(new Error("You can only one of the top two cards from the deck while resolving a seven"));
				}
			} else {
				return Promise.reject(new Error("It's not your turn"));
			}		
		})
		.then(function populateGame (values) {
			return gameService.populateGame({gameId: values[0].id});
		})
		.then(function publishAndRespond (fullGame) {
			var victory = gameService.checkWinGame({game: fullGame});
			Game.publishUpdate(fullGame.id,
			{
				change: 'sevenJack',
				game: fullGame,
				victory: victory
			});
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
		Promise.all([promiseGame, promisePlayer, promiseCard])		
		.then(function changeAndSave (values) {
			var game = values[0], player = values[1], card = values[2];
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
									break;
								case 5:
								case 7:
									if (!game.topCard) return Promise.reject(new Error("You can only play a " + card.rank + " as a ONE-OFF if there are cards in the deck"))
									break;
							}
							// Move is legal; proceed
							game.oneOff = card;
							game = gameService.sevenCleanUp({game: game, index: req.body.index});
							game.log.push("Player " + player.pNum + " played the " + card.name + " from the top of the deck as a " + card.ruleText);
							var saveGame = gameService.saveGame({game: game});
							var savePlayer = userService.saveUser({user: player});
							return Promise.all([saveGame, savePlayer]);
							break;
						default:
							return Promise.reject(new Error("You cannot play that card as a ONE-OFF without a target"));
							break;
					}
				} else {
					return Promise.reject(new Error("You can only play cards from the top of the deck while resolving a seven"));
				}
			} else {
				return Promise.reject(new Error("It's not your turn"));
			}
		})
		.then(function populateGame (values) {
			return gameService.populateGame({gameId: values[0].id});
		})
		.then(function publishAndRespond (fullGame) {
			var victory = gameService.checkWinGame({game: fullGame});
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
									return Promise.reject(new Error("You may only TARGET your opponent's queen, while she has one."))
								}
								break;
							default:
								return Promise.reject(new Error("You cannot play a TARGETTED ONE-OFF when your opponent has more than one Queen"));
								break;
						} //End queenCount validation		
							game.oneOff = card;
							game.oneOffTarget = target;
							game.oneOffTargetType = targetType;
							game.attachedToTarget = null;
							if (point) game.attachedToTarget = point;
							game.log.push("Player " + player.pNum + " played the " + card.name + " as a " + card.ruleText + ", targeting the " + target.name);							
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
			return gameService.populateGame({gameId: values[0].id});
		})
		.then(function publishAndRespond (fullGame) {
			var victory = gameService.checkWinGame({game: fullGame});
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
		var promiseGame = gameService.populateGame({gameId: req.session.game})
		.then(function publishAndRespond (game) {
			var victory = {
				gameOver: true,
				winner: (req.session.pNum + 1) % 2
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
		.then(function changeAndSave (player) {
			var ids = [];
			// Remove cards in hand
			for (i=0; i<player.hand.length; i++) {
				ids.push(player.hand[i].id);
			}
			ids.forEach(function (id) {
				player.hand.remove(id);
			});
			ids = [];
			// Remove cards in points
			for (i=0; i<player.points.length; i++) {
				ids.push(player.points[i].id);
			}
			ids.forEach(function (id) {
				player.points.remove(id);
			});
			ids = [];
			// Remove cards in runes
			for (i=0;i<player.runes.length; i++) {
				ids.push(player.runes[i].id)
			} 
			ids.forEach(function (id) {
				player.runes.remove(id);
			});
			delete(player.game);
			delete(player.pNum);
			// player.game = null;
			// player.pNum = null;
			player.frozenId = null;
			delete(req.session.game);
			delete(req.session.pNum);
			console.log(req.session);
			return userService.saveUser({user: player});
		}) //End changeAndSave
		.then(function respond (player) {
			return res.ok();
		})
		.catch(function failed(err) {
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
};

