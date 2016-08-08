app.controller("signUpController", ['$scope', '$http', function ($scope, $http) {
	var self = this;
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
			// res.header("Access-Control-Allow-Credentials", true);
		},
		function error(res) {
			console.log("Error creating user:");
			console.log(res)
		});

	};

}]);