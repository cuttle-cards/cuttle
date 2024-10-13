import { assertGameState } from '../../support/helpers';
import { Card } from '../../fixtures/cards';

describe('Websockets', () => {
  beforeEach(() => {
    cy.setupGameAsP1();
  });

  it('Recovers latest event data when socket reconnects', () => {
    cy.skipOnGameStateApi();
    cy.loadGameFixture(1, {
      p0Hand: [ Card.ACE_OF_SPADES, Card.ACE_OF_CLUBS ],
      p0Points: [ Card.TEN_OF_SPADES ],
      p0FaceCards: [ Card.KING_OF_SPADES ],
      p1Hand: [ Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS ],
      p1Points: [ Card.TEN_OF_HEARTS ],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
    });

    // Disconnect player's socket
    cy.window()
      .its('cuttle.authStore')
      .then((store) => store.disconnectSocket());
    // Opponent plays points
    cy.playPointsOpponent(Card.ACE_OF_SPADES);
    // Reconnect the socket
    cy.window()
      .its('cuttle.authStore')
      .then((store) => store.reconnectSocket());
    // Should see resulting update after socket reconnects
    assertGameState(1, {
      // ace of spades moved from p0Hand to p0Points
      p0Hand: [ Card.ACE_OF_CLUBS ],
      p0Points: [ Card.TEN_OF_SPADES, Card.ACE_OF_SPADES ],
      p0FaceCards: [ Card.KING_OF_SPADES ],
      p1Hand: [ Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS ],
      p1Points: [ Card.TEN_OF_HEARTS ],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
    });
  });
});
