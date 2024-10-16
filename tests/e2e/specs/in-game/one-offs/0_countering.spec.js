import { assertGameState, playOutOfTurn } from '../../../support/helpers';
import { Card } from '../../../fixtures/cards';

describe('Countering One-Offs', () => {
  beforeEach(() => {
    cy.setupGameAsP1();
  });

  it('Displays the cannot counter modal and resolves stack when opponent plays a one-off if player has no twos', () => {
    cy.loadGameFixture(1, {
      // Opponent is P0
      p0Hand: [ Card.ACE_OF_CLUBS, Card.FOUR_OF_SPADES ],
      p0Points: [ Card.TEN_OF_SPADES, Card.ACE_OF_SPADES ],
      p0FaceCards: [ Card.KING_OF_SPADES ],
      // Player is P1
      p1Hand: [ Card.ACE_OF_HEARTS ],
      p1Points: [ Card.TEN_OF_HEARTS, Card.ACE_OF_DIAMONDS ],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
    });

    // Opponent plays ace of clubs
    cy.playOneOffOpponent(Card.ACE_OF_CLUBS);
    cy.get('#cannot-counter-dialog')
      .should('be.visible')
      .should('contain', 'You cannot Counter, because you do not have a two.')
      .get('[data-cy=cannot-counter-resolve]')
      .click();

    assertGameState(1, {
      p0Hand: [ Card.FOUR_OF_SPADES ],
      p0Points: [],
      p0FaceCards: [ Card.KING_OF_SPADES ],
      p1Hand: [ Card.ACE_OF_HEARTS ],
      p1Points: [],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
      scrap: [
        Card.TEN_OF_SPADES,
        Card.ACE_OF_SPADES,
        Card.TEN_OF_HEARTS,
        Card.ACE_OF_DIAMONDS,
        Card.ACE_OF_CLUBS,
      ],
    });
  });

  it('Counters one-off with a two', () => {
    cy.loadGameFixture(1, {
      // Opponent is P0
      p0Hand: [ Card.ACE_OF_CLUBS, Card.FOUR_OF_SPADES ],
      p0Points: [ Card.TEN_OF_SPADES, Card.ACE_OF_SPADES ],
      p0FaceCards: [ Card.KING_OF_SPADES ],
      // Player is P1
      p1Hand: [ Card.ACE_OF_HEARTS, Card.TWO_OF_SPADES ],
      p1Points: [ Card.TEN_OF_HEARTS, Card.ACE_OF_DIAMONDS ],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
    });

    // Opponent plays ace of clubs as one-off
    cy.playOneOffOpponent(Card.ACE_OF_CLUBS);
    cy.get('#cannot-counter-dialog').should('not.exist');
    // Player counters
    cy.get('#counter-dialog').should('be.visible')
      .get('[data-cy=counter]')
      .click();
    cy.get('#choose-two-dialog').should('be.visible')
      .get('[data-counter-dialog-card=2-3]')
      .click();
    cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
    // Opponent resolves
    cy.resolveOpponent();
    assertGameState(1, {
      // Opponent is P0
      p0Hand: [ Card.FOUR_OF_SPADES ],
      p0Points: [ Card.TEN_OF_SPADES, Card.ACE_OF_SPADES ],
      p0FaceCards: [ Card.KING_OF_SPADES ],
      // Player is P1
      p1Hand: [ Card.ACE_OF_HEARTS ],
      p1Points: [ Card.TEN_OF_HEARTS, Card.ACE_OF_DIAMONDS ],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
      scrap: [ Card.TWO_OF_SPADES, Card.ACE_OF_CLUBS ],
    });
  });

  it('Declining option to counter resolves stack', () => {
    cy.loadGameFixture(1, {
      // Opponent is P0
      p0Hand: [ Card.ACE_OF_CLUBS, Card.FOUR_OF_SPADES ],
      p0Points: [ Card.TEN_OF_SPADES, Card.ACE_OF_SPADES ],
      p0FaceCards: [ Card.KING_OF_SPADES ],
      // Player is P1
      p1Hand: [ Card.ACE_OF_HEARTS, Card.TWO_OF_SPADES ],
      p1Points: [ Card.TEN_OF_HEARTS, Card.ACE_OF_DIAMONDS ],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
    });

    cy.playOneOffOpponent(Card.ACE_OF_CLUBS);
    cy.get('#cannot-counter-dialog').should('not.exist');
    cy.get('#counter-dialog').should('be.visible')
      .get('[data-cy=decline-counter-resolve]')
      .click();

    assertGameState(1, {
      p0Hand: [ Card.FOUR_OF_SPADES ],
      p0Points: [],
      p0FaceCards: [ Card.KING_OF_SPADES ],
      p1Hand: [ Card.ACE_OF_HEARTS, Card.TWO_OF_SPADES ],
      p1Points: [],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
      scrap: [
        Card.TEN_OF_SPADES,
        Card.ACE_OF_SPADES,
        Card.TEN_OF_HEARTS,
        Card.ACE_OF_DIAMONDS,
        Card.ACE_OF_CLUBS,
      ],
    });
  });

  it('Cancels decision to counter with Cancel button after choosing to counter', () => {
    // Setup
    cy.loadGameFixture(1, {
      // Opponent is P0
      p0Hand: [ Card.ACE_OF_CLUBS, Card.FOUR_OF_SPADES ],
      p0Points: [ Card.TEN_OF_SPADES, Card.ACE_OF_SPADES ],
      p0FaceCards: [ Card.KING_OF_SPADES ],
      // Player is P1
      p1Hand: [ Card.ACE_OF_HEARTS, Card.TWO_OF_SPADES ],
      p1Points: [ Card.TEN_OF_HEARTS, Card.ACE_OF_DIAMONDS ],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
    });

    // Opponent plays ace of clubs as one-off
    cy.playOneOffOpponent(Card.ACE_OF_CLUBS);
    cy.get('#cannot-counter-dialog').should('not.exist');

    // Player initially chooses to counter
    cy.get('#counter-dialog').should('be.visible')
      .get('[data-cy=counter]')
      .click();
    // Player then cancels decision to counter
    cy.get('#choose-two-dialog').should('be.visible')
      .get('[data-cy=cancel-counter]')
      .click();

    assertGameState(1, {
      // Opponent is P0
      p0Hand: [ Card.FOUR_OF_SPADES ],
      p0Points: [],
      p0FaceCards: [ Card.KING_OF_SPADES ],
      // Player is P1
      p1Hand: [ Card.ACE_OF_HEARTS, Card.TWO_OF_SPADES ],
      p1Points: [],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
      scrap: [
        Card.ACE_OF_CLUBS,
        Card.TEN_OF_SPADES,
        Card.ACE_OF_SPADES,
        Card.TEN_OF_HEARTS,
        Card.ACE_OF_DIAMONDS,
      ],
    });
  });

  it('Double counters successfully', () => {
    // Setup
    cy.loadGameFixture(1, {
      // Opponent is P0
      p0Hand: [ Card.ACE_OF_CLUBS, Card.TWO_OF_CLUBS ],
      p0Points: [ Card.TEN_OF_SPADES, Card.ACE_OF_SPADES ],
      p0FaceCards: [ Card.KING_OF_SPADES ],
      // Player is P1
      p1Hand: [ Card.TWO_OF_HEARTS ],
      p1Points: [ Card.TEN_OF_HEARTS, Card.ACE_OF_DIAMONDS ],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
    });

    // Opponent plays ace of clubs as one-off
    cy.playOneOffOpponent(Card.ACE_OF_CLUBS);
    cy.get('#cannot-counter-dialog').should('not.exist');

    // Player counters
    cy.get('#counter-dialog').should('be.visible')
      .get('[data-cy=counter]')
      .click();
    cy.get('#choose-two-dialog').should('be.visible')
      .get('[data-counter-dialog-card=2-2]')
      .click();
    cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
    // Opponent counters back
    cy.counterOpponent(Card.TWO_OF_CLUBS);

    // Player cannot counter back
    cy.get('#cannot-counter-dialog').should('be.visible')
      .get('[data-cy=cannot-counter-resolve]')
      .click();

    assertGameState(1, {
      // Opponent is P0
      p0Hand: [],
      p0Points: [],
      p0FaceCards: [ Card.KING_OF_SPADES ],
      // Player is P1
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
      scrap: [
        Card.ACE_OF_CLUBS,
        Card.TWO_OF_HEARTS,
        Card.TWO_OF_CLUBS,
        Card.TEN_OF_SPADES,
        Card.ACE_OF_SPADES,
        Card.TEN_OF_HEARTS,
        Card.ACE_OF_DIAMONDS,
      ],
    });
  });

  it('Triple counters successfully', () => {
    cy.loadGameFixture(1, {
      // Opponent is P0
      p0Hand: [ Card.ACE_OF_CLUBS, Card.TWO_OF_CLUBS ],
      p0Points: [ Card.TEN_OF_SPADES, Card.ACE_OF_SPADES ],
      p0FaceCards: [ Card.KING_OF_SPADES ],
      // Player is P1
      p1Hand: [ Card.TWO_OF_HEARTS, Card.TWO_OF_SPADES ],
      p1Points: [ Card.TEN_OF_HEARTS, Card.ACE_OF_DIAMONDS ],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
    });

    // Opponent plays ace of clubs as one-off
    cy.playOneOffOpponent(Card.ACE_OF_CLUBS);
    cy.get('#cannot-counter-dialog').should('not.exist');

    // Player counters (1st counter)
    cy.log('Player counters (1st counter)');
    cy.get('#counter-dialog').should('be.visible')
      .get('[data-cy=counter]')
      .click();
    cy.get('#choose-two-dialog').should('be.visible')
      .get('[data-counter-dialog-card=2-2]')
      .click();
    cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
    // Opponent counters back (2nd counter)
    cy.log('Opponent counters back (2nd counter)');
    cy.counterOpponent(Card.TWO_OF_CLUBS);
    // Player counters again (3rd counter)
    cy.log('Player counters again (3rd counter');
    cy.get('#counter-dialog')
      .should('be.visible')
      .contains('Your opponent has played the 2♣️ to Counter your 2♥️', { includeShadowDom: true });
    cy.get('[data-cy=counter]').click();
    cy.get('#choose-two-dialog').should('be.visible')
      .get('[data-counter-dialog-card=2-3]')
      .click();
    cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
    // Opponent resolves
    cy.resolveOpponent();

    assertGameState(1, {
      // Opponent is P0
      p0Hand: [],
      p0Points: [ Card.TEN_OF_SPADES, Card.ACE_OF_SPADES ],
      p0FaceCards: [ Card.KING_OF_SPADES ],
      // Player is P1
      p1Hand: [],
      p1Points: [ Card.TEN_OF_HEARTS, Card.ACE_OF_DIAMONDS ],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
      scrap: [ Card.ACE_OF_CLUBS, Card.TWO_OF_HEARTS, Card.TWO_OF_CLUBS, Card.TWO_OF_SPADES ],
    });
  });

  it('Quadruple counters successfully', () => {
    cy.loadGameFixture(1, {
      // Opponent is P0
      p0Hand: [ Card.ACE_OF_CLUBS, Card.TWO_OF_CLUBS, Card.TWO_OF_DIAMONDS ],
      p0Points: [ Card.TEN_OF_SPADES, Card.ACE_OF_SPADES ],
      p0FaceCards: [ Card.KING_OF_SPADES ],
      // Player is P1
      p1Hand: [ Card.TWO_OF_HEARTS, Card.TWO_OF_SPADES ],
      p1Points: [ Card.TEN_OF_HEARTS, Card.ACE_OF_DIAMONDS ],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
    });

    // Opponent plays ace of clubs as one-off
    cy.playOneOffOpponent(Card.ACE_OF_CLUBS);
    cy.get('#cannot-counter-dialog').should('not.exist');

    // Player counters (1st counter)
    cy.get('#counter-dialog').should('be.visible')
      .get('[data-cy=counter]')
      .click();
    cy.get('#choose-two-dialog').should('be.visible')
      .get('[data-counter-dialog-card=2-2]')
      .click();
    cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
    cy.get('#waiting-for-opponent-counter-scrim [data-overlay-one-off=1-0]').should('exist');
    cy.get('#waiting-for-opponent-counter-scrim [data-overlay-counter=2-2]').should('exist');
    // Opponent counters back (2nd counter)
    cy.counterOpponent(Card.TWO_OF_CLUBS);
    // Player counters again (3rd counter)
    cy.get('#counter-dialog').should('be.visible')
      .get('[data-cy=counter]')
      .click();
    cy.get('#choose-two-dialog').should('be.visible')
      .get('[data-counter-dialog-card=2-3]')
      .click();
    cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
    cy.get('#waiting-for-opponent-counter-scrim [data-overlay-one-off=1-0]').should('exist');
    cy.get('#waiting-for-opponent-counter-scrim [data-overlay-counter=2-2]').should('exist');
    cy.get('#waiting-for-opponent-counter-scrim [data-overlay-counter=2-0]').should('exist');
    // Opponent plays 4th and final counter
    cy.counterOpponent(Card.TWO_OF_DIAMONDS);
    // Player cannot counter back
    cy.get('#cannot-counter-dialog').should('be.visible')
      .get('[data-cy=cannot-counter-resolve]')
      .click();
    assertGameState(1, {
      // Opponent is P0
      p0Hand: [],
      p0Points: [],
      p0FaceCards: [ Card.KING_OF_SPADES ],
      // Player is P1
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
      scrap: [
        Card.ACE_OF_CLUBS,
        Card.TWO_OF_HEARTS,
        Card.TWO_OF_CLUBS,
        Card.TWO_OF_SPADES,
        Card.TWO_OF_DIAMONDS,
        Card.TEN_OF_SPADES,
        Card.ACE_OF_SPADES,
        Card.TEN_OF_HEARTS,
        Card.ACE_OF_DIAMONDS,
      ],
    });
  });

  it('Cannot Counter When Opponent Has Queen', () => {
    cy.loadGameFixture(1, {
      // Opponent is P0
      p0Hand: [ Card.ACE_OF_CLUBS, Card.TWO_OF_CLUBS, Card.TWO_OF_DIAMONDS ],
      p0Points: [ Card.TEN_OF_SPADES, Card.ACE_OF_SPADES ],
      p0FaceCards: [ Card.QUEEN_OF_CLUBS ],
      // Player is P1
      p1Hand: [ Card.TWO_OF_HEARTS, Card.TWO_OF_SPADES ],
      p1Points: [ Card.TEN_OF_HEARTS, Card.ACE_OF_DIAMONDS ],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
    });

    // Opponent plays ace of clubs as one-off
    cy.playOneOffOpponent(Card.ACE_OF_CLUBS);
    cy.get('#cannot-counter-dialog')
      .should('be.visible')
      .should('contain', 'You cannot Counter, because your opponent has a queen.')
      .get('[data-cy=cannot-counter-resolve]')
      .click();
  });
});

describe('Countering One-Offs P0 Perspective', () => {
  beforeEach(() => {
    cy.setupGameAsP0();
  });

  it('Increments turn when one-off fizzles', () => {
    cy.loadGameFixture(0, {
      // Player is P0
      p0Hand: [ Card.THREE_OF_CLUBS, Card.FOUR_OF_SPADES ],
      p0Points: [ Card.TEN_OF_SPADES, Card.ACE_OF_SPADES ],
      p0FaceCards: [ Card.KING_OF_SPADES ],
      // Opponent is P1
      p1Hand: [ Card.ACE_OF_HEARTS, Card.TWO_OF_SPADES, Card.SIX_OF_CLUBS ],
      p1Points: [ Card.TEN_OF_HEARTS, Card.ACE_OF_DIAMONDS ],
      p1FaceCards: [],
      scrap: [ Card.QUEEN_OF_CLUBS ],
    });

    // Player plays three of clubs as one-off
    cy.get('[data-player-hand-card=3-0]').click();
    cy.get('[data-move-choice=oneOff]').click();

    // Opponent counters and player resolves
    cy.counterOpponent(Card.TWO_OF_SPADES);
    cy.get('#cannot-counter-dialog').should('be.visible')
      .get('[data-cy=cannot-counter-resolve]')
      .click();

    // No longer player turn
    cy.get('[data-player-hand-card=4-3]').click(); // Four of Spades
    playOutOfTurn('points');

    // Opponent plays a six
    cy.playPointsOpponent(Card.SIX_OF_CLUBS);

    assertGameState(0, {
      // Player is P0
      p0Hand: [ Card.FOUR_OF_SPADES ],
      p0Points: [ Card.TEN_OF_SPADES, Card.ACE_OF_SPADES ],
      p0FaceCards: [ Card.KING_OF_SPADES ],
      // Opponent is P1
      p1Hand: [ Card.ACE_OF_HEARTS ],
      p1Points: [ Card.TEN_OF_HEARTS, Card.ACE_OF_DIAMONDS, Card.SIX_OF_CLUBS ],
      p1FaceCards: [],
      scrap: [ Card.QUEEN_OF_CLUBS, Card.THREE_OF_CLUBS, Card.TWO_OF_SPADES ],
    });
  });

  it('Quadruple counters successfully - P0 Perspective', () => {
    cy.loadGameFixture(0, {
      // Player is P0
      p0Hand: [ Card.ACE_OF_CLUBS, Card.TWO_OF_CLUBS, Card.TWO_OF_DIAMONDS ],
      p0Points: [ Card.TEN_OF_SPADES, Card.ACE_OF_SPADES ],
      p0FaceCards: [ Card.KING_OF_SPADES ],
      // Opponent is P1
      p1Hand: [ Card.TWO_OF_HEARTS, Card.TWO_OF_SPADES ],
      p1Points: [ Card.TEN_OF_HEARTS, Card.ACE_OF_DIAMONDS ],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
    });

    // Player plays ace of clubs as one-off
    cy.get('[data-player-hand-card=1-0]').click();
    cy.get('[data-move-choice=oneOff]').click();

    // Opponent counters (1st counter)
    cy.log('Opponent counters (1st counter)');
    cy.counterOpponent(Card.TWO_OF_HEARTS);

    // Player counters back (2nd counter)
    cy.log('Player counters back (2nd counter)');
    cy.get('#counter-dialog')
      .should('be.visible')
      .contains('Your opponent has played the 2♥️ to Counter', { includeShadowDom: true });
    cy.get('[data-cy=counter]').click();

    cy.get('#choose-two-dialog').should('be.visible')
      .get('[data-counter-dialog-card=2-0]')
      .click();

    // Opponent counters back (3rd counter)
    cy.log('Opponent counters (3rd counter)');
    cy.counterOpponent(Card.TWO_OF_SPADES);

    // Player counters (4th counter)
    cy.log('Player counters (4th counter)');
    cy.get('#counter-dialog')
      .should('be.visible')
      .contains('Your opponent has played the 2♠️ to Counter your 2♣️', { includeShadowDom: true });
    cy.get('[data-cy=counter]').click();
    cy.get('#choose-two-dialog').should('be.visible')
      .get('[data-counter-dialog-card=2-1]')
      .click();
    cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');

    cy.resolveOpponent();
    assertGameState(0, {
      // Player is P0
      p0Hand: [],
      p0Points: [],
      p0FaceCards: [ Card.KING_OF_SPADES ],
      // Opponent is P1
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
      scrap: [
        Card.ACE_OF_CLUBS,
        Card.TWO_OF_HEARTS,
        Card.TWO_OF_CLUBS,
        Card.TWO_OF_SPADES,
        Card.TWO_OF_DIAMONDS,
        Card.TEN_OF_SPADES,
        Card.ACE_OF_SPADES,
        Card.TEN_OF_HEARTS,
        Card.ACE_OF_DIAMONDS,
      ],
    });
  });

  it('Cannot Counter When Opponent Has Queen, dialog message', () => {
    cy.loadGameFixture(0, {
      // Player is P0
      p0Hand: [ Card.ACE_OF_CLUBS, Card.TWO_OF_CLUBS, Card.TWO_OF_DIAMONDS ],
      p0Points: [ Card.TEN_OF_SPADES, Card.ACE_OF_SPADES ],
      p0FaceCards: [],
      // Opponent is P1
      p1Hand: [ Card.TWO_OF_HEARTS, Card.TWO_OF_SPADES ],
      p1Points: [ Card.TEN_OF_HEARTS, Card.ACE_OF_DIAMONDS ],
      p1FaceCards: [ Card.KING_OF_HEARTS, Card.QUEEN_OF_CLUBS ],
    });

    // Player plays ace of clubs as one-off
    cy.log('Player plays ace of clubs as one-off');
    cy.get('[data-player-hand-card=1-0]').click();
    cy.get('[data-move-choice=oneOff]').click();

    // Opponent counters
    cy.log('Opponent counters');
    cy.counterOpponent(Card.TWO_OF_HEARTS);

    // Player cannot counter because of queen
    cy.get('#cannot-counter-dialog')
      .should('be.visible')
      .should('contain', 'You cannot Counter, because your opponent has a queen.')
      .contains('Your opponent has played the 2♥️ to Counter', { includeShadowDom: true });
    cy.get('[data-cy=cannot-counter-resolve]').click();
  });
});

describe('Opponent May Counter vs Opponent Must Resolve', () => {
  beforeEach(() => {
    cy.setupGameAsP0();
  });

  describe('Opponent May Counter', () => {
    it('Displays "Opponent May Counter" when player had neither glasses nor a queen', () => {
      cy.loadGameFixture(0, {
        // Player is P0
        p0Hand: [ Card.ACE_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        // Opponent is P1
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
      });

      cy.get('[data-player-hand-card=1-0]').click();
      cy.get('[data-move-choice=oneOff]').click();

      cy.get('#waiting-for-opponent-counter-scrim')
        .should('be.visible')
        .should('contain', 'Opponent May Counter');

      // make sure drawing is not possible
      cy.window()
        .its('cuttle.gameStore')
        .then(async (store) => {
          try {
            await store.requestDrawCard();
            expect(true).to.eq(false, 'Expected request to draw card to error');
          } catch (err) {
            const errors = [
              "Can't play while waiting for opponent to counter",
              'game.snackbar.global.notInMainPhase',
            ];
            expect(err).to.be.oneOf(errors);
          }
        });
    });

    it('Displays "Opponent May Counter" when player has glasses but opponent has a two in hand', () => {
      cy.loadGameFixture(0, {
        // Player is P0
        p0Hand: [ Card.ACE_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [ Card.EIGHT_OF_DIAMONDS ],
        // Opponent is P1
        p1Hand: [ Card.TWO_OF_SPADES ],
        p1Points: [],
        p1FaceCards: [],
      });

      cy.get('[data-player-hand-card=1-0]').click();
      cy.get('[data-move-choice=oneOff]').click();

      cy.get('#waiting-for-opponent-counter-scrim')
        .should('be.visible')
        .should('contain', 'Opponent May Counter');
    });
  });

  describe('Opponent Must Resolve', () => {
    it('Displays "Opponent Must Resolve" when player has a queen', () => {
      cy.loadGameFixture(0, {
        // Player is P0
        p0Hand: [ Card.ACE_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [ Card.QUEEN_OF_HEARTS ],
        // Opponent is P1
        p1Hand: [ Card.TWO_OF_SPADES ],
        p1Points: [],
        p1FaceCards: [],
      });

      cy.get('[data-player-hand-card=1-0]').click();
      cy.get('[data-move-choice=oneOff]').click();

      cy.get('#waiting-for-opponent-counter-scrim')
        .should('be.visible')
        .should('contain', 'Opponent Must Resolve');
    });

    it('Displays "Opponent Must Resolve" when player has glasses while opponent does not have a two in hand', () => {
      cy.loadGameFixture(0, {
        // Player is P0
        p0Hand: [ Card.ACE_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [ Card.EIGHT_OF_DIAMONDS ],
        // Opponent is P1
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
      });

      cy.get('[data-player-hand-card=1-0]').click();
      cy.get('[data-move-choice=oneOff]').click();

      cy.get('#waiting-for-opponent-counter-scrim')
        .should('be.visible')
        .should('contain', 'Opponent Must Resolve');
    });

    it('Display "Opponent Must Resolve" when player has a queen + glasses and their opponent does not have a 2 in hand', () => {
      cy.loadGameFixture(0, {
        // Player is P0
        p0Hand: [ Card.ACE_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [ Card.EIGHT_OF_DIAMONDS, Card.QUEEN_OF_HEARTS ],
        // Opponent is P1
        p1Hand: [ Card.TWO_OF_HEARTS ],
        p1Points: [],
        p1FaceCards: [],
      });

      cy.get('[data-player-hand-card=1-0]').click();
      cy.get('[data-move-choice=oneOff]').click();

      cy.get('#waiting-for-opponent-counter-scrim')
        .should('be.visible')
        .should('contain', 'Opponent Must Resolve');
    });
  });
});
