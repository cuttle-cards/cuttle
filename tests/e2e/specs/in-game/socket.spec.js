import { assertGameState } from '../../support/helpers';
import { Card } from '../../fixtures/cards';

describe('Websockets', () => {

  describe('P0 perspective websockets', () => {
    beforeEach(() => {
      cy.setupGameAsP0();
    });

    it('Processes rapidly received moves one at a time', () => {
      // Set Up
      const scrap = [ Card.ACE_OF_SPADES, Card.TEN_OF_HEARTS, Card.TEN_OF_SPADES, Card.FOUR_OF_CLUBS ];
      cy.loadGameFixture(0, {
        p0Hand: [ Card.THREE_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.TEN_OF_DIAMONDS ],
        p1Points: [ Card.ACE_OF_HEARTS ],
        p1FaceCards: [ Card.KING_OF_HEARTS ],
        scrap,
        topCard: Card.SIX_OF_CLUBS,
      });

      // Player plays three
      cy.get('[data-player-hand-card=3-0]').click(); // three of clubs
      cy.get('[data-move-choice=oneOff]').click();

      cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');

      cy.resolveOpponent();

      cy.get('#waiting-for-opponent-counter-scrim').should('not.exist');

      // Player selects a card from scrap
      cy.get('[data-three-dialog-card=10-2]').click();
      cy.get('[data-cy=three-resolve').should('not.be.disabled')
        .click();

      // opponent immediately draws
      cy.drawCardOpponent();

      cy.wait(2500); // Wait to ensure latest state is shown in the end

      assertGameState(0, {
        p0Hand: [ Card.TEN_OF_HEARTS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.TEN_OF_DIAMONDS, Card.SIX_OF_CLUBS ],
        p1Points: [ Card.ACE_OF_HEARTS ],
        p1FaceCards: [ Card.KING_OF_HEARTS ],
        scrap: [ Card.ACE_OF_SPADES, Card.THREE_OF_CLUBS, Card.TEN_OF_SPADES, Card.FOUR_OF_CLUBS ],
      });
    });
  });

  describe('P1 Perspective Websockets', () => {
    beforeEach(() => {
      cy.setupGameAsP1();
    });

    it('Recovers latest event data when socket reconnects', () => {
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
});
