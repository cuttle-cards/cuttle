import { assertGameState, assertSnackbar } from '../../../support/helpers';
import { Card } from '../../../fixtures/cards';
import { SnackBarError } from '../../../fixtures/snackbarError';

describe('FOURS', () => {
  describe('Playing FOURS', () => {
    beforeEach(() => {
      cy.setupGameAsP0();
    });

    it('Plays a 4 to make opponent discard two cards of their choice', () => {
      // Set Up
      cy.loadGameFixture(0, {
        p0Hand: [ Card.FOUR_OF_SPADES, Card.FOUR_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS, Card.TEN_OF_HEARTS ],
        p1Points: [],
        p1FaceCards: [],
      });

      cy.playOneOffAndResolveAsPlayer(Card.FOUR_OF_SPADES);
      // Opponent chooses two cards to discard
      cy.discardOpponent(Card.ACE_OF_HEARTS, Card.TEN_OF_HEARTS);
      cy.get('#waiting-for-opponent-discard-scrim').should('not.exist');

      assertGameState(0, {
        p0Hand: [ Card.FOUR_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.ACE_OF_DIAMONDS ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.FOUR_OF_SPADES, Card.ACE_OF_HEARTS, Card.TEN_OF_HEARTS ],
      });
    });

    it('Plays a 4 to make opponent discard their only two cards', () => {
      // Set Up
      cy.loadGameFixture(0, {
        p0Hand: [ Card.FOUR_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS ],
        p1Points: [],
        p1FaceCards: [],
      });

      cy.playOneOffAndResolveAsPlayer(Card.FOUR_OF_CLUBS);

      cy.get('#waiting-for-opponent-discard-scrim').should('be.visible');
      // Opponent chooses two cards to discard
      cy.log('Opponent discards both their remaining cards');
      cy.discardOpponent(Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS);
      cy.get('#waiting-for-opponent-discard-scrim').should('not.exist');

      assertGameState(0, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.FOUR_OF_CLUBS, Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS ],
      });
    });

    it('Plays a 4 to make opponent discard the last card in their hand', () => {
      // Set Up
      cy.loadGameFixture(0, {
        p0Hand: [ Card.FOUR_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.ACE_OF_HEARTS ],
        p1Points: [],
        p1FaceCards: [],
      });

      // Play the four of clubs
      cy.playOneOffAndResolveAsPlayer(Card.FOUR_OF_CLUBS);
      cy.get('#waiting-for-opponent-discard-scrim').should('be.visible');
      // Opponent chooses two cards to discard
      cy.log('Opponent discards both their remaining cards');
      cy.discardOpponent(Card.ACE_OF_HEARTS);
      cy.get('#waiting-for-opponent-discard-scrim').should('not.exist');

      assertGameState(0, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.FOUR_OF_CLUBS, Card.ACE_OF_HEARTS ],
      });
    });

    it('Prevents playing a 4 when opponent has no cards in hand', () => {
      // Set Up
      cy.loadGameFixture(0, {
        p0Hand: [ Card.FOUR_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
      });

      // Play the four of spades
      cy.log('Attempting to playing Four of clubs as one off');
      cy.get('[data-player-hand-card=4-0]').click(); // four of clubs
      cy.get('[data-move-choice=oneOff]').click();

      assertSnackbar(SnackBarError.ONE_OFF.FOUR_EMPTY_HAND);

      assertGameState(0, {
        p0Hand: [ Card.FOUR_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
      });
    });

    it('Prevents opponent from discarding illegally', () => {
      // Set Up
      cy.loadGameFixture(0, {
        p0Hand: [ Card.FOUR_OF_SPADES, Card.FOUR_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS, Card.TEN_OF_HEARTS ],
        p1Points: [],
        p1FaceCards: [],
      });

      cy.playOneOffAndResolveAsPlayer(Card.FOUR_OF_SPADES);
      cy.get('#waiting-for-opponent-discard-scrim').should('be.visible');

      // Illegal Discard 1: Only 1 card selected
      cy.log('Opponent illegally discards: No cards selected');
      cy.discardOpponent(); // Discard with no selection
      cy.get('#waiting-for-opponent-discard-scrim').should('be.visible');
      assertGameState(0, {
        p0Hand: [ Card.FOUR_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS, Card.TEN_OF_HEARTS ],
        p1Points: [],
        p1FaceCards: [],
      });
      cy.log('Successfully prevented discarding with no cards selected');

      // Illegal Discard 2: Only 1 card selected
      cy.log('Opponent illegally discards: Chooses only 1 card');
      cy.discardOpponent(Card.ACE_OF_HEARTS); // Only 1 card selected (should have 2)
      cy.get('#waiting-for-opponent-discard-scrim').should('be.visible');
      assertGameState(0, {
        p0Hand: [ Card.FOUR_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS, Card.TEN_OF_HEARTS ],
        p1Points: [],
        p1FaceCards: [],
      });
      cy.log('Successfully prevented discarding only 1 card');

      // Illegal Discard 3: Card not in hand
      cy.log('Opponent illegally discards: Chooses a card not in their hand');
      cy.discardOpponent(Card.ACE_OF_HEARTS, Card.TEN_OF_SPADES); // Ten of spades not in hand
      cy.get('#waiting-for-opponent-discard-scrim').should('be.visible');
      assertGameState(0, {
        p0Hand: [ Card.FOUR_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS, Card.TEN_OF_HEARTS ],
        p1Points: [],
        p1FaceCards: [],
      });
      cy.log('Successfully prevented discarding a card not in hand');

      // Legal Discard
      cy.discardOpponent(Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS);
      cy.get('#waiting-for-opponent-discard-scrim').should('not.be.exist');
      assertGameState(0, {
        p0Hand: [ Card.FOUR_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.TEN_OF_HEARTS ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.FOUR_OF_SPADES, Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS ],
      });
    });
  });

  describe('Opponent playing FOURS', () => {
    beforeEach(() => {
      cy.setupGameAsP1();
    });

    it('Discards two cards when opponent plays a four, repeated fours', () => {
      cy.loadGameFixture(1, {
        p0Hand: [ Card.FOUR_OF_CLUBS, Card.FOUR_OF_DIAMONDS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.FOUR_OF_SPADES, Card.ACE_OF_DIAMONDS, Card.TEN_OF_HEARTS ],
        p1Points: [],
        p1FaceCards: [],
        topCard: Card.SIX_OF_DIAMONDS,
      });

      // Opponent plays four
      cy.playOneOffOpponent(Card.FOUR_OF_CLUBS);
      // Player cannot counter
      cy.get('#cannot-counter-dialog').should('be.visible')
        .get('[data-cy=cannot-counter-resolve]')
        .click();
      cy.log("Player resolves opponent's Four");

      // Four Dialog appears (you must discard)
      cy.get('#four-discard-dialog').should('be.visible');
      // Choosing cards to discard
      cy.log('Choosing two cards to discard');
      cy.get('[data-cy=submit-four-dialog]').should('be.disabled'); // can't prematurely submit
      cy.get('[data-discard-card=1-1]').click(); // ace of diamonds
      cy.get('[data-cy=submit-four-dialog]').should('be.disabled'); // can't prematurely submit
      cy.get('[data-discard-card=4-3]').click(); // four of spades
      cy.get('[data-cy=submit-four-dialog]').click(); // submit choice to discard

      assertGameState(1, {
        p0Hand: [ Card.FOUR_OF_DIAMONDS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.TEN_OF_HEARTS ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.FOUR_OF_CLUBS, Card.FOUR_OF_SPADES, Card.ACE_OF_DIAMONDS ],
        topCard: Card.SIX_OF_DIAMONDS,
      });

      // Player draws the 6 of diamonds
      cy.get('#deck').click();

      // Opponent plays 2nd four
      cy.playOneOffOpponent(Card.FOUR_OF_DIAMONDS);
      // Player cannot counter
      cy.get('#cannot-counter-dialog').should('be.visible')
        .get('[data-cy=cannot-counter-resolve]')
        .click();

      // Choosing cards to discard
      cy.log('Choosing two cards to discard');
      cy.get('[data-cy=submit-four-dialog]').should('be.disabled'); // can't prematurely submit
      // Discard dialog should still be open
      cy.get('#four-discard-dialog').should('be.visible');
      // Validate game state same as above
      assertGameState(1, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.TEN_OF_HEARTS, Card.SIX_OF_DIAMONDS ],
        p1Points: [],
        p1FaceCards: [],
      });
      // Properly discard as expected
      cy.log('Choosing two cards to discard - second time');
      cy.get('[data-discard-card=10-2]').click(); // 10 of hearts
      cy.get('[data-cy=submit-four-dialog]').should('be.disabled'); // can't prematurely submit
      cy.get('[data-discard-card=6-1]').click(); // six of diamonds
      cy.get('[data-cy=submit-four-dialog]').click(); // submit choice to discard

      assertGameState(1, {
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
          Card.FOUR_OF_DIAMONDS,
        ],
      });
    });

    it('Discards last card when FOURd with one card in hand', () => {
      cy.loadGameFixture(1, {
        p0Hand: [ Card.FOUR_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.ACE_OF_DIAMONDS ],
        p1Points: [],
        p1FaceCards: [],
      });

      // Opponent plays four
      cy.playOneOffOpponent(Card.FOUR_OF_CLUBS);
      // Player cannot counter
      cy.get('#cannot-counter-dialog').should('be.visible')
        .get('[data-cy=cannot-counter-resolve]')
        .click();

      // Four Dialog appears (you must discard)
      cy.get('#four-discard-dialog').should('be.visible');
      // Choosing cards to discard
      cy.log('Choosing (only) card to discard');
      cy.get('[data-cy=submit-four-dialog]').should('be.disabled'); // can't prematurely submit
      cy.get('[data-discard-card=1-1]').click(); // ace of diamonds
      cy.get('[data-cy=submit-four-dialog]').click();

      assertGameState(1, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.FOUR_OF_CLUBS, Card.ACE_OF_DIAMONDS ],
      });
    });
  });
});
