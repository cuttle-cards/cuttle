describe('The meta test', function () {
	// var passwordAPI = sails.hooks['custompasswordhook'];
	// var foo = 'bar';
	// var bun = 'mediocre';
	it('Should pass this check', function () {
		foo.should.equal('bar');
	});
	// it("Should create a user", function () {
	// 	passwordAPI.encryptedPassword({password: "sexbutt"}).then(function createUser (pw) {

	// 		User.create({email: "fudgeHead@boo.com", encryptedPassword: pw}, function (err, user) {
	// 			console.log(user);
	// 		});
	// 	});
	// });

	it("Should create a card with cardService", function (done) {
		cardService.createCard({suit: 3, rank: 1, gameId: 4}).then(function createdCard (card) {
			card.suit.should.equal(3);
			card.rank.should.equal(1);
			card.deck.should.equal(4);
			card.img.should.equal("images/cards/card_3_1.png");
			card.name.should.equal("Ace of Spades");
			done();
		});
	});
	it('Should make a socket request', function () {
		console.log("making request");
		io.socket.get('user/signup', 
			{
				email: 'nicola@tesla.com',
				password: 'lightening'
			},
			function (res, jwres) {
				jwres.statusCode.should.equal(200);
				console.log(jwres);
				io.socket.get('game/getList', function (res, jwres) {
					jwres.statusCode.should.equal(200);
					console.log(jwres);
					// done();
				});
			}
		);
	});
});