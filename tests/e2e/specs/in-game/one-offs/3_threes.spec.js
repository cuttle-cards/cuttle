import { assertGameState, assertSnackbar, playOutOfTurn } from '../../../support/helpers';
import { Card } from '../../../fixtures/cards';
import { SnackBarError } from '../../../fixtures/snackbarError';
const { _ } = Cypress;

describe('Playing THREEs', () => {
  beforeEach(() => {
    cy.setupGameAsP0();
  });

  it('Plays 3s with no cards in scrap', () => {
    // Set Up
    cy.loadGameFixture(0, {
      p0Hand: [ Card.ACE_OF_SPADES, Card.THREE_OF_CLUBS ],
      p0Points: [ Card.TEN_OF_SPADES ],
      p0FaceCards: [],
      p1Hand: [ Card.ACE_OF_HEARTS, Card.TEN_OF_DIAMONDS ],
      p1Points: [ Card.TEN_OF_HEARTS ],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
    });

    // Player plays three
    cy.get('[data-player-hand-card=3-0]').click(); // three of clubs
    cy.get('[data-move-choice=oneOff]').click();
    assertSnackbar(SnackBarError.ONE_OFF.THREE_EMPTY_SCRAP);
  });

  it('Plays 3s successfully', () => {
    const scrap = [ Card.ACE_OF_SPADES, Card.TEN_OF_HEARTS, Card.TEN_OF_SPADES, Card.FOUR_OF_CLUBS ];

    // Set Up
    cy.loadGameFixture(0, {
      p0Hand: [ Card.THREE_OF_CLUBS ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [ Card.TEN_OF_DIAMONDS ],
      p1Points: [ Card.ACE_OF_HEARTS ],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
      scrap,
    });

    // Player plays three
    cy.get('[data-player-hand-card=3-0]').click(); // three of clubs
    cy.get('[data-move-choice=oneOff]').click();

    cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');

    cy.resolveOpponent();

    cy.get('#waiting-for-opponent-counter-scrim').should('not.exist');

    cy.get('#three-dialog').should('be.visible');
    // resolve button should be disabled
    cy.get('[data-cy=three-resolve').should('be.disabled');

    // Confirm able to sort scrap by rank, as it's default

    const mapElementsToRank = (elements) => {
      return _.map(elements, (element) => {
        return Number(element.attributes['data-three-dialog-card'].value.split('-')[0]);
      });
    };
    cy.get('[data-three-dialog-card]')
      .then(mapElementsToRank)
      .then((elementRanks) => {
        const sortedScrapRanksFromFixture = _.sortBy(scrap, 'rank').map((card) => card.rank);
        expect(elementRanks).to.deep.equal(sortedScrapRanksFromFixture);
      });

    // Player selects a card from scrap
    cy.get('[data-three-dialog-card=10-2]').click();
    cy.get('[data-cy=three-resolve').should('not.be.disabled')
      .click();

    // check scrap card shows and then disappears
    cy.get('[data-cy="scrap-chosen-card"]').should('be.visible');
    cy.get('[data-cy="scrap-chosen-card"]').should('not.exist');

    assertGameState(0, {
      p0Hand: [ Card.TEN_OF_HEARTS ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [ Card.TEN_OF_DIAMONDS ],
      p1Points: [ Card.ACE_OF_HEARTS ],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
      scrap: [ Card.ACE_OF_SPADES, Card.THREE_OF_CLUBS, Card.TEN_OF_SPADES, Card.FOUR_OF_CLUBS ],
    });

    // Player attempts to play out of turn
    cy.get('[data-player-hand-card=10-2]').click(); // ten of hearts
    playOutOfTurn('points');

    cy.playPointsOpponent(Card.TEN_OF_DIAMONDS);

    assertGameState(0, {
      p0Hand: [ Card.TEN_OF_HEARTS ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [ Card.ACE_OF_HEARTS, Card.TEN_OF_DIAMONDS ],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
      scrap: [ Card.ACE_OF_SPADES, Card.THREE_OF_CLUBS, Card.TEN_OF_SPADES, Card.FOUR_OF_CLUBS ],
    });
  });

  it('Opponent plays 3s successfully', () => {
    // Set Up
    cy.loadGameFixture(0, {
      p0Hand: [ Card.ACE_OF_SPADES ],
      p0Points: [ Card.TEN_OF_SPADES ],
      p0FaceCards: [],
      p1Hand: [ Card.ACE_OF_HEARTS, Card.TEN_OF_DIAMONDS, Card.THREE_OF_CLUBS ],
      p1Points: [ Card.TEN_OF_HEARTS ],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
    });

    // put some cards into scrap
    cy.get('[data-player-hand-card=1-3]').click(); // ace of space
    cy.get('[data-move-choice=oneOff]').click();

    cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');

    cy.resolveOpponent();

    assertGameState(0, {
      p0Hand: [],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [ Card.ACE_OF_HEARTS, Card.TEN_OF_DIAMONDS, Card.THREE_OF_CLUBS ],
      p1Points: [],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
      scrap: [ Card.ACE_OF_SPADES, Card.TEN_OF_HEARTS, Card.TEN_OF_SPADES ],
    });

    // opponent plays 3
    cy.playOneOffOpponent(Card.THREE_OF_CLUBS);

    // player resolves
    cy.get('[data-cy=cannot-counter-resolve]').should('be.visible')
      .click();

    cy.get('#waiting-for-opponent-resolve-three-scrim').should('be.visible');
    // waiting for opponent to choose from scrap scrim
    cy.resolveThreeOpponent(Card.ACE_OF_SPADES);

    cy.get('#waiting-for-opponent-resolve-three-scrim').should('not.exist');

    // check scrap card shows and then disappears
    cy.get('[data-cy="scrap-chosen-card"]').should('be.visible');
    cy.get('[data-cy="scrap-chosen-card"]').should('not.exist');

    assertGameState(0, {
      p0Hand: [],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [ Card.ACE_OF_HEARTS, Card.TEN_OF_DIAMONDS, Card.ACE_OF_SPADES ],
      p1Points: [],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
      scrap: [ Card.TEN_OF_HEARTS, Card.TEN_OF_SPADES, Card.THREE_OF_CLUBS ],
    });
  });
});
