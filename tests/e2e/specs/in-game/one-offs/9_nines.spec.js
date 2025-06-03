import { assertGameState, assertSnackbar } from '../../../support/helpers';
import { Card } from '../../../fixtures/cards';
import { SnackBarError } from '../../../fixtures/snackbarError';

describe('Playing NINES', () => {
  describe('Player Playing NINES', () => {
    beforeEach(() => {
      cy.setupGameAsP0();
    });

    it('Plays a nine to SCUTTLE a lower point card', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.NINE_OF_SPADES, Card.NINE_OF_HEARTS ],
        p0Points: [ Card.TEN_OF_HEARTS ],
        p0FaceCards: [],
        p1Hand: [ Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS ],
        p1Points: [ Card.ACE_OF_DIAMONDS ],
        p1FaceCards: [],
      });

      // Player plays nine
      cy.get('[data-player-hand-card=9-3]').click(); // nine of spades
      cy.get('[data-move-choice=scuttle]').click();
      cy.get('#player-hand-targeting').should('be.visible');
      cy.get('[data-opponent-point-card=1-1]').click(); // ace of diamonds

      assertGameState(0, {
        p0Hand: [ Card.NINE_OF_HEARTS ],
        p0Points: [ Card.TEN_OF_HEARTS ],
        p0FaceCards: [],
        p1Hand: [ Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_SPADES, Card.ACE_OF_DIAMONDS ],
      });
    }); // End 9 scuttle

    it('Plays a nine as ONE-OFF on lower point card to return it to owners hand', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.NINE_OF_SPADES, Card.NINE_OF_HEARTS ],
        p0Points: [ Card.TEN_OF_HEARTS ],
        p0FaceCards: [],
        p1Hand: [ Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS ],
        p1Points: [ Card.ACE_OF_DIAMONDS ],
        p1FaceCards: [],
      });

      // Player plays nine
      cy.get('[data-player-hand-card=9-3]').click(); // nine of spades
      cy.get('[data-move-choice=targetedOneOff').click();
      cy.get('[data-opponent-point-card=1-1]').click(); // ace of diamonds

      // Wait for opponent to resolve
      cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
      cy.resolveOpponent();

      assertGameState(0, {
        p0Hand: [ Card.NINE_OF_HEARTS ],
        p0Points: [ Card.TEN_OF_HEARTS ],
        p0FaceCards: [],
        p1Hand: [ Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS, Card.ACE_OF_DIAMONDS ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_SPADES ],
      });
    }); // End 9 one-off low point card

    it('Plays a nine as ONE-OFF on a higher point card to return it to owners hand', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.NINE_OF_CLUBS, Card.NINE_OF_HEARTS ],
        p0Points: [ Card.TEN_OF_HEARTS ],
        p0FaceCards: [],
        p1Hand: [ Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS ],
        p1Points: [ Card.NINE_OF_SPADES ],
        p1FaceCards: [],
      });

      // Attempt illegal scuttle
      cy.get('[data-player-hand-card=9-0]').click();
      cy.get('[data-move-choice=scuttle]')
        .should('have.class', 'v-card--disabled')
        .should('contain', 'You can only scuttle smaller point cards')
        .click({ force: true });
      cy.get('#player-hand-targeting').should('be.visible');
      cy.get('[data-opponent-point-card=9-3]').click();
      assertSnackbar(SnackBarError.ILLEGAL_SCUTTLE);

      // Player plays nine
      cy.get('[data-player-hand-card=9-2]').click(); // nine of hearts
      cy.get('[data-move-choice=targetedOneOff]').click();
      cy.get('#player-hand-targeting').should('be.visible');
      cy.get('[data-opponent-point-card=9-3]').click(); // nine of spades
      cy.log('Successfully played nine one-off on higher point card');

      // Wait for opponent to resolve
      cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
      cy.resolveOpponent();

      assertGameState(0, {
        p0Hand: [ Card.NINE_OF_CLUBS ],
        p0Points: [ Card.TEN_OF_HEARTS ],
        p0FaceCards: [],
        p1Hand: [ Card.NINE_OF_SPADES, Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_HEARTS ],
      });
    }); // End 9 one-off high-point card

    it('Plays a nine as a ONE-OFF to return a face card to its owners hand', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.NINE_OF_SPADES, Card.NINE_OF_HEARTS ],
        p0Points: [ Card.TEN_OF_HEARTS ],
        p0FaceCards: [],
        p1Hand: [ Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS ],
        p1Points: [],
        p1FaceCards: [ Card.KING_OF_DIAMONDS ],
      });

      // Player plays nine
      cy.get('[data-player-hand-card=9-3]').click(); // nine of spades
      cy.get('[data-move-choice=targetedOneOff]').click();
      cy.get('#player-hand-targeting').should('be.visible');
      cy.get('[data-opponent-face-card=13-1]').click(); // king of diamonds

      // Wait for opponent to resolve
      cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
      cy.resolveOpponent();

      assertGameState(0, {
        p0Hand: [ Card.NINE_OF_HEARTS ],
        p0Points: [ Card.TEN_OF_HEARTS ],
        p0FaceCards: [],
        p1Hand: [ Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS, Card.KING_OF_DIAMONDS ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_SPADES ],
      });
    }); // End 9 on face card

    it('Plays a 9 on a jack to steal back point card', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.ACE_OF_SPADES, Card.NINE_OF_CLUBS ],
        p0Points: [ Card.TEN_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [ Card.JACK_OF_CLUBS ],
        p1Points: [],
        p1FaceCards: [],
      });

      // Player plays Ace of Spades
      cy.get('[data-player-hand-card=1-3]').click();
      cy.get('[data-move-choice=points]').click();

      assertGameState(0, {
        p0Hand: [ Card.NINE_OF_CLUBS ],
        p0Points: [ Card.TEN_OF_SPADES, Card.ACE_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [ Card.JACK_OF_CLUBS ],
        p1Points: [],
        p1FaceCards: [],
      });

      // Opponent plays jack
      cy.playJackOpponent(Card.JACK_OF_CLUBS, Card.ACE_OF_SPADES);

      assertGameState(0, {
        p0Hand: [ Card.NINE_OF_CLUBS ],
        p0Points: [ Card.TEN_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [ Card.ACE_OF_SPADES ],
        p1FaceCards: [],
      });

      // Player plays NINE to destroy jack
      cy.get('[data-player-hand-card=9-0]').click();
      cy.get('[data-move-choice=targetedOneOff]').click();
      cy.get('#player-hand-targeting').should('be.visible');
      cy.get('[data-opponent-face-card=11-0]').click();

      // Wait for opponent to resolve
      cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
      cy.resolveOpponent();

      assertGameState(0, {
        p0Hand: [],
        p0Points: [ Card.ACE_OF_SPADES, Card.TEN_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [ Card.JACK_OF_CLUBS ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_CLUBS ],
      });

      // Should no longer see jack of clubs on screen
      cy.get('[data-player-face-card=11-0]').should('not.exist');
    }); // End 9 on jack 

    it('Plays a 9 on a triple jack to steal back jacked point card', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.ACE_OF_SPADES, Card.NINE_OF_CLUBS, Card.JACK_OF_SPADES ],
        p0Points: [ Card.TEN_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [ Card.JACK_OF_CLUBS, Card.JACK_OF_DIAMONDS, Card.NINE_OF_HEARTS ],
        p1Points: [],
        p1FaceCards: [],
      });

      // Player plays Ace of Spades
      cy.get('[data-player-hand-card=1-3]').click();
      cy.get('[data-move-choice=points]').click();

      assertGameState(0, {
        p0Hand: [ Card.NINE_OF_CLUBS, Card.JACK_OF_SPADES ],
        p0Points: [ Card.TEN_OF_SPADES, Card.ACE_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [ Card.JACK_OF_CLUBS, Card.JACK_OF_DIAMONDS, Card.NINE_OF_HEARTS ],
        p1Points: [],
        p1FaceCards: [],
      });

      // Opponent plays jack
      cy.playJackOpponent(Card.JACK_OF_CLUBS, Card.ACE_OF_SPADES);

      assertGameState(0, {
        p0Hand: [ Card.NINE_OF_CLUBS, Card.JACK_OF_SPADES ],
        p0Points: [ Card.TEN_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [ Card.JACK_OF_DIAMONDS, Card.NINE_OF_HEARTS ],
        p1Points: [ Card.ACE_OF_SPADES ],
        p1FaceCards: [],
      });


      // player plays jack
      cy.get('[data-player-hand-card=11-3]').click();
      cy.get('[data-move-choice=jack]').click();
      cy.get('#player-hand-targeting').should('be.visible');
      cy.get('[data-opponent-point-card=1-3]').click({ force: true });

      // Opponent plays jack
      cy.playJackOpponent(Card.JACK_OF_DIAMONDS, Card.ACE_OF_SPADES);

      // player plays 9 on jack to steal back card
      cy.get('[data-player-hand-card=9-0]').click();
      cy.get('[data-move-choice=targetedOneOff]').click();
      cy.get('#player-hand-targeting').should('be.visible');
      cy.get('[data-opponent-face-card=11-1]').click();

      cy.resolveOpponent();

      assertGameState(0, {
        p0Hand: [],
        p0Points: [ Card.TEN_OF_SPADES, Card.ACE_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [ Card.JACK_OF_DIAMONDS, Card.NINE_OF_HEARTS ],
        p1Points: [],
        p1FaceCards: [],
      });

      // Opponent nines Jack
      cy.playTargetedOneOffOpponent(Card.NINE_OF_HEARTS, Card.JACK_OF_SPADES, 'jack');
      cy.get('[data-cy=cannot-counter-resolve]').click();
  
      assertGameState(0, {
        p0Hand: [ Card.JACK_OF_SPADES ],
        p0Points: [ Card.TEN_OF_SPADES, ],
        p0FaceCards: [],
        p1Hand: [ Card.JACK_OF_DIAMONDS ],
        p1Points: [ Card.ACE_OF_SPADES ],
        p1FaceCards: [],
      });
    });

    it('Plays a 9 on a point card that has been triple jacked', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.ACE_OF_SPADES, Card.NINE_OF_CLUBS, Card.JACK_OF_SPADES ],
        p0Points: [ Card.TEN_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [ Card.JACK_OF_CLUBS, Card.JACK_OF_DIAMONDS, Card.NINE_OF_HEARTS ],
        p1Points: [],
        p1FaceCards: [],
      });

      // Player plays Ace of Spades
      cy.get('[data-player-hand-card=1-3]').click();
      cy.get('[data-move-choice=points]').click();

      assertGameState(0, {
        p0Hand: [ Card.NINE_OF_CLUBS, Card.JACK_OF_SPADES ],
        p0Points: [ Card.TEN_OF_SPADES, Card.ACE_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [ Card.JACK_OF_CLUBS, Card.JACK_OF_DIAMONDS, Card.NINE_OF_HEARTS ],
        p1Points: [],
        p1FaceCards: [],
      });

      // Opponent plays jack
      cy.playJackOpponent(Card.JACK_OF_CLUBS, Card.ACE_OF_SPADES);

      assertGameState(0, {
        p0Hand: [ Card.NINE_OF_CLUBS, Card.JACK_OF_SPADES ],
        p0Points: [ Card.TEN_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [ Card.JACK_OF_DIAMONDS, Card.NINE_OF_HEARTS ],
        p1Points: [ Card.ACE_OF_SPADES ],
        p1FaceCards: [],
      });


      // player plays jack
      cy.get('[data-player-hand-card=11-3]').click();
      cy.get('[data-move-choice=jack]').click();
      cy.get('#player-hand-targeting').should('be.visible');
      cy.get('[data-opponent-point-card=1-3]').click({ force: true });

      // Opponent plays jack
      cy.playJackOpponent(Card.JACK_OF_DIAMONDS, Card.ACE_OF_SPADES);

      // player plays 9
      cy.get('[data-player-hand-card=9-0]').click();
      cy.get('[data-move-choice=targetedOneOff]').click();
      cy.get('#player-hand-targeting').should('be.visible');
      cy.get('[data-opponent-point-card=1-3]').click({ force: true });

      cy.resolveOpponent();

      assertGameState(0, {
        p0Hand: [  ],
        p0Points: [ Card.TEN_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [ Card.NINE_OF_HEARTS, Card.ACE_OF_SPADES ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.JACK_OF_DIAMONDS, Card.JACK_OF_CLUBS, Card.JACK_OF_SPADES, Card.NINE_OF_CLUBS ]
      });
    });

    it('Cancels playing a nine one off', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.NINE_OF_SPADES, Card.NINE_OF_HEARTS ],
        p0Points: [ Card.TEN_OF_HEARTS ],
        p0FaceCards: [],
        p1Hand: [ Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS ],
        p1Points: [ Card.ACE_OF_DIAMONDS ],
        p1FaceCards: [],
      });

      // Player plays nine
      cy.get('[data-player-hand-card=9-3]').click(); // nine of spades
      cy.get('[data-move-choice=targetedOneOff]').click();
      cy.get('#player-hand-targeting').should('be.visible');

      // Cancels
      cy.get('[data-cy=cancel-target]').click();
      cy.get('#player-hand-targeting').should('not.exist');

      assertGameState(0, {
        p0Hand: [ Card.NINE_OF_HEARTS, Card.NINE_OF_SPADES ],
        p0Points: [ Card.TEN_OF_HEARTS ],
        p0FaceCards: [],
        p1Hand: [ Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS ],
        p1Points: [ Card.ACE_OF_DIAMONDS ],
        p1FaceCards: [],
        scrap: [],
      });
    });

    it('Plays a nine as a ONE-OFF, make sure that the bounced card is playable later', () => {
      /*
      1). P0 plays a 9, targeting an in-play Queen
      2). P1 plays a 6's one-off, removing some cards
      3). P0 plays a Jack, targeting an in-play 10
      4). P1 can replay their bounced Queen
       */

      // Initial state
      cy.loadGameFixture(0, {
        p0Hand: [ Card.NINE_OF_SPADES, Card.JACK_OF_SPADES ],
        p0Points: [],
        p0FaceCards: [ Card.KING_OF_HEARTS ],
        p1Hand: [ Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS ],
        p1Points: [ Card.TEN_OF_HEARTS ],
        p1FaceCards: [ Card.QUEEN_OF_DIAMONDS ],
      });

      // STEP 1
      cy.log('STEP 1- P0 plays nine, targeting the Queen in play');
      cy.get('[data-player-hand-card=9-3]').click(); // nine of spades
      cy.get('[data-move-choice=targetedOneOff]').click();
      cy.get('#player-hand-targeting').should('be.visible');
      cy.get('[data-opponent-face-card=12-1]').click(); // queen of diamonds

      // Wait for opponent to resolve
      cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
      cy.resolveOpponent();

      assertGameState(0, {
        p0Hand: [ Card.JACK_OF_SPADES ],
        p0Points: [],
        p0FaceCards: [ Card.KING_OF_HEARTS ],
        p1Hand: [ Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS, Card.QUEEN_OF_DIAMONDS ],
        p1Points: [ Card.TEN_OF_HEARTS ],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_SPADES ],
      });

      // STEP 2
      cy.log('STEP 2- P1 plays a six, removing face cards');
      cy.playOneOffOpponent(Card.SIX_OF_HEARTS);

      cy.get('#cannot-counter-dialog').should('be.visible')
        .get('[data-cy=cannot-counter-resolve]')
        .click();

      assertGameState(0, {
        p0Hand: [ Card.JACK_OF_SPADES ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.QUEEN_OF_HEARTS, Card.QUEEN_OF_DIAMONDS ],
        p1Points: [ Card.TEN_OF_HEARTS ],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_SPADES, Card.KING_OF_HEARTS, Card.SIX_OF_HEARTS ],
      });

      // STEP 3
      cy.log('STEP 3- P0 plays a Jack, targeting the Ten');
      cy.get('[data-player-hand-card=11-3]').click();
      cy.get('[data-move-choice=jack]').click();
      cy.get('[data-opponent-point-card=10-2]').click();

      assertGameState(0, {
        p0Hand: [],
        p0Points: [ Card.TEN_OF_HEARTS ],
        p0FaceCards: [],
        p1Hand: [ Card.QUEEN_OF_HEARTS, Card.QUEEN_OF_DIAMONDS ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_SPADES, Card.KING_OF_HEARTS, Card.SIX_OF_HEARTS ],
      });

      // STEP 4
      cy.log('STEP 4- P1 plays their previously bounced Queen');
      cy.playFaceCardOpponent(Card.QUEEN_OF_DIAMONDS);

      assertGameState(0, {
        p0Hand: [],
        p0Points: [ Card.TEN_OF_HEARTS ],
        p0FaceCards: [],
        p1Hand: [ Card.QUEEN_OF_HEARTS ],
        p1Points: [],
        p1FaceCards: [ Card.QUEEN_OF_DIAMONDS ],
        scrap: [ Card.NINE_OF_SPADES, Card.KING_OF_HEARTS, Card.SIX_OF_HEARTS ],
      });
    });

    it('Plays a nine as a ONE-OFF, make sure that the bounced card is playable even if there is countering', () => {
      /*
      1). P0 plays 9 one-off, targeting P1's Queen
      2). P1 plays 6's one-off
      3). P0 counters and it resolves
      4). P0 plays their Jack, targeting P1's 10
      5). P1 plays their Queen again (it should no longer be frozen)
       */

      // Initial state
      cy.loadGameFixture(0, {
        p0Hand: [ Card.TWO_OF_SPADES, Card.NINE_OF_SPADES, Card.JACK_OF_SPADES ],
        p0Points: [],
        p0FaceCards: [ Card.KING_OF_HEARTS ],
        p1Hand: [ Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS ],
        p1Points: [ Card.TEN_OF_HEARTS ],
        p1FaceCards: [ Card.QUEEN_OF_DIAMONDS ],
      });

      // STEP 1
      cy.log('STEP 1- P0 plays nine, targeting the Queen in play');
      cy.get('[data-player-hand-card=9-3]').click(); // nine of spades
      cy.get('[data-move-choice=targetedOneOff]').click();
      cy.get('#player-hand-targeting').should('be.visible');
      cy.get('[data-opponent-face-card=12-1]').click(); // queen of diamonds

      // Wait for opponent to resolve
      cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
      cy.resolveOpponent();

      assertGameState(0, {
        p0Hand: [ Card.TWO_OF_SPADES, Card.JACK_OF_SPADES ],
        p0Points: [],
        p0FaceCards: [ Card.KING_OF_HEARTS ],
        p1Hand: [ Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS, Card.QUEEN_OF_DIAMONDS ],
        p1Points: [ Card.TEN_OF_HEARTS ],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_SPADES ],
      });

      // STEP 2
      cy.log('STEP 2- P1 tries to play a six');
      cy.playOneOffOpponent(Card.SIX_OF_HEARTS);

      // STEP 3
      cy.log('STEP 3- P0 counters');

      cy.get('#counter-dialog').should('be.visible')
        .get('[data-cy=counter]')
        .click();

      cy.get('#choose-two-dialog').should('be.visible')
        .get('[data-counter-dialog-card=2-3]')
        .click();

      // Wait for opponent to resolve
      cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
      cy.resolveOpponent();

      assertGameState(0, {
        p0Hand: [ Card.JACK_OF_SPADES ],
        p0Points: [],
        p0FaceCards: [ Card.KING_OF_HEARTS ],
        p1Hand: [ Card.QUEEN_OF_HEARTS, Card.QUEEN_OF_DIAMONDS ],
        p1Points: [ Card.TEN_OF_HEARTS ],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_SPADES, Card.SIX_OF_HEARTS, Card.TWO_OF_SPADES ],
      });

      // Step 4
      cy.log("STEP 4- P0 Jacks P1's 10");
      cy.get('[data-player-hand-card=11-3]').click(); // Jack of spades
      cy.get('[data-move-choice=jack]').click();
      cy.get('#player-hand-targeting').should('be.visible');
      cy.get('[data-opponent-point-card=10-2]').click(); // Ten of hearts

      // STEP 4
      cy.log('STEP 5- P1 plays their previously bounced Queen');
      cy.playFaceCardOpponent(Card.QUEEN_OF_DIAMONDS);

      assertGameState(0, {
        p0Hand: [],
        p0Points: [ Card.TEN_OF_HEARTS ],
        p0FaceCards: [ Card.KING_OF_HEARTS ],
        p1Hand: [ Card.QUEEN_OF_HEARTS ],
        p1Points: [],
        p1FaceCards: [ Card.QUEEN_OF_DIAMONDS ],
        scrap: [ Card.NINE_OF_SPADES, Card.SIX_OF_HEARTS, Card.TWO_OF_SPADES ],
      });
    });
  }); // End Player playing 9s describe

  describe('Opponent Playing NINES', () => {
    beforeEach(() => {
      cy.setupGameAsP1();
    });

    it('Disables playing a frozen number card until the following turn', () => {
      cy.loadGameFixture(1, {
        p0Hand: [ Card.NINE_OF_CLUBS ],
        p0Points: [ Card.THREE_OF_CLUBS ],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [ Card.SEVEN_OF_CLUBS ],
        p1FaceCards: [],
        topCard: Card.TEN_OF_CLUBS,
      });

      // opponent plays nine to return seven to player's hand
      cy.playTargetedOneOffOpponent(Card.NINE_OF_CLUBS, Card.SEVEN_OF_CLUBS, 'point');

      // Player resolves
      cy.get('#cannot-counter-dialog').should('be.visible')
        .get('[data-cy=cannot-counter-resolve]')
        .click();

      assertGameState(1, {
        p0Hand: [],
        p0Points: [ Card.THREE_OF_CLUBS ],
        p0FaceCards: [],
        p1Hand: [ Card.SEVEN_OF_CLUBS ],
        p1Points: [],
        p1FaceCards: [],
      });

      // Card should have the frozen state shown visually
      cy.get('[data-player-hand-card=7-0]').should('have.class', 'frozen');
      // Player attempts to play the returned seven immediately for points
      cy.get('[data-player-hand-card=7-0]').click();
      // Card overlay should have the frozen state shown visually
      cy.get('[data-player-overlay-card=7-0]').should('have.class', 'frozen');
      // Frozen move choice cards should be disabled and display frozen text.
      cy.get('[data-move-choice=points]')
        .should('have.class', 'v-card--disabled')
        .contains('This card is frozen')
        .click({ force: true }); // Break out into separate test case
      assertSnackbar(SnackBarError.FROZEN_CARD);

      cy.log('Correctly prevented player from re-playing frozen jack next turn');
      // Player attempts to play the returned seven immediately for scuttle
      cy.get('[data-player-hand-card=7-0]').click();
      // Card overlay should have the frozen state shown visually
      cy.get('[data-player-overlay-card=7-0]').should('have.class', 'frozen');
      // Frozen move choice cards should be disabled and display frozen text.
      cy.get('[data-move-choice=scuttle]')
        .should('have.class', 'v-card--disabled')
        .contains('This card is frozen')
        .click({ force: true }); // Break out into separate test case
      // Player attempts to scuttle lower point card
      cy.get('#player-hand-targeting').should('be.visible');
      cy.get('[data-opponent-point-card=3-0]').click();
      assertSnackbar(SnackBarError.FROZEN_CARD);
    });

    it('Opponent plays a NINE on a jack to steal back point card', () => {
      cy.loadGameFixture(1, {
        p0Hand: [ Card.ACE_OF_SPADES, Card.NINE_OF_CLUBS, Card.ACE_OF_DIAMONDS ],
        p0Points: [ Card.TEN_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [ Card.JACK_OF_CLUBS, Card.TEN_OF_DIAMONDS ],
        p1Points: [],
        p1FaceCards: [],
        topCard: Card.TEN_OF_CLUBS,
      });

      // opponent plays Ace of Spades
      cy.playPointsOpponent(Card.ACE_OF_SPADES);

      // player plays jack
      cy.get('[data-player-hand-card=11-0]').click();
      cy.get('[data-move-choice=jack]').click();
      cy.get('#player-hand-targeting').should('be.visible');
      cy.get('[data-opponent-point-card=1-3]').click();

      assertGameState(1, {
        p0Hand: [ Card.NINE_OF_CLUBS, Card.ACE_OF_DIAMONDS ],
        p0Points: [ Card.TEN_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [ Card.TEN_OF_DIAMONDS ],
        p1Points: [ Card.ACE_OF_SPADES ],
        p1FaceCards: [],
      });

      cy.playTargetedOneOffOpponent(Card.NINE_OF_CLUBS, Card.JACK_OF_CLUBS, 'jack');

      // Player resolves
      cy.get('#cannot-counter-dialog').should('be.visible')
        .get('[data-cy=cannot-counter-resolve]')
        .click();

      assertGameState(1, {
        p0Hand: [ Card.ACE_OF_DIAMONDS ],
        p0Points: [ Card.TEN_OF_SPADES, Card.ACE_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [ Card.JACK_OF_CLUBS, Card.TEN_OF_DIAMONDS ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_CLUBS ],
      });
      // Card should have the frozen state shown visually
      cy.get('[data-player-hand-card=11-0]').should('have.class', 'frozen');

      // Player attempts plays the returned jack immediately
      cy.get('[data-player-hand-card=11-0]').click();

      // Card overlay should have the frozen state shown visually
      cy.get('[data-player-overlay-card=11-0]').should('have.class', 'frozen');

      // Frozen move choice cards should be disabled and display frozen text.
      cy.get('[data-move-choice=jack]')
        .should('have.class', 'v-card--disabled')
        .contains('This card is frozen')
        .click({ force: true }); // Break out into separate test case

      cy.get('#player-hand-targeting').should('be.visible');
      cy.get('[data-opponent-point-card=1-3]').click();
      assertSnackbar(SnackBarError.FROZEN_CARD);
      cy.log('Correctly prevented player from re-playing frozen jack next turn');

      cy.get('[data-player-hand-card=10-1]').click();
      cy.get('[data-move-choice=points]').click();

      assertGameState(1, {
        p0Hand: [ Card.ACE_OF_DIAMONDS ],
        p0Points: [ Card.TEN_OF_SPADES, Card.ACE_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [ Card.JACK_OF_CLUBS ],
        p1Points: [ Card.TEN_OF_DIAMONDS ],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_CLUBS ],
      });

      cy.playPointsOpponent(Card.ACE_OF_DIAMONDS);
      cy.get('[data-player-hand-card]').should('have.length', 1);

      // Player plays jack after one turn
      cy.get('[data-player-hand-card=11-0]').click();
      cy.get('[data-move-choice=jack]').click();
      cy.get('#player-hand-targeting').should('be.visible');
      cy.get('[data-opponent-point-card=1-1]').click();

      assertGameState(1, {
        p0Hand: [],
        p0Points: [ Card.TEN_OF_SPADES, Card.ACE_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [ Card.ACE_OF_DIAMONDS, Card.TEN_OF_DIAMONDS ],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_CLUBS ],
      });
    }); // End 9 on jack

    it('Clears players frozen card after resolving one-off', () => {
      cy.loadGameFixture(1, {
        p0Hand: [ Card.NINE_OF_SPADES, Card.EIGHT_OF_HEARTS ],
        p0Points: [],
        p0FaceCards: [ Card.KING_OF_HEARTS ],
        p1Hand: [ Card.NINE_OF_HEARTS, Card.EIGHT_OF_DIAMONDS ],
        p1Points: [],
        p1FaceCards: [ Card.KING_OF_DIAMONDS ],
      });
      cy.playTargetedOneOffOpponent(Card.NINE_OF_SPADES, Card.KING_OF_DIAMONDS, 'faceCard');
      cy.get('#cannot-counter-dialog').should('be.visible')
        .get('[data-cy=cannot-counter-resolve]')
        .click();

      cy.get('[data-player-hand-card=9-2]').click();
      cy.get('[data-move-choice=targetedOneOff').click();
      cy.get('[data-opponent-face-card=13-2]').click();
      cy.resolveOpponent();
      cy.playPointsOpponent(Card.EIGHT_OF_HEARTS);

      cy.get('[data-player-hand-card=13-1]').click();
      cy.get('[data-move-choice=faceCard]').click();

      assertGameState(1, {
        p0Hand: [ Card.KING_OF_HEARTS ],
        p0Points: [ Card.EIGHT_OF_HEARTS ],
        p0FaceCards: [],
        p1Hand: [ Card.EIGHT_OF_DIAMONDS ],
        p1Points: [],
        p1FaceCards: [ Card.KING_OF_DIAMONDS ],
        scrap: [ Card.NINE_OF_HEARTS, Card.NINE_OF_SPADES ],
      });
    });
  }); // End Opponent playing NINES describe
});
