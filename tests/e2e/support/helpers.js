export const username = 'myUsername';
export const validPassword = 'passwordLongerThanEight';
export const opponentUsername = 'definitelyNotTheGovernment6969';
export const opponentPassword = 'deviousTrickery';

/**
 * Signs up two players, navigates home, creates game, subscribes, ready's up
 * @param {boolean} alreadyAuthenticated: skips setup steps: db wipe, signup, navigate /
 */
export function setupGameAsP0(alreadyAuthenticated = false) {
	if (!alreadyAuthenticated) {
		cy.wipeDatabase();
		cy.visit('/');
		cy.signupPlayer(username, validPassword);
	}
	cy.createGamePlayer('Test Game')
		.then((gameSummary) => {
			cy.window().its('app.$store').invoke('dispatch', 'requestSubscribe', gameSummary.gameId);
			cy.vueRoute(`/lobby/${gameSummary.gameId}`);
			cy.wrap(gameSummary).as('gameSummary');
			cy.get('[data-cy=ready-button]').click();
			if (!alreadyAuthenticated) {
				cy.signupOpponent(opponentUsername, opponentPassword);
			}
			cy.subscribeOpponent(gameSummary.gameId);
			cy.readyOpponent();
			// Asserting 5 cards in players hand confirms game has loaded
			cy.get('#player-hand-cards .player-card')
				.should('have.length', 5);
			cy.log('Finished setting up game as p0');
		});
}

export function setupGameAsP1() {
	cy.wipeDatabase();
	cy.visit('/');
	cy.signupPlayer(username, validPassword);
	cy.createGamePlayer('Test Game')
		.then((gameSummary) => {
			cy.signupOpponent(opponentUsername, opponentPassword);
			cy.subscribeOpponent(gameSummary.gameId);
			cy.readyOpponent();
			cy.window().its('app.$store').invoke('dispatch', 'requestSubscribe', gameSummary.gameId);
			cy.vueRoute(`/lobby/${gameSummary.gameId}`);
			cy.wrap(gameSummary).as('gameSummary');
			cy.get('[data-cy=ready-button]').click();
			// Asserting 6 cards in players hand confirms game has loaded
			cy.get('#player-hand-cards .player-card')
				.should('have.length', 6);
			cy.log('Finished setting up game as p1');
		});
}

export function hasValidSuitAndRank(card) {
	if (!Object.prototype.hasOwnProperty.call(card, 'rank')) return false;
	if (!Object.prototype.hasOwnProperty.call(card, 'suit')) return false;
	if (!Number.isInteger(card.rank)) return false;
	if (!Number.isInteger(card.suit)) return false;
	if (card.rank < 1 || card.rank > 13) return false;
	if (card.suit < 0 || card.suit > 3) return false;
	return true;
}
/**
 * @returns string name of card
 * @param {suit: number, rank: number} card 
 */
export function printCard(card) {
	if (!hasValidSuitAndRank(card)) {
		throw new Error('Cannot print object not shaped like card');
	}
	let res = '';
	switch (card.rank) {
	case 1:
		res += 'Ace'
		break;
	case 2:
		res += 'Two'
		break;
	case 3:
		res += 'Three'
		break;
	case 4:
		res += 'Four'
		break;
	case 5:
		res += 'Five'
		break;
	case 6:
		res += 'Six'
		break;
	case 7:
		res += 'Seven'
		break;
	case 8:
		res += 'Eight'
		break;
	case 9:
		res += 'Nine'
		break;
	case 10:
		res += 'Ten'
		break;
	case 11:
		res += 'Jack'
		break;
	case 12:
		res += 'Queen'
		break;
	case 13:
		res += 'King'
		break;
	}
	res += ' of ';
	const suits = ['Clubs', 'Diamonds', 'Hearts', 'Spades'];
	res += suits[card.suit];
	return res;
}
export function printCardList(cards) {
	return cards.map(printCard).join(', ');
}
export function cardsMatch(card1, card2) {
	return card1.rank === card2.rank && card1.suit === card2.suit;
}

/**
 * @param game: game obj from $store
 * @param suitAndRankList: {suit: number, rank: number}[]
 * @returns lit of ids of specified cards
 */
export function getCardIds(game, suitAndRankList) {
	return suitAndRankList.map((card) => {
		if (cardsMatch(card, game.topCard)) return game.topCard.id;
		if (cardsMatch(card, game.secondCard)) return game.secondCard.id;

		const foundInScrap = game.scrap.find((scrapCard) => cardsMatch(card, scrapCard));
		if (foundInScrap) return foundInScrap.id;
		
		const foundInP0Hand = game.players[0].hand.find((handCard) => cardsMatch(card, handCard));
		if (foundInP0Hand) return foundInP0Hand.id;

		const foundInP1Hand = game.players[1].hand.find((handCard) => cardsMatch(card, handCard));
		if (foundInP1Hand) return foundInP1Hand.id;

		const foundInDeck = game.deck.find((deckCard) => cardsMatch(card, deckCard));
		if (foundInDeck) return foundInDeck.id;
		
		throw new Error(`Could not find desired card ${card.rank} of ${card.suit} in deck, scrap, or either player's hand`);
	});
}

