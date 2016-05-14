app.controller("signUpController", ['$scope', function ($scope) {
	var self = this;
	self.email = "";
	self.password = "";
	self.repeatPassword = "";

	self.submitSignUp = function () {
		io.socket.get("/user/signup", {
			email: self.email,
			password: self.password,
		}, function (res) {
			console.log(res);
		});
	};

}]);