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
    // Setup
    cy.loadGameFixture(0, {
      p0Hand: [ Card.ACE_OF_CLUBS, Card.FOUR_OF_SPADES, Card.ACE_OF_DIAMONDS ],
      p0Points: [ Card.TEN_OF_SPADES, Card.ACE_OF_SPADES ],
      p0FaceCards: [ Card.KING_OF_SPADES ],
      p1Hand: [ Card.ACE_OF_HEARTS ],
      p1Points: [ Card.TEN_OF_HEARTS, Card.TWO_OF_DIAMONDS ],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
    });

    // Player plays ace
    cy.playOneOffAndResolveAsPlayer(Card.ACE_OF_CLUBS);

    assertGameState(0, {
      p0Hand: [ Card.FOUR_OF_SPADES, Card.ACE_OF_DIAMONDS ],
      p0Points: [],
      p0FaceCards: [ Card.KING_OF_SPADES ],
      p1Hand: [ Card.ACE_OF_HEARTS ],
      p1Points: [],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
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

  it('It scraps attached jacks when an ace resolves', () => {
    cy.loadGameFixture(0, {
      p0Hand: [ Card.ACE_OF_CLUBS, Card.JACK_OF_CLUBS, Card.JACK_OF_DIAMONDS ],
      p0Points: [ Card.TEN_OF_SPADES, Card.ACE_OF_SPADES ],
      p0FaceCards: [],
      p1Hand: [ Card.JACK_OF_HEARTS, Card.JACK_OF_SPADES ],
      p1Points: [ Card.NINE_OF_HEARTS, Card.TWO_OF_DIAMONDS ],
      p1FaceCards: [],
    });

    cy.get('[data-player-hand-card=11-0]').click();
    cy.get('[data-move-choice=jack]').click();
    cy.get('[data-opponent-point-card=2-1]').click();

    assertGameState(0, {
      p0Hand: [ Card.ACE_OF_CLUBS, Card.JACK_OF_DIAMONDS ],
      p0Points: [ Card.TEN_OF_SPADES, Card.ACE_OF_SPADES, Card.TWO_OF_DIAMONDS ],
      p0FaceCards: [],
      p1Hand: [ Card.JACK_OF_HEARTS, Card.JACK_OF_SPADES ],
      p1Points: [ Card.NINE_OF_HEARTS ],
      p1FaceCards: [],
    });

    cy.playJackOpponent(Card.JACK_OF_HEARTS, Card.TWO_OF_DIAMONDS);
    assertGameState(0, {
      p0Hand: [ Card.ACE_OF_CLUBS, Card.JACK_OF_DIAMONDS ],
      p0Points: [ Card.TEN_OF_SPADES, Card.ACE_OF_SPADES ],
      p0FaceCards: [],
      p1Hand: [ Card.JACK_OF_SPADES ],
      p1Points: [ Card.NINE_OF_HEARTS, Card.TWO_OF_DIAMONDS ],
      p1FaceCards: [],
    });

    cy.get('[data-player-hand-card=11-1]').click();
    cy.get('[data-move-choice=jack]').click();
    cy.get('[data-opponent-point-card=9-2]').click();
    assertGameState(0, {
      p0Hand: [ Card.ACE_OF_CLUBS ],
      p0Points: [ Card.TEN_OF_SPADES, Card.ACE_OF_SPADES, Card.NINE_OF_HEARTS ],
      p0FaceCards: [],
      p1Hand: [ Card.JACK_OF_SPADES ],
      p1Points: [ Card.TWO_OF_DIAMONDS ],
      p1FaceCards: [],
    });

    cy.playJackOpponent(Card.JACK_OF_SPADES, Card.TEN_OF_SPADES);
    assertGameState(0, {
      p0Hand: [ Card.ACE_OF_CLUBS ],
      p0Points: [ Card.ACE_OF_SPADES, Card.NINE_OF_HEARTS ],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [ Card.TWO_OF_DIAMONDS, Card.TEN_OF_SPADES ],
      p1FaceCards: [],
    });

    cy.playOneOffAndResolveAsPlayer(Card.ACE_OF_CLUBS);
    assertGameState(0, {
      p0Hand: [],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
      scrap: [
        Card.ACE_OF_CLUBS,
        Card.JACK_OF_CLUBS,
        Card.JACK_OF_DIAMONDS,
        Card.TEN_OF_SPADES,
        Card.ACE_OF_SPADES,
        Card.JACK_OF_HEARTS,
        Card.JACK_OF_SPADES,
        Card.NINE_OF_HEARTS,
        Card.TWO_OF_DIAMONDS,
      ],
    });
  });
});
