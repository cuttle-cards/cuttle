import { assertGameState, playOutOfTurn } from '../../../support/helpers';
import { Card } from '../../../fixtures/cards';

describe('FIVES', () => {
  describe('Playing FIVES', () => {
    beforeEach(() => {
      cy.setupGameAsP0();
    });

    it.only('Plays a five to draw two cards', () => {
      // Setup
      cy.loadGameFixture(0, {
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
      // // Player plays five
      // cy.playOneOffAndResolveAsPlayer(Card.FIVE_OF_SPADES);

      // // Assert game state
      // assertGameState(0, {
      //   // Player is P0
      //   p0Hand: [Card.ACE_OF_CLUBS, Card.FIVE_OF_HEARTS, Card.THREE_OF_CLUBS, Card.EIGHT_OF_HEARTS],
      //   p0Points: [Card.TEN_OF_SPADES, Card.ACE_OF_SPADES],
      //   p0FaceCards: [Card.KING_OF_SPADES],
      //   // Opponent is P1
      //   p1Hand: [Card.ACE_OF_HEARTS],
      //   p1Points: [Card.TEN_OF_HEARTS, Card.ACE_OF_DIAMONDS],
      //   p1FaceCards: [Card.KING_OF_HEARTS],
      //   scrap: [Card.FIVE_OF_SPADES],
      // });
      // // Attempt to plays five out of turn
      // cy.get('[data-player-hand-card=5-2]').click(); // five of hearts
      // playOutOfTurn('oneOff');
    }); // End five one-off

    it('Plays a 5 to draw the last two cards in the deck', () => {
      // Setup: player has one card in hand and only top & second card are in deck
      cy.loadGameFixture(0, {
        // Player is P0
        p0Hand: [Card.FIVE_OF_CLUBS],
        p0Points: [],
        p0FaceCards: [],
        // Opponent is P1
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
        // Deck
        topCard: Card.THREE_OF_CLUBS,
        secondCard: Card.EIGHT_OF_HEARTS,
        deck: [],
      });
      cy.get('#deck').should('contain', '(2)');

      // Player plays and resolves a 5
      cy.playOneOffAndResolveAsPlayer(Card.FIVE_OF_CLUBS);
      assertGameState(0, {
        // Player is P0
        p0Hand: [Card.THREE_OF_CLUBS, Card.EIGHT_OF_HEARTS],
        p0Points: [],
        p0FaceCards: [],
        // Opponent is P1
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
        scrap: [Card.FIVE_OF_CLUBS],
      });
      // Deck should now be empty
      cy.get('#deck').should('contain', '(0)').should('contain', 'PASS');
    });

    it('Plays a 5 to draw two cards when there are 3 cards in deck', () => {
      // Setup: there are three cards in the deck and player has a 5
      cy.loadGameFixture(0, {
        p0Hand: [Card.FIVE_OF_CLUBS],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [Card.TWO_OF_CLUBS],
        p1Points: [],
        p1FaceCards: [],
        topCard: Card.THREE_OF_CLUBS,
        secondCard: Card.EIGHT_OF_HEARTS,
        deck: [Card.ACE_OF_DIAMONDS],
      });
      cy.get('#deck').should('contain', '(3)');

      // Play 5 and resolve
      cy.playOneOffAndResolveAsPlayer(Card.FIVE_OF_CLUBS);
      assertGameState(0, {
        p0Hand: [Card.THREE_OF_CLUBS, Card.EIGHT_OF_HEARTS],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [Card.TWO_OF_CLUBS],
        p1Points: [],
        p1FaceCards: [],
        scrap: [Card.FIVE_OF_CLUBS],
        topCard: Card.ACE_OF_DIAMONDS,
      });
      cy.get('#deck').should('contain', '(1)');
    });

    it('Plays a 5 to draw two cards when there are 4 cards in deck', () => {
      // Setup: there are three cards in the deck and player has a 5
      cy.loadGameFixture(0, {
        p0Hand: [Card.FIVE_OF_CLUBS],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [Card.TWO_OF_CLUBS],
        p1Points: [],
        p1FaceCards: [],
        topCard: Card.THREE_OF_CLUBS,
        secondCard: Card.EIGHT_OF_HEARTS,
        deck: [Card.FOUR_OF_DIAMONDS, Card.SIX_OF_SPADES],
      });
      cy.get('#deck').should('contain', '(4)');

      // Play 5 and resolve
      cy.playOneOffAndResolveAsPlayer(Card.FIVE_OF_CLUBS);
      assertGameState(0, {
        p0Hand: [Card.THREE_OF_CLUBS, Card.EIGHT_OF_HEARTS],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [Card.TWO_OF_CLUBS],
        p1Points: [],
        p1FaceCards: [],
        scrap: [Card.FIVE_OF_CLUBS],
      });
      cy.get('#deck').should('contain', '(2)');
    });
  });

  describe('Playing FIVES at the hand limit', () => {
    beforeEach(() => {
      cy.setupGameAsP0();
    });

    it('Plays a five to draw one card when at 8 cards in hand', () => {
      // Setup
      cy.loadGameFixture(0, {
        // Player is P0
        p0Hand: [
          Card.ACE_OF_CLUBS,
          Card.FIVE_OF_SPADES,
          Card.FIVE_OF_HEARTS,
          Card.SIX_OF_CLUBS,
          Card.EIGHT_OF_CLUBS,
          Card.NINE_OF_CLUBS,
          Card.JACK_OF_DIAMONDS,
          Card.QUEEN_OF_CLUBS,
        ],
        p0Points: [],
        p0FaceCards: [],
        // Opponent is P1
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
        // Deck
        topCard: Card.KING_OF_CLUBS,
        secondCard: Card.KING_OF_SPADES,
      });
      // Player plays five
      cy.playOneOffAndResolveAsPlayer(Card.FIVE_OF_SPADES);

      // Assert game state
      assertGameState(0, {
        p0Hand: [
          Card.ACE_OF_CLUBS,
          Card.FIVE_OF_HEARTS,
          Card.SIX_OF_CLUBS,
          Card.EIGHT_OF_CLUBS,
          Card.NINE_OF_CLUBS,
          Card.JACK_OF_DIAMONDS,
          Card.QUEEN_OF_CLUBS,
          Card.KING_OF_CLUBS,
        ],
        p0Points: [],
        p0FaceCards: [],
        // Opponent is P1
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
        scrap: [Card.FIVE_OF_SPADES],
      });

      cy.get('#deck').should('contain', '(43)');
    });

    it('Plays a five to draw draw the last card in the deck when at the hand limit', () => {
      // Setup
      cy.loadGameFixture(0, {
        // Player is P0
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [],
        // Opponent is P1
        p1Hand: [
          Card.ACE_OF_CLUBS,
          Card.FIVE_OF_SPADES,
          Card.FIVE_OF_HEARTS,
          Card.SIX_OF_CLUBS,
          Card.EIGHT_OF_CLUBS,
          Card.NINE_OF_CLUBS,
          Card.JACK_OF_DIAMONDS,
          Card.QUEEN_OF_CLUBS,
        ],
        p1Points: [],
        p1FaceCards: [],
        // Deck
        topCard: Card.KING_OF_CLUBS,
        secondCard: Card.KING_OF_SPADES,
        deck: [],
      });
      // Player draws
      cy.get('#deck').click();

      // Assert game state
      assertGameState(0, {
        // Player is P0
        p0Hand: [Card.KING_OF_CLUBS],
        p0Points: [],
        p0FaceCards: [],
        // Opponent is P1
        p1Hand: [
          Card.ACE_OF_CLUBS,
          Card.FIVE_OF_SPADES,
          Card.FIVE_OF_HEARTS,
          Card.SIX_OF_CLUBS,
          Card.EIGHT_OF_CLUBS,
          Card.NINE_OF_CLUBS,
          Card.JACK_OF_DIAMONDS,
          Card.QUEEN_OF_CLUBS,
        ],
        p1Points: [],
        p1FaceCards: [],
        // Deck
        topCard: Card.KING_OF_SPADES,
      });
      cy.get('#deck').should('contain', '(1)');

      // Opponent plays 5 to draw last card
      cy.playOneOffOpponent(Card.FIVE_OF_SPADES);
      cy.get('#cannot-counter-dialog').should('be.visible').get('[data-cy=cannot-counter-resolve]').click();

      assertGameState(0, {
        // Player is P0
        p0Hand: [Card.KING_OF_CLUBS],
        p0Points: [],
        p0FaceCards: [],
        // Opponent is P1
        p1Hand: [
          Card.ACE_OF_CLUBS,
          Card.KING_OF_SPADES,
          Card.FIVE_OF_HEARTS,
          Card.SIX_OF_CLUBS,
          Card.EIGHT_OF_CLUBS,
          Card.NINE_OF_CLUBS,
          Card.JACK_OF_DIAMONDS,
          Card.QUEEN_OF_CLUBS,
        ],
        p1Points: [],
        p1FaceCards: [],
      });

      cy.get('#deck').should('contain', '(0)').should('contain', 'PASS');
    });
  });
});
