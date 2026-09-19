import { assertGameState } from '../../../support/helpers';
import { Card } from '../../../fixtures/cards';

/**
 * Fours discard at random as of rules 3.0.0, so there is no choice to make and no discard
 * dialog. Most cases below give the victim exactly two cards, which makes the outcome
 * deterministic and assertable; the randomness itself is covered by its own test, which
 * asserts counts and membership rather than identities.
 */
describe('FOURS', () => {
  describe('Playing FOURS', () => {
    beforeEach(() => {
      cy.setupGameAsP0();
    });

    it('Plays a 4 to discard the opponent\'s two cards at random', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.FOUR_OF_SPADES, Card.FOUR_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.ACE_OF_HEARTS, Card.TEN_OF_HEARTS ],
        p1Points: [],
        p1FaceCards: [],
      });

      cy.playOneOffAndResolveAsPlayer(Card.FOUR_OF_SPADES);

      // Resolves immediately -- no discard step, so no scrim and no dialog
      cy.get('#waiting-for-opponent-discard-scrim').should('not.exist');
      cy.get('#four-discard-dialog').should('not.exist');

      // The log is the only channel naming what was lost
      cy.get('[data-cy=history-log]').should(
        'contain',
        'The 4♠️ one-off resolves, discarding the A♥️ and the 10♥️ at random from definitelyNotTheGovernment6969\'s hand.',
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

    it('Discards two of a larger hand at random, leaving the rest', () => {
      const startingHand = [
        Card.ACE_OF_HEARTS,
        Card.ACE_OF_DIAMONDS,
        Card.TEN_OF_HEARTS,
        Card.KING_OF_SPADES,
      ];
      cy.loadGameFixture(0, {
        p0Hand: [ Card.FOUR_OF_SPADES ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: startingHand,
        p1Points: [],
        p1FaceCards: [],
      });

      cy.playOneOffAndResolveAsPlayer(Card.FOUR_OF_SPADES);
      cy.get('#four-discard-dialog').should('not.exist');

      // Which two cards go is random, so assert the shape rather than the identities
      cy.window()
        .its('cuttle.gameStore')
        .then((game) => {
          expect(game.players[1].hand).to.have.length(2, 'Opponent should have discarded exactly two cards');
          expect(game.scrap).to.have.length(3, 'Scrap should hold the four plus the two discards');

          const discarded = game.scrap.filter((card) => card.rank !== 4 || card.suit !== 3);
          expect(discarded).to.have.length(2);
          discarded.forEach((card) => {
            const cameFromHand = startingHand.some(
              ({ rank, suit }) => rank === card.rank && suit === card.suit,
            );
            expect(cameFromHand).to.eq(true, `Discarded ${card.rank}-${card.suit} was not in the opening hand`);
          });
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
        'The 4♣️ one-off resolves, discarding the A♥️ at random from definitelyNotTheGovernment6969\'s hand.',
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

      // Used to be blocked; a random discard against no cards simply discards nothing
      cy.playOneOffAndResolveAsPlayer(Card.FOUR_OF_CLUBS);

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
        p0Hand: [ Card.FOUR_OF_SPADES, Card.FOUR_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [ Card.EIGHT_OF_CLUBS ],
        p1Hand: [ Card.ACE_OF_DIAMONDS, Card.TEN_OF_HEARTS ],
        p1Points: [],
        p1FaceCards: [],
      });

      cy.playOneOffAndResolveAsPlayer(Card.FOUR_OF_SPADES);

      assertGameState(0, {
        p0Hand: [ Card.FOUR_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [ Card.EIGHT_OF_CLUBS ],
        p1Hand: [],
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

      cy.playOneOffOpponent(Card.FOUR_OF_CLUBS);
      cy.get('#cannot-counter-dialog')
        .should('be.visible')
        .get('[data-cy=cannot-counter-resolve]')
        .click();

      // No dialog to answer -- the discard has already happened
      cy.get('#four-discard-dialog').should('not.exist');

      assertGameState(1, {
        p0Hand: [ Card.FOUR_OF_DIAMONDS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.FOUR_OF_CLUBS, Card.ACE_OF_DIAMONDS, Card.TEN_OF_HEARTS ],
      });

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

    it('Discards the player\'s last card when FOURd with one card in hand', () => {
      cy.loadGameFixture(1, {
        p0Hand: [ Card.FOUR_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.ACE_OF_DIAMONDS ],
        p1Points: [],
        p1FaceCards: [],
      });

      cy.playOneOffOpponent(Card.FOUR_OF_CLUBS);
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
        scrap: [ Card.FOUR_OF_CLUBS, Card.ACE_OF_DIAMONDS ],
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
