app.controller("loginController", ['$scope', '$http', function ($scope, $http) {
	console.log($http.defaults);
	var self = this;
	self.email = "";
	self.password = "";
	self.submitLogin = function() {
		// console.log("firing login");
		// $http({
		// 	method: 'POST',
		// 	url: '/user/login',
		// 	data: {
		// 		email: self.email,
		// 		password: self.password
		// 	},
		// 	withCredential: true
		// }).then(
		// 	function successCallback (res) {
		// 		console.log("successful login");
		// 		res.header("Access-Control-Allow-Credentials", true);
		// 	},

		// 	function errorCallback (res) {

		// 	}

		// );
		io.socket.post("/user/login", {
			email: self.email,
			password: self.password
		});
	};
}]);