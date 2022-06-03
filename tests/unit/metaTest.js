describe('The meta test', function () {
  it('Should create a card with cardService', function (done) {
    cardService.createCard({ suit: 3, rank: 1, gameId: 4 }).then(function createdCard(card) {
      card.suit.should.equal(3);
      card.rank.should.equal(1);
      card.deck.should.equal(4);
      card.img.should.equal('images/cards/card_3_1.png');
      card.name.should.equal('Ace of Spades');
      done();
    });
  });
  it('Should make a socket request', function () {
    io.socket.get(
      'user/signup',
      {
        username: 'nicola@tesla.com',
        password: 'lightening',
      },
      function (res, jwres) {
        jwres.statusCode.should.equal(200);
        io.socket.get('game/getList', function (res, jwres) {
          jwres.statusCode.should.equal(200);
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
  it('Should use helper to make request', function () {
    return request(socket1, '/user/signup', {
      username: 'n@tesla.com',
      password: 'lightening',
    });
  });
});
