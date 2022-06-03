describe('Game Test', function() {
  // this.timeout(100000);
  it('Should sign up user 1', function() {
    return request(socket1, '/user/signup', {
      username: 'n1@tesla.com',
      password: 'lightening',
    });
  });
  it('Should sign up user 2', function() {
    return request(socket2, '/user/signup', {
      username: 'n2@tesla.com',
      password: 'lightening',
    });
  });
  var gameId;
  it('Should create a game', function() {
    return request(socket1, '/game/create', {
      gameName: 'testGame',
    }).then(function(val) {
      gameId = val.body.gameId;
    });
  });
  it('Should subscribe user 1 to the game', function() {
    return request(socket1, '/game/subscribe', {
      id: gameId,
    });
  });
  it('Should subscribe user 2 to the game', function() {
    return request(socket2, '/game/subscribe', {
      id: gameId,
    });
  });
  it('Should prevent additional user from subscribing to the game', function() {
    return badRequest(socket3, '/game/subscribe', {
      id: gameId,
    });
  });
  //THIS FAILS IF DONE IN PARALLEL W/ PROMISE.ALL
  //Game will be unplayable if two players join at the same time!
  it('Should subscribe both users', function() {
    return (ready1 = request(socket1, '/game/ready').then(function() {
      return request(socket2, '/game/ready');
    }));
    // var ready2 = request(socket2, '/game/ready');
    // return Promise.all(ready1, ready2);
  });
  it('Should ');
});
