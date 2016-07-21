app.controller("loginController", ['$scope', '$http', function ($scope, $http) {
	var self = this;
	self.email = "";
	self.password = "";
	self.submitLogin = function() {
			// 	Use $http for request (angular)
	// 	$http({
	// 		method: 'POST',
	// 		url: '/user/login',
	// 		data: {
	// 			email: self.email,
	// 			password: self.password
	// 		},
	// 		withCredential: true
	// 	}).then(
	// 		function successCallback (res) {
	// 			console.log("Now logged in");
	// 			console.log(res);
	// 		},

	// 		function errorCallback (res) {
	// 			console.log("Error logging in");
	// 			console.log(res);
	// 		}

	// 	);
				//Use socket for request 
		io.socket.post("/user/login", {
			email: self.email,
			password: self.password
		});
	};
}]);