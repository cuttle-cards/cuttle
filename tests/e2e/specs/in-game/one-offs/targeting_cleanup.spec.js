import { assertGameState } from '../../../support/helpers';
import { Card } from '../../../fixtures/cards';

describe('Clean-up of One-Off Targets', () => {
  beforeEach(() => {
    cy.setupGameAsP1();
  });

  it('ONE-OFF Target should be removed after one-off resolves - target is POINTS', () => {
    cy.loadGameFixture(1, {
      // Opponent is p0
      p0Hand: [ Card.NINE_OF_SPADES, Card.NINE_OF_HEARTS, Card.FIVE_OF_CLUBS ],
      p0Points: [ Card.TEN_OF_HEARTS ],
      p0FaceCards: [],
      // player is p1
      p1Hand: [ Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS ],
      p1Points: [ Card.ACE_OF_DIAMONDS, Card.FOUR_OF_DIAMONDS ],
      p1FaceCards: [],
    });

    // Opponent plays NINE, which needs two targets
    cy.playTargetedOneOffOpponent(
      Card.NINE_OF_SPADES,
      Card.ACE_OF_DIAMONDS,
      'point',
      Card.FOUR_OF_DIAMONDS,
      'point',
    );

    // Player resolves
    cy.get('#cannot-counter-dialog').should('be.visible')
      .get('[data-cy=cannot-counter-resolve]')
      .click();

    assertGameState(1, {
      p0Hand: [ Card.NINE_OF_HEARTS, Card.FIVE_OF_CLUBS ],
      p0Points: [ Card.TEN_OF_HEARTS ],
      p0FaceCards: [],
      p1Hand: [ Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS, Card.ACE_OF_DIAMONDS, Card.FOUR_OF_DIAMONDS ],
      p1Points: [],
      p1FaceCards: [],
      scrap: [ Card.NINE_OF_SPADES ],
    });

    // Both target slots are cleared once the one-off resolves
    cy.window().its('cuttle.gameStore')
      .then((store) => {
        expect(store.oneOffTarget).to.eq(null);
        expect(store.oneOffTargetTwo).to.eq(null);
      });

    // Player plays another point
    cy.get('[data-player-hand-card=6-2]').click();
    cy.get('[data-move-choice=points]').click();

    // Opponent plays UN-TARGETED ONE-OFF
    cy.playOneOffOpponent(Card.FIVE_OF_CLUBS);

    // Cannot counter dialog should not have a target
    cy.get('#cannot-counter-dialog')
      .should('be.visible')
      .should('not.contain', 'targeting')
      .get('[data-cy=cannot-counter-resolve]')
      .click();
  });

  it('ONE-OFF Target should be removed after one-off resolves - target is FACE CARD', () => {
    cy.loadGameFixture(1, {
      // Opponent is p0
      p0Hand: [ Card.NINE_OF_SPADES, Card.NINE_OF_HEARTS, Card.FIVE_OF_CLUBS ],
      p0Points: [ Card.TEN_OF_HEARTS ],
      p0FaceCards: [],
      // player is p1
      p1Hand: [ Card.SIX_OF_HEARTS ],
      p1Points: [ Card.ACE_OF_DIAMONDS ],
      p1FaceCards: [ Card.KING_OF_HEARTS, Card.KING_OF_CLUBS ],
    });

    // Opponent plays NINE targeting both royals. A queen would block a nine outright,
    // so this uses kings.
    cy.playTargetedOneOffOpponent(
      Card.NINE_OF_SPADES,
      Card.KING_OF_HEARTS,
      'faceCard',
      Card.KING_OF_CLUBS,
      'faceCard',
    );

    // Player resolves
    cy.get('#cannot-counter-dialog')
      .should('be.visible')
      .should('contain', 'targeting')
      .get('[data-cy=cannot-counter-resolve]')
      .click();

    assertGameState(1, {
      p0Hand: [ Card.NINE_OF_HEARTS, Card.FIVE_OF_CLUBS ],
      p0Points: [ Card.TEN_OF_HEARTS ],
      p0FaceCards: [],
      p1Hand: [ Card.SIX_OF_HEARTS, Card.KING_OF_HEARTS, Card.KING_OF_CLUBS ],
      p1Points: [ Card.ACE_OF_DIAMONDS ],
      p1FaceCards: [],
      scrap: [ Card.NINE_OF_SPADES ],
    });

    // Both target slots are cleared once the one-off resolves
    cy.window().its('cuttle.gameStore')
      .then((store) => {
        expect(store.oneOffTarget).to.eq(null);
        expect(store.oneOffTargetTwo).to.eq(null);
      });

    // Player plays another point
    cy.get('[data-player-hand-card=6-2]').click();
    cy.get('[data-move-choice=points]').click();

    // Opponent plays UN-TARGETED ONE-OFF
    cy.playOneOffOpponent(Card.FIVE_OF_CLUBS);

    // Cannot counter dialog should not have a target
    cy.get('#cannot-counter-dialog')
      .should('be.visible')
      .should('not.contain', 'targeting')
      .get('[data-cy=cannot-counter-resolve]')
      .click();
  });

  it('ONE-OFF Target should be removed after one-off resolves - target is JACK', () => {
    cy.loadGameFixture(1, {
      // Opponent is p0
      p0Hand: [ Card.TWO_OF_SPADES, Card.FIVE_OF_CLUBS, Card.TEN_OF_HEARTS ],
      p0Points: [],
      p0FaceCards: [],
      // player is p1
      p1Hand: [ Card.SIX_OF_HEARTS, Card.JACK_OF_CLUBS ],
      p1Points: [ Card.ACE_OF_DIAMONDS ],
      p1FaceCards: [],
    });

    // Opponent plays POINT
    cy.playPointsOpponent(Card.TEN_OF_HEARTS);

    // Player plays JACK
    cy.get('[data-player-hand-card=11-0]').click();
    cy.get('[data-move-choice=jack]').click();
    cy.get('#player-hand-targeting').should('be.visible');
    cy.get('[data-opponent-point-card=10-2]').click();

    assertGameState(1, {
      p0Hand: [ Card.TWO_OF_SPADES, Card.FIVE_OF_CLUBS ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [ Card.SIX_OF_HEARTS ],
      p1Points: [ Card.ACE_OF_DIAMONDS, Card.TEN_OF_HEARTS ],
      p1FaceCards: [],
      scrap: [],
    });

    // Opponent plays TWO
    cy.playTargetedOneOffOpponent(Card.TWO_OF_SPADES, Card.JACK_OF_CLUBS, 'jack');

    // Player resolves
    cy.get('#cannot-counter-dialog')
      .should('be.visible')
      .should('contain', 'targeting')
      .get('[data-cy=cannot-counter-resolve]')
      .click();

    assertGameState(1, {
      p0Hand: [ Card.FIVE_OF_CLUBS ],
      p0Points: [ Card.TEN_OF_HEARTS ],
      p0FaceCards: [],
      p1Hand: [ Card.SIX_OF_HEARTS ],
      p1Points: [ Card.ACE_OF_DIAMONDS ],
      p1FaceCards: [],
      scrap: [ Card.TWO_OF_SPADES, Card.JACK_OF_CLUBS ],
    });

    // Player plays another point
    cy.get('[data-player-hand-card=6-2]').click();
    cy.get('[data-move-choice=points]').click();

    // Opponent plays UN-TARGETED ONE-OFF
    cy.playOneOffOpponent(Card.FIVE_OF_CLUBS);

    // Cannot counter dialog should not have a target
    cy.get('#cannot-counter-dialog')
      .should('be.visible')
      .should('not.contain', 'targeting')
      .get('[data-cy=cannot-counter-resolve]')
      .click();
  });

  it('ONE-OFF Target should be removed after one-off is COUNTERED - target is POINTS', () => {
    cy.loadGameFixture(1, {
      // Opponent is p0
      p0Hand: [ Card.NINE_OF_SPADES, Card.NINE_OF_HEARTS, Card.FIVE_OF_CLUBS ],
      p0Points: [ Card.TEN_OF_HEARTS ],
      p0FaceCards: [],
      // player is p1
      p1Hand: [ Card.SIX_OF_HEARTS, Card.TWO_OF_CLUBS ],
      p1Points: [ Card.ACE_OF_DIAMONDS, Card.FOUR_OF_DIAMONDS ],
      p1FaceCards: [],
    });

    // Opponent plays NINE, which needs two targets
    cy.playTargetedOneOffOpponent(
      Card.NINE_OF_SPADES,
      Card.ACE_OF_DIAMONDS,
      'point',
      Card.FOUR_OF_DIAMONDS,
      'point',
    );

    // Player counters
    cy.get('#counter-dialog').should('be.visible')
      .get('[data-cy=counter]')
      .click();

    cy.get('#choose-two-dialog').should('be.visible')
      .get('[data-counter-dialog-card=2-0]')
      .click();

    cy.resolveOpponent();
    assertGameState(1, {
      // Opponent is p0
      p0Hand: [ Card.NINE_OF_HEARTS, Card.FIVE_OF_CLUBS ],
      p0Points: [ Card.TEN_OF_HEARTS ],
      p0FaceCards: [],
      // player is p1
      p1Hand: [ Card.SIX_OF_HEARTS ],
      p1Points: [ Card.ACE_OF_DIAMONDS, Card.FOUR_OF_DIAMONDS ],
      p1FaceCards: [],
      scrap: [ Card.NINE_OF_SPADES, Card.TWO_OF_CLUBS ],
    });

    // Both target slots are cleared once the one-off is countered
    cy.window()
      .its('cuttle.gameStore')
      .then((store) => {
        expect(store.oneOffTarget).to.eq(null);
        expect(store.oneOffTargetTwo).to.eq(null);
      });

    // Player plays another point
    cy.get('[data-player-hand-card=6-2]').click();
    cy.get('[data-move-choice=points]').click();

    // Opponent plays UN-TARGETED ONE-OFF
    cy.playOneOffOpponent(Card.FIVE_OF_CLUBS);

    // Cannot counter dialog should not have a target
    cy.get('#cannot-counter-dialog')
      .should('be.visible')
      .should('not.contain', 'targeting')
      .get('[data-cy=cannot-counter-resolve]')
      .click();
  });
});
