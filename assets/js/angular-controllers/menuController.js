app.controller("menuController", ['$scope', function ($scope) {
	var self = this;
	self.tab = "signup";
	self.games = [];

	this.requestGames = function () {
		console.log("requesting game list");
		io.socket.get("/game/getList", function (res, jwres) {
			console.log(jwres);
			// Success
			if (jwres.statusCode === 200) {

				self.tab = "gamesOverview";
				self.games = res;


			// Failure
			} else {
				console.log("Could not load games. Are you logged in?");
			}
			$scope.$apply();
		});
	}

}]);