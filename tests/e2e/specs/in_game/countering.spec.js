import {
	setupGameAsP1,
	setupGameAsP0,
	assertGameState,
	Card,
	playOutOfTurn
} from '../../support/helpers';

describe('Countering One-Offs', () => {
	beforeEach(() => {
		setupGameAsP1();
	});

	it('Displays the cannot counter modal and resolves stack when opponent plays a one-off if player has no twos', () => {
		cy.loadGameFixture({
			// Opponent is P0
			p0Hand: [Card.ACE_OF_CLUBS, Card.FOUR_OF_SPADES],
			p0Points: [Card.TEN_OF_SPADES, Card.ACE_OF_SPADES],
			p0FaceCards: [Card.KING_OF_SPADES],
			// Player is P1
			p1Hand: [Card.ACE_OF_HEARTS],
			p1Points: [Card.TEN_OF_HEARTS, Card.ACE_OF_DIAMONDS],
			p1FaceCards: [Card.KING_OF_HEARTS],
		});
		// Confirm fixture has loaded
		cy.get('[data-player-hand-card]').should('have.length', 1);
		cy.log('Fixture loaded');

		// Opponent plays ace of clubs
		cy.playOneOffOpponent(Card.ACE_OF_CLUBS);
		cy.get('#cannot-counter-dialog')
			.should('be.visible')
			.should('contain', 'You cannot Counter, because you do not have a two.')
			.get('[data-cy=cannot-counter-resolve]')
			.click();

		assertGameState(
			1,
			{
				p0Hand: [Card.FOUR_OF_SPADES],
				p0Points: [],
				p0FaceCards: [Card.KING_OF_SPADES],
				p1Hand: [Card.ACE_OF_HEARTS],
				p1Points: [],
				p1FaceCards: [Card.KING_OF_HEARTS],
				scrap: [Card.TEN_OF_SPADES, Card.ACE_OF_SPADES, Card.TEN_OF_HEARTS, Card.ACE_OF_DIAMONDS, Card.ACE_OF_CLUBS],
			}
		);
	});

	it('Counters one-off with a two', () => {
		cy.loadGameFixture({
			// Opponent is P0
			p0Hand: [Card.ACE_OF_CLUBS, Card.FOUR_OF_SPADES],
			p0Points: [Card.TEN_OF_SPADES, Card.ACE_OF_SPADES],
			p0FaceCards: [Card.KING_OF_SPADES],
			// Player is P1
			p1Hand: [Card.ACE_OF_HEARTS, Card.TWO_OF_SPADES],
			p1Points: [Card.TEN_OF_HEARTS, Card.ACE_OF_DIAMONDS],
			p1FaceCards: [Card.KING_OF_HEARTS],
		});
		// Confirm fixture has loaded
		cy.get('[data-player-hand-card]').should('have.length', 2);
		cy.log('Fixture loaded');

		// Opponent plays ace of clubs as one-off
		cy.playOneOffOpponent(Card.ACE_OF_CLUBS);
		cy.get('#cannot-counter-dialog')
			.should('not.be.visible');
		// Player counters
		cy.get('#counter-dialog')
			.should('be.visible')
			.get('[data-cy=counter]')
			.click();
		cy.get('#choose-two-dialog')
			.should('be.visible')
			.get('[data-counter-dialog-card=2-3]')
			.click();
		cy.get('#waiting-for-opponent-counter-scrim')
			.should('be.visible');
		// Opponent resolves
		cy.resolveOpponent();
		assertGameState(
			1,
			{
				// Opponent is P0
				p0Hand: [Card.FOUR_OF_SPADES],
				p0Points: [Card.TEN_OF_SPADES, Card.ACE_OF_SPADES],
				p0FaceCards: [Card.KING_OF_SPADES],
				// Player is P1
				p1Hand: [Card.ACE_OF_HEARTS],
				p1Points: [Card.TEN_OF_HEARTS, Card.ACE_OF_DIAMONDS],
				p1FaceCards: [Card.KING_OF_HEARTS],
				scrap: [Card.TWO_OF_SPADES, Card.ACE_OF_CLUBS],
			}
		);
	});

	it('Declining option to counter resolves stack', () => {
		cy.loadGameFixture({
			// Opponent is P0
			p0Hand: [Card.ACE_OF_CLUBS, Card.FOUR_OF_SPADES],
			p0Points: [Card.TEN_OF_SPADES, Card.ACE_OF_SPADES],
			p0FaceCards: [Card.KING_OF_SPADES],
			// Player is P1
			p1Hand: [Card.ACE_OF_HEARTS, Card.TWO_OF_SPADES],
			p1Points: [Card.TEN_OF_HEARTS, Card.ACE_OF_DIAMONDS],
			p1FaceCards: [Card.KING_OF_HEARTS],
		});
		// Confirm fixture has loaded
		cy.get('[data-player-hand-card]').should('have.length', 2);
		cy.log('Fixture loaded');

		cy.playOneOffOpponent(Card.ACE_OF_CLUBS);
		cy.get('#cannot-counter-dialog')
			.should('not.be.visible');
		cy.get('#counter-dialog')
			.should('be.visible')
			.get('[data-cy=decline-counter-resolve]')
			.click();
		
		assertGameState(
			1,
			{
				p0Hand: [Card.FOUR_OF_SPADES],
				p0Points: [],
				p0FaceCards: [Card.KING_OF_SPADES],
				p1Hand: [Card.ACE_OF_HEARTS, Card.TWO_OF_SPADES],
				p1Points: [],
				p1FaceCards: [Card.KING_OF_HEARTS],
				scrap: [
					Card.TEN_OF_SPADES,
					Card.ACE_OF_SPADES,
					Card.TEN_OF_HEARTS,
					Card.ACE_OF_DIAMONDS,
					Card.ACE_OF_CLUBS
				],
			}
		);
	});

	it('Cancels decision to counter with Cancel button after choosing to counter', ()=> {
		// Setup
		cy.loadGameFixture({
			// Opponent is P0
			p0Hand: [Card.ACE_OF_CLUBS, Card.FOUR_OF_SPADES],
			p0Points: [Card.TEN_OF_SPADES, Card.ACE_OF_SPADES],
			p0FaceCards: [Card.KING_OF_SPADES],
			// Player is P1
			p1Hand: [Card.ACE_OF_HEARTS, Card.TWO_OF_SPADES],
			p1Points: [Card.TEN_OF_HEARTS, Card.ACE_OF_DIAMONDS],
			p1FaceCards: [Card.KING_OF_HEARTS],
		});
		cy.get('[data-player-hand-card]').should('have.length', 2);
		cy.log('Fixture loaded');

		// Opponent plays ace of clubs as one-off
		cy.playOneOffOpponent(Card.ACE_OF_CLUBS);
		cy.get('#cannot-counter-dialog')
			.should('not.be.visible');

		// Player initially chooses to counter
		cy.get('#counter-dialog')
			.should('be.visible')
			.get('[data-cy=counter]')
			.click();
		// Player then cancels decision to counter
		cy.get('#choose-two-dialog')
			.should('be.visible')
			.get('[data-cy=cancel-counter]')
			.click();

		assertGameState(
			1,
			{
				// Opponent is P0
				p0Hand: [Card.FOUR_OF_SPADES],
				p0Points: [],
				p0FaceCards: [Card.KING_OF_SPADES],
				// Player is P1
				p1Hand: [Card.ACE_OF_HEARTS, Card.TWO_OF_SPADES],
				p1Points: [],
				p1FaceCards: [Card.KING_OF_HEARTS],
				scrap: [
					Card.ACE_OF_CLUBS,
					Card.TEN_OF_SPADES,
					Card.ACE_OF_SPADES,
					Card.TEN_OF_HEARTS,
					Card.ACE_OF_DIAMONDS
				],
			}
		);
	});

	it('Double counters successfully', ()=> {
		// Setup
		cy.loadGameFixture({
			// Opponent is P0
			p0Hand: [Card.ACE_OF_CLUBS, Card.TWO_OF_CLUBS],
			p0Points: [Card.TEN_OF_SPADES, Card.ACE_OF_SPADES],
			p0FaceCards: [Card.KING_OF_SPADES],
			// Player is P1
			p1Hand: [Card.TWO_OF_HEARTS],
			p1Points: [Card.TEN_OF_HEARTS, Card.ACE_OF_DIAMONDS],
			p1FaceCards: [Card.KING_OF_HEARTS],
		});
		cy.get('[data-player-hand-card]').should('have.length', 1);
		cy.log('Loaded fixture');

		// Opponent plays ace of clubs as one-off
		cy.playOneOffOpponent(Card.ACE_OF_CLUBS);
		cy.get('#cannot-counter-dialog')
			.should('not.be.visible');

		// Player counters
		cy.get('#counter-dialog')
			.should('be.visible')
			.get('[data-cy=counter]')
			.click();
		cy.get('#choose-two-dialog')
			.should('be.visible')
			.get('[data-counter-dialog-card=2-2]')
			.click();
		cy.get('#waiting-for-opponent-counter-scrim')
			.should('be.visible');
		// Opponent counters back
		cy.counterOpponent(Card.TWO_OF_CLUBS);
		
		// Player cannot counter back
		cy.get('#cannot-counter-dialog')
			.should('be.visible')
			.get('[data-cy=cannot-counter-resolve]')
			.click();
		
		assertGameState(
			1,
			{
				// Opponent is P0
				p0Hand: [],
				p0Points: [],
				p0FaceCards: [Card.KING_OF_SPADES],
				// Player is P1
				p1Hand: [],
				p1Points: [],
				p1FaceCards: [Card.KING_OF_HEARTS],
				scrap: [
					Card.ACE_OF_CLUBS,
					Card.TWO_OF_HEARTS,
					Card.TWO_OF_CLUBS,
					Card.TEN_OF_SPADES,
					Card.ACE_OF_SPADES,
					Card.TEN_OF_HEARTS,
					Card.ACE_OF_DIAMONDS
				],
			}
		);
	});

	it('Triple counters successfully', ()=> {
		cy.loadGameFixture({
			// Opponent is P0
			p0Hand: [Card.ACE_OF_CLUBS, Card.TWO_OF_CLUBS],
			p0Points: [Card.TEN_OF_SPADES, Card.ACE_OF_SPADES],
			p0FaceCards: [Card.KING_OF_SPADES],
			// Player is P1
			p1Hand: [Card.TWO_OF_HEARTS, Card.TWO_OF_SPADES],
			p1Points: [Card.TEN_OF_HEARTS, Card.ACE_OF_DIAMONDS],
			p1FaceCards: [Card.KING_OF_HEARTS],
		});
		cy.get('[data-player-hand-card]').should('have.length', 2);
		cy.log('Loaded fixture');

		// Opponent plays ace of clubs as one-off
		cy.playOneOffOpponent(Card.ACE_OF_CLUBS);
		cy.get('#cannot-counter-dialog')
			.should('not.be.visible');

		// Player counters (1st counter)
		cy.log('Player counters (1st counter)');
		cy.get('#counter-dialog')
			.should('be.visible')
			.get('[data-cy=counter]')
			.click();
		cy.get('#choose-two-dialog')
			.should('be.visible')
			.get('[data-counter-dialog-card=2-2]')
			.click();
		cy.get('#waiting-for-opponent-counter-scrim')
			.should('be.visible');
		// Opponent counters back (2nd counter)
		cy.log('Opponent counters back (2nd counter)');
		cy.counterOpponent(Card.TWO_OF_CLUBS);
		// Player counters again (3rd counter)
		cy.log('Player counters again (3rd counter');
		cy.get('#counter-dialog')
			.should('be.visible')
			.should('contain', 'Your opponent has played 2 of Clubs to Counter your 2 of Hearts.')
			.get('[data-cy=counter]')
			.click();
		cy.get('#choose-two-dialog')
			.should('be.visible')
			.get('[data-counter-dialog-card=2-3]')
			.click();
		cy.get('#waiting-for-opponent-counter-scrim')
			.should('be.visible');
		// Opponent resolves
		cy.resolveOpponent();

		assertGameState(
			1,
			{
				// Opponent is P0
				p0Hand: [],
				p0Points: [Card.TEN_OF_SPADES, Card.ACE_OF_SPADES],
				p0FaceCards: [Card.KING_OF_SPADES],
				// Player is P1
				p1Hand: [],
				p1Points: [Card.TEN_OF_HEARTS, Card.ACE_OF_DIAMONDS],
				p1FaceCards: [Card.KING_OF_HEARTS],
				scrap: [
					Card.ACE_OF_CLUBS,
					Card.TWO_OF_HEARTS,
					Card.TWO_OF_CLUBS,
					Card.TWO_OF_SPADES,
				]
			}
		);
	});

	it('Quadruple counters successfully', ()=> {
		cy.loadGameFixture({
			// Opponent is P0
			p0Hand: [Card.ACE_OF_CLUBS, Card.TWO_OF_CLUBS, Card.TWO_OF_DIAMONDS],
			p0Points: [Card.TEN_OF_SPADES, Card.ACE_OF_SPADES],
			p0FaceCards: [Card.KING_OF_SPADES],
			// Player is P1
			p1Hand: [Card.TWO_OF_HEARTS, Card.TWO_OF_SPADES],
			p1Points: [Card.TEN_OF_HEARTS, Card.ACE_OF_DIAMONDS],
			p1FaceCards: [Card.KING_OF_HEARTS],
		});
		cy.get('[data-player-hand-card]').should('have.length', 2);
		cy.log('Loaded fixture');
		// Opponent plays ace of clubs as one-off
		cy.playOneOffOpponent(Card.ACE_OF_CLUBS);
		cy.get('#cannot-counter-dialog')
			.should('not.be.visible');

		// Player counters (1st counter)
		cy.get('#counter-dialog')
			.should('be.visible')
			.get('[data-cy=counter]')
			.click();
		cy.get('#choose-two-dialog')
			.should('be.visible')
			.get('[data-counter-dialog-card=2-2]')
			.click();
		cy.get('#waiting-for-opponent-counter-scrim')
			.should('be.visible');
		// Opponent counters back (2nd counter)
		cy.counterOpponent(Card.TWO_OF_CLUBS);
		// Player counters again (3rd counter)
		cy.get('#counter-dialog')
			.should('be.visible')
			.get('[data-cy=counter]')
			.click();
		cy.get('#choose-two-dialog')
			.should('be.visible')
			.get('[data-counter-dialog-card=2-3]')
			.click();
		cy.get('#waiting-for-opponent-counter-scrim')
			.should('be.visible');
		// Opponent plays 4th and final counter
		cy.counterOpponent(Card.TWO_OF_DIAMONDS);
		// Player cannot counter back
		cy.get('#cannot-counter-dialog')
			.should('be.visible')
			.get('[data-cy=cannot-counter-resolve]')
			.click();
		assertGameState(
			1,
			{
				// Opponent is P0
				p0Hand: [],
				p0Points: [],
				p0FaceCards: [Card.KING_OF_SPADES],
				// Player is P1
				p1Hand: [],
				p1Points: [],
				p1FaceCards: [Card.KING_OF_HEARTS],
				scrap: [
					Card.ACE_OF_CLUBS,
					Card.TWO_OF_HEARTS,
					Card.TWO_OF_CLUBS,
					Card.TWO_OF_SPADES,
					Card.TWO_OF_DIAMONDS,
					Card.TEN_OF_SPADES,
					Card.ACE_OF_SPADES,
					Card.TEN_OF_HEARTS,
					Card.ACE_OF_DIAMONDS
				],
			}
		);
	});

	it('Cannot Counter When Opponent Has Queen', () => {
		cy.loadGameFixture({
			// Opponent is P0
			p0Hand: [Card.ACE_OF_CLUBS, Card.TWO_OF_CLUBS, Card.TWO_OF_DIAMONDS],
			p0Points: [Card.TEN_OF_SPADES, Card.ACE_OF_SPADES],
			p0FaceCards: [Card.QUEEN_OF_CLUBS],
			// Player is P1
			p1Hand: [Card.TWO_OF_HEARTS, Card.TWO_OF_SPADES],
			p1Points: [Card.TEN_OF_HEARTS, Card.ACE_OF_DIAMONDS],
			p1FaceCards: [Card.KING_OF_HEARTS],
		});

		cy.get('[data-player-hand-card]').should('have.length', 2);
		cy.log('Loaded fixture');
		// Opponent plays ace of clubs as one-off
		cy.playOneOffOpponent(Card.ACE_OF_CLUBS);
		cy.get('#cannot-counter-dialog')
			.should('be.visible')
			.should('contain', 'You cannot Counter, because your opponent has a queen.')
			.get('[data-cy=cannot-counter-resolve]')
			.click();

	});
});


