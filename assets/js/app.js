var app = angular.module("app", ['ngAnimate']);
var dragIndex = null; //Used to determine which card is being dragged
var dragData = {
	type: null,
	index: null,
	rank: null,
	suit: null,
	id: null
};

// Function to update one list of cards in the game, from another given from the server
function updateList (oldList, newList) {
	var added = _.differenceBy(newList, oldList, 'id');
	var removed = _.differenceBy(oldList, newList, 'id');
	_.remove(oldList, function (o) {return removed.indexOf(o) >= 0});
	added.forEach(function (card) {
		oldList.push(card);
	});

}

// Update one game with data from another (inserting and removing cards)
function updateGame (oldGame, newGame) {
	// Update Player 0
	updateList(oldGame.players[0].hand, newGame.players[0].hand);
	updateList(oldGame.players[0].points, newGame.players[0].points);
	updateList(oldGame.players[0].runes, newGame.players[0].runes);
	oldGame.players[0].frozenId = newGame.players[0].frozenId;

	// Update Player 1
	updateList(oldGame.players[1].hand, newGame.players[1].hand);
	updateList(oldGame.players[1].points, newGame.players[1].points);
	updateList(oldGame.players[1].runes, newGame.players[1].runes);
	oldGame.players[1].frozenId = newGame.players[1].frozenId;

	// Update Scrap
	updateList(oldGame.scrap, newGame.scrap);

	// Update twos
	updateList(oldGame.twos, newGame.twos);

	// Update attributes which can be directly assigned
	oldGame.deck = newGame.deck;
	oldGame.topCard = newGame.topCard;
	oldGame.secondCard = newGame.secondCard;
	oldGame.log = newGame.log;
	oldGame.turn = newGame.turn;
}