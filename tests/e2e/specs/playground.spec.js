import { setupGameAsP0, assertGameState, playOutOfTurn, Card } from '../support/helpers';

describe('Untargeted One-Offs', () => {
  beforeEach(() => {
    setupGameAsP0();
  });

  const attempts = 100;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    it(`Plays an Ace to destroy all point cards (${attempt}/${attempts})`, () => {
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
    });
  }
});
