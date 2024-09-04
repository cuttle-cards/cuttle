import { assertGameState, playOutOfTurn } from '../../../support/helpers';
import { Card } from '../../../fixtures/cards';

before(() => {
  cy.refreshOpponentSocket();
  cy.log('Opponent socket refreshed');
});

describe('Ace One-Offs', () => {
  beforeEach(() => {
    cy.setupGameAsP0();
  });

  it('Plays an Ace to destroy all point cards', () => {
    cy.skipOnGameStateApi();
    // Setup
    cy.loadGameFixture(0, {
      p0Hand: [Card.ACE_OF_CLUBS, Card.FOUR_OF_SPADES, Card.ACE_OF_DIAMONDS],
      p0Points: [Card.TEN_OF_SPADES, Card.ACE_OF_SPADES],
      p0FaceCards: [Card.KING_OF_SPADES],
      p1Hand: [Card.ACE_OF_HEARTS],
      p1Points: [Card.TEN_OF_HEARTS, Card.TWO_OF_DIAMONDS],
      p1FaceCards: [Card.KING_OF_HEARTS],
    });

    // Player plays ace
    cy.playOneOffAndResolveAsPlayer(Card.ACE_OF_CLUBS);

    assertGameState(0, {
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
        Card.ACE_OF_CLUBS,
      ],
    });
    // Attempt to plays ace out of turn
    cy.get('[data-player-hand-card=1-1]').click(); // ace of diamonds
    playOutOfTurn('points');
  }); // End ace one-off
});