function cardSortComparator(card1, card2) {
	let res = card1.rank - card2.rank;
	if (res === 0) res = card1.suit - card2.suit;
	return res;
}
export function cardListsMatch(list1, list2) {
	if (list1.length != list2.length) {
		return false;
	}
	list1.sort(cardSortComparator);
	list2.sort(cardSortComparator);
	for (let i = 0; i < list1.length; i++) {
		if (!cardsMatch(list1[i], list2[i])) {
			return false;
		}
	}
	return true;
}
/**
 * @returns sum of ranks of list of card
 * @param cards: {suit: number, rank: number}[]
 */
function sumRanks(cards) {
	return cards.reduce((sum, nextCard) => sum + nextCard.rank, 0);
}
/**
 * @returns count of kings in list
 * @param cards: {suit: number, rank: number}[]
 */
function countKings(cards) {
	return cards.reduce((kingCount, nextCard) => nextCard.rank === 13 ? kingCount + 1 : kingCount, 0);
}
/**
 * 
 * @param kingCount: number
 */
function pointsToWin(kingCount) {
	switch (kingCount) {
	case 0:
		return 21;
	case 1:
		return 14;
	case 2:
		return 10;
	case 3:
		return 7;
	case 4:
		return 5;
	default:
		throw new Error(`Cannot count points to win for invalid kingcount: ${kingCount}`);
	}
}

export function assertSnackbarError(message, snackName='game') {
	cy.get(`[data-cy=${snackName}-snackbar] .v-snack__wrapper`)
		.should('be.visible')
		.should('have.class', 'error')
		.should('contain', message)
		.get('[data-cy=close-snackbar]')
		.click();
}

/**
 * Attempts to make a move out of turn and confirms that controls are disabled etc
 * Assumes a card is already selected and the move choice overlay is open
 * @param moveName: String is the name of the move event (ex 'oneOff')
 */
export function playOutOfTurn(moveName) {
	// Specified move choice should be disabled
	cy.get(`[data-move-choice=${moveName}]`)
		.should('have.class', 'v-card--disabled')
		.should('contain', 'It\'s not your turn')
		.click({force: true});
	// Back end should fire error that move is illegal after click is forced
	assertSnackbarError(SnackBarError.NOT_YOUR_TURN);
	cy.log(`Correctly prevented attempt to play ${moveName} out of turn`);
}

function assertDomMatchesFixture(pNum, fixture) {
	const expectedP0Points = sumRanks(fixture.p0Points);
	const expectedP0PointsToWin = pointsToWin(countKings(fixture.p0FaceCards));
	const expectedP1Points = sumRanks(fixture.p1Points);
	const expectedP1PointsToWin = pointsToWin(countKings(fixture.p1FaceCards));
	let p0Role;
	let p1Role;
	if (pNum === 0) {
		p0Role = 'player';
		p1Role = 'opponent';
	}
	else if (pNum === 1) {
		p0Role = 'opponent';
		p1Role = 'player';
	}
	else {
		throw new Error(`Cannot check whether DOM matches fixture for invalid pNum ${pNum}`);
	}
	// Test scores
	cy.get(`#${p0Role}-score`)
		.should('contain', `POINTS: ${expectedP0Points}`)
		.should('contain', `GOAL: ${expectedP0PointsToWin}`);
	cy.get(`#${p1Role}-score`)
		.should('contain', `POINTS: ${expectedP1Points}`)
		.should('contain', `GOAL: ${expectedP1PointsToWin}`);

	let playerHasGlasses = false;
	
	// Test Point Cards
	fixture.p0Points.forEach((card) => {
		cy.get(`[data-${p0Role}-point-card=${card.rank}-${card.suit}]`);
	});
	fixture.p1Points.forEach((card) => {
		cy.get(`[data-${p1Role}-point-card=${card.rank}-${card.suit}]`);
	});
	// Test Face Cards
	fixture.p0FaceCards.forEach((card) => {
		cy.get(`[data-${p0Role}-face-card=${card.rank}-${card.suit}]`).as('card');
		if (card.rank === 8) {
			cy.get('@card').should('have.class', 'glasses');
			if (pNum === 0) {
				playerHasGlasses = true;
			}
		}
	});
	fixture.p1FaceCards.forEach((card) => {
		cy.get(`[data-${p1Role}-face-card=${card.rank}-${card.suit}]`).as('card');
		if (card.rank === 8) {
			cy.get('@card').should('have.class', 'glasses');
			if (pNum === 1) {
				playerHasGlasses = true;
			}
		}
	});
	// Test Hands
	if (pNum === 0) {
		// Player Hand
		fixture.p0Hand.forEach((card) => {
			cy.get(`[data-player-hand-card=${card.rank}-${card.suit}]`);
		});
		// Opponent Hand
		if (fixture.p1Hand.length > 0) {
			cy.get('[data-opponent-hand-card]')
				.should('have.length', fixture.p1Hand.length);
		} else {
			cy.get('[data-opponent-hand-card]')
				.should('not.exist');
		}
		if (playerHasGlasses){
			fixture.p1Hand.forEach((card) => {
				cy.get(`[data-opponent-hand-card=${card.rank}-${card.suit}]`);
			});
		}
	}
	else if (pNum === 1) {
		// Player hand
		fixture.p1Hand.forEach((card) => {
			cy.get(`[data-player-hand-card=${card.rank}-${card.suit}]`);
		});
		// Opponent Hand
		if (fixture.p0Hand.length > 0) {
			cy.get('[data-opponent-hand-card]')
				.should('have.length', fixture.p0Hand.length);
		} else {
			cy.get('[data-opponent-hand-card]')
				.should('not.exist');
		}
		if (playerHasGlasses){
			fixture.p0Hand.forEach((card) => {
				cy.get(`[data-opponent-hand-card=${card.rank}-${card.suit}]`);
			});
		}
	}
	// Test scrap (if provided)
	if (fixture.scrap) {
		cy.get('#scrap')
			.contains(`(${fixture.scrap.length})`);
	}
}

