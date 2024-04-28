import { assertGameState, playOutOfTurn } from '../../../support/helpers';
import { Card } from '../../../fixtures/cards';

describe('FIVES', () => {
  
  describe('Playing FIVES', () => {
    beforeEach(() => {
      cy.setupGameAsP0();
    });

    it('Plays a 5 to discard 1 card, and draw 3', () => {
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
      // Player plays five
      cy.playOneOffAndResolveAsPlayer(Card.FIVE_OF_SPADES);
      cy.get('[data-cy=five-discard-dialog]').should('be.visible');
      cy.get('[data-discard-card=1-0]').click();
      cy.get('[data-cy=submit-five-dialog]').click();

      cy.get('#deck').should('contain', '(39)');
      cy.get('[data-player-hand-card]').should('have.length', 4);
      // Attempt to plays five out of turn
      cy.get('[data-player-hand-card=5-2]').click(); // five of hearts
      playOutOfTurn('oneOff');
    }); // End five one-off

    it('Plays a 5 to draw the last three cards in the deck with nothing to discard', () => {
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
        deck: [Card.SEVEN_OF_CLUBS],
      });
      cy.get('#deck').should('contain', '(3)');

      // Player plays and resolves a 5
      cy.playOneOffAndResolveAsPlayer(Card.FIVE_OF_CLUBS);
      cy.get('[data-cy=five-discard-dialog]').should('be.visible');
      cy.get('[data-cy=submit-five-dialog]').click();
      
      assertGameState(0, {
        p0Hand: [Card.THREE_OF_CLUBS, Card.EIGHT_OF_HEARTS, Card.SEVEN_OF_CLUBS],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
        scrap: [Card.FIVE_OF_CLUBS],
        topCard: null,
        secondCard: null,
        deck: []
      });
      // Deck should now be empty
      cy.get('#deck').should('contain', '(0)').should('contain', 'PASS');
      cy.get('[data-player-hand-card]').should('have.length', 3);
    });

    it('Plays a 5 with two cards left in the deck and nothing to discard', () => {
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

      cy.playOneOffAndResolveAsPlayer(Card.FIVE_OF_CLUBS);
      cy.get('[data-cy=five-discard-dialog]').should('be.visible');
      cy.get('[data-cy=submit-five-dialog]').click();

      assertGameState(0, {
        p0Hand: [Card.THREE_OF_CLUBS,Card.EIGHT_OF_HEARTS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
        scrap: [Card.FIVE_OF_CLUBS],
        topCard: null,
        secondCard: null,
        deck: []
      });

      cy.get('#deck').should('contain', '(0)').should('contain', 'PASS');
      cy.get('[data-player-hand-card]').should('have.length', 2);

    });

    it('Plays a 5 to draw two cards at max hand', () => {
      // Setup: there are three cards in the deck and player has a 5
      cy.loadGameFixture(0, {
        p0Hand: [Card.FIVE_OF_CLUBS, Card.FIVE_OF_SPADES, Card.ACE_OF_DIAMONDS,
        Card.EIGHT_OF_CLUBS, Card.TEN_OF_CLUBS, Card.TWO_OF_CLUBS, Card.THREE_OF_HEARTS, Card.FOUR_OF_HEARTS],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [Card.TWO_OF_HEARTS],
        p1Points: [],
        p1FaceCards: [],
        topCard: Card.THREE_OF_CLUBS,
        secondCard: Card.EIGHT_OF_HEARTS,
        deck: [Card.ACE_OF_DIAMONDS],
      });
      cy.get('#deck').should('contain', '(3)');

      // Play 5 and resolve
      cy.playOneOffAndResolveAsPlayer(Card.FIVE_OF_CLUBS);
      cy.get('[data-cy=five-discard-dialog]').should('be.visible');
      cy.get('[data-discard-card=5-3]').click();
      cy.get('[data-cy=submit-five-dialog]').click();
      
      assertGameState(0, {
        p0Hand: [Card.THREE_OF_CLUBS, Card.EIGHT_OF_HEARTS, Card.ACE_OF_DIAMONDS,
        Card.EIGHT_OF_CLUBS, Card.TEN_OF_CLUBS, Card.TWO_OF_CLUBS, Card.THREE_OF_HEARTS, Card.FOUR_OF_HEARTS],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [Card.TWO_OF_HEARTS],
        p1Points: [],
        p1FaceCards: [],
        scrap: [Card.FIVE_OF_CLUBS, Card.FIVE_OF_SPADES],
        topCard: Card.ACE_OF_DIAMONDS,
        secondCard: null,
        deck: []
      });
      cy.get('#deck').should('contain', '(1)');
    });

    it('Draws only 1 card when last card in deck', () => {
      cy.loadGameFixture(0, {
        // Player is P0
        p0Hand: [Card.ACE_OF_CLUBS, Card.FIVE_OF_SPADES, Card.FIVE_OF_HEARTS, Card.TWO_OF_CLUBS],
        p0Points: [],
        p0FaceCards: [],
        // Opponent is P1
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
        // Deck
        topCard: Card.THREE_OF_CLUBS,
        secondCard: Card.EIGHT_OF_HEARTS,
        deck:[]

      });
      //player plays a card
      cy.get('[data-player-hand-card=2-0]').click();
      cy.get('[data-move-choice=points]').click();
      //opponent draws, leaving 1 card left in deck
      cy.drawCardOpponent();

      cy.playOneOffAndResolveAsPlayer(Card.FIVE_OF_SPADES);
      cy.get('[data-cy=five-discard-dialog]').should('be.visible');
      cy.get('[data-discard-card=1-0]').click();
      cy.get('[data-cy=submit-five-dialog]').click();

      assertGameState(0, {
        p0Hand: [Card.FIVE_OF_HEARTS, Card.EIGHT_OF_HEARTS],
        p0Points: [Card.TWO_OF_CLUBS],
        p0FaceCards: [],
        p1Hand: [Card.THREE_OF_CLUBS],
        p1Points: [],
        p1FaceCards: [],
        scrap: [Card.FIVE_OF_SPADES, Card.ACE_OF_CLUBS],
        topCard: null,
        secondCard: null,
        deck: []
      });
    });

    it('Plays multiple 5s', () => {
      cy.loadGameFixture(0, {
        // Player is P0
        p0Hand: [Card.ACE_OF_CLUBS, Card.FIVE_OF_SPADES, Card.FIVE_OF_HEARTS, Card.TWO_OF_CLUBS],
        p0Points: [],
        p0FaceCards: [],
        // Opponent is P1
        p1Hand: [Card.FOUR_OF_CLUBS],
        p1Points: [],
        p1FaceCards: [],
      });

      cy.playOneOffAndResolveAsPlayer(Card.FIVE_OF_SPADES);
      cy.get('[data-cy=five-discard-dialog]').should('be.visible');
      cy.get('[data-cy=submit-five-dialog]').should('be.disabled').click({force: true});
      cy.get('[data-discard-card=2-0]').click();
      cy.get('[data-cy=submit-five-dialog]').click();

      cy.get('[data-player-hand-card]').should('have.length', 5);

      cy.playPointsOpponent(Card.FOUR_OF_CLUBS);
      cy.get('[data-opponent-point-card=4-0]').should('be.visible');

      cy.playOneOffAndResolveAsPlayer(Card.FIVE_OF_HEARTS);
      cy.get('[data-cy=submit-five-dialog]').should('be.disabled').click({force: true});

      cy.get('[data-discard-card=1-0]').click();
      cy.get('[data-cy=submit-five-dialog]').click();
      cy.get('[data-player-hand-card]').should('have.length', 6);
    });
  });

  describe('Playing 5 as opponent', () => {
    beforeEach(() => {
      cy.setupGameAsP1();
    });

    it('Plays 5 as opponent', () => {
      cy.loadGameFixture(1, {
        // Player is P0
        p0Hand: [Card.ACE_OF_CLUBS, Card.FIVE_OF_SPADES, Card.FIVE_OF_HEARTS, Card.TWO_OF_CLUBS],
        p0Points: [],
        p0FaceCards: [],
        // Opponent is P1
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
        // Deck
        topCard: Card.THREE_OF_CLUBS,
        secondCard: Card.EIGHT_OF_HEARTS,
        deck:[Card.SEVEN_OF_DIAMONDS]
      });
      cy.playOneOffOpponent(Card.FIVE_OF_SPADES);

      cy.get('[data-cy=cannot-counter-dialog]').should('be.visible').click();
      cy.get('[data-cy=cannot-counter-resolve]').click();
      cy.get('#waiting-for-opponent-discard-scrim').should('be.visible');
      cy.get('[data-cy=five-discard-dialog]').should('not.exist');
      cy.resolveFiveOpponent(Card.FIVE_OF_HEARTS);
      cy.get('#waiting-for-opponent-discard-scrim').should('not.exist');

      assertGameState(1, {
        p0Hand: [Card.ACE_OF_CLUBS, Card.TWO_OF_CLUBS,Card.THREE_OF_CLUBS,Card.EIGHT_OF_HEARTS, Card.SEVEN_OF_DIAMONDS],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
        scrap: [Card.FIVE_OF_SPADES, Card.FIVE_OF_HEARTS],
        topCard: null,
        secondCard: null,
        deck: []
      });

    });
  });
});
