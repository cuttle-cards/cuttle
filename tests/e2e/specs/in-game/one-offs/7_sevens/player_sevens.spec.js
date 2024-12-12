import { assertGameState, assertSnackbar } from '../../../../support/helpers';
import { Card } from '../../../../fixtures/cards';
import { SnackBarError } from '../../../../fixtures/snackbarError';

describe('Playing SEVENS', () => {
  beforeEach(() => {
    cy.setupGameAsP0();
  });

  it('Plays points from a seven', () => {
    cy.loadGameFixture(0, {
      p0Hand: [ Card.SEVEN_OF_CLUBS ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
      topCard: Card.FOUR_OF_CLUBS,
      secondCard: Card.SIX_OF_DIAMONDS,
    });

    cy.playOneOffAndResolveAsPlayer(Card.SEVEN_OF_CLUBS);

    cy.get('[data-top-card=4-0]').should('exist')
      .and('be.visible');
    cy.get('[data-second-card=6-1]').should('exist')
      .and('be.visible')
      .click();

    cy.get('[data-move-choice=points]').click();

    assertGameState(0, {
      p0Hand: [],
      p0Points: [ Card.SIX_OF_DIAMONDS ],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
      scrap: [ Card.SEVEN_OF_CLUBS ],
      topCard: Card.FOUR_OF_CLUBS,
    });
  });

  it('Plays jack from a seven', () => {
    cy.loadGameFixture(0, {
      p0Hand: [ Card.SEVEN_OF_CLUBS ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [ Card.TEN_OF_HEARTS ],
      p1FaceCards: [],
      topCard: Card.JACK_OF_CLUBS,
      secondCard: Card.SIX_OF_DIAMONDS,
    });

    cy.playOneOffAndResolveAsPlayer(Card.SEVEN_OF_CLUBS);

    cy.get('[data-second-card=6-1]').should('exist')
      .and('be.visible');
    cy.get('[data-top-card=11-0]').should('exist')
      .and('be.visible')
      .click();
    cy.get('[data-move-choice=jack]').click();
    cy.get('[data-opponent-point-card=10-2]').click();

    assertGameState(0, {
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

  it('Cannot play jack from a seven if opponent has queen', () => {
    cy.loadGameFixture(0, {
      p0Hand: [ Card.SEVEN_OF_CLUBS ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [ Card.TEN_OF_HEARTS ],
      p1FaceCards: [ Card.QUEEN_OF_CLUBS ],
      topCard: Card.JACK_OF_CLUBS,
      secondCard: Card.SIX_OF_DIAMONDS,
    });

    cy.playOneOffAndResolveAsPlayer(Card.SEVEN_OF_CLUBS);

    cy.get('[data-second-card=6-1]').should('exist')
      .and('be.visible');
    cy.get('[data-top-card=11-0]').should('exist')
      .and('be.visible')
      .click();
    cy.get('[data-move-choice=jack]')
      .should('have.class', 'v-card--disabled')
      .should('contain', "You cannot jack your opponent's points while they have a queen")
      .click({ force: true });
    cy.get('#player-hand-targeting').should('be.visible');
    cy.get('[data-opponent-point-card=10-2]').click();
    assertSnackbar('You cannot use a Jack while your opponent has a Queen.');

    cy.get('[data-second-card=6-1]').should('exist')
      .and('be.visible')
      .click();

    cy.get('[data-move-choice=points]').click();

    assertGameState(0, {
      p0Hand: [],
      p0Points: [ Card.SIX_OF_DIAMONDS ],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [ Card.TEN_OF_HEARTS ],
      p1FaceCards: [ Card.QUEEN_OF_CLUBS ],
      scrap: [ Card.SEVEN_OF_CLUBS ],
      topCard: Card.JACK_OF_CLUBS,
    });
  });

  it('Resets state after conceding during 7 resolve', () => {
    cy.skipOnGameStateApi();
    cy.loadGameFixture(0, {
      p0Hand: [ Card.SEVEN_OF_CLUBS ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [ Card.NINE_OF_CLUBS ],
      p1FaceCards: [],
      topCard: Card.NINE_OF_DIAMONDS,
      secondCard: Card.SIX_OF_DIAMONDS,
    });

    cy.playOneOffAndResolveAsPlayer(Card.SEVEN_OF_CLUBS);
    cy.get('#waiting-for-opponent-counter-scrim').should('not.exist');
    cy.get('[data-second-card=6-1]').should('exist')
      .and('be.visible');
    cy.get('#game-menu-activator').click();
    cy.get('[data-cy=concede-initiate]').click();
    cy.get('[data-cy=request-gameover-confirm]').click();
    cy.get('[data-cy=gameover-rematch]').click();
    cy.url().then((url) => {
      const oldGameId = Number(url.split('/').pop());
      cy.rematchAndJoinRematchOpponent({ gameId: oldGameId });
    });
    cy.get('#deck').should('not.have.class', 'reveal-top-two');
  });

  describe('Plays jack from a seven - special case', () => {
    it('Plays jack from a seven - special case - double jacks with some points to steal should work as normal', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.SEVEN_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.ACE_OF_CLUBS ],
        p1Points: [ Card.SIX_OF_DIAMONDS ],
        p1FaceCards: [],
        topCard: Card.JACK_OF_CLUBS,
        secondCard: Card.JACK_OF_DIAMONDS,
      });

      cy.playOneOffAndResolveAsPlayer(Card.SEVEN_OF_CLUBS);

      cy.get('[data-second-card=11-1]').should('exist')
        .and('be.visible');
      cy.get('[data-top-card=11-0]').should('exist')
        .and('be.visible')
        .click();
      cy.get('[data-move-choice=jack]').click();
      cy.get('[data-opponent-point-card=6-1]').click();

      assertGameState(0, {
        p0Hand: [],
        p0Points: [ Card.SIX_OF_DIAMONDS ],
        p0FaceCards: [],
        p1Hand: [ Card.ACE_OF_CLUBS ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.SEVEN_OF_CLUBS ],
        topCard: Card.JACK_OF_DIAMONDS,
      });
    });

    it('Plays jack from a seven - special case - double jacks with some points to steal but opponent has queen', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.SEVEN_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.ACE_OF_CLUBS ],
        p1Points: [ Card.SIX_OF_DIAMONDS ],
        p1FaceCards: [ Card.QUEEN_OF_CLUBS ],
        topCard: Card.JACK_OF_CLUBS,
        secondCard: Card.JACK_OF_DIAMONDS,
      });

      cy.playOneOffAndResolveAsPlayer(Card.SEVEN_OF_CLUBS);

      cy.get('#seven-double-jacks-dialog')
        .should('be.visible')
        .should('contain', 'Oops')
        .get('[data-seven-double-jacks-dialog-card=11-0]')
        .click();

      cy.get('[data-cy=seven-double-jacks-resolve]').click();

      assertGameState(0, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.ACE_OF_CLUBS ],
        p1Points: [ Card.SIX_OF_DIAMONDS ],
        p1FaceCards: [ Card.QUEEN_OF_CLUBS ],
        scrap: [ Card.SEVEN_OF_CLUBS, Card.JACK_OF_CLUBS ],
        topCard: Card.JACK_OF_DIAMONDS,
      });

      // see if opponent can still make moves
      cy.playPointsOpponent(Card.ACE_OF_CLUBS);

      assertGameState(0, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [ Card.SIX_OF_DIAMONDS, Card.ACE_OF_CLUBS ],
        p1FaceCards: [ Card.QUEEN_OF_CLUBS ],
        scrap: [ Card.SEVEN_OF_CLUBS, Card.JACK_OF_CLUBS ],
      });
    });

    it('Plays jack from a seven - special case - double jacks with no points to steal', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.SEVEN_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.ACE_OF_CLUBS ],
        p1Points: [],
        p1FaceCards: [],
        topCard: Card.JACK_OF_CLUBS,
        secondCard: Card.JACK_OF_DIAMONDS,
      });

      cy.playOneOffAndResolveAsPlayer(Card.SEVEN_OF_CLUBS);

      cy.get('#seven-double-jacks-dialog')
        .should('be.visible')
        .should('contain', 'Oops')
        .get('[data-seven-double-jacks-dialog-card=11-0]')
        .click();

      cy.get('[data-cy=seven-double-jacks-resolve]').click();

      assertGameState(0, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.ACE_OF_CLUBS ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.SEVEN_OF_CLUBS, Card.JACK_OF_CLUBS ],
        topCard: Card.JACK_OF_DIAMONDS,
      });

      // see if opponent can still make moves
      cy.playPointsOpponent(Card.ACE_OF_CLUBS);

      assertGameState(0, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [ Card.ACE_OF_CLUBS ],
        p1FaceCards: [],
        scrap: [ Card.SEVEN_OF_CLUBS, Card.JACK_OF_CLUBS ],
      });
    });

    it('Plays jack from a seven - special case - final card in deck is a jack with with no points on the board', () => {
      cy.setupGameAsP1();
      cy.loadGameFixture(1, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.SEVEN_OF_CLUBS ],
        p1Points: [],
        p1FaceCards: [],
        topCard: Card.FOUR_OF_HEARTS,
        secondCard: Card.JACK_OF_CLUBS,
        deck: [],
      });

      cy.get('#deck').should('contain', 2);

      cy.drawCardOpponent();

      cy.playOneOffAndResolveAsPlayer(Card.SEVEN_OF_CLUBS);

      cy.get('#seven-double-jacks-dialog')
        .should('be.visible')
        .should('contain', 'Oops')
        .find('[data-seven-double-jacks-dialog-card]')
        .should('have.length', 1)
        .get('[data-seven-double-jacks-dialog-card=11-0]')
        .click();

      cy.get('[data-cy=seven-double-jacks-resolve]').click();

      assertGameState(1, {
        p0Hand: [ Card.FOUR_OF_HEARTS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.SEVEN_OF_CLUBS, Card.JACK_OF_CLUBS, Card.ACE_OF_CLUBS, Card.TWO_OF_CLUBS, Card.THREE_OF_CLUBS,
          Card.FOUR_OF_CLUBS, Card.FIVE_OF_CLUBS, Card.SIX_OF_CLUBS, Card.EIGHT_OF_CLUBS, Card.NINE_OF_CLUBS,
          Card.TEN_OF_CLUBS, Card.QUEEN_OF_CLUBS, Card.KING_OF_CLUBS, Card.ACE_OF_DIAMONDS, Card.TWO_OF_DIAMONDS,
          Card.THREE_OF_DIAMONDS, Card.FOUR_OF_DIAMONDS, Card.FIVE_OF_DIAMONDS, Card.SIX_OF_DIAMONDS,
          Card.SEVEN_OF_DIAMONDS, Card.EIGHT_OF_DIAMONDS, Card.NINE_OF_DIAMONDS, Card.TEN_OF_DIAMONDS,
          Card.JACK_OF_DIAMONDS, Card.QUEEN_OF_DIAMONDS, Card.KING_OF_DIAMONDS, Card.ACE_OF_HEARTS, Card.TWO_OF_HEARTS,
          Card.THREE_OF_HEARTS, Card.FIVE_OF_HEARTS, Card.SIX_OF_HEARTS, Card.SEVEN_OF_HEARTS, Card.EIGHT_OF_HEARTS,
          Card.NINE_OF_HEARTS, Card.TEN_OF_HEARTS, Card.JACK_OF_HEARTS, Card.QUEEN_OF_HEARTS, Card.KING_OF_HEARTS,
          Card.ACE_OF_SPADES, Card.TWO_OF_SPADES, Card.THREE_OF_SPADES, Card.FOUR_OF_SPADES, Card.FIVE_OF_SPADES,
          Card.SIX_OF_SPADES, Card.SEVEN_OF_SPADES, Card.EIGHT_OF_SPADES, Card.NINE_OF_SPADES, Card.TEN_OF_SPADES,
          Card.JACK_OF_SPADES, Card.QUEEN_OF_SPADES, Card.KING_OF_SPADES ],
      });

      cy.get('#deck').find('#empty-deck-text')
        .should('contain', 'PASS');

      cy.get('#turn-indicator').contains("OPPONENT'S TURN");
    });
  });

  describe('Plays face cards from a seven', () => {
    it('Plays king from a seven', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.SEVEN_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [ Card.TEN_OF_HEARTS ],
        p1FaceCards: [],
        topCard: Card.SIX_OF_CLUBS,
        secondCard: Card.KING_OF_CLUBS,
      });

      cy.playOneOffAndResolveAsPlayer(Card.SEVEN_OF_CLUBS);

      cy.get('[data-top-card=6-0]').should('exist')
        .and('be.visible');
      cy.get('[data-second-card=13-0]').should('exist')
        .and('be.visible')
        .click();

      cy.get('[data-move-choice=faceCard]').click();

      assertGameState(0, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [ Card.KING_OF_CLUBS ],
        p1Hand: [],
        p1Points: [ Card.TEN_OF_HEARTS ],
        p1FaceCards: [],
        scrap: [ Card.SEVEN_OF_CLUBS ],
        topCard: Card.SIX_OF_CLUBS,
      });
    }); // End seven king test

    it('Plays queen from a seven', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.SEVEN_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [ Card.TEN_OF_HEARTS ],
        p1FaceCards: [],
        topCard: Card.SIX_OF_CLUBS,
        secondCard: Card.QUEEN_OF_CLUBS,
      });

      cy.playOneOffAndResolveAsPlayer(Card.SEVEN_OF_CLUBS);

      cy.get('[data-top-card=6-0]').should('exist')
        .and('be.visible');
      cy.get('[data-second-card=12-0]').should('exist')
        .and('be.visible')
        .click();

      cy.get('[data-move-choice=faceCard]').click();

      assertGameState(0, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [ Card.QUEEN_OF_CLUBS ],
        p1Hand: [],
        p1Points: [ Card.TEN_OF_HEARTS ],
        p1FaceCards: [],
        scrap: [ Card.SEVEN_OF_CLUBS ],
        topCard: Card.SIX_OF_CLUBS,
      });
    }); // End seven queen test

    it('Plays 8 as face card from a seven', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.SEVEN_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.TWO_OF_CLUBS ],
        p1Points: [ Card.TEN_OF_HEARTS ],
        p1FaceCards: [],
        topCard: Card.SIX_OF_CLUBS,
        secondCard: Card.EIGHT_OF_CLUBS,
      });

      cy.playOneOffAndResolveAsPlayer(Card.SEVEN_OF_CLUBS);

      cy.get('[data-top-card=6-0]').should('exist')
        .and('be.visible');
      cy.get('[data-second-card=8-0]').should('exist')
        .and('be.visible')
        .click();
      cy.get('[data-move-choice=faceCard]').click();

      assertGameState(0, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [ Card.EIGHT_OF_CLUBS ],
        p1Hand: [ Card.TWO_OF_CLUBS ],
        p1Points: [ Card.TEN_OF_HEARTS ],
        p1FaceCards: [],
        scrap: [ Card.SEVEN_OF_CLUBS ],
        topCard: Card.SIX_OF_CLUBS,
      });
    }); // End seven glasses test
  }); // End seven face card describe

  describe('Scuttling with sevens', () => {
    it('Scuttles from a seven', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.SEVEN_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [ Card.NINE_OF_CLUBS ],
        p1FaceCards: [],
        topCard: Card.TEN_OF_CLUBS,
        secondCard: Card.SIX_OF_DIAMONDS,
      });

      cy.playOneOffAndResolveAsPlayer(Card.SEVEN_OF_CLUBS);

      cy.get('#waiting-for-opponent-counter-scrim').should('not.exist');
      cy.get('[data-second-card=6-1]').should('exist')
        .and('be.visible');
      cy.get('[data-top-card=10-0]').click();
      cy.get('[data-move-choice=scuttle]').click();
      // scuttles with 10 of clubs
      cy.get('[data-opponent-point-card=9-0]').click();

      assertGameState(0, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.SEVEN_OF_CLUBS, Card.TEN_OF_CLUBS, Card.NINE_OF_CLUBS ],
        topCard: Card.SIX_OF_DIAMONDS,
      });
    }); // End scuttle from seven

    it('Scuttles using a NINE from a SEVEN', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.SEVEN_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [ Card.NINE_OF_CLUBS ],
        p1FaceCards: [],
        topCard: Card.NINE_OF_DIAMONDS,
        secondCard: Card.SIX_OF_DIAMONDS,
      });

      cy.playOneOffAndResolveAsPlayer(Card.SEVEN_OF_CLUBS);

      cy.get('#waiting-for-opponent-counter-scrim').should('not.exist');
      cy.get('[data-second-card=6-1]').should('exist')
        .and('be.visible');
      cy.get('[data-top-card=9-1]').click();
      cy.get('[data-move-choice=scuttle]').click();
      // scuttles with nine of diamonds
      cy.get('[data-opponent-point-card=9-0]').click();

      assertGameState(0, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.SEVEN_OF_CLUBS, Card.NINE_OF_DIAMONDS, Card.NINE_OF_CLUBS ],
        topCard: Card.SIX_OF_DIAMONDS,
      });
    }); // End scuttle with NINE from seven

    it('Prevents illegal scuttles via sevens', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.SEVEN_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [ Card.TWO_OF_HEARTS, Card.FIVE_OF_SPADES, Card.NINE_OF_CLUBS ],
        p1FaceCards: [],
        topCard: Card.FIVE_OF_DIAMONDS,
        secondCard: Card.ACE_OF_SPADES,
      });

      // Player plays SEVEN one-off
      cy.playOneOffAndResolveAsPlayer(Card.SEVEN_OF_CLUBS);
      cy.get('#waiting-for-opponent-counter-scrim').should('not.exist');

      // Scuttle is disabled for card too small to scuttle anything on the board
      cy.get('[data-second-card=1-3]').click();
      cy.get('[data-move-choice=scuttle]').should('have.class', 'v-card--disabled');
      cy.get('[data-cy=cancel-move]').click();

      // Illegal Scuttle - lower rank
      cy.get('[data-top-card=5-1]').click();
      cy.get('[data-move-choice=scuttle]').click();
      cy.get('[data-opponent-point-card=9-0]').click({ force: true });
      assertSnackbar(SnackBarError.ILLEGAL_SCUTTLE);

      // Illegal Scuttle - same rank, lower suit
      cy.get('[data-top-card=5-1]').click();
      cy.get('[data-move-choice=scuttle]').click();
      cy.get('[data-opponent-point-card=5-3]').click();
      assertSnackbar(SnackBarError.ILLEGAL_SCUTTLE);
    });
  }); // End seven scuttle describe()

  describe('Playing untargeted one-offs from a seven', () => {
    it('Plays an ACE from a seven', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.SEVEN_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [ Card.SEVEN_OF_SPADES, Card.TEN_OF_SPADES ],
        p1FaceCards: [],
        topCard: Card.JACK_OF_CLUBS,
        secondCard: Card.ACE_OF_DIAMONDS,
      });

      cy.playOneOffAndResolveAsPlayer(Card.SEVEN_OF_CLUBS);

      // Play Ace of diamonds
      cy.get('[data-top-card=11-0]').should('exist')
        .and('be.visible');
      cy.get('[data-second-card=1-1]').should('exist')
        .and('be.visible')
        .click();
      cy.get('[data-move-choice=oneOff]').click();
      cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
      // Opponent does not counter (resolves stack)
      cy.resolveOpponent();
      cy.get('#waiting-for-opponent-counter-scrim').should('not.exist');

      assertGameState(0, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.SEVEN_OF_CLUBS, Card.SEVEN_OF_SPADES, Card.TEN_OF_SPADES, Card.ACE_OF_DIAMONDS ],
        topCard: Card.JACK_OF_CLUBS,
      });
    });

    it('Cannot play 4 from seven when opponent has no cards in hand', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.SEVEN_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [ Card.SEVEN_OF_SPADES, Card.TEN_OF_SPADES ],
        p1FaceCards: [],
        topCard: Card.FOUR_OF_HEARTS,
        secondCard: Card.ACE_OF_DIAMONDS,
      });

      // Play seven of clubs
      cy.playOneOffAndResolveAsPlayer(Card.SEVEN_OF_CLUBS);

      // Play Four of hearts
      cy.get('[data-top-card=4-2]').should('exist')
        .and('be.visible')
        .click();
      cy.get('[data-move-choice=oneOff]').click();

      // Should not allow playing 4 as one-off
      cy.get('#waiting-for-opponent-counter-scrim').should('not.exist');
      cy.get('#waiting-for-opponent-discard-scrim').should('not.exist');
      assertSnackbar(SnackBarError.ONE_OFF.FOUR_EMPTY_HAND);
    });
  }); // End player seven one-off describe

  describe('Playing targeted one-offs from a seven', () => {
    it('Plays topCard TWO from a seven', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.SEVEN_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [ Card.KING_OF_HEARTS, Card.QUEEN_OF_CLUBS ],
        topCard: Card.TWO_OF_SPADES,
        secondCard: Card.JACK_OF_CLUBS,
      });

      cy.playOneOffAndResolveAsPlayer(Card.SEVEN_OF_CLUBS);

      // Play two of spades
      cy.get('[data-top-card=2-3]').should('exist')
        .and('be.visible')
        .click();
      cy.get('[data-move-choice=targetedOneOff]').click();
      cy.get('#player-hand-targeting').should('be.visible');
      // target queen of clubs
      cy.get('[data-opponent-face-card=12-0]').click();
      cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
      // Opponent does not counter (resolves stack)
      cy.resolveOpponent();
      cy.get('#waiting-for-opponent-counter-scrim').should('not.exist');

      assertGameState(0, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [ Card.KING_OF_HEARTS ],
        scrap: [ Card.QUEEN_OF_CLUBS, Card.TWO_OF_SPADES, Card.SEVEN_OF_CLUBS ],
        topCard: Card.JACK_OF_CLUBS,
      });
    }); // End playing topCard TWO from seven

    it('Plays secondCard TWO from a seven', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.SEVEN_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [ Card.KING_OF_HEARTS, Card.QUEEN_OF_CLUBS ],
        topCard: Card.JACK_OF_CLUBS,
        secondCard: Card.TWO_OF_SPADES,
      });

      cy.playOneOffAndResolveAsPlayer(Card.SEVEN_OF_CLUBS);

      // Play two of spades
      cy.get('[data-second-card=2-3]').should('exist')
        .and('be.visible')
        .click();
      cy.get('[data-move-choice=targetedOneOff]').click();
      cy.get('#player-hand-targeting').should('be.visible');
      // target queen of clubs
      cy.get('[data-opponent-face-card=12-0]').click();
      cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
      // Opponent does not counter (resolves stack)
      cy.resolveOpponent();
      cy.get('#waiting-for-opponent-counter-scrim').should('not.exist');

      assertGameState(0, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [ Card.KING_OF_HEARTS ],
        scrap: [ Card.QUEEN_OF_CLUBS, Card.TWO_OF_SPADES, Card.SEVEN_OF_CLUBS ],
        topCard: Card.JACK_OF_CLUBS,
      });
    }); // End playing topCard TWO from seven

    it('Plays TWO on jacks from a seven', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.SEVEN_OF_CLUBS, Card.ACE_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.JACK_OF_CLUBS ],
        p1Points: [],
        p1FaceCards: [ Card.KING_OF_HEARTS ],
        topCard: Card.FOUR_OF_CLUBS,
        secondCard: Card.TWO_OF_SPADES,
      });

      cy.get('[data-player-hand-card=1-0]').click();
      cy.get('[data-move-choice=points]').click();

      cy.get('[data-player-hand-card]').should('have.length', 1);

      // Opponent plays jack
      cy.playJackOpponent(Card.JACK_OF_CLUBS, Card.ACE_OF_CLUBS);

      assertGameState(0, {
        p0Hand: [ Card.SEVEN_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [ Card.ACE_OF_CLUBS ],
        p1FaceCards: [ Card.KING_OF_HEARTS ],
      });

      cy.playOneOffAndResolveAsPlayer(Card.SEVEN_OF_CLUBS);

      // Play two of spades
      cy.get('[data-second-card=2-3]').should('exist')
        .and('be.visible')
        .click();
      cy.get('[data-move-choice=targetedOneOff]').click();
      // target jack of clubs
      cy.get('[data-opponent-face-card=11-0]').click();
      cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
      // Opponent does not counter (resolves stack)
      cy.resolveOpponent();
      cy.get('#waiting-for-opponent-counter-scrim').should('not.exist');

      assertGameState(0, {
        p0Hand: [],
        p0Points: [ Card.ACE_OF_CLUBS ],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [ Card.KING_OF_HEARTS ],
        scrap: [ Card.JACK_OF_CLUBS, Card.TWO_OF_SPADES, Card.SEVEN_OF_CLUBS ],
        topCard: Card.FOUR_OF_CLUBS,
      });
    }); // End playing TWO on jacks from a seven

    it('Plays a NINE from a seven', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.SEVEN_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [ Card.KING_OF_HEARTS, Card.QUEEN_OF_CLUBS ],
        topCard: Card.NINE_OF_DIAMONDS,
        secondCard: Card.TWO_OF_SPADES,
      });

      cy.playOneOffAndResolveAsPlayer(Card.SEVEN_OF_CLUBS);

      // Play Nine of diamonds
      cy.get('[data-top-card=9-1]').should('exist')
        .and('be.visible')
        .click();
      cy.get('[data-move-choice=targetedOneOff]').click();
      // target queen of clubs
      cy.get('[data-opponent-face-card=12-0]').find('.valid-move')
        .click({ force: true }); // force because overlay itself is not techincally clickable
      cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
      // Opponent does not counter (resolves stack)
      cy.resolveOpponent();
      cy.get('#waiting-for-opponent-counter-scrim').should('not.exist');

      assertGameState(0, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.QUEEN_OF_CLUBS ],
        p1Points: [],
        p1FaceCards: [ Card.KING_OF_HEARTS ],
        scrap: [ Card.NINE_OF_DIAMONDS, Card.SEVEN_OF_CLUBS ],
        topCard: Card.TWO_OF_SPADES,
      });
    }); // End playing NINE from seven

    it('Plays NINE on jacks from a seven', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.SEVEN_OF_CLUBS, Card.ACE_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.JACK_OF_CLUBS ],
        p1Points: [],
        p1FaceCards: [ Card.KING_OF_HEARTS ],
        topCard: Card.NINE_OF_DIAMONDS,
        secondCard: Card.TWO_OF_SPADES,
      });

      cy.get('[data-player-hand-card=1-0]').click();
      cy.get('[data-move-choice=points]').click();

      cy.get('[data-player-hand-card]').should('have.length', 1);

      // Opponent plays jack
      cy.playJackOpponent(Card.JACK_OF_CLUBS, Card.ACE_OF_CLUBS);

      assertGameState(0, {
        p0Hand: [ Card.SEVEN_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [ Card.ACE_OF_CLUBS ],
        p1FaceCards: [ Card.KING_OF_HEARTS ],
      });

      cy.playOneOffAndResolveAsPlayer(Card.SEVEN_OF_CLUBS);

      // Play Nine of diamonds
      cy.get('[data-top-card=9-1]').should('exist')
        .and('be.visible')
        .click();
      cy.get('[data-move-choice=targetedOneOff]').click();
      // target jack of clubs
      cy.get('[data-opponent-face-card=11-0]').find('.valid-move')
        .click({ force: true }); // force b/c overlay itself is not technically clickable
      cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
      // Opponent does not counter (resolves stack)
      cy.resolveOpponent();
      cy.get('#waiting-for-opponent-counter-scrim').should('not.exist');

      assertGameState(0, {
        p0Hand: [],
        p0Points: [ Card.ACE_OF_CLUBS ],
        p0FaceCards: [],
        p1Hand: [ Card.JACK_OF_CLUBS ],
        p1Points: [],
        p1FaceCards: [ Card.KING_OF_HEARTS ],
        scrap: [ Card.NINE_OF_DIAMONDS, Card.SEVEN_OF_CLUBS ],
        topCard: Card.TWO_OF_SPADES,
      });
    }); // End playing NINE on jacks from a seven

    it('Disables move choices when selecting card in hand while resolving seven', () => {
      cy.setupGameAsP0();
      cy.loadGameFixture(0, {
        p0Hand: [ Card.SEVEN_OF_CLUBS, Card.TWO_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [ Card.TEN_OF_CLUBS ],
        p1FaceCards: [ Card.KING_OF_CLUBS ],
        topCard: Card.FOUR_OF_DIAMONDS,
        secondCard: Card.NINE_OF_CLUBS,
      });

      cy.playOneOffAndResolveAsPlayer(Card.SEVEN_OF_CLUBS);

      cy.get('[data-second-card=9-0]').should('exist')
        .and('be.visible');
      cy.get('[data-top-card=4-1]').should('exist')
        .and('be.visible');

      cy.get('[data-player-hand-card=2-0]').click();

      cy.get('[data-move-choice=points]')
        .should('have.class', 'v-card--disabled')
        .contains('You must play one of the top two cards from the deck');

      cy.get('[data-move-choice=scuttle]')
        .should('have.class', 'v-card--disabled')
        .contains('You must play one of the top two cards from the deck');

      cy.get('[data-move-choice=targetedOneOff]')
        .should('have.class', 'v-card--disabled')
        .contains('You must play one of the top two cards from the deck');
    }); // End disables moves choices
  }); // End player seven targeted one-off describe
});
