app.controller("lobbyController", ['$scope', '$http', function ($scope, $http) {
	var menu = $scope.menu;
	var self = this;
	self.displayAce = false;
	self.aceClicked = false;
	$scope.cardCheck = true;
	// self.oneReady = false;
	self.aceRules = function() {
		self.displayAce = !self.displayAce;
	};
	self.startAce = function() {
		self.aceClicked = !self.aceClicked;
	}

	// Upon clicking ready button
	self.ready = function () {
		self.oneReady = true;
		io.socket.put("/game/ready", function (res, jwres) {
			console.log(jwres);
			if (jwres.statusCode != 200) {
				alert(jwres.error.message);
			}
		});
	};

	self.leave = function () {
		console.log("\nLeaving lobby");
		io.socket.put("/game/leaveLobby", function (res, jwres) {
			console.log(jwres);
			menu.tab = "gamesOverview";
			menu.playerReady = false;
			menu.gameId = null;
			if (jwres.statusCode != 200) {
				alert(jwres.error.message);
			}
			$scope.$apply();
		});
	};

// Player left game handler
io.socket.on("leftGame", function (obj) {
	console.log("someone left a game");
	console.log(obj);
	console.log(menu.gameId);
	if (menu.gameId) {
		console.log("someone left my game");
		if (menu.gameId == obj.id) {
			menu.opReady = false;
			$scope.$apply();
		}
	}
});

}]);