app.controller("gamesController", ['$scope', '$http', function ($scope, $http) {
	var menu = $scope.menu;
	var self = this;
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
}]);