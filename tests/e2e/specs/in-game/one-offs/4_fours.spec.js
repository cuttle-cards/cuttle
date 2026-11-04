import { assertGameState } from '../../../support/helpers';
import { Card } from '../../../fixtures/cards';

/**
 * As of rules 4.0.0 a four makes its victim reveal three cards from their hand, then lets the
 * four's player choose two of them for the victim to discard. Steps that offer no choice are
 * skipped: a hand of exactly three is revealed whole, and a hand of two or fewer is discarded
 * outright as the four resolves.
 */
describe('FOURS', () => {
  describe('Playing FOURS', () => {
    beforeEach(() => {
      cy.setupGameAsP0();
    });

    it('Plays a 4, then chooses two of the three cards the opponent reveals for them to discard', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.FOUR_OF_SPADES, Card.FOUR_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS, Card.TEN_OF_HEARTS, Card.KING_OF_SPADES ],
        p1Points: [],
        p1FaceCards: [],
      });

      cy.playOneOffAndResolveAsPlayer(Card.FOUR_OF_SPADES);

      // Opponent chooses which three cards to reveal
      cy.get('#waiting-for-opponent-reveal-four-scrim').should('be.visible');
      cy.get('[data-cy=history-log]').should(
        'contain',
        'The 4♠️ one-off resolves; definitelyNotTheGovernment6969 must reveal three cards from their hand.',
      );
      cy.revealFourOpponent(Card.ACE_OF_HEARTS, Card.TEN_OF_HEARTS, Card.KING_OF_SPADES);
      cy.get('#waiting-for-opponent-reveal-four-scrim').should('not.exist');
      cy.get('[data-cy=history-log]').should(
        'contain',
        'definitelyNotTheGovernment6969 revealed the A♥️, the 10♥️, and the K♠️.',
      );

      // Player chooses two of the revealed cards; the unrevealed ace isn't offered
      cy.get('#four-choose-discard-dialog')
        .should('be.visible')
        .within(() => {
          cy.get('[data-four-discard-card]').should('have.length', 3);
          cy.get('[data-four-discard-card=1-1]').should('not.exist');
          cy.get('[data-cy=submit-four-discard-dialog]').should('be.disabled');
          cy.get('[data-four-discard-card=1-2]').click();
          cy.get('[data-cy=submit-four-discard-dialog]').should('be.disabled');
          cy.get('[data-four-discard-card=13-3]').click();
          cy.get('[data-cy=submit-four-discard-dialog]').should('not.be.disabled')
            .click();
        });

      cy.get('#four-choose-discard-dialog').should('not.exist');
      cy.get('[data-cy=history-log]').should(
        'contain',
        'myUsername chose the A♥️ and the K♠️ for definitelyNotTheGovernment6969 to discard.',
      );

      assertGameState(0, {
        p0Hand: [ Card.FOUR_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.ACE_OF_DIAMONDS, Card.TEN_OF_HEARTS ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.FOUR_OF_SPADES, Card.ACE_OF_HEARTS, Card.KING_OF_SPADES ],
      });
      // The four completes the player's turn
      cy.get('#turn-indicator').contains('OPPONENT\'S TURN');
    });

    it('Skips the reveal when the opponent holds exactly three cards', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.FOUR_OF_SPADES ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.ACE_OF_HEARTS, Card.TEN_OF_HEARTS, Card.KING_OF_SPADES ],
        p1Points: [],
        p1FaceCards: [],
      });

      cy.playOneOffAndResolveAsPlayer(Card.FOUR_OF_SPADES);

      cy.get('#waiting-for-opponent-reveal-four-scrim').should('not.exist');
      cy.get('[data-cy=history-log]').should(
        'contain',
        'The 4♠️ one-off resolves, revealing definitelyNotTheGovernment6969\'s whole hand: the A♥️, the 10♥️, and the K♠️.',
      );

      cy.get('#four-choose-discard-dialog')
        .should('be.visible')
        .within(() => {
          cy.get('[data-four-discard-card]').should('have.length', 3);
          cy.get('[data-four-discard-card=1-2]').click();
          cy.get('[data-four-discard-card=10-2]').click();
          cy.get('[data-cy=submit-four-discard-dialog]').click();
        });

      assertGameState(0, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.KING_OF_SPADES ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.FOUR_OF_SPADES, Card.ACE_OF_HEARTS, Card.TEN_OF_HEARTS ],
      });
    });

    it('Discards both of the opponent\'s cards when they hold just two', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.FOUR_OF_SPADES, Card.FOUR_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.ACE_OF_HEARTS, Card.TEN_OF_HEARTS ],
        p1Points: [],
        p1FaceCards: [],
      });

      cy.playOneOffAndResolveAsPlayer(Card.FOUR_OF_SPADES);

      // The opponent's discards are revealed in their hand before landing in the scrap (#1440)
      cy.get('[data-opponent-hand-card=1-2]').should('be.visible');
      cy.get('[data-opponent-hand-card=10-2]').should('be.visible');

      // Nothing to choose, so no further steps
      cy.get('#waiting-for-opponent-reveal-four-scrim').should('not.exist');
      cy.get('#four-choose-discard-dialog').should('not.exist');
      cy.get('[data-cy=history-log]').should(
        'contain',
        'The 4♠️ one-off resolves, discarding the A♥️ and the 10♥️ from definitelyNotTheGovernment6969\'s hand.',
      );

      assertGameState(0, {
        p0Hand: [ Card.FOUR_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.FOUR_OF_SPADES, Card.ACE_OF_HEARTS, Card.TEN_OF_HEARTS ],
      });
    });

    it('Discards the opponent\'s only card when they hold just one', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.FOUR_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.ACE_OF_HEARTS ],
        p1Points: [],
        p1FaceCards: [],
      });

      cy.playOneOffAndResolveAsPlayer(Card.FOUR_OF_CLUBS);

      cy.get('[data-cy=history-log]').should(
        'contain',
        'The 4♣️ one-off resolves, discarding the A♥️ from definitelyNotTheGovernment6969\'s hand.',
      );

      assertGameState(0, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.FOUR_OF_CLUBS, Card.ACE_OF_HEARTS ],
      });
    });

    it('Can play a 4 against an empty hand, discarding nothing', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.FOUR_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
      });

      cy.playOneOffAndResolveAsPlayer(Card.FOUR_OF_CLUBS);

      cy.get('[data-cy=history-log]').should(
        'contain',
        'The 4♣️ one-off resolves; definitelyNotTheGovernment6969 has no cards to discard.',
      );

      assertGameState(0, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.FOUR_OF_CLUBS ],
      });
    });

    it('Plays a 4 while the player has glasses', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.FOUR_OF_SPADES ],
        p0Points: [],
        p0FaceCards: [ Card.EIGHT_OF_CLUBS ],
        p1Hand: [ Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS, Card.TEN_OF_HEARTS, Card.KING_OF_SPADES ],
        p1Points: [],
        p1FaceCards: [],
      });

      cy.playOneOffAndResolveAsPlayer(Card.FOUR_OF_SPADES);
      cy.get('#waiting-for-opponent-reveal-four-scrim').should('be.visible');
      cy.revealFourOpponent(Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS, Card.TEN_OF_HEARTS);

      cy.get('#four-choose-discard-dialog')
        .should('be.visible')
        .within(() => {
          cy.get('[data-four-discard-card=1-1]').click();
          cy.get('[data-four-discard-card=10-2]').click();
          cy.get('[data-cy=submit-four-discard-dialog]').click();
        });

      assertGameState(0, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [ Card.EIGHT_OF_CLUBS ],
        p1Hand: [ Card.ACE_OF_HEARTS, Card.KING_OF_SPADES ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.FOUR_OF_SPADES, Card.ACE_OF_DIAMONDS, Card.TEN_OF_HEARTS ],
      });
    });
  });

  describe('Opponent playing FOURS', () => {
    beforeEach(() => {
      cy.setupGameAsP1();
    });

    it('Reveals three cards when the opponent plays a four, then discards the two they choose', () => {
      cy.loadGameFixture(1, {
        p0Hand: [ Card.FOUR_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.ACE_OF_DIAMONDS, Card.TEN_OF_HEARTS, Card.SIX_OF_SPADES, Card.KING_OF_HEARTS ],
        p1Points: [],
        p1FaceCards: [],
      });

      cy.playOneOffOpponent(Card.FOUR_OF_CLUBS);
      cy.get('#cannot-counter-dialog')
        .should('be.visible')
        .get('[data-cy=cannot-counter-resolve]')
        .click();

      cy.get('#four-reveal-dialog')
        .should('be.visible')
        .within(() => {
          cy.get('[data-four-reveal-card]').should('have.length', 4);
          cy.get('[data-cy=submit-four-reveal-dialog]').should('be.disabled');
          cy.get('[data-four-reveal-card=1-1]').click();
          cy.get('[data-four-reveal-card=10-2]').click();
          cy.get('[data-cy=submit-four-reveal-dialog]').should('be.disabled');
          cy.get('[data-four-reveal-card=6-3]').click();
          cy.get('[data-cy=submit-four-reveal-dialog]').should('not.be.disabled')
            .click();
        });

      // Waits for the opponent's choice, seeing the revealed cards
      cy.get('#four-reveal-dialog').should('not.exist');
      cy.get('#waiting-for-opponent-choose-four-discards-scrim')
        .should('be.visible')
        .within(() => {
          cy.get('[data-overlay-revealed-card]').should('have.length', 3);
          cy.get('[data-overlay-revealed-card=13-2]').should('not.exist');
        });

      cy.discardFourOpponent(Card.ACE_OF_DIAMONDS, Card.SIX_OF_SPADES);
      cy.get('#waiting-for-opponent-choose-four-discards-scrim').should('not.exist');

      assertGameState(1, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.TEN_OF_HEARTS, Card.KING_OF_HEARTS ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.FOUR_OF_CLUBS, Card.ACE_OF_DIAMONDS, Card.SIX_OF_SPADES ],
      });
    });

    it('Reveals the player\'s whole hand when they hold exactly three cards', () => {
      cy.loadGameFixture(1, {
        p0Hand: [ Card.FOUR_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.ACE_OF_DIAMONDS, Card.TEN_OF_HEARTS, Card.SIX_OF_SPADES ],
        p1Points: [],
        p1FaceCards: [],
      });

      cy.playOneOffOpponent(Card.FOUR_OF_CLUBS);
      cy.get('#cannot-counter-dialog')
        .should('be.visible')
        .get('[data-cy=cannot-counter-resolve]')
        .click();

      cy.get('#four-reveal-dialog').should('not.exist');
      cy.get('#waiting-for-opponent-choose-four-discards-scrim')
        .should('be.visible')
        .find('[data-overlay-revealed-card]')
        .should('have.length', 3);

      cy.discardFourOpponent(Card.TEN_OF_HEARTS, Card.SIX_OF_SPADES);

      assertGameState(1, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.ACE_OF_DIAMONDS ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.FOUR_OF_CLUBS, Card.TEN_OF_HEARTS, Card.SIX_OF_SPADES ],
      });
    });

    it('Discards the player\'s two cards when the opponent plays a four', () => {
      cy.loadGameFixture(1, {
        p0Hand: [ Card.FOUR_OF_CLUBS, Card.FOUR_OF_DIAMONDS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.ACE_OF_DIAMONDS, Card.TEN_OF_HEARTS ],
        p1Points: [],
        p1FaceCards: [],
        topCard: Card.SIX_OF_DIAMONDS,
      });

      // The victim's own discards must not be revealed in their opponent's hand (#1440)
      cy.window()
        .its('cuttle.gameStore')
        .then((store) => {
          cy.spy(store, 'processFours').as('processFours');
        });

      cy.playOneOffOpponent(Card.FOUR_OF_CLUBS);
      cy.get('#cannot-counter-dialog')
        .should('be.visible')
        .get('[data-cy=cannot-counter-resolve]')
        .click();

      // Nothing to choose -- both cards are discarded as the four resolves
      cy.get('#four-reveal-dialog').should('not.exist');
      cy.get('#waiting-for-opponent-choose-four-discards-scrim').should('not.exist');

      assertGameState(1, {
        p0Hand: [ Card.FOUR_OF_DIAMONDS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.FOUR_OF_CLUBS, Card.ACE_OF_DIAMONDS, Card.TEN_OF_HEARTS ],
      });
      cy.get('@processFours').should('not.have.been.called');

      // A second four against the now-empty hand is still legal and discards nothing
      cy.get('#deck').click();
      cy.playOneOffOpponent(Card.FOUR_OF_DIAMONDS);
      cy.get('#cannot-counter-dialog')
        .should('be.visible')
        .get('[data-cy=cannot-counter-resolve]')
        .click();

      assertGameState(1, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
        scrap: [
          Card.FOUR_OF_CLUBS,
          Card.FOUR_OF_DIAMONDS,
          Card.ACE_OF_DIAMONDS,
          Card.TEN_OF_HEARTS,
          Card.SIX_OF_DIAMONDS,
        ],
      });
    });
  });

  /**
   * Fours resolved into a separate `resolveFour` move before rules 3.0.0, and stored games
   * still hold that phase. The move is gone, but the rendering path has to survive: unpacking
   * the phase, resolving the active player from it, and showing the discard dialog.
   */
  describe('Legacy four-discard states (pre-3.0.0 games)', () => {
    it('Renders a stored RESOLVING_FOUR state', () => {
      cy.setupGameAsP1();
      cy.loadGameFixture(1, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.ACE_OF_DIAMONDS, Card.TEN_OF_HEARTS ],
        p1Points: [],
        p1FaceCards: [],
        // GamePhase.RESOLVING_FOUR -- unreachable through play, staged directly. The four
        // sat in oneOff while the victim chose, which is where a real legacy row holds it.
        phase: 4,
        oneOff: Card.FOUR_OF_CLUBS,
      });

      // The frame must render rather than erroring on an unknown phase or active player
      cy.get('#four-discard-dialog').should('be.visible');
      cy.get('[data-discard-card=1-1]').should('be.visible');
      cy.get('[data-discard-card=10-2]').should('be.visible');
    });
  });
});
