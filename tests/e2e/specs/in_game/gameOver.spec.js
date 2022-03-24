import {
	setupGameAsP0,
	setupGameAsP1,
	assertGameState,
	Card,
} from '../../support/helpers';

function assertVictory() {
	cy.log('Asserting player victory');
	cy.get('#game-over-dialog')
		.should('be.visible')
		.get('[data-cy=victory-heading]')
		.should('be.visible');
}

function assertLoss() {
	cy.log('Asserting player loss');
	cy.get('#game-over-dialog')
		.should('be.visible')
		.get('[data-cy=loss-heading]')
		.should('be.visible');
	cy.get('[data-cy=loss-img]')
		.should('be.visible');
}

function assertStalemate() {
	cy.log('Asserting player loss');
	cy.get('#game-over-dialog')
		.should('be.visible')
		.get('[data-cy=stalemate-heading]')
		.should('be.visible');
	cy.get('[data-cy=stalemate-img]')
		.should('be.visible');
}

function goHomeJoinNewGame() {
	cy.log('Going home');
	cy.get('[data-cy=gameover-go-home]')
		.click();
	cy.url()
		.should('not.include', '/game');
	// Re-join game and confirm it loads normally
	setupGameAsP0(true);
	cy.get('#game-over-dialog')
		.should('not.be.visible');
	cy.get('[data-player-hand-card]')
		.should('have.length', 5);
	cy.log('Joined new game successfully');
}

