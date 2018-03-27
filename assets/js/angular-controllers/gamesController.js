app.controller("gamesController", ['$scope', '$http', function ($scope, $http) {
 	var self = this;
 	var menu = $scope.menu;
	self.game = null;
	self.pNum = null;
	self.oppPointCap = 21;
	self.yourPointCap = 21;
	self.resolvingFour = false;
	self.cardsToDiscard = [];
	self.resolvingThree = false;
	self.resolvingSeven = false;
	self.waitingForOp = false;
	self.askCounter = false;
	self.countering = false;
	self.opResolvingSeven = false;
	self.gameCount = 0;
	self.gameOver = false;
	self.logDisplay = "gameLog";
	self.chatEntry = "";
	self.legalMoves = [];
	self.cardCloseUp = false;
	self.viewCard = null;
	self.displayModal = false;
	self.modalHeader = "";
	self.modalBody = "";
	self.modalButtons = "";
	self.nineId = null;
	self.nineTargetId = null;
	// Sounds
	var soundPlayCard = document.createElement("audio");
	soundPlayCard.src = "./sounds/play_card.mp3";
	soundChat = document.createElement("audio");
	soundChat.src = "./sounds/chat.mp3";

	//DEVELOPMENT ONLY - REMOVE IN PRODUCTION
	// self.showDeck = false;


	self.requestDenied = function (jwres) {
		self.displayModal = true;
		self.modalHeader = "Illegal Action";
		self.modalButtons = "Okay";
		if (typeof(jwres.error) === "string") {
			// alert(jwres.error);
			self.modalBody = jwres.error;
		} else {
			// alert(jwres.error.message);
			self.modalBody = jwres.error.message;
		}
		if (jwres.statusCode === 403) {
			menu.tab = 'reLogin';
		}
		$scope.$apply();
	};

	self.clearModal = function () {
		self.displayModal = false;
		self.modalHeader = "";
		self.modalBody = "";
		self.modalButtons = "";	
	};

	// Concede game
	self.concede = function () {
		var conf = confirm("Are you sure you want to concede?");
		if (conf) {
			io.socket.post("/game/concede", function (res, jwres) {
				// console.log(jwres);
				if (jwres.statusCode != 200) {
					// alert(jwres.error.message);
					// if (jwres.statusCode === 403) {
					// 	menu.tab = 'reLogin';
					// }
					self.requestDenied(jwres);
				}
			});
		}
	};
	// Draw a card
	self.draw = function () {
		if (!self.countering && !self.resolvingFour && !self.resolvingThree && !self.waitingForOp && !self.resolvingSeven && !self.opResolvingSeven) {
			io.socket.post("/game/draw", function (res, jwres) {
				// console.log(jwres);
				if (jwres.statusCode != 200) {
					// alert(jwres.error.message);
					// console.log(jwres);
					// if (jwres.statusCode === 403) {
					// 	console.log("access denied");
					// 	menu.tab = 'reLogin';
					// 	$scope.$apply();
					// }
					self.requestDenied(jwres);
				}
			});
		}
	};
	// Pass your turn (only when deck is empty)
	self.pass = function () {
		// console.log("Requesting to pass");
		if (!self.countering && !self.resolvingFour && !self.resolvingThree && !self.waitingForOp && !self.resolvingSeven && !self.opResolvingSeven) {
			io.socket.post("/game/pass", function (res, jwres) {
				// console.log(jwres);
				if (jwres.statusCode != 200) {
					// alert(jwres.error.message);
					// console.log(jwres);
					// if (jwres.statusCode === 403) {
					// 	menu.tab = 'reLogin';
					// }
					self.requestDenied(jwres);
				}
			});
		}
	};
	// Request to resolve opponent's one-off (decline to counter)
	self.resolve = function () {
		self.askCounter = false;
		self.clearModal();
		io.socket.put("/game/resolve", 
			{
				opId: self.opponent.id
			},
			function (res, jwres) {
				if (jwres.statusCode != 200) {
					// alert(jwres.error.message);
					// console.log(jwres);
					// if (jwres.statusCode === 403) {
					// 	menu.tab = 'reLogin';
					// }
					self.requestDenied(jwres);
				}
		});
	};
	// Request to add message to game chat
	self.chat = function () {
		// console.log("requesting to chat: " + self.chatEntry);
		io.socket.put("/game/chat", 
		{
			msg: self.chatEntry
		},
		function (res, jwres) {
			self.chatEntry = "";
			$scope.$apply();
			if (jwres.statusCode != 200) {
				// console.log("Error with chat:");
				// console.log(jwres);
				// if (jwres.statusCode === 403) {
				// 	menu.tab = 'reLogin';
				// }
				self.requestDenied(jwres);
			}
		});
	};
	// Switch between game log and chat
	self.toggleLog = function (str) {
		self.logDisplay = str;
		log = document.getElementById("logText");
		log.scrollTop = log.scrollHeight;
		// $scope.$apply();
	};
	// Determine legal moves while dragging card for highlighting
	self.findLegalMoves = function() {
		self.legalMoves = [];
		self.viewCard = null;
		switch (dragData.rank) {
			case 1:
			case 3:
			case 4:
			case 5:
			case 6:
			case 7:
				self.legalMoves.push("points");
				self.legalMoves.push("scrap");
				// Determine legal scuttles
				self.opponent.points.forEach(function (point) {
					if ( point.rank < dragData.rank || (point.rank == dragData.rank && point.suit < dragData.suit) ) {
						self.legalMoves.push(point.id);
					}
				});
				break;
			case 2:
				self.legalMoves.push("points");
				self.opponent.points.forEach(function (point) {
					if ( point.rank < dragData.rank || (point.rank == dragData.rank && point.suit < dragData.suit) ) {
						self.legalMoves.push(point.id);
					}
				});
				switch (self.opQueenCount) {
					case 0:
						self.legalMoves.push("allRunes");
						// Determine legal scuttles
						break;
					case 1:
						// Find Queen among runes
						self.opponent.runes.forEach(function (rune) {
							if (rune.rank == 12) {
								self.legalMoves.push(rune.id);
							}
						});
						break;
				}
				break;
			case 8:
				self.legalMoves.push("points");
				self.legalMoves.push("runes");
				// Find legal scuttles
				self.opponent.points.forEach(function (point) {
					if ( point.rank < dragData.rank || (point.rank == dragData.rank && point.suit < dragData.suit) ) {
						self.legalMoves.push(point.id);
					} 
				});
				break;
			case 9:
				self.legalMoves.push("points");
				// Find legal scuttles
				self.opponent.points.forEach(function (point) {
					if ( point.rank < dragData.rank || (point.rank == dragData.rank && point.suit < dragData.suit) ) {
						self.legalMoves.push(point.id);
					}
				});
				switch (self.opQueenCount) {
					case 0:
						self.legalMoves.push("allRunes");
						self.legalMoves.push("allPoints");
						break;
					case 1:
						// Find Queen among opponent's runes
						self.opponent.runes.forEach(function (rune) {
							if (rune.rank == 12) {
								self.legalMoves.push(rune.id);
							}
						});
						break;
				}
				break;
			case 10:
				self.legalMoves.push("points");
				self.opponent.points.forEach(function (point) {
					if ( point.rank < dragData.rank || (point.rank == dragData.rank && point.suit < dragData.suit) ) {
						self.legalMoves.push(point.id);
					}
				});
				break;
			case 11:
				if (self.opQueenCount == 0) {
					self.legalMoves.push("allPoints");
				}
				break;
			case 12:
			case 13:
				self.legalMoves.push("runes");
				break;

		}
		$scope.$apply();
	};
	self.clearLegalMoves = function () {
		self.legalMoves = [];
		$scope.$apply();
	};


	//////////////////////////////////
	// Target Opponent Card Helpers //
	//////////////////////////////////

	// Called when you play a nine, if you then choose to scuttle
	self.nineScuttle = function () {
		self.scuttle(self.nineId, self.nineTargetId);
		self.clearModal();
		self.nineId = null;
		self.nineTargetId = null;
	};

	self.scuttle = function (cardId, targetId) {
		if (!self.resolvingSeven) {		
			io.socket.put("/game/scuttle", 
				{
					opId: self.game.players[(self.pNum + 1) % 2].id,
					cardId: cardId,
					targetId: targetId,
					// index: dragData.index
				},
				function (res, jwres) {
					// console.log(jwres);
					if (jwres.statusCode != 200) {
						// alert(jwres.error.message);
						// if (jwres.statusCode === 403) {
						// 	menu.tab = 'reLogin';
						// }
						self.requestDenied(jwres);
					}
					self.nineId = null;
					self.nineTargetId = null;
				}
			);
		} else {
			// Resolve seven case
			io.socket.put("/game/seven/scuttle", 
			{
				opId: self.opponent.id,
				cardId: cardId,
				targetId: targetId
			},
			function (res, jwres) {
				// console.log(jwres);
				if (jwres.statusCode != 200) {
					// alert(jwres.error.message);
					// if (jwres.statusCode === 403) {
					// 	menu.tab = 'reLogin';
					// }
					self.requestDenied(jwres);
				} else {
					self.clearModal();
					$scope.$apply();				
				}
			});
		}
	}; //End scuttle()
	self.jack = function (cardId, targetId) {
		if (!self.resolvingSeven) {		
			io.socket.put("/game/jack", 
				{
					opId: self.game.players[(self.pNum + 1) % 2].id,
					cardId: cardId,
					targetId: targetId
				},
				function (res, jwres) {
					// console.log(jwres);
					if (jwres.statusCode != 200) {
						// alert(jwres.error.message);
						// if (jwres.statusCode === 403) {
						// 	menu.tab = 'reLogin';
						// }
						self.requestDenied(jwres);
					}
				}
			)
		} else {
			// Resolve seven case
			io.socket.put("/game/seven/jack", 
				{
					opId: self.opponent.id,
					cardId: cardId,
					targetId: targetId,
					index: dragData.index
				},
				function (res, jwres) {
					// console.log(jwres);
					if (jwres.statusCode != 200) {
						// alert(jwres.error.message);
						// if (jwres.statusCode === 403) {
						// 	menu.tab = 'reLogin';
						// }
						self.requestDenied(jwres);
					} else {
						self.clearModal();
						$scope.$apply();
					}
				}
			);
		}
	}; //End jack()

	// Called when player chooses to play a nine as a one-off
	// 		targeting a point card
	self.nineTargetedOneOff = function () {
		console.log("nineTargetedOneOff");
		self.targetedOneOff(self.nineId, self.nineTargetId, "point");
		self.clearModal();
		self.nineId = null;
		self.nineTargetId = null;
	};

	self.targetedOneOff = function (cardId, targetId, targetType, pointId) {
		var pId = null;
		self.waitingForOp = true;
		if (pointId) pId = pointId; //pointId only applies if player is targeting a jack; pointId is the ID of the attached point card
		if (!self.resolvingSeven) {		
			io.socket.put("/game/targetedOneOff", 
			{
				opId: self.opponent.id,
				cardId: cardId,
				targetId: targetId,
				targetType: targetType,
				pointId: pId
			},
			function (res, jwres) {
				// console.log(jwres);
				if (jwres.statusCode != 200) {
					// alert(jwres.error.message);
					// if (jwres.statusCode === 403) {
					// 	menu.tab = 'reLogin';
					// }
					self.waitingForOp = false;
					self.requestDenied(jwres);
				}
			});
		} else {
			// Resolving seven case
			io.socket.put("/game/seven/targetedOneOff", 
			{
				opId: self.opponent.id,
				cardId: cardId,
				targetId: targetId,
				targetType: targetType,
				pointId: pId,
				index: dragData.index
			}, function (res, jwres) {
				// console.log(jwres);
				if(jwres.statusCode != 200) {
					// alert(jwres.error.message);
					// if (jwres.statusCode === 403) {
					// 	menu.tab = 'reLogin';
					// }
					self.waitingForOp = false;
					self.requestDenied(jwres);
				} else {
					self.clearModal();
					$scope.$apply();
				}
			});
		}
	}; //End targetedOneOff()

	////////////////////////////////////
	// DEVELOPMENT ONLY - FOR TESTING //
	////////////////////////////////////
	self.stackDeck = function (cardId, $event) {
		$event.stopPropagation();
		io.socket.put("/game/stackDeck", 
			{
				cardId: cardId
			},
			function (res, jwres) {
				// console.log(jwres);
			}
		);
	};

	self.deleteDeck = function ($event) {
		$event.stopPropagation();
		console.log("deleting deck");
		io.socket.put("/game/deleteDeck", 
			function (res, jwres) {
				console.log(jwres);
			});
	};

	////////////////////////
	// Dragover Callbacks //
	////////////////////////
	self.dragoverPoints = function (targetIndex) {
		if (!self.countering && !self.resolvingFour && !self.resolvingThree && !self.waitingForOp) {
			if (dragData.rank < 11) {
				if ((!self.resolvingSeven && !self.opResolvingSeven && dragData.type === 'hand') || (self.resolvingSeven && dragData.type === 'deck')) {
					return true;
				}
			} else {
				return false;
			}
		}
	};
	self.dragoverRunes = function (targetIndex) {
		if (!self.countering && !self.resolvingFour && !self.resolvingThree && !self.waitingForOp) {
			if ((dragData.rank >= 12 && dragData.rank <= 13) || dragData.rank === 8) {
				if ((!self.resolvingSeven && !self.opResolvingSeven && dragData.type === 'hand') || (self.resolvingSeven && dragData.type === 'deck')) {
					return true;
				}
			} else {
				return false;
			}
		}
	};
	self.dragoverOpPoint = function (targetIndex) {
		// console.log("TargetIndex:" + targetIndex);
		// console.log(self.opponent.points[targetIndex]);
		if (targetIndex != null) {
			if (!self.countering && !self.resolvingFour && !self.resolvingThree && !self.waitingForOp) {
				if (dragData.rank <= 11) {
										//Confirm that card is being played from hand 									or from deck if resolving seven 														and that scuttle is legal 																												  or that you are playing a 9 one-off or jack legally																					
					if ( ( (!self.resolvingSeven && !self.opResolvingSeven && dragData.type === 'hand') || (self.resolvingSeven && dragData.type === 'deck') ) && ((dragData.rank > self.opponent.points[targetIndex].rank || (dragData.rank === self.opponent.points[targetIndex].rank && dragData.suit > self.opponent.points[targetIndex].suit) ) || ([9, 11].indexOf(dragData.rank) > -1 && self.opQueenCount === 0) ) ) {
						// console.log("targetIndex: " + targetIndex);
						return true;
					}
				} else {
					return false;
				}
			}
		}
	};
	self.dragoverOpRune = function (targetIndex) {
		if (!self.countering && !self.resolvingThree && !self.resolvingFour) {
			if (dragData.rank === 9 || dragData.rank === 2) {
				if ((!self.resolvingSeven && !self.opResolvingSeven && dragData.type === 'hand' && !self.waitingForOp) || (self.resolvingSeven && dragData.type === 'deck')) {
					return true;
				}
			}
			return false;
		}
	};
	self.dragoverOpJack = function (targetIndex) {
		if (!self.countering && !self.resolvingThree && !self.resolvingFour && !self.waitingForOp) {
			if (dragData.rank === 9 || dragData.rank === 2) {
				if ((!self.resolvingSeven && !self.opResolvingSeven && dragData.type === 'hand') || (self.resolvingSeven && dragData.type === 'deck')) {
					return true;
				}
			}
			return false;
		}
	}
	self.dragoverScrap = function (targetIndex) {
		if (!self.countering && !self.resolvingFour && !self.resolvingThree && !self.waitingForOp) {
			switch (dragData.rank) {
				case 1:
				case 3:
				case 4:
				case 5:
				case 6:
				case 7:
					if ((!self.resolvingSeven && !self.opResolvingSeven && dragData.type === 'hand') || (self.resolvingSeven && dragData.type === 'deck')) {
						return true;
					}
					break;
				default:
					return false;
					break;
			}
		} else {
			// If countering, only allow playing a two
			if (dragData.rank === 2) {
				return true
			} else {
				return false;
			}
		}
	};
	self.dragoverOneOff = function (targetIndex) {
		if (dragData.rank == 2) {
			return true;
		} else {
			return false;
		}
	};

	////////////////////
	// Drop Callbacks //
	////////////////////
	self.dropPoints = function (targetIndex) {
		// alert("played points!");
		// console.log(dragData);
		if (!self.resolvingSeven) {		
			io.socket.put("/game/points", 
			{
				cardId: dragData.id,
			},
			function (res, jwres) {
				// alert("console printed");
				if (jwres.statusCode != 200) {
					self.requestDenied(jwres);
				}
			});
		//Resolving Seven case
		} else {
			io.socket.put("/game/seven/points", 
			{
				cardId: dragData.id,
				index: dragData.index
			},
			function (res,jwres) {
				// console.log(jwres);
				if (jwres.statusCode != 200) {
					// alert(jwres.error.message);
					self.requestDenied(jwres);
				} else {
					self.clearModal();
					$scope.$apply();
				}
			});
		}
	};
	self.dropRunes = function (targetIndex) {
		if (!self.resolvingSeven) {
			io.socket.put("/game/runes", 
			{
				cardId: dragData.id
			},
			function (res, jwres) {
				if (jwres.statusCode != 200) {
					// alert(jwres.error.message);
					self.requestDenied(jwres);
				}
			}
			)
		} else {
			//Resolving seven case
			io.socket.put("/game/seven/runes",
			{
				cardId: dragData.id,
				index: dragData.index
			}, function (res, jwres) {
				// console.log(jwres);
				if (jwres.statusCode != 200) {
					// alert(jwres.error.message);
					self.requestDenied(jwres);
				} else {
					self.clearModal();
					$scope.$apply();
				}
			});
		}
	};
	self.dropOpPoint = function (targetIndex) {
		switch (dragData.rank) {
			case 9:
				// var conf = confirm("Press 'Ok' to Scuttle, and 'Cancel' to play your Nine as a One-Off");
				// if (conf) {
				// 	self.scuttle(dragData.id, self.game.players[(self.pNum + 1) % 2].points[targetIndex].id);
				// } else {
				// 	self.targetedOneOff(dragData.id, self.opponent.points[targetIndex].id, "point");
				// }
				self.displayModal = true;
				self.modalHeader = "Choose your move";
				self.modalBody = "Would you like to Scuttle, or Play your nine as a One-Off?";
				self.modalButtons = "Nine";
				self.nineTargetId = self.opponent.points[targetIndex].id;
				self.nineId = dragData.id;
				break;
			case 11:
				self.jack(dragData.id, self.game.players[(self.pNum + 1) % 2].points[targetIndex].id);
				break;
			// Can't play kings and queens on point card
			case 12:
			case 13:
				self.displayModal = true;
				self.modalHeader = "Illegal Action";
				self.modalBody = "You can only play Kings and Queens in your Boons area";
				self.modalButtons = "Okay";
				// alert("You can only play Kings and Queens in your own Runes");
				break;
			default:
				self.scuttle(dragData.id, self.game.players[(self.pNum + 1) % 2].points[targetIndex].id);
				break;
		}
		// alert("left switch statement");
	};
	self.dropOpRune = function (targetIndex) {
		self.targetedOneOff(dragData.id, self.opponent.runes[targetIndex].id, "rune");
	};
	self.dropOpJack = function (targetIndex) {
		self.targetedOneOff(dragData.id, self.opponent.points[targetIndex].attachments[self.opponent.points[targetIndex].attachments.length - 1].id, "jack", self.opponent.points[targetIndex].id);
	};
	self.dropScrap = function (targetIndex) {
		self.waitingForOp =  true;
		if (!self.countering) {		
			if (!self.resolvingSeven) {			
				io.socket.put("/game/untargetedOneOff", 
					{
						cardId: dragData.id,
						opId: self.opponent.id
					},
					function (res, jwres) {
						// console.log(jwres);
						if (jwres.statusCode != 200) {
							// alert(jwres.error.message);
							self.waitingForOp = false;
							self.requestDenied(jwres);
						}
					}
				);
			} else {
				//Resolving seven case
				io.socket.put("/game/seven/untargetedOneOff",
				{
					cardId: dragData.id,
					index: dragData.index
				},
				function (res, jwres) {
					// console.log(jwres);
					if (jwres.statusCode != 200) {
						// alert(jwres.error.message);
						self.waitingForOp = false;
						self.requestDenied(jwres);
					} else {
						self.clearModal();
						$scope.$apply();
					}
				});
			}
		} else {
			// If player dropped a two to counter, request to counter
			io.socket.put("/game/counter", 
			{
				opId: self.opponent.id,
				cardId: self.player.hand[dragData.index].id
			},
			function (res, jwres) {
				if (jwres.statusCode != 200){
					var willCounter = confirm("Failed to counter: " + jwres.error.message + " Would you like to counter with a two?");
					if (!willCounter) {
						self.countering = false;
						// Request resolution if not countering
						io.socket.put("/game/resolve", 
							{
								opId: self.opponent.id
							},
							function (res, jwres) {
								if (jwres.statusCode != 200) {
									// alert(jwres.error.message);
									self.requestDenied(jwres);
								}
						});						
					}
				} else {
					self.countering = false;
				} 
			});
		}
	};
	// Request to counter opponent's oneoff
	self.counter = function (index) {
		io.socket.put("/game/counter", 
		{
			opId: self.opponent.id,
			cardId: self.player.hand[dragData.index].id
		},
		function (res, jwres) {
			// console.log(jwres);
			if (jwres.statusCode != 200) {
				console.log(jwres);
				// Handle error
				self.requestDenied(jwres);
			} else {
				self.askCounter = false;
				$scope.$apply();
			}
		});
	};
	// Upon clicking a card in your hand,
	// Check if a 4 is being resolved, and discard that card
	self.clickCard = function (card, $event)  {
		if (self.resolvingFour) {
			if (self.cardsToDiscard.indexOf(card) > -1) {
				self.cardsToDiscard = [];
			} else {
				self.cardsToDiscard.push(card);
				if (self.cardsToDiscard.length == 2) {
					io.socket.put("/game/resolveFour", 
						{
							cardId1: self.cardsToDiscard[0].id,
							cardId2: self.cardsToDiscard[1].id
						},
						function (res, jwres) {
							// console.log(jwres);
							if (jwres.statusCode != 200) {
								// alert(jwres.error.message);
								self.requestDenied(jwres);
							} else {
								self.resolvingFour = false;
								self.cardsToDiscard = [];
								self.clearModal();
								$scope.$apply();
							}
						});
					// Check if user has only 1 card in hand (this must be discarded)
				} else if(self.player.hand.length === 1) {
					io.socket.put("/game/resolveFour", 
						{
							cardId1: self.cardsToDiscard[0].id
						},
						function (res, jwres) {
							// console.log(jwres);
							if (jwres.statusCode != 200) {
								// alert(jwres.error.message);
								self.requestDenied(jwres);
							} else {
								self.resolvingFour = false;
								self.cardsToDiscard = [];
								self.clearModal();						
								$scope.$apply();
							}

						}); 
				}
			}
		} else {
			$event.stopPropagation();
			if (!self.displayModal && ! self.askCounter) {
				if(self.viewCard != card) {
					self.viewCard = card;
				} else {
					self.viewCard = null;
				}
			}
		}

	}; //End clickCard()
	

	self.disableCardView = function() {
		self.viewCard = null;
	}

	//Upon clicking a card in the scrap pile, request to draw that card
	self.chooseScrapCard = function (index) {
		io.socket.put("/game/resolveThree", {
			cardId: self.game.scrap[index].id
		}, function (res, jwres) {
			self.resolvingThree = false;
			if (jwres.statusCode != 200) {
				// alert(jwres.error.message);
				self.requestDenied(jwres);
				// console.log(jwres);
			} else {
				self.clearModal();
				$scope.$apply();
			}
		})
	}; //End chooseScrapCard()


	///////////////////////////
	// Socket Event Handlers //
	///////////////////////////
	io.socket.on('game', function (obj) {
		// console.log("game event'");
		// console.log(obj);
		switch (obj.verb) {
			case 'updated':
				if (obj.data.change != 'Initialize' && obj.data.change != 'ready') {
					/* Update controller game from data in this event
					 	*	updateGame() is defined in js/app.js
					 */
					updateGame(self.game, obj.data.game);
					// Play sound effect
					if (obj.data.change != 'chat' && obj.data.change != 'concede') {
						soundPlayCard.play();
					} else if (obj.data.change == 'chat') {
						soundChat.play();
					}
				} else {
					self.game = obj.data.game;
				}
	
				// console.log(self.game);

				switch (obj.data.change) {
					case 'Initialize':
						if (self.pNum === null) {
							self.gameCount++;
							if (obj.data.hasOwnProperty('pNum')) {
								self.pNum = obj.data.pNum;
							} else {
								if (self.game.players[0].id === menu.userId) {
									self.pNum = 0;
								} else {
									self.pNum = 1;
								}
							}

							/*
							** Getter Attributes
							**
							*/
							if (self.gameCount === 1) {

								//glasses (true iff player has glasses eight)
								Object.defineProperty(self, 'glasses', {
									get: function () {
										if (self.game) {
											var res = false;
											self.game.players[self.pNum].runes.forEach(function (rune) {
												if (rune.rank === 8) res = true;
											});
											return res;
										} else {
											return null;
										}
									}
								});
								//player (player whose session this is)
								Object.defineProperty(self, 'player', {
									get: function () {
										if (self.game) {
											return self.game.players[self.pNum];
										} else {
											return null;
										}
									}
								});
								//opponent (other player)
								Object.defineProperty(self, 'opponent', {
									get: function () {
										if (self.game) {
											return self.game.players[(self.pNum + 1) % 2];
										} else {
											return null;
										}
									}
								});
								//two's in player's hand
								Object.defineProperty(self, 'twosInHand', {
									get: function () {
										if (self.game) {
											var res = 0;
											self.player.hand.forEach(function (card) {
												if (card.rank === 2) res++;
											});
											return res;
										} else {
											return null;
										}
									}
								});
								// Number of Kings opponent has
								Object.defineProperty(self, 'opKingCount', {
									get: function () {
										if (self.game) {
											var res = 0;
											self.opponent.runes.forEach(function (card) {
												if (card.rank === 13) res++;
											});
											return res;
										} else {
											return null;
										}
									}
								});
								// Number of Kings player has
								Object.defineProperty(self, 'yourKingCount', {
									get: function () {
										if (self.game) {
											var res = 0;
											self.player.runes.forEach(function (card) {
												if (card.rank === 13) res++;
											});
											return res;
										} else {
											return null;
										}
									}
								});	
								//Number of points opponent has
								Object.defineProperty(self, 'opPointCount', {
									get: function () {
										if (self.game) {
											res = 0;
											self.opponent.points.forEach(function (card) {
												res += card.rank;
											});
											return res;
										} else {
											return null;
										}
									}
								});	
								//Number of points player has
								Object.defineProperty(self, 'yourPointCount', {
									get: function () {
										if (self.game) {
											res = 0;
											self.player.points.forEach(function (card) {
												res += card.rank;
											});
											return res;
										} else {
											return null;
										}
									}
								});		
								//Whether it is this player's turn
								Object.defineProperty(self, 'yourTurn', {
									get: function () {
										if (self.game) {
											return self.pNum === self.game.turn % 2;
										} else {
											return null;
										}
									}
								});		
								//Number of cards in the deck (since deck = game.deck + game.topCard + game.secondCard)			
								Object.defineProperty(self, 'cardsInDeck', {
									get: function () {
										var res = self.game.deck.length;
										if (self.game.topCard) res++;
										if (self.game.secondCard) res++;
										return res;
									}
								});
								// Number of queens your opponent has
								Object.defineProperty(self, 'opQueenCount', {
									get: function () {
										var res = 0;
										self.opponent.runes.forEach(function (rune) {
											if (rune.rank === 12) res++; 
										});
										return res;
									}
								});
							}//End gameCount = 0 case
						} //End pNum = null case
						break; //End Initialize case
					case 'oneOff':
					case 'counter':
					case 'targetedOneOff':
					case 'sevenOneOff':
					case 'sevenTargetedOneOff':
						self.resolvingSeven = false;
						self.opResolvingSeven = false;
						var counteringPnum = (obj.data.pNum + 1) % 2;
						if (self.pNum == parseInt(counteringPnum)) {
							self.waitingForOp = false;
							if (self.twosInHand > 0) {
								if (self.opQueenCount < 1) {
									self.askCounter = true;								
									// var willCounter = confirm(self.game.log[self.game.log.length - 1] + " Would you like to counter with a two?");
									// if (!willCounter) {
										// Request resolution if not countering
										// io.socket.put("/game/resolve", 
										// 	{
										// 		opId: self.opponent.id
										// 	},
										// 	function (res, jwres) {
										// 		if (jwres.statusCode != 200) {
										// 			alert(jwres.error.message);
										// 			console.log(jwres);
										// 		}
										// });
									// } else {
									// 	// Allow user to counter
									// 	self.countering = true;
									// }
								} else {
									self.displayModal = true;
									self.modalHeader = self.game.log[self.game.log.length - 1];
									self.modalBody = "You cannot counter, because your opponent has a queen.";
									self.modalButtons = "Resolve";
									// alert(self.game.log[self.game.log.length - 1] + " You cannot counter, because your opponent has a queen");
									// io.socket.put("/game/resolve", 
									// 	{opId: self.opponent.id},
									// 	function (res, jwres) {
									// 		if (jwres.statusCode != 200) {
									// 			// alert(jwres.error.message);
									// 			self.requestDenied(jwres);
									// 			console.log(jwres);
									// 		}
									// });
								}
							} else {
								// alert(self.game.log[self.game.log.length - 1] + " You cannot counter, because you do not have a two");
								// Request resolution if can't counter
								self.displayModal = true;
								self.modalHeader = self.game.log[self.game.log.length - 1];
								self.modalBody = "You cannot counter, because you do not have a two.";
								self.modalButtons = "Resolve";


								// io.socket.put("/game/resolve", 
								// 	{
								// 		opId: self.opponent.id
								// 	},
								// 	function (res, jwres) {
								// 		if (jwres.statusCode != 200) {
								// 			// alert(jwres.error.message);
								// 			self.requestDenied(jwres);
								// 			console.log(jwres);
								// 		}
								// });
							}
						}
						break; //End oneOff & counter cases
					case 'resolve':
					// obj.data.pNum is the pNum who played the oneOff
						if (!obj.data.happened) self.waitingForOp = false;
						switch(obj.data.oneOff.rank) {
							case 3:
								if (obj.data.happened) {
									if (obj.data.playedBy === self.player.pNum) {
										self.waitingForOp = false;
										self.resolvingThree = true;
										self.displayModal = true;
										self.modalHeader = "Your " + obj.data.oneOff.name + " has resolved";
										self.modalBody = " Choose a card from the scrap pile to place in your hand."
										self.modalButtons = "Okay";
										// alert("You have resolved the " + obj.data.oneOff.name + " as a one-off; now choose one card from the scrap pile to place in your hand.");
									}
								}
								break; //End resolve 3 case
							case 4:
								if (obj.data.happened) {
									if (obj.data.playedBy === self.opponent.pNum) {
										self.waitingForOp = false;
										self.resolvingFour = true;
										self.displayModal = true;
										self.modalHeader = "Your opponent's " + obj.data.oneOff.name + " has resolved";
										self.modalButtons = "Okay";
										if (self.player.hand.length > 1) {
											self.modalBody = "You must discard two cards; click cards in your hand to discard them.";
											// alert("Your opponent has resolved the " + obj.data.oneOff.name + " as a one-off; you must discard two cards. Click cards in your hand to discard them");
										} else {
											self.modalBody = "You only have one card in your hand; you must click it to discard it.";
											// alert("Your opponent has resolved the " + obj.data.oneOff.name + " as a one-off, and you only have one card in your hand; you must click it to discard it.");
										}
									}
								}
								break; //End resolve 4 case
							case 7:
								if (obj.data.happened) {
									if (obj.data.playedBy === self.pNum) {
										self.waitingForOp = false;
										self.resolvingSeven = true;
										self.displayModal = true;
										self.modalHeader = "Your " + obj.data.oneOff.name + " has resolved";
										self.modalButtons = "Okay";
										self.modalBody = " Choose a card from the top two in the deck, and play it however you like.";
										// alert("You have resolved the " + obj.data.oneOff.name + " as a one-off; now choose a card from the top two in the deck, and play it however you like");
									} else {
										self.opResolvingSeven = true;
									}
								}
								break; //End resolve 7 case
							default:
								self.waitingForOp = false;
								break; //End resolve default case
						}
						break; //End resolve case
					case 'sevenPoints':
					case 'sevenRunes':
					case 'sevenScuttle':
					case 'sevenJack':
						self.resolvingSeven = false;
						self.opResolvingSeven = false;
						self.waitingForOp = false;
						break;
					case 'resolveThree':
					case 'resolveFour':
						self.waitingForOp = false;
						break;
				} //End switch on change
				// Handle Game Over (Winner, or Stalemate)
				if (obj.data.victory) {
					if (obj.data.victory.gameOver) {
						io.socket.put("/game/over", 
						function (res, jwres) {
							// console.log(jwres);
						});
						self.gameOver = true;
						// Game Ended with Legal Move (no one conceded)
						if (obj.data.change != 'concede') {
							// Game has winner
							if (obj.data.victory.winner != null) {
								// alert("Player " + obj.data.victory.winner + " has won!");
							// Game ends in stalemate (no winner)
							} else {
								self.displayModal = true;
								self.modalHeader = "Stalemate";
								self.modalBody = "Three passes in a row makes a stalemate. Well played!";
								self.modalButtons = "Okay";
								// alert("Three passes in a row makes this game a stalemate. Well Played!");
							}
						} else {
							var loser = (obj.data.victory.winner + 1) % 2;
							alert("Player " + loser + " has conceded; Player " + obj.data.victory.winner + " has won!");
						}
						// delete(menu.glasses);
						// delete(menu.player);
						// delete(menu.opponent);
						// delete(menu.twosInHand);
						// delete(menu.opKingCount);
						// delete(menu.yourKingCount);
						// delete(menu.opPointCount);
						// delete(menu.yourPointCount);
						// delete(menu.yourTurn);

					}
				}				
				break; //End obj.verb = "updated" case
		}
		$scope.$apply();
		log = document.getElementById("logText");
		log.scrollTop = log.scrollHeight;
		if (self.gameOver) {
			setTimeout(function () {			
				alert("Player " + obj.data.victory.winner + " has won!");
				self.pNum = null;
				self.game = null;
				self.gameOver = false;
				menu.playerReady = false;
				menu.opReady = false;
				menu.gameId = null;
				menu.tab = 'gamesOverview';
				$scope.$apply();
			}, 3000);
		}
	}); //End event handler for game objects

// Reconnect handler
	io.socket.on('connect', function (obj) {
		// Only attempt reconnect if front end already has game object
		if (self.game != null) {
			io.socket.put("/game/reconnect", function (res, jwres) {
				// Error reconnecting
				if (jwres.statusCode != 200) {
					if (jwres.statusCode === 403) {
						self.requestDenied();
					} else {
						alert("Error reconnecting websocket to server. Please log out, then log in again");
					}
				}
			});
		}
	});



	// If server says we are in a game, request game data on page load
	if (menu.gameId) {
		menu.tab = "gameView";
		io.socket.put("/game/gameData", function (res, jwres) {
			if (jwres.statusCode != 200) {
				console.log(jwres);
			} else {
				// console.log(res);
				self.pNum = res.pNum;
				self.game = res.game;
				self.gameCount = 1;
				// console.log("controller game");
				// console.log(self.game);


				/////////////////////////////////
				// Initialize Getter functions //
				/////////////////////////////////
				//glasses (true iff player has glasses eight)
				Object.defineProperty(self, 'glasses', {
					get: function () {
						if (self.game) {
							var res = false;
							self.game.players[self.pNum].runes.forEach(function (rune) {
								if (rune.rank === 8) res = true;
							});
							return res;
						} else {
							return null;
						}
					}
				});
				//player (player whose session this is)
				Object.defineProperty(self, 'player', {
					get: function () {
						if (self.game) {
							return self.game.players[self.pNum];
						} else {
							return null;
						}
					}
				});
				//opponent (other player)
				Object.defineProperty(self, 'opponent', {
					get: function () {
						if (self.game) {
							return self.game.players[(self.pNum + 1) % 2];
						} else {
							return null;
						}
					}
				});
				//two's in player's hand
				Object.defineProperty(self, 'twosInHand', {
					get: function () {
						if (self.game) {
							var res = 0;
							self.player.hand.forEach(function (card) {
								if (card.rank === 2) res++;
							});
							return res;
						} else {
							return null;
						}
					}
				});
				// Number of Kings opponent has
				Object.defineProperty(self, 'opKingCount', {
					get: function () {
						if (self.game) {
							var res = 0;
							self.opponent.runes.forEach(function (card) {
								if (card.rank === 13) res++;
							});
							return res;
						} else {
							return null;
						}
					}
				});
				// Number of Kings player has
				Object.defineProperty(self, 'yourKingCount', {
					get: function () {
						if (self.game) {
							var res = 0;
							self.player.runes.forEach(function (card) {
								if (card.rank === 13) res++;
							});
							return res;
						} else {
							return null;
						}
					}
				});	
				//Number of points opponent has
				Object.defineProperty(self, 'opPointCount', {
					get: function () {
						if (self.game) {
							res = 0;
							self.opponent.points.forEach(function (card) {
								res += card.rank;
							});
							return res;
						} else {
							return null;
						}
					}
				});	
				//Number of points player has
				Object.defineProperty(self, 'yourPointCount', {
					get: function () {
						if (self.game) {
							res = 0;
							self.player.points.forEach(function (card) {
								res += card.rank;
							});
							return res;
						} else {
							return null;
						}
					}
				});		
				//Whether it is this player's turn
				Object.defineProperty(self, 'yourTurn', {
					get: function () {
						if (self.game) {
							return self.pNum === self.game.turn % 2;
						} else {
							return null;
						}
					}
				});		
				//Number of cards in the deck (since deck = game.deck + game.topCard + game.secondCard)			
				Object.defineProperty(self, 'cardsInDeck', {
					get: function () {
						var res = self.game.deck.length;
						if (self.game.topCard) res++;
						if (self.game.secondCard) res++;
						return res;
					}
				});
				// Number of queens your opponent has
				Object.defineProperty(self, 'opQueenCount', {
					get: function () {
						var res = 0;
						self.opponent.runes.forEach(function (rune) {
							if (rune.rank === 12) res++; 
						});
						return res;
					}
				});

				///////////////////////////////////
				// Check game status on refresh: //
				///////////////////////////////////

				// Determine if either player is countering
				if (self.game.oneOff && !self.game.resolving) {
						if ( (!self.yourTurn && self.game.twos.length % 2 === 0) || (self.yourTurn && self.game.twos.length % 2 === 1)) {
								if (self.twosInHand > 0) {
									if (self.opQueenCount == 0) {
										self.askCounter = true;
									} else {
										// Opponent has a queen; can't counter
										self.displayModal = true;
										self.modalHeader = self.game.log[self.game.log.length - 1];
										self.modalBody = "You cannot counter, because your opponent has a queen.";
										self.modalButtons = "Resolve";
										// alert(self.game.log[self.game.log.length - 1] + " You cannot counter, because your opponent has a queen");

										// io.socket.put("/game/resolve", 
										// 	{opId: self.opponent.id},
										// 	function (res, jwres) {
										// 		if (jwres.statusCode != 200) {
										// 			alert(jwres.error.message);
										// 			console.log(jwres);
										// 		}
										// });
									}
								} else {
									// No two's in hand; can't counter
									self.displayModal = true;
									self.modalHeader = self.game.log[self.game.log.length - 1];
									self.modalBody = "You cannot counter, because you do not have a two.";
									self.modalButtons = "Resolve";									
									// alert(self.game.log[self.game.log.length - 1] + " You cannot counter, because you do not have a two");
									// io.socket.put("/game/resolve", 
									// 	{
									// 		opId: self.opponent.id
									// 	},
									// 	function (res, jwres) {
									// 		if (jwres.statusCode != 200) {
									// 			alert(jwres.error.message);
									// 			console.log(jwres);
									// 		}
									// });
								}
						} else {
							self.waitingForOp = true;
						}
				} 
				// Determine if we are in the middle of resolving a three, four, or seven
					if (self.game.resolving) {
						switch(self.game.resolving.rank) {
							case 3:
								if (self.yourTurn) {
									self.waitingForOp = false;
									self.resolvingThree = true;		
									self.displayModal = true;
									self.modalHeader = "Your " + self.game.resolving.name + " has resolved";
									self.modalBody = " Choose a card from the scrap pile to place in your hand."
									self.modalButtons = "Okay";
									// alert("You have resolved the " + self.game.resolving.name + " as a one-off; now choose one card from the scrap pile to place in your hand.");							
								}
								break;
							case 4:
								if (!self.yourTurn) {
									self.waitingForOp = false;
									self.resolvingFour = true;
									self.displayModal = true;
									self.modalHeader = "Your opponent's " + self.game.resolving.name + " has resolved";
									self.modalButtons = "Okay";
									if (self.player.hand.length > 1) {
										self.modalBody = "You must discard two cards; click cards in your hand to discard them.";
										// alert("Your opponent has resolved the " + self.game.resolving.name + " as a one-off; you must discard two cards. Click cards in your hand to discard them");
									} else {
										self.modalBody = "You only have one card in your hand; you must click it to discard it.";
										// alert("Your opponent has resolved the " + self.game.resolving.name + " as a one-off, and you only have one card in your hand; you must click it to discard it.");
									}
								} else {
									self.waitingForOp = true;
								}
								break;
							case 7:
								self.waitingForOp = false;
								if (self.yourTurn) {
									self.resolvingSeven = true;
									self.displayModal = true;
									self.modalHeader = "Your " + self.game.resolving.name + " has resolved";
									self.modalButtons = "Okay";
									self.modalBody = " Choose a card from the top two in the deck, and play it however you like.";									
									// alert("You have resolved the " + self.game.resolving.name + " as a one-off; now choose a card from the top two in the deck, and play it however you like");
								} else {
									self.opResolvingSeven = true;
								}
								break;
						}
					}

				$scope.$apply();
			}
		});
	} // End if (menu.game) {} (page refresh during game)

}]);