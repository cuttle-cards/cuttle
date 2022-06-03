var Promise = require('bluebird');
var userService = require('../../api/services/userService.js');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
chai.should();
/*
 **Test userService.checkWin
 */
describe('Userservice.checkWin()', function () {
  it('Should win with 21pts and no Kings', function () {
    var player = {
      hand: [],
      points: [
        //Ten of Clubs
        {
          rank: 10,
          suit: 0,
          //Ten of Diamonds
        },
        {
          rank: 10,
          suit: 1,
          //Ace of Spades
        },
        {
          rank: 1,
          suit: 3,
        },
      ],
      faceCards: [],
    };
    userService.checkWin({ user: player }).should.deep.equal(true);
  });
  it('Should win with 14pts and 1 King', function () {
    var player = {
      hand: [],
      points: [
        //Ten of Clubs
        {
          rank: 10,
          suit: 0,
        },
        //Four of Spades
        {
          rank: 4,
          suit: 3,
        },
      ],
      faceCards: [
        //King of Spades
        {
          rank: 13,
          suit: 3,
        },
      ],
    };
    userService.checkWin({ user: player }).should.deep.equal(true);
  });
  it('Should win with 10pts and 2 Kings', function () {
    var player = {
      hand: [],
      points: [
        //Five of Clubs
        {
          rank: 5,
          suit: 0,
        },
        //Four of Spades
        {
          rank: 4,
          suit: 3,
        },
        //Ace of Spades
        {
          rank: 1,
          suit: 3,
        },
      ],
      faceCards: [
        //King of Spades
        {
          rank: 13,
          suit: 3,
        },
        //King of Diamonds
        {
          rank: 13,
          suit: 1,
        },
      ],
    };
    userService.checkWin({ user: player }).should.deep.equal(true);
  });
  it('Should win with 7pts and 3 Kingss', function () {
    var player = {
      hand: [],
      points: [
        //Five of Clubs
        {
          rank: 5,
          suit: 0,
        },
        //Ace of Diamonds
        {
          rank: 1,
          suit: 1,
        },
        //Ace of Spades
        {
          rank: 1,
          suit: 3,
        },
      ],
      faceCards: [
        //King of Spades
        {
          rank: 13,
          suit: 3,
        },
        //King of Diamonds
        {
          rank: 13,
          suit: 1,
        },
        //King of Clubs
        {
          rank: 13,
          suit: 0,
        },
      ],
    };
    userService.checkWin({ user: player }).should.deep.equal(true);
  });
  it('Should win with 5pts and 4 Kings', function () {
    var player = {
      hand: [],
      points: [
        //Five of Clubs
        {
          rank: 5,
          suit: 0,
        },
      ],
      faceCards: [
        //King of Spades
        {
          rank: 13,
          suit: 3,
        },
        //King of Diamonds
        {
          rank: 13,
          suit: 1,
        },
        //King of Clubs
        {
          rank: 13,
          suit: 0,
        },
        //King of Hearts
        {
          rank: 13,
          suit: 2,
        },
      ],
    };
    userService.checkWin({ user: player }).should.deep.equal(true);
  });
  it('Should lose with 20pts and no Kings', function () {
    var player = {
      hand: [],
      points: [
        //Ten of Clubs
        {
          rank: 10,
          suit: 0,
        },
        //Ten of Diamonds
        {
          rank: 10,
          suit: 1,
        },
      ],
      faceCards: [
        // Queen of Spades
        {
          rank: 12,
          suit: 3,
        },
      ],
    };
    userService.checkWin({ user: player }).should.deep.equal(false);
  });
  it('Should lose with 13pts and 1 King', function () {
    var player = {
      hand: [],
      points: [
        //Ten of Clubs
        {
          rank: 10,
          suit: 0,
        },
        //Three of Spades
        {
          rank: 3,
          suit: 3,
        },
      ],
      faceCards: [
        //King of Spades
        {
          rank: 13,
          suit: 3,
        },
        // Queen of Spades
        {
          rank: 12,
          suit: 3,
        },
        // Queen of Hearts
        {
          rank: 12,
          suit: 2,
        },
      ],
    };
    userService.checkWin({ user: player }).should.deep.equal(false);
  });
  it('Should lose with 9pts and 2 Kings', function () {
    var player = {
      hand: [],
      points: [
        //Five of Clubs
        {
          rank: 5,
          suit: 0,
        },
        //Three of Spades
        {
          rank: 3,
          suit: 3,
        },
        //Ace of Spades
        {
          rank: 1,
          suit: 3,
        },
      ],
      faceCards: [
        //King of Spades
        {
          rank: 13,
          suit: 3,
        },
        //King of Diamonds
        {
          rank: 13,
          suit: 1,
        },
        // Queen of Spades
        {
          rank: 12,
          suit: 3,
        },
      ],
    };
    userService.checkWin({ user: player }).should.deep.equal(false);
  });
  it('Should lose with 6pts and 3 Kings', function () {
    var player = {
      hand: [],
      points: [
        //Five of Clubs
        {
          rank: 5,
          suit: 0,
        },
        //Ace of Diamonds
        {
          rank: 1,
          suit: 1,
        },
      ],
      faceCards: [
        //King of Spades
        {
          rank: 13,
          suit: 3,
        },
        //King of Diamonds
        {
          rank: 13,
          suit: 1,
        },
        //King of Clubs
        {
          rank: 13,
          suit: 0,
        },
        // Queen of Clubs
        {
          rank: 12,
          suit: 0,
        },
        // Queen of Diamonds
        {
          rank: 12,
          suit: 1,
        },
        // Queen of Hearts
        {
          rank: 12,
          suit: 2,
        },
        // Queen of Spades
        {
          rank: 12,
          suit: 3,
        },
      ],
    };
    userService.checkWin({ user: player }).should.deep.equal(false);
  });
  it('Should lose with 4pts and 4 Kings', function () {
    var player = {
      hand: [],
      points: [
        //Four of Clubs
        {
          rank: 4,
          suit: 0,
        },
      ],
      faceCards: [
        //King of Spades
        {
          rank: 13,
          suit: 3,
        },
        //King of Diamonds
        {
          rank: 13,
          suit: 1,
        },
        //King of Clubs
        {
          rank: 13,
          suit: 0,
        },
        //King of Hearts
        {
          rank: 13,
          suit: 2,
        },
        // Eight of Diamonds
        {
          rank: 8,
          suit: 1,
        },
        // Queen of Spades
        {
          rank: 12,
          suit: 3,
        },
      ],
    };
    userService.checkWin({ user: player }).should.deep.equal(false);
  });
});
