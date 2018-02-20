app.controller("menuController", ['$scope', '$window', function ($scope, $window) {
	var self = this;
	self.tab = "signup";
	self.games = [];
	self.userId = null;
	self.playerReady = false;
	self.opReady = false;
	self.gameId = null;
	self.loggedIn = $window.loggedIn;
	self.gameId = $window.gameId;

	self.requestGames = function () {
		io.socket.get("/game/getList", function (res, jwres) {
			// Success
			if (jwres.statusCode === 200) {
				if (res.inGame) {
					self.tab = 'gameView';
					self.userId = res.userId;
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

	self.logOut = function () {
		io.socket.get("/user/logout", function (res, jwres) {
			// Success
			if (jwres.statusCode === 200) {
				self.tab = "signup";
				self.loggedIn = false;
				$scope.$apply();
			} else {
				alert(jwres.error.message);
			}
		})
	}

	self.populateGameTest = function () {
		io.socket.get("/game/populateGameTest", function (res, jwres) {
			console.log(jwres);
		});
	}


	///////////////////////////
	// Socket Event Handlers //
	///////////////////////////
	io.socket.on("game", function(obj) {
		switch (obj.verb) {
			case 'created':
				self.games.push(obj.data);
				break;
			case 'updated':
				switch (obj.data.change) {
					case 'ready':
						if (obj.data.userId === self.userId) {
							self.playerReady = !self.playerReady;
						} else {
							self.opReady = !self.opReady;
						}
						break;
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

	io.socket.on("leftGame", function (obj) {
		self.games.forEach(function (game) {
			var bool = (game.id === obj.id);
			if (game.id === obj.id) game.status = true;
		});
		$scope.$apply();
	});
}]); //End menuController()