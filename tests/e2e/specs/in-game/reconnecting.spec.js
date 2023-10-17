import { assertGameState, assertVictory } from '../../support/helpers';
import { opponentOne } from '../../fixtures/userFixtures';
import { Card } from '../../fixtures/cards';

describe('Reconnecting to a game', () => {
  it('Persists session after refreshing the page', () => {
    cy.setupGameAsP0();

    cy.loadGameFixture(0, {
      p0Hand: [Card.ACE_OF_CLUBS],
      p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
    });

    // Reload page, relogin
    cy.reload();

    // Play Ace of Clubs for points
    cy.get('[data-player-hand-card=1-0]').click();
    cy.get('[data-move-choice=points]').click();

    assertGameState(0, {
      p0Hand: [],
      p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS, Card.ACE_OF_CLUBS],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
    });
  });

  it('Reconnects after refreshing the page', () => {
    cy.setupGameAsP0();

    cy.loadGameFixture(0, {
      p0Hand: [Card.ACE_OF_CLUBS],
      p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
    });

    // Reload page
    cy.reload();

    // Play Ace of Clubs for points
    cy.get('[data-player-hand-card=1-0]').click();
    cy.get('[data-move-choice=points]').click();

    assertGameState(0, {
      p0Hand: [],
      p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS, Card.ACE_OF_CLUBS],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
    });
  });

  describe('Reconnecting into Cannot Counter Dialog', () => {
    it('oneOff - Reconnect into cannot counter dialog', () => {
      cy.setupGameAsP1();

      cy.loadGameFixture(1, {
        p0Hand: [Card.ACE_OF_CLUBS],
        p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
        p0FaceCards: [],
        p1Hand: [Card.ACE_OF_DIAMONDS],
        p1Points: [Card.SIX_OF_CLUBS],
        p1FaceCards: [],
      });

      cy.playOneOffOpponent(Card.ACE_OF_CLUBS);

      cy.get('#cannot-counter-dialog').should('be.visible');

      // Reload page, relogin
      cy.reload();

      // Cannot counter dialog appears again
      cy.get('#cannot-counter-dialog').should('be.visible').get('[data-cy=cannot-counter-resolve]').click();

      assertGameState(1, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [Card.ACE_OF_DIAMONDS],
        p1Points: [],
        p1FaceCards: [],
        scrap: [Card.ACE_OF_CLUBS, Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS, Card.SIX_OF_CLUBS],
      });
    });

    it('targetedOneOff -- reconnect into cannot counter dialog', () => {
      cy.setupGameAsP1();

      cy.loadGameFixture(1, {
        p0Hand: [Card.TWO_OF_CLUBS],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [Card.ACE_OF_CLUBS],
        p1Points: [Card.SEVEN_OF_DIAMONDS, Card.SIX_OF_HEARTS],
        p1FaceCards: [Card.KING_OF_CLUBS],
      });

      cy.playTargetedOneOffOpponent(Card.TWO_OF_CLUBS, Card.KING_OF_CLUBS, 'faceCard');

      cy.get('#cannot-counter-dialog').should('be.visible');

      // Reload page, relogin
      cy.reload();

      // Cannot counter dialog appears again
      cy.get('#cannot-counter-dialog').should('be.visible').get('[data-cy=cannot-counter-resolve]').click();

      assertGameState(1, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [Card.ACE_OF_CLUBS],
        p1Points: [Card.SEVEN_OF_DIAMONDS, Card.SIX_OF_HEARTS],
        p1FaceCards: [],
        scrap: [Card.TWO_OF_CLUBS, Card.KING_OF_CLUBS],
      });
    });

    it('counter -- Reconnect into cannot counter dialog', () => {
      cy.setupGameAsP0();
      cy.loadGameFixture(0, {
        p0Hand: [Card.ACE_OF_CLUBS],
        p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
        p0FaceCards: [],
        p1Hand: [Card.TWO_OF_CLUBS],
        p1Points: [],
        p1FaceCards: [],
      });

      // Play ace of clubs
      cy.get('[data-player-hand-card=1-0]').click();
      cy.get('[data-move-choice=oneOff]').click();
      cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
      // Opponent counters
      cy.counterOpponent(Card.TWO_OF_CLUBS);

      // Reload page
      cy.reload();

      // Cannot counter - resolve
      cy.get('#cannot-counter-dialog').should('be.visible').get('[data-cy=cannot-counter-resolve]').click();

      assertGameState(0, {
        p0Hand: [],
        p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
        scrap: [Card.ACE_OF_CLUBS, Card.TWO_OF_CLUBS],
      });
    });

    it('sevenOneOff -- Reconnect into cannot counter dialog', () => {
      cy.setupGameAsP1();
      cy.loadGameFixture(1, {
        p0Hand: [Card.SEVEN_OF_CLUBS],
        p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
        topCard: Card.ACE_OF_CLUBS,
      });

      // Opponent plays seven of clubs and player resolves
      cy.playOneOffOpponent(Card.SEVEN_OF_CLUBS);
      cy.get('#cannot-counter-dialog').should('be.visible').get('[data-cy=cannot-counter-resolve]').click();
      // Opponent plays Ace of clubs from seven
      cy.get('#waiting-for-opponent-play-from-deck-scrim').should('be.visible');

      cy.playOneOffFromSevenOpponent(Card.ACE_OF_CLUBS);

      // Can't counter, again
      cy.get('#cannot-counter-dialog').should('be.visible');

      // Player reconnects and cannot counter
      cy.reload();

      cy.get('#cannot-counter-dialog').should('be.visible').get('[data-cy=cannot-counter-resolve]').click();

      assertGameState(1, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
        scrap: [Card.ACE_OF_CLUBS, Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS, Card.SEVEN_OF_CLUBS],
      });
    });

    it('sevenTargetedOneOff -- Reconnect into cannot counter dialog', () => {
      cy.setupGameAsP1();
      cy.loadGameFixture(1, {
        p0Hand: [Card.SEVEN_OF_CLUBS],
        p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [Card.KING_OF_CLUBS],
        topCard: Card.TWO_OF_CLUBS,
      });

      cy.playOneOffOpponent(Card.SEVEN_OF_CLUBS);
      cy.get('#cannot-counter-dialog').should('be.visible').get('[data-cy=cannot-counter-resolve]').click();
      // Opponent plays two of clubs
      cy.playTargetedOneOffFromSevenOpponent(Card.TWO_OF_CLUBS, Card.KING_OF_CLUBS, 'faceCard');

      // Player reconnects and cannot counter
      cy.reload();

      cy.get('#cannot-counter-dialog').should('be.visible').get('[data-cy=cannot-counter-resolve]').click();

      assertGameState(1, {
        p0Hand: [],
        p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
        scrap: [Card.KING_OF_CLUBS, Card.TWO_OF_CLUBS, Card.SEVEN_OF_CLUBS],
      });
    });

    it('Opponent reconnects while player is in cannot-counter dialog', () => {
      cy.setupGameAsP1();

      cy.loadGameFixture(1, {
        p0Hand: [Card.ACE_OF_CLUBS],
        p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
        p0FaceCards: [],
        p1Hand: [Card.ACE_OF_DIAMONDS],
        p1Points: [Card.SIX_OF_CLUBS],
        p1FaceCards: [],
      });

      cy.playOneOffOpponent(Card.ACE_OF_CLUBS);

      cy.get('#cannot-counter-dialog').should('be.visible');

      cy.reconnectOpponent(opponentOne);

      // Cannot counter dialog appears again
      cy.get('#cannot-counter-dialog').should('be.visible').get('[data-cy=cannot-counter-resolve]').click();

      assertGameState(1, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [Card.ACE_OF_DIAMONDS],
        p1Points: [],
        p1FaceCards: [],
        scrap: [Card.ACE_OF_CLUBS, Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS, Card.SIX_OF_CLUBS],
      });
    });
  }); // End cannot counter dialog describe

  describe('Reconnecting into Counter Dialog', () => {
    it('oneOff -- Reconnect into Counter Dialog', () => {
      cy.setupGameAsP1();
      cy.loadGameFixture(1, {
        p0Hand: [Card.ACE_OF_CLUBS],
        p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
        p0FaceCards: [],
        p1Hand: [Card.TWO_OF_CLUBS],
        p1Points: [Card.ACE_OF_DIAMONDS],
        p1FaceCards: [],
      });

      cy.playOneOffOpponent(Card.ACE_OF_CLUBS);

      cy.get('#counter-dialog').should('be.visible');

      // Reload page
      cy.reload();

      cy.get('#counter-dialog').should('be.visible').get('[data-cy=counter]').click();

      cy.get('#choose-two-dialog').should('be.visible').get('[data-counter-dialog-card=2-0]').click();

      cy.resolveOpponent();

      assertGameState(1, {
        p0Hand: [],
        p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [Card.ACE_OF_DIAMONDS],
        p1FaceCards: [],
        scrap: [Card.ACE_OF_CLUBS, Card.TWO_OF_CLUBS],
      });
    });

    it('targetedOneOff -- reconnect into counter dialog', () => {
      cy.setupGameAsP1();
      cy.loadGameFixture(1, {
        p0Hand: [Card.TWO_OF_SPADES],
        p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
        p0FaceCards: [],
        p1Hand: [Card.TWO_OF_CLUBS],
        p1Points: [Card.ACE_OF_DIAMONDS],
        p1FaceCards: [Card.KING_OF_CLUBS],
      });

      cy.playTargetedOneOffOpponent(Card.TWO_OF_SPADES, Card.KING_OF_CLUBS, 'faceCard');

      cy.get('#counter-dialog').should('be.visible');

      // Reload page & counter
      cy.reload();

      cy.get('#counter-dialog').should('be.visible').get('[data-cy=counter]').click();
      cy.get('#choose-two-dialog').should('be.visible').get('[data-counter-dialog-card=2-0]').click();

      cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');

      cy.resolveOpponent();

      cy.get('#waiting-for-opponent-counter-scrim').should('not.exist');

      assertGameState(1, {
        p0Hand: [],
        p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [Card.ACE_OF_DIAMONDS],
        p1FaceCards: [Card.KING_OF_CLUBS],
        scrap: [Card.TWO_OF_CLUBS, Card.TWO_OF_SPADES],
      });
    });

    it('targetedOneOff -- reconnect into waiting for opponent to counter overlay', () => {
      cy.setupGameAsP1();
      cy.loadGameFixture(1, {
        p0Hand: [Card.TWO_OF_SPADES],
        p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
        p0FaceCards: [],
        p1Hand: [Card.TWO_OF_CLUBS],
        p1Points: [Card.ACE_OF_DIAMONDS],
        p1FaceCards: [Card.KING_OF_CLUBS],
      });

      cy.playTargetedOneOffOpponent(Card.TWO_OF_SPADES, Card.KING_OF_CLUBS, 'faceCard');

      cy.get('#counter-dialog').should('be.visible');

      cy.get('#counter-dialog').should('be.visible').get('[data-cy=counter]').click();
      cy.get('#choose-two-dialog').should('be.visible').get('[data-counter-dialog-card=2-0]').click();

      cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');

      // Reload page & counter
      cy.reload();

      cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');

      cy.resolveOpponent();

      cy.get('#waiting-for-opponent-counter-scrim').should('not.exist');

      assertGameState(1, {
        p0Hand: [],
        p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [Card.ACE_OF_DIAMONDS],
        p1FaceCards: [Card.KING_OF_CLUBS],
        scrap: [Card.TWO_OF_CLUBS, Card.TWO_OF_SPADES],
      });
    });

    it('counter -- Reconnect into counter dialog', () => {
      cy.setupGameAsP0();
      cy.loadGameFixture(0, {
        p0Hand: [Card.ACE_OF_CLUBS, Card.TWO_OF_SPADES],
        p0Points: [Card.SEVEN_OF_DIAMONDS],
        p0FaceCards: [],
        p1Hand: [Card.TWO_OF_CLUBS],
        p1Points: [Card.SEVEN_OF_HEARTS, Card.ACE_OF_DIAMONDS],
        p1FaceCards: [],
      });

      // Play ace of clubs
      cy.get('[data-player-hand-card=1-0]').click();
      cy.get('[data-move-choice=oneOff]').click();

      cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
      // Opponent counters
      cy.counterOpponent(Card.TWO_OF_CLUBS);
      // Counter dialog should be visible
      cy.get('#counter-dialog')
        .should('be.visible')
        .contains('Your opponent has played 2♣️ to Counter', { includeShadowDom: true });
      cy.get('[data-cy=counter]').click();

      // Reconnect & proceed
      cy.reload();

      // Counter dialog should become visible again
      cy.get('#counter-dialog')
        .should('be.visible')
        .contains('Your opponent has played 2♣️ to Counter', { includeShadowDom: true });
      cy.get('[data-cy=counter]').click();
      cy.get('#choose-two-dialog').should('be.visible').get('[data-counter-dialog-card=2-3]').click();

      cy.resolveOpponent();
      assertGameState(0, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
        scrap: [
          Card.ACE_OF_CLUBS,
          Card.TWO_OF_SPADES,
          Card.TWO_OF_CLUBS,
          Card.SEVEN_OF_DIAMONDS,
          Card.SEVEN_OF_HEARTS,
          Card.ACE_OF_DIAMONDS,
        ],
      });
    });

    it('sevenOneOff -- Reconnect into counter dialog', () => {
      cy.setupGameAsP1();
      cy.loadGameFixture(1, {
        p0Hand: [Card.SEVEN_OF_CLUBS],
        p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
        p0FaceCards: [],
        p1Hand: [Card.TWO_OF_DIAMONDS],
        p1Points: [],
        p1FaceCards: [],
        topCard: Card.ACE_OF_CLUBS,
      });

      // Opponent plays seven of clubs and player resolves
      cy.playOneOffOpponent(Card.SEVEN_OF_CLUBS);
      cy.get('#counter-dialog').should('be.visible').get('[data-cy=decline-counter-resolve]').click();

      cy.get('#counter-dialog').should('not.exist');
      // Opponent plays the ace of clubs off top of deck
      cy.playOneOffFromSevenOpponent(Card.ACE_OF_CLUBS);
      cy.get('#counter-dialog').should('be.visible');

      // Reconnect & proceed
      cy.reload();

      // Player can counter but declines
      cy.get('#counter-dialog').should('be.visible').get('[data-cy=decline-counter-resolve]').click();

      assertGameState(1, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [Card.TWO_OF_DIAMONDS],
        p1Points: [],
        p1FaceCards: [],
        scrap: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS, Card.ACE_OF_CLUBS, Card.SEVEN_OF_CLUBS],
      });
    });

    it('sevenTargetedOneOff -- Reconnect into counter dialog', () => {
      cy.setupGameAsP1();
      cy.loadGameFixture(1, {
        p0Hand: [Card.SEVEN_OF_CLUBS],
        p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
        p0FaceCards: [],
        p1Hand: [Card.TWO_OF_DIAMONDS],
        p1Points: [],
        p1FaceCards: [Card.KING_OF_CLUBS],
        topCard: Card.TWO_OF_CLUBS,
      });

      // Opponent plays seven of clubs
      cy.playOneOffOpponent(Card.SEVEN_OF_CLUBS);
      cy.get('#counter-dialog').should('be.visible').get('[data-cy=decline-counter-resolve]').click();
      cy.playTargetedOneOffFromSevenOpponent(Card.TWO_OF_CLUBS, Card.KING_OF_CLUBS, 'faceCard');

      // Reconnect & proceed
      cy.reload();

      // Player counters
      cy.get('#counter-dialog').should('be.visible').get('[data-cy=counter]').click();
      cy.get('#choose-two-dialog').should('be.visible').get('[data-counter-dialog-card=2-1]').click();

      cy.resolveOpponent();

      assertGameState(1, {
        p0Hand: [],
        p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [Card.KING_OF_CLUBS],
        scrap: [Card.TWO_OF_DIAMONDS, Card.TWO_OF_CLUBS, Card.SEVEN_OF_CLUBS],
      });
    });
  }); // End counter dialog describe

  describe('Reconnecting into One-Off resolutions', () => {
    describe('Reconnecting into 3s', () => {
      it('Resolve 3 after reconnect -- Player fetches card', () => {
        cy.setupGameAsP0();
        cy.loadGameFixture(0, {
          p0Hand: [Card.THREE_OF_CLUBS],
          p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
          p0FaceCards: [],
          p1Hand: [Card.TWO_OF_DIAMONDS],
          p1Points: [],
          p1FaceCards: [Card.KING_OF_CLUBS],
          scrap: [Card.TWO_OF_CLUBS],
        });

        cy.playOneOffAndResolveAsPlayer(Card.THREE_OF_CLUBS);

        // Disconnect & Reconnect & relogin
        cy.reload();

        // Three dialog appears & functions correctly
        cy.get('#three-dialog').should('be.visible');
        // resolve button should be disabled
        cy.get('[data-cy=three-resolve').should('be.disabled');

        // Player two of clubs from scrap
        cy.get('[data-three-dialog-card=2-0]').click();
        cy.get('[data-cy=three-resolve').should('not.be.disabled').click();

        assertGameState(0, {
          p0Hand: [Card.TWO_OF_CLUBS],
          p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
          p0FaceCards: [],
          p1Hand: [Card.TWO_OF_DIAMONDS],
          p1Points: [],
          p1FaceCards: [Card.KING_OF_CLUBS],
          scrap: [Card.THREE_OF_CLUBS],
        });
      });

      it('Resolve opponents three after reconnect', () => {
        cy.setupGameAsP1();
        cy.loadGameFixture(1, {
          p0Hand: [Card.THREE_OF_CLUBS],
          p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
          p0FaceCards: [],
          p1Hand: [Card.FOUR_OF_DIAMONDS],
          p1Points: [],
          p1FaceCards: [],
          scrap: [Card.TWO_OF_CLUBS],
        });

        // Opponent plays 3 of clubs & it resolves
        cy.playOneOffOpponent(Card.THREE_OF_CLUBS);
        cy.get('#cannot-counter-dialog').should('be.visible').get('[data-cy=cannot-counter-resolve]').click();
        cy.get('#waiting-for-opponent-resolve-three-scrim').should('be.visible');

        // Disconnect & Reconnect
        cy.reload();

        cy.get('#waiting-for-opponent-resolve-three-scrim').should('be.visible');
        // waiting for opponent to choose from scrap scrim
        cy.resolveThreeOpponent(Card.TWO_OF_CLUBS);

        cy.get('#waiting-for-opponent-resolve-three-scrim').should('not.exist');
        assertGameState(1, {
          p0Hand: [Card.TWO_OF_CLUBS],
          p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
          p0FaceCards: [],
          p1Hand: [Card.FOUR_OF_DIAMONDS],
          p1Points: [],
          p1FaceCards: [],
          scrap: [Card.THREE_OF_CLUBS],
        });
      });
    }); // End 3's reconnect

    it('Resolve 4 after reconnect - Player discards', () => {
      cy.setupGameAsP1();
      cy.loadGameFixture(1, {
        p0Hand: [Card.FOUR_OF_CLUBS],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [Card.THREE_OF_DIAMONDS, Card.THREE_OF_CLUBS],
        p1Points: [],
        p1FaceCards: [],
      });

      // Opponent plays four of clubs, player resolves
      cy.playOneOffOpponent(Card.FOUR_OF_CLUBS);
      cy.get('#cannot-counter-dialog').should('be.visible').get('[data-cy=cannot-counter-resolve]').click();

      // Disconnect & Reconnect
      cy.reload();
      // Four dialog appears, player discards as normal
      // Choosing cards to discard
      cy.log('Choosing two cards to discard');
      cy.get('[data-cy=submit-four-dialog]').should('be.disabled'); // can't prematurely submit
      cy.get('[data-discard-card=3-1]').click(); // ace of diamonds
      cy.get('[data-cy=submit-four-dialog]').should('be.disabled'); // can't prematurely submit
      cy.get('[data-discard-card=3-0]').click(); // four of spades
      cy.get('[data-cy=submit-four-dialog]').click(); // submit choice to discard

      assertGameState(1, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
        scrap: [Card.THREE_OF_DIAMONDS, Card.THREE_OF_CLUBS, Card.FOUR_OF_CLUBS],
      });
    });

    it('Resolve 7 after reconnect - Player', () => {
      cy.setupGameAsP0();
      cy.loadGameFixture(0, {
        p0Hand: [Card.SEVEN_OF_CLUBS],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [Card.THREE_OF_DIAMONDS, Card.THREE_OF_CLUBS],
        p1Points: [],
        p1FaceCards: [],
        topCard: Card.TEN_OF_SPADES,
        secondCard: Card.NINE_OF_CLUBS,
      });

      cy.playOneOffAndResolveAsPlayer(Card.SEVEN_OF_CLUBS);

      cy.get('[data-top-card=10-3]').should('exist').and('be.visible');

      // Disconnect & Reconnect
      cy.reload();

      // Play off top of deck as normal
      cy.get('[data-second-card=9-0]').should('exist').and('be.visible');
      cy.get('[data-top-card=10-3]').should('exist').and('be.visible').click();
      cy.get('[data-move-choice=points]').click();

      assertGameState(0, {
        p0Hand: [],
        p0Points: [Card.TEN_OF_SPADES],
        p0FaceCards: [],
        p1Hand: [Card.THREE_OF_DIAMONDS, Card.THREE_OF_CLUBS],
        p1Points: [],
        p1FaceCards: [],
        topCard: Card.NINE_OF_CLUBS,
        scrap: [Card.SEVEN_OF_CLUBS],
      });
    });
  });
});

describe('Display correct dialog for unavailable game', () => {
  beforeEach(() => {
    cy.setupGameAsP0();
  });

  it('Shows unavailable game dialog, then return home', () => {

    cy.concedeOpponent();
    assertVictory();
    //go home
    cy.get('[data-cy=gameover-go-home]').click();
    cy.url().should('not.include', '/game');
    //go back to game URL
    cy.get('@gameSummary').then(({ gameId }) => cy.visit(`#/game/${gameId}`));
    cy.get("[data-cy='unavailable-game-overlay']").should('be.visible');
    cy.get('[data-cy="leave-unavailable-game-button"]').click();
    cy.hash().should('equal', '#/');
    //go to random url
    cy.visit('#/game/12345');
    cy.get("[data-cy='unavailable-game-overlay']").should('be.visible');
  });
});