/**
 * @param fixture:
 * {
 * 	 p0Hand: {suit: number, rank: number}[],
 *   p0Points: {suit: number, rank: number}[],
 *   p0FaceCards: {suit: number, rank: number}[],
 *   p1Hand: {suit: number, rank: number}[],
 *   p1Points: {suit: number, rank: number}[],
 *   p1FaceCards: {suit: number, rank: number}[],
 * }
 */
function assertStoreMatchesFixture(fixture) {
	cy
		.window()
		.its('app.$store.state.game')
		.then((game) => {
			// Player 0
			expect(cardListsMatch(game.players[0].hand, fixture.p0Hand))
				.to.eq(true, `P0 Hand should match fixture, but actual: ${printCardList(game.players[0].hand)} did not match ficture: ${printCardList(fixture.p0Hand)}`);
			expect(cardListsMatch(game.players[0].points, fixture.p0Points))
				.to.eq(true, `P0 Points should match fixture, but actual: ${printCardList(game.players[0].points)} did not match ficture: ${printCardList(fixture.p0Points)}`);
			expect(cardListsMatch(game.players[0].faceCards, fixture.p0FaceCards))
				.to.eq(true, `P0 Face Cards should match fixture, but actual: ${printCardList(game.players[0].faceCards)} did not match ficture: ${printCardList(fixture.p0FaceCards)}`);
			// Player 1
			expect(cardListsMatch(game.players[1].hand, fixture.p1Hand))
				.to.eq(true, `P1 Hand should match fixture, but actual: ${printCardList(game.players[1].hand)} did not match ficture: ${printCardList(fixture.p1Hand)}`);
			expect(cardListsMatch(game.players[1].points, fixture.p1Points))
				.to.eq(true, `P1 Points should match fixture, but actual: ${printCardList(game.players[1].points)} did not match ficture: ${printCardList(fixture.p1Points)}`);
			expect(cardListsMatch(game.players[1].faceCards, fixture.p1FaceCards))
				.to.eq(true, `P1 Face Cards should match fixture, but actual: ${printCardList(game.players[1].faceCards)} did not match ficture: ${printCardList(fixture.p1FaceCards)}`);
			// Scrap (if specified)
			if (fixture.scrap) {
				expect(cardListsMatch(game.scrap, fixture.scrap))
					.to.eq(true, `Scrap should match fixture, but actual ${printCardList(game.scrap)} did not match fixture: ${printCardList(fixture.scrap)}`);
			}
			// Top Card if specified
			if (fixture.topCard) {
				expect(cardsMatch(game.topCard, fixture.topCard))
					.to.eq(true, `Expected top card ${printCard(game.topCard)} to match fixture topcard: ${printCard(fixture.topCard)}`);
			}
			if (fixture.secondCard) {
				expect(cardsMatch(game.secondCard, fixture.secondCard))
					.to.eq(true, `Expected second card ${printCard(game.secondCard)} to match fixture second card: ${printCard(fixture.secondCard)}`);
			}
		});
}
/**
 * @param fixture:
 * {
 * 	 p0Hand: {suit: number, rank: number}[],
 *   p0Points: {suit: number, rank: number}[],
 *   p0FaceCards: {suit: number, rank: number}[],
 *   p1Hand: {suit: number, rank: number}[],
 *   p1Points: {suit: number, rank: number}[],
 *   p1FaceCards: {suit: number, rank: number}[],
 * }
 * @param pNum: int [0, 1]
 */
