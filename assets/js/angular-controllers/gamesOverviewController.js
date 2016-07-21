app.controller("gamesOverviewController", ['$scope', function($scope) {
	var self = this;
	self.games = [];
	self.gameName = "";
	self.createGame = function() {
		io.socket.get('/game/create', 
		{
			gameName: self.gameName
		},
		function(res, jwres){
			console.log(res);
		});
	};
}]);