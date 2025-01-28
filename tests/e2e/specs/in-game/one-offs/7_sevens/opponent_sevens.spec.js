import { assertGameState, assertSnackbar } from '../../../../support/helpers';
import { Card } from '../../../../fixtures/cards';
import { SnackBarError } from '../../../../fixtures/snackbarError';

describe('Opponent playing SEVENS', () => {
  beforeEach(() => {
    cy.setupGameAsP1();
  });

  it('Opponent plays points from seven', () => {
    cy.loadGameFixture(1, {
      p0Hand: [ Card.SEVEN_OF_CLUBS ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
      topCard: Card.FOUR_OF_CLUBS,
      secondCard: Card.SIX_OF_DIAMONDS,
    });

    // Opponent plays 7 of clubs
    cy.playOneOffOpponent(Card.SEVEN_OF_CLUBS);
    // Player resolves
    cy.get('[data-cy=cannot-counter-resolve]').should('be.visible')
      .click();
    cy.log('Player resolves (could not counter');

    // Waiting for opponent
    cy.get('#waiting-for-opponent-play-from-deck-scrim').should('be.visible');
    // Deck cards appear but are not selectable
    cy.get('[data-top-card=4-0]').should('exist')
      .click({ force: true })
      .should('not.have.class', 'selected');
    cy.get('[data-second-card=6-1]')
      .should('exist')
      .click({ force: true })
      .should('not.have.class', 'selected');

    // Opponent plays four of clubs for points
    cy.playPointsFromSevenOpponent(Card.FOUR_OF_CLUBS);

    // No longer waiting for opponent
    cy.get('#waiting-for-opponent-play-from-deck-scrim').should('not.exist');
    cy.log('Done waiting for opponent');

    assertGameState(1, {
      p0Hand: [],
      p0Points: [ Card.FOUR_OF_CLUBS ],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
      scrap: [ Card.SEVEN_OF_CLUBS ],
      topCard: Card.SIX_OF_DIAMONDS,
    });
  });

  it('Opponent plays jack from seven', () => {
    cy.loadGameFixture(1, {
      p0Hand: [ Card.SEVEN_OF_CLUBS ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [ Card.TEN_OF_HEARTS ],
      p1FaceCards: [],
      topCard: Card.JACK_OF_CLUBS,
      secondCard: Card.SIX_OF_DIAMONDS,
    });

    // Opponent plays 7 of clubs
    cy.playOneOffOpponent(Card.SEVEN_OF_CLUBS);
    // Player resolves
    cy.get('[data-cy=cannot-counter-resolve]').should('be.visible')
      .click();
    cy.log('Player resolves (could not counter');

    // Waiting for opponent
    cy.get('#waiting-for-opponent-play-from-deck-scrim').should('be.visible');
    // Deck cards appear but are not selectable
    cy.get('[data-top-card=11-0]')
      .should('exist')
      .click({ force: true })
      .should('not.have.class', 'selected');
    cy.get('[data-second-card=6-1]')
      .should('exist')
      .click({ force: true })
      .should('not.have.class', 'selected');

    cy.playJackFromSevenOpponent(Card.JACK_OF_CLUBS, Card.TEN_OF_HEARTS);

    // No longer waiting for opponent
    cy.get('#waiting-for-opponent-play-from-deck-scrim').should('not.exist');
    cy.log('Done waiting for opponent');

    assertGameState(1, {
      p0Hand: [],
      p0Points: [ Card.TEN_OF_HEARTS ],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
      scrap: [ Card.SEVEN_OF_CLUBS ],
      topCard: Card.SIX_OF_DIAMONDS,
    });
  });

  it('Plays jack from a seven - special case - opponent plays seven into double jacks with no points to steal', () => {
    cy.setupGameAsP1();
    cy.loadGameFixture(1, {
      p0Hand: [ Card.SEVEN_OF_CLUBS ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
      topCard: Card.JACK_OF_CLUBS,
      secondCard: Card.JACK_OF_DIAMONDS,
    });

    // Opponent plays 7 of clubs
    cy.playOneOffOpponent(Card.SEVEN_OF_CLUBS);

    cy.get('[data-cy=cannot-counter-resolve]').should('be.visible')
      .click();
    cy.log('Player resolves (could not counter');

    // Waiting for opponent
    cy.get('#waiting-for-opponent-to-discard-jack-from-deck').should('be.visible');

    cy.get('[data-second-card=11-1]')
      .should('exist')
      .click({ force: true })
      .should('not.have.class', 'selected');
    cy.get('[data-top-card=11-0]')
      .should('exist')
      .click({ force: true })
      .should('not.have.class', 'selected');

    cy.sevenDiscardOpponent(Card.JACK_OF_CLUBS);

    assertGameState(0, {
      p0Hand: [],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
      scrap: [ Card.SEVEN_OF_CLUBS, Card.JACK_OF_CLUBS ],
      topCard: Card.JACK_OF_DIAMONDS,
    });
  });

  describe('Opponent plays Face Cards from seven', () => {
    it('Opponent plays king from seven (Top Card)', () => {
      cy.loadGameFixture(1, {
        p0Hand: [ Card.SEVEN_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [ Card.TEN_OF_HEARTS ],
        p1FaceCards: [],
        topCard: Card.KING_OF_CLUBS,
        secondCard: Card.SIX_OF_DIAMONDS,
      });

      // Opponent plays 7 of clubs
      cy.playOneOffOpponent(Card.SEVEN_OF_CLUBS);
      // Player resolves
      cy.get('[data-cy=cannot-counter-resolve]').should('be.visible')
        .click();
      cy.log('Player resolves (could not counter');

      // Waiting for opponent
      cy.get('#waiting-for-opponent-play-from-deck-scrim').should('be.visible');

      cy.get('[data-top-card=13-0]')
        .should('exist')
        .click({ force: true })
        .should('not.have.class', 'selected');
      cy.get('[data-second-card=6-1]')
        .should('exist')
        .click({ force: true })
        .should('not.have.class', 'selected');
      // No move choices are available from deck on opponent's turn
      cy.get('[data-move-choice]').should('have.length', 0);

      cy.playFaceCardFromSevenOpponent(Card.KING_OF_CLUBS);

      assertGameState(1, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [ Card.KING_OF_CLUBS ],
        p1Hand: [],
        p1Points: [ Card.TEN_OF_HEARTS ],
        p1FaceCards: [],
        scrap: [ Card.SEVEN_OF_CLUBS ],
        topCard: Card.SIX_OF_DIAMONDS,
      });
    }); // end opponent plays king from seven

    it('Opponent plays queen from seven (Second Card)', () => {
      cy.loadGameFixture(1, {
        p0Hand: [ Card.SEVEN_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [ Card.TEN_OF_HEARTS ],
        p1FaceCards: [],
        topCard: Card.SIX_OF_DIAMONDS,
        secondCard: Card.QUEEN_OF_CLUBS,
      });

      // Opponent plays 7 of clubs
      cy.playOneOffOpponent(Card.SEVEN_OF_CLUBS);
      // Player resolves
      cy.get('[data-cy=cannot-counter-resolve]').should('be.visible')
        .click();
      cy.log('Player resolves (could not counter');

      // Waiting for opponent
      cy.get('#waiting-for-opponent-play-from-deck-scrim').should('be.visible');
      // Deck cards appear but are not selectable
      cy.get('[data-second-card=12-0]')
        .should('exist')
        .click({ force: true })
        .should('not.have.class', 'selected');
      cy.get('[data-top-card=6-1]')
        .should('exist')
        .click({ force: true })
        .should('not.have.class', 'selected');
      // No move choices are available from deck on opponent's turn
      cy.get('[data-move-choice]').should('have.length', 0);

      cy.playFaceCardFromSevenOpponent(Card.QUEEN_OF_CLUBS);

      // No longer waiting for opponent
      cy.get('#waiting-for-opponent-play-from-deck-scrim').should('not.exist');
      cy.log('Done waiting for opponent');

      assertGameState(1, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [ Card.QUEEN_OF_CLUBS ],
        p1Hand: [],
        p1Points: [ Card.TEN_OF_HEARTS ],
        p1FaceCards: [],
        scrap: [ Card.SEVEN_OF_CLUBS ],
        topCard: Card.SIX_OF_DIAMONDS,
      });
    }); // end opponent plays queen from seven

    it('Opponent plays eight as glasses from seven (top card)', () => {
      cy.loadGameFixture(1, {
        p0Hand: [ Card.SEVEN_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [ Card.TEN_OF_HEARTS ],
        p1FaceCards: [],
        topCard: Card.EIGHT_OF_CLUBS,
        secondCard: Card.SIX_OF_DIAMONDS,
      });

      // Opponent plays 7 of clubs
      cy.playOneOffOpponent(Card.SEVEN_OF_CLUBS);
      // Player resolves
      cy.get('[data-cy=cannot-counter-resolve]').should('be.visible')
        .click();
      cy.log('Player resolves (could not counter');

      // Waiting for opponent
      cy.get('#waiting-for-opponent-play-from-deck-scrim').should('be.visible');
      // Deck cards appear but are not selectable
      cy.get('[data-top-card=8-0]')
        .should('exist')
        .click({ force: true })
        .should('not.have.class', 'selected');
      cy.get('[data-second-card=6-1]')
        .should('exist')
        .click({ force: true })
        .should('not.have.class', 'selected');
      // No move choices are available from deck on opponent's turn
      cy.get('[data-move-choice]').should('have.length', 0);

      cy.playFaceCardFromSevenOpponent(Card.EIGHT_OF_CLUBS);

      // No longer waiting for opponent
      cy.get('#waiting-for-opponent-play-from-deck-scrim').should('not.exist');
      cy.log('Done waiting for opponent');

      assertGameState(1, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [ Card.EIGHT_OF_CLUBS ],
        p1Hand: [],
        p1Points: [ Card.TEN_OF_HEARTS ],
        p1FaceCards: [],
        scrap: [ Card.SEVEN_OF_CLUBS ],
        topCard: Card.SIX_OF_DIAMONDS,
      });
    }); // end opponent plays eight as glasses from seven
  }); // end opponent seven face card describe

  it('Opponent scuttles from seven (top card)', () => {
    cy.loadGameFixture(1, {
      p0Hand: [ Card.SEVEN_OF_CLUBS ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [ Card.NINE_OF_CLUBS ],
      p1FaceCards: [],
      topCard: Card.TEN_OF_CLUBS,
      secondCard: Card.SIX_OF_DIAMONDS,
    });

    // Opponent plays 7 of clubs
    cy.playOneOffOpponent(Card.SEVEN_OF_CLUBS);
    // Player resolves
    cy.get('[data-cy=cannot-counter-resolve]').should('be.visible')
      .click();
    cy.log('Player resolves (could not counter');

    // Waiting for opponent
    cy.get('#waiting-for-opponent-play-from-deck-scrim').should('be.visible');
    // Deck cards appear but are not selectable
    cy.get('[data-top-card=10-0]')
      .should('exist')
      .click({ force: true })
      .should('not.have.class', 'selected');
    cy.get('[data-second-card=6-1]')
      .should('exist')
      .click({ force: true })
      .should('not.have.class', 'selected');
    // No move choices are available from deck on opponent's turn
    cy.get('[data-move-choice]').should('have.length', 0);

    cy.scuttleFromSevenOpponent(Card.TEN_OF_CLUBS, Card.NINE_OF_CLUBS);

    // No longer waiting for opponent
    cy.get('#waiting-for-opponent-play-from-deck-scrim').should('not.exist');
    cy.log('Done waiting for opponent');

    assertGameState(1, {
      p0Hand: [],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
      scrap: [ Card.SEVEN_OF_CLUBS, Card.TEN_OF_CLUBS, Card.NINE_OF_CLUBS ],
      topCard: Card.SIX_OF_DIAMONDS,
    });
  }); // End opponent scuttles from seven

  describe('Opponent plays one-off from seven', () => {
    it('Opponent plays SIX from seven (top card)', () => {
      cy.loadGameFixture(1, {
        p0Hand: [ Card.SEVEN_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [ Card.QUEEN_OF_CLUBS, Card.KING_OF_HEARTS ],
        topCard: Card.SIX_OF_DIAMONDS,
        secondCard: Card.JACK_OF_CLUBS,
      });

      // Opponent plays 7 of clubs
      cy.playOneOffOpponent(Card.SEVEN_OF_CLUBS);
      // Player resolves
      cy.get('[data-cy=cannot-counter-resolve]').should('be.visible')
        .click();
      cy.log('Player resolves seven of clubs (could not counter');

      // Waiting for opponent
      cy.get('#waiting-for-opponent-play-from-deck-scrim').should('be.visible');
      // Opponent plays 6 of diamonds
      cy.playOneOffFromSevenOpponent(Card.SIX_OF_DIAMONDS);
      cy.log('Player resolves six of diamonds (could not counter');
      cy.get('[data-cy=cannot-counter-resolve]').should('be.visible')
        .click();

      assertGameState(1, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.SIX_OF_DIAMONDS, Card.QUEEN_OF_CLUBS, Card.KING_OF_HEARTS, Card.SEVEN_OF_CLUBS ],
        topCard: Card.JACK_OF_CLUBS,
      });
    });

    it('Opponent plays TWO from seven (second card)', () => {
      cy.loadGameFixture(1, {
        p0Hand: [ Card.SEVEN_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [ Card.KING_OF_HEARTS, Card.QUEEN_OF_CLUBS ],
        topCard: Card.JACK_OF_CLUBS,
        secondCard: Card.TWO_OF_SPADES,
      });

      // Opponent plays 7 of clubs
      cy.playOneOffOpponent(Card.SEVEN_OF_CLUBS);
      // Player resolves
      cy.get('[data-cy=cannot-counter-resolve]').should('be.visible')
        .click();
      cy.log('Player resolves seven of clubs (could not counter');

      // Waiting for opponent
      cy.get('#waiting-for-opponent-play-from-deck-scrim').should('be.visible');

      // Opponent plays two of spades
      cy.playTargetedOneOffFromSevenOpponent(Card.TWO_OF_SPADES, Card.QUEEN_OF_CLUBS, 'faceCard');
      cy.get('[data-cy=cannot-counter-resolve]').should('be.visible')
        .click();

      assertGameState(1, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [ Card.KING_OF_HEARTS ],
        scrap: [ Card.QUEEN_OF_CLUBS, Card.TWO_OF_SPADES, Card.SEVEN_OF_CLUBS ],
        topCard: Card.JACK_OF_CLUBS,
      });
    }); // End Opponent TWO from seven

    it('Opponent plays TWO on jacks from seven (top card)', () => {
      cy.loadGameFixture(1, {
        p0Hand: [ Card.SEVEN_OF_CLUBS, Card.ACE_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.JACK_OF_CLUBS ],
        p1Points: [],
        p1FaceCards: [ Card.KING_OF_HEARTS ],
        topCard: Card.TWO_OF_CLUBS,
        secondCard: Card.FOUR_OF_CLUBS,
      });

      cy.playPointsOpponent(Card.ACE_OF_CLUBS);

      // Player plays jack
      cy.get('[data-player-hand-card=11-0]').click();
      cy.get('[data-move-choice=jack]').click();
      cy.get('[data-opponent-point-card=1-0]').click();

      assertGameState(1, {
        p0Hand: [ Card.SEVEN_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [ Card.ACE_OF_CLUBS ],
        p1FaceCards: [ Card.KING_OF_HEARTS ],
      });

      // Opponent plays 7 of clubs
      cy.playOneOffOpponent(Card.SEVEN_OF_CLUBS);
      // Player resolves
      cy.get('[data-cy=cannot-counter-resolve]').should('be.visible')
        .click();
      cy.log('Player resolves seven of clubs (could not counter');

      // Waiting for opponent
      cy.get('#waiting-for-opponent-play-from-deck-scrim').should('be.visible');

      cy.playTargetedOneOffFromSevenOpponent(Card.TWO_OF_CLUBS, Card.JACK_OF_CLUBS, 'jack');

      // Player resolves
      cy.get('[data-cy=cannot-counter-resolve]').should('be.visible')
        .click();

      assertGameState(1, {
        p0Hand: [],
        p0Points: [ Card.ACE_OF_CLUBS ],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [ Card.KING_OF_HEARTS ],
        scrap: [ Card.JACK_OF_CLUBS, Card.TWO_OF_CLUBS, Card.SEVEN_OF_CLUBS ],
        topCard: Card.FOUR_OF_CLUBS,
      });
    });

    it('Opponent plays NINE from seven (top card)', () => {
      cy.loadGameFixture(1, {
        p0Hand: [ Card.SEVEN_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [ Card.KING_OF_HEARTS, Card.QUEEN_OF_CLUBS ],
        topCard: Card.NINE_OF_DIAMONDS,
        secondCard: Card.TWO_OF_SPADES,
      });

      // Opponent plays 7 of clubs
      cy.playOneOffOpponent(Card.SEVEN_OF_CLUBS);
      // Player resolves
      cy.get('[data-cy=cannot-counter-resolve]').should('be.visible')
        .click();
      cy.log('Player resolves seven of clubs (could not counter');

      // Waiting for opponent
      cy.get('#waiting-for-opponent-play-from-deck-scrim').should('be.visible');

      cy.playTargetedOneOffFromSevenOpponent(Card.NINE_OF_DIAMONDS, Card.QUEEN_OF_CLUBS, 'faceCard');
      cy.get('[data-cy=cannot-counter-resolve]').should('be.visible')
        .click();

      assertGameState(1, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.QUEEN_OF_CLUBS ],
        p1Points: [],
        p1FaceCards: [ Card.KING_OF_HEARTS ],
        scrap: [ Card.NINE_OF_DIAMONDS, Card.SEVEN_OF_CLUBS ],
        topCard: Card.TWO_OF_SPADES,
      });
    }); // End Opponent NINE from seven

    it('Opponent plays NINE on jacks from seven (second card)', () => {
      cy.loadGameFixture(1, {
        p0Hand: [ Card.SEVEN_OF_CLUBS, Card.ACE_OF_CLUBS, Card.TEN_OF_DIAMONDS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.JACK_OF_CLUBS ],
        p1Points: [],
        p1FaceCards: [ Card.KING_OF_HEARTS ],
        topCard: Card.FOUR_OF_CLUBS,
        secondCard: Card.NINE_OF_CLUBS,
      });

      cy.playPointsOpponent(Card.ACE_OF_CLUBS);

      // player plays jack
      cy.get('[data-player-hand-card=11-0]').click();
      cy.get('[data-move-choice=jack]').click();
      cy.get('[data-opponent-point-card=1-0]').click();

      assertGameState(1, {
        p0Hand: [ Card.SEVEN_OF_CLUBS, Card.TEN_OF_DIAMONDS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [ Card.ACE_OF_CLUBS ],
        p1FaceCards: [ Card.KING_OF_HEARTS ],
      });

      // Opponent plays 7 of clubs
      cy.playOneOffOpponent(Card.SEVEN_OF_CLUBS);
      // Player resolves
      cy.get('[data-cy=cannot-counter-resolve]').should('be.visible')
        .click();
      cy.log('Player resolves seven of clubs (could not counter');

      // Waiting for opponent
      cy.get('#waiting-for-opponent-play-from-deck-scrim').should('be.visible');

      cy.playTargetedOneOffFromSevenOpponent(Card.NINE_OF_CLUBS, Card.JACK_OF_CLUBS, 'jack');

      // Player resolves
      cy.get('[data-cy=cannot-counter-resolve]').should('be.visible')
        .click();

      assertGameState(1, {
        p0Hand: [ Card.TEN_OF_DIAMONDS ],
        p0Points: [ Card.ACE_OF_CLUBS ],
        p0FaceCards: [],
        p1Hand: [ Card.JACK_OF_CLUBS ],
        p1Points: [],
        p1FaceCards: [ Card.KING_OF_HEARTS ],
        scrap: [ Card.NINE_OF_CLUBS, Card.SEVEN_OF_CLUBS ],
        topCard: Card.FOUR_OF_CLUBS,
      });

      // player plays the returned jack immediately
      cy.get('[data-player-hand-card=11-0]').click();
      // Frozen move choice cards should be disabled and display frozen text.
      cy.get('[data-move-choice=jack]')
        .should('have.class', 'v-card--disabled')
        .contains('This card is frozen')
        .click({ force: true }); // Break out into separate test case
      cy.get('[data-opponent-point-card=1-0]').click();
      assertSnackbar(SnackBarError.FROZEN_CARD);
      cy.log('Successfully prevented player from playing the jack while it is frozen');

      // Player draws
      cy.get('#deck').click();

      assertGameState(1, {
        p0Hand: [ Card.TEN_OF_DIAMONDS ],
        p0Points: [ Card.ACE_OF_CLUBS ],
        p0FaceCards: [],
        p1Hand: [ Card.JACK_OF_CLUBS, Card.FOUR_OF_CLUBS ],
        p1Points: [],
        p1FaceCards: [ Card.KING_OF_HEARTS ],
        scrap: [ Card.NINE_OF_CLUBS, Card.SEVEN_OF_CLUBS ],
      });

      cy.playPointsOpponent(Card.TEN_OF_DIAMONDS);
      cy.get('[data-player-hand-card]').should('have.length', 2);

      // Player plays the returned jack
      cy.get('[data-player-hand-card=11-0]').click();
      cy.get('[data-move-choice=jack]').click();
      cy.get('[data-opponent-point-card=1-0]').click();

      assertGameState(1, {
        p0Hand: [],
        p0Points: [ Card.TEN_OF_DIAMONDS ],
        p0FaceCards: [],
        p1Hand: [ Card.FOUR_OF_CLUBS ],
        p1Points: [ Card.ACE_OF_CLUBS ],
        p1FaceCards: [ Card.KING_OF_HEARTS ],
        scrap: [ Card.NINE_OF_CLUBS, Card.SEVEN_OF_CLUBS ],
      });
    });
  });
});
