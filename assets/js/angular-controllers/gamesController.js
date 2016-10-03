app.controller("gamesController", ['$scope', '$http', function ($scope, $http) {
 	var self = this;
 	var menu = $scope.menu;
	self.game = null;
	self.oppPointCap = 21;
	self.yourPointCap = 21;
	self.yourPointTotal;
	self.opponentPointTotal;

	self.draw = function () {
		console.log("Drawing");
		io.socket.post("/game/draw", function (res, jwres) {
			console.log(jwres);
			if (jwres.statusCode != 200) alert(jwres.error.message);
		});
	};

	self.testDropAllowed = function (handIndex, targetIndex) {
		// console.log("testing drop allowed");
		// console.log([handIndex, targetIndex]);
		handIndex = parseInt(handIndex);
		if (handIndex === targetIndex) {
			return true;
		} else {
			return false;
		}
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
		console.log("Playing jack:");
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
	}
	// TODO: Target OneOff

	////////////////////////
	// Dragover Callbacks //
	////////////////////////
	self.dragoverPoints = function (targetIndex) {
		if (dragData.rank < 11) {
			return true;
		} else {
			return false;
		}
	};
	self.dragoverRunes = function (targetIndex) {
		if ((dragData.rank >= 12 && dragData.rank <= 13) || dragData.rank === 8) {
			return true;
		} else {
			return false;
		}
	};
	self.dragoverOpPoint = function (targetIndex) {
		if (dragData.rank <= 11) {
			return true;
		} else {
			return false;
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
						break;
				}
				break;
		}
		$scope.$apply();
	});

}]);