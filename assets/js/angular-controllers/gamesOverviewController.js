app.controller("gamesOverviewController", ['$scope', function($scope) {
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
		io.socket.put('/game/subscribe', {
			id: menu.games[index].id
		},
		function (res, jwres) {
			console.log("received subscription response");
			console.log(jwres);
			// Successful subscription
			if (jwres.statusCode === 200) {
				// make other req
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