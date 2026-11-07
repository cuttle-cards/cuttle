import { assertGameState } from '../../support/helpers';
import { Card } from '../../fixtures/cards';

/**
 * Cards both players have seen stay face up while they sit in a hand or on the deck, so neither
 * player has to remember them. Revealed cards in either hand carry an eye icon.
 */
describe('Revealed cards', () => {
  beforeEach(() => {
    cy.setupGameAsP0();
  });

  it('Shows the card a nine topdecks face up on the deck, then in the opponent\'s hand once drawn', () => {
    cy.loadGameFixture(0, {
      p0Hand: [ Card.NINE_OF_SPADES, Card.TEN_OF_CLUBS ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [ Card.SIX_OF_HEARTS ],
      p1Points: [ Card.ACE_OF_DIAMONDS ],
      p1FaceCards: [],
      topCard: Card.TWO_OF_CLUBS,
    });
    cy.get('[data-revealed-top-card]').should('not.exist');

    // Player nines the opponent's ace of diamonds onto the deck
    cy.get('[data-player-hand-card=9-3]').click();
    cy.get('[data-move-choice=targetedOneOff]').click();
    cy.get('[data-opponent-point-card=1-1]').click();
    cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
    cy.resolveOpponent();

    cy.get('[data-revealed-top-card=1-1]').should('be.visible')
      .find('[data-revealed-icon]')
      .should('exist');

    // Opponent draws it back; it stays face up in their hand
    cy.drawCardOpponent();
    cy.get('[data-revealed-top-card]').should('not.exist');
    assertGameState(0, {
      p0Hand: [ Card.TEN_OF_CLUBS ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [ Card.SIX_OF_HEARTS, Card.ACE_OF_DIAMONDS ],
      p1Points: [],
      p1FaceCards: [],
      scrap: [ Card.NINE_OF_SPADES ],
      revealedCards: [ Card.ACE_OF_DIAMONDS ],
    });

    // The reveal is saved with the game, so it survives a reload
    cy.reload();
    cy.get('[data-opponent-hand-card=1-1] [data-revealed-icon]').should('exist');
    cy.get('[data-opponent-hand-card=6-2]').should('not.exist');

    // Once played, the card leaves the hand and is no longer marked
    cy.get('#deck').click();
    cy.playPointsOpponent(Card.ACE_OF_DIAMONDS);
    cy.get('[data-revealed-icon]').should('not.exist');
  });

  it('Marks the card the player picks with a three as revealed in their own hand', () => {
    cy.loadGameFixture(0, {
      p0Hand: [ Card.THREE_OF_CLUBS, Card.ACE_OF_SPADES ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [ Card.TEN_OF_DIAMONDS ],
      p1Points: [],
      p1FaceCards: [],
      scrap: [ Card.TEN_OF_HEARTS ],
    });

    cy.get('[data-player-hand-card=3-0]').click();
    cy.get('[data-move-choice=oneOff]').click();
    cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
    cy.resolveOpponent();

    cy.get('[data-three-dialog-card=10-2]').click();
    cy.get('[data-cy=three-resolve]').click();

    cy.get('[data-player-hand-card=10-2] [data-revealed-icon]').should('exist');
    cy.get('[data-player-hand-card=1-3] [data-revealed-icon]').should('not.exist');
  });

  it('Leaves the card a seven passes over face up on the deck', () => {
    cy.loadGameFixture(0, {
      p0Hand: [ Card.SEVEN_OF_CLUBS ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [ Card.ACE_OF_HEARTS ],
      p1Points: [],
      p1FaceCards: [],
      topCard: Card.FOUR_OF_CLUBS,
      secondCard: Card.SIX_OF_DIAMONDS,
    });

    cy.playOneOffAndResolveAsPlayer(Card.SEVEN_OF_CLUBS);
    cy.get('[data-second-card=6-1]').should('be.visible')
      .click();
    cy.get('[data-move-choice=points]').click();

    cy.get('[data-revealed-top-card=4-0]').should('be.visible');
  });

  it('Keeps the opponent\'s hand revealed after the player\'s glasses are destroyed', () => {
    cy.loadGameFixture(0, {
      p0Hand: [ Card.ACE_OF_SPADES ],
      p0Points: [],
      p0FaceCards: [ Card.EIGHT_OF_SPADES ],
      p1Hand: [ Card.TWO_OF_HEARTS, Card.TEN_OF_HEARTS, Card.KING_OF_DIAMONDS ],
      p1Points: [],
      p1FaceCards: [],
      topCard: Card.SIX_OF_CLUBS,
    });

    // The glasses take effect on the next move
    cy.get('#deck').click();
    cy.playTargetedOneOffOpponent(Card.TWO_OF_HEARTS, Card.EIGHT_OF_SPADES, 'faceCard');
    cy.get('#cannot-counter-dialog').should('be.visible')
      .get('[data-cy=cannot-counter-resolve]')
      .click();

    // The glasses are gone, but the cards the player saw through them stay face up
    assertGameState(0, {
      p0Hand: [ Card.ACE_OF_SPADES, Card.SIX_OF_CLUBS ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [ Card.TEN_OF_HEARTS, Card.KING_OF_DIAMONDS ],
      p1Points: [],
      p1FaceCards: [],
      scrap: [ Card.EIGHT_OF_SPADES, Card.TWO_OF_HEARTS ],
      revealedCards: [ Card.TEN_OF_HEARTS, Card.KING_OF_DIAMONDS ],
    });
  });
});
