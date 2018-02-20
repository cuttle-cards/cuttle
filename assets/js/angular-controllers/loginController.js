app.controller("loginController", ['$scope', '$http', function ($scope, $http) {
	var self = this;
	var menu = $scope.menu;
	self.email = "";
	self.password = "";


	// call submitLogin() or relog()
	// depending on menu.tab
	self.logOrRelog = function () {
		if (menu.tab === 'login') {
			self.submitLogin();
		} else if (menu.tab == 'reLogin') {
			self.reLogin();
		}
	};

	var loginCount = 0;
	self.submitLogin = function() {
			// 	Use $http for request (angular)
		$http({
			method: 'POST',
			url: '/user/login',
			data: {
				email: self.email,
				password: self.password
			},
			withCredential: true
		}).then(
			function successCallback (res) {
				menu.loggedIn = true;
				self.email = "";
				self.password = "";
				menu.requestGames();
			},

			function errorCallback (res) {
				console.log("Error logging in");
				console.log(res);
				if (typeof(res.data) === 'string') {
					alert(res.data);
				} else {
					alert(res.data.message);
				};
			}

		);
		// 		//Use socket for request 
		// io.socket.post("/user/login", {
		// 	email: self.email,
		// 	password: self.password
		// });
	};

	self.reLogin = function () {
		io.socket.put('/user/reLogin', 
			{
				email: self.email,
				password: self.password
			},
			function (res, jwres) {
			self.password = "";
			if (jwres.statusCode === 200) {
				// Success
				menu.tab = 'gameView';
			} else {
				// Error
				console.log(jwres);
				alert(jwres.error.message);
			}
			$scope.$apply();
		});
	};
}]);