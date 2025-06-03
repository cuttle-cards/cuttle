import { setupGameBetweenTwoUnseenPlayers, assertGameState } from '../../../support/helpers';
import { myUser, playerOne, playerTwo } from '../../../fixtures/userFixtures';
import { Card } from '../../../fixtures/cards';

describe('Rewatching finished games', () => {
  it('Watches a finished game clicking through the moves one at a time', () => {
    cy.wipeDatabase();
    cy.visit('/');
    cy.signupOpponent(playerOne);
    cy.signupOpponent(playerTwo);
    setupGameBetweenTwoUnseenPlayers('replay');

    cy.get('@replayGameId').then((gameId) => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.TEN_OF_CLUBS, Card.TEN_OF_DIAMONDS, Card.TEN_OF_HEARTS, Card.TEN_OF_SPADES, Card.ACE_OF_CLUBS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [
          Card.TWO_OF_CLUBS,
          Card.TWO_OF_DIAMONDS,
          Card.TWO_OF_HEARTS,
          Card.TWO_OF_SPADES,
          Card.THREE_OF_CLUBS,
          Card.THREE_OF_DIAMONDS
        ],
        p1Points: [],
        p1FaceCards: [],
      }, gameId);

      cy.recoverSessionOpponent(playerOne);
      cy.playPointsOpponent(Card.TEN_OF_CLUBS, gameId);

      cy.recoverSessionOpponent(playerTwo);
      cy.drawCardOpponent(gameId);

      cy.recoverSessionOpponent(playerOne);
      cy.playPointsOpponent(Card.TEN_OF_DIAMONDS, gameId);

      cy.recoverSessionOpponent(playerTwo);
      cy.drawCardOpponent(gameId);

      cy.recoverSessionOpponent(playerOne);
      cy.playPointsOpponent(Card.TEN_OF_HEARTS, gameId);

      cy.visit('/');
      cy.signupPlayer(myUser);
      cy.visit(`/spectate/${gameId}`);

      cy.get('[data-player-hand-card]').should('have.length', 5);
      cy.get('[data-cy=history-log]').should('have.length', 1);

      cy.get('[data-cy=playback-controls]')
        .find('[data-cy=step-forward]')
        .click();
    //   assertGameState(0, {
    //     p0Hand: [ Card.TEN_OF_CLUBS, Card.TEN_OF_DIAMONDS, Card.TEN_OF_HEARTS, Card.TEN_OF_SPADES, Card.ACE_OF_CLUBS ],
    //     p0Points: [],
    //     p0FaceCards: [],
    //     p1Hand: [
    //       Card.TWO_OF_CLUBS,
    //       Card.TWO_OF_DIAMONDS,
    //       Card.TWO_OF_HEARTS,
    //       Card.TWO_OF_SPADES,
    //       Card.THREE_OF_CLUBS,
    //       Card.THREE_OF_DIAMONDS
    //     ],
    //     p1Points: [],
    //     p1FaceCards: [],
    //   });
    });

  });
});