describe('Winning the game', () =>  {
	beforeEach(() => {
		setupGameAsP0();
	});

	it('Shows when player wins game with 21 points', () => {
		cy.loadGameFixture({
			p0Hand: [Card.SEVEN_OF_CLUBS],
			p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
			p0FaceCards: [],
			p1Hand: [],
			p1Points: [],
			p1FaceCards: [],
		});
		cy.get('[data-player-hand-card]')
			.should('have.length', 1);
		cy.log('Fixture loaded');

		// Play Seven of Clubs
		cy.get('[data-player-hand-card=7-0]')
			.click();
		cy.get('[data-move-choice=points]')
			.click();
		assertGameState(0, {
			p0Hand: [],
			p0Points: [Card.SEVEN_OF_CLUBS, Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
			p0FaceCards: [],
			p1Hand: [],
			p1Points: [],
			p1FaceCards: [],
		});
		assertVictory();
		goHomeJoinNewGame();
	});
    
	it('Shows when player wins game with 14 points and one king', () => {
		cy.loadGameFixture({
			p0Hand: [Card.JACK_OF_CLUBS],
			p0Points: [Card.SEVEN_OF_DIAMONDS],
			p0FaceCards: [Card.KING_OF_SPADES],
			p1Hand: [],
			p1Points: [Card.SEVEN_OF_CLUBS],
			p1FaceCards: [],
			scrap: [Card.TEN_OF_SPADES],
		});
		cy.get('[data-player-hand-card]')
			.should('have.length', 1);
		cy.log('Fixture loaded');
        
		// Play Jack of Clubs
		cy.get('[data-player-hand-card=11-0]').click();
		cy.get('[data-move-choice=jack]').click();
		cy.get('[data-opponent-point-card=7-0]').click();

		assertGameState(0, {
			p0Hand: [],
			p0Points: [Card.SEVEN_OF_CLUBS, Card.SEVEN_OF_DIAMONDS],
			p0FaceCards: [Card.KING_OF_SPADES],
			p1Hand: [],
			p1Points: [],
			p1FaceCards: [],
			scrap: [Card.TEN_OF_SPADES]
		});
		assertVictory();
		goHomeJoinNewGame();
	});
    
	it('Wins the game when opponent concedes', () => {
		cy.loadGameFixture({
			p0Hand: [Card.SEVEN_OF_CLUBS],
			p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
			p0FaceCards: [],
			p1Hand: [],
			p1Points: [],
			p1FaceCards: [],
		});
		cy.get('[data-player-hand-card]')
			.should('have.length', 1);
		cy.log('Fixture loaded');
        
		cy.concedeOpponent();
		assertVictory();
		goHomeJoinNewGame();
	});
});

describe('Losing the game', () => {
	beforeEach(() => {
		setupGameAsP1();
	});

	it('Shows when opponent wins with 21 points', () => {
		cy.loadGameFixture({
			p0Hand: [Card.SEVEN_OF_CLUBS],
			p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
			p0FaceCards: [],
			p1Hand: [],
			p1Points: [],
			p1FaceCards: [],
		});
		cy.get('[data-player-hand-card]')
			.should('have.length', 0);
		cy.log('Fixture loaded');
        
		cy.playPointsOpponent(Card.SEVEN_OF_CLUBS);
		assertLoss();
		goHomeJoinNewGame();
	});

	it('Loses by conceding', () => {
		cy.loadGameFixture({
			p0Hand: [Card.SEVEN_OF_CLUBS],
			p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
			p0FaceCards: [],
			p1Hand: [],
			p1Points: [],
			p1FaceCards: [],
		});
		cy.get('[data-player-hand-card]')
			.should('have.length', 0);
		cy.log('Fixture loaded');
        
		cy.get('#game-menu-activator')
			.click();
		cy.get('#game-menu')
			.should('be.visible')
			.get('[data-cy=concede-initiate]')
			.click();
		// Cancel Concede
		cy.get('#concede-menu')
			.should('be.visible')
			.get('[data-cy=concede-cancel]')
			.click();
		cy.get('#concede-menu')
			.should('not.be.visible');
		// Re-open concede menu and confirm concession
		cy.get('#game-menu-activator')
			.click();
		cy.get('#game-menu')
			.should('be.visible')
			.get('[data-cy=concede-initiate]')
			.click();
		cy.get('#concede-menu')
			.should('be.visible')
			.get('[data-cy=concede-confirm]')
			.click();
		assertLoss();
		goHomeJoinNewGame();
	});
});

describe('Stalemates', () => {
	it('Passes three times for a stalemate', () => {
		setupGameAsP0();
		cy.loadGameFixture({
			p0Hand: [Card.SEVEN_OF_CLUBS],
			p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
			p0FaceCards: [],
			p1Hand: [],
			p1Points: [],
			p1FaceCards: [],
		});
		cy.get('[data-player-hand-card]')
			.should('have.length', 1);
		cy.log('Fixture loaded');
        
		cy.deleteDeck();
		cy.log('Drawing last two cards');
		cy.get('#deck')
			.should('contain', '(2)')
			.click();
		cy.drawCardOpponent();
		cy.log('Deck empty');

		//Pass three times for stalemate
		cy.get('#turn-indicator')
			.contains('YOUR TURN');
		cy.get('#deck')
			.should('contain', '(0)')
			.should('contain', 'PASS')
			.click();
		cy.get('#turn-indicator')
			.contains('OPPONENT\'S TURN');
		cy.passOpponent();
		cy.get('#turn-indicator')
			.contains('YOUR TURN');
		cy.get('#deck')
			.should('contain', '(0)')
			.should('contain', 'PASS')
			.click();
        
		assertStalemate();
		goHomeJoinNewGame();
	});

	it('Registers stalemate when opponent passes first/last', () => {
		setupGameAsP1();
		cy.loadGameFixture({
			p0Hand: [Card.SEVEN_OF_CLUBS],
			p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
			p0FaceCards: [],
			p1Hand: [],
			p1Points: [],
			p1FaceCards: [],
		});
		cy.get('[data-player-hand-card]')
			.should('have.length', 0);
		cy.log('Fixture loaded');

		cy.deleteDeck();
		cy.get('#deck')
			.should('contain', '(2)');
		cy.log('Drawing last two cards');
		cy.drawCardOpponent();
		cy.get('#deck')
			.should('contain', '(1)')
			.click();
		cy.log('Deck empty');

		cy.get('#turn-indicator')
			.contains('OPPONENT\'S TURN');
		cy.passOpponent();
		cy.get('#turn-indicator')
			.contains('YOUR TURN');
		cy.get('#deck')
			.should('contain', '(0)')
			.should('contain', 'PASS')
			.click();
		cy.get('#turn-indicator')
			.contains('OPPONENT\'S TURN');
		cy.passOpponent();

		assertStalemate();
		goHomeJoinNewGame();
	});
});