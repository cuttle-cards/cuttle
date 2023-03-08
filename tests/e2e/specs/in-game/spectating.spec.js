import { playerOne, playerTwo } from '../../fixtures/userFixtures';
import {
  username as playerUsername,
  validPassword as playerPassword,
  Card,
  assertGameState,
} from '../../support/helpers';

function setup() {
  cy.wipeDatabase();
  cy.visit('/');
  cy.signupPlayer(playerUsername, playerPassword);
  cy.vueRoute('/');
}

describe('Spectating Games', () => {
  beforeEach(setup);

  it('Spectates a game', () => {
    cy.visit('/');
    cy.createGamePlayer({ gameName: 'Test Game', isRanked: false }).then((gameData) => {
      // Test that JOIN button starts enabled
      cy.contains('[data-cy-join-game]', 'Play').should('not.be.disabled');
      // Sign up 2 users and subscribe them to game
      cy.signupOpponent(playerOne.username, playerOne.password);
      cy.subscribeOpponent(gameData.gameId);
      // Opponents start game, it appears as spectatable
      cy.readyOpponent(gameData.gameId);
      cy.signupOpponent(playerTwo.username, playerTwo.password);
      cy.subscribeOpponent(gameData.gameId, 1);
      cy.contains('[data-cy-join-game]', 'Play').should('be.disabled');

      // Switch to spectate tab
      cy.get('[data-cy-game-list-selector=spectate]').click();
      cy.get('[data-cy=no-spectate-game-text]').should('contain', 'No Games Available to Spectate');

      // The other game starts -- should now appear in spectate list
      cy.readyOpponent(gameData.gameId);
      cy.get('[data-cy-spectate-game]').click();

      cy.url().should('include', '/spectate/');
      cy.window()
      .its('cuttle.app.config.globalProperties.$store.state.game')
      .then((gameState) => {
        expect(gameState.id).to.not.eq(null);
      });

      cy.loadGameFixture({
        p0Hand: [Card.ACE_OF_SPADES, Card.ACE_OF_CLUBS],
        p0Points: [Card.TEN_OF_SPADES],
        p0FaceCards: [Card.KING_OF_SPADES],
        p1Hand: [Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS],
        p1Points: [Card.TEN_OF_HEARTS],
        p1FaceCards: [Card.KING_OF_HEARTS],
      });

      assertGameState(0, {
        p0Hand: [Card.ACE_OF_SPADES, Card.ACE_OF_CLUBS],
        p0Points: [Card.TEN_OF_SPADES],
        p0FaceCards: [Card.KING_OF_SPADES],
        p1Hand: [Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS],
        p1Points: [Card.TEN_OF_HEARTS],
        p1FaceCards: [Card.KING_OF_HEARTS],
      }, true);

      cy.recoverSessionOpponent(playerOne.username);
      cy.playPointsSpectator(Card.ACE_OF_SPADES, 0);

      assertGameState(0, {
        p0Hand: [Card.ACE_OF_CLUBS],
        p0Points: [Card.TEN_OF_SPADES, Card.ACE_OF_SPADES],
        p0FaceCards: [Card.KING_OF_SPADES],
        p1Hand: [Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS],
        p1Points: [Card.TEN_OF_HEARTS],
        p1FaceCards: [Card.KING_OF_HEARTS],
      }, true);
    });
  });


  it('Continues spectating after page refresh', () => {});

  it('Continues spectating after socket disconnect', () => {});

  it('Prevents spectator from making moves', () => {});
});