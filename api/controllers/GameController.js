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
		Game.subscribe(req, [req.session.game]);
		sails.sockets.join(req, 'GameList');
		return res.ok();
	},
	create: function(req, res) {
		if (req.body.gameName) {
			gameAPI.createGame(req.body.gameName)
			.then(function (game) {
				sails.sockets.broadcast('GameList', 'gameCreated', {
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
		sails.sockets.join(req, 'GameList');
		if (req.session.game != null) {
			var promiseGame = gameService.populateGame({gameId: req.session.game})
			var promiseList = gameAPI.findOpenGames();
			Promise.all([promiseGame, promiseList])
			.then(function publishAndRespond (values) {
				var game = values[0], list = values[1];
				Game.subscribe(req, [game.id]);
				Game.publish([req.session.game],
					{
						verb: 'updated',
						data: {
							change: 'Initialize',
							pNum: req.session.pNum,
							game: game,
							pNum: req.session.pNum
						}
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
			Game.subscribe(req, [req.body.id]);
			const promiseClearOldGame = gameService.clearGame({userId: req.session.usr});
			const promiseGame = gameAPI.findGame(req.body.id);
			const promiseUser = userAPI.findUser(req.session.usr);
			Promise.all([promiseGame, promiseUser, promiseClearOldGame]).then(async function success (arr) {
				// Catch promise values
				const game = arr[0];
				const user = arr[1];
				let pNum;
				if (game.players) {
					// Determine pNum of new player
					if (game.players.length === 0) {
						pNum = 0;
					} else {
						pNum = (game.players[0].pNum + 1) % 2;
						await Game.updateOne({id: game.id})
							.set({
								status: false
							});
							// For respond() handler
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
				const addPlayerToGame = Game.addToCollection(game.id, 'players')
					.members([user.id])
				const updatePlayer = User.updateOne({id: user.id})
					.set({pNum});

				return Promise.all([game, updatePlayer, addPlayerToGame]);

			})
			.then(function respond (values) {
				const game = values [0];
				const user = values[1];
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
			const promiseGame = gameAPI.findGame(req.session.game);
			const promiseUser = userAPI.findUser(req.session.usr);
			Promise.all([promiseGame, promiseUser])
			// Assign player readiness
			.then(function foundRecords (values) {
				const game = values[0];
				const user = values[1];
				let pNum = user.pNum;
				let bothReady = false;
				const gameUpdates = {};
				switch (pNum) {
					case 0:
						gameUpdates.p0Ready = !game.p0Ready;
						if (game.p1Ready) {
							bothReady = true;
						}
						break;
					case 1:
						gameUpdates.p1Ready = !game.p1Ready;
						if (game.p0Ready) {
							bothReady = true;
						}
						break;
				}
				if (bothReady) {
					// Create Cards
					return new Promise(function makeDeck (resolveMakeDeck, rejectmakeDeck) {
						const findP0 = userService.findUser({userId: game.players[0].id});
						const findP1 = userService.findUser({userId: game.players[1].id});
						const data = [
							Promise.resolve(game), 
							findP0, 
							findP1
						];
						for (suit = 0; suit < 4; suit++) {
							for (rank = 1; rank < 14; rank++) {
								const promiseCard = cardService.createCard({
									gameId: game.id,
									suit,
									rank,
								});
								data.push(promiseCard);
							}
						};
						return resolveMakeDeck(Promise.all(data));
					})
					.then(function deal (values) {
						const [game, p0, p1, ...deck] = values;

						// Shuffle deck & map cards => thier ids
						const shuffledDeck = _.shuffle(deck)
							.map((card) => card.id);
						// Take 1st 5 cards for p0
						const dealToP0 = shuffledDeck.splice(0, 5);
						// Take next 6 cards for p1
						const dealToP1 = shuffledDeck.splice(0, 6);
						// Take next 2 cards for topcard & secondCard
						gameUpdates.topCard = shuffledDeck.shift();;
						gameUpdates.secondCard = shuffledDeck.shift();
						gameUpdates.lastEvent = {
							change: 'Initialize',
						};

						// Update records
						const updatePromises = [
							// Deal to p0
							User.replaceCollection(p0.id, 'hand')
								.members(dealToP0),
							// Deal to p1
							User.replaceCollection(p1.id, 'hand')
								.members(dealToP1),
							// Replace Deck
							Game.replaceCollection(game.id, 'deck')
								.members(shuffledDeck),
							// Other game updates
							Game.updateOne({id: game.id})
								.set(gameUpdates)
						];

						return Promise.all([
							game,
							p0,
							p1,
							...updatePromises
						]);
					})
					.then(function getPopulatedGame (values) {
						return gameService.populateGame({gameId: values[0].id});
					})
					.then(function publish (fullGame) {
						Game.publish([fullGame.id], {
							verb: 'updated',
							data: {
								change: 'Initialize',
								game: fullGame,
							}
						});
						return Promise.resolve(fullGame);
					})
					.catch(function failedToDeal (err) {
						return Promise.reject(err);
					});
				// If this player is first to be ready, save and respond
				} else {
					Game.publish([game.id], {
						verb: 'updated',
						data: {
							change: 'ready',
							userId: user.id,
							pNum: user.pNum,
						},
					});
					return Game.updateOne({id: game.id})
						.set(gameUpdates);
				}
			}) //End foundRecords
			.then(function respond (values) {
				return res.ok();
			})
			.catch(function failed (err) {
				return res.badRequest(err);
			});
		} else {
			const err = {message: "Missing game or player id"};
			return res.badRequest(err);
		}
	}, //End ready()

	leaveLobby: function (req, res) {
		const promiseGame = gameService.findGame({gameId: req.session.game});
		const promisePlayer = userService.findUser({userId: req.session.usr});
		Promise.all([promiseGame, promisePlayer])
		.then(function changeAndSave (values) {
			const [game, player] = values;
			const gameUpdates = {};
			const playerUpdates = {
				pNum: null
			};
			if (player.pNum === 0) {
				gameUpdates.p0Ready = false;
			} else {
				gameUpdates.p1Ready = false;
			}
			// Update models
			gameUpdates.status = true;

			// Unsubscribe user from updates to this game
			Game.unsubscribe(req, [game.id]);

			// Update records
			const updatePromises = [
				Game.updateOne({id: game.id})
					.set(gameUpdates),

				User.updateOne({id: player.id})
					.set(playerUpdates),

				Game.removeFromCollection(game.id, 'players')
					.members(player.id)
			];
			return Promise.all(updatePromises);
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
		const pGame = gameService.findGame({gameId: req.session.game})
		.then(function checkTurn (game) {
			if (req.session.pNum === game.turn % 2) {
				if (game.topCard) {
					return Promise.resolve(game);
				} else {
					return Promise.reject({message: "The deck is empty; you cannot draw"});
				}
			} else {
				return Promise.reject({message: "It's not your turn."});
			}
		});

		const pUser = userService.findUser({userId: req.session.usr})
		.then(function handLimit (user) {
			if (user.hand.length < 8) {
				return Promise.resolve(user);
			} else {
				return Promise.reject({message: "You are at the hand limit; you cannot draw."});
			}
		});

		// Make changes after finding records
		Promise.all([pGame, pUser])
		.then(function changeAndSave (values) {
			const [ game, user ] = values;
			const updatePromises = [
				game,
				User.addToCollection(user.id, 'hand')
					.members(game.topCard.id),
			];
			const gameUpdates = {
				topCard: null,
				log: [...game.log, userService.truncateEmail(user.email) + " drew a card"],
				turn: game.turn + 1,
				lastEvent: {
					change: 'draw',
				},
			};
			const userUpdates = {
				frozenId: null,
			};
			if (game.secondCard) {
				// Replace Top card if second card exists
				gameUpdates.topCard = game.secondCard.id;
				// Replace second card if deck isn't empty
				if (game.deck.length > 0) {
					const newSecondCard = _.sample(game.deck);
					gameUpdates.secondCard = newSecondCard.id;
					updatePromises.push(
						Game.removeFromCollection(game.id, 'deck')
							.members(newSecondCard.id)
					);
				} else {
					gameUpdates.secondCard = null;
				}
			}
			updatePromises.push(
				Game.updateOne({id: game.id})
					.set(gameUpdates),
				User.updateOne({id: user.id})
					.set(userUpdates)
			);

			return Promise.all(updatePromises);

		}) //End changeAndSave
		.then(function getPopulatedGame (values) {
			const game = values[0];
			return gameService.populateGame({gameId: game.id});
		}) //End getPopulatedGame
		.then(function publishAndRespond (fullGame) {
			Game.publish([fullGame.id], {
				verb: 'updated',
				data: {
					change: 'draw',
					game: fullGame,
				},
			});
			return res.ok();
		}) //End publishAndRespond
		.catch(function failed (err) {
			return res.badRequest(err);
		});
	}, //End draw()

	// Pass turn to other player (when deck has run out)
	pass: function (req, res) {
		const promiseGame = gameService.findGame({gameId: req.session.game});
		const promisePlayer = userService.findUser({userId: req.session.usr});
		return Promise.all([promiseGame, promisePlayer])
		.then(function changeAndSave (values) {
			const [ game, player ] = values;
			const playerUpdates = {};
			let gameUpdates = {
				turn: game.turn + 1,
				passes: game.passes + 1,
				log: [...game.log, `${userService.truncateEmail(player.email)} passess`],
			};
			const updatePromises = [];
			if ( (game.turn % 2) === player.pNum) {
				// Passing is only allowed if the deck is empty
				if (!game.topCard) {
					playerUpdates.frozenId = null;
					gameUpdates = {
						turn: game.turn + 1,
						passes: game.passes + 1,
						log: [...game.log, `${userService.truncateEmail(player.email)} passess`],
						lastEvent: {
							change: 'pass',
						}
					};
				} else {
					return Promise.reject({message: "You can only pass when there are no cards in the deck"});
				}
				updatePromises.push(
					Game.updateOne({id: game.id})
						.set(gameUpdates),
					User.updateOne({id: player.id})
						.set(playerUpdates)
				);
				return Promise.all([game, ...updatePromises]);
			} else {
				return Promise.reject({message: "It's not your turn."});
			}
		})
		.then(function populateGame (values) {
			const [ game ] = values;
			return gameService.populateGame({gameId: game.id});
		})
		.then(async function publishAndRespond (game) {
			const victory = {
				gameOver: false,
				winner: null
			};
			// Game ends in stalemate if 3 passes are made consecutively
			if (game.passes > 2) {
				victory.gameOver = true;
				const gameUpdates = {
					p0: game.players[0].id,
					p1: game.players[1].id,
					result: gameService.GameResult.STALEMATE,
				}
				await Game.updateOne({id: game.id})
					.set(gameUpdates);
				
				await gameService.clearGame({userId: req.session.usr})
			}
			Game.publish([game.id], {
				verb: 'updated',
				data: {
					change: 'pass',
					game,
					victory,
				},
			});
			return res.ok();
		})
		.catch(function failed (err) {
			return res.badRequest(err);
		});
	}, //End pass()

	points: function (req, res) {
		const promiseGame = gameService.findGame({gameId: req.session.game});
		const promisePlayer = userService.findUser({userId: req.session.usr});
		const promiseCard = cardService.findCard({cardId: req.body.cardId});
		Promise.all([promiseGame, promisePlayer, promiseCard])
		.then(function changeAndSave (values) {
			const [ game, player, card ] = values;

			if (game.turn % 2 === player.pNum) {
				if (card.hand === player.id) {
					if (card.rank <= 10) {
						if (player.frozenId != card.id) {
							// Move is legal; make changes
							const gameUpdates = {
								passes: 0,
								turn: game.turn + 1,
								log: [
									...game.log,
									`${userService.truncateEmail(player.email)} played the ${card.name} for points`
								],
								lastEvent: {
									change: 'points',
								},
							}
							const playerUpdates = {
								frozenId: null,
							};
							const updatePromises = [
								Game.updateOne({id: game.id})
									.set(gameUpdates),
								User.updateOne({id: player.id})
									.set(playerUpdates),
								User.removeFromCollection(player.id, 'hand')
									.members(card.id),
								User.addToCollection(player.id, 'points')
									.members(card.id),
							];
							return Promise.all([game, ...updatePromises]);
						} else {
							return Promise.reject({message: "That card is frozen! You must wait a turn to play it"});
						}
					} else {
						return Promise.reject({message: "You can only play a number card as points."});
					}
				} else {
					return Promise.reject({message: "You can only play a card that is in your hand."});
				}
			} else {
				return Promise.reject({message: "It's not your turn."});
			}
		})
		.then(function populateGame (values) {
			const game = values[0];
			return Promise.all([gameService.populateGame({gameId: game.id}), game]);
		})
		.then(async function publishAndRespond (values) {
			const fullGame = values[0];
			const gameModel = values[1];
			const victory = await gameService.checkWinGame({
				game: fullGame,
				gameModel,
			});
			Game.publish([fullGame.id], {
				verb: 'updated',
				data: {
					change: 'points',
					game: fullGame,
					victory,
				},
			});
			// If the game is over, clean it up
			if (victory.gameOver) await gameService.clearGame({userId: req.session.usr})
			return res.ok();
		})
		.catch(function failed (err) {
			return res.badRequest(err);
		});
	}, //End points()

	faceCard: function (req, res) {
		const promiseGame = gameService.findGame({gameId: req.session.game});
		const promisePlayer = userService.findUser({userId: req.session.usr});
		const promiseCard = cardService.findCard({cardId: req.body.cardId});
		Promise.all([promiseGame, promisePlayer, promiseCard])
		.then(function changeAndSave (values) {
			const [game, player, card] = values;
			if (game.turn % 2 === player.pNum) {
				if (card.hand === player.id) {
					if ((card.rank >= 12 && card.rank <= 13) || card.rank === 8) {
						if (player.frozenId != card.id) {
							// Everything okay; make changes

							let logEntry = userService.truncateEmail(player.email) + " played the " + card.name;
							if (card.rank === 8) {
								logEntry += ' as a Glasses Eight';
							}
							const gameUpdates = {
								turn: game.turn + 1,
								log: [...game.log, logEntry],
								passes: 0,
								lastEvent: {
									change: 'faceCard',
								},
							}

							const playerUpdates = {
								frozenId: null,
							}

							const updatePromises = [
								Game.updateOne({id: game.id})
									.set(gameUpdates),
								User.updateOne({id: player.id})
									.set(playerUpdates),
								User.removeFromCollection(player.id, 'hand')
									.members(card.id),
								User.addToCollection(player.id, 'faceCards')
									.members(card.id),
							];

							return Promise.all([game, ...updatePromises]);
						} else {
							return Promise.reject({message: "That card is frozen! You must wait a turn to play it"});
						}
					} else {
						return Promise.reject({message: "Only Kings, Queens, and Eights may be played as Face Cards without a target"});
					}
				} else {
					return Promise.reject({message: "You can only play a card that is in your hand."});
				}
			} else {
				return Promise.reject({message: "It's not your turn."});
			}
		})
		.then(function populateGame (values) {
			const game = values[0];
			return Promise.all([gameService.populateGame({gameId: game.id}), game]);
		})
		.then(async function publishAndRespond (values) {
			const fullGame = values[0];
			const gameModel = values[1];
			const victory = await gameService.checkWinGame({
				game: fullGame,
				gameModel,
			});
			Game.publish([fullGame.id], {
				verb: 'updated',
				data: {
					change: 'faceCard',
					game: fullGame,
					victory,
				},
			});
			// If the game is over, clean it up
			if (victory.gameOver) await gameService.clearGame({userId: req.session.usr});
			return res.ok();
		})
		.catch(function failed (err) {
			return res.badRequest(err);
		});
	}, //End faceCard()

	scuttle: function (req, res) {
		const promiseGame = gameService.findGame({gameId: req.session.game});
		const promisePlayer = userService.findUser({userId: req.session.usr});
		const promiseOpponent = userService.findUser({userId: req.body.opId});
		const promiseCard = cardService.findCard({cardId: req.body.cardId});
		const promiseTarget = cardService.findCard({cardId: req.body.targetId});
		Promise.all([promiseGame, promisePlayer, promiseOpponent, promiseCard, promiseTarget])
		.then(function changeAndSave (values) {
			const [ game, player, opponent, card, target ] = values;
			if (game.turn  % 2 === player.pNum) {
				if (card.hand === player.id) {
					if (target.points === opponent.id) {
						if (card.rank > target.rank || (card.rank === target.rank && card.suit > target.suit)) {
							if (player.frozenId != card.id) {
								// Move is legal; make changes
								const attachmentIds =  target.attachments.map(card => card.id);
								const logMessage = `${userService.truncateEmail(player.email)} scuttled 
									${userService.truncateEmail(opponent.email)}'s ${target.name} with the ${card.name}`;
								// Define update dictionaries
								const gameUpdates = {
									passes: 0,
									turn: game.turn + 1,
									log: [
										...game.log,
										logMessage,
									],
									lastEvent: {
										change: 'scuttle',
									}
								};
								const playerUpdates = {
									frozenId: null,
								};
								// Consolidate update promises into array
								const updatePromises = [
									// Include game record so it can be retrieved downstream
									game,
									// Updates to game record e.g. turn
									Game.updateOne(game.id)
										.set(gameUpdates),
									// Updates to player record i.e. frozenId
									User.updateOne(player.id)
										.set(playerUpdates),
									// Clear target's attachments
									Card.replaceCollection(target.id, 'attachments')
										.members([]),
									// Remove card from player's hand
									User.removeFromCollection(player.id, 'hand')
										.members([card.id]),
									// Remove target from opponent's points
									User.removeFromCollection(opponent.id, 'points')
										.members([target.id]),
									// Scrap cards
									Game.addToCollection(game.id, 'scrap')
										.members([
											...attachmentIds,
											card.id,
											target.id,
										]),
								];

								return Promise.all(updatePromises);
							} else {
								return Promise.reject({message: "That card is frozen! You must wait a turn to play it."});
							}
						} else {
							return Promise.reject({message: "You can only scuttle an opponent's point card with a higher rank point card, or the same rank with a higher suit. Suit order (low to high) is: Clubs < Diamonds < Hearts < Spades"});
						}
					} else {
						return Promise.reject({message: "You can only scuttle a card your opponent has played for points"});
					}
				} else {
					return Promise.reject({message: "You can only play a card that is in your hand"});
				}
			} else {
				return Promise.reject({message: "It's not your turn."});
			}
		})
		.then(function populateGame (values) {
			const [ game ] = values;
			return Promise.all([gameService.populateGame({gameId: game.id}), game]);
		})
		.then(async function publishAndRespond (values) {
			const fullGame = values[0];
			const gameModel = values[1];
			const victory = await gameService.checkWinGame({
				game: fullGame,
				gameModel,
			});
			Game.publish([fullGame.id], {
				verb: 'updated',
				data: {
					change: 'scuttle',
					game: fullGame,
					victory,
				},
			});
			return res.ok();
		})
		.catch(function failed (err) {
			return res.badRequest(err);
		});
	}, //End scuttle()

	jack: function (req, res) {
		const game = gameService.findGame({gameId: req.session.game});
		const player = userService.findUser({userId: req.session.usr});
		const opponent = userService.findUser({userId: req.body.opId});
		const card = cardService.findCard({cardId: req.body.cardId});
		const target = cardService.findCard({cardId: req.body.targetId});
		Promise.all([game, player, opponent, card, target])
		.then(function changeAndSave (values) {
			const [ game, player, opponent, card, target ] = values;
			if (game.turn % 2 === player.pNum) {
				if (card.hand === player.id) {
					if (card.rank === 11)  {
						if (target.points === opponent.id) {
							const queenCount = userService.queenCount({user: opponent});
							if (queenCount === 0) {
								if (player.frozenId != card.id) {
									// Valid move; change and save
									const gameUpdates = {
										log: [
											...game.log,
											`${userService.truncateEmail(player.email)} stole ${userService.truncateEmail(opponent.email)}'s ${target.name} with the ${card.name}`
										],
										turn: game.turn + 1,
										passes: 0,
										lastEvent: {
											change: 'jack',
										},
									};
									const playerUpdates = {
										frozenId: null,
									};
									const cardUpdates = {
										index: target.attachments.length,
									};
									const updatePromises = [
										Game.updateOne(game.id)
											.set(gameUpdates),
										User.updateOne(player.id)
											.set(playerUpdates),
										User.addToCollection(player.id, 'points')
											.members([target.id]),
										User.removeFromCollection(player.id, 'hand')
											.members([card.id]),
										Card.updateOne(card.id)
											.set(cardUpdates),
										Card.addToCollection(target.id, 'attachments')
											.members([card.id])
									];
									return Promise.all([game, ...updatePromises]);
								} else {
									return Promise.reject({message: "That card is frozen! You must wait a turn to play it"});
								}

							} else {
								return Promise.reject({message: "You cannot use a Jack while your opponent has a Queen."});
							}
						} else {
							return Promise.reject({message: "You can only play a Jack on an opponent's Point card."});
						}
					} else {
						return Promise.reject({message: "You can only use a Jack to steal an opponent's Point card"});
					}
				} else {
					return Promise.reject({message: "You can only play a card that is in your hand"});
				}
			} else {
				return Promise.reject({message: "It's not your turn"});
			}
		}) //End changeAndSave()
		.then(function populateGame (values) {
			const game = values[0];
			return Promise.all([gameService.populateGame({gameId: game.id}), game]);
		})
		.then(async function publishAndRespond (values) {
			const [ fullGame, gameModel ] = values;
			const victory = await gameService.checkWinGame({
				game: fullGame,
				gameModel,
			});

			Game.publish([fullGame.id], {
				verb: 'updated',
				data: {
					change: 'jack',
					game: fullGame,
					victory,
				},
			});
			// If the game is over, clean it up
			if (victory.gameOver) await gameService.clearGame({userId: req.session.usr})
			return res.ok();
		})
		.catch(function failed (err) {
			return res.badRequest(err);
		});

	}, //End jack()

	// Play an untargeted one-off
	untargetedOneOff: function (req, res) {
		const promiseGame = gameService.findGame({gameId: req.session.game});
		const promisePlayer = userService.findUser({userId: req.session.usr});
		const promiseCard = cardService.findCard({cardId: req.body.cardId});
		const promiseOpponent = userService.findUser({userId: req.body.opId});
		Promise.all([promiseGame, promisePlayer, promiseCard, promiseOpponent])
		.then(function changeAndSave (values) {
			const [ game, player, card, opponent ] = values;
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
										if (game.scrap.length < 1) return Promise.reject({message: "You can only play a 3 as a one-off, if there are cards in the scrap pile"});
										break;
									case 4:
										if (opponent.hand.length === 0) return Promise.reject({message: "You cannot play a 4 as a one-off while your opponent has no cards in hand"});
										break;
									case 5:
									case 7:
										if (!game.topCard) return Promise.reject({message: "You can't play that card as a one-off, unless there are cards in the deck"});
										break;
									default:
										break;
								}
								if (player.frozenId != card.id) {
									// Move was valid; update records
									const gameUpdates = {
										oneOff: card.id,
										log: [
											...game.log,
											`${userService.truncateEmail(player.email)} played the ${card.name} as a one-off to ${card.ruleText}`,
										],
										lastEvent: {
											change: 'oneOff',
											pNum: req.session.pNum,
										},
									};
									const updatePromises = [
										Game.updateOne(game.id)
											.set(gameUpdates),
										User.removeFromCollection(player.id, 'hand')
											.members([card.id]),
									];
									return Promise.all([game, ...updatePromises]);
								} else {
									return Promise.reject({message: "That card is frozen! You must wait a turn to play it"});
								}
							default:
								return Promise.reject({message: "You cannot play that card as a one-off without a target."});
						}
					} else {
						return Promise.reject({message: "You cannot play a card that is not in your hand"});
					}
				} else {
					return Promise.reject({message: "There is already a one-off in play; You cannot play any card, except a two to counter."});
				}
			} else {
				return Promise.reject({message: "It's not your turn"});
			}
		})
		.then(function populateGame (values) {
			return Promise.all([gameService.populateGame({gameId: values[0].id}), values[0]]);
		})
		.then(async function publishAndRespond (values) {
			const fullGame = values[0];
			const gameModel = values[1];
			const victory = await gameService.checkWinGame({
				game: fullGame,
				gameModel,
			});
			Game.publish([fullGame.id], {
				verb: 'updated',
				data: {
					change: 'oneOff',
					game: fullGame,
					pNum: req.session.pNum,
					victory,
				},
			});
			return res.ok();
		})
		.catch(function failed (err) {
			return res.badRequest(err);
		});
	}, //End untargetedOneOff()

	targetedOneOff: function (req, res) {
		const promiseGame = gameService.findGame({gameId: req.session.game});
		const promisePlayer = userService.findUser({userId: req.session.usr});
		const promiseOpponent = userService.findUser({userId: req.body.opId});
		const promiseCard = cardService.findCard({cardId: req.body.cardId});
		const promiseTarget = cardService.findCard({cardId: req.body.targetId});
		const targetType = req.body.targetType;
		let promisePoint = null;
		if (targetType === 'jack') {
			promisePoint = cardService.findCard({cardId: req.body.pointId});
		} else {
			promisePoint = Promise.resolve(null);
		}
		Promise.all([promiseGame, promisePlayer, promiseOpponent, promiseCard, promiseTarget, targetType, promisePoint])
		.then(function changeAndSave (values) {
			const [ game, player, opponent, card, target, targetType, point ] = values;
			// var game = values[0], player = values[1], opponent = values[2], card = values[3], target = values[4], targetType = values[5], point = values[6];
			if (player.pNum === game.turn % 2) {
				if (!game.oneOff) {
					if (card.hand === player.id) {
						if (card.rank === 2 || card.rank === 9) {
							const queenCount = userService.queenCount({user: opponent});
							switch (queenCount) {
								case 0:
									break;
								case 1:
									if (target.faceCards === opponent.id && target.rank === 12) {
									} else {
										return Promise.reject({message: "Your opponent's queen prevents you from targeting their other cards"});
									}
									break;
								default:
									return Promise.reject({message: "You cannot play a Targeted One-Off (Two, Nine) when your opponent has more than one Queen"});
							}
							if (player.frozenId != card.id) {
								// Move is valid -- make changes
								const gameUpdates = {
									oneOff: card.id,
									oneOffTarget: target.id,
									oneOffTargetType: targetType,
									attachedToTarget: null,
									log: [
										...game.log,
										`${userService.truncateEmail(player.email)} played the ${card.name} as a ${card.ruleText}, targeting the ${target.name}`,
									],
									lastEvent: {
										change: 'targetedOneOff',
										pNum: req.session.pNum,
									},
								};
								if (point) gameUpdates.attachedToTarget = point.id;

								const updatePromises = [
									Game.updateOne(game.id)
										.set(gameUpdates),
									// Remove one-off from player's hand
									User.removeFromCollection(player.id, 'hand')
										.members([card.id]),
								];
								return Promise.all([game, ...updatePromises]);
							} else {
								return Promise.reject({message: "That card is frozen! You must wait a turn to play it"});
							}

						} else {
							return Promise.reject({message: "You can only play a 2, or a 9 as targeted one-offs."});
						}
					} else {
						return Promise.reject({message: "You cannot play a card that is not in your hand"});
					}
				} else {
					return Promise.reject({message: "There is already a one-off in play; you cannot play any card, except a two to counter."});
				}
			} else {
				return Promise.reject({message: "It's not your turn."});
			}
		}) //End changeAndSave()
		.then(function populateGame (values) {
			return Promise.all([gameService.populateGame({gameId: values[0].id}), values[0]]);
		})
		.then(async function publishAndRespond (values) {
			const fullGame = values[0];
			const gameModel = values[1];
			const victory = await gameService.checkWinGame({
				game: fullGame,
				gameModel,
			});
			Game.publish([fullGame.id], {
				verb: 'updated',
				data: {
					change: 'targetedOneOff',
					game: fullGame,
					pNum: req.session.pNum,
					victory,
				},
			});
			return res.ok();
		}) //End publishAndRespond
		.catch(function failed (err) {
			return res.badRequest(err);
		});
	}, //End targetedOneOff

	counter: function (req, res) {
		const promiseGame = gameService.findGame({gameId: req.session.game});
		const promisePlayer = userService.findUser({userId: req.session.usr});
		const promiseOpponent = userService.findUser({userId: req.body.opId});
		const promiseCard = cardService.findCard({cardId: req.body.cardId});
		Promise.all([promiseGame, promisePlayer, promiseOpponent, promiseCard])
		.then(function changeAndSave (values) {
			const [ game, player, opponent, card ] = values;

			const queenCount = userService.queenCount({user: opponent});
			const opHasQueen = queenCount > 0;
			let logEntry;
			if (card.hand === player.id) {
				if (game.oneOff) {
					if (card.rank === 2) {
						if (!opHasQueen) {
							if (game.twos.length > 0) {
								logEntry = `${userService.truncateEmail(player.email)} played the ${card.name} to counter ${userService.truncateEmail(opponent.email)}'s ${game.twos[game.twos.length -1].name}.`;
							} else {
								logEntry = `${userService.truncateEmail(player.email)} played the ${card.name} to counter ${userService.truncateEmail(opponent.email)}'s ${game.oneOff.name}.`;
							}
							const gameUpdates = {
								lastEvent: {
									change: 'counter',
									pNum: req.session.pNum,									
								},
							};
							const updatePromises = [
								Game.updateOne(game.id)
									.set(gameUpdates),
								Game.addToCollection(game.id, 'twos')
									.members([card.id]),
								User.removeFromCollection(player.id, 'hand')
									.members([card.id]),
							];

							return Promise.all([game, ...updatePromises]);
						} else {
							return Promise.reject({message: "You cannot counter your opponent's one-off while they have a Queen."});
						}
					} else {
						return Promise.reject({message: "You can only play a Two to counter a one-off"});
					}
				} else {
					return Promise.reject({message: "You can only counter a one-off that is already in play"});
				}
			} else {
				return Promise.reject({message: "You can only play a card that is in your hand"});
			}

		}) //End changeAndSave
		.then(function populateGame (values) {
			return Promise.all([gameService.populateGame({gameId: values[0].id}), values[0]]);
		})
		.then(async function publishAndRespond (values) {
			const fullGame = values[0];
			const gameModel = values[1];
			const victory = await gameService.checkWinGame({
				game: fullGame,
				gameModel,
			});
			Game.publish([fullGame.id], {
				verb: 'updated',
				data: {
					change: 'counter',
					game: fullGame,
					pNum: req.session.pNum,
					victory,
				},
			});
			return res.ok();
		})
		.catch(function failed (err) {
			return res.badRequest(err);
		});
	}, //End counter()

	resolve: function (req, res) {

		//Note: the player calling resolve is the opponent of the one playing the one-off, if it resolves
		const promiseGame = gameService.findGame({gameId: req.session.game});
		const promisePlayer = userService.findUser({userId: req.body.opId});
		const promiseOpponent = userService.findUser({userId: req.session.usr});
		const promisePlayerPoints = cardService.findPoints({userId: req.body.opId});
		const promiseOpPoints = cardService.findPoints({userId: req.session.usr});
		Promise.all([promiseGame, promisePlayer, promiseOpponent, promisePlayerPoints, promiseOpPoints])
		.then(function changeAndSave (values) {
			const [ game, player, opponent, playerPoints, opPoints ] = values;
			let happened = true;
			const playerUpdates = {};
			const opponentUpdates = {};
			let cardsToScrap = [];
			let updatePromises = [];
			let gameUpdates = {
				oneOffTarget: null,
				oneOffTargetType: '',
			};
			if (game.twos.length % 2 === 1) {
				// One-off is countered
				opponentUpdates.frozenId = null;
				gameUpdates.log = [
					...game.log,
					`The ${game.oneOff.name} is countered, and all cards played this turn are scrapped.`,
				];
				happened = false;
			} else {
				playerUpdates.frozenId = null;
				// One Off will resolve; perform effect based on card rank
				switch (game.oneOff.rank) {
					case 1:
						let playerPointIds = [];
						let opponentPointIds = [];
						let jackIds = [];
						// Player's points
						if (playerPoints) {

							playerPoints.forEach(function (point) {
								playerPointIds.push(point.id);
								jackIds = [
									...jackIds,
									...point.attachments.map((jack) => jack.id),
								]
							});
						}

						// Opponent's points
						if (opPoints) {
							opPoints.forEach(function (point) {
								opponentPointIds.push(point.id);
								jackIds = [
									...jackIds,
									...point.attachments.map(jack => jack.id),
								];
							});
						}
						cardsToScrap = [
							...playerPointIds,
							...opponentPointIds,
							...jackIds,
						];
						// Update log
						gameUpdates.log = [
							...game.log,
							`The ${game.oneOff.name} one-off resolves; all point cards are scrapped`,
						];
						updatePromises = [
							User.updateOne(player.id)
								.set(playerUpdates),
							// Remove all jacks from point cards
							Card.replaceCollection([...playerPointIds, ...opponentPointIds], 'attachments')
								.members([]),
							// Scrap all point cards and jacks
							Game.addToCollection(game.id, 'scrap')
								.members(cardsToScrap),
							// Remove player's points
							User.removeFromCollection(player.id, 'points')
								.members(playerPointIds),
							// Remove opponent's points
							User.removeFromCollection(opponent.id, 'points')
								.members(opponentPointIds)
						];
						break; //End resolve ACE
					case 2:
						gameUpdates= {
							...gameUpdates,
							log: [
								...game.log,
								`The ${game.oneOff.name} resolves; the ${game.oneOffTarget.name} is scrapped`,
							],
						};
						// Scrap the one-off target
						cardsToScrap.push(game.oneOffTarget.id);
						switch (game.oneOffTargetType) {
							case 'faceCard':
								updatePromises.push(
									User.removeFromCollection(opponent.id, 'faceCards')
										.members([game.oneOffTarget.id]),
								);
								break;
							case 'jack':
								updatePromises = [
									...updatePromises,
									// Remove targeted jack from attachments of the point card it was on
									Card.removeFromCollection(game.attachedToTarget.id, 'attachments')
										.members([game.oneOffTarget.id]),
									// Place oneOff 
									User.addToCollection(player.id, 'points')
										.members([game.attachedToTarget.id]),
								];
								break;
						} //End switch(oneOffTargetType)
						break; //End resolve TWO
					case 3:
						gameUpdates = {
							...gameUpdates,
							resolving: game.oneOff.id,
							log: [
								...game.log,
								`The ${game.oneOff.name} one-off resolves; ${userService.truncateEmail(player.email)} will draw one card of their choice from the Scrap pile`,
							]
						};
						break;
					case 4:
						gameUpdates = {
							...gameUpdates,
							resolving: game.oneOff.id,
							log: [
								...game.log,
								`The ${game.oneOff.name} one-off resolves; ${userService.truncateEmail(opponent.email)} must discard two cards`,
							],
						};
						break;
					case 5:
						//Draw top card
						const handLen = player.hand.length;
						const cardsToDraw = [ game.topCard.id ];
						gameUpdates.topCard = null;
						let cardsToRemoveFromDeck = [];
						// player.hand.add(game.topCard.id);
						// game.topCard = null;
						if (handLen < 7) {
							//Draw second card, if it exists
							if (game.secondCard) {
								gameUpdates.log = [
									...game.log,
									`The ${game.oneOff.name} one-off resolves; ${userService.truncateEmail(player.email)} draws two cards`,
								];
								cardsToDraw.push(game.secondCard.id);
								gameUpdates.secondCard = null;
								cardsToRemoveFromDeck = [
									...cardsToDraw,
								];

								//Replace top card, if there's a card in deck
								if (game.deck.length >= 1) {
									const newTopCard = _.sample(game.deck).id;
									gameUpdates.topCard = newTopCard;
									cardsToRemoveFromDeck.push(newTopCard);

									// game.deck.remove(game.deck[random].id);

									// Replace second card, if possible
									if (game.deck.length >= 2) {
										let newSecondCard = _.sample(game.deck).id;
										// Ensure new second card is distinct from new topcard and cards drawn
										while (cardsToRemoveFromDeck.includes(newSecondCard)) {
											newSecondCard = _.sample(game.deck).id;
										}
										gameUpdates.secondCard = newSecondCard;
										cardsToRemoveFromDeck.push(newSecondCard);
									}
								}
							// Player drew last card
							} else {
								gameUpdates.log = [
									...game.log,
									`The ${game.oneOff.name} one-off resolves; ${userService.truncateEmail(player.email)} draws the last card.`,
								];
							}
						//Player could only draw one card, due to hand limit
						} else {
							// Replace top card with second card, if second card exists
							if (game.secondCard) {
								gameUpdates.topCard = game.secondCard.id;
								gameUpdates.secondCard = null;
								
								// If more cards are left in deck, replace second card with card from deck
								if (game.deck.length >= 1) {
									const newSecondCard = _.sample(game.deck).id;
									// Ensure new second card is distinct from cards drawn and new top card
									while (cardsToRemoveFromDeck.includes(newSecondCard)) {
										newSecondCard = _.sample(game.deck).id;
									}
									gameUpdates.secondCard = newSecondCard;
									gameUpdates.log = [
										...game.log,
										`The ${game.oneOff.name} one-off resolves; ${userService.truncateEmail(player.email)} draws one card to reach the hand limit (8).`,
									];
								// Player draws last card in deck, to reach hand limit (only draws 1)
								} else {
									gameUpdates.log = [
										...game.log,
										`The ${game.oneOff.name} one-off resolves; ${userService.truncateEmail(player.email)} draws one card (last in deck) to reach the hand limit.`,
									];
								}
							}
						}
						updatePromises = [
							...updatePromises,
							Game.removeFromCollection(game.id, 'deck')
								.members(cardsToRemoveFromDeck),
							User.addToCollection(player.id, 'hand')
								.members(cardsToDraw),
						];
						break; //End resolve FIVE
					case 6:
						const playerFaceCardIds = player.faceCards.map(faceCard => faceCard.id);
						const opponentFaceCardIds = opponent.faceCards.map(faceCard => faceCard.id);
						cardsToScrap = [
							...cardsToScrap,
							...playerFaceCardIds,
							...opponentFaceCardIds,
						];
						updatePromises = [
							...updatePromises,
							User.removeFromCollection(player.id, 'faceCards')
								.members(playerFaceCardIds),
							User.removeFromCollection(opponent.id, 'faceCards')
								.members(opponentFaceCardIds),
						];
						// All points will need their attachments emptied
						const allPoints = [];
						const pointsGoingToPlayer = [];
						const pointsGoingToOpponent = [];
						if (playerPoints) {
							playerPoints.forEach(function (point) {
								allPoints.push(point.id);
								// Collect all jacks for scrap
								const jackCount = point.attachments.length;
								const jacks = point.attachments.map(jack => jack.id);
								cardsToScrap = [
									...cardsToScrap,
									...jacks
								];
								// If odd number of jacks were attached, switch control
								if (jackCount % 2 === 1) {
									pointsGoingToOpponent.push(point.id);
								}
							});
						}
						if (opPoints) {
							opPoints.forEach(function (point) {
								allPoints.push(point.id);
								// Collect all jacks for scrap
								const jackCount = point.attachments.length;
								const jacks = point.attachments.map(jack => jack.id);
								cardsToScrap = [
									...cardsToScrap,
									...jacks,
								];
								// If odd number of jacks were attached, switch control
								if (jackCount % 2 === 1) {
									pointsGoingToPlayer.push(point.id);
								}
							});
						}
						gameUpdates.log = [
							...game.log,
							`The ${game.oneOff.name} one-off resolves; all face cards are scrapped`,
						];
						updatePromises = [
							...updatePromises,
							// Remove all attachments from all points
							Card.replaceCollection(allPoints, 'attachments')
								.members([]),
							// Give player the point cards that return to them
							User.addToCollection(player.id, 'points')
								.members(pointsGoingToPlayer),
							// Give opponent the point cards that return to them
							User.addToCollection(opponent.id, 'points')
								.members(pointsGoingToOpponent),
						];
						break; //End resolve SIX
					case 7:
						gameUpdates = {
							...gameUpdates,
							resolving: game.oneOff.id,
						}
						if (game.secondCard) {
							gameUpdates.log = [
								...game.log,
								`The ${game.oneOff.name} one-off resolves; they will play one card from the top two in the deck. Top two cards: ${game.topCard.name} and ${game.secondCard.name}.`,
							];
						} else {
							gameUpdates.log = [
								...game.log,
								`The ${game.oneOff.name} one-off resolves. They will play the ${game.topCard.name} as it is the last card in the deck.`,
							];
						}
						break; //End resolve SEVEN
					case 9:
						updatePromises.push(
							// Place target back in opponent's hand
							User.addToCollection(opponent.id, 'hand')
								.members(game.oneOffTarget.id),
						);
						opponentUpdates.frozenId = game.oneOffTarget.id;
						gameUpdates = {
							...gameUpdates,
							log: [
								...game.log,
								`The ${game.oneOff.name} one-off resolves, returning the ${game.oneOffTarget.name} to ${userService.truncateEmail(opponent.email)}'s hand. It cannot be played next turn.`,
							],
						};
						switch(game.oneOffTargetType) {
							case 'faceCard':
								updatePromises.push(
									User.removeFromCollection(opponent.id, 'faceCards')
										.members(game.oneOffTarget.id),
								);
								break;
							case 'point':
								targetCard = opPoints.find(point => point.id === game.oneOffTarget.id);
								if (!targetCard) return Promise.reject({message: `Could not find target point card ${game.oneOffTarget.id} to return to opponent's hand`});
								// Scrap all jacks attached to target
								cardsToScrap = [
									...cardsToScrap,
									...targetCard.attachments.map(jack => jack.id),
								];
								updatePromises.push(
									// Remove card from opponent's points
									User.removeFromCollection(opponent.id, 'points')
										.members([targetCard.id]),
									// Clear jacks from target
									Card.replaceCollection(targetCard.id, 'attachments')
										.members([]),
								);
								break;
							case 'jack':
								updatePromises.push(
									// Remove targeted jack from the attachments of the point card it's on
									Card.removeFromCollection(game.oneOffTarget.attachedTo, 'attachments')
										.members([game.oneOffTarget.id]),
									// Return the stolen point card back to the player
									User.addToCollection(player.id, 'points')
										.members([game.attachedToTarget.id]),
								);
								gameUpdates.attachedToTarget = null;
								break;
						}
						break; //End resolve NINE
				} //End switch on oneOff rank
			} //End if(happened)

			// Add twos to the cards to scrap
			cardsToScrap = [
				...cardsToScrap,
				...game.twos.map(two => two.id),
			];
			const oneOff = game.oneOff;
			if (oneOff.rank != 3 || !happened) {
				gameUpdates.oneOff = null;
				cardsToScrap.push(game.oneOff.id);
			}
			// Increment turn for anything except resolved three, four, and seven (which require follow up)
			if (
				!happened ||
				(happened && ![3, 4, 7].includes(oneOff.rank))
				) {
				gameUpdates = {
					...gameUpdates,
					turn: game.turn + 1,
					passes: 0,
				}
			}
			gameUpdates.lastEvent = {
				change: 'resolve',
				playedBy: player.pNum,
				happened,
				oneOff,
			},
			updatePromises = [
				...updatePromises,
				// Update game with turn, log, passes, oneOff, and lastEvent
				Game.updateOne(game.id)
					.set(gameUpdates),
					// Scrap the specified cards
				Game.addToCollection(game.id, 'scrap')
					.members(cardsToScrap),
				// Clear twos
				Game.replaceCollection(game.id, 'twos')
					.members([]),
				// Update opponent, as specified
				User.updateOne(opponent.id)
					.set(opponentUpdates),
			];
			const dataToReturn = [
				game,
				oneOff,
				player.pNum,
				happened,
				...updatePromises,
			];

			return Promise.all(dataToReturn);
		}) //End changeAndSave
		.then(function populateGame (values) {
			const [ game, oneOff, pNum, happened ] = values;
			return Promise.all([gameService.populateGame({gameId: game.id}), oneOff, pNum, happened, game]);
		})
		.then(async function publishAndRespond (values) {
			const [ fullGame, oneOff, pNum, happened, gameModel ] = values;
			const victory = await gameService.checkWinGame({
				game: fullGame,
				gameModel,
			});

			Game.publish([fullGame.id], {
				verb: 'updated',
				data: {
					change: 'resolve',
					oneOff,
					game: fullGame,
					victory,
					playedBy: pNum,
					happened,
				},
			});
			// If the game is over, clean it up
			if (victory.gameOver) await gameService.clearGame({userId: req.session.usr})
			return res.ok();
		})
		.catch(function failed (err) {
			return res.badRequest(err);
		});
	}, //End resolve()

	resolveFour: function (req, res) {
		const promiseGame = gameService.findGame({gameId: req.session.game});
		const promisePlayer = userService.findUser({userId: req.session.usr});
		const promiseCard1 = cardService.findCard({cardId: req.body.cardId1});
		let promiseCard2 = null;
		if ( req.body.hasOwnProperty("cardId2") ) {
			promiseCard2 = cardService.findCard({cardId: req.body.cardId2});
		}
		Promise.all([promiseGame, promisePlayer, promiseCard1, promiseCard2])
		.then(function changeAndSave (values) {
			const [ game, player, card1, card2 ] = values;
			const cardsToScrap = [ card1.id ];
			const gameUpdates = {
				passes: 0,
				turn: game.turn + 1,
				resolving: null,
				lastEvent: {
					change: 'resolveFour',
				},
			};
			if (card2 != null) {
				cardsToScrap.push(card2.id);
				gameUpdates.log = [
					...game.log,
					`${userService.truncateEmail(player.email)} discarded the ${card1.name} and the ${card2.name}`,
				];
			} else {
				gameUpdates.log = [
					...game.log,
					`${userService.truncateEmail(player.email)} discarded the ${card1.name}`,
				];
			}
			const updatePromises = [
				Game.updateOne(game.id)
					.set(gameUpdates),
				Game.addToCollection(game.id, 'scrap')
					.members(cardsToScrap),
				User.removeFromCollection(player.id, 'hand')
					.members(cardsToScrap),
			];
			return Promise.all([game, ...updatePromises]);
		}) // End changeAndSave
		.then(function populateGame (values) {
			const [ game ] = values;
			return Promise.all([gameService.populateGame({gameId: game.id}), game]);
		})
		.then(async function publishAndRespond (values) {
			const fullGame = values[0];
			const gameModel = values[1];
			const victory = await gameService.checkWinGame({
				game: fullGame,
				gameModel,
			});
			Game.publish([fullGame.id], {
				verb: 'updated',
				data: {
					change: 'resolveFour',
					game: fullGame,
					victory,
				},
			});
			return res.ok();
		})
		.catch(function failed (err) {
			return res.badRequest(err);
		})
	}, //End resolveFour()

	resolveThree: function (req, res) {
		const promiseGame = gameService.findGame({gameId: req.session.game});
		const promisePlayer = userService.findUser({userId: req.session.usr});
		const promiseCard = cardService.findCard({cardId: req.body.cardId});
		Promise.all([promiseGame, promisePlayer, promiseCard])
		.then(function changeAndSave (values) {
			const [ game, player, card ] = values;
			const gameUpdates = {
				oneOff: null,
				resolving: null,
				passes: 0,
				turn: game.turn + 1,
				log: [
					...game.log,
					`${userService.truncateEmail(player.email)} took the ${card.name} from the Scrap pile to their hand.`,
				],
				lastEvent: {
					change: 'resolveThree',
				},
			};
			const updatePromises = [
				// Update game
				Game.updateOne(game.id)
					.set(gameUpdates),
				// Scrap the three that just resolved
				Game.addToCollection(game.id, 'scrap')
					.members([game.oneOff.id]),
				// Return selected card to player's hand
				User.addToCollection(player.id, 'hand')
					.members([card.id]),
				// Remove selected card from scrap
				Game.removeFromCollection(game.id, 'scrap')
					.members([card.id]),
				// Clear player's frozenId
				User.updateOne(player.id)
					.set({
						frozenId: null,
					}),
			];
			return Promise.all([game, ...updatePromises]);
		})
		.then(function populateGame (values) {
			const [ game ] = values;
			return Promise.all([gameService.populateGame({gameId: game.id}), game]);
		})
		.then(async function publishAndRespond (values) {
			const fullGame = values[0];
			const gameModel = values[1];
			const victory = await gameService.checkWinGame({
				game: fullGame,
				gameModel,
			});
			Game.publish([fullGame.id], {
				verb: 'updated',
				data: {
					change: 'resolveThree',
					game: fullGame,
					victory,
				},
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
		const promiseGame = gameService.findGame({gameId: req.session.game});
		const promisePlayer = userService.findUser({userId: req.session.usr});
		const promiseCard = cardService.findCard({cardId: req.body.cardId});
		Promise.all([promiseGame, promisePlayer, promiseCard])
		.then(function changeAndSave (values) {
			const [ game, player, card ] = values;
			if (game.turn % 2 === player.pNum) {
				if (game.topCard.id === card.id || game.secondCard.id === card.id) {
					if (card.rank < 11) {
						const { topCard, secondCard, cardsToRemoveFromDeck } = gameService.sevenCleanUp({game: game, index: req.body.index});
						const playerUpdates = {
							frozenId: null,
						};
						const gameUpdates = {
							topCard,
							secondCard,
							passes: 0,
							turn: game.turn + 1,
							resolving: null,
							lastEvent: {
								change: 'sevenPoints',
							},
							log: [
								...game.log,
								`${userService.truncateEmail(player.email)} played the ${card.name} from the top of the deck for points.`,
							],
						};
						const updatePromises = [
							Game.updateOne(game.id)
								.set(gameUpdates),
							Game.removeFromCollection(game.id, 'deck')
								.members(cardsToRemoveFromDeck),
							User.updateOne(player.id)
								.set(playerUpdates),
							User.addToCollection(player.id, 'points')
								.members([card.id]),
						];
						return Promise.all([game, ...updatePromises]);
					} else {
						return Promise.reject({message: "You can only play Ace - Ten cards as points"});
					}
				} else {
					return Promise.reject({message: "You must pick a card from the deck to play when resolving a seven"});
				}
			} else {
				return Promise.reject({message: "It's not your turn"});
			}
		})
		.then(function populateGame (values) {
			const [ game ] = values;
			return Promise.all([gameService.populateGame({gameId: game.id}), game]);
		})
		.then(async function publishAndRespond (values) {
			const fullGame = values[0];
			const gameModel = values[1];
			const victory = await gameService.checkWinGame({
				game: fullGame,
				gameModel,
			});
			Game.publish([fullGame.id], {
				verb: 'updated',
				data: {
					change: 'sevenPoints',
					game: fullGame,
					victory,
				},
			});
			// If the game is over, clean it up
			if (victory.gameOver) await gameService.clearGame({userId: req.session.usr})
			return res.ok();
		})
		.catch(function failed (err) {
			return res.badRequest(err);
		});
	}, //End sevenPoints

	sevenFaceCard: function (req, res) {
		const promiseGame = gameService.findGame({gameId: req.session.game});
		const promisePlayer = userService.findUser({userId: req.session.usr});
		const promiseCard = cardService.findCard({cardId: req.body.cardId});
		Promise.all([promiseGame, promisePlayer, promiseCard])
		.then(function changeAndSave (values) {
			const [ game, player, card ] = values;
			// var game = values[0], player = values[1], card = values[2];
			if (game.turn % 2 === player.pNum) {
				if (game.topCard.id === card.id || game.secondCard.id === card.id) {
					if (card.rank === 12 || card.rank === 13 || card.rank === 8) {
						// Valid move -- make changes
						const { topCard, secondCard, cardsToRemoveFromDeck } = gameService.sevenCleanUp({game: game, index: req.body.index});
						const playerUpdates = {
							frozenId: null,
						};
						let logEntry = `${userService.truncateEmail(player.email)} played the ${card.name} from the top of the deck`;
						if (card.rank === 8) {
							logEntry += ' as a glasses eight.'
						}
						else {
							logEntry += '.';
						}
						const gameUpdates = {
							topCard,
							secondCard,
							passes: 0,
							turn: game.turn + 1,
							resolving: null,
							lastEvent: {
								change: 'sevenFaceCard',
							},
							log: [
								...game.log,
								logEntry,
							],
						};
						const updatePromises = [
							Game.updateOne(game.id)
								.set(gameUpdates),
							Game.removeFromCollection(game.id, 'deck')
								.members(cardsToRemoveFromDeck),
							User.updateOne(player.id)
								.set(playerUpdates),
							User.addToCollection(player.id, 'faceCards')
								.members([card.id]),
						];
						return Promise.all([game, ...updatePromises]);
					} else {
						return Promise.reject({message: "You can only play Kings, Queens, and Eights as Face Cards, without a TARGET"});
					}
				} else {
					return Promise.reject({message: "You must pick a card from the deck to play when resolving a seven"});
				}
			} else {
				return Promise.reject({message: "It's not your turn"});
			}
		})
		.then(function populateGame (values) {
			const [ game ] = values;
			return Promise.all([gameService.populateGame({gameId: game.id}), game]);
		})
		.then(async function publishAndRespond (values) {
			const fullGame = values[0];
			const gameModel = values[1];
			const victory = await gameService.checkWinGame({
				game: fullGame,
				gameModel,
			});
			Game.publish([fullGame.id], {
				verb: 'updated',
				data: {
					change: 'sevenFaceCard',
					game: fullGame,
					victory,
				},
			});
			// If the game is over, clean it up
			if (victory.gameOver) await gameService.clearGame({userId: req.session.usr})
			return res.ok();
		})
		.catch(function failed (err) {
			return res.badRequest(err);
		});
	}, //End sevenFaceCard

	sevenScuttle: function (req, res) {
		const promiseGame = gameService.findGame({gameId: req.session.game});
		const promisePlayer = userService.findUser({userId: req.session.usr});
		const promiseOpponent = userService.findUser({userId: req.body.opId});
		const promiseCard = cardService.findCard({cardId: req.body.cardId});
		const promiseTarget = cardService.findCard({cardId: req.body.targetId});
		Promise.all([promiseGame, promisePlayer, promiseOpponent, promiseCard, promiseTarget])
		.then(function changeAndSave (values) {
			const [ game, player, opponent, card, target ] = values;
			if (game.turn % 2 === player.pNum) {
				if (card.id === game.topCard.id || card.id === game.secondCard.id) {
					if (card.rank < 11) {
						if (target.points === opponent.id) {
							if (card.rank > target.rank || (card.rank === target.rank && card.suit > target.suit)) {
								// Move is legal; make changes
								const { topCard, secondCard, cardsToRemoveFromDeck } = gameService.sevenCleanUp({game: game, index: req.body.index});
								const cardsToScrap = [
									card.id,
									target.id,
									...target.attachments.map(jack => jack.id)
								];
								const playerUpdates = {
									frozenId: null,
								};
								const gameUpdates = {
									topCard,
									secondCard,
									passes: 0,
									turn: game.turn + 1,
									resolving: null,
									log: [
										...game.log,
										`${userService.truncateEmail(player.email)} scuttled ${userService.truncateEmail(opponent.email)}'s ${target.name} with the ${card.name} from the top of the deck.`,
									],
									lastEvent: {
										change: 'sevenScuttle',
									},
								};
								const updatePromises = [
									Game.updateOne(game.id)
										.set(gameUpdates),
									// Remove new secondCard from deck
									Game.removeFromCollection(game.id, 'deck')
										.members(cardsToRemoveFromDeck),
									// Remove target from opponent points
									User.removeFromCollection(opponent.id, 'points')
										.members([target.id]),
									// Remove attachments from target
									Card.replaceCollection(target.id, 'attachments')
										.members([]),
									// Scrap relevant cards
									Game.addToCollection(game.id, 'scrap')
										.members(cardsToScrap),
									User.updateOne(player.id)
										.set(playerUpdates),
								];
								return Promise.all([game, ...updatePromises]);
							} else {
								return Promise.reject({message: "You can only scuttle if your card's rank is higher, or the rank is the same, and your suit is higher (Clubs < Diamonds < Hearts < Spades)"});
							}
						} else {
							return Promise.reject({message: "You can only scuttle a card in your oppponent's points"});
						}
					} else {
						return Promise.reject({message: "You can only scuttle with an ace through ten"});
					}
				} else {
					return Promise.reject({message: "You can only one of the top two cards from the deck while resolving a seven"});
				}
			} else {
				return Promise.reject({message: "It's not your turn"});
			}
		}) //End changeAndSave()
		.then(function populateGame (values) {
			return Promise.all([gameService.populateGame({gameId: values[0].id}), values[0]]);
		})
		.then(async function publishAndRespond (values) {
			const fullGame = values[0];
			const gameModel = values[1];
			const victory = await gameService.checkWinGame({
				game: fullGame,
				gameModel,
			});
			Game.publish([fullGame.id], {
				verb: 'updated',
				data: {
					change: 'sevenScuttle',
					game: fullGame,
					victory,
				},
			});
			return res.ok();
		})
		.catch(function failed (err) {
			return res.badRequest(err);
		});
	}, //End sevenScuttle()

	sevenJack: function (req, res) {
		const promiseGame = gameService.findGame({gameId: req.session.game});
		const promisePlayer = userService.findUser({userId: req.session.usr});
		const promiseOpponent = userService.findUser({userId: req.body.opId});
		const promiseCard = cardService.findCard({cardId: req.body.cardId});
		const promiseTarget = req.body.targetId !== -1 ? cardService.findCard({cardId: req.body.targetId}) : -1; // -1 for double jacks with no points to steal special case
    let promises = [promiseGame, promisePlayer, promiseOpponent, promiseCard, promiseTarget];
		Promise.all(promises)
		.then(function changeAndSave (values) {
			const [ game, player, opponent, card, target ] = values;
			let gameUpdates = {
				passes: 0,
				turn: game.turn + 1,
				resolving: null,
			};
			let playerUpdates = {
				frozenId: null,
			};
			let updatePromises = [];
			if (game.turn % 2 === player.pNum) {
				if (card.id === game.topCard.id || card.id === game.secondCard.id) {
					// special case - seven double jacks with no points to steal
					if (target === -1){
						const { topCard, secondCard, cardsToRemoveFromDeck } = gameService.sevenCleanUp({game: game, index: req.body.index});
						gameUpdates = {
							...gameUpdates,
							topCard,
							secondCard,
							log: [
								...game.log,
								`${userService.truncateEmail(player.email)} scrapped ${card.name}, since there are no point cards to steal on ${userService.truncateEmail(opponent.email)}'s fiels.`,
							],
							lastEvent: {
								change: 'sevenJack',
							},
						};

						updatePromises = [
							Game.updateOne(game.id)
								.set(gameUpdates),
							User.updateOne(player.id)
								.set(playerUpdates),
							Game.addToCollection(game.id, 'scrap')
								.members([card.id]),
							Game.removeFromCollection(game.id, 'deck')
								.members(cardsToRemoveFromDeck),
						];
            return Promise.all([game, ...updatePromises]);
          } else {
            const queenCount = userService.queenCount({user: opponent});
						switch (queenCount) {
							case 0:
								break;
							case 1:
								if (target.faceCards === opponent.id && target.rank === 12) {
								} else {
									return Promise.reject({message: "Your opponent's queen prevents you from targeting their other cards"});
								}
								break;
							default:
								return Promise.reject({message: "You cannot play a targeted one-off when your opponent has more than one Queen"});
						} //End queenCount validation
            // Normal sevens
            if (target.points === opponent.id) {
              if (card.rank === 11) {
								const { topCard, secondCard, cardsToRemoveFromDeck } = gameService.sevenCleanUp({game: game, index: req.body.index});
								const cardUpdates = {
									index: target.attachments.length,
								};
								gameUpdates = {
									...gameUpdates,
									topCard,
									secondCard,
									log: [
										...game.log,
										`${userService.truncateEmail(player.email)} stole ${userService.truncateEmail(opponent.email)}'s ${target.name} with the ${card.name} from the top of the deck.`,
									],
								}
								updatePromises = [
									Game.updateOne(game.id)
										.set(gameUpdates),
									User.updateOne(player.id)
										.set(playerUpdates),
									// Set card's index within attachments
									Card.updateOne(card.id)
										.set(cardUpdates),
									// Remove new second card fromd eck
									Game.removeFromCollection(game.id, 'deck')
										.members(cardsToRemoveFromDeck),
									// Add jack to target's attachments
									Card.addToCollection(target.id, 'attachments')
										.members([card.id]),
									// Steal point card
									User.addToCollection(player.id, 'points')
										.members([target.id]),
								];
                return Promise.all([game, ...updatePromises]);
              } else {
                return Promise.reject({message: "You can only steal your opponent's points with a jack"});
              }
            } else {
              return Promise.reject({message: "You can only jack your opponent's point cards"});
            }
          }
				} else {
					return Promise.reject({message: "You can only one of the top two cards from the deck while resolving a seven"});
				}
			} else {
				return Promise.reject({message: "It's not your turn"});
			}
		})
		.then(function populateGame (values) {
			return Promise.all([gameService.populateGame({gameId: values[0].id}), values[0]]);
		})
		.then(async function publishAndRespond (values) {
			const fullGame = values[0];
			const gameModel = values[1];
			const victory = await gameService.checkWinGame({
				game: fullGame,
				gameModel,
			});
			Game.publish([fullGame.id], {
				verb: 'updated',
				data: {
					change: 'sevenJack',
					game: fullGame,
					victory,
				},
			});
			// If the game is over, clean it up
			if (victory.gameOver) await gameService.clearGame({userId: req.session.usr})
			return res.ok();
		})
		.catch(function failed (err) {
			return res.badRequest(err);
		});
	}, //End sevenJack()

	sevenUntargetedOneOff: function (req, res) {
		const promiseGame = gameService.findGame({gameId: req.session.game});
		const promisePlayer = userService.findUser({userId: req.session.usr});
		const promiseCard = cardService.findCard({cardId: req.body.cardId});
		const promiseOpponent = userService.findUser({userId: req.body.opId});
		Promise.all([promiseGame, promisePlayer, promiseCard, promiseOpponent])
		.then(function changeAndSave (values) {
			const [ game, player, card, opponent ] = values;
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
									if (game.scrap.length === 0) return Promise.reject({message: "You can only play a 3 ONE-OFF if there are cards in the scrap pile"});
									break;
								case 4:
									if (opponent.hand.length === 0) return Promise.reject({message: "You cannot play a 4 as a one-off while your opponent has no cards in hand"});
									break;
								case 5:
								case 7:
									if (!game.topCard) return Promise.reject({message: "You can only play a " + card.rank + " as a ONE-OFF if there are cards in the deck"});
									break;
							}
							const { topCard, secondCard, cardsToRemoveFromDeck } = gameService.sevenCleanUp({game: game, index: req.body.index});
							const gameUpdates = {
								topCard,
								secondCard,
								resolving: null,
								oneOff: card.id,
								log: [
									...game.log,
									`${userService.truncateEmail(player.email)} played the ${card.name} from the top of the deck as a ${card.ruleText}`,
								],
								lastEvent: {
									change: 'sevenOneOff',
									pNum:req.session.pNum,
								},
							};
							const updatePromises = [
								Game.updateOne(game.id)
									.set(gameUpdates),
								Game.removeFromCollection(game.id, 'deck')
									.members(cardsToRemoveFromDeck),
							];
							return Promise.all([game, ...updatePromises]);
						default:
							return Promise.reject({message: "You cannot play that card as a ONE-OFF without a target"});
					}
				} else {
					return Promise.reject({message: "You can only play cards from the top of the deck while resolving a seven"});
				}
			} else {
				return Promise.reject({message: "It's not your turn"});
			}
		})
		.then(function populateGame (values) {
			const [ game ] = values;
			return Promise.all([gameService.populateGame({gameId: game.id}), game]);
		})
		.then(async function publishAndRespond (values) {
			const fullGame = values[0];
			const gameModel = values[1];
			const victory = await gameService.checkWinGame({
				game: fullGame,
				gameModel,
			});
			Game.publish([fullGame.id], {
				verb: 'updated',
				data: {
					change: 'sevenOneOff',
					game: fullGame,
					pNum: req.session.pNum,
					victory,
				},
			});
			return res.ok();
		})
		.catch(function failed (err) {
			return res.badRequest(err);
		});
	}, //End sevenUntargetedOneOff()

	sevenTargetedOneOff: function (req, res) {
		const promiseGame = gameService.findGame({gameId: req.session.game});
		const promisePlayer = userService.findUser({userId: req.session.usr});
		const promiseOpponent = userService.findUser({userId: req.body.opId});
		const promiseCard = cardService.findCard({cardId: req.body.cardId});
		const promiseTarget = cardService.findCard({cardId: req.body.targetId});
		let promisePoint = null;
		const targetType = req.body.targetType;
		if (targetType === 'jack') {
			promisePoint = cardService.findCard({cardId: req.body.pointId});
		}
		Promise.all([promiseGame, promisePlayer, promiseOpponent, promiseCard, promiseTarget, Promise.resolve(targetType), promisePoint])
		.then(function changeAndSave (values) {
			const [ game, player, opponent, card, target, targetType, point ] = values;
			if (game.turn % 2 === player.pNum) {
				if (card.id === game.topCard.id || card.id === game.secondCard.id) {
					if (card.rank === 2 || card.rank === 9) {
						const queenCount = userService.queenCount({user: opponent});
						switch (queenCount) {
							case 0:
								break;
							case 1:
								if (target.faceCards === opponent.id && target.rank === 12) {
								} else {
									return Promise.reject({message: "Your opponent's queen prevents you from targeting their other cards"});
								}
								break;
							default:
								return Promise.reject({message: "You cannot play a targeted one-off when your opponent has more than one Queen"});
						} //End queenCount validation
						const { topCard, secondCard, cardsToRemoveFromDeck } = gameService.sevenCleanUp({game: game, index: req.body.index});
						const gameUpdates = {
							topCard,
							secondCard,
							resolving: null,
							oneOff: card.id,
							oneOffTarget: target.id,
							oneOffTargetType: targetType,
							attachedToTarget: null,
							log: [
								...game.log,
								`${userService.truncateEmail(player.email)} played the ${card.name} as a ${card.ruleText}, targeting the ${target.name}.`,
							],
							lastEvent: {
								change: 'sevenTargetedOneOff',
								pNum:req.session.pNum,
							},
						}

						if (point) gameUpdates.attachedToTarget = point.id;

						const updatePromises = [
							Game.updateOne(game.id)
								.set(gameUpdates),
							Game.removeFromCollection(game.id, 'deck')
								.members(cardsToRemoveFromDeck),
						];

						return Promise.all([game, ...updatePromises]);
					}
				} else {
					return Promise.reject({message: "You can only play cards from the top of the deck while resolving a seven"});
				}
			} else {
				return Promise.reject({message: "It's not your turn"});
			}
		})
		.then(function populateGame (values) {
			const [ game ] = values;
			return Promise.all([gameService.populateGame({gameId: game.id}), game]);
		})
		.then(async function publishAndRespond (values) {
			const fullGame = values[0];
			const gameModel = values[1];
			const victory = await gameService.checkWinGame({
				game: fullGame,
				gameModel,
			});
			Game.publish([fullGame.id], {
				verb: 'updated',
				data: {
					change: 'sevenTargetedOneOff',
					game: fullGame,
					victory,
					pNum: req.session.pNum,
				},
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
			Game.publish([game.id], {
				verb: 'updated',
				data: {
					change: 'concede',
					game,
					victory,
				},
			});
			return res.ok();
		}).catch(function failed (err) {
			return res.badRequest(err);
		});
	},

	gameOver: function (req, res) {
		userService.findUser({userId: req.session.usr})
		.then(function deleteSessionData (player) {
			Game.unsubscribe(req, [req.session.game]);
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
			Game.subscribe(req, [req.session.game]);
			res.ok({'game': fullGame, 'pNum': req.session.pNum});
		})
		.catch(function failed (err) {
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
			Game.publish([game.id], {
				verb: 'updated',
				data: {
					change: 'chat',
					game,
					victory,
				},
			});
			 return res.ok();
		})
		.catch(function failed (err) {
			res.badRequest(err);
		});

	},

	clearGame: function (req, res) {
		return gameService.clearGame({userId: req.session.usr}).then(function postClear (result) {
			return res.ok();
		});
	},


	/////////////////////////////////////////
	// DEVELOPMENT ONLY - TESTING HELPERS //
	////////////////////////////////////////

	//Places card of choice on top of deck
	stackDeck: function (req, res) {
		return gameService.findGame({gameId: req.session.game})
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
			Game.publish([game.id], {
				verb: 'updated',
				data: {
					change: 'stackDeck',
					game,
					victory,
				},
			});
			return res.ok();
		})
		.catch(function failed (err) {
			return res.badRequest(err);
		});
	}, //End stackDeck

	deleteDeck: function (req, res) {
		return gameService.findGame({gameId: req.session.game})
		.then(function changeAndSave (game) {
			const updatePromises = [
				Game.replaceCollection(game.id, 'deck')
					.members([]),
				Game.addToCollection(game.id, 'scrap')
					.members(game.scrap),
			];
			return Promise.all([game, ...updatePromises]);
		})
		.then(function populateGame (values) {
			const [ game ] = values;
			return gameService.populateGame({gameId: game.id});
		})
		.then(function publishUpdate (game) {
			Game.publish([game.id], {
				verb: 'updated',
				data: {
					change: 'deleteDeck',
					game,
				},
			});
			return res.ok();
		})
		.catch(function failed (err) {
			return res.badRequest(err);
		});
	}, //End deleteDeck

	loadFixture: function (req, res) {
		// Capture request data
		const p0HandCardIds = req.body.p0HandCardIds || [];
		const p0PointCardIds = req.body.p0PointCardIds || [];
		const p0FaceCardIds = req.body.p0FaceCardIds || [];
		const p1HandCardIds = req.body.p1HandCardIds || [];
		const p1PointCardIds = req.body.p1PointCardIds || [];
		const p1FaceCardIds = req.body.p1FaceCardIds || [];
		const scrapCardIds = req.body.scrapCardIds || [];
		const topCardId = req.body.topCardId || null;
		const secondCardId = req.body.secondCardId || null;
		// Aggregate list of all cards being requested
		const allRequestedCards = [
			...p0HandCardIds,
			...p0PointCardIds,
			...p0FaceCardIds,
			...p1HandCardIds,
			...p1PointCardIds,
			...p1FaceCardIds,
			...scrapCardIds
		];
		if (topCardId) {
			allRequestedCards.push(topCardId);
		}
		if (secondCardId) {
			allRequestedCards.push(secondCardId);
		}

		// Find records
		const findGame = Game.findOne({id: req.session.game}).populate('deck');
		const findP0 = User.findOne({id: req.body.p0Id}).populateAll();
		const findP1 = User.findOne({id: req.body.p1Id}).populateAll();

		return Promise.all([findGame, findP0, findP1])
			.then(function resetGame(values) {
				// Put all cards back in deck
				const [game, p0, p1] = values;

				const oldP0Hand = p0.hand.map((card) => card.id);
				const oldP0Points = p0.points.map((card) => card.id);
				const oldP0FaceCards = p0.faceCards.map((card) => card.id);
				const oldP1Hand = p1.hand.map((card) => card.id);
				const oldP1Points = p1.points.map((card) => card.id);
				const oldP1FaceCards = p1.faceCards.map((card) => card.id);
				const addToDeck = [
					game.topCard,
					game.secondCard,
					...oldP0Hand,
					...oldP0Points,
					...oldP0FaceCards,
					...oldP1Hand,
					...oldP1Points,
					...oldP1FaceCards,
				];
				const updatePromises = [
					Game.addToCollection(game.id, 'deck')
						.members(addToDeck),
					User.replaceCollection(p0.id, 'hand')
						.members([]),
					User.replaceCollection(p0.id, 'points')
						.members([]),
					User.replaceCollection(p0.id, 'faceCards')
						.members([]),
					User.replaceCollection(p1.id, 'hand')
						.members([]),
					User.replaceCollection(p1.id, 'points')
						.members([]),
					User.replaceCollection(p1.id, 'faceCards')
						.members([]),
				];

				return Promise.all([game, p0, p1, ...updatePromises]);
			})
			.then(function placeCards(values) {
				// Load game according to fixture
				const [ game, p0, p1 ] = values;
				let topCard = null;
				let secondCard = null;
				// Take top card from fixture if specified
				if (topCardId) {
					topCard = topCardId;
				}
				// Otherwise select it randomly from remaining cards
				else {
					topCard = _.sample(game.deck).id;
					while (allRequestedCards.includes(topCard)) {
						topCard = _.sample(game.deck).id;
					}
					allRequestedCards.push(topCard);
				}
				// Take second card from fixture if specified
				if (secondCardId) {
					secondCard = secondCardId;
				}
				// Otherwise select it randomly from remaining cards
				else {
					secondCard = _.sample(game.deck).id;
					while (allRequestedCards.includes(secondCard)) {
						secondCard = _.sample(game.deck).id;
					}
					allRequestedCards.push(secondCard);
				}

				const gameUpdates = {
					topCard,
					secondCard,
				};
				const updatePromises = [
					Game.updateOne(game.id)
						.set(gameUpdates),
					User.replaceCollection(p0.id, 'hand')
						.members(p0HandCardIds),
					User.replaceCollection(p0.id, 'points')
						.members(p0PointCardIds),
					User.replaceCollection(p0.id, 'faceCards')
						.members(p0FaceCardIds),
					User.replaceCollection(p1.id, 'hand')
						.members(p1HandCardIds),
					User.replaceCollection(p1.id, 'points')
						.members(p1PointCardIds),
					User.replaceCollection(p1.id, 'faceCards')
						.members(p1FaceCardIds),
					Game.replaceCollection(game.id, 'scrap')
						.members(scrapCardIds),
					Game.removeFromCollection(game.id, 'deck')
						.members(allRequestedCards)
				];

				return Promise.all([game, ...updatePromises]);
			})
			.then(function populateGame(values) {
				const [ game ] = values;
				return gameService.populateGame({ gameId: game.id});
			})
			.then(function publishAndRespond(game) {
				// Announce update through socket
				Game.publish([game.id], {
					verb: 'updated',
					data: {
						change: 'loadFixture',
						game,
					},
				});
				// Respond 200 OK
				return res.ok(game);
			})
			.catch(function handleError(err) {
				return res.badRequest(err);
			});
	},
};

