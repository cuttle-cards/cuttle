import { Card } from '../../fixtures/cards';

describe('Video Playground', () => {
  beforeEach(() => {
    cy.viewport(1920, 1080);
    cy.setupGameAsP0();
  });

  it('Plays Points', () => {
    cy.loadGameFixture(0, {
      p0Hand: [Card.ACE_OF_SPADES, Card.SIX_OF_SPADES, Card.EIGHT_OF_HEARTS, Card.SEVEN_OF_DIAMONDS],
      p0Points: [Card.TEN_OF_SPADES],
      p0FaceCards: [],
      p1Hand: [
        Card.THREE_OF_CLUBS,
        Card.FIVE_OF_HEARTS,
        Card.EIGHT_OF_CLUBS,
        Card.NINE_OF_DIAMONDS,
        Card.NINE_OF_HEARTS
      ],
      p1Points: [Card.FIVE_OF_HEARTS],
      p1FaceCards: [],
    });

    cy.wait(1000);

    cy.get('[data-player-hand-card=8-2]').click();
    cy.wait(800);

    cy.get('[data-move-choice=points]').click();
  });
});