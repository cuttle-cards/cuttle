before(function () {
	var request = function (socket, url, data) {
		return new Promise(function(resolve, reject) {
			socket.put(url, data, function (res, jwres) {
				console.log("made request");
				if (jwres.statusCode === 200) {
					return resolve(jwres);
				} else {
					return reject(jwres);
				}
			})
		});
	}
})
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
	it('Should still be authenticated', function () {
		io.socket.get('game/getList', function (res, jwres) {
			jwres.statusCode.should.equal(200);
		});
	});
	it('Should make a separate socket connection', function () {
		socket2.get('game/getList', function (res, jwres) {
			jwres.statusCode.should.not.equal(200);
		});
	});
	it('Should use helper to make request', function() {

		return request(socket1, '/user/signup', 
			{
				email: 'n@tesla.com',
				password: 'lightening'
			}
		);

	});
});