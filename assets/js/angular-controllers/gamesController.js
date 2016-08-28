app.controller("gamesController", ['$scope', '$http', function ($scope, $http) {
	var menu = $scope.menu;
	var self = this;

	self.draw = function () {
		console.log("Drawing");
		io.socket.post("/game/draw", function (res, jwres) {
			console.log(jwres);
		});
	};
}]);