describe('Countering One-Offs P0 Perspective', () => {
	beforeEach(() => {
		setupGameAsP0();
	});

	it('Can counter a three', () => {
		cy.loadGameFixture({
			// Player is P0
			p0Hand: [Card.FIVE_OF_CLUBS, Card.FOUR_OF_SPADES],
			p0Points: [Card.TEN_OF_SPADES, Card.ACE_OF_SPADES],
			p0FaceCards: [Card.KING_OF_SPADES],
			// Opponent is P1
			p1Hand: [Card.ACE_OF_HEARTS, Card.TWO_OF_SPADES, Card.SIX_OF_CLUBS],
			p1Points: [Card.TEN_OF_HEARTS, Card.ACE_OF_DIAMONDS],
			p1FaceCards: [Card.KING_OF_HEARTS],
			scrap: [Card.QUEEN_OF_CLUBS],
		});
		cy.get('[data-player-hand-card]').should('have.length', 2);
		cy.log('Loaded fixture');

		// Player plays three of clubs as one-off
		cy.get('[data-player-hand-card=5-0]').click();
		cy.get('[data-move-choice=oneOff]').click();

		// Opponent counters and player resolves
		cy.counterOpponent(Card.TWO_OF_SPADES);
		cy.get('#cannot-counter-dialog')
			.should('be.visible')
			.get('[data-cy=cannot-counter-resolve]')
			.click();

		// No longer player turn
		cy.get('[data-player-hand-card=4-3]').click(); // king of clubs
		playOutOfTurn('points');

		// Opponent plays a Six
		cy.playOneOffOpponent(Card.SIX_OF_CLUBS);
		cy.get('#cannot-counter-dialog')
			.should('be.visible')
			.get('[data-cy=cannot-counter-resolve]')
			.click();

		assertGameState(0, {
			// Player is P0
			p0Hand: [Card.FOUR_OF_SPADES],
			p0Points: [Card.TEN_OF_SPADES, Card.ACE_OF_SPADES],
			p0FaceCards: [],
			// Opponent is P1
			p1Hand: [Card.ACE_OF_HEARTS],
			p1Points: [Card.TEN_OF_HEARTS, Card.ACE_OF_DIAMONDS],
			p1FaceCards: [],
			scrap: [
				Card.QUEEN_OF_CLUBS,
				Card.FIVE_OF_CLUBS,
				Card.KING_OF_SPADES,
				Card.SIX_OF_CLUBS,
				Card.KING_OF_HEARTS,
				Card.TWO_OF_SPADES
			],
		});
	});

	it('Quadruple counters successfully - P0 Perspective', () => {
		cy.loadGameFixture({
			// Player is P0
			p0Hand: [Card.ACE_OF_CLUBS, Card.TWO_OF_CLUBS, Card.TWO_OF_DIAMONDS],
			p0Points: [Card.TEN_OF_SPADES, Card.ACE_OF_SPADES],
			p0FaceCards: [Card.KING_OF_SPADES],
			// Opponent is P1
			p1Hand: [Card.TWO_OF_HEARTS, Card.TWO_OF_SPADES],
			p1Points: [Card.TEN_OF_HEARTS, Card.ACE_OF_DIAMONDS],
			p1FaceCards: [Card.KING_OF_HEARTS],
		});
		cy.get('[data-player-hand-card]').should('have.length', 3);
		cy.log('Loaded fixture');
		// Player plays ace of clubs as one-off
		cy.get('[data-player-hand-card=1-0]').click();
		cy.get('[data-move-choice=oneOff]').click();

		// Opponent counters (1st counter)
		cy.log('Opponent counters (1st counter)');
		cy.counterOpponent(Card.TWO_OF_HEARTS);
		
		// Player counters back (2nd counter)
		cy.log('Player counters back (2nd counter)');
		cy.get('#counter-dialog')
			.should('be.visible')
			.should('contain', 'Your opponent has played 2 of Hearts to Counter.')
			.get('[data-cy=counter]')
			.click();
		
		cy.get('#choose-two-dialog')
			.should('be.visible')
			.get('[data-counter-dialog-card=2-0]')
			.click();
		
		// Opponent counters back (3rd counter)
		cy.log('Opponent counters (3rd counter)');
		cy.counterOpponent(Card.TWO_OF_SPADES);

		// Player counters (4th counter)
		cy.log('Player counters (4th counter)');
		cy.get('#counter-dialog')
			.should('be.visible')
			.should('contain', 'Your opponent has played 2 of Spades to Counter your 2 of Clubs.')
			.get('[data-cy=counter]')
			.click();
		cy.get('#choose-two-dialog')
			.should('be.visible')
			.get('[data-counter-dialog-card=2-1]')
			.click();
		cy.get('#waiting-for-opponent-counter-scrim')
			.should('be.visible');

		cy.resolveOpponent();
		assertGameState(
			0,
			{
				// Player is P0
				p0Hand: [],
				p0Points: [],
				p0FaceCards: [Card.KING_OF_SPADES],
				// Opponent is P1
				p1Hand: [],
				p1Points: [],
				p1FaceCards: [Card.KING_OF_HEARTS],
				scrap: [
					Card.ACE_OF_CLUBS,
					Card.TWO_OF_HEARTS,
					Card.TWO_OF_CLUBS,
					Card.TWO_OF_SPADES,
					Card.TWO_OF_DIAMONDS,
					Card.TEN_OF_SPADES,
					Card.ACE_OF_SPADES,
					Card.TEN_OF_HEARTS,
					Card.ACE_OF_DIAMONDS
				],
			}
		);
	});

	it('Cannot Counter When Opponent Has Queen, dialog message', () => {
		cy.loadGameFixture({
			// Player is P0
			p0Hand: [Card.ACE_OF_CLUBS, Card.TWO_OF_CLUBS, Card.TWO_OF_DIAMONDS],
			p0Points: [Card.TEN_OF_SPADES, Card.ACE_OF_SPADES],
			p0FaceCards: [],
			// Opponent is P1
			p1Hand: [Card.TWO_OF_HEARTS, Card.TWO_OF_SPADES],
			p1Points: [Card.TEN_OF_HEARTS, Card.ACE_OF_DIAMONDS],
			p1FaceCards: [Card.KING_OF_HEARTS, Card.QUEEN_OF_CLUBS],
		});

		cy.get('[data-player-hand-card]').should('have.length', 3);
		cy.log('Loaded fixture');
		// Player plays ace of clubs as one-off
		cy.log('Player plays ace of clubs as one-off');
		cy.get('[data-player-hand-card=1-0]').click();
		cy.get('[data-move-choice=oneOff]').click();

		// Opponent counters
		cy.log('Opponent counters');
		cy.counterOpponent(Card.TWO_OF_HEARTS);

		// Player cannot counter because of queen
		cy.get('#cannot-counter-dialog')
			.should('be.visible')
			.should('contain', 'Your opponent has played 2 of Hearts to Counter.')
			.should('contain', 'You cannot Counter, because your opponent has a queen.')
			.get('[data-cy=cannot-counter-resolve]')
			.click();
	});

});