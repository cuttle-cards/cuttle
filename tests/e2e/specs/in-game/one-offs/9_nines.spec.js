import { assertGameState, assertSnackbar } from '../../../support/helpers';
import { Card } from '../../../fixtures/cards';
import { SnackBarError } from '../../../fixtures/snackbarError';

function assertDeckCount(count) {
  cy.get('#deck .c-deck-count').invoke('text')
    .invoke('trim')
    .should('eq', `(${count})`);
}

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

    it('Plays a nine as ONE-OFF on a lower point card to put it on top of the deck', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.NINE_OF_SPADES, Card.NINE_OF_HEARTS ],
        p0Points: [ Card.TEN_OF_HEARTS ],
        p0FaceCards: [],
        p1Hand: [ Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS ],
        p1Points: [ Card.ACE_OF_DIAMONDS ],
        p1FaceCards: [],
        topCard: Card.TWO_OF_CLUBS,
      });
      assertDeckCount(46);

      // Player plays nine
      cy.get('[data-player-hand-card=9-3]').click(); // nine of spades
      cy.get('[data-move-choice=targetedOneOff]').click();
      cy.get('[data-opponent-point-card=1-1]').click(); // ace of diamonds

      // Wait for opponent to resolve
      cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
      cy.resolveOpponent();

      // The ace is gone from the board, and it did NOT go to anyone's hand
      assertGameState(0, {
        p0Hand: [ Card.NINE_OF_HEARTS ],
        p0Points: [ Card.TEN_OF_HEARTS ],
        p0FaceCards: [],
        p1Hand: [ Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_SPADES ],
        deckLength: 47,
      });

      // The opponent's next draw is the card they just lost, proving it was on top
      cy.drawCardOpponent();
      assertDeckCount(46);

      // Player draws the card that was underneath it
      cy.get('#deck').click();
      assertDeckCount(45);

      // Opponent replays the ace, so it was never frozen
      cy.playPointsOpponent(Card.ACE_OF_DIAMONDS);

      assertGameState(0, {
        p0Hand: [ Card.NINE_OF_HEARTS, Card.TWO_OF_CLUBS ],
        p0Points: [ Card.TEN_OF_HEARTS ],
        p0FaceCards: [],
        p1Hand: [ Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS ],
        p1Points: [ Card.ACE_OF_DIAMONDS ],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_SPADES ],
      });
    }); // End 9 one-off low point card

    it('Plays a nine as ONE-OFF on a higher point card to put it on top of the deck', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.NINE_OF_CLUBS, Card.NINE_OF_HEARTS ],
        p0Points: [ Card.TEN_OF_HEARTS ],
        p0FaceCards: [],
        p1Hand: [ Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS ],
        p1Points: [ Card.NINE_OF_SPADES ],
        p1FaceCards: [],
      });
      assertDeckCount(46);

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
        p1Hand: [ Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_HEARTS ],
        deckLength: 47,
      });
    }); // End 9 one-off high-point card

    it('Plays a nine as a ONE-OFF to put a face card on top of the deck', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.NINE_OF_SPADES, Card.NINE_OF_HEARTS ],
        p0Points: [ Card.TEN_OF_HEARTS ],
        p0FaceCards: [],
        p1Hand: [ Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS ],
        p1Points: [],
        p1FaceCards: [ Card.KING_OF_DIAMONDS ],
      });
      assertDeckCount(46);

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
        p1Hand: [ Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_SPADES ],
        deckLength: 47,
      });
    }); // End 9 on face card

    it('Plays a 9 on a jack to steal back point card, topdecking the jack', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.ACE_OF_SPADES, Card.NINE_OF_CLUBS ],
        p0Points: [ Card.TEN_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [ Card.JACK_OF_CLUBS ],
        p1Points: [],
        p1FaceCards: [],
        topCard: Card.TWO_OF_CLUBS,
      });
      assertDeckCount(48);

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

      // Player plays NINE to topdeck the jack
      cy.get('[data-player-hand-card=9-0]').click();
      cy.get('[data-move-choice=targetedOneOff]').click();
      cy.get('#player-hand-targeting').should('be.visible');
      cy.get('[data-opponent-face-card=11-0]').click();

      // Wait for opponent to resolve
      cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
      cy.resolveOpponent();

      // The jack went to the deck; the point card it was stealing reverts to its owner
      assertGameState(0, {
        p0Hand: [],
        p0Points: [ Card.ACE_OF_SPADES, Card.TEN_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_CLUBS ],
        deckLength: 49,
      });

      // Should no longer see jack of clubs on screen
      cy.get('[data-player-face-card=11-0]').should('not.exist');

      // Opponent draws the topdecked jack back, and player draws the card beneath it
      cy.drawCardOpponent();
      cy.get('#deck').click();
      assertDeckCount(47);

      // Opponent immediately replays the jack, so it was never frozen
      cy.playJackOpponent(Card.JACK_OF_CLUBS, Card.ACE_OF_SPADES);

      assertGameState(0, {
        p0Hand: [ Card.TWO_OF_CLUBS ],
        p0Points: [ Card.TEN_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [ Card.ACE_OF_SPADES ],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_CLUBS ],
      });
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
      assertDeckCount(45);

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

      // player plays 9 on the jack stack to steal back the card
      cy.get('[data-player-hand-card=9-0]').click();
      cy.get('[data-move-choice=targetedOneOff]').click();
      cy.get('#player-hand-targeting').should('be.visible');

      // Only the top jack of the stack is a legal target
      cy.get('.jacks-container').find('.target-overlay')
        .should('have.length', 1);

      cy.get('[data-opponent-face-card=11-1]').click();

      cy.resolveOpponent();

      assertGameState(0, {
        p0Hand: [],
        p0Points: [ Card.TEN_OF_SPADES, Card.ACE_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [ Card.NINE_OF_HEARTS ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_CLUBS ],
        deckLength: 46,
      });

      // Opponent nines the jack that is now on top of the player's ace
      cy.playTargetedOneOffOpponent(Card.NINE_OF_HEARTS, Card.JACK_OF_SPADES, 'jack');
      cy.get('[data-cy=cannot-counter-resolve]').click();

      assertGameState(0, {
        p0Hand: [],
        p0Points: [ Card.TEN_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [ Card.ACE_OF_SPADES ],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_CLUBS, Card.NINE_OF_HEARTS ],
        deckLength: 47,
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
        topCard: Card.TWO_OF_CLUBS,
      });
      assertDeckCount(45);

      // Player plays Ace of Spades
      cy.get('[data-player-hand-card=1-3]').click();
      cy.get('[data-move-choice=points]').click();

      // Opponent plays jack
      cy.playJackOpponent(Card.JACK_OF_CLUBS, Card.ACE_OF_SPADES);

      // player plays jack
      cy.get('[data-player-hand-card=11-3]').click();
      cy.get('[data-move-choice=jack]').click();
      cy.get('#player-hand-targeting').should('be.visible');
      cy.get('[data-opponent-point-card=1-3]').click({ force: true });

      // Opponent plays jack
      cy.playJackOpponent(Card.JACK_OF_DIAMONDS, Card.ACE_OF_SPADES);

      // player plays 9 on the point card itself
      cy.get('[data-player-hand-card=9-0]').click();
      cy.get('[data-move-choice=targetedOneOff]').click();
      cy.get('#player-hand-targeting').should('be.visible');
      cy.get('[data-opponent-point-card=1-3]').click({ force: true });

      cy.resolveOpponent();

      // The ace is topdecked and all three jacks are scrapped
      assertGameState(0, {
        p0Hand: [],
        p0Points: [ Card.TEN_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [ Card.NINE_OF_HEARTS ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.JACK_OF_DIAMONDS, Card.JACK_OF_CLUBS, Card.JACK_OF_SPADES, Card.NINE_OF_CLUBS ],
        deckLength: 46,
      });

      // Opponent draws the ace back, and the player draws the card beneath it
      cy.drawCardOpponent();
      cy.get('#deck').click();
      assertDeckCount(44);

      cy.playPointsOpponent(Card.ACE_OF_SPADES);

      assertGameState(0, {
        p0Hand: [ Card.TWO_OF_CLUBS ],
        p0Points: [ Card.TEN_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [ Card.NINE_OF_HEARTS ],
        p1Points: [ Card.ACE_OF_SPADES ],
        p1FaceCards: [],
        scrap: [ Card.JACK_OF_DIAMONDS, Card.JACK_OF_CLUBS, Card.JACK_OF_SPADES, Card.NINE_OF_CLUBS ],
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
        deckLength: 46,
      });
    });

    it('Plays a nine as a ONE-OFF; the topdecked card is drawn back and replayed immediately', () => {
      /*
      1). P0 plays a 9, topdecking an in-play Queen
      2). P1 plays a 6's one-off, removing some cards
      3). P0 plays a Jack, targeting an in-play 10
      4). P1 draws their topdecked Queen and replays it with no delay
       */

      // Initial state
      cy.loadGameFixture(0, {
        p0Hand: [ Card.NINE_OF_SPADES, Card.JACK_OF_SPADES ],
        p0Points: [],
        p0FaceCards: [ Card.KING_OF_HEARTS ],
        p1Hand: [ Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS ],
        p1Points: [ Card.TEN_OF_HEARTS ],
        p1FaceCards: [ Card.QUEEN_OF_DIAMONDS ],
        topCard: Card.TWO_OF_CLUBS,
      });
      assertDeckCount(45);

      // STEP 1
      cy.log('STEP 1- P0 plays nine, topdecking the Queen in play');
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
        p1Hand: [ Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS ],
        p1Points: [ Card.TEN_OF_HEARTS ],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_SPADES ],
        deckLength: 46,
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
        p1Hand: [ Card.QUEEN_OF_HEARTS ],
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
        p1Hand: [ Card.QUEEN_OF_HEARTS ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_SPADES, Card.KING_OF_HEARTS, Card.SIX_OF_HEARTS ],
      });

      // STEP 4
      cy.log('STEP 4- P1 draws their topdecked Queen and plays it right away');
      cy.drawCardOpponent();
      cy.get('#deck').click();
      assertDeckCount(44);

      cy.playFaceCardOpponent(Card.QUEEN_OF_DIAMONDS);

      assertGameState(0, {
        p0Hand: [ Card.TWO_OF_CLUBS ],
        p0Points: [ Card.TEN_OF_HEARTS ],
        p0FaceCards: [],
        p1Hand: [ Card.QUEEN_OF_HEARTS ],
        p1Points: [],
        p1FaceCards: [ Card.QUEEN_OF_DIAMONDS ],
        scrap: [ Card.NINE_OF_SPADES, Card.KING_OF_HEARTS, Card.SIX_OF_HEARTS ],
      });
    });

    it('Plays a nine as a ONE-OFF; the topdecked card returns even when a later one-off is countered', () => {
      /*
      1). P0 plays 9 one-off, topdecking P1's Queen
      2). P1 plays 6's one-off
      3). P0 counters and it fizzles
      4). P0 plays their Jack, targeting P1's 10
      5). P1 draws their Queen back and plays it again
       */

      // Initial state
      cy.loadGameFixture(0, {
        p0Hand: [ Card.TWO_OF_SPADES, Card.NINE_OF_SPADES, Card.JACK_OF_SPADES ],
        p0Points: [],
        p0FaceCards: [ Card.KING_OF_HEARTS ],
        p1Hand: [ Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS ],
        p1Points: [ Card.TEN_OF_HEARTS ],
        p1FaceCards: [ Card.QUEEN_OF_DIAMONDS ],
        topCard: Card.TWO_OF_CLUBS,
      });
      assertDeckCount(44);

      // STEP 1
      cy.log('STEP 1- P0 plays nine, topdecking the Queen in play');
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
        p1Hand: [ Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS ],
        p1Points: [ Card.TEN_OF_HEARTS ],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_SPADES ],
        deckLength: 45,
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
        p1Hand: [ Card.QUEEN_OF_HEARTS ],
        p1Points: [ Card.TEN_OF_HEARTS ],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_SPADES, Card.SIX_OF_HEARTS, Card.TWO_OF_SPADES ],
      });

      // Step 4
      cy.log('STEP 4- P0 Jacks P1\'s 10');
      cy.get('[data-player-hand-card=11-3]').click(); // Jack of spades
      cy.get('[data-move-choice=jack]').click();
      cy.get('#player-hand-targeting').should('be.visible');
      cy.get('[data-opponent-point-card=10-2]').click(); // Ten of hearts

      // STEP 5
      cy.log('STEP 5- P1 draws their topdecked Queen and plays it');
      cy.drawCardOpponent();
      cy.get('#deck').click();
      assertDeckCount(43);

      cy.playFaceCardOpponent(Card.QUEEN_OF_DIAMONDS);

      assertGameState(0, {
        p0Hand: [ Card.TWO_OF_CLUBS ],
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

    it('Topdecks the point card, which the player draws back and plays immediately', () => {
      cy.loadGameFixture(1, {
        p0Hand: [ Card.NINE_OF_CLUBS ],
        p0Points: [ Card.THREE_OF_CLUBS ],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [ Card.SEVEN_OF_CLUBS ],
        p1FaceCards: [],
        topCard: Card.TEN_OF_CLUBS,
      });
      assertDeckCount(49);

      // opponent plays nine to topdeck the player's seven
      cy.playTargetedOneOffOpponent(Card.NINE_OF_CLUBS, Card.SEVEN_OF_CLUBS, 'point');

      // Player resolves
      cy.get('#cannot-counter-dialog').should('be.visible')
        .get('[data-cy=cannot-counter-resolve]')
        .click();

      // The seven is back on top of the deck
      assertGameState(1, {
        p0Hand: [],
        p0Points: [ Card.THREE_OF_CLUBS ],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_CLUBS ],
      });
      cy.get('[data-player-hand-card]').should('not.exist');
      assertDeckCount(50);

      // Player draws and gets their own seven back off the top
      cy.get('#deck').click();
      assertDeckCount(49);

      assertGameState(1, {
        p0Hand: [],
        p0Points: [ Card.THREE_OF_CLUBS ],
        p0FaceCards: [],
        p1Hand: [ Card.SEVEN_OF_CLUBS ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_CLUBS ],
      });
      // Nothing is frozen any more
      cy.get('[data-player-hand-card=7-0]').should('not.have.class', 'frozen');

      cy.drawCardOpponent();
      assertDeckCount(48);

      // Player scuttles with the card that was topdecked
      cy.get('[data-player-hand-card=7-0]').click();
      cy.get('[data-move-choice=scuttle]').click();
      cy.get('#player-hand-targeting').should('be.visible');
      cy.get('[data-opponent-point-card=3-0]').click();

      assertGameState(1, {
        p0Hand: [ Card.TEN_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_CLUBS, Card.SEVEN_OF_CLUBS, Card.THREE_OF_CLUBS ],
      });
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
      assertDeckCount(46);

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

      // The jack went to the deck rather than back to the player's hand
      assertGameState(1, {
        p0Hand: [ Card.ACE_OF_DIAMONDS ],
        p0Points: [ Card.TEN_OF_SPADES, Card.ACE_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [ Card.TEN_OF_DIAMONDS ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_CLUBS ],
        deckLength: 47,
      });

      cy.get('[data-player-hand-card=10-1]').click();
      cy.get('[data-move-choice=points]').click();

      cy.playPointsOpponent(Card.ACE_OF_DIAMONDS);

      // Player draws their jack back off the top of the deck
      cy.get('#deck').click();
      assertDeckCount(46);

      assertGameState(1, {
        p0Hand: [],
        p0Points: [ Card.TEN_OF_SPADES, Card.ACE_OF_SPADES, Card.ACE_OF_DIAMONDS ],
        p0FaceCards: [],
        p1Hand: [ Card.JACK_OF_CLUBS ],
        p1Points: [ Card.TEN_OF_DIAMONDS ],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_CLUBS ],
      });
      cy.get('[data-player-hand-card=11-0]').should('not.have.class', 'frozen');

      cy.drawCardOpponent();

      // Player replays the jack
      cy.get('[data-player-hand-card=11-0]').click();
      cy.get('[data-move-choice=jack]').click();
      cy.get('#player-hand-targeting').should('be.visible');
      cy.get('[data-opponent-point-card=1-1]').click();

      assertGameState(1, {
        p0Hand: [ Card.TEN_OF_CLUBS ],
        p0Points: [ Card.TEN_OF_SPADES, Card.ACE_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [ Card.ACE_OF_DIAMONDS, Card.TEN_OF_DIAMONDS ],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_CLUBS ],
      });
    }); // End 9 on jack

    it('Keeps the topdecked card on the deck through a rejected stalemate and a reload', () => {
      cy.loadGameFixture(1, {
        p0Hand: [ Card.NINE_OF_CLUBS ],
        p0Points: [ Card.THREE_OF_CLUBS ],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [ Card.SEVEN_OF_CLUBS ],
        p1FaceCards: [],
        topCard: Card.TEN_OF_CLUBS,
      });

      // opponent plays nine to topdeck the player's seven
      cy.playTargetedOneOffOpponent(Card.NINE_OF_CLUBS, Card.SEVEN_OF_CLUBS, 'point');

      // Player resolves
      cy.get('#cannot-counter-dialog').should('be.visible')
        .get('[data-cy=cannot-counter-resolve]')
        .click();

      assertDeckCount(50);

      // Player requests stalemate; opponent rejects
      cy.get('#game-menu-activator').click();
      cy.get('#game-menu').should('be.visible')
        .get('[data-cy=stalemate-initiate]')
        .click();
      cy.get('#request-gameover-dialog')
        .should('be.visible')
        .get('[data-cy=request-gameover-confirm]')
        .click();

      // Opponent rejects stalemate
      cy.get('#waiting-for-opponent-stalemate-scrim').should('be.visible');
      cy.rejectStalemateOpponent();
      cy.get('#waiting-for-opponent-stalemate-scrim').should('not.exist');

      cy.get('[data-player-hand-card]').should('not.exist');
      assertDeckCount(50);

      // Still on the deck after reload
      cy.reload();
      cy.get('[data-player-hand-card]').should('not.exist');
      assertDeckCount(50);

      assertGameState(1, {
        p0Hand: [],
        p0Points: [ Card.THREE_OF_CLUBS ],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_CLUBS ],
      });

      // The seven is still the very next card off the deck
      cy.get('#deck').click();

      assertGameState(1, {
        p0Hand: [],
        p0Points: [ Card.THREE_OF_CLUBS ],
        p0FaceCards: [],
        p1Hand: [ Card.SEVEN_OF_CLUBS ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_CLUBS ],
      });
    });

    it('Does not trigger discard-to-hand-limit for the player at the hand limit', () => {
      cy.loadGameFixture(1, {
        p0Hand: [ Card.NINE_OF_SPADES ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [
          Card.ACE_OF_CLUBS,
          Card.THREE_OF_CLUBS,
          Card.FOUR_OF_CLUBS,
          Card.FIVE_OF_CLUBS,
          Card.SIX_OF_CLUBS,
          Card.SEVEN_OF_CLUBS,
          Card.EIGHT_OF_CLUBS,
          Card.NINE_OF_CLUBS,
        ],
        p1Points: [ Card.TEN_OF_CLUBS ],
        p1FaceCards: [],
      });
      assertDeckCount(42);

      // Opponent (P0) plays nine targeting player's (P1's) point card
      cy.playTargetedOneOffOpponent(Card.NINE_OF_SPADES, Card.TEN_OF_CLUBS, 'point');
      cy.get('#cannot-counter-dialog').should('be.visible')
        .get('[data-cy=cannot-counter-resolve]')
        .click();

      // The ten went to the deck, so the player's hand never grows past the limit
      assertGameState(1, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [
          Card.ACE_OF_CLUBS,
          Card.THREE_OF_CLUBS,
          Card.FOUR_OF_CLUBS,
          Card.FIVE_OF_CLUBS,
          Card.SIX_OF_CLUBS,
          Card.SEVEN_OF_CLUBS,
          Card.EIGHT_OF_CLUBS,
          Card.NINE_OF_CLUBS,
        ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_SPADES ],
        deckLength: 43,
      });
      cy.get('#discard-to-hand-limit-dialog').should('not.exist');
    });
  }); // End Opponent playing NINES describe

  describe('Nine does not trigger discard-to-hand-limit', () => {
    beforeEach(() => {
      cy.setupGameAsP0();
    });

    it('Does not trigger discard-to-hand-limit for the opponent at the hand limit', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.NINE_OF_SPADES ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [
          Card.ACE_OF_HEARTS,
          Card.TWO_OF_HEARTS,
          Card.THREE_OF_HEARTS,
          Card.FOUR_OF_HEARTS,
          Card.FIVE_OF_HEARTS,
          Card.SIX_OF_HEARTS,
          Card.SEVEN_OF_HEARTS,
          Card.EIGHT_OF_HEARTS,
        ],
        p1Points: [ Card.TEN_OF_DIAMONDS ],
        p1FaceCards: [],
      });
      assertDeckCount(42);

      // Player plays nine as targeted one-off against opponent's point card
      cy.get('[data-player-hand-card=9-3]').click();
      cy.get('[data-move-choice=targetedOneOff]').click();
      cy.get('#player-hand-targeting').should('be.visible');
      cy.get('[data-opponent-point-card=10-1]').click();
      cy.resolveOpponent();

      assertGameState(0, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [
          Card.ACE_OF_HEARTS,
          Card.TWO_OF_HEARTS,
          Card.THREE_OF_HEARTS,
          Card.FOUR_OF_HEARTS,
          Card.FIVE_OF_HEARTS,
          Card.SIX_OF_HEARTS,
          Card.SEVEN_OF_HEARTS,
          Card.EIGHT_OF_HEARTS,
        ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_SPADES ],
        deckLength: 43,
      });
      cy.get('#discard-to-hand-limit-dialog').should('not.exist');
    });
  }); // End Nine does not trigger discard-to-hand-limit

  describe('Playing NINES with an empty deck', () => {
    beforeEach(() => {
      cy.setupGameAsP0();
    });

    it('Puts a card back on an empty deck, replacing the pass with a draw', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.NINE_OF_SPADES ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [ Card.TEN_OF_DIAMONDS ],
        p1FaceCards: [],
        deck: [],
      });

      // The deck is exhausted, so the only thing to do with it is pass
      assertDeckCount(0);
      cy.get('#empty-deck-text').should('be.visible');

      // Player nines the opponent's ten, putting it back on the empty deck
      cy.get('[data-player-hand-card=9-3]').click();
      cy.get('[data-move-choice=targetedOneOff]').click();
      cy.get('#player-hand-targeting').should('be.visible');
      cy.get('[data-opponent-point-card=10-1]').click();
      cy.resolveOpponent();

      // The deck is no longer empty, so passing is no longer on offer
      assertDeckCount(1);
      cy.get('#empty-deck-text').should('not.exist');

      // The opponent has to spend their turn drawing their own ten back
      cy.drawCardOpponent();
      assertDeckCount(0);
      cy.get('#empty-deck-text').should('be.visible');

      assertGameState(0, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.TEN_OF_DIAMONDS ],
        p1Points: [],
        p1FaceCards: [],
        deck: [],
      });
    });
  }); // End empty deck describe

  describe('Topdeck animation', () => {
    const fixture = {
      p0Hand: [ Card.NINE_OF_SPADES ],
      p0Points: [ Card.TEN_OF_HEARTS ],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [ Card.ACE_OF_DIAMONDS ],
      p1FaceCards: [],
    };

    function topdeckTheAce() {
      cy.get('[data-player-hand-card=9-3]').click();
      cy.get('[data-move-choice=targetedOneOff]').click();
      cy.get('[data-opponent-point-card=1-1]').click();
      cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
      cy.resolveOpponent();
    }

    beforeEach(() => {
      cy.setupGameAsP0();
    });

    it('Flips the target face down, then sends it left toward the deck', () => {
      cy.viewport(1920, 1080);
      cy.loadGameFixture(0, fixture);
      topdeckTheAce();

      // Stage one: still in place, but now showing its back
      cy.get('[data-opponent-point-card=1-1] img.opponent-card-back').should('exist');
      // Stage two: leaves toward the deck, which above xs sits to the left
      cy.get('.to-deck-left-leave-active').should('exist');
      // Stage three: gone, and the deck has grown
      cy.get('[data-opponent-point-card=1-1]').should('not.exist');

      assertGameState(0, {
        p0Hand: [],
        p0Points: [ Card.TEN_OF_HEARTS ],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_SPADES ],
        deckLength: 50,
      });
    });

    it('Sends the target downward toward the deck on xs', () => {
      cy.viewport('iphone-x');
      cy.loadGameFixture(0, fixture);
      topdeckTheAce();

      cy.get('[data-opponent-point-card=1-1] img.opponent-card-back').should('exist');
      cy.get('.to-deck-down-leave-active').should('exist');
      cy.get('[data-opponent-point-card=1-1]').should('not.exist');
    });
  }); // End topdeck animation describe
});
