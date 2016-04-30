app.controller("signUpController", ['$scope', function ($scope) {
	var self = this;
	self.email = "";
	self.password = "";
	self.repeatPassword = "";

	self.submitSignUp = function () {
		console.log("Submit signup");
		io.socket.get("/user/signup", {
			email: self.email,
			password: self.password,
		}, function (res) {

		});
	};

}]);