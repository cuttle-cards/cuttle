import { myUser } from '../../fixtures/userFixtures';
import { Card } from '../../fixtures/cards';
import { assertGameState, assertVictory, assertLoss } from '../../support/helpers';
import { announcementData } from '../../../../src/routes/home/components/announcementDialog/data/announcementData';

function setup() {
  cy.wipeDatabase();
  cy.visit('/');
  cy.signupPlayer(myUser);
  cy.vueRoute('/');
  window.localStorage.setItem('announcement', announcementData.id);
  cy.get('[data-cy=create-ai-game]').click();
  cy.get('[data-player-hand-card]').should('have.length', 5);
  cy.get('[data-cy=opponent-username]').should('contain', 'CuttleBot');
}

function concede(score = null) {
  // Re-open concede menu and confirm concession
  cy.get('#game-menu-activator').click();
  cy.get('#game-menu').should('be.visible')
    .get('[data-cy=concede-initiate]')
    .click();
  cy.get('#request-gameover-dialog').should('be.visible')
    .get('[data-cy=request-gameover-confirm]')
    .click();

  assertLoss(score);
}

describe('Playing VS AI', () => {
  beforeEach(setup);

  it('Plays an AI game', () => {
    cy.loadGameFixture(0, {
      p0Hand: [ Card.TEN_OF_SPADES, Card.TEN_OF_DIAMONDS, Card.TEN_OF_HEARTS, Card.TEN_OF_CLUBS, Card.NINE_OF_SPADES ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [
        Card.EIGHT_OF_CLUBS,
        Card.EIGHT_OF_DIAMONDS,
        Card.EIGHT_OF_HEARTS,
        Card.EIGHT_OF_SPADES,
        Card.QUEEN_OF_CLUBS,
        Card.QUEEN_OF_DIAMONDS,
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
        Card.QUEEN_OF_CLUBS,
        Card.QUEEN_OF_DIAMONDS,
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
        Card.QUEEN_OF_CLUBS,
        Card.QUEEN_OF_DIAMONDS,
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

  it('Rematches in VS AI', () => {
    concede({ wins: 0, losses: 1, stalemates: 0 });
    cy.get('[data-cy=gameover-rematch]').click();
    cy.get('[data-player-hand-card]').should('have.length', 6);
    cy.get('[data-cy=opponent-username]').should('contain', 'CuttleBot');
    cy.loadGameFixture(1, {
      p0Hand: [ Card.TEN_OF_SPADES, Card.TEN_OF_DIAMONDS, Card.TEN_OF_HEARTS, Card.TEN_OF_CLUBS, Card.NINE_OF_SPADES ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [
        Card.EIGHT_OF_CLUBS,
        Card.EIGHT_OF_DIAMONDS,
        Card.EIGHT_OF_HEARTS,
        Card.EIGHT_OF_SPADES,
        Card.QUEEN_OF_CLUBS,
        Card.QUEEN_OF_DIAMONDS,
      ],
      p1Points: [],
      p1FaceCards: [],
      deck: [],
    });
    concede({ wins: 0, losses: 2, stalemates: 0 });
  });

  describe('AI Decision making', () => {
    it('Goes for 2-for-1 ace when available', () => {
      cy.loadGameFixture(0, {
        p0Hand: [  Card.TEN_OF_DIAMONDS ],
        p0Points: [ Card.TEN_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [
          Card.ACE_OF_CLUBS,
          Card.EIGHT_OF_DIAMONDS,
          Card.EIGHT_OF_HEARTS,
          Card.EIGHT_OF_SPADES,
          Card.QUEEN_OF_CLUBS,
          Card.QUEEN_OF_DIAMONDS,
        ],
        p1Points: [],
        p1FaceCards: [],
      });

      cy.get('[data-player-hand-card=10-1]').click();
      cy.get('[data-move-choice=points]').click();

      cy.get('#cannot-counter-dialog').should('be.visible')
        .should('contain', 'A♣️')
        .get('[data-cy=cannot-counter-resolve]')
        .click();

      assertGameState(0, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [
          Card.EIGHT_OF_DIAMONDS,
          Card.EIGHT_OF_HEARTS,
          Card.EIGHT_OF_SPADES,
          Card.QUEEN_OF_CLUBS,
          Card.QUEEN_OF_DIAMONDS,
        ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [
          Card.TEN_OF_DIAMONDS,
          Card.TEN_OF_SPADES,
          Card.ACE_OF_CLUBS,
        ]
      });
    });

    it('Goes for 2-for-1 six when available', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.QUEEN_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [ Card.KING_OF_DIAMONDS ],
        p1Hand: [
          Card.SIX_OF_CLUBS,
          Card.EIGHT_OF_DIAMONDS,
          Card.EIGHT_OF_HEARTS,
          Card.EIGHT_OF_SPADES,
          Card.QUEEN_OF_DIAMONDS,
        ],
        p1Points: [],
        p1FaceCards: [],
      });

      cy.get('[data-player-hand-card=12-0]').click();
      cy.get('[data-move-choice=faceCard]').click();

      cy.get('#cannot-counter-dialog').should('be.visible')
        .should('contain', '6♣️')
        .get('[data-cy=cannot-counter-resolve]')
        .click();

      assertGameState(0, {
        p0Hand: [],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [
          Card.EIGHT_OF_DIAMONDS,
          Card.EIGHT_OF_HEARTS,
          Card.EIGHT_OF_SPADES,
          Card.QUEEN_OF_DIAMONDS,
        ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [
          Card.KING_OF_DIAMONDS,
          Card.QUEEN_OF_CLUBS,
          Card.SIX_OF_CLUBS,
        ]
      });
    });

    it('Scuttles when in check', () => {
      cy.loadGameFixture(0, {
        p0Hand: [  Card.TEN_OF_DIAMONDS, Card.ACE_OF_CLUBS ],
        p0Points: [ Card.TEN_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [
          Card.TEN_OF_HEARTS,
          Card.EIGHT_OF_HEARTS,
          Card.EIGHT_OF_SPADES,
          Card.QUEEN_OF_CLUBS,
          Card.QUEEN_OF_DIAMONDS,
        ],
        p1Points: [],
        p1FaceCards: [],
      });

      cy.get('[data-player-hand-card=10-1]').click();
      cy.get('[data-move-choice=points]').click();

      assertGameState(0, {
        p0Hand: [ Card.ACE_OF_CLUBS ],
        p0Points: [ Card.TEN_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [
          Card.EIGHT_OF_HEARTS,
          Card.EIGHT_OF_SPADES,
          Card.QUEEN_OF_CLUBS,
          Card.QUEEN_OF_DIAMONDS,
        ],
        p1Points: [],
        p1FaceCards: [],
        scrap: [ Card.TEN_OF_DIAMONDS, Card.TEN_OF_HEARTS ],
      });
    });

    it('Wins with points if possible', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.THREE_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [
          Card.TEN_OF_SPADES,
          Card.EIGHT_OF_HEARTS,
          Card.EIGHT_OF_SPADES,
          Card.QUEEN_OF_CLUBS,
          Card.QUEEN_OF_DIAMONDS,
        ],
        p1Points: [ Card.TEN_OF_HEARTS, Card.ACE_OF_HEARTS ],
        p1FaceCards: [],
        topCard: Card.JACK_OF_CLUBS,
      });

      // Player draws card
      cy.get('#deck').click();

      // AI should win with TS
      assertGameState(0, {
        p0Hand: [ Card.THREE_OF_CLUBS, Card.JACK_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [
          Card.EIGHT_OF_HEARTS,
          Card.EIGHT_OF_SPADES,
          Card.QUEEN_OF_CLUBS,
          Card.QUEEN_OF_DIAMONDS,
        ],
        p1Points: [ Card.TEN_OF_HEARTS, Card.ACE_OF_HEARTS, Card.TEN_OF_SPADES ],
        p1FaceCards: [],
      });

      assertLoss({ wins: 0, losses: 1, stalemates: 0 });
    });
  });
});
