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
	}

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

	////////////////////
	// Drop Callbacks //
	////////////////////
	self.dropPoints = function (targetIndex) {
		io.socket.put("/game/points", 
		{
			cardId: self.game.players[self.pNum].hand[dragIndex].id
		},
		function (res, jwres) {
			if (jwres.statusCode != 200) alert(jwres.error);
		}
		);
	};
	///////////////////////////
	// Socket Event Handlers //
	///////////////////////////
	io.socket.on('game', function (obj) {
		console.log(obj)
		switch (obj.verb) {
			case 'updated':
				switch (obj.data.change) {
					case 'Initialize':
						self.game = obj.data.game;
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