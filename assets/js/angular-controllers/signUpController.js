app.controller("signUpController", ['$scope', '$http', function ($scope, $http) {
	var self = this;
	var menu = $scope.menu;
	self.email = "";
	self.password = "";
	self.repeatPassword = "";

	self.submitSignUp = function () {
				// Socket Version
		// io.socket.post("/user/signup", {
		// 	email: self.email,
		// 	password: self.password,
		// }, function (res, jwres) {
		// 	console.log(jwres);
		// });

		$http({
			method: 'POST',
			url: '/user/signup',
			data: {
				email: self.email,
				password: self.password
			}
		}).then(
		function success(res) {
			self.email = "";
			self.password = "";
			self.repeatPassword = "";
			menu.requestGames();
			// res.header("Access-Control-Allow-Credentials", true);
		},
		function error(res) {
			self.email = "";
			self.password = "";
			self.repeatPassword = "";
			if(typeof(res.data) === "string") {
				alert(res.data);
			} else {
				alert(res.data.message);
			}
			
		});

	};

}]);