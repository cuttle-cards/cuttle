app.controller("gamesOverviewController", ['$scope', '$http', function($scope, $http) {
	var menu = $scope.menu;
	var self = this;
	self.gameName = "";
	self.createGame = function() {
		io.socket.get('/game/create', 
		{
			gameName: self.gameName
		},
		function(res, jwres){
			if (jwres.statusCode === 200) {
				// menu.games = res;
			} else {
				console.log("could not create game");
			}
			self.gameName = "";
			$scope.$apply();
		});
	};

	self.joinGame = function(index) {
		console.log("\njoining game");
		var gameId = menu.games[index].id
		io.socket.put('/game/subscribe', {
			id: gameId
		},
		function (res, jwres) {
			console.log("received subscription response");
			console.log(jwres);
			// Successful subscription
			if (jwres.statusCode === 200) {
				// Request to be brought to waiting lobby
				$http({
					method: 'PUT',
					url: 'game/lobbyView',
					data: {
						gameId: gameId,
					}
				})
				.then(
				function success (res) {
					// Replace page content with html from server
					document.querySelector("html").innerHTML = res.data;

				},
				function error (res) {
					console.log("Bad request for lobby view");
				}
				); //End of $http()

			// Could not subscribe
			} else {
				console.log("Unknown error subscribing to game: " + menu.games[index].id);
			}
		});
	};

	///////////////////////////
	// Socket Event Handlers //
	///////////////////////////
	io.socket.on("game", function(obj) {
		console.log("game event");
		console.log(obj);
		switch (obj.verb) {
			case 'created':
				menu.games.push(obj.data);
				break;
		}
		$scope.$apply();
	});
}]);