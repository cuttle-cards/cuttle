//GameService.checkWinGame Test
var Promise = require('bluebird');
var gameService = require("../../api/services/gameService.js");

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
chai.should();

describe("gameService.checkWinGame", function () {
	it("should calculate that p0 wins with 21 points and no kings", function () {
		var p0 = {
			hand: [],
			points: [
				//Ten of Clubs
				{
					rank: 10,
					suit: 0
				}, 
				//Ten of Diamonds
				{
					rank: 10,
					suit: 1
				}, 
				//Ace of Spades
				{
					rank: 1,
					suit: 3
				}
			],
			runes: [] 	
		}

		var p1 = {
				hand: [],
				points: [
					//Ten of Diamonds
					{
						rank: 10,
						suit: 1
					}
				],
				runes: []		
		}

		var game = {
			players: [p0, p1],
			deck: [],
			scrap: [],
			topCard: null,
			secondCard: null
		}
		return gameService.checkWinGame({game: game}).should.become({gameOver: true, winner: 0});
	});

	it("should calculate that p1 should win with 14 points and 1 king", function () {
		var p0 = {
			hand: [],
			points: [
				//Ten of Clubs
				{
					rank: 10,
					suit: 0
				}

			],
			runes: [] 	
		}

		var p1 = {
				hand: [],
				points: [
					//Ten of Diamonds
					{
						rank: 10,
						suit: 1
					},
					//Ace of clubs
					{
						rank: 1,
						suit: 0
					},
					//Three of Hearts
					{
						rank: 3,
						suit: 2
					}
				],
				runes: [
					// King of Hearts
					{
						rank: 13,
						suit: 2
					}
				]		
		}

		var game = {
			players: [p0, p1],
			deck: [],
			scrap: [],
			topCard: null,
			secondCard: null
		}
		return gameService.checkWinGame({game: game}).should.become({gameOver: true, winner: 1});
	});
	it("should calculate that p2 wins with 10 points and 2 kings");
	it("should calculate that p1 wins with 7 points and 3 kings");
	it("should calculate that p1 wins with 5 points and 4 kings");
	it("should calculate that p1 wins when there is a tie");
	it("should calculate that there is no winner when p0 has <21pts and no kings, and p1 has <14pts and 1 king");
	it("should calculate that there is no winner for 3 kings and 4 kings without enough points");
	
});