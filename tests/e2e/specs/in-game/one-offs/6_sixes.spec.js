import { assertGameState, playOutOfTurn } from '../../../support/helpers';
import { Card } from '../../../fixtures/cards';

before(() => {
  cy.refreshOpponentSocket();
  cy.log('Opponent socket refreshed');
});

describe('Sixes One-Offs', () => {
  beforeEach(() => {
    cy.setupGameAsP0();
  });

  it('Plays a six to destroy all face cards', () => {
    // Setup
    cy.loadGameFixture(0, {
      // Player is P0
      p0Hand: [
        Card.ACE_OF_CLUBS,
        Card.SIX_OF_SPADES,
        Card.SIX_OF_DIAMONDS,
        Card.JACK_OF_CLUBS,
        Card.JACK_OF_HEARTS,
      ],
      p0Points: [ Card.THREE_OF_SPADES, Card.ACE_OF_SPADES ],
      p0FaceCards: [ Card.KING_OF_CLUBS, Card.KING_OF_DIAMONDS ],
      // Opponent is P1
      p1Hand: [ Card.ACE_OF_HEARTS, Card.JACK_OF_DIAMONDS, Card.JACK_OF_SPADES ],
      p1Points: [ Card.TWO_OF_HEARTS, Card.ACE_OF_DIAMONDS ],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
    });

    // Double Jack (control will remain unchanged when 6 resolves)
    // Player & Opponent jack then re-jack the TWO of Hearts
    cy.get('[data-player-hand-card=11-2]').click();
    cy.get('[data-move-choice=jack').click();
    cy.get('[data-opponent-point-card=2-2]').click();
    cy.get('[data-player-point-card=2-2]'); // point card now controlled by player
    cy.playJackOpponent(Card.JACK_OF_SPADES, Card.TWO_OF_HEARTS);

    // Single Jacks (control will switch when 6 resolves)
    // Player jacks opponent's Ace of diamonds
    cy.get('[data-player-hand-card=11-0]').click();
    cy.get('[data-move-choice=jack]').click();
    cy.get('[data-opponent-point-card=1-1]').click();
    // Opponent jacks player's Three of spades
    cy.playJackOpponent(Card.JACK_OF_DIAMONDS, Card.THREE_OF_SPADES);
    // Player plays six
    cy.playOneOffAndResolveAsPlayer(Card.SIX_OF_SPADES);

    assertGameState(0, {
      p0Hand: [ Card.ACE_OF_CLUBS, Card.SIX_OF_DIAMONDS ],
      p0Points: [ Card.THREE_OF_SPADES, Card.ACE_OF_SPADES ],
      p0FaceCards: [],
      // Opponent is P1
      p1Hand: [ Card.ACE_OF_HEARTS ],
      p1Points: [ Card.TWO_OF_HEARTS, Card.ACE_OF_DIAMONDS ],
      p1FaceCards: [],
      scrap: [
        Card.SIX_OF_SPADES,
        Card.KING_OF_CLUBS,
        Card.KING_OF_DIAMONDS,
        Card.KING_OF_HEARTS,
        Card.JACK_OF_CLUBS,
        Card.JACK_OF_DIAMONDS,
        Card.JACK_OF_HEARTS,
        Card.JACK_OF_SPADES,
      ],
    });
    // Attempt to plays six out of turn
    cy.get('[data-player-hand-card=6-1]').click(); // six of diamonds
    playOutOfTurn('oneOff');
  }); // End 6 one-off
});
