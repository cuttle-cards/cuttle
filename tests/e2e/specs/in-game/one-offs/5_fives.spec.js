import { assertGameState, playOutOfTurn } from '../../../support/helpers';
import { Card } from '../../../fixtures/cards';

describe('FIVES', () => {
  describe('Playing FIVES', () => {
    beforeEach(() => {
      cy.setupGameAsP0();
    });

    describe('Legal FIVES', () => {
      it('Plays a 5 to discard 1 card, and draw 3', () => {
        // Setup
        cy.loadGameFixture(0, {
          // Player is P0
          p0Hand: [ Card.ACE_OF_CLUBS, Card.FIVE_OF_SPADES, Card.FIVE_OF_HEARTS ],
          p0Points: [ Card.TEN_OF_SPADES, Card.ACE_OF_SPADES ],
          p0FaceCards: [ Card.KING_OF_SPADES ],
          // Opponent is P1
          p1Hand: [ Card.ACE_OF_HEARTS ],
          p1Points: [ Card.TEN_OF_HEARTS, Card.ACE_OF_DIAMONDS ],
          p1FaceCards: [ Card.KING_OF_HEARTS ],
          // Deck
          topCard: Card.THREE_OF_CLUBS,
          secondCard: Card.EIGHT_OF_HEARTS,
        });
        // Player plays five
        cy.playOneOffAndResolveAsPlayer(Card.FIVE_OF_SPADES);
        cy.get('[data-cy=five-discard-dialog]').should('be.visible');
        cy.get('[data-discard-card=1-0]').click();
        cy.get('[data-cy=submit-five-dialog]').click();

        cy.get('#deck').should('contain', '(39)');
        cy.get('[data-player-hand-card]').should('have.length', 4);
        // Attempt to plays five out of turn
        cy.get('[data-player-hand-card=5-2]').click(); // five of hearts
        playOutOfTurn('oneOff');
      }); // End five one-off

      it('Plays a 5 to draw the last three cards in the deck with nothing to discard', () => {
        // Setup: player has one card in hand and only top & second card are in deck
        cy.loadGameFixture(0, {
          // Player is P0
          p0Hand: [ Card.FIVE_OF_CLUBS ],
          p0Points: [],
          p0FaceCards: [],
          // Opponent is P1
          p1Hand: [],
          p1Points: [],
          p1FaceCards: [],
          // Deck
          topCard: Card.THREE_OF_CLUBS,
          secondCard: Card.EIGHT_OF_HEARTS,
          deck: [ Card.SEVEN_OF_CLUBS ],
        });
        cy.get('#deck').should('contain', '(3)');

        // Player plays and resolves a 5
        cy.playOneOffAndResolveAsPlayer(Card.FIVE_OF_CLUBS);
        cy.get('[data-cy=five-discard-dialog]').should('be.visible');
        cy.get('[data-cy=submit-five-dialog]').click();

        assertGameState(0, {
          p0Hand: [ Card.THREE_OF_CLUBS, Card.EIGHT_OF_HEARTS, Card.SEVEN_OF_CLUBS ],
          p0Points: [],
          p0FaceCards: [],
          p1Hand: [],
          p1Points: [],
          p1FaceCards: [],
          scrap: [ Card.FIVE_OF_CLUBS, Card.ACE_OF_CLUBS, Card.TWO_OF_CLUBS, Card.FOUR_OF_CLUBS,
            Card.SIX_OF_CLUBS, Card.EIGHT_OF_CLUBS, Card.NINE_OF_CLUBS, Card.TEN_OF_CLUBS,
            Card.JACK_OF_CLUBS, Card.QUEEN_OF_CLUBS, Card.KING_OF_CLUBS, Card.ACE_OF_DIAMONDS,
            Card.TWO_OF_DIAMONDS, Card.THREE_OF_DIAMONDS, Card.FOUR_OF_DIAMONDS, Card.FIVE_OF_DIAMONDS,
            Card.SIX_OF_DIAMONDS, Card.SEVEN_OF_DIAMONDS, Card.EIGHT_OF_DIAMONDS, Card.NINE_OF_DIAMONDS,
            Card.TEN_OF_DIAMONDS, Card.JACK_OF_DIAMONDS, Card.QUEEN_OF_DIAMONDS, Card.KING_OF_DIAMONDS,
            Card.ACE_OF_HEARTS, Card.TWO_OF_HEARTS, Card.THREE_OF_HEARTS, Card.FOUR_OF_HEARTS,
            Card.FIVE_OF_HEARTS, Card.SIX_OF_HEARTS, Card.SEVEN_OF_HEARTS, Card.NINE_OF_HEARTS,
            Card.TEN_OF_HEARTS, Card.JACK_OF_HEARTS, Card.QUEEN_OF_HEARTS, Card.KING_OF_HEARTS,
            Card.ACE_OF_SPADES, Card.TWO_OF_SPADES, Card.THREE_OF_SPADES, Card.FOUR_OF_SPADES,
            Card.FIVE_OF_SPADES, Card.SIX_OF_SPADES, Card.SEVEN_OF_SPADES, Card.EIGHT_OF_SPADES,
            Card.NINE_OF_SPADES, Card.TEN_OF_SPADES, Card.JACK_OF_SPADES, Card.QUEEN_OF_SPADES, Card.KING_OF_SPADES ],
          topCard: null,
          secondCard: null,
          deck: [],
        });
        // Deck should now be empty
        cy.get('#deck').should('contain', '(0)')
          .should('contain', 'PASS');
        cy.get('[data-player-hand-card]').should('have.length', 3);
      });

      it('Plays a 5 with two cards left in the deck and nothing to discard', () => {
        cy.loadGameFixture(0, {
          // Player is P0
          p0Hand: [ Card.FIVE_OF_CLUBS ],
          p0Points: [],
          p0FaceCards: [],
          // Opponent is P1
          p1Hand: [],
          p1Points: [],
          p1FaceCards: [],
          // Deck
          topCard: Card.THREE_OF_CLUBS,
          secondCard: Card.EIGHT_OF_HEARTS,
          deck: [],
        });

        cy.playOneOffAndResolveAsPlayer(Card.FIVE_OF_CLUBS);
        cy.get('[data-cy=five-discard-dialog]').should('be.visible');
        cy.get('[data-cy=submit-five-dialog]').click();

        assertGameState(0, {
          p0Hand: [ Card.THREE_OF_CLUBS, Card.EIGHT_OF_HEARTS ],
          p0Points: [],
          p0FaceCards: [],
          p1Hand: [],
          p1Points: [],
          p1FaceCards: [],
          scrap: [ Card.FIVE_OF_CLUBS, Card.ACE_OF_CLUBS, Card.TWO_OF_CLUBS, Card.FOUR_OF_CLUBS,
            Card.SIX_OF_CLUBS, Card.SEVEN_OF_CLUBS, Card.EIGHT_OF_CLUBS, Card.NINE_OF_CLUBS, Card.TEN_OF_CLUBS,
            Card.JACK_OF_CLUBS, Card.QUEEN_OF_CLUBS, Card.KING_OF_CLUBS, Card.ACE_OF_DIAMONDS, Card.TWO_OF_DIAMONDS,
            Card.THREE_OF_DIAMONDS, Card.FOUR_OF_DIAMONDS, Card.FIVE_OF_DIAMONDS, Card.SIX_OF_DIAMONDS,
            Card.SEVEN_OF_DIAMONDS, Card.EIGHT_OF_DIAMONDS, Card.NINE_OF_DIAMONDS, Card.TEN_OF_DIAMONDS,
            Card.JACK_OF_DIAMONDS, Card.QUEEN_OF_DIAMONDS, Card.KING_OF_DIAMONDS, Card.ACE_OF_HEARTS,
            Card.TWO_OF_HEARTS, Card.THREE_OF_HEARTS, Card.FOUR_OF_HEARTS, Card.FIVE_OF_HEARTS, Card.SIX_OF_HEARTS,
            Card.SEVEN_OF_HEARTS, Card.NINE_OF_HEARTS, Card.TEN_OF_HEARTS, Card.JACK_OF_HEARTS, Card.QUEEN_OF_HEARTS,
            Card.KING_OF_HEARTS, Card.ACE_OF_SPADES, Card.TWO_OF_SPADES, Card.THREE_OF_SPADES, Card.FOUR_OF_SPADES,
            Card.FIVE_OF_SPADES, Card.SIX_OF_SPADES, Card.SEVEN_OF_SPADES, Card.EIGHT_OF_SPADES, Card.NINE_OF_SPADES,
            Card.TEN_OF_SPADES, Card.JACK_OF_SPADES, Card.QUEEN_OF_SPADES, Card.KING_OF_SPADES ],
          topCard: null,
          secondCard: null,
          deck: [],
        });

        cy.get('#deck').should('contain', '(0)')
          .should('contain', 'PASS');
        cy.get('[data-player-hand-card]').should('have.length', 2);
      });

      it('Plays a 5 to draw two cards when already at hand limit (8)', () => {
        // Setup: there are three cards in the deck and player has a 5
        cy.loadGameFixture(0, {
          p0Hand: [
            Card.FIVE_OF_CLUBS,
            Card.FIVE_OF_SPADES,
            Card.ACE_OF_DIAMONDS,
            Card.EIGHT_OF_CLUBS,
            Card.TEN_OF_CLUBS,
            Card.TWO_OF_CLUBS,
            Card.THREE_OF_HEARTS,
            Card.FOUR_OF_HEARTS,
          ],
          p0Points: [],
          p0FaceCards: [],
          p1Hand: [ Card.TWO_OF_HEARTS ],
          p1Points: [],
          p1FaceCards: [],
          topCard: Card.THREE_OF_CLUBS,
          secondCard: Card.EIGHT_OF_HEARTS,
          deck: [ Card.ACE_OF_SPADES ],
        });
        cy.get('#deck').should('contain', '(3)');

        // Play 5 and resolve
        cy.playOneOffAndResolveAsPlayer(Card.FIVE_OF_CLUBS);
        cy.get('[data-cy=five-discard-dialog]').should('be.visible');
        cy.get('[data-discard-card=5-3]').click();
        cy.get('[data-cy=submit-five-dialog]').click();

        assertGameState(0, {
          p0Hand: [
            Card.THREE_OF_CLUBS,
            Card.EIGHT_OF_HEARTS,
            Card.ACE_OF_DIAMONDS,
            Card.EIGHT_OF_CLUBS,
            Card.TEN_OF_CLUBS,
            Card.TWO_OF_CLUBS,
            Card.THREE_OF_HEARTS,
            Card.FOUR_OF_HEARTS,
          ],
          p0Points: [],
          p0FaceCards: [],
          p1Hand: [ Card.TWO_OF_HEARTS ],
          p1Points: [],
          p1FaceCards: [],
          scrap: [ Card.FIVE_OF_CLUBS, Card.FIVE_OF_SPADES, Card.ACE_OF_CLUBS,
            Card.FOUR_OF_CLUBS, Card.SIX_OF_CLUBS, Card.SEVEN_OF_CLUBS, Card.NINE_OF_CLUBS,
            Card.JACK_OF_CLUBS, Card.QUEEN_OF_CLUBS, Card.KING_OF_CLUBS, Card.TWO_OF_DIAMONDS,
            Card.THREE_OF_DIAMONDS, Card.FOUR_OF_DIAMONDS, Card.FIVE_OF_DIAMONDS, Card.SIX_OF_DIAMONDS,
            Card.SEVEN_OF_DIAMONDS, Card.EIGHT_OF_DIAMONDS, Card.NINE_OF_DIAMONDS, Card.TEN_OF_DIAMONDS,
            Card.JACK_OF_DIAMONDS, Card.QUEEN_OF_DIAMONDS, Card.KING_OF_DIAMONDS, Card.ACE_OF_HEARTS,
            Card.FIVE_OF_HEARTS, Card.SIX_OF_HEARTS, Card.SEVEN_OF_HEARTS, Card.NINE_OF_HEARTS,
            Card.TEN_OF_HEARTS, Card.JACK_OF_HEARTS, Card.QUEEN_OF_HEARTS, Card.KING_OF_HEARTS,
            Card.TWO_OF_SPADES, Card.THREE_OF_SPADES, Card.FOUR_OF_SPADES,
            Card.SIX_OF_SPADES, Card.SEVEN_OF_SPADES, Card.EIGHT_OF_SPADES, Card.NINE_OF_SPADES,
            Card.TEN_OF_SPADES, Card.JACK_OF_SPADES, Card.QUEEN_OF_SPADES, Card.KING_OF_SPADES ],
          topCard: Card.ACE_OF_SPADES,
          secondCard: null,
          deck: [],
        });
        cy.get('#deck').should('contain', '(1)');
      });

      it('Draws only 1 card when last card in deck', () => {
        cy.loadGameFixture(0, {
          // Player is P0
          p0Hand: [ Card.ACE_OF_CLUBS, Card.FIVE_OF_SPADES, Card.FIVE_OF_HEARTS, Card.TWO_OF_CLUBS ],
          p0Points: [],
          p0FaceCards: [],
          // Opponent is P1
          p1Hand: [],
          p1Points: [],
          p1FaceCards: [],
          // Deck
          topCard: Card.THREE_OF_CLUBS,
          secondCard: Card.EIGHT_OF_HEARTS,
          deck: [],
        });
        // player plays a card
        cy.get('[data-player-hand-card=2-0]').click();
        cy.get('[data-move-choice=points]').click();
        // opponent draws, leaving 1 card left in deck
        cy.drawCardOpponent();

        cy.playOneOffAndResolveAsPlayer(Card.FIVE_OF_SPADES);
        cy.get('[data-cy=five-discard-dialog]').should('be.visible');
        cy.get('[data-discard-card=1-0]').click();
        cy.get('[data-cy=submit-five-dialog]').click();

        assertGameState(0, {
          p0Hand: [ Card.FIVE_OF_HEARTS, Card.EIGHT_OF_HEARTS ],
          p0Points: [ Card.TWO_OF_CLUBS ],
          p0FaceCards: [],
          p1Hand: [ Card.THREE_OF_CLUBS ],
          p1Points: [],
          p1FaceCards: [],
          scrap: [ Card.FIVE_OF_SPADES, Card.ACE_OF_CLUBS, Card.FOUR_OF_CLUBS, Card.FIVE_OF_CLUBS,
            Card.SIX_OF_CLUBS, Card.SEVEN_OF_CLUBS, Card.EIGHT_OF_CLUBS, Card.NINE_OF_CLUBS,
            Card.TEN_OF_CLUBS, Card.JACK_OF_CLUBS, Card.QUEEN_OF_CLUBS, Card.KING_OF_CLUBS,
            Card.ACE_OF_DIAMONDS, Card.TWO_OF_DIAMONDS, Card.THREE_OF_DIAMONDS, Card.FOUR_OF_DIAMONDS,
            Card.FIVE_OF_DIAMONDS, Card.SIX_OF_DIAMONDS, Card.SEVEN_OF_DIAMONDS, Card.EIGHT_OF_DIAMONDS,
            Card.NINE_OF_DIAMONDS, Card.TEN_OF_DIAMONDS, Card.JACK_OF_DIAMONDS, Card.QUEEN_OF_DIAMONDS,
            Card.KING_OF_DIAMONDS, Card.ACE_OF_HEARTS, Card.TWO_OF_HEARTS, Card.THREE_OF_HEARTS,
            Card.FOUR_OF_HEARTS, Card.SIX_OF_HEARTS, Card.SEVEN_OF_HEARTS, Card.NINE_OF_HEARTS,
            Card.TEN_OF_HEARTS, Card.JACK_OF_HEARTS, Card.QUEEN_OF_HEARTS, Card.KING_OF_HEARTS,
            Card.ACE_OF_SPADES, Card.TWO_OF_SPADES, Card.THREE_OF_SPADES, Card.FOUR_OF_SPADES,
            Card.SIX_OF_SPADES, Card.SEVEN_OF_SPADES, Card.EIGHT_OF_SPADES, Card.NINE_OF_SPADES,
            Card.TEN_OF_SPADES, Card.JACK_OF_SPADES, Card.QUEEN_OF_SPADES, Card.KING_OF_SPADES ],
          topCard: null,
          secondCard: null,
          deck: [],
        });
      });

      it('Plays multiple 5s', () => {
        cy.loadGameFixture(0, {
          // Player is P0
          p0Hand: [ Card.ACE_OF_CLUBS, Card.FIVE_OF_SPADES, Card.FIVE_OF_HEARTS, Card.TWO_OF_CLUBS ],
          p0Points: [],
          p0FaceCards: [],
          // Opponent is P1
          p1Hand: [ Card.FOUR_OF_CLUBS ],
          p1Points: [],
          p1FaceCards: [],
        });

        cy.playOneOffAndResolveAsPlayer(Card.FIVE_OF_SPADES);
        cy.get('[data-cy=five-discard-dialog]').should('be.visible');
        cy.get('[data-cy=submit-five-dialog]').should('be.disabled')
          .click({ force: true });
        cy.get('[data-discard-card=2-0]').click();
        cy.get('[data-cy=submit-five-dialog]').click();

        cy.get('[data-player-hand-card]').should('have.length', 5);

        cy.playPointsOpponent(Card.FOUR_OF_CLUBS);
        cy.get('[data-opponent-point-card=4-0]').should('be.visible');

        cy.playOneOffAndResolveAsPlayer(Card.FIVE_OF_HEARTS);
        cy.get('[data-cy=submit-five-dialog]').should('be.disabled')
          .click({ force: true });

        cy.get('[data-discard-card=1-0]').click();
        cy.get('[data-cy=submit-five-dialog]').click();
        cy.get('[data-player-hand-card]').should('have.length', 6);
      });

      it('Plays a 5 with card to discard and 2 cards left in deck', () => {
        cy.loadGameFixture(0, {
          // Player is P0
          p0Hand: [ Card.FIVE_OF_SPADES, Card.TWO_OF_CLUBS ],
          p0Points: [],
          p0FaceCards: [],
          // Opponent is P1
          p1Hand: [],
          p1Points: [],
          p1FaceCards: [],
          topCard: Card.FOUR_OF_CLUBS,
          secondCard: Card.ACE_OF_CLUBS,
          deck: [],
        });
        cy.playOneOffAndResolveAsPlayer(Card.FIVE_OF_SPADES);
        cy.get('[data-discard-card=2-0]').click();
        cy.get('[data-cy=submit-five-dialog]').click();

        assertGameState(0, {
          p0Hand: [ Card.FOUR_OF_CLUBS, Card.ACE_OF_CLUBS ],
          p0Points: [],
          p0FaceCards: [],
          p1Hand: [],
          p1Points: [],
          p1FaceCards: [],
          scrap: [ Card.FIVE_OF_SPADES, Card.TWO_OF_CLUBS, Card.THREE_OF_CLUBS,
            Card.FIVE_OF_CLUBS, Card.SIX_OF_CLUBS, Card.SEVEN_OF_CLUBS, Card.EIGHT_OF_CLUBS,
            Card.NINE_OF_CLUBS, Card.TEN_OF_CLUBS, Card.JACK_OF_CLUBS, Card.QUEEN_OF_CLUBS,
            Card.KING_OF_CLUBS, Card.ACE_OF_DIAMONDS, Card.TWO_OF_DIAMONDS, Card.THREE_OF_DIAMONDS,
            Card.FOUR_OF_DIAMONDS, Card.FIVE_OF_DIAMONDS, Card.SIX_OF_DIAMONDS, Card.SEVEN_OF_DIAMONDS,
            Card.EIGHT_OF_DIAMONDS, Card.NINE_OF_DIAMONDS, Card.TEN_OF_DIAMONDS, Card.JACK_OF_DIAMONDS,
            Card.QUEEN_OF_DIAMONDS, Card.KING_OF_DIAMONDS, Card.ACE_OF_HEARTS, Card.TWO_OF_HEARTS,
            Card.THREE_OF_HEARTS, Card.FOUR_OF_HEARTS, Card.FIVE_OF_HEARTS, Card.SIX_OF_HEARTS,
            Card.SEVEN_OF_HEARTS, Card.EIGHT_OF_HEARTS, Card.NINE_OF_HEARTS, Card.TEN_OF_HEARTS,
            Card.JACK_OF_HEARTS, Card.QUEEN_OF_HEARTS, Card.KING_OF_HEARTS, Card.ACE_OF_SPADES,
            Card.TWO_OF_SPADES, Card.THREE_OF_SPADES, Card.FOUR_OF_SPADES, Card.SIX_OF_SPADES,
            Card.SEVEN_OF_SPADES, Card.EIGHT_OF_SPADES, Card.NINE_OF_SPADES, Card.TEN_OF_SPADES,
            Card.JACK_OF_SPADES, Card.QUEEN_OF_SPADES, Card.KING_OF_SPADES ],
          topCard: null,
          secondCard: null,
          deck: [],
        });

        cy.get('#deck').should('contain', 'PASS');
      });

      it('Plays a 5 with card to discard and 1 card left in deck', () => {
        cy.loadGameFixture(0, {
          // Player is P0
          p0Hand: [ Card.FIVE_OF_SPADES, Card.TWO_OF_CLUBS ],
          p0Points: [],
          p0FaceCards: [],
          // Opponent is P1
          p1Hand: [],
          p1Points: [],
          p1FaceCards: [],
          topCard: Card.FOUR_OF_CLUBS,
          secondCard: Card.ACE_OF_HEARTS,
          deck: [ Card.TWO_OF_HEARTS ],
        });
        cy.get('#deck').click();
        cy.drawCardOpponent();
        cy.get('#deck').should('contain', '(1)');
        cy.playOneOffAndResolveAsPlayer(Card.FIVE_OF_SPADES);
        cy.get('[data-discard-card=2-0]').click();
        cy.get('[data-cy=submit-five-dialog]').click();

        assertGameState(0, {
          p0Hand: [ Card.FOUR_OF_CLUBS, Card.TWO_OF_HEARTS ],
          p0Points: [],
          p0FaceCards: [],
          p1Hand: [ Card.ACE_OF_HEARTS ],
          p1Points: [],
          p1FaceCards: [],
          scrap: [ Card.FIVE_OF_SPADES, Card.TWO_OF_CLUBS, Card.ACE_OF_CLUBS, Card.THREE_OF_CLUBS,
            Card.FIVE_OF_CLUBS, Card.SIX_OF_CLUBS, Card.SEVEN_OF_CLUBS, Card.EIGHT_OF_CLUBS, Card.NINE_OF_CLUBS,
            Card.TEN_OF_CLUBS, Card.JACK_OF_CLUBS, Card.QUEEN_OF_CLUBS, Card.KING_OF_CLUBS, Card.ACE_OF_DIAMONDS,
            Card.TWO_OF_DIAMONDS, Card.THREE_OF_DIAMONDS, Card.FOUR_OF_DIAMONDS, Card.FIVE_OF_DIAMONDS,
            Card.SIX_OF_DIAMONDS, Card.SEVEN_OF_DIAMONDS, Card.EIGHT_OF_DIAMONDS, Card.NINE_OF_DIAMONDS,
            Card.TEN_OF_DIAMONDS, Card.JACK_OF_DIAMONDS, Card.QUEEN_OF_DIAMONDS, Card.KING_OF_DIAMONDS,
            Card.THREE_OF_HEARTS, Card.FOUR_OF_HEARTS, Card.FIVE_OF_HEARTS, Card.SIX_OF_HEARTS, Card.SEVEN_OF_HEARTS,
            Card.EIGHT_OF_HEARTS, Card.NINE_OF_HEARTS, Card.TEN_OF_HEARTS, Card.JACK_OF_HEARTS, Card.QUEEN_OF_HEARTS,
            Card.KING_OF_HEARTS, Card.ACE_OF_SPADES, Card.TWO_OF_SPADES, Card.THREE_OF_SPADES, Card.FOUR_OF_SPADES,
            Card.SIX_OF_SPADES, Card.SEVEN_OF_SPADES, Card.EIGHT_OF_SPADES, Card.NINE_OF_SPADES, Card.TEN_OF_SPADES,
            Card.JACK_OF_SPADES, Card.QUEEN_OF_SPADES, Card.KING_OF_SPADES ],
          topCard: null,
          secondCard: null,
          deck: [],
        });
        cy.get('#deck').should('contain', 'PASS');
      });

      it('Plays a 5 with nothing to discard with 1 card in the deck', () => {
        cy.loadGameFixture(0, {
          // Player is P0
          p0Hand: [],
          p0Points: [],
          p0FaceCards: [],
          // Opponent is P1
          p1Hand: [],
          p1Points: [],
          p1FaceCards: [],
          topCard: Card.FIVE_OF_SPADES,
          secondCard: Card.TWO_OF_HEARTS,
          deck: [ Card.THREE_OF_CLUBS ],
        });
        cy.get('#deck').click();
        cy.drawCardOpponent();
        cy.playOneOffAndResolveAsPlayer(Card.FIVE_OF_SPADES);
        cy.get('[data-cy=five-discard-dialog]').should('be.visible');
        cy.get('[data-cy=submit-five-dialog]').click();

        assertGameState(0, {
          p0Hand: [ Card.THREE_OF_CLUBS ],
          p0Points: [],
          p0FaceCards: [],
          p1Hand: [ Card.TWO_OF_HEARTS ],
          p1Points: [],
          p1FaceCards: [],
          scrap: [ Card.FIVE_OF_SPADES, Card.ACE_OF_CLUBS, Card.TWO_OF_CLUBS, Card.FOUR_OF_CLUBS,
            Card.FIVE_OF_CLUBS, Card.SIX_OF_CLUBS, Card.SEVEN_OF_CLUBS, Card.EIGHT_OF_CLUBS, Card.NINE_OF_CLUBS,
            Card.TEN_OF_CLUBS, Card.JACK_OF_CLUBS, Card.QUEEN_OF_CLUBS, Card.KING_OF_CLUBS, Card.ACE_OF_DIAMONDS,
            Card.TWO_OF_DIAMONDS, Card.THREE_OF_DIAMONDS, Card.FOUR_OF_DIAMONDS, Card.FIVE_OF_DIAMONDS,
            Card.SIX_OF_DIAMONDS, Card.SEVEN_OF_DIAMONDS, Card.EIGHT_OF_DIAMONDS, Card.NINE_OF_DIAMONDS,
            Card.TEN_OF_DIAMONDS, Card.JACK_OF_DIAMONDS, Card.QUEEN_OF_DIAMONDS, Card.KING_OF_DIAMONDS,
            Card.ACE_OF_HEARTS, Card.THREE_OF_HEARTS, Card.FOUR_OF_HEARTS, Card.FIVE_OF_HEARTS, Card.SIX_OF_HEARTS,
            Card.SEVEN_OF_HEARTS, Card.EIGHT_OF_HEARTS, Card.NINE_OF_HEARTS, Card.TEN_OF_HEARTS, Card.JACK_OF_HEARTS,
            Card.QUEEN_OF_HEARTS, Card.KING_OF_HEARTS, Card.ACE_OF_SPADES, Card.TWO_OF_SPADES, Card.THREE_OF_SPADES,
            Card.FOUR_OF_SPADES, Card.SIX_OF_SPADES, Card.SEVEN_OF_SPADES, Card.EIGHT_OF_SPADES, Card.NINE_OF_SPADES,
            Card.TEN_OF_SPADES, Card.JACK_OF_SPADES, Card.QUEEN_OF_SPADES, Card.KING_OF_SPADES ],
          topCard: null,
          secondCard: null,
          deck: [],
        });
      });
    });

    describe('Illegal FIVES', () => {

      it('Cannot to play 5 with an empty deck', () => {

        cy.loadGameFixture(0, {
          // Player is P0
          p0Hand: [ Card.FIVE_OF_SPADES, Card.TWO_OF_CLUBS ],
          p0Points: [],
          p0FaceCards: [],
          // Opponent is P1
          p1Hand: [],
          p1Points: [],
          p1FaceCards: [],
          topCard: Card.FOUR_OF_CLUBS,
          secondCard: Card.ACE_OF_HEARTS,
          deck: [],
        });
        cy.get('#deck').click();
        cy.get('#deck').should('contain', '(1)');

        cy.drawCardOpponent();

        cy.get('#deck').should('contain', 'PASS');
        cy.get('[data-player-hand-card=5-3]').click();
        cy.get('[data-move-choice=oneOff]').should('have.class', 'v-card--disabled');

        // Forcibly make request to play 5 and confirm response is error
        cy.window()
          .its('cuttle.gameStore')
          .then(async (gameStore) => {
            const fiveId = gameStore.player.hand.find((card) => card.rank === 5 && card.suit === 3).id;

            try {
              const res = await gameStore.requestPlayOneOff(fiveId);
              // If the promise resolves, this assertion will fail the test (as expected in your case)
              expect(true).to.eq(
                false,
                `Expected request to resolve five without discarding to error, but instead came back 200: ${res}`,
              );
            } catch (err) {
              // If the promise rejects, this will handle the error
              expect(err).to.eq('game.snackbar.oneOffs.emptyDeck');
            }
          });
      });

      it('Cannot resolve five without discarding when you have cards in hand', () => {
        cy.loadGameFixture(0, {
          p0Hand: [ Card.FIVE_OF_SPADES, Card.TWO_OF_CLUBS ],
          p0Points: [],
          p0FaceCards: [],
          p1Hand: [],
          p1Points: [],
          p1FaceCards: [],
          topCard: Card.FOUR_OF_CLUBS,
          secondCard: Card.ACE_OF_HEARTS,
          deck: [],
        });

        cy.playOneOffAndResolveAsPlayer(Card.FIVE_OF_SPADES);
        cy.window()
          .its('cuttle.gameStore')
          .then(async (gameStore) => {
            // Request to resolve five without discarding
            try {
              const res = await gameStore.requestResolveFive(undefined);
              expect(true).to.eq(
                false,
                `Expected request to resolve five without discarding to error, but instead came back 200: ${res}`,
              );

            } catch (err) {
              expect(err).to.eq('game.snackbar.oneOffs.five.selectCardToDiscard');
            }
          });
      });
    });
  });

  describe('Playing 5 as opponent', () => {
    beforeEach(() => {
      cy.setupGameAsP1();
    });

    it('Plays 5 as opponent', () => {
      cy.loadGameFixture(1, {
        // Player is P0
        p0Hand: [ Card.ACE_OF_CLUBS, Card.FIVE_OF_SPADES, Card.FIVE_OF_HEARTS, Card.TWO_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        // Opponent is P1
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
        // Deck
        topCard: Card.THREE_OF_CLUBS,
        secondCard: Card.EIGHT_OF_HEARTS,
        deck: [ Card.SEVEN_OF_DIAMONDS ],
      });
      cy.playOneOffOpponent(Card.FIVE_OF_SPADES);

      cy.get('[data-cy=cannot-counter-dialog]').should('be.visible')
        .click();
      cy.get('[data-cy=cannot-counter-resolve]').click();
      cy.get('#waiting-for-opponent-discard-scrim').should('be.visible');
      cy.get('[data-cy=five-discard-dialog]').should('not.exist');
      cy.resolveFiveOpponent(Card.FIVE_OF_HEARTS);
      cy.get('#waiting-for-opponent-discard-scrim').should('not.exist');

      assertGameState(1, {
        p0Hand: [
          Card.ACE_OF_CLUBS,
          Card.TWO_OF_CLUBS,
          Card.THREE_OF_CLUBS,
          Card.EIGHT_OF_HEARTS,
          Card.SEVEN_OF_DIAMONDS,
        ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.FIVE_OF_SPADES, Card.FIVE_OF_HEARTS, Card.FOUR_OF_CLUBS, Card.FIVE_OF_CLUBS,
          Card.SIX_OF_CLUBS, Card.SEVEN_OF_CLUBS, Card.EIGHT_OF_CLUBS, Card.NINE_OF_CLUBS, Card.TEN_OF_CLUBS,
          Card.JACK_OF_CLUBS, Card.QUEEN_OF_CLUBS, Card.KING_OF_CLUBS, Card.ACE_OF_DIAMONDS, Card.TWO_OF_DIAMONDS,
          Card.THREE_OF_DIAMONDS, Card.FOUR_OF_DIAMONDS, Card.FIVE_OF_DIAMONDS, Card.SIX_OF_DIAMONDS,
          Card.EIGHT_OF_DIAMONDS, Card.NINE_OF_DIAMONDS, Card.TEN_OF_DIAMONDS, Card.JACK_OF_DIAMONDS,
          Card.QUEEN_OF_DIAMONDS, Card.KING_OF_DIAMONDS, Card.ACE_OF_HEARTS, Card.TWO_OF_HEARTS, Card.THREE_OF_HEARTS,
          Card.FOUR_OF_HEARTS, Card.SIX_OF_HEARTS, Card.SEVEN_OF_HEARTS, Card.NINE_OF_HEARTS, Card.TEN_OF_HEARTS,
          Card.JACK_OF_HEARTS, Card.QUEEN_OF_HEARTS, Card.KING_OF_HEARTS, Card.ACE_OF_SPADES, Card.TWO_OF_SPADES,
          Card.THREE_OF_SPADES, Card.FOUR_OF_SPADES, Card.SIX_OF_SPADES, Card.SEVEN_OF_SPADES, Card.EIGHT_OF_SPADES,
          Card.NINE_OF_SPADES, Card.TEN_OF_SPADES, Card.JACK_OF_SPADES, Card.QUEEN_OF_SPADES, Card.KING_OF_SPADES ],
        topCard: null,
        secondCard: null,
        deck: [],
      });
    });

    it('plays five as opponent with nothing to discard', () => {
      cy.loadGameFixture(1, {
        // Player is P0
        p0Hand: [ Card.FIVE_OF_SPADES ],
        p0Points: [],
        p0FaceCards: [],
        // Opponent is P1
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
        // Deck
        topCard: Card.THREE_OF_CLUBS,
        secondCard: Card.EIGHT_OF_HEARTS,
        deck: [ Card.SEVEN_OF_DIAMONDS ],
      });

      cy.playOneOffOpponent(Card.FIVE_OF_SPADES);

      cy.get('[data-cy=cannot-counter-dialog]').should('be.visible')
        .click();
      cy.get('[data-cy=cannot-counter-resolve]').click();
      cy.get('#waiting-for-opponent-discard-scrim').should('contain', 'Opponent Skips Discarding');
      cy.resolveFiveOpponent();
      assertGameState(1, {
        p0Hand: [ Card.THREE_OF_CLUBS, Card.EIGHT_OF_HEARTS, Card.SEVEN_OF_DIAMONDS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.FIVE_OF_SPADES, Card.ACE_OF_CLUBS, Card.TWO_OF_CLUBS, Card.FOUR_OF_CLUBS, Card.FIVE_OF_CLUBS,
          Card.SIX_OF_CLUBS, Card.SEVEN_OF_CLUBS, Card.EIGHT_OF_CLUBS, Card.NINE_OF_CLUBS, Card.TEN_OF_CLUBS,
          Card.JACK_OF_CLUBS, Card.QUEEN_OF_CLUBS, Card.KING_OF_CLUBS, Card.ACE_OF_DIAMONDS, Card.TWO_OF_DIAMONDS,
          Card.THREE_OF_DIAMONDS, Card.FOUR_OF_DIAMONDS, Card.FIVE_OF_DIAMONDS, Card.SIX_OF_DIAMONDS,
          Card.EIGHT_OF_DIAMONDS, Card.NINE_OF_DIAMONDS, Card.TEN_OF_DIAMONDS, Card.JACK_OF_DIAMONDS,
          Card.QUEEN_OF_DIAMONDS, Card.KING_OF_DIAMONDS, Card.ACE_OF_HEARTS, Card.TWO_OF_HEARTS, Card.THREE_OF_HEARTS,
          Card.FOUR_OF_HEARTS, Card.FIVE_OF_HEARTS, Card.SIX_OF_HEARTS, Card.SEVEN_OF_HEARTS, Card.NINE_OF_HEARTS,
          Card.TEN_OF_HEARTS, Card.JACK_OF_HEARTS, Card.QUEEN_OF_HEARTS, Card.KING_OF_HEARTS, Card.ACE_OF_SPADES,
          Card.TWO_OF_SPADES, Card.THREE_OF_SPADES, Card.FOUR_OF_SPADES, Card.SIX_OF_SPADES, Card.SEVEN_OF_SPADES,
          Card.EIGHT_OF_SPADES, Card.NINE_OF_SPADES, Card.TEN_OF_SPADES, Card.JACK_OF_SPADES, Card.QUEEN_OF_SPADES,
          Card.KING_OF_SPADES ],
        topCard: null,
        secondCard: null,
        deck: [],
      });
    });
  });
});
