app.controller("lobbyController", ['$scope', '$http', function ($scope, $http) {
	var self = this;
	var displayAce = false;
	self.aceRules = function() {
		displayAce = !displayAce;
		console.log(displayAce);
	}
}]);