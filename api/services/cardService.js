var Promise = require('bluebird');
module.exports = {

	/*
	**Create Card from suit, rank, and gameId
	*****options = {suit: integer, rank: integer, gameId: integer}
	*/
	createCard: function (options, done) {
		return new Promise(function (resolve, reject) {
			var validArgs = options.suit > -1 && options.suit < 4 && options.suit > -1 && options.suit < 14 && options.gameId;
			if (validArgs) {
				var gameId = options.gameId;
				var suit = options.suit;
				var rank = options.rank;
				var str_rank = "";
				var str_suit = "";
				var str_name = "";
				var ruleText = "";
				var img = "";
				// Stringify Rank
				switch (rank) {
					case 11:
						str_rank = "Jack";
						break;
					case 12:
						str_rank = "Queen";
						break;
					case 13:
						str_rank = "King";
						break;
					case 1:
						str_rank = "Ace";
					default:
						str_rank = rank;
						break;
				}
				// Stringify Suit
				switch (suit) {
					case 0:
						str_suit = "Clubs";
						break;
					case 1:
						str_suit = "Diamonds";
						break;
					case 2:
						str_suit = "Hearts";
						break;
					case 3:
						str_suit = "Spades";
						break;
				}
				str_name = str_rank + " of " + str_suit; //Assign str name
				img = "images/cards/card_" + suit + "_" + rank + ".png"; //Assign img

				// Assign Rule Text
				switch (rank) {
					case 1:
						ruleText = "ONE-OFF: Destroy ALL POINTS";
						break;
					case 2:
						ruleText = "ONE-OFF: Counter TARGET ONE-OFF that was just played. (Can be played out of turn)\nOR\nONE-OFF: Destroy target RUNE (Cannot be played out of turn).";
						break;
					case 3:
						ruleText = "ONE-OFF: Choose 1 SCRAPPED card and bring it to your HAND.";
						break;
					case 4:
						ruleText = "ONE-OFF: Your opponent discards two cards of her choice from her HAND (directly to the SCRAP PILE)";
						break;
					case 5:
						ruleText = "ONE-OFF: Discard one card from your HAND (to the SCRAP PILE), then draw three from the DECK.";
						break;
					case 6:
						ruleText = "ONE-OFF: Destroy ALL RUNES";
						break;
					case 7:
						ruleText = "ONE-OFF: Reveal the top two cards from the deck. Play one however you like. The other is returned to the top of the DECK.";
						break;
					case 8:
						ruleText = "RUNE: Your opponent plays with an open HAND (Her cards are revealed to you).";
						break;
					case 9:
						ruleText = "ONE-OFF: Return TARGET card to it's controller's HAND. That card may NOT be played next turn.";
						break;
					case 10:
						ruleText = "NO EFFECT";
						break;
					case 11:
						ruleText = "RUNE: Play on top of TARGET POINT card to steal it.";
						break;
					case 12:
						ruleText = "RUNE: Your opponent's TARGETTING cards may only TARGET this card (2, 9, & Jack effects). Your POINTS may still be scuttled.";
						break;
					case 13:
						ruleText = "RUNE: Reduces the points you need to win. 1 King - 14pts, 2 Kings - 10pts, 3 Kings - 7pts, 4 Kings -  5pts";
						break;
				}

				// Create card record
				Card.create({
					suit: suit,
					rank: rank,
					img: img,
					name: str_name,
					deck: gameId
				}).exec(function (err, newCard) {
					if (err) {
						return reject(err);
					} else if (!newCard) {
						return reject(new Error("Could not create new card"));
					//Everything ok -> resolve promise
					} else {
						return resolve(newCard);
					}
				});
			} else {
				return reject(new Error("Invalid Arguments for createCard service"));
			}
		})
	},

	/*
	**Find all card in player's hand from player id
	*****options = {userId: integer}
	*/
	findPoints: function (options, done) {
		return new Promise(function (resolve, reject) {
			if (options.userId) {
				Card.find({points: options.userId}).populate("attachments").exec(function (err, cards) {
					if (err) {
						return reject(err);
					} else if (!cards) {
						return reject(new Error("Can't find cards in hand"));
					} else {
						return resolve(cards);
					}
				}); //End find()
			} else {
				return reject(new Error("Don't have userId to find cards in user's hand"));
			}

		}); //End returned Promise
	},

	/*
	**Saves a card and returns it as a Promise
	****options = {card: CardRecord}
	*/
	saveCard: function (options) {
		return new Promise (function (resolve, reject) {
			if (options.card) {
				card.save(function (err) {
					if (err) {
						return reject(err);
					} else {
						return resolve(card);
					}
				});
			} else {
				return reject(new Error("Can't save card without card record"))
			}
		});
	}
};