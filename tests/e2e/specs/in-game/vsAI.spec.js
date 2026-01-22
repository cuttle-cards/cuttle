import { myUser } from '../../fixtures/userFixtures';
import { Card } from '../../fixtures/cards';
import { assertGameState, assertVictory } from '../../support/helpers';
import { announcementData } from '../../../../src/routes/home/components/announcementDialog/data/announcementData';

function setup() {
  cy.wipeDatabase();
  cy.visit('/');
  cy.signupPlayer(myUser);
  cy.vueRoute('/');
  window.localStorage.setItem('announcement', announcementData.id);
  cy.get('[data-cy=create-ai-game]').click();
}

describe('Playing VS AI', () => {
  beforeEach(setup);

  it('Plays an AI game', () => {
    cy.get('[data-player-hand-card]').should('have.length', 5);

    cy.get('[data-cy=opponent-username]').should('contain', 'CuttleBot');

    cy.loadGameFixture(0, {
      p0Hand: [ Card.TEN_OF_SPADES, Card.TEN_OF_DIAMONDS, Card.TEN_OF_HEARTS, Card.TEN_OF_CLUBS, Card.NINE_OF_SPADES ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [
        Card.EIGHT_OF_CLUBS,
        Card.EIGHT_OF_DIAMONDS,
        Card.EIGHT_OF_HEARTS,
        Card.EIGHT_OF_SPADES,
        Card.SIX_OF_CLUBS,
        Card.SIX_OF_DIAMONDS,
      ],
      p1Points: [],
      p1FaceCards: [],
      deck: [],
    });

    assertGameState(0, {
      p0Hand: [ Card.TEN_OF_SPADES, Card.TEN_OF_DIAMONDS, Card.TEN_OF_HEARTS, Card.TEN_OF_CLUBS, Card.NINE_OF_SPADES ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [
        Card.EIGHT_OF_CLUBS,
        Card.EIGHT_OF_DIAMONDS,
        Card.EIGHT_OF_HEARTS,
        Card.EIGHT_OF_SPADES,
        Card.SIX_OF_CLUBS,
        Card.SIX_OF_DIAMONDS,
      ],
      p1Points: [],
      p1FaceCards: [],
      deck: [],
    });

    cy.get('[data-player-hand-card=10-3]').click();
    cy.get('[data-move-choice=points]').click();

    cy.get('#turn-indicator').contains('OPPONENT\'S TURN');
    assertGameState(0, {
      p0Hand: [ Card.TEN_OF_DIAMONDS, Card.TEN_OF_HEARTS, Card.TEN_OF_CLUBS, Card.NINE_OF_SPADES ],
      p0Points: [ Card.TEN_OF_SPADES ],
      p0FaceCards: [],
      p1Hand: [
        Card.EIGHT_OF_CLUBS,
        Card.EIGHT_OF_DIAMONDS,
        Card.EIGHT_OF_HEARTS,
        Card.EIGHT_OF_SPADES,
        Card.SIX_OF_CLUBS,
        Card.SIX_OF_DIAMONDS,
      ],
      p1Points: [],
      p1FaceCards: [],
      deck: [],
    });

    // Bot should then make move
    cy.get('#turn-indicator').contains('YOUR TURN');

    // Player plays points again
    cy.get('[data-player-hand-card=10-2]').click();
    cy.get('[data-move-choice=points]').click();

    cy.get('#turn-indicator').contains('OPPONENT\'S TURN');

    // Bot should then make move
    cy.get('#turn-indicator').contains('YOUR TURN');

    // Player plays points ftw
    cy.get('[data-player-hand-card=10-1]').click();
    cy.get('[data-move-choice=points]').click();
    assertVictory({ wins: 1, losses: 0, stalemates: 0 });
  });
});
