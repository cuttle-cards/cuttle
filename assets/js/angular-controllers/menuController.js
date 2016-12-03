app.controller("menuController", ['$scope', function ($scope) {
	var self = this;
	self.tab = "signup";
	self.games = [];
	self.userId = null;

	self.requestGames = function () {
		io.socket.get("/game/getList", function (res, jwres) {
			console.log(jwres);
			// Success
			if (jwres.statusCode === 200) {
				if (res.inGame) {
					self.tab = 'gameView';
					self.userId = res.userId;
					console.log(self.userId);
				} else {
					self.tab = "gamesOverview";
				}
				self.games = res.games;
			// Failure
			} else {
				console.log("Could not load games. Are you logged in?");
			}
			$scope.$apply();
		});
	};

	self.populateGameTest = function () {
		io.socket.get("/game/populateGameTest", function (res, jwres) {
			console.log(jwres);
		});
	}


	///////////////////////////
	// Socket Event Handlers //
	///////////////////////////
	io.socket.on("game", function(obj) {
		console.log(obj);
		switch (obj.verb) {
			case 'created':
				self.games.push(obj.data);
				break;
			case 'updated':
				switch (obj.data.change) {
					case 'Initialize':
						self.tab = "gameView";
						break;
					default:
						break;
				}
				break;
		}
		$scope.$apply();
	});

	io.socket.on("gameFull", function (obj) {
		self.games.forEach(function (game) {
			if (game.id === obj.id) game.status = false;
		});
		$scope.$apply();
	});

}]);