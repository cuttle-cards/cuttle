import {
	setupGameAsP0,
	setupGameAsP1,
	assertGameState,
	assertSnackbarError,
	playOutOfTurn,
	SnackBarError,
	Card
} from '../../support/helpers';

const { _ } = Cypress;

describe('Untargeted One-Offs', () => {
	
	beforeEach(() => {
		setupGameAsP0();
	});
    
	it('Plays an Ace to destroy all point cards', () => {
		// Setup
		cy.loadGameFixture({
			p0Hand: [Card.ACE_OF_CLUBS, Card.FOUR_OF_SPADES, Card.ACE_OF_DIAMONDS],
			p0Points: [Card.TEN_OF_SPADES, Card.ACE_OF_SPADES],
			p0FaceCards: [Card.KING_OF_SPADES],
			p1Hand: [Card.ACE_OF_HEARTS],
			p1Points: [Card.TEN_OF_HEARTS, Card.TWO_OF_DIAMONDS],
			p1FaceCards: [Card.KING_OF_HEARTS],
		});
		cy.get('[data-player-hand-card]').should('have.length', 3);
		cy.log('Loaded fixture');

		// Player plays ace
		cy.playOneOffAndResolveAsPlayer(Card.ACE_OF_CLUBS);

		assertGameState(
			0,
			{
				p0Hand: [Card.FOUR_OF_SPADES, Card.ACE_OF_DIAMONDS],
				p0Points: [],
				p0FaceCards: [Card.KING_OF_SPADES],
				p1Hand: [Card.ACE_OF_HEARTS],
				p1Points: [],
				p1FaceCards: [Card.KING_OF_HEARTS],
				scrap: [
					Card.TEN_OF_SPADES,
					Card.ACE_OF_SPADES,
					Card.TEN_OF_HEARTS,
					Card.TWO_OF_DIAMONDS,
					Card.ACE_OF_CLUBS
				],
			}
		);
		// Attempt to plays ace out of turn
		cy.get('[data-player-hand-card=1-1]').click(); // ace of diamonds
		playOutOfTurn('points');
	}); // End ace one-off

	it('Plays a five to draw two cards', () => {
		// Setup
		cy.loadGameFixture({
			// Player is P0
			p0Hand: [Card.ACE_OF_CLUBS, Card.FIVE_OF_SPADES, Card.FIVE_OF_HEARTS],
			p0Points: [Card.TEN_OF_SPADES, Card.ACE_OF_SPADES],
			p0FaceCards: [Card.KING_OF_SPADES],
			// Opponent is P1
			p1Hand: [Card.ACE_OF_HEARTS],
			p1Points: [Card.TEN_OF_HEARTS, Card.ACE_OF_DIAMONDS],
			p1FaceCards: [Card.KING_OF_HEARTS],
			// Deck
			topCard: Card.THREE_OF_CLUBS,
			secondCard: Card.EIGHT_OF_HEARTS,
		});
		cy.get('[data-player-hand-card]').should('have.length', 3);
		cy.log('Loaded fixture');
		// Player plays five
		cy.playOneOffAndResolveAsPlayer(Card.FIVE_OF_SPADES);

		// Assert game state
		assertGameState(
			0,
			{
				// Player is P0
				p0Hand: [Card.ACE_OF_CLUBS, Card.FIVE_OF_HEARTS, Card.THREE_OF_CLUBS, Card.EIGHT_OF_HEARTS],
				p0Points: [Card.TEN_OF_SPADES, Card.ACE_OF_SPADES],
				p0FaceCards: [Card.KING_OF_SPADES],
				// Opponent is P1
				p1Hand: [Card.ACE_OF_HEARTS],
				p1Points: [Card.TEN_OF_HEARTS, Card.ACE_OF_DIAMONDS],
				p1FaceCards: [Card.KING_OF_HEARTS],
				scrap: [Card.FIVE_OF_SPADES],
			}
		);
		// Attempt to plays five out of turn
		cy.get('[data-player-hand-card=5-2]').click(); // five of hearts
		playOutOfTurn('oneOff');
	}); // End five one-off

	it('Plays a six to destroy all face cards', () => {
		// Setup
		cy.loadGameFixture({
			//Player is P0
			p0Hand: [
				Card.ACE_OF_CLUBS,
				Card.SIX_OF_SPADES,
				Card.SIX_OF_DIAMONDS,
				Card.JACK_OF_CLUBS,
				Card.JACK_OF_HEARTS
			],
			p0Points: [Card.THREE_OF_SPADES, Card.ACE_OF_SPADES],
			p0FaceCards: [Card.KING_OF_SPADES, Card.KING_OF_CLUBS, Card.KING_OF_DIAMONDS],
			// Opponent is P1
			p1Hand: [Card.ACE_OF_HEARTS, Card.JACK_OF_DIAMONDS, Card.JACK_OF_SPADES],
			p1Points: [Card.TWO_OF_HEARTS, Card.ACE_OF_DIAMONDS],
			p1FaceCards: [Card.KING_OF_HEARTS],
		});
		cy.get('[data-player-hand-card]').should('have.length', 5);
		cy.log('Loaded fixture');

		// Double Jack (control will remain unchanged when 6 resolves)
		// Player & Opponent jack then re-jack the TWO of Hearts
		cy.get('[data-player-hand-card=11-2]').click();
		cy.get('[data-move-choice=jack').click();
		cy.get('[data-opponent-point-card=2-2]').click();
		cy.get('[data-player-point-card=2-2]'); // point card now controlled by player
		cy.playJackOpponent(Card.JACK_OF_SPADES, Card.TWO_OF_HEARTS);

		// Single Jacks (control will switch when 6 resolves)
		// Player jacks opponent's Ace of diamonds
		cy.get('[data-player-hand-card=11-0]').click();
		cy.get('[data-move-choice=jack]').click();
		cy.get('[data-opponent-point-card=1-1]').click();
		// Opponent jacks player's Three of spades
		cy.playJackOpponent(Card.JACK_OF_DIAMONDS, Card.THREE_OF_SPADES);
		// Player plays six
		cy.playOneOffAndResolveAsPlayer(Card.SIX_OF_SPADES);

		assertGameState(
			0,
			{
				p0Hand: [Card.ACE_OF_CLUBS, Card.SIX_OF_DIAMONDS],
				p0Points: [Card.THREE_OF_SPADES, Card.ACE_OF_SPADES],
				p0FaceCards: [],
				// Opponent is P1
				p1Hand: [Card.ACE_OF_HEARTS],
				p1Points: [Card.TWO_OF_HEARTS, Card.ACE_OF_DIAMONDS],
				p1FaceCards: [],
				scrap:[
					Card.SIX_OF_SPADES,
					Card.KING_OF_CLUBS,
					Card.KING_OF_DIAMONDS,
					Card.KING_OF_HEARTS,
					Card.KING_OF_SPADES,
					Card.JACK_OF_CLUBS,
					Card.JACK_OF_DIAMONDS,
					Card.JACK_OF_HEARTS,
					Card.JACK_OF_SPADES,
				]
			}
		);
		// Attempt to plays six out of turn
		cy.get('[data-player-hand-card=6-1]').click(); // six of diamonds
		playOutOfTurn('oneOff');
	}); // End 6 one-off

}); // End untargeted one-off describe

