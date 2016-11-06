app.controller("gamesController", ['$scope', '$http', function ($scope, $http) {
 	var self = this;
 	var menu = $scope.menu;
	self.game = null;
	self.oppPointCap = 21;
	self.yourPointCap = 21;
	//DEVELOPMENT ONLY - REMOVE IN PRODUCTION
	self.showDeck = false;

	self.draw = function () {
		io.socket.post("/game/draw", function (res, jwres) {
			console.log(jwres);
			if (jwres.statusCode != 200) alert(jwres.error.message);
		});
	};

	///////////////////////////////////
	// Target Opponent Point Helpers //
	///////////////////////////////////
	self.scuttle = function (cardId, targetId) {
		// console.log("scuttling:");
		// console.log("opId: " + self.game.players[(self.pNum + 1) % 2].id + "\ncardId:" + cardId + "\ntargetId: " + targetId);
		io.socket.put("/game/scuttle", 
			{
				opId: self.game.players[(self.pNum + 1) % 2].id,
				cardId: cardId,
				targetId: targetId
			},
			function (res, jwres) {
				console.log(jwres);
				if (jwres.statusCode != 200) alert(jwres.error.message);
			}
		);
	};
	self.jack = function (cardId, targetId) {
		io.socket.put("/game/jack", 
			{
				opId: self.game.players[(self.pNum + 1) % 2].id,
				cardId: cardId,
				targetId: targetId
			},
			function (res, jwres) {
				console.log(jwres);
				if (jwres.statusCode != 200) alert(jwres.error.message);
			}
		)
	};

	self.stackDeck = function (cardId) {
		io.socket.put("/game/stackDeck", 
			{
				cardId: cardId
			},
			function (res, jwres) {
				console.log(jwres);
			}
		);
	};
	// TODO: Target OneOff

	////////////////////////
	// Dragover Callbacks //
	////////////////////////
	self.dragoverPoints = function (targetIndex) {
		if (!self.countering) {
			if (dragData.rank < 11) {
				return true;
			} else {
				return false;
			}
		}
	};
	self.dragoverRunes = function (targetIndex) {
		if (!self.countering) {
			if ((dragData.rank >= 12 && dragData.rank <= 13) || dragData.rank === 8) {
				return true;
			} else {
				return false;
			}
		}
	};
	self.dragoverOpPoint = function (targetIndex) {
		if (!self.countering) {
			if (dragData.rank <= 11) {
				return true;
			} else {
				return false;
			}
		}
	};
	self.dragoverScrap = function (targetIndex) {
		if (!self.countering) {
			switch (dragData.rank) {
				case 1:
				case 3:
				case 4:
				case 5:
				case 6:
				case 7:
					return true;
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

	////////////////////
	// Drop Callbacks //
	////////////////////
	self.dropPoints = function (targetIndex) {
		// TODO: Handle Seven resolution
		io.socket.put("/game/points", 
		{
			cardId: dragData.id,
		},
		function (res, jwres) {
			console.log(jwres);
			if (jwres.statusCode != 200) alert(jwres.error.message);
		}
		);
	};
	self.dropRunes = function (targetIndex) {
		// TODO: Handle Seven resolution
		io.socket.put("/game/runes", 
		{
			cardId: dragData.id
		},
		function (res, jwres) {
			if (jwres.statusCode != 200) alert(jwres.error.message);
		}
		)
	}
	self.dropOpPoint = function (targetIndex) {
		switch (dragData.rank) {
			case 9:
				var conf = confirm("Press 'Ok' to Scuttle, and 'Cancel' to play your Nine as a One-Off");
				if (conf) {
					self.scuttle(dragData.id, self.game.players[(self.pNum + 1) % 2].points[targetIndex].id);
				} else {
					// Play nine as one-off
				}
				break;
			case 11:
				self.jack(dragData.id, self.game.players[(self.pNum + 1) % 2].points[targetIndex].id);
				break;
			// Can't play kings and queens on point card
			case 12:
			case 13:
				alert("You can only play Kings and Queens in your own Runes");
				break;
			default:
				self.scuttle(dragData.id, self.game.players[(self.pNum + 1) % 2].points[targetIndex].id);
				break;
		}
	};
	self.dropScrap = function (targetIndex) {
		if (!self.countering) {		
			io.socket.put("/game/untargetedOneOff", 
				{
					cardId: dragData.id
				},

				function (res, jwres) {
					if (jwres.statusCode != 200) {
						alert(jwres.error.message);
					}
				}
			);
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
								if (jwres.statusCode != 200) alert(jwres.error.message);
						});						
					}
				} else {
					self.countering = false;
				} 
			});
		}
	};
	///////////////////////////
	// Socket Event Handlers //
	///////////////////////////
	io.socket.on('game', function (obj) {
		console.log("Game event");
		console.log(obj)
		switch (obj.verb) {
			case 'updated':
				self.game = obj.data.game;
				switch (obj.data.change) {
					case 'Initialize':
						if (self.game.players[0].id === menu.userId) {
							self.pNum = 0;
						} else {
							self.pNum = 1;
						}
						/*
						** Getter Attributes
						**
						*/
						//glasses (true iff player has glasses eight)
						Object.defineProperty(self, 'glasses', {
							get: function () {
								var res = false;
								self.game.players[self.pNum].runes.forEach(function (rune) {
									if (rune.rank === 8) res = true;
								});
								return res;
							}
						});
						//player (player whose session this is)
						Object.defineProperty(self, 'player', {
							get: function () {
								return self.game.players[self.pNum];
							}
						});
						//opponent (other player)
						Object.defineProperty(self, 'opponent', {
							get: function () {
								return self.game.players[(self.pNum + 1) % 2];
							}
						});
						//two's in player's hand
						Object.defineProperty(self, 'twosInHand', {
							get: function () {
								var res = 0;
								self.player.hand.forEach(function (card) {
									if (card.rank === 2) res++;
								});
								return res;
							}
						});
						// Number of Kings opponent has
						Object.defineProperty(self, 'opKingCount', {
							get: function () {
								var res = 0;
								self.opponent.runes.forEach(function (card) {
									if (card.rank === 13) res++;
								});
								return res;
							}
						});
						// Number of Kings player has
						Object.defineProperty(self, 'yourKingCount', {
							get: function () {
								var res = 0;
								self.player.runes.forEach(function (card) {
									if (card.rank === 13) res++;
								});
								return res;
							}
						});	
						//Number of points opponent has
						Object.defineProperty(self, 'opPointCount', {
							get: function () {
								res = 0;
								self.opponent.points.forEach(function (card) {
									res += card.rank;
								});
								return res;
							}
						});	
						//Number of points player has
						Object.defineProperty(self, 'yourPointCount', {
							get: function () {
								res = 0;
								self.player.points.forEach(function (card) {
									res += card.rank;
								});
								return res;
							}
						});							
						break;
					case 'oneOff':
					case 'counter':
					var counteringPnum = (obj.data.pNum + 1) % 2;
						if (self.pNum == parseInt(counteringPnum)) {
							if (self.twosInHand > 0) {
								var willCounter = confirm(self.game.log[self.game.log.length - 1] + " Would you like to counter with a two?");
								if (!willCounter) {
									// Request resolution if not countering
									io.socket.put("/game/resolve", 
										{
											opId: self.opponent.id
										},
										function (res, jwres) {
											if (jwres.statusCode != 200) {
												alert(jwres.error.message);
												console.log(jwres);
											}
									});
								} else {
									// Allow user to counter
									self.countering = true;
								}
							} else {
								alert(self.game.log[self.game.log.length - 1] + " You cannot counter, because you do not have a two");
								// Request resolution if can't counter
								io.socket.put("/game/resolve", 
									{
										opId: self.opponent.id
									},
									function (res, jwres) {
										if (jwres.statusCode != 200) {
											alert(jwres.error.message);
											console.log(jwres);
										}
								});
							}
						}
						break;
				}
				break;
		}
		$scope.$apply();
	});

}]);