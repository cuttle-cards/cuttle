import { assertGameState } from '../../support/helpers';
import { Card } from '../../fixtures/cards';

describe('Hand Limit — Discard to Hand Limit Phase', () => {
  describe('P0 draws at hand limit', () => {
    beforeEach(() => {
      cy.setupGameAsP0();
    });

    it('Player draws 9th card and discards one to reach hand limit', () => {
      cy.loadGameFixture(0, {
        p0Hand: [
          Card.ACE_OF_CLUBS,
          Card.TWO_OF_CLUBS,
          Card.THREE_OF_CLUBS,
          Card.FOUR_OF_CLUBS,
          Card.SIX_OF_CLUBS,
          Card.SEVEN_OF_CLUBS,
          Card.EIGHT_OF_CLUBS,
          Card.NINE_OF_CLUBS,
        ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.ACE_OF_SPADES ],
        p1Points: [],
        p1FaceCards: [],
        topCard: Card.TEN_OF_CLUBS,
        secondCard: Card.JACK_OF_CLUBS,
      });

      // Player draws with a full hand of 8
      cy.get('#deck').click();
      // Player now has 9 cards in hand
      cy.get('[data-player-hand-card]').should('have.length', 9);

      // Discard-to-hand-limit dialog appears
      cy.get('#discard-to-hand-limit-dialog').should('be.visible');

      // Player selects one card to discard
      cy.get('[data-discard-hand-limit-card=1-0]').click();
      cy.get('[data-cy=submit-discard-to-hand-limit-dialog]').click();

      // Player is back to 8 cards
      cy.get('[data-player-hand-card]').should('have.length', 8);
      cy.get('#discard-to-hand-limit-dialog').should('not.exist');

      assertGameState(0, {
        p0Hand: [
          Card.TWO_OF_CLUBS,
          Card.THREE_OF_CLUBS,
          Card.FOUR_OF_CLUBS,
          Card.SIX_OF_CLUBS,
          Card.SEVEN_OF_CLUBS,
          Card.EIGHT_OF_CLUBS,
          Card.NINE_OF_CLUBS,
          Card.TEN_OF_CLUBS,
        ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.ACE_OF_SPADES ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.ACE_OF_CLUBS ],
      });
    });
  });

  describe('P1 draws at hand limit (opponent discards)', () => {
    beforeEach(() => {
      cy.setupGameAsP1();
    });

    it('Opponent draws 9th card and must discard — player sees waiting overlay', () => {
      cy.loadGameFixture(1, {
        p0Hand: [
          Card.ACE_OF_CLUBS,
          Card.TWO_OF_CLUBS,
          Card.THREE_OF_CLUBS,
          Card.FOUR_OF_CLUBS,
          Card.SIX_OF_CLUBS,
          Card.SEVEN_OF_CLUBS,
          Card.EIGHT_OF_CLUBS,
          Card.NINE_OF_CLUBS,
        ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.ACE_OF_SPADES ],
        p1Points: [],
        p1FaceCards: [],
        topCard: Card.TEN_OF_CLUBS,
        secondCard: Card.JACK_OF_CLUBS,
      });

      // Opponent (P0) goes first and draws with a full hand of 8
      cy.drawCardOpponent();

      // Waiting overlay appears for player (P1) while opponent discards
      cy.get('#waiting-for-opponent-discard-scrim').should('be.visible');

      // Opponent discards one card
      cy.discardToHandLimitOpponent(Card.ACE_OF_CLUBS);

      // Overlay disappears and it's now P1's turn (P0 discarded, turn passed to P1)
      cy.get('#waiting-for-opponent-discard-scrim').should('not.exist');

      assertGameState(1, {
        p0Hand: [
          Card.TWO_OF_CLUBS,
          Card.THREE_OF_CLUBS,
          Card.FOUR_OF_CLUBS,
          Card.SIX_OF_CLUBS,
          Card.SEVEN_OF_CLUBS,
          Card.EIGHT_OF_CLUBS,
          Card.NINE_OF_CLUBS,
          Card.TEN_OF_CLUBS,
        ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.ACE_OF_SPADES ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.ACE_OF_CLUBS ],
      });
    });
  });

  describe('Five at 8 cards (overflows by 1)', () => {
    beforeEach(() => {
      cy.setupGameAsP0();
    });

    it('Five resolves to 9 cards triggering discard of 1', () => {
      cy.loadGameFixture(0, {
        p0Hand: [
          Card.FIVE_OF_CLUBS,
          Card.ACE_OF_CLUBS,
          Card.TWO_OF_CLUBS,
          Card.THREE_OF_CLUBS,
          Card.FOUR_OF_CLUBS,
          Card.SIX_OF_CLUBS,
          Card.SEVEN_OF_CLUBS,
          Card.EIGHT_OF_CLUBS,
        ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.ACE_OF_SPADES ],
        p1Points: [],
        p1FaceCards: [],
        topCard: Card.NINE_OF_CLUBS,
        secondCard: Card.TEN_OF_CLUBS,
      });

      // Play five and resolve — discard one card first
      cy.playOneOffAndResolveAsPlayer(Card.FIVE_OF_CLUBS);
      cy.get('[data-cy=five-discard-dialog]').should('be.visible');
      cy.get('[data-discard-card=1-0]').click();
      cy.get('[data-cy=submit-five-dialog]').click();

      // Player now has 9 cards (7 remaining - 1 discarded + 3 drawn), triggering discard-to-hand-limit
      cy.get('[data-player-hand-card]').should('have.length', 9);
      cy.get('#discard-to-hand-limit-dialog').should('be.visible');

      // Player discards 1 card
      cy.get('[data-discard-hand-limit-card]').first()
        .click();
      cy.get('[data-cy=submit-discard-to-hand-limit-dialog]').click();

      cy.get('[data-player-hand-card]').should('have.length', 8);
      cy.get('#discard-to-hand-limit-dialog').should('not.exist');
    });
  });

  describe('Five at 9 cards (overflows by 2)', () => {
    beforeEach(() => {
      cy.setupGameAsP0();
    });

    it('Five resolves to 10 cards triggering discard of 2', () => {
      cy.loadGameFixture(0, {
        p0Hand: [
          Card.FIVE_OF_CLUBS,
          Card.ACE_OF_CLUBS,
          Card.TWO_OF_CLUBS,
          Card.THREE_OF_CLUBS,
          Card.FOUR_OF_CLUBS,
          Card.SIX_OF_CLUBS,
          Card.SEVEN_OF_CLUBS,
          Card.EIGHT_OF_CLUBS,
          Card.NINE_OF_CLUBS,
        ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.ACE_OF_SPADES ],
        p1Points: [],
        p1FaceCards: [],
        topCard: Card.TEN_OF_CLUBS,
        secondCard: Card.JACK_OF_CLUBS,
      });

      // Play five and resolve — discard one card first (9 cards → 8 after discard → 10 after drawing 3)
      cy.playOneOffAndResolveAsPlayer(Card.FIVE_OF_CLUBS);
      cy.get('[data-cy=five-discard-dialog]').should('be.visible');
      cy.get('[data-discard-card=1-0]').click();
      cy.get('[data-cy=submit-five-dialog]').click();

      // Player now has 10 cards (8 remaining - 1 discarded + 3 drawn), must discard 2
      cy.get('[data-player-hand-card]').should('have.length', 10);
      cy.get('#discard-to-hand-limit-dialog').should('be.visible');

      // Player must select 2 cards to discard
      cy.get('[data-discard-hand-limit-card]').eq(0)
        .click();
      cy.get('[data-discard-hand-limit-card]').eq(1)
        .click();
      cy.get('[data-cy=submit-discard-to-hand-limit-dialog]').click();

      cy.get('[data-player-hand-card]').should('have.length', 8);
      cy.get('#discard-to-hand-limit-dialog').should('not.exist');
    });
  });
});