describe('FOURS', () => {
	describe('Playing FOURS', () => {
		beforeEach(() => {
			setupGameAsP0();
		});
	
		it('Plays a 4 to make opponent discard two cards of their choice', () => {
			// Set Up
			cy.loadGameFixture({
				p0Hand: [Card.FOUR_OF_SPADES, Card.FOUR_OF_CLUBS],
				p0Points: [],
				p0FaceCards: [],
				p1Hand: [Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS, Card.TEN_OF_HEARTS],
				p1Points: [],
				p1FaceCards: [],
			});
			cy.get('[data-player-hand-card]').should('have.length', 2);
			cy.log('Loaded fixture');
			
			cy.playOneOffAndResolveAsPlayer(Card.FOUR_OF_SPADES);
			// Opponent chooses two cards to discard
			cy.discardOpponent(Card.ACE_OF_HEARTS, Card.TEN_OF_HEARTS);
			cy.get('#waiting-for-opponent-discard-scrim')
				.should('not.be.visible');
			
			assertGameState(0,
				{
					p0Hand: [Card.FOUR_OF_CLUBS],
					p0Points: [],
					p0FaceCards: [],
					p1Hand: [Card.ACE_OF_DIAMONDS],
					p1Points: [],
					p1FaceCards: [], 
					scrap: [Card.FOUR_OF_SPADES, Card.ACE_OF_HEARTS, Card.TEN_OF_HEARTS],
				}
			);
		});
	
		it('Plays a 4 to make opponent discard their only two cards', () => {
			// Set Up
			cy.loadGameFixture({
				p0Hand: [Card.FOUR_OF_CLUBS],
				p0Points: [],
				p0FaceCards: [],
				p1Hand: [Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS],
				p1Points: [],
				p1FaceCards: [],
			});
			cy.get('[data-player-hand-card]').should('have.length', 1);
			cy.log('Loaded fixture');

			cy.playOneOffAndResolveAsPlayer(Card.FOUR_OF_CLUBS);

			cy.get('#waiting-for-opponent-discard-scrim')
				.should('be.visible');
			// Opponent chooses two cards to discard
			cy.log('Opponent discards both their remaining cards');
			cy.discardOpponent(Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS);
			cy.get('#waiting-for-opponent-discard-scrim')
				.should('not.be.visible');
		
			assertGameState(0, {
				p0Hand: [],
				p0Points: [],
				p0FaceCards: [],
				p1Hand: [],
				p1Points: [],
				p1FaceCards: [],
				scrap: [Card.FOUR_OF_CLUBS, Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS],
			});
		});
	
		it('Plays a 4 to make opponent discard the last card in their hand', () => {
			// Set Up
			cy.loadGameFixture({
				p0Hand: [Card.FOUR_OF_CLUBS],
				p0Points: [],
				p0FaceCards: [],
				p1Hand: [Card.ACE_OF_HEARTS],
				p1Points: [],
				p1FaceCards: [],
			});
			cy.get('[data-player-hand-card]').should('have.length', 1);
			cy.log('Loaded fixture');
	
			// Play the four of clubs
			cy.playOneOffAndResolveAsPlayer(Card.FOUR_OF_CLUBS);
			cy.get('#waiting-for-opponent-discard-scrim')
				.should('be.visible');
			// Opponent chooses two cards to discard
			cy.log('Opponent discards both their remaining cards');
			cy.discardOpponent(Card.ACE_OF_HEARTS);
			cy.get('#waiting-for-opponent-discard-scrim')
				.should('not.be.visible');
		
			assertGameState(0, {
				p0Hand: [],
				p0Points: [],
				p0FaceCards: [],
				p1Hand: [],
				p1Points: [],
				p1FaceCards: [],
				scrap: [Card.FOUR_OF_CLUBS, Card.ACE_OF_HEARTS],
			});
		});
	
		it('Prevents playing a 4 when opponent has no cards in hand', () => {
			// Set Up
			cy.loadGameFixture({
				p0Hand: [Card.FOUR_OF_CLUBS],
				p0Points: [],
				p0FaceCards: [],
				p1Hand: [],
				p1Points: [],
				p1FaceCards: [],
			});
			cy.get('[data-player-hand-card]').should('have.length', 1);
			cy.log('Loaded fixture');
	
			// Play the four of spades
			cy.log('Attempting to playing Four of clubs as one off');
			cy.get('[data-player-hand-card=4-0]').click(); // four of clubs
			cy.get('[data-move-choice=oneOff]').click();
	
			assertSnackbarError('You cannot play a 4 as a one-off while your opponent has no cards in hand');

			assertGameState(0, {
				p0Hand: [Card.FOUR_OF_CLUBS],
				p0Points: [],
				p0FaceCards: [],
				p1Hand: [],
				p1Points: [],
				p1FaceCards: [],
			});
		});

		it('Prevents opponent from discarding illegally', () => {
			// Set Up
			cy.loadGameFixture({
				p0Hand: [Card.FOUR_OF_SPADES, Card.FOUR_OF_CLUBS],
				p0Points: [],
				p0FaceCards: [],
				p1Hand: [Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS, Card.TEN_OF_HEARTS],
				p1Points: [],
				p1FaceCards: [],
			});
			cy.get('[data-player-hand-card]').should('have.length', 2);
			cy.log('Loaded fixture');

			cy.playOneOffAndResolveAsPlayer(Card.FOUR_OF_SPADES);
			cy.get('#waiting-for-opponent-discard-scrim')
				.should('be.visible');

			// Illegal Discard 1: Only 1 card selected
			cy.log('Opponent illegally discards: No cards selected');
			cy.discardOpponent(); // Discard with no selection
			cy.get('#waiting-for-opponent-discard-scrim')
				.should('be.visible');
			assertGameState(0, {
				p0Hand: [Card.FOUR_OF_CLUBS],
				p0Points: [],
				p0FaceCards: [],
				p1Hand: [Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS, Card.TEN_OF_HEARTS],
				p1Points: [],
				p1FaceCards: [],
				scrap: [Card.FOUR_OF_SPADES]
			});
			cy.log('Successfully prevented discarding with no cards selected');

			// Illegal Discard 2: Only 1 card selected
			cy.log('Opponent illegally discards: Chooses only 1 card');
			cy.discardOpponent(Card.ACE_OF_HEARTS); // Only 1 card selected (should have 2)
			cy.get('#waiting-for-opponent-discard-scrim')
				.should('be.visible');
			assertGameState(0, {
				p0Hand: [Card.FOUR_OF_CLUBS],
				p0Points: [],
				p0FaceCards: [],
				p1Hand: [Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS, Card.TEN_OF_HEARTS],
				p1Points: [],
				p1FaceCards: [],
				scrap: [Card.FOUR_OF_SPADES]
			});
			cy.log('Successfully prevented discarding only 1 card');

			// Illegal Discard 3: Card not in hand
			cy.log('Opponent illegally discards: Chooses a card not in their hand');
			cy.discardOpponent(Card.ACE_OF_HEARTS, Card.TEN_OF_SPADES); // Ten of spades not in hand
			cy.get('#waiting-for-opponent-discard-scrim')
				.should('be.visible');
			assertGameState(0, {
				p0Hand: [Card.FOUR_OF_CLUBS],
				p0Points: [],
				p0FaceCards: [],
				p1Hand: [Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS, Card.TEN_OF_HEARTS],
				p1Points: [],
				p1FaceCards: [],
				scrap: [Card.FOUR_OF_SPADES]
			});
			cy.log('Successfully prevented discarding a card not in hand');

			// Legal Discard
			cy.discardOpponent(Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS);
			cy.get('#waiting-for-opponent-discard-scrim')
				.should('not.be.visible');
			assertGameState(0, {
				p0Hand: [Card.FOUR_OF_CLUBS],
				p0Points: [],
				p0FaceCards: [],
				p1Hand: [Card.TEN_OF_HEARTS],
				p1Points: [],
				p1FaceCards: [],
				scrap: [
					Card.FOUR_OF_SPADES,
					Card.ACE_OF_HEARTS,
					Card.ACE_OF_DIAMONDS,
				],
			});
		});
	});
	
	describe('Opponent playing FOURS', () => {
		beforeEach(() => {
			setupGameAsP1();
		});

		it('Discards two cards when opponent plays a four, repeated fours', () => {
			cy.loadGameFixture({
				p0Hand: [Card.FOUR_OF_CLUBS, Card.FOUR_OF_DIAMONDS],
				p0Points: [],
				p0FaceCards: [],
				p1Hand: [Card.FOUR_OF_SPADES, Card.ACE_OF_DIAMONDS, Card.TEN_OF_HEARTS ],
				p1Points: [],
				p1FaceCards: [],
				topCard: Card.SIX_OF_DIAMONDS,
			});
			cy.get('[data-player-hand-card]').should('have.length', 3);
			cy.log('Loaded fixture');
	
			// Opponent plays four
			cy.playOneOffOpponent(Card.FOUR_OF_CLUBS);
			// Player cannot counter
			cy.get('#cannot-counter-dialog')
				.should('be.visible')
				.get('[data-cy=cannot-counter-resolve]')
				.click();
			cy.log('Player resolves opponent\'s Four');

			// Four Dialog appears (you must discard)
			cy.get('#four-discard-dialog')
				.should('be.visible');
			// Choosing cards to discard
			cy.log('Choosing two cards to discard');
			cy.get('[data-cy=submit-four-dialog]').should('be.disabled'); // can't prematurely submit
			cy.get('[data-discard-card=1-1]').click(); // ace of diamonds
			cy.get('[data-cy=submit-four-dialog]').should('be.disabled'); // can't prematurely submit
			cy.get('[data-discard-card=4-3]').click(); // four of spades
			cy.get('[data-cy=submit-four-dialog]').click(); // submit choice to discard
	
			assertGameState(1,
				{
					p0Hand: [Card.FOUR_OF_DIAMONDS],
					p0Points: [],
					p0FaceCards: [],
					p1Hand: [Card.TEN_OF_HEARTS],
					p1Points: [],
					p1FaceCards: [],
					scrap: [Card.FOUR_OF_CLUBS, Card.FOUR_OF_SPADES, Card.ACE_OF_DIAMONDS],
					topCard: Card.SIX_OF_DIAMONDS,
				}
			);

			// Player draws the 6 of diamonds
			cy.get('#deck')
				.click();
			
			// Opponent plays 2nd four
			cy.playOneOffOpponent(Card.FOUR_OF_DIAMONDS);
			// Player cannot counter
			cy.get('#cannot-counter-dialog')
				.should('be.visible')
				.get('[data-cy=cannot-counter-resolve]')
				.click();

			// Choosing cards to discard
			cy.log('Choosing two cards to discard');
			cy.get('[data-cy=submit-four-dialog]')
				.should('be.disabled'); // can't prematurely submit
			// Discard dialog should still be open
			cy.get('#four-discard-dialog')
				.should('be.visible');
			// Validate game state same as above
			assertGameState(1,
				{
					p0Hand: [],
					p0Points: [],
					p0FaceCards: [],
					p1Hand: [Card.TEN_OF_HEARTS, Card.SIX_OF_DIAMONDS],
					p1Points: [],
					p1FaceCards: [],
					scrap: [
						Card.FOUR_OF_CLUBS,
						Card.ACE_OF_DIAMONDS,
						Card.FOUR_OF_SPADES,
						Card.FOUR_OF_DIAMONDS
					],
				}
			);
			// Properly discard as expected
			cy.log('Choosing two cards to discard - second time');
			cy.get('[data-discard-card=10-2]').click(); // 10 of hearts
			cy.get('[data-cy=submit-four-dialog]').should('be.disabled'); // can't prematurely submit
			cy.get('[data-discard-card=6-1]').click(); // six of diamonds
			cy.get('[data-cy=submit-four-dialog]').click(); // submit choice to discard

			assertGameState(1,
				{
					p0Hand: [],
					p0Points: [],
					p0FaceCards: [],
					p1Hand: [],
					p1Points: [],
					p1FaceCards: [],
					scrap: [
						Card.FOUR_OF_CLUBS,
						Card.FOUR_OF_SPADES,
						Card.ACE_OF_DIAMONDS,
						Card.TEN_OF_HEARTS,
						Card.SIX_OF_DIAMONDS,
						Card.FOUR_OF_DIAMONDS
					],
				}
			);
		});
	
		it('Discards last card when FOURd with one card in hand', () => {
			cy.loadGameFixture({
				p0Hand: [Card.FOUR_OF_CLUBS],
				p0Points: [],
				p0FaceCards: [],
				p1Hand: [Card.ACE_OF_DIAMONDS],
				p1Points: [],
				p1FaceCards: [],
			});
			cy.get('[data-player-hand-card]').should('have.length', 1);
			cy.log('Loaded fixture');	
	
			// Opponent plays four
			cy.playOneOffOpponent(Card.FOUR_OF_CLUBS);
			// Player cannot counter
			cy.get('#cannot-counter-dialog')
				.should('be.visible')
				.get('[data-cy=cannot-counter-resolve]')
				.click();
	
			// Four Dialog appears (you must discard)
			cy.get('#four-discard-dialog')
				.should('be.visible');
			// Choosing cards to discard
			cy.log('Choosing (only) card to discard');
			cy.get('[data-cy=submit-four-dialog]').should('be.disabled'); // can't prematurely submit
			cy.get('[data-discard-card=1-1]').click(); // ace of diamonds
			cy.get('[data-cy=submit-four-dialog]').click();
			
			assertGameState(1,
				{
					p0Hand: [],
					p0Points: [],
					p0FaceCards: [],
					p1Hand: [],
					p1Points: [],
					p1FaceCards: [],
					scrap: [Card.FOUR_OF_CLUBS, Card.ACE_OF_DIAMONDS],
				}
			);
		});
	});
});

describe('Play TWOS', () => {
	describe('Player Playing TWOS', () => {
		beforeEach(() => {
			setupGameAsP0();
		});

		it('Plays Two to Destroy Face Card', () => {
			// Set Up
			cy.loadGameFixture({
				p0Hand: [Card.ACE_OF_SPADES, Card.TWO_OF_CLUBS],
				p0Points: [Card.TEN_OF_SPADES],
				p0FaceCards: [Card.KING_OF_SPADES],
				p1Hand: [Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS],
				p1Points: [Card.TEN_OF_HEARTS],
				p1FaceCards: [Card.KING_OF_HEARTS],
			});
			cy.get('[data-player-hand-card]').should('have.length', 2);
			cy.log('Loaded fixture');

			// Play two as one off (two of clubs)
			cy.get('[data-player-hand-card=2-0]').click();
			cy.get('[data-move-choice=targetedOneOff]').click();
			cy.get('#player-hand-targeting')
				.should('be.visible');
			cy.get('[data-opponent-face-card=13-2]')
				.click(); // target king of hearts

			// Opponent resolves
			cy.get('#waiting-for-opponent-counter-scrim')
				.should('be.visible');
			cy.resolveOpponent();
			cy.get('#waiting-for-opponent-counter-scrim')
				.should('not.be.visible');

			assertGameState(0,
				{
					p0Hand: [Card.ACE_OF_SPADES],
					p0Points: [Card.TEN_OF_SPADES],
					p0FaceCards: [Card.KING_OF_SPADES],
					p1Hand: [Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS],
					p1Points: [Card.TEN_OF_HEARTS],
					p1FaceCards: [],
					scrap: [Card.TWO_OF_CLUBS, Card.KING_OF_HEARTS]
				});
		});

		it('Plays TWO to Destroy Jacks', () => {
			cy.loadGameFixture({
				p0Hand: [Card.ACE_OF_SPADES, Card.TWO_OF_CLUBS],
				p0Points: [Card.TEN_OF_SPADES],
				p0FaceCards: [],
				p1Hand: [Card.JACK_OF_CLUBS],
				p1Points: [],
				p1FaceCards: [],
			});
			cy.get('[data-player-hand-card]').should('have.length', 2);
			cy.log('Loaded fixture');

			// player plays Ace of Spades
			cy.get('[data-player-hand-card=1-3]').click();
			cy.get('[data-move-choice=points]').click();

			assertGameState(0, {
				p0Hand: [Card.TWO_OF_CLUBS],
				p0Points: [Card.TEN_OF_SPADES, Card.ACE_OF_SPADES],
				p0FaceCards: [],
				p1Hand: [Card.JACK_OF_CLUBS],
				p1Points: [],
				p1FaceCards: []
			});

			// Opponent plays jack
			cy.playJackOpponent(Card.JACK_OF_CLUBS, Card.ACE_OF_SPADES)

			cy.get('[data-player-hand-card]').should('have.length', 1);

			assertGameState(0, {
				p0Hand: [Card.TWO_OF_CLUBS],
				p0Points: [Card.TEN_OF_SPADES],
				p0FaceCards: [],
				p1Hand: [],
				p1Points: [Card.ACE_OF_SPADES],
				p1FaceCards: []
			});

			// Player plays TWO to destroy jack
			cy.get('[data-player-hand-card=2-0]').click();
			cy.get('[data-move-choice=targetedOneOff]').click();
			cy.get('#player-hand-targeting')
				.should('be.visible');
			cy.get('[data-opponent-face-card=11-0]').click();

			// Wait for opponent to resolve
			cy.get('#waiting-for-opponent-counter-scrim')
				.should('be.visible');
			cy.resolveOpponent();

			assertGameState(0, {
				p0Hand: [],
				p0Points: [Card.ACE_OF_SPADES, Card.TEN_OF_SPADES],
				p0FaceCards: [],
				p1Hand: [],
				p1Points: [],
				p1FaceCards: [],
				scrap: [Card.TWO_OF_CLUBS, Card.JACK_OF_CLUBS]
			});
			// Should no longer see jack of clubs on screen
			cy.get('[data-player-face-card=11-0]')
				.should('not.exist');
		}); // End playing TWO to destroy jack

		
	}); // End describe player playing twos

	describe('Opponent Playing TWOS', () => {
		beforeEach(() => {
			setupGameAsP1();
		});

		it('Opponent Plays TWO to Destroy Jacks', () => {
			cy.loadGameFixture({
				p0Hand: [Card.ACE_OF_SPADES, Card.TWO_OF_CLUBS],
				p0Points: [Card.TEN_OF_SPADES],
				p0FaceCards: [],
				p1Hand: [Card.JACK_OF_CLUBS],
				p1Points: [],
				p1FaceCards: [],
			});
			cy.get('[data-player-hand-card]').should('have.length', 1);
			cy.log('Loaded fixture');

			cy.playPointsOpponent(Card.ACE_OF_SPADES);

			cy.get('[data-player-hand-card=11-0]').click();
			cy.get('[data-move-choice=jack').click();
			cy.get('[data-opponent-point-card=1-3]').click();

			assertGameState(1, {
				p0Hand: [Card.TWO_OF_CLUBS],
				p0Points: [Card.TEN_OF_SPADES],
				p0FaceCards: [],
				p1Hand: [],
				p1Points: [Card.ACE_OF_SPADES],
				p1FaceCards: [],
			});
			cy.log('Opponent playing TWO on jack')
			cy.playTargetedOneOffOpponent(Card.TWO_OF_CLUBS, Card.JACK_OF_CLUBS, 'jack')

			// player resolves
			cy.get('#cannot-counter-dialog')
				.should('be.visible')
				.get('[data-cy=cannot-counter-resolve]')
				.click()

			assertGameState(1, {
				p0Hand: [],
				p0Points: [Card.TEN_OF_SPADES, Card.ACE_OF_SPADES],
				p0FaceCards: [],
				p1Hand: [],
				p1Points: [],
				p1FaceCards: [],
				scrap: [Card.TWO_OF_CLUBS, Card.JACK_OF_CLUBS]
			});
		});
		
	});
});

describe('Playing NINES', ()=>{
	describe('Player Playing NINES', () => {
		beforeEach(() => {
			setupGameAsP0();
		});
	
		it('Plays a nine to SCUTTLE a lower point card', () => {
			cy.loadGameFixture({
				p0Hand: [Card.NINE_OF_SPADES, Card.NINE_OF_HEARTS],
				p0Points: [Card.TEN_OF_HEARTS],
				p0FaceCards: [],
				p1Hand: [Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS],
				p1Points: [Card.ACE_OF_DIAMONDS],
				p1FaceCards: [],
			});
			cy.get('[data-player-hand-card]').should('have.length', 2);
			cy.log('Loaded fixture');
	
			// Player plays nine
			cy.get('[data-player-hand-card=9-3]').click(); // nine of spades	
			cy.get('[data-move-choice=scuttle]').click();
			cy.get('#player-hand-targeting')
				.should('be.visible');
			cy.get('[data-opponent-point-card=1-1]').click(); // ace of diamonds
				
			assertGameState(
				0,
				{
					p0Hand: [Card.NINE_OF_HEARTS],
					p0Points: [Card.TEN_OF_HEARTS],
					p0FaceCards: [],
					p1Hand: [Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS],
					p1Points: [],
					p1FaceCards: [],
					scrap: [Card.NINE_OF_SPADES, Card.ACE_OF_DIAMONDS],
				}
			);
		}); // End 9 scuttle
	
		it('Plays a nine as ONE-OFF on lower point card to return it to owners hand', () => {
			cy.loadGameFixture({
				p0Hand: [Card.NINE_OF_SPADES, Card.NINE_OF_HEARTS],
				p0Points: [Card.TEN_OF_HEARTS],
				p0FaceCards: [],
				p1Hand: [Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS],
				p1Points: [Card.ACE_OF_DIAMONDS],
				p1FaceCards: [],
			});
			cy.get('[data-player-hand-card]').should('have.length', 2);
			cy.log('Loaded fixture');
	
			// Player plays nine
			cy.get('[data-player-hand-card=9-3]').click(); // nine of spades
			cy.get('[data-move-choice=targetedOneOff').click();
			cy.get('[data-opponent-point-card=1-1]').click(); // ace of diamonds
	
			// Wait for opponent to resolve
			cy.get('#waiting-for-opponent-counter-scrim')
				.should('be.visible');
			cy.resolveOpponent();
	
			assertGameState(
				0,
				{
					p0Hand: [Card.NINE_OF_HEARTS],
					p0Points: [Card.TEN_OF_HEARTS],
					p0FaceCards: [],
					p1Hand: [Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS, Card.ACE_OF_DIAMONDS],
					p1Points: [],
					p1FaceCards: [],
					scrap: [Card.NINE_OF_SPADES],
				}
			);		
		}); // End 9 one-off low point card
	
		it('Plays a nine as ONE-OFF on a higher point card to return it to owners hand', () => {
			cy.loadGameFixture({
				p0Hand: [Card.NINE_OF_CLUBS, Card.NINE_OF_HEARTS],
				p0Points: [Card.TEN_OF_HEARTS],
				p0FaceCards: [],
				p1Hand: [Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS],
				p1Points: [Card.NINE_OF_SPADES],
				p1FaceCards: [],
			});
			cy.get('[data-player-hand-card]').should('have.length', 2);
			cy.log('Loaded fixture');

			// Attempt illegal scuttle
			cy.get('[data-player-hand-card=9-0]').click();
			cy.get('[data-move-choice=scuttle]')
				.should('have.class', 'v-card--disabled')
				.should('contain', 'You can only scuttle smaller point cards')
				.click({force: true});
			cy.get('#player-hand-targeting')
				.should('be.visible');
			cy.get('[data-opponent-point-card=9-3]').click();
			assertSnackbarError(SnackBarError.ILLEGAL_SCUTTLE);

			// Player plays nine
			cy.get('[data-player-hand-card=9-2]').click(); // nine of hearts
			cy.get('[data-move-choice=targetedOneOff]').click();
			cy.get('#player-hand-targeting')
				.should('be.visible');
			cy.get('[data-opponent-point-card=9-3]').click(); // nine of spades
			cy.log('Successfully played nine one-off on higher point card');
	
			// Wait for opponent to resolve
			cy.get('#waiting-for-opponent-counter-scrim')
				.should('be.visible');
			cy.resolveOpponent();
			
			assertGameState(
				0,
				{
					p0Hand: [Card.NINE_OF_CLUBS],
					p0Points: [Card.TEN_OF_HEARTS],
					p0FaceCards: [],
					p1Hand: [Card.NINE_OF_SPADES, Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS],
					p1Points: [],
					p1FaceCards: [],
					scrap: [Card.NINE_OF_HEARTS],
				}
			);
		}); // End 9 one-off high-point card
	
		it('Plays a nine as a ONE-OFF to return a face card to its owners hand', () => {
			cy.loadGameFixture({
				p0Hand: [Card.NINE_OF_SPADES, Card.NINE_OF_HEARTS],
				p0Points: [Card.TEN_OF_HEARTS],
				p0FaceCards: [],
				p1Hand: [Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS],
				p1Points: [],
				p1FaceCards: [Card.KING_OF_DIAMONDS],
			});
			cy.get('[data-player-hand-card]').should('have.length', 2);
			cy.log('Loaded fixture');
	
			// Player plays nine
			cy.get('[data-player-hand-card=9-3]').click(); // nine of spades
			cy.get('[data-move-choice=targetedOneOff]').click();
			cy.get('#player-hand-targeting')
				.should('be.visible');
			cy.get('[data-opponent-face-card=13-1]').click(); // king of diamonds

			// Wait for opponent to resolve
			cy.get('#waiting-for-opponent-counter-scrim')
				.should('be.visible');
			cy.resolveOpponent();
	
			assertGameState(
				0,
				{
					p0Hand: [Card.NINE_OF_HEARTS],
					p0Points: [Card.TEN_OF_HEARTS],
					p0FaceCards: [],
					p1Hand: [Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS, Card.KING_OF_DIAMONDS],
					p1Points: [],
					p1FaceCards: [],
					scrap: [Card.NINE_OF_SPADES],
				}
			);			
		}); // End 9 on face card
	
		it('Plays a 9 on a jack to steal back point card', () => {
			cy.loadGameFixture({
				p0Hand: [Card.ACE_OF_SPADES, Card.NINE_OF_CLUBS],
				p0Points: [Card.TEN_OF_SPADES],
				p0FaceCards: [],
				p1Hand: [Card.JACK_OF_CLUBS],
				p1Points: [],
				p1FaceCards: [],
			});
			cy.get('[data-player-hand-card]').should('have.length', 2);
			cy.log('Loaded fixture');

			// Player plays Ace of Spades
			cy.get('[data-player-hand-card=1-3]').click();
			cy.get('[data-move-choice=points]').click();

			assertGameState(0, {
				p0Hand: [Card.NINE_OF_CLUBS],
				p0Points: [Card.TEN_OF_SPADES, Card.ACE_OF_SPADES],
				p0FaceCards: [],
				p1Hand: [Card.JACK_OF_CLUBS],
				p1Points: [],
				p1FaceCards: []
			});
		
			// Opponent plays jack
			cy.playJackOpponent(Card.JACK_OF_CLUBS, Card.ACE_OF_SPADES)

			assertGameState(0, {
				p0Hand: [Card.NINE_OF_CLUBS],
				p0Points: [Card.TEN_OF_SPADES],
				p0FaceCards: [],
				p1Hand: [],
				p1Points: [Card.ACE_OF_SPADES],
				p1FaceCards: []
			});

			// Player plays NINE to destroy jack
			cy.get('[data-player-hand-card=9-0]').click();
			cy.get('[data-move-choice=targetedOneOff]').click();
			cy.get('#player-hand-targeting')
				.should('be.visible');
			cy.get('[data-opponent-face-card=11-0]').click();

			// Wait for opponent to resolve
			cy.get('#waiting-for-opponent-counter-scrim')
				.should('be.visible');
			cy.resolveOpponent();

			assertGameState(0, {
				p0Hand: [],
				p0Points: [Card.ACE_OF_SPADES, Card.TEN_OF_SPADES],
				p0FaceCards: [],
				p1Hand: [Card.JACK_OF_CLUBS],
				p1Points: [],
				p1FaceCards: [],
				scrap: [Card.NINE_OF_CLUBS]
			});

			// Should no longer see jack of clubs on screen
			cy.get('[data-player-face-card=11-0]')
				.should('not.exist');
		}); // End 9 on jack
	
		it('Cancels playing a nine one off', () => {
			cy.loadGameFixture({
				p0Hand: [Card.NINE_OF_SPADES, Card.NINE_OF_HEARTS],
				p0Points: [Card.TEN_OF_HEARTS],
				p0FaceCards: [],
				p1Hand: [Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS],
				p1Points: [Card.ACE_OF_DIAMONDS],
				p1FaceCards: [],
			});
			cy.get('[data-player-hand-card]').should('have.length', 2);
			cy.log('Loaded fixture');
	
			// Player plays nine
			cy.get('[data-player-hand-card=9-3]').click(); // nine of spades
			cy.get('[data-move-choice=targetedOneOff]').click();
			cy.get('#player-hand-targeting')
				.should('be.visible');

			// Cancels			
			cy.get('[data-cy=cancel-target]').click();
			cy.get('#player-hand-targeting')
				.should('not.be.visible');

			assertGameState(
				0,
				{
					p0Hand: [Card.NINE_OF_HEARTS, Card.NINE_OF_SPADES],
					p0Points: [Card.TEN_OF_HEARTS],
					p0FaceCards: [],
					p1Hand: [Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS],
					p1Points: [Card.ACE_OF_DIAMONDS],
					p1FaceCards: [],
					scrap: [],
				}
			);
		});

		it('Plays a nine as a ONE-OFF, make sure that the bounced card is playable later', ()=>{
			/*
			1). P0 plays a 9, targeting an in-play Queen
			2). P1 plays a 6's one-off, removing some cards
			3). P0 plays a Jack, targeting an in-play 10
			4). P1 can replay their bounced Queen
			 */

			// Initial state
			cy.loadGameFixture({
				p0Hand: [Card.NINE_OF_SPADES, Card.JACK_OF_SPADES],
				p0Points: [],
				p0FaceCards: [Card.KING_OF_HEARTS],
				p1Hand: [Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS],
				p1Points: [Card.TEN_OF_HEARTS],
				p1FaceCards: [Card.QUEEN_OF_DIAMONDS],
			});
			cy.get('[data-player-hand-card]').should('have.length', 2);
			cy.log('Loaded fixture');

			// STEP 1
			cy.log('STEP 1- P0 plays nine, targeting the Queen in play');
			cy.get('[data-player-hand-card=9-3]').click(); // nine of spades
			cy.get('[data-move-choice=targetedOneOff]').click();
			cy.get('#player-hand-targeting')
				.should('be.visible');
			cy.get('[data-opponent-face-card=12-1]').click(); // queen of diamonds

			// Wait for opponent to resolve
			cy.get('#waiting-for-opponent-counter-scrim')
				.should('be.visible');
			cy.resolveOpponent();

			assertGameState(
				0,
				{
					p0Hand: [Card.JACK_OF_SPADES],
					p0Points: [],
					p0FaceCards: [Card.KING_OF_HEARTS],
					p1Hand: [Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS, Card.QUEEN_OF_DIAMONDS],
					p1Points: [Card.TEN_OF_HEARTS],
					p1FaceCards: [],
					scrap: [Card.NINE_OF_SPADES],
				}
			);

			// STEP 2
			cy.log('STEP 2- P1 plays a six, removing face cards');
			cy.playOneOffOpponent(Card.SIX_OF_HEARTS);

			cy.get('#cannot-counter-dialog')
				.should('be.visible')
				.get('[data-cy=cannot-counter-resolve]')
				.click();

			assertGameState(
				0,
				{
					p0Hand: [Card.JACK_OF_SPADES],
					p0Points: [],
					p0FaceCards: [],
					p1Hand: [Card.QUEEN_OF_HEARTS, Card.QUEEN_OF_DIAMONDS],
					p1Points: [Card.TEN_OF_HEARTS],
					p1FaceCards: [],
					scrap: [Card.NINE_OF_SPADES, Card.KING_OF_HEARTS, Card.SIX_OF_HEARTS],
				}
			);

			// STEP 3
			cy.log('STEP 3- P0 plays a Jack, targeting the Ten');
			cy.get('[data-player-hand-card=11-3]').click();
			cy.get('[data-move-choice=jack]').click();
			cy.get('[data-opponent-point-card=10-2]')
				.click();

			assertGameState(0,
				{
					p0Hand: [],
					p0Points: [Card.TEN_OF_HEARTS],
					p0FaceCards: [],
					p1Hand: [Card.QUEEN_OF_HEARTS, Card.QUEEN_OF_DIAMONDS],
					p1Points: [],
					p1FaceCards: [],
					scrap: [Card.NINE_OF_SPADES, Card.KING_OF_HEARTS, Card.SIX_OF_HEARTS],
				});

			// STEP 4
			cy.log('STEP 4- P1 plays their previously bounced Queen');
			cy.playFaceCardOpponent(Card.QUEEN_OF_DIAMONDS);

			assertGameState(
				0,
				{
					p0Hand: [],
					p0Points: [Card.TEN_OF_HEARTS],
					p0FaceCards: [],
					p1Hand: [Card.QUEEN_OF_HEARTS],
					p1Points: [],
					p1FaceCards: [Card.QUEEN_OF_DIAMONDS],
					scrap: [Card.NINE_OF_SPADES, Card.KING_OF_HEARTS, Card.SIX_OF_HEARTS],
				}
			);


		});

		it('Plays a nine as a ONE-OFF, make sure that the bounced card is playable even if there is countering', ()=>{
			/*
			1). P0 plays 9 one-off, targeting P1's Queen
			2). P1 plays 6's one-off
			3). P0 counters and it resolves
			4). P0 plays their Jack, targeting P1's 10
			5). P1 plays their Queen again (it should no longer be frozen)
			 */

			// Initial state
			cy.loadGameFixture({
				p0Hand: [Card.TWO_OF_SPADES, Card.NINE_OF_SPADES, Card.JACK_OF_SPADES],
				p0Points: [],
				p0FaceCards: [Card.KING_OF_HEARTS],
				p1Hand: [Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS],
				p1Points: [Card.TEN_OF_HEARTS],
				p1FaceCards: [Card.QUEEN_OF_DIAMONDS],
			});
			cy.get('[data-player-hand-card]').should('have.length', 3);
			cy.log('Loaded fixture');

			// STEP 1
			cy.log('STEP 1- P0 plays nine, targeting the Queen in play');
			cy.get('[data-player-hand-card=9-3]').click(); // nine of spades
			cy.get('[data-move-choice=targetedOneOff]').click();
			cy.get('#player-hand-targeting')
				.should('be.visible');
			cy.get('[data-opponent-face-card=12-1]').click(); // queen of diamonds

			// Wait for opponent to resolve
			cy.get('#waiting-for-opponent-counter-scrim')
				.should('be.visible');
			cy.resolveOpponent();

			assertGameState(
				0,
				{
					p0Hand: [Card.TWO_OF_SPADES, Card.JACK_OF_SPADES],
					p0Points: [],
					p0FaceCards: [Card.KING_OF_HEARTS],
					p1Hand: [Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS, Card.QUEEN_OF_DIAMONDS],
					p1Points: [Card.TEN_OF_HEARTS],
					p1FaceCards: [],
					scrap: [Card.NINE_OF_SPADES],
				}
			);

			// STEP 2
			cy.log('STEP 2- P1 tries to play a six');
			cy.playOneOffOpponent(Card.SIX_OF_HEARTS);

			// STEP 3
			cy.log('STEP 3- P0 counters');

			cy.get('#counter-dialog')
				.should('be.visible')
				.get('[data-cy=counter]')
				.click();

			cy.get('#choose-two-dialog')
				.should('be.visible')
				.get('[data-counter-dialog-card=2-3]')
				.click();

			// Wait for opponent to resolve
			cy.get('#waiting-for-opponent-counter-scrim')
				.should('be.visible');
			cy.resolveOpponent();

			assertGameState(
				0,
				{
					p0Hand: [Card.JACK_OF_SPADES],
					p0Points: [],
					p0FaceCards: [Card.KING_OF_HEARTS],
					p1Hand: [Card.QUEEN_OF_HEARTS, Card.QUEEN_OF_DIAMONDS],
					p1Points: [Card.TEN_OF_HEARTS],
					p1FaceCards: [],
					scrap: [Card.NINE_OF_SPADES, Card.SIX_OF_HEARTS, Card.TWO_OF_SPADES],
				}
			);

			// Step 4
			cy.log('STEP 4- P0 Jacks P1\'s 10');
			cy.get('[data-player-hand-card=11-3]').click(); // Jack of spades
			cy.get('[data-move-choice=jack]').click();
			cy.get('#player-hand-targeting')
				.should('be.visible');
			cy.get('[data-opponent-point-card=10-2]').click(); // Ten of hearts

			// STEP 4
			cy.log('STEP 5- P1 plays their previously bounced Queen');
			cy.playFaceCardOpponent(Card.QUEEN_OF_DIAMONDS);

			assertGameState(
				0,
				{
					p0Hand: [],
					p0Points: [Card.TEN_OF_HEARTS],
					p0FaceCards: [Card.KING_OF_HEARTS],
					p1Hand: [Card.QUEEN_OF_HEARTS],
					p1Points: [],
					p1FaceCards: [Card.QUEEN_OF_DIAMONDS],
					scrap: [Card.NINE_OF_SPADES, Card.SIX_OF_HEARTS, Card.TWO_OF_SPADES],
				}
			);



		})
	}); // End Player playing 9s describe

	describe('Opponent Playing NINES', () => {
		beforeEach(() => {
			setupGameAsP1();
		});

		it('Opponent plays a NINE on a jack to steal back point card', () => {
			cy.loadGameFixture({
				p0Hand: [Card.ACE_OF_SPADES, Card.NINE_OF_CLUBS, Card.ACE_OF_DIAMONDS],
				p0Points: [Card.TEN_OF_SPADES],
				p0FaceCards: [],
				p1Hand: [Card.JACK_OF_CLUBS, Card.TEN_OF_DIAMONDS],
				p1Points: [],
				p1FaceCards: [],
				topCard: Card.TEN_OF_CLUBS
			});
			cy.get('[data-player-hand-card]').should('have.length', 2);
			cy.log('Loaded fixture');

			// opponent plays Ace of Spades
			cy.playPointsOpponent(Card.ACE_OF_SPADES);

			// player plays jack
			cy.get('[data-player-hand-card=11-0]').click();
			cy.get('[data-move-choice=jack]').click();
			cy.get('#player-hand-targeting')
				.should('be.visible');
			cy.get('[data-opponent-point-card=1-3]').click();

			assertGameState(1, {
				p0Hand: [Card.NINE_OF_CLUBS, Card.ACE_OF_DIAMONDS],
				p0Points: [Card.TEN_OF_SPADES],
				p0FaceCards: [],
				p1Hand: [Card.TEN_OF_DIAMONDS],
				p1Points: [Card.ACE_OF_SPADES],
				p1FaceCards: []
			});

			cy.playTargetedOneOffOpponent(Card.NINE_OF_CLUBS, Card.JACK_OF_CLUBS, 'jack')

			// Player resolves
			cy.get('#cannot-counter-dialog')
				.should('be.visible')
				.get('[data-cy=cannot-counter-resolve]')
				.click();

			assertGameState(1, {
				p0Hand: [Card.ACE_OF_DIAMONDS],
				p0Points: [Card.TEN_OF_SPADES, Card.ACE_OF_SPADES],
				p0FaceCards: [],
				p1Hand: [Card.JACK_OF_CLUBS, Card.TEN_OF_DIAMONDS],
				p1Points: [],
				p1FaceCards: [],
				scrap: [Card.NINE_OF_CLUBS]
			});

			// Player attempts plays the returned jack immediately
			cy.get('[data-player-hand-card=11-0]').click();
			cy.get('[data-move-choice=jack]').click();
			cy.get('#player-hand-targeting')
				.should('be.visible');
			cy.get('[data-opponent-point-card=1-3]').click();
			assertSnackbarError(SnackBarError.FROZEN_CARD);
			cy.log('Correctly prevented player from re-playing frozen jack next turn');

			cy.get('[data-player-hand-card=10-1]').click();
			cy.get('[data-move-choice=points]').click();

			assertGameState(1, {
				p0Hand: [Card.ACE_OF_DIAMONDS],
				p0Points: [Card.TEN_OF_SPADES, Card.ACE_OF_SPADES],
				p0FaceCards: [],
				p1Hand: [Card.JACK_OF_CLUBS],
				p1Points: [Card.TEN_OF_DIAMONDS],
				p1FaceCards: [],
				scrap: [Card.NINE_OF_CLUBS]
			});	

			cy.playPointsOpponent(Card.ACE_OF_DIAMONDS)
			cy.get('[data-player-hand-card]').should('have.length', 1);

			// Player plays jack after one turn
			cy.get('[data-player-hand-card=11-0]').click();
			cy.get('[data-move-choice=jack]').click();
			cy.get('#player-hand-targeting')
				.should('be.visible');
			cy.get('[data-opponent-point-card=1-1]').click();

			assertGameState(1, {
				p0Hand: [],
				p0Points: [Card.TEN_OF_SPADES, Card.ACE_OF_SPADES],
				p0FaceCards: [],
				p1Hand: [],
				p1Points: [Card.ACE_OF_DIAMONDS, Card.TEN_OF_DIAMONDS],
				p1FaceCards: [],
				scrap: [Card.NINE_OF_CLUBS]
			});
		}); // End 9 on jack
	}) // End Opponent playing NINES describe
})


describe('Playing THREEs', () => {
	beforeEach(() => {
		setupGameAsP0();
	});

	it('Plays 3s with no cards in scrap', () => {
		// Set Up
		cy.loadGameFixture({
			p0Hand: [Card.ACE_OF_SPADES, Card.THREE_OF_CLUBS],
			p0Points: [Card.TEN_OF_SPADES],
			p0FaceCards: [],
			p1Hand: [Card.ACE_OF_HEARTS, Card.TEN_OF_DIAMONDS],
			p1Points: [Card.TEN_OF_HEARTS],
			p1FaceCards: [Card.KING_OF_HEARTS],
		});
		cy.get('[data-player-hand-card]').should('have.length', 2);

		// Player plays three
		cy.get('[data-player-hand-card=3-0]').click(); // three of clubs
		cy.get('[data-move-choice=oneOff]').click();
		assertSnackbarError('You can only play a 3 as a one-off, if there are cards in the scrap pile');
	});

	it('Plays 3s successfully', () => {
		const scrap = [
			Card.ACE_OF_SPADES,
			Card.TEN_OF_HEARTS,
			Card.TEN_OF_SPADES,
			Card.FOUR_OF_CLUBS
		];

		// Set Up
		cy.loadGameFixture({
			p0Hand: [Card.THREE_OF_CLUBS],
			p0Points: [],
			p0FaceCards: [],
			p1Hand: [Card.TEN_OF_DIAMONDS],
			p1Points: [Card.ACE_OF_HEARTS],
			p1FaceCards: [Card.KING_OF_HEARTS],
			scrap,
		});
		cy.get('[data-player-hand-card]').should('have.length', 1);

		// Player plays three
		cy.get('[data-player-hand-card=3-0]').click(); // three of clubs
		cy.get('[data-move-choice=oneOff]').click();

		cy.get('#waiting-for-opponent-counter-scrim')
			.should('be.visible');
		
		cy.resolveOpponent();

		cy.get('#waiting-for-opponent-counter-scrim')
			.should('not.be.visible');

		cy.get('#three-dialog').should('be.visible');
		// resolve button should be disabled
		cy.get('[data-cy=three-resolve').should('be.disabled');

		// Confirm able to sort scrap by rank
		cy.get('[data-cy=three-dialog-sort-dropdown]').click({force: true});
		cy.contains('By Rank').click();
		const mapElementsToRank = (elements => {
			return _.map(elements, (element) => {
				return Number(element.attributes['data-three-dialog-card'].value.split('-')[0]);
			});
		});
		cy.get('[data-three-dialog-card]')
			.then(mapElementsToRank)
			.then((elementRanks) => {
				const sortedScrapRanksFromFixture = _.sortBy(scrap, 'rank').map((card => card.rank));
				expect(elementRanks).to.deep.equal(sortedScrapRanksFromFixture);
			});

		// Player selects a card from scrap
		cy.get('[data-three-dialog-card=10-2]').click();
		cy.get('[data-cy=three-resolve').should('not.be.disabled').click();

		assertGameState(
			0,
			{
				p0Hand: [Card.TEN_OF_HEARTS],
				p0Points: [],
				p0FaceCards: [],
				p1Hand: [Card.TEN_OF_DIAMONDS],
				p1Points: [Card.ACE_OF_HEARTS],
				p1FaceCards: [Card.KING_OF_HEARTS],
				scrap: [Card.ACE_OF_SPADES, Card.THREE_OF_CLUBS, Card.TEN_OF_SPADES, Card.FOUR_OF_CLUBS],
			}
		);

		// Player attempts to play out of turn
		cy.get('[data-player-hand-card=10-2]').click(); // ten of hearts
		playOutOfTurn('points');

		cy.playPointsOpponent(Card.TEN_OF_DIAMONDS);

		assertGameState(
			0,
			{
				p0Hand: [Card.TEN_OF_HEARTS],
				p0Points: [],
				p0FaceCards: [],
				p1Hand: [],
				p1Points: [Card.ACE_OF_HEARTS, Card.TEN_OF_DIAMONDS],
				p1FaceCards: [Card.KING_OF_HEARTS],
				scrap: [
					Card.ACE_OF_SPADES,
					Card.THREE_OF_CLUBS,
					Card.TEN_OF_SPADES,
					Card.FOUR_OF_CLUBS
				],
			}
		);
	});

	it('Opponent plays 3s successfully', () => {
		// Set Up
		cy.loadGameFixture({
			p0Hand: [Card.ACE_OF_SPADES],
			p0Points: [Card.TEN_OF_SPADES],
			p0FaceCards: [],
			p1Hand: [Card.ACE_OF_HEARTS, Card.TEN_OF_DIAMONDS, Card.THREE_OF_CLUBS],
			p1Points: [Card.TEN_OF_HEARTS],
			p1FaceCards: [Card.KING_OF_HEARTS],
		});
		cy.get('[data-player-hand-card]').should('have.length', 1);

		// put some cards into scrap
		cy.get('[data-player-hand-card=1-3]').click() // ace of space
		cy.get('[data-move-choice=oneOff]').click();

		cy.get('#waiting-for-opponent-counter-scrim')
			.should('be.visible');

		cy.resolveOpponent();

		assertGameState(
			0,
			{
				p0Hand: [],
				p0Points: [],
				p0FaceCards: [],
				p1Hand: [Card.ACE_OF_HEARTS, Card.TEN_OF_DIAMONDS, Card.THREE_OF_CLUBS],
				p1Points: [],
				p1FaceCards: [Card.KING_OF_HEARTS],
				scrap: [Card.ACE_OF_SPADES, Card.TEN_OF_HEARTS, Card.TEN_OF_SPADES],
			}
		);

		// opponent plays 3
		cy.playOneOffOpponent(Card.THREE_OF_CLUBS);

		// player resolves
		cy.get('[data-cy=cannot-counter-resolve]')
			.should('be.visible')
			.click();

		cy.get('#waiting-for-opponent-resolve-three-scrim')
			.should('be.visible');
		// waiting for opponent to choose from scrap scrim
		cy.resolveThreeOpponent(Card.ACE_OF_SPADES);

		cy.get('#waiting-for-opponent-resolve-three-scrim')
			.should('not.be.visible');

		assertGameState(
			0,
			{
				p0Hand: [],
				p0Points: [],
				p0FaceCards: [],
				p1Hand: [Card.ACE_OF_HEARTS, Card.TEN_OF_DIAMONDS, Card.ACE_OF_SPADES],
				p1Points: [],
				p1FaceCards: [Card.KING_OF_HEARTS],
				scrap: [Card.TEN_OF_HEARTS, Card.TEN_OF_SPADES, Card.THREE_OF_CLUBS],
			}
		);
	});
}); // End 3s description

describe('ONE-OFF Target should be removed after one-off resolves', () => {
	beforeEach(() => {
		setupGameAsP1();
	});

	it('ONE-OFF Target should be removed after one-off resolves - target is POINTS', () => {
		cy.loadGameFixture({
			// Opponent is p0
			p0Hand: [Card.NINE_OF_SPADES, Card.NINE_OF_HEARTS, Card.FIVE_OF_CLUBS],
			p0Points: [Card.TEN_OF_HEARTS],
			p0FaceCards: [],
			//player is p1
			p1Hand: [Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS],
			p1Points: [Card.ACE_OF_DIAMONDS],
			p1FaceCards: [],
		});
		cy.get('[data-player-hand-card]').should('have.length', 2);
		cy.log('Loaded fixture');

		// Opponent plays NINE
		cy.playTargetedOneOffOpponent(Card.NINE_OF_SPADES, Card.ACE_OF_DIAMONDS, 'point');
		
		// Player resolves
		cy.get('#cannot-counter-dialog')
			.should('be.visible')
			.get('[data-cy=cannot-counter-resolve]')
			.click();

		assertGameState(
			1,
			{
				p0Hand: [Card.NINE_OF_HEARTS, Card.FIVE_OF_CLUBS],
				p0Points: [Card.TEN_OF_HEARTS],
				p0FaceCards: [],
				p1Hand: [Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS, Card.ACE_OF_DIAMONDS],
				p1Points: [],
				p1FaceCards: [],
				scrap: [Card.NINE_OF_SPADES],
			}
		);

		// Player plays another point
		cy.get('[data-player-hand-card=6-2]').click();
		cy.get('[data-move-choice=points]').click();

		// Opponent plays UN-TARGETED ONE-OFF
		cy.playOneOffOpponent(Card.FIVE_OF_CLUBS);

		// Cannot counter dialog should not have a target
		cy.get('#cannot-counter-dialog')
			.should('be.visible')
			.should('not.contain', 'targeting')
			.get('[data-cy=cannot-counter-resolve]')
			.click();
	});

	it('ONE-OFF Target should be removed after one-off resolves - target is FACE CARD', () => {
		cy.loadGameFixture({
			// Opponent is p0
			p0Hand: [Card.NINE_OF_SPADES, Card.NINE_OF_HEARTS, Card.FIVE_OF_CLUBS],
			p0Points: [Card.TEN_OF_HEARTS],
			p0FaceCards: [],
			//player is p1
			p1Hand: [Card.SIX_OF_HEARTS],
			p1Points: [Card.ACE_OF_DIAMONDS],
			p1FaceCards: [Card.QUEEN_OF_HEARTS],
		});
		cy.get('[data-player-hand-card]').should('have.length', 1);
		cy.log('Loaded fixture');

		// Opponent plays NINE
		cy.playTargetedOneOffOpponent(Card.NINE_OF_SPADES, Card.QUEEN_OF_HEARTS, 'faceCard');

		// Player resolves
		cy.get('#cannot-counter-dialog')
			.should('be.visible')
			.should('contain', 'targeting')
			.get('[data-cy=cannot-counter-resolve]')
			.click();

		assertGameState(
			1,
			{
				p0Hand: [Card.NINE_OF_HEARTS, Card.FIVE_OF_CLUBS],
				p0Points: [Card.TEN_OF_HEARTS],
				p0FaceCards: [],
				p1Hand: [Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS],
				p1Points: [Card.ACE_OF_DIAMONDS],
				p1FaceCards: [],
				scrap: [Card.NINE_OF_SPADES],
			}
		);

		// Player plays another point
		cy.get('[data-player-hand-card=6-2]').click();
		cy.get('[data-move-choice=points]').click();

		// Opponent plays UN-TARGETED ONE-OFF
		cy.playOneOffOpponent(Card.FIVE_OF_CLUBS);

		// Cannot counter dialog should not have a target
		cy.get('#cannot-counter-dialog')
			.should('be.visible')
			.should('not.contain', 'targeting')
			.get('[data-cy=cannot-counter-resolve]')
			.click();
	});


	it('ONE-OFF Target should be removed after one-off resolves - target is JACK', () => {
		cy.loadGameFixture({
			// Opponent is p0
			p0Hand: [Card.TWO_OF_SPADES, Card.FIVE_OF_CLUBS, Card.TEN_OF_HEARTS],
			p0Points: [],
			p0FaceCards: [],
			//player is p1
			p1Hand: [Card.SIX_OF_HEARTS, Card.JACK_OF_CLUBS],
			p1Points: [Card.ACE_OF_DIAMONDS],
			p1FaceCards: [],
		});
		cy.get('[data-player-hand-card]').should('have.length', 2);
		cy.log('Loaded fixture');

		// Opponent plays POINT
		cy.playPointsOpponent(Card.TEN_OF_HEARTS);

		// Play plays JACK
		cy.get('[data-player-hand-card=11-0]').click();
		cy.get('[data-move-choice=jack]').click();
		cy.get('#player-hand-targeting')
			.should('be.visible');
		cy.get('[data-opponent-point-card=10-2]').click();

		assertGameState(
			1,
			{
				p0Hand: [Card.TWO_OF_SPADES, Card.FIVE_OF_CLUBS],
				p0Points: [],
				p0FaceCards: [],
				p1Hand: [Card.SIX_OF_HEARTS],
				p1Points: [Card.ACE_OF_DIAMONDS, Card.TEN_OF_HEARTS],
				p1FaceCards: [],
				scrap: [],
			}
		);	

		// Opponent plays TWO
		cy.playTargetedOneOffOpponent(Card.TWO_OF_SPADES, Card.JACK_OF_CLUBS, 'jack');

		// Player resolves
		cy.get('#cannot-counter-dialog')
			.should('be.visible')
			.should('contain', 'targeting')
			.get('[data-cy=cannot-counter-resolve]')
			.click();

		assertGameState(
			1,
			{
				p0Hand: [Card.FIVE_OF_CLUBS],
				p0Points: [Card.TEN_OF_HEARTS],
				p0FaceCards: [],
				p1Hand: [Card.SIX_OF_HEARTS],
				p1Points: [Card.ACE_OF_DIAMONDS],
				p1FaceCards: [],
				scrap: [Card.TWO_OF_SPADES, Card.JACK_OF_CLUBS],
			}
		);

		// Player plays another point
		cy.get('[data-player-hand-card=6-2]').click();
		cy.get('[data-move-choice=points]').click();

		// Opponent plays UN-TARGETED ONE-OFF
		cy.playOneOffOpponent(Card.FIVE_OF_CLUBS);

		// Cannot counter dialog should not have a target
		cy.get('#cannot-counter-dialog')
			.should('be.visible')
			.should('not.contain', 'targeting')
			.get('[data-cy=cannot-counter-resolve]')
			.click();
	});

	it('ONE-OFF Target should be removed after one-off is COUNTERED - target is POINTS', () => {
		cy.loadGameFixture({
			// Opponent is p0
			p0Hand: [Card.NINE_OF_SPADES, Card.NINE_OF_HEARTS, Card.FIVE_OF_CLUBS],
			p0Points: [Card.TEN_OF_HEARTS],
			p0FaceCards: [],
			//player is p1
			p1Hand: [Card.SIX_OF_HEARTS, Card.TWO_OF_CLUBS],
			p1Points: [Card.ACE_OF_DIAMONDS],
			p1FaceCards: [],
		});
		cy.get('[data-player-hand-card]').should('have.length', 2);
		cy.log('Loaded fixture');

		// Opponent plays NINE
		cy.playTargetedOneOffOpponent(Card.NINE_OF_SPADES, Card.ACE_OF_DIAMONDS, 'point');
		
		// Player counters
		cy.get('#counter-dialog')
			.should('be.visible')
			.get('[data-cy=counter]')
			.click();

		cy.get('#choose-two-dialog')
			.should('be.visible')
			.get('[data-counter-dialog-card=2-0]')
			.click();

		cy.resolveOpponent();
		assertGameState(
			1,
			{
				// Opponent is p0
				p0Hand: [Card.NINE_OF_HEARTS, Card.FIVE_OF_CLUBS],
				p0Points: [Card.TEN_OF_HEARTS],
				p0FaceCards: [],
				//player is p1
				p1Hand: [Card.SIX_OF_HEARTS],
				p1Points: [Card.ACE_OF_DIAMONDS],
				p1FaceCards: [],
				scrap: [Card.NINE_OF_SPADES, Card.TWO_OF_CLUBS],
			}
		);

		// Player plays another point
		cy.get('[data-player-hand-card=6-2]').click();
		cy.get('[data-move-choice=points]').click();

		// Opponent plays UN-TARGETED ONE-OFF
		cy.playOneOffOpponent(Card.FIVE_OF_CLUBS);

		// Cannot counter dialog should not have a target
		cy.get('#cannot-counter-dialog')
			.should('be.visible')
			.should('not.contain', 'targeting')
			.get('[data-cy=cannot-counter-resolve]')
			.click();
	});
});
