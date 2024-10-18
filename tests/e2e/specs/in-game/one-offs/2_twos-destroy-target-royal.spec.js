import { assertGameState } from '../../../support/helpers';
import { Card } from '../../../fixtures/cards';

describe('Play TWOS', () => {
  describe('Player Playing TWOS', () => {
    beforeEach(() => {
      cy.setupGameAsP0();
    });

    it('Plays Two to Destroy Face Card', () => {
      // Set Up
      cy.loadGameFixture(0, {
        p0Hand: [ Card.ACE_OF_SPADES, Card.TWO_OF_CLUBS ],
        p0Points: [ Card.TEN_OF_SPADES ],
        p0FaceCards: [ Card.KING_OF_SPADES ],
        p1Hand: [ Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS ],
        p1Points: [ Card.TEN_OF_HEARTS ],
        p1FaceCards: [ Card.KING_OF_HEARTS ],
      });

      // Play two as one off (two of clubs)
      cy.get('[data-player-hand-card=2-0]').click();
      cy.get('[data-move-choice=targetedOneOff]').click();
      cy.get('#player-hand-targeting').should('be.visible');
      cy.get('[data-opponent-face-card=13-2]').click(); // target king of hearts

      // Opponent resolves
      cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
      cy.resolveOpponent();
      cy.get('#waiting-for-opponent-counter-scrim').should('not.exist');

      assertGameState(0, {
        p0Hand: [ Card.ACE_OF_SPADES ],
        p0Points: [ Card.TEN_OF_SPADES ],
        p0FaceCards: [ Card.KING_OF_SPADES ],
        p1Hand: [ Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS ],
        p1Points: [ Card.TEN_OF_HEARTS ],
        p1FaceCards: [],
        scrap: [ Card.TWO_OF_CLUBS, Card.KING_OF_HEARTS ],
      });
    });

    it('Resolves a two to destroy a facecard after being double countered', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.ACE_OF_SPADES, Card.TWO_OF_CLUBS, Card.TWO_OF_DIAMONDS ],
        p0Points: [ Card.TEN_OF_SPADES ],
        p0FaceCards: [ Card.KING_OF_SPADES ],
        p1Hand: [ Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS, Card.TWO_OF_HEARTS ],
        p1Points: [ Card.TEN_OF_HEARTS ],
        p1FaceCards: [ Card.KING_OF_HEARTS ],
      });

      // Play two as one off (two of clubs)
      cy.get('[data-player-hand-card=2-0]').click();
      cy.get('[data-move-choice=targetedOneOff]').click();
      cy.get('#player-hand-targeting').should('be.visible');
      cy.get('[data-opponent-face-card=13-2]').click(); // target king of hearts

      // Opponent counters
      cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
      cy.counterOpponent(Card.TWO_OF_HEARTS);

      // Player counters back
      cy.get('#counter-dialog')
        .should('be.visible')
        .get('[data-cy=counter]')
        .click();
      cy.get('#choose-two-dialog')
        .should('be.visible')
        .get('[data-counter-dialog-card=2-1]')
        .click();

      // Opponent Resolves
      cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
      cy.resolveOpponent();

      assertGameState(0, {
        p0Hand: [ Card.ACE_OF_SPADES ],
        p0Points: [ Card.TEN_OF_SPADES ],
        p0FaceCards: [ Card.KING_OF_SPADES ],
        p1Hand: [ Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS ],
        p1Points: [ Card.TEN_OF_HEARTS ],
        p1FaceCards: [],
        scrap: [ Card.TWO_OF_DIAMONDS, Card.TWO_OF_HEARTS, Card.TWO_OF_CLUBS, Card.KING_OF_HEARTS ],
      });
    });

    it('Plays TWO to Destroy Jacks', () => {

      cy.loadGameFixture(0, {
        p0Hand: [ Card.ACE_OF_SPADES, Card.TWO_OF_CLUBS ],
        p0Points: [ Card.TEN_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [ Card.JACK_OF_CLUBS ],
        p1Points: [],
        p1FaceCards: [],
      });

      // player plays Ace of Spades
      cy.get('[data-player-hand-card=1-3]').click();
      cy.get('[data-move-choice=points]').click();

      assertGameState(0, {
        p0Hand: [ Card.TWO_OF_CLUBS ],
        p0Points: [ Card.TEN_OF_SPADES, Card.ACE_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [ Card.JACK_OF_CLUBS ],
        p1Points: [],
        p1FaceCards: [],
      });

      // Opponent plays jack
      cy.playJackOpponent(Card.JACK_OF_CLUBS, Card.ACE_OF_SPADES);

      cy.get('[data-player-hand-card]').should('have.length', 1);

      assertGameState(0, {
        p0Hand: [ Card.TWO_OF_CLUBS ],
        p0Points: [ Card.TEN_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [ Card.ACE_OF_SPADES ],
        p1FaceCards: [],
      });

      // Player plays TWO to destroy jack
      cy.get('[data-player-hand-card=2-0]').click();
      cy.get('[data-move-choice=targetedOneOff]').click();
      cy.get('#player-hand-targeting').should('be.visible');
      cy.get('[data-opponent-face-card=11-0]').click();

      // Wait for opponent to resolve
      cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
      cy.resolveOpponent();

      assertGameState(0, {
        p0Hand: [],
        p0Points: [ Card.ACE_OF_SPADES, Card.TEN_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.TWO_OF_CLUBS, Card.JACK_OF_CLUBS ],
      });
      // Should no longer see jack of clubs on screen
      cy.get('[data-player-face-card=11-0]').should('not.exist');
    }); // End playing TWO to destroy jack

    it('Opponent (p1) plays TWO to destroy a jack', () => {

      cy.loadGameFixture(0, {
        p0Hand: [ Card.JACK_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.ACE_OF_SPADES, Card.TWO_OF_CLUBS ],
        p1Points: [ Card.TEN_OF_SPADES ],
        p1FaceCards: [],
        topCard: Card.SIX_OF_CLUBS
      });

      // player draws
      cy.get('#deck').click();

      cy.playPointsOpponent(Card.ACE_OF_SPADES);

      cy.get('[data-player-hand-card=11-0]').click();
      cy.get('[data-move-choice=jack').click();
      cy.get('[data-opponent-point-card=1-3]').click();

      assertGameState(0, {
        p0Hand: [ Card.SIX_OF_CLUBS ],
        p0Points: [ Card.ACE_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [ Card.TWO_OF_CLUBS ],
        p1Points: [ Card.TEN_OF_SPADES ],
        p1FaceCards: []
      });

      cy.log('Opponent playing TWO on jack');
      cy.playTargetedOneOffOpponent(Card.TWO_OF_CLUBS, Card.JACK_OF_CLUBS, 'jack');

      // player resolves
      cy.get('#cannot-counter-dialog').should('be.visible')
        .get('[data-cy=cannot-counter-resolve]')
        .click();

      assertGameState(0, {
        p0Hand: [ Card.SIX_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [ Card.TEN_OF_SPADES, Card.ACE_OF_SPADES ],
        p1FaceCards: [],
        scrap: [ Card.TWO_OF_CLUBS, Card.JACK_OF_CLUBS ],
      });
    });
  }); // End describe player playing twos

  describe('Opponent Playing TWOS', () => {
    beforeEach(() => {
      cy.setupGameAsP1();
    });

    it('Opponent Plays TWO to Destroy Jacks', () => {

      cy.loadGameFixture(1, {
        p0Hand: [ Card.ACE_OF_SPADES, Card.TWO_OF_CLUBS ],
        p0Points: [ Card.TEN_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [ Card.JACK_OF_CLUBS ],
        p1Points: [],
        p1FaceCards: [],
      });

      cy.playPointsOpponent(Card.ACE_OF_SPADES);

      cy.get('[data-player-hand-card=11-0]').click();
      cy.get('[data-move-choice=jack').click();
      cy.get('[data-opponent-point-card=1-3]').click();

      assertGameState(1, {
        p0Hand: [ Card.TWO_OF_CLUBS ],
        p0Points: [ Card.TEN_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [ Card.ACE_OF_SPADES ],
        p1FaceCards: [],
      });
      cy.log('Opponent playing TWO on jack');
      cy.playTargetedOneOffOpponent(Card.TWO_OF_CLUBS, Card.JACK_OF_CLUBS, 'jack');

      // player resolves
      cy.get('#cannot-counter-dialog').should('be.visible')
        .get('[data-cy=cannot-counter-resolve]')
        .click();

      assertGameState(1, {
        p0Hand: [],
        p0Points: [ Card.TEN_OF_SPADES, Card.ACE_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.TWO_OF_CLUBS, Card.JACK_OF_CLUBS ],
      });
    });
  });
});
