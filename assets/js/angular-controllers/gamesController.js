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
	self.scuttle = function (card, target) {
		io.socket.put("game/scuttle", 
			{
				opId: self.game.players[(self.pNum + 1) % 2].id,
				cardId: card.id,
				targetId: target.id
			},
			function (res, jwres) {
				if (jwres.statusCode != 200) alert(jwres.error.message);
			}
		);
	};
	// TODO: Target OneOff
	// TODO: Jack

	////////////////////////
	// Dragover Callbacks //
	////////////////////////
	self.dragoverPoints = function (targetIndex) {
		if (self.game.players[self.pNum].hand[dragIndex].rank < 11) {
			return true;
		} else {
			return false;
		}
	};
	self.dragoverRunes = function (targetIndex) {
		if ((self.game.players[self.pNum].hand[dragIndex].rank >= 12 && self.game.players[self.pNum].hand[dragIndex].rank <= 13) || self.game.players[self.pNum].hand[dragIndex].rank === 8) {
			return true;
		} else {
			return false;
		}
	};
	self.dragoverOpPoint = function (targetIndex) {
		if (self.game.players[self.pNum].hand[dragIndex].rank <= 10) {
			return true;
		} else {
			return false;
		}
	};

	////////////////////
	// Drop Callbacks //
	////////////////////
	self.dropPoints = function (targetIndex) {
		io.socket.put("/game/points", 
		{
			cardId: self.game.players[self.pNum].hand[dragIndex].id,
			// opId: self.game.players[(self.pNum + 1) % 2].id
		},
		function (res, jwres) {
			console.log(jwres);
			if (jwres.statusCode != 200) alert(jwres.error.message);
		}
		);
	};
	self.dropRunes = function (targetIndex) {
		io.socket.put("/game/runes", 
		{
			cardId: self.game.players[self.pNum].hand[dragIndex].id
		},
		function (res, jwres) {
			if (jwres.statusCode != 200) alert(jwres.error.message);
		}
		)
	}
	self.dropOpPoint = function (targetIndex) {
		switch (self.game.players[self.pNum].hand[dragIndex].rank) {
			case 9:
				break;
			case 11:
				break;
			// Can't play kings and queens on point card
			case 12:
			case 13:
				alert("You can only play Kings and Queens in your own Runes");
				break;
			default:
				self.scuttle(self.game.players[self.pNum].hand[dragIndex], self.game.players[(self.pNum + 1) % 2].points[targetIndex]);
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