import { assertGameState, assertSnackbar } from '../../../../support/helpers';
import { Card } from '../../../../fixtures/cards';

describe('Playing sevens at the end of the deck', () => {
  it('Plays the last card for points from a seven', () => {
    cy.skipOnGameStateApi();
    cy.setupGameAsP1();
    cy.loadGameFixture(1, {
      p0Hand: [],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [Card.SEVEN_OF_CLUBS],
      p1Points: [],
      p1FaceCards: [],
      topCard: Card.FOUR_OF_CLUBS,
      secondCard: Card.SIX_OF_DIAMONDS,
      deck: [],
    });

    cy.get('#deck').should('contain', 2);

    cy.drawCardOpponent();
    cy.playOneOffAndResolveAsPlayer(Card.SEVEN_OF_CLUBS);
    cy.get('[data-top-card=6-1]').click();
    cy.get('[data-move-choice=points]').click();

    cy.get('#deck').find('#empty-deck-text').should('contain', 'PASS');
    assertSnackbar('Deck exhausted; revealing player hands', 'surface-1');
  });

  it('Plays the top card of the deck when there are two cards left', () => {
    cy.setupGameAsP0();
    cy.loadGameFixture(0, {
      p0Hand: [Card.SEVEN_OF_CLUBS],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
      topCard: Card.FOUR_OF_CLUBS,
      secondCard: Card.SIX_OF_DIAMONDS,
      deck: [],
    });

    cy.get('#deck').should('contain', 2);

    cy.playOneOffAndResolveAsPlayer(Card.SEVEN_OF_CLUBS);
    cy.get('[data-top-card=4-0]').click();
    cy.get('[data-move-choice=points]').click();

    cy.get('#deck').should('contain', '(1)');
    cy.drawCardOpponent();

    cy.get('#deck').find('#empty-deck-text').should('contain', 'PASS');

    assertGameState(0, {
      p0Hand: [],
      p0Points: [Card.FOUR_OF_CLUBS],
      p0FaceCards: [],
      p1Hand: [Card.SIX_OF_DIAMONDS],
      p1Points: [],
      p1FaceCards: [],
      scrap: [Card.SEVEN_OF_CLUBS],
    });
  });

  it('Plays the 2nd card in the deck when there are two cards left', () => {
    cy.setupGameAsP0();
    cy.loadGameFixture(0, {
      p0Hand: [Card.SEVEN_OF_CLUBS],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
      topCard: Card.FOUR_OF_CLUBS,
      secondCard: Card.SIX_OF_DIAMONDS,
      deck: [],
    });

    cy.get('#deck').should('contain', 2);

    cy.playOneOffAndResolveAsPlayer(Card.SEVEN_OF_CLUBS);
    cy.get('[data-second-card=6-1]').click();
    cy.get('[data-move-choice=points]').click();

    cy.get('#deck').should('contain', '(1)');
    cy.drawCardOpponent();

    cy.get('#deck').find('#empty-deck-text').should('contain', 'PASS');

    assertGameState(0, {
      p0Hand: [],
      p0Points: [Card.SIX_OF_DIAMONDS],
      p0FaceCards: [],
      p1Hand: [Card.FOUR_OF_CLUBS],
      p1Points: [],
      p1FaceCards: [],
      scrap: [Card.SEVEN_OF_CLUBS],
    });
  });

  it('Cannot play seven one-off if deck is empty', () => {
    cy.setupGameAsP1();
    cy.loadGameFixture(1, {
      p0Hand: [],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [Card.SEVEN_OF_CLUBS, Card.ACE_OF_CLUBS],
      p1Points: [],
      p1FaceCards: [],
      topCard: Card.SIX_OF_HEARTS,
      secondCard: Card.SEVEN_OF_HEARTS,
      deck: [Card.FIVE_OF_DIAMONDS],
    });
    cy.drawCardOpponent();
    cy.get('#deck').click();
    cy.drawCardOpponent();
    cy.get('[data-player-hand-card=7-0]').click();
    cy.get('[data-move-choice=oneOff').should('have.class', 'v-card--disabled');
  });

  it('Cannot play last card of deck as 7 one-off when chaining sevens', () => {
    cy.skipOnGameStateApi();
    cy.setupGameAsP1();
    cy.loadGameFixture(1, {
      p0Hand: [],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [Card.SEVEN_OF_CLUBS, Card.ACE_OF_CLUBS],
      p1Points: [],
      p1FaceCards: [],
      topCard: Card.SIX_OF_HEARTS,
      secondCard: Card.SEVEN_OF_HEARTS,
      deck: [],
    });
    cy.drawCardOpponent();
    cy.get('[data-player-hand-card=7-0]').click();
    cy.get('[data-move-choice=oneOff').should('not.have.class', 'v-card--disabled').click();
    cy.resolveOpponent();
    cy.get('[data-top-card=7-2]').click();
    cy.get('[data-move-choice=oneOff').should('have.class', 'v-card--disabled');
  });
});