export function assertGameState(pNum, fixture) {
	cy.log('Asserting game state:', fixture);
	assertDomMatchesFixture(pNum, fixture);
	assertStoreMatchesFixture(fixture);
}

export const SnackBarError = {
	NOT_YOUR_TURN: 'It\'s not your turn',
	ILLEGAL_SCUTTLE: 'You can only scuttle an opponent\'s point card with a higher rank point card, or the same rank with a higher suit. Suit order (low to high) is: Clubs < Diamonds < Hearts < Spades',
	FROZEN_CARD: 'That card is frozen! You must wait a turn to play it',
};

export const Card = {
	// Clubs
	ACE_OF_CLUBS: {rank: 1, suit: 0},
	TWO_OF_CLUBS: {rank: 2, suit: 0},
	THREE_OF_CLUBS: {rank: 3, suit: 0},
	FOUR_OF_CLUBS: {rank: 4, suit: 0},
	FIVE_OF_CLUBS: {rank: 5, suit: 0},
	SIX_OF_CLUBS: {rank: 6, suit: 0},
	SEVEN_OF_CLUBS: {rank: 7, suit: 0},
	EIGHT_OF_CLUBS: {rank: 8, suit: 0},
	NINE_OF_CLUBS: {rank: 9, suit: 0},
	TEN_OF_CLUBS: {rank: 10, suit: 0},
	JACK_OF_CLUBS: {rank: 11, suit: 0},
	QUEEN_OF_CLUBS: {rank: 12, suit: 0},
	KING_OF_CLUBS: {rank: 13, suit: 0},
	// Diamonds
	ACE_OF_DIAMONDS: {rank: 1, suit: 1},
	TWO_OF_DIAMONDS: {rank: 2, suit: 1},
	THREE_OF_DIAMONDS: {rank: 3, suit: 1},
	FOUR_OF_DIAMONDS: {rank: 4, suit: 1},
	FIVE_OF_DIAMONDS: {rank: 5, suit: 1},
	SIX_OF_DIAMONDS: {rank: 6, suit: 1},
	SEVEN_OF_DIAMONDS: {rank: 7, suit: 1},
	EIGHT_OF_DIAMONDS: {rank: 8, suit: 1},
	NINE_OF_DIAMONDS: {rank: 9, suit: 1},
	TEN_OF_DIAMONDS: {rank: 10, suit: 1},
	JACK_OF_DIAMONDS: {rank: 11, suit: 1},
	QUEEN_OF_DIAMONDS: {rank: 12, suit: 1},
	KING_OF_DIAMONDS: {rank: 13, suit: 1},
	// Hearts
	ACE_OF_HEARTS: {rank: 1, suit: 2},
	TWO_OF_HEARTS: {rank: 2, suit: 2},
	THREE_OF_HEARTS: {rank: 3, suit: 2},
	FOUR_OF_HEARTS: {rank: 4, suit: 2},
	FIVE_OF_HEARTS: {rank: 5, suit: 2},
	SIX_OF_HEARTS: {rank: 6, suit: 2},
	SEVEN_OF_HEARTS: {rank: 7, suit: 2},
	EIGHT_OF_HEARTS: {rank: 8, suit: 2},
	NINE_OF_HEARTS: {rank: 9, suit: 2},
	TEN_OF_HEARTS: {rank: 10, suit: 2},
	JACK_OF_HEARTS: {rank: 11, suit: 2},
	QUEEN_OF_HEARTS: {rank: 12, suit: 2},
	KING_OF_HEARTS: {rank: 13, suit: 2},
	// Spades
	ACE_OF_SPADES: {rank: 1, suit: 3},
	TWO_OF_SPADES: {rank: 2, suit: 3},
	THREE_OF_SPADES: {rank: 3, suit: 3},
	FOUR_OF_SPADES: {rank: 4, suit: 3},
	FIVE_OF_SPADES: {rank: 5, suit: 3},
	SIX_OF_SPADES: {rank: 6, suit: 3},
	SEVEN_OF_SPADES: {rank: 7, suit: 3},
	EIGHT_OF_SPADES: {rank: 8, suit: 3},
	NINE_OF_SPADES: {rank: 9, suit: 3},
	TEN_OF_SPADES: {rank: 10, suit: 3},
	JACK_OF_SPADES: {rank: 11, suit: 3},
	QUEEN_OF_SPADES: {rank: 12, suit: 3},
	KING_OF_SPADES: {rank: 13, suit: 3},
};