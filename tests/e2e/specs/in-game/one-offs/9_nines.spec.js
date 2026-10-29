import { assertGameState, assertSnackbar } from '../../../support/helpers';
import { Card } from '../../../fixtures/cards';
import { SnackBarError } from '../../../fixtures/snackbarError';

/**
 * Nines return two cards, so the player picks both targets on the board and then confirms,
 * rather than the move firing on the first click.
 * @param handCardSelector selector for the nine in the player's hand
 * @param targetSelectors selectors for the two cards to target, in click order
 */
function playNineOneOff(handCardSelector, targetSelectors) {
  cy.get(handCardSelector).click();
  cy.get('[data-move-choice=targetedOneOff]').click();
  cy.get('#player-hand-targeting').should('be.visible');
  targetSelectors.forEach((selector) => cy.get(selector).click({ force: true }));
  cy.get('[data-cy=confirm-targets]').should('not.be.disabled')
    .click();
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
      cy.get('[data-player-hand-card=9-3]').click();
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
    });

    it('Plays a nine as ONE-OFF returning two point cards to their owners hand', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.NINE_OF_SPADES, Card.NINE_OF_HEARTS ],
        p0Points: [ Card.TEN_OF_HEARTS ],
        p0FaceCards: [],
        p1Hand: [ Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS ],
        p1Points: [ Card.ACE_OF_DIAMONDS, Card.FOUR_OF_DIAMONDS ],
        p1FaceCards: [],
      });

      playNineOneOff('[data-player-hand-card=9-3]', [
        '[data-opponent-point-card=1-1]', // ace of diamonds
        '[data-opponent-point-card=4-1]', // four of diamonds
      ]);

      // Wait for opponent to resolve
      cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
      cy.resolveOpponent();

      assertGameState(0, {
        p0Hand: [ Card.NINE_OF_HEARTS ],
        p0Points: [ Card.TEN_OF_HEARTS ],
        p0FaceCards: [],
        p1Hand: [ Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS, Card.ACE_OF_DIAMONDS, Card.FOUR_OF_DIAMONDS ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_SPADES ],
      });
    }); // End 9 one-off two point cards

    it('Plays a nine as ONE-OFF on a higher point card to return it to owners hand', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.NINE_OF_CLUBS, Card.NINE_OF_HEARTS ],
        p0Points: [ Card.TEN_OF_HEARTS ],
        p0FaceCards: [],
        p1Hand: [ Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS ],
        p1Points: [ Card.NINE_OF_SPADES ],
        p1FaceCards: [ Card.KING_OF_DIAMONDS ],
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

      // A nine one-off can still return that same higher point card
      playNineOneOff('[data-player-hand-card=9-2]', [
        '[data-opponent-point-card=9-3]', // nine of spades
        '[data-opponent-face-card=13-1]', // king of diamonds
      ]);
      cy.log('Successfully played nine one-off on higher point card');

      // Wait for opponent to resolve
      cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
      cy.resolveOpponent();

      assertGameState(0, {
        p0Hand: [ Card.NINE_OF_CLUBS ],
        p0Points: [ Card.TEN_OF_HEARTS ],
        p0FaceCards: [],
        p1Hand: [ Card.NINE_OF_SPADES, Card.KING_OF_DIAMONDS, Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_HEARTS ],
      });
    }); // End 9 one-off high-point card

    it('Plays a nine as a ONE-OFF returning a face card and a point card', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.NINE_OF_SPADES, Card.NINE_OF_HEARTS ],
        p0Points: [ Card.TEN_OF_HEARTS ],
        p0FaceCards: [],
        p1Hand: [ Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS ],
        p1Points: [ Card.ACE_OF_DIAMONDS ],
        p1FaceCards: [ Card.KING_OF_DIAMONDS ],
      });

      // Mixed pair: one royal and one point card
      playNineOneOff('[data-player-hand-card=9-3]', [
        '[data-opponent-face-card=13-1]', // king of diamonds
        '[data-opponent-point-card=1-1]', // ace of diamonds
      ]);

      // Wait for opponent to resolve
      cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
      cy.resolveOpponent();

      assertGameState(0, {
        p0Hand: [ Card.NINE_OF_HEARTS ],
        p0Points: [ Card.TEN_OF_HEARTS ],
        p0FaceCards: [],
        p1Hand: [ Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS, Card.KING_OF_DIAMONDS, Card.ACE_OF_DIAMONDS ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_SPADES ],
      });
    }); // End 9 on face card + point card

    it('Plays a 9 on a jack to steal back point card', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.ACE_OF_SPADES, Card.NINE_OF_CLUBS ],
        p0Points: [ Card.TEN_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [ Card.JACK_OF_CLUBS ],
        p1Points: [],
        p1FaceCards: [ Card.KING_OF_DIAMONDS ],
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
        p1FaceCards: [ Card.KING_OF_DIAMONDS ],
      });

      // Opponent plays jack
      cy.playJackOpponent(Card.JACK_OF_CLUBS, Card.ACE_OF_SPADES);

      assertGameState(0, {
        p0Hand: [ Card.NINE_OF_CLUBS ],
        p0Points: [ Card.TEN_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [ Card.ACE_OF_SPADES ],
        p1FaceCards: [ Card.KING_OF_DIAMONDS ],
      });

      // Player plays NINE to destroy the jack and take back the ace.
      // The jacked point card is NOT a target, so it reverts to its owner's points.
      playNineOneOff('[data-player-hand-card=9-0]', [
        '[data-opponent-face-card=11-0]', // jack of clubs
        '[data-opponent-face-card=13-1]', // king of diamonds
      ]);

      // Wait for opponent to resolve
      cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
      cy.resolveOpponent();

      assertGameState(0, {
        p0Hand: [],
        p0Points: [ Card.ACE_OF_SPADES, Card.TEN_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [ Card.JACK_OF_CLUBS, Card.KING_OF_DIAMONDS ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_CLUBS ],
      });

      // Should no longer see jack of clubs on screen
      cy.get('[data-player-face-card=11-0]').should('not.exist');
    }); // End 9 on jack

    it('Plays a 9 on a jack AND the point card it is stealing, returning both to the jack holder', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.ACE_OF_SPADES, Card.NINE_OF_CLUBS ],
        p0Points: [ Card.TEN_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [ Card.JACK_OF_CLUBS ],
        p1Points: [],
        p1FaceCards: [],
      });

      // Player plays Ace of Spades, opponent jacks it
      cy.get('[data-player-hand-card=1-3]').click();
      cy.get('[data-move-choice=points]').click();
      cy.playJackOpponent(Card.JACK_OF_CLUBS, Card.ACE_OF_SPADES);

      assertGameState(0, {
        p0Hand: [ Card.NINE_OF_CLUBS ],
        p0Points: [ Card.TEN_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [ Card.ACE_OF_SPADES ],
        p1FaceCards: [],
      });

      // Targeting both the jack and the card it stole. Both resolve simultaneously, so both
      // go to the hand of the player who controlled them -- the opponent who played the jack.
      playNineOneOff('[data-player-hand-card=9-0]', [
        '[data-opponent-face-card=11-0]', // jack of clubs
        '[data-opponent-point-card=1-3]', // ace of spades, the card the jack stole
      ]);

      cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
      cy.resolveOpponent();

      assertGameState(0, {
        p0Hand: [],
        p0Points: [ Card.TEN_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [ Card.JACK_OF_CLUBS, Card.ACE_OF_SPADES ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_CLUBS ],
      });
    }); // End 9 on jack + its own host

    it('Plays a 9 on a point card that has been triple jacked', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.ACE_OF_SPADES, Card.NINE_OF_CLUBS, Card.JACK_OF_SPADES ],
        p0Points: [ Card.TEN_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [ Card.JACK_OF_CLUBS, Card.JACK_OF_DIAMONDS, Card.NINE_OF_HEARTS ],
        p1Points: [],
        p1FaceCards: [ Card.KING_OF_DIAMONDS ],
      });

      // Player plays Ace of Spades
      cy.get('[data-player-hand-card=1-3]').click();
      cy.get('[data-move-choice=points]').click();

      // Opponent jacks it, player jacks it back, opponent jacks it again
      cy.playJackOpponent(Card.JACK_OF_CLUBS, Card.ACE_OF_SPADES);
      cy.get('[data-player-hand-card=11-3]').click();
      cy.get('[data-move-choice=jack]').click();
      cy.get('#player-hand-targeting').should('be.visible');
      cy.get('[data-opponent-point-card=1-3]').click({ force: true });
      cy.playJackOpponent(Card.JACK_OF_DIAMONDS, Card.ACE_OF_SPADES);

      // Nine the triple-jacked point card itself, plus the king. All three jacks are
      // scrapped since none of them was targeted.
      playNineOneOff('[data-player-hand-card=9-0]', [
        '[data-opponent-point-card=1-3]', // ace of spades, triple jacked
        '[data-opponent-face-card=13-1]', // king of diamonds
      ]);

      cy.resolveOpponent();

      assertGameState(0, {
        p0Hand: [],
        p0Points: [ Card.TEN_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [ Card.NINE_OF_HEARTS, Card.ACE_OF_SPADES, Card.KING_OF_DIAMONDS ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [
          Card.JACK_OF_DIAMONDS,
          Card.JACK_OF_CLUBS,
          Card.JACK_OF_SPADES,
          Card.NINE_OF_CLUBS,
        ],
      });
    }); // End 9 on triple jacked point card

    it('Plays a 9 on a point card and a jack attached to a different point card', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.ACE_OF_SPADES, Card.NINE_OF_CLUBS ],
        p0Points: [ Card.TEN_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [ Card.JACK_OF_CLUBS ],
        p1Points: [ Card.FOUR_OF_DIAMONDS ],
        p1FaceCards: [],
      });

      // Player plays Ace of Spades, opponent jacks it
      cy.get('[data-player-hand-card=1-3]').click();
      cy.get('[data-move-choice=points]').click();
      cy.playJackOpponent(Card.JACK_OF_CLUBS, Card.ACE_OF_SPADES);

      // Target the jack (whose host reverts to its owner) and an unrelated point card
      playNineOneOff('[data-player-hand-card=9-0]', [
        '[data-opponent-face-card=11-0]', // jack of clubs, stealing the ace
        '[data-opponent-point-card=4-1]', // four of diamonds
      ]);

      cy.resolveOpponent();

      assertGameState(0, {
        p0Hand: [],
        p0Points: [ Card.TEN_OF_SPADES, Card.ACE_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [ Card.JACK_OF_CLUBS, Card.FOUR_OF_DIAMONDS ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_CLUBS ],
      });
    }); // End 9 on point card + jack on a different host

    it('Cancels playing a nine one off after selecting no targets and after selecting both', () => {
      const initialState = {
        p0Hand: [ Card.NINE_OF_HEARTS, Card.NINE_OF_SPADES ],
        p0Points: [ Card.TEN_OF_HEARTS ],
        p0FaceCards: [],
        p1Hand: [ Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS ],
        p1Points: [ Card.ACE_OF_DIAMONDS, Card.FOUR_OF_DIAMONDS ],
        p1FaceCards: [],
        scrap: [],
      };
      cy.loadGameFixture(0, initialState);

      // Cancel before choosing any target
      cy.get('[data-player-hand-card=9-3]').click();
      cy.get('[data-move-choice=targetedOneOff]').click();
      cy.get('#player-hand-targeting').should('be.visible');
      cy.get('[data-cy=cancel-target]').click();
      cy.get('#player-hand-targeting').should('not.exist');
      assertGameState(0, initialState);

      // Cancel after choosing one target
      cy.get('[data-player-hand-card=9-3]').click();
      cy.get('[data-move-choice=targetedOneOff]').click();
      cy.get('[data-opponent-point-card=1-1]').click({ force: true });
      cy.get('[data-cy=cancel-target]').click();
      cy.get('#player-hand-targeting').should('not.exist');
      assertGameState(0, initialState);

      // Cancel after choosing both targets, without confirming
      cy.get('[data-player-hand-card=9-3]').click();
      cy.get('[data-move-choice=targetedOneOff]').click();
      cy.get('[data-opponent-point-card=1-1]').click({ force: true });
      cy.get('[data-opponent-point-card=4-1]').click({ force: true });
      cy.get('[data-cy=confirm-targets]').should('not.be.disabled');
      cy.get('[data-cy=cancel-target]').click();
      cy.get('#player-hand-targeting').should('not.exist');
      assertGameState(0, initialState);
    });

    it('Requires two targets before the nine one-off can be confirmed, and allows deselecting', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.NINE_OF_SPADES ],
        p0Points: [ Card.TEN_OF_HEARTS ],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [ Card.ACE_OF_DIAMONDS, Card.FOUR_OF_DIAMONDS, Card.FIVE_OF_DIAMONDS ],
        p1FaceCards: [],
      });

      cy.get('[data-player-hand-card=9-3]').click();
      cy.get('[data-move-choice=targetedOneOff]').click();
      cy.get('#player-hand-targeting').should('be.visible');

      // Nothing chosen yet
      cy.get('[data-cy=confirm-targets]').should('be.disabled');

      // One chosen is still not enough
      cy.get('[data-opponent-point-card=1-1]').click({ force: true });
      cy.get('[data-cy=confirm-targets]').should('be.disabled');

      // Clicking a chosen target again deselects it
      cy.get('[data-opponent-point-card=1-1]').click({ force: true });
      cy.get('[data-cy=confirm-targets]').should('be.disabled');

      // Choose a different pair and send it
      cy.get('[data-opponent-point-card=4-1]').click({ force: true });
      cy.get('[data-opponent-point-card=5-1]').click({ force: true });
      cy.get('[data-cy=confirm-targets]').should('not.be.disabled')
        .click();

      cy.resolveOpponent();

      // The deselected ace stayed on the board; the confirmed pair bounced
      assertGameState(0, {
        p0Hand: [],
        p0Points: [ Card.TEN_OF_HEARTS ],
        p0FaceCards: [],
        p1Hand: [ Card.FOUR_OF_DIAMONDS, Card.FIVE_OF_DIAMONDS ],
        p1Points: [ Card.ACE_OF_DIAMONDS ],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_SPADES ],
      });
    });

    it('Cannot play a nine one-off while the opponent has a queen', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.NINE_OF_SPADES ],
        p0Points: [ Card.TEN_OF_HEARTS ],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [ Card.ACE_OF_DIAMONDS, Card.FOUR_OF_DIAMONDS ],
        p1FaceCards: [ Card.QUEEN_OF_DIAMONDS ],
      });

      cy.get('[data-player-hand-card=9-3]').click();

      // The move choice explains why a single queen is enough to stop a nine
      cy.get('[data-move-choice=targetedOneOff]')
        .should('have.class', 'v-card--disabled')
        .should('contain', 'You can\'t play a Nine while your opponent has a Queen')
        .click({ force: true });

      // Forcing the request through anyway is rejected by the server
      cy.get('#player-hand-targeting').should('be.visible');
      cy.get('[data-opponent-point-card=1-1]').click({ force: true });
      cy.get('[data-opponent-point-card=4-1]').click({ force: true });
      cy.get('[data-cy=confirm-targets]').click();
      assertSnackbar(SnackBarError.ONE_OFF.NINE.BLOCKED_BY_ANY_QUEEN);

      assertGameState(0, {
        p0Hand: [ Card.NINE_OF_SPADES ],
        p0Points: [ Card.TEN_OF_HEARTS ],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [ Card.ACE_OF_DIAMONDS, Card.FOUR_OF_DIAMONDS ],
        p1FaceCards: [ Card.QUEEN_OF_DIAMONDS ],
        scrap: [],
      });
    });

    it('Cannot play a nine one-off with fewer than two legal targets', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.NINE_OF_SPADES ],
        p0Points: [ Card.TEN_OF_HEARTS ],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [ Card.ACE_OF_DIAMONDS ],
        p1FaceCards: [],
      });

      cy.get('[data-player-hand-card=9-3]').click();
      cy.get('[data-move-choice=targetedOneOff]')
        .should('have.class', 'v-card--disabled')
        .should('contain', 'A Nine needs two cards to target');
    });

    it('Plays a nine as a ONE-OFF, make sure that the bounced cards are playable later', () => {
      /*
      1). P0 plays a 9, targeting both of P1's in-play Kings
      2). P1 plays a 6's one-off, removing some cards
      3). P0 plays a Jack, targeting an in-play Four
      4). P1 can replay one of their bounced Kings right away
       */

      // Initial state
      cy.loadGameFixture(0, {
        p0Hand: [ Card.NINE_OF_SPADES, Card.JACK_OF_SPADES ],
        p0Points: [],
        p0FaceCards: [ Card.KING_OF_HEARTS ],
        p1Hand: [ Card.SIX_OF_HEARTS ],
        // Two kings drop the opponent's goal to 10, so their points must stay below it
        p1Points: [ Card.FOUR_OF_HEARTS ],
        p1FaceCards: [ Card.KING_OF_DIAMONDS, Card.KING_OF_CLUBS ],
      });

      // STEP 1
      cy.log('STEP 1- P0 plays nine, targeting both Kings in play');
      playNineOneOff('[data-player-hand-card=9-3]', [
        '[data-opponent-face-card=13-1]', // king of diamonds
        '[data-opponent-face-card=13-0]', // king of clubs
      ]);

      // Wait for opponent to resolve
      cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
      cy.resolveOpponent();

      assertGameState(0, {
        p0Hand: [ Card.JACK_OF_SPADES ],
        p0Points: [],
        p0FaceCards: [ Card.KING_OF_HEARTS ],
        p1Hand: [ Card.SIX_OF_HEARTS, Card.KING_OF_DIAMONDS, Card.KING_OF_CLUBS ],
        p1Points: [ Card.FOUR_OF_HEARTS ],
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
        p1Hand: [ Card.KING_OF_DIAMONDS, Card.KING_OF_CLUBS ],
        p1Points: [ Card.FOUR_OF_HEARTS ],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_SPADES, Card.KING_OF_HEARTS, Card.SIX_OF_HEARTS ],
      });

      // STEP 3
      cy.log('STEP 3- P0 plays a Jack, targeting the Four');
      cy.get('[data-player-hand-card=11-3]').click();
      cy.get('[data-move-choice=jack]').click();
      cy.get('[data-opponent-point-card=4-2]').click();

      assertGameState(0, {
        p0Hand: [],
        p0Points: [ Card.FOUR_OF_HEARTS ],
        p0FaceCards: [],
        p1Hand: [ Card.KING_OF_DIAMONDS, Card.KING_OF_CLUBS ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_SPADES, Card.KING_OF_HEARTS, Card.SIX_OF_HEARTS ],
      });

      // STEP 4
      cy.log('STEP 4- P1 plays one of their previously bounced Kings');
      cy.playFaceCardOpponent(Card.KING_OF_DIAMONDS);

      assertGameState(0, {
        p0Hand: [],
        p0Points: [ Card.FOUR_OF_HEARTS ],
        p0FaceCards: [],
        p1Hand: [ Card.KING_OF_CLUBS ],
        p1Points: [],
        p1FaceCards: [ Card.KING_OF_DIAMONDS ],
        scrap: [ Card.NINE_OF_SPADES, Card.KING_OF_HEARTS, Card.SIX_OF_HEARTS ],
      });
    });

    it('Plays a nine as a ONE-OFF, bounced cards are playable even if there is countering', () => {
      /*
      1). P0 plays 9 one-off, targeting both of P1's Kings
      2). P1 plays 6's one-off
      3). P0 counters and it fizzles
      4). P0 plays their Jack, targeting P1's Four
      5). P1 plays a bounced King again right away
       */

      // Initial state
      cy.loadGameFixture(0, {
        p0Hand: [ Card.TWO_OF_SPADES, Card.NINE_OF_SPADES, Card.JACK_OF_SPADES ],
        p0Points: [],
        p0FaceCards: [ Card.KING_OF_HEARTS ],
        p1Hand: [ Card.SIX_OF_HEARTS ],
        // Two kings drop the opponent's goal to 10, so their points must stay below it
        p1Points: [ Card.FOUR_OF_HEARTS ],
        p1FaceCards: [ Card.KING_OF_DIAMONDS, Card.KING_OF_CLUBS ],
      });

      // STEP 1
      cy.log('STEP 1- P0 plays nine, targeting both Kings in play');
      playNineOneOff('[data-player-hand-card=9-3]', [
        '[data-opponent-face-card=13-1]', // king of diamonds
        '[data-opponent-face-card=13-0]', // king of clubs
      ]);

      // Wait for opponent to resolve
      cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
      cy.resolveOpponent();

      assertGameState(0, {
        p0Hand: [ Card.TWO_OF_SPADES, Card.JACK_OF_SPADES ],
        p0Points: [],
        p0FaceCards: [ Card.KING_OF_HEARTS ],
        p1Hand: [ Card.SIX_OF_HEARTS, Card.KING_OF_DIAMONDS, Card.KING_OF_CLUBS ],
        p1Points: [ Card.FOUR_OF_HEARTS ],
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
        p1Hand: [ Card.KING_OF_DIAMONDS, Card.KING_OF_CLUBS ],
        p1Points: [ Card.FOUR_OF_HEARTS ],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_SPADES, Card.SIX_OF_HEARTS, Card.TWO_OF_SPADES ],
      });

      // STEP 4
      cy.log('STEP 4- P0 Jacks P1\'s Four');
      cy.get('[data-player-hand-card=11-3]').click();
      cy.get('[data-move-choice=jack]').click();
      cy.get('#player-hand-targeting').should('be.visible');
      cy.get('[data-opponent-point-card=4-2]').click();

      // STEP 5
      cy.log('STEP 5- P1 plays a previously bounced King');
      cy.playFaceCardOpponent(Card.KING_OF_DIAMONDS);

      assertGameState(0, {
        p0Hand: [],
        p0Points: [ Card.FOUR_OF_HEARTS ],
        p0FaceCards: [ Card.KING_OF_HEARTS ],
        p1Hand: [ Card.KING_OF_CLUBS ],
        p1Points: [],
        p1FaceCards: [ Card.KING_OF_DIAMONDS ],
        scrap: [ Card.NINE_OF_SPADES, Card.SIX_OF_HEARTS, Card.TWO_OF_SPADES ],
      });
    });
  }); // End Player playing 9s describe

  describe('Opponent Playing NINES', () => {
    beforeEach(() => {
      cy.setupGameAsP1();
    });

    it('Opponent plays a NINE on a jack to steal back point card, and the jack is replayable at once', () => {
      cy.loadGameFixture(1, {
        p0Hand: [ Card.ACE_OF_SPADES, Card.NINE_OF_CLUBS, Card.ACE_OF_DIAMONDS ],
        p0Points: [ Card.TEN_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [ Card.JACK_OF_CLUBS, Card.TEN_OF_DIAMONDS ],
        p1Points: [],
        p1FaceCards: [ Card.KING_OF_DIAMONDS ],
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
        p1FaceCards: [ Card.KING_OF_DIAMONDS ],
      });

      // Opponent nines the jack and the king. The jacked ace is not a target, so it
      // reverts to its owner's points.
      cy.playTargetedOneOffOpponent(
        Card.NINE_OF_CLUBS,
        Card.JACK_OF_CLUBS,
        'jack',
        Card.KING_OF_DIAMONDS,
        'faceCard',
      );

      // Player resolves
      cy.get('#cannot-counter-dialog').should('be.visible')
        .get('[data-cy=cannot-counter-resolve]')
        .click();

      assertGameState(1, {
        p0Hand: [ Card.ACE_OF_DIAMONDS ],
        p0Points: [ Card.TEN_OF_SPADES, Card.ACE_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [ Card.JACK_OF_CLUBS, Card.TEN_OF_DIAMONDS, Card.KING_OF_DIAMONDS ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_CLUBS ],
      });

      // Nines no longer freeze what they return, so the jack is playable immediately
      cy.get('[data-player-hand-card=11-0]').should('not.have.class', 'frozen');
      cy.get('[data-player-hand-card=11-0]').click();
      cy.get('[data-player-overlay-card=11-0]').should('not.have.class', 'frozen');
      cy.get('[data-move-choice=jack]').should('not.have.class', 'v-card--disabled')
        .click();
      cy.get('#player-hand-targeting').should('be.visible');
      cy.get('[data-opponent-point-card=1-3]').click();
      cy.log('Correctly allowed player to replay the returned card immediately');

      assertGameState(1, {
        p0Hand: [ Card.ACE_OF_DIAMONDS ],
        p0Points: [ Card.TEN_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [ Card.TEN_OF_DIAMONDS, Card.KING_OF_DIAMONDS ],
        p1Points: [ Card.ACE_OF_SPADES ],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_CLUBS ],
      });
    }); // End 9 on jack

    it('Keeps returned cards playable after requesting a stalemate and reloading', () => {
      cy.loadGameFixture(1, {
        p0Hand: [ Card.NINE_OF_CLUBS ],
        p0Points: [ Card.THREE_OF_CLUBS ],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [ Card.SEVEN_OF_CLUBS, Card.FOUR_OF_CLUBS ],
        p1FaceCards: [],
        topCard: Card.TEN_OF_CLUBS,
      });

      // opponent plays nine to return both point cards to player's hand
      cy.playTargetedOneOffOpponent(
        Card.NINE_OF_CLUBS,
        Card.SEVEN_OF_CLUBS,
        'point',
        Card.FOUR_OF_CLUBS,
        'point',
      );

      // Player resolves
      cy.get('#cannot-counter-dialog').should('be.visible')
        .get('[data-cy=cannot-counter-resolve]')
        .click();

      assertGameState(1, {
        p0Hand: [],
        p0Points: [ Card.THREE_OF_CLUBS ],
        p0FaceCards: [],
        p1Hand: [ Card.SEVEN_OF_CLUBS, Card.FOUR_OF_CLUBS ],
        p1Points: [],
        p1FaceCards: [],
      });

      cy.get('[data-player-hand-card=7-0]').should('not.have.class', 'frozen');

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

      // Returned cards are still unfrozen, and stay that way through a reload
      cy.get('[data-player-hand-card=7-0]').should('not.have.class', 'frozen');
      cy.reload();
      cy.get('[data-player-hand-card=7-0]').should('not.have.class', 'frozen');

      assertGameState(1, {
        p0Hand: [],
        p0Points: [ Card.THREE_OF_CLUBS ],
        p0FaceCards: [],
        p1Hand: [ Card.SEVEN_OF_CLUBS, Card.FOUR_OF_CLUBS ],
        p1Points: [],
        p1FaceCards: [],
      });

      // And one of them can actually be played
      cy.get('[data-player-hand-card=7-0]').click();
      cy.get('[data-move-choice=points]').click();

      assertGameState(1, {
        p0Hand: [],
        p0Points: [ Card.THREE_OF_CLUBS ],
        p0FaceCards: [],
        p1Hand: [ Card.FOUR_OF_CLUBS ],
        p1Points: [ Card.SEVEN_OF_CLUBS ],
        p1FaceCards: [],
      });
    });

    it('Nine returns two cards to player hand past the hand limit', () => {
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
        p1Points: [ Card.TEN_OF_CLUBS, Card.TEN_OF_DIAMONDS ],
        p1FaceCards: [],
      });

      // Opponent (P0) plays nine targeting both of the player's (P1's) point cards.
      // The hand limit is only enforced at the end of the active player's turn, and the
      // active player here is P0, so P1 simply holds ten cards.
      cy.playTargetedOneOffOpponent(
        Card.NINE_OF_SPADES,
        Card.TEN_OF_CLUBS,
        'point',
        Card.TEN_OF_DIAMONDS,
        'point',
      );
      cy.get('#cannot-counter-dialog').should('be.visible')
        .get('[data-cy=cannot-counter-resolve]')
        .click();

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
          Card.TEN_OF_CLUBS,
          Card.TEN_OF_DIAMONDS,
        ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_SPADES ],
      });
    });
  }); // End Opponent playing NINES describe

  describe('Playing a NINE from a seven', () => {
    beforeEach(() => {
      cy.setupGameAsP0();
    });

    it('Plays a two-target nine off the top of the deck via a seven', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.SEVEN_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [ Card.ACE_OF_DIAMONDS ],
        p1FaceCards: [ Card.KING_OF_HEARTS ],
        topCard: Card.NINE_OF_SPADES,
        secondCard: Card.JACK_OF_CLUBS,
      });

      cy.playOneOffAndResolveAsPlayer(Card.SEVEN_OF_CLUBS);

      // Play the nine off the top of the deck, targeting both of the opponent's cards
      cy.get('[data-top-card=9-3]').should('exist')
        .and('be.visible')
        .click();
      cy.get('[data-move-choice=targetedOneOff]').click();
      cy.get('#player-hand-targeting').should('be.visible');
      cy.get('[data-opponent-face-card=13-2]').click({ force: true }); // king of hearts
      cy.get('[data-opponent-point-card=1-1]').click({ force: true }); // ace of diamonds
      cy.get('[data-cy=confirm-targets]').should('not.be.disabled')
        .click();

      cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
      cy.resolveOpponent();
      cy.get('#waiting-for-opponent-counter-scrim').should('not.exist');

      assertGameState(0, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.KING_OF_HEARTS, Card.ACE_OF_DIAMONDS ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.SEVEN_OF_CLUBS, Card.NINE_OF_SPADES ],
      });
    });
  }); // End playing a NINE from a seven

  describe('Nine triggers discard-to-hand-limit', () => {
    beforeEach(() => {
      cy.setupGameAsP0();
    });

    it('Nine returns two cards to opponent hand at hand limit', () => {
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
        p1Points: [ Card.TEN_OF_DIAMONDS, Card.NINE_OF_DIAMONDS ],
        p1FaceCards: [],
      });

      // Player plays nine as targeted one-off against both of the opponent's point cards
      playNineOneOff('[data-player-hand-card=9-3]', [
        '[data-opponent-point-card=10-1]', // ten of diamonds
        '[data-opponent-point-card=9-1]', // nine of diamonds
      ]);
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
          Card.TEN_OF_DIAMONDS,
          Card.NINE_OF_DIAMONDS,
        ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.NINE_OF_SPADES ],
      });
    });

  }); // End Nine triggers discard-to-hand-limit
});
