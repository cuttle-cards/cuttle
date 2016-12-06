describe("Game Test", function () {
	it("Should sign up user 1", function () {
		return request(socket1, '/user/signup', 
			{
				email: 'n1@tesla.com',
				password: 'lightening'
			}
		);
	});
	it("Should sign up user 2", function () {
		return request(socket2, '/user/signup', 
			{
				email: 'n2@tesla.com',
				password: 'lightening'
			}
		);
	});	
	var gameId;
	it("Should create a game", function () {
		return request(socket1, '/game/create',
			{
				gameName: "testGame"
			}
		).then(function (val) {
			gameId = val.body.gameId
		});
	});
	it("Should subscribe user 1 to the game", function () {
		return request(socket1, '/game/subscribe', 
		{
			id: gameId
		});
	});
	it("Should subscribe user 2 to the game", function () {
		return request(socket2, '/game/subscribe', 
		{
			id: gameId
		});
	});	
	it("Should prevent additional user from subscribing to the game", function () {
		return badRequest(socket3, '/game/subscribe', 
		{
			id: gameId
		});
	});
});