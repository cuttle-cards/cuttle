import { assertGameState, playOutOfTurn } from '../../support/helpers';
import { Card } from '../../fixtures/cards';

const { _ } = Cypress;

describe('Game View Layout', () => {
  beforeEach(() => {
    cy.setupGameAsP0();
  });

  it('Hides navbar on gameview page', () => {
    cy.get('[data-cy=nav-drawer]').should('not.exist');
  });

  it('Should display usernames of player and opponent', () => {
    cy.get('[data-cy=opponent-username]').should('be.visible');
    cy.get('[data-cy=player-username]').should('be.visible');
  });

  it('Three dialogs', () => {
    cy.skipOnGameStateApi();
    // Set Up
    cy.loadGameFixture(0, {
      p0Hand: [ Card.THREE_OF_CLUBS ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [ Card.TEN_OF_DIAMONDS ],
      p1Points: [ Card.ACE_OF_HEARTS ],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
      scrap: [ Card.ACE_OF_SPADES, Card.TEN_OF_HEARTS, Card.TEN_OF_SPADES ],
    });

    // Player plays three
    cy.get('[data-player-hand-card=3-0]').click(); // three of clubs
    cy.get('[data-move-choice=oneOff]').click();

    cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');

    cy.resolveOpponent();

    cy.get('#waiting-for-opponent-counter-scrim').should('not.be.visible');

    cy.get('#three-dialog').should('be.visible');
    // resolve button should be disabled
    cy.get('[data-cy=three-resolve').should('be.disabled');

    // Player selects a card from scrap
    cy.get('[data-three-dialog-card=10-2]').click();
    cy.get('[data-cy=three-resolve').should('not.be.disabled')
      .click();

    assertGameState(0, {
      p0Hand: [ Card.TEN_OF_HEARTS ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [ Card.TEN_OF_DIAMONDS ],
      p1Points: [ Card.ACE_OF_HEARTS ],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
      scrap: [ Card.ACE_OF_SPADES, Card.THREE_OF_CLUBS, Card.TEN_OF_SPADES ],
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
      scrap: [ Card.ACE_OF_SPADES, Card.THREE_OF_CLUBS, Card.TEN_OF_SPADES ],
    });
  });

  it('Click the scrap to view contents', () => {
    // Given-- the initial game state with 3 cards in the scrap
    const scrap = [
      Card.ACE_OF_SPADES,
      Card.TEN_OF_HEARTS,
      Card.TEN_OF_SPADES,
      Card.FOUR_OF_CLUBS,
      Card.TWO_OF_HEARTS,
      Card.EIGHT_OF_SPADES,
      Card.TWO_OF_CLUBS,
      Card.ACE_OF_CLUBS,
      Card.TWO_OF_DIAMONDS,
    ];
    cy.loadGameFixture(0, {
      p0Hand: [ Card.THREE_OF_CLUBS ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [ Card.TEN_OF_DIAMONDS ],
      p1Points: [ Card.ACE_OF_HEARTS ],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
      scrap,
    });

    // When-- Click the scrap
    cy.log('Clicking scrap');
    cy.get('#scrap').click();

    // Then-- Assert that the overlay that should show up does
    cy.get('#scrap-dialog').should('be.visible');

    // Make sure that the three cards in the scrap are shown
    cy.get('[data-scrap-dialog-card]').should('have.length', 9);
    cy.get('[data-scrap-dialog-card=1-3]').should('be.visible');
    cy.get('[data-scrap-dialog-card=10-2]').should('be.visible');
    cy.get('[data-scrap-dialog-card=10-3]').should('be.visible');

    // Given-- the scrap is currently open
    // When-- Close it with X
    cy.log('Closing scrap with X');
    cy.get('[data-cy=close-scrap-dialog-x]').click();
    // Then-- Scrap should be closed
    cy.get('#scrap-dialog').should('not.be.visible');

    // Given-- the scrap is currently open
    cy.get('#scrap').click();
    cy.get('#scrap-dialog').should('be.visible');
    // When-- Close it with the close button
    cy.log('Closing scrap with button');
    cy.get('[data-cy=close-scrap-dialog-button]').click();
    // Then-- Scrap should be closed
    cy.get('#scrap-dialog').should('not.be.visible');

    // Given -- the scrap is currently open
    cy.get('#scrap').click();
    cy.get('#scrap-dialog').should('be.visible');

    // Then-- All cards should be in ascending rank order
    const mapElementsToRank = (elements) => {
      return _.map(elements, (element) => {
        return Number(element.attributes['data-scrap-dialog-card'].value.split('-')[0]);
      });
    };
    cy.get('[data-scrap-dialog-card]')
      .then(mapElementsToRank)
      .then((elementRanks) => {
        const sortedScrapRanksFromFixture = _.sortBy(scrap, 'rank').map((card) => card.rank);
        expect(elementRanks).to.deep.equal(sortedScrapRanksFromFixture);
      });
  });

  it('Clicking the scrap while empty shows that it is empty', () => {
    // Given-- the initial game state with 3 cards in the scrap
    cy.loadGameFixture(0, {
      p0Hand: [ Card.THREE_OF_CLUBS ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [ Card.TEN_OF_DIAMONDS ],
      p1Points: [ Card.ACE_OF_HEARTS ],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
      scrap: [],
    });

    // When-- Click the scrap
    cy.log('Clicking scrap');
    cy.get('#scrap').click();

    // Then-- Assert that the overlay that should show up does and that there are no cards in it
    cy.get('#scrap-dialog').should('be.visible')
      .should('contain', 'There are no cards in the scrap pile.');
  });
});

describe('Four dialogs layout', () => {
  beforeEach(() => {
    cy.setupGameAsP1();
  });

  it('Four dialogs', () => {
    cy.skipOnGameStateApi();
    cy.loadGameFixture(1, {
      p0Hand: [ Card.FOUR_OF_CLUBS, Card.ACE_OF_HEARTS ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [ Card.FOUR_OF_SPADES, Card.ACE_OF_DIAMONDS, Card.TEN_OF_HEARTS ],
      p1Points: [],
      p1FaceCards: [],
    });

    // Opponent plays four
    cy.playOneOffOpponent(Card.FOUR_OF_CLUBS);
    // Player cannot counter
    cy.get('#cannot-counter-dialog').should('be.visible')
      .get('[data-cy=cannot-counter-resolve]')
      .click();

    // Four Dialog appears (you must discard)
    cy.get('#four-discard-dialog').should('be.visible');
    // Choosing cards to discard
    cy.log('Choosing two cards to discard');
    cy.get('[data-cy=submit-four-dialog]').should('be.disabled'); // can't prematurely submit
    cy.get('[data-discard-card=1-1]').click(); // ace of diamonds
    cy.get('[data-cy=submit-four-dialog]').should('be.disabled'); // can't prematurely submit
    cy.get('[data-discard-card=4-3]').click(); // four of spades
    cy.get('[data-cy=submit-four-dialog]').click(); // submit choice to discard

    assertGameState(1, {
      p0Hand: [ Card.ACE_OF_HEARTS ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [ Card.TEN_OF_HEARTS ],
      p1Points: [],
      p1FaceCards: [],
      scrap: [ Card.FOUR_OF_CLUBS, Card.FOUR_OF_SPADES, Card.ACE_OF_DIAMONDS ],
    });
  });
});

describe.skip('Aesthetic tests', () => {
  beforeEach(() => {
    cy.setupGameAsP0();
  });

  it('Many cards on field', () => {
    cy.skipOnGameStateApi();
    // Set Up
    cy.loadGameFixture(0, {
      p0Hand: [ Card.EIGHT_OF_SPADES, Card.QUEEN_OF_DIAMONDS ],
      p0Points: [ Card.ACE_OF_SPADES, Card.ACE_OF_CLUBS, Card.ACE_OF_DIAMONDS, Card.ACE_OF_HEARTS ],
      p0FaceCards: [ Card.KING_OF_HEARTS, Card.KING_OF_DIAMONDS, Card.KING_OF_CLUBS, Card.EIGHT_OF_HEARTS ],
      p1Hand: [ Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS, Card.EIGHT_OF_CLUBS ],
      p1Points: [],
      p1FaceCards: [],
    });
  });

  it('Quadruple jacks with a few cards', () => {
    cy.skipOnGameStateApi();
    // Set Up
    cy.loadGameFixture(0, {
      p0Hand: [ Card.ACE_OF_SPADES, Card.JACK_OF_CLUBS, Card.KING_OF_SPADES, Card.JACK_OF_HEARTS ],
      p0Points: [ Card.TEN_OF_SPADES ],
      p0FaceCards: [],
      p1Hand: [ Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS, Card.JACK_OF_DIAMONDS, Card.JACK_OF_SPADES ],
      p1Points: [ Card.TEN_OF_HEARTS ],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
    });

    // Play jack of clubs on ten of hearts
    cy.get('[data-player-hand-card=11-0]').click();
    cy.get('[data-move-choice=jack]').click();
    cy.get('[data-opponent-point-card=10-2]').click();

    assertGameState(0, {
      p0Hand: [ Card.ACE_OF_SPADES, Card.KING_OF_SPADES, Card.JACK_OF_HEARTS ],
      p0Points: [ Card.TEN_OF_SPADES, Card.TEN_OF_HEARTS ],
      p0FaceCards: [],
      p1Hand: [ Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS, Card.JACK_OF_DIAMONDS, Card.JACK_OF_SPADES ],
      p1Points: [],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
      scrap: [],
    });

    cy.get('[data-player-hand-card]').should('have.length', 3);
    cy.get('#turn-indicator').contains("OPPONENT'S TURN");

    // opponent plays 2nd Jack
    cy.playJackOpponent(Card.JACK_OF_DIAMONDS, Card.TEN_OF_HEARTS);

    assertGameState(0, {
      p0Hand: [ Card.ACE_OF_SPADES, Card.KING_OF_SPADES, Card.JACK_OF_HEARTS ],
      p0Points: [ Card.TEN_OF_SPADES ],
      p0FaceCards: [],
      p1Hand: [ Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS, Card.JACK_OF_SPADES ],
      p1Points: [ Card.TEN_OF_HEARTS ],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
      scrap: [],
    });

    // Player plays 3rd jack
    cy.get('[data-player-hand-card=11-2]').click();
    cy.get('[data-move-choice=jack]').click();
    cy.get('[data-opponent-point-card=10-2]').click({ force: true });

    assertGameState(0, {
      p0Hand: [ Card.ACE_OF_SPADES, Card.KING_OF_SPADES ],
      p0Points: [ Card.TEN_OF_SPADES, Card.TEN_OF_HEARTS ],
      p0FaceCards: [],
      p1Hand: [ Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS, Card.JACK_OF_SPADES ],
      p1Points: [],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
      scrap: [],
    });

    cy.get('#turn-indicator').contains("OPPONENT'S TURN");

    // Opponent plays 4th jack
    cy.playJackOpponent(Card.JACK_OF_SPADES, Card.TEN_OF_HEARTS);

    assertGameState(0, {
      p0Hand: [ Card.ACE_OF_SPADES, Card.KING_OF_SPADES ],
      p0Points: [ Card.TEN_OF_SPADES ],
      p0FaceCards: [],
      p1Hand: [ Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS ],
      p1Points: [ Card.TEN_OF_HEARTS ],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
      scrap: [],
    });
  });

  it('Triple jacks on a card with multiple other cards', () => {
    cy.skipOnGameStateApi();
    // Set Up
    cy.loadGameFixture(0, {
      p0Hand: [ Card.ACE_OF_SPADES, Card.JACK_OF_CLUBS, Card.KING_OF_SPADES, Card.JACK_OF_HEARTS ],
      p0Points: [ Card.ACE_OF_CLUBS, Card.TWO_OF_SPADES, Card.TWO_OF_CLUBS ],
      p0FaceCards: [],
      p1Hand: [ Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS, Card.JACK_OF_DIAMONDS, Card.JACK_OF_SPADES ],
      p1Points: [ Card.TEN_OF_HEARTS ],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
    });

    // Play jack of clubs on ten of hearts
    cy.get('[data-player-hand-card=11-0]').click();
    cy.get('[data-move-choice=jack]').click();
    cy.get('[data-opponent-point-card=10-2]').click();

    assertGameState(0, {
      p0Hand: [ Card.ACE_OF_SPADES, Card.KING_OF_SPADES, Card.JACK_OF_HEARTS ],
      p0Points: [ Card.ACE_OF_CLUBS, Card.TWO_OF_SPADES, Card.TEN_OF_HEARTS, Card.TWO_OF_CLUBS ],
      p0FaceCards: [],
      p1Hand: [ Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS, Card.JACK_OF_DIAMONDS, Card.JACK_OF_SPADES ],
      p1Points: [],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
      scrap: [],
    });

    cy.get('[data-player-hand-card]').should('have.length', 3);
    cy.get('#turn-indicator').contains("OPPONENT'S TURN");

    // Opponent plays 2nd jack
    cy.playJackOpponent(Card.JACK_OF_DIAMONDS, Card.TEN_OF_HEARTS);

    assertGameState(0, {
      p0Hand: [ Card.ACE_OF_SPADES, Card.KING_OF_SPADES, Card.JACK_OF_HEARTS ],
      p0Points: [ Card.ACE_OF_CLUBS, Card.TWO_OF_SPADES, Card.TWO_OF_CLUBS ],
      p0FaceCards: [],
      p1Hand: [ Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS, Card.JACK_OF_SPADES ],
      p1Points: [ Card.TEN_OF_HEARTS ],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
      scrap: [],
    });

    // Player plays 3rd jack
    cy.get('[data-player-hand-card=11-2]').click();
    cy.get('[data-move-choice=jack]').click();
    cy.get('[data-opponent-point-card=10-2]').click({ force: true });

    assertGameState(0, {
      p0Hand: [ Card.ACE_OF_SPADES, Card.KING_OF_SPADES ],
      p0Points: [ Card.ACE_OF_CLUBS, Card.TWO_OF_SPADES, Card.TEN_OF_HEARTS, Card.TWO_OF_CLUBS ],
      p0FaceCards: [],
      p1Hand: [ Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS, Card.JACK_OF_SPADES ],
      p1Points: [],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
      scrap: [],
    });
  });

  it('Four cards, each with a jack', () => {
    cy.skipOnGameStateApi();
    // Set Up
    cy.loadGameFixture(0, {
      p0Hand: [ Card.JACK_OF_CLUBS, Card.JACK_OF_HEARTS, Card.JACK_OF_DIAMONDS, Card.JACK_OF_SPADES ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [ Card.ACE_OF_SPADES, Card.ACE_OF_DIAMONDS, Card.ACE_OF_CLUBS ],
      p1Points: [ Card.ACE_OF_HEARTS ],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
    });

    // Play jack of clubs on ace of hearts
    cy.get('[data-player-hand-card=11-0]').click();
    cy.get('[data-move-choice=jack]').click();
    cy.get('[data-opponent-point-card=1-2]').click();

    cy.playPointsOpponent(Card.ACE_OF_SPADES);

    assertGameState(0, {
      p0Hand: [ Card.JACK_OF_HEARTS, Card.JACK_OF_DIAMONDS, Card.JACK_OF_SPADES ],
      p0Points: [ Card.ACE_OF_HEARTS ],
      p0FaceCards: [],
      p1Hand: [ Card.ACE_OF_DIAMONDS, Card.ACE_OF_CLUBS ],
      p1Points: [ Card.ACE_OF_SPADES ],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
    });

    // Play jack
    cy.get('[data-player-hand-card=11-1]').click();
    cy.get('[data-move-choice=jack]').click();
    cy.get('[data-opponent-point-card=1-3]').click();

    cy.playPointsOpponent(Card.ACE_OF_DIAMONDS);

    assertGameState(0, {
      p0Hand: [ Card.JACK_OF_HEARTS, Card.JACK_OF_SPADES ],
      p0Points: [ Card.ACE_OF_HEARTS, Card.ACE_OF_SPADES ],
      p0FaceCards: [],
      p1Hand: [ Card.ACE_OF_CLUBS ],
      p1Points: [ Card.ACE_OF_DIAMONDS ],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
    });

    // Play jack
    cy.get('[data-player-hand-card=11-2]').click();
    cy.get('[data-move-choice=jack]').click();
    cy.get('[data-opponent-point-card=1-1]').click();

    cy.playPointsOpponent(Card.ACE_OF_CLUBS);

    assertGameState(0, {
      p0Hand: [ Card.JACK_OF_SPADES ],
      p0Points: [ Card.ACE_OF_HEARTS, Card.ACE_OF_SPADES, Card.ACE_OF_DIAMONDS ],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [ Card.ACE_OF_CLUBS ],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
    });

    // Play jack of spades on ace of clubs
    cy.get('[data-player-hand-card=11-3]').click();
    cy.get('[data-move-choice=jack]').click();
    cy.get('[data-opponent-point-card=1-0]').click();

    assertGameState(0, {
      p0Hand: [],
      p0Points: [ Card.ACE_OF_HEARTS, Card.ACE_OF_SPADES, Card.ACE_OF_DIAMONDS, Card.ACE_OF_CLUBS ],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
    });
  });
});
