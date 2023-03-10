import { playerOne, playerTwo } from '../../fixtures/userFixtures';
import {
  username as playerUsername,
  validPassword as playerPassword,
  Card,
  assertGameState,
  assertSnackbarError,
  SnackBarError,
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
    cy.setupGameAsSpectator();
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

    // P0 plays ace of spades
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

    // Refresh the page
    cy.reload();
    // Game state appears unchanged
    assertGameState(0, {
      p0Hand: [Card.ACE_OF_CLUBS],
      p0Points: [Card.TEN_OF_SPADES, Card.ACE_OF_SPADES],
      p0FaceCards: [Card.KING_OF_SPADES],
      p1Hand: [Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS],
      p1Points: [Card.TEN_OF_HEARTS],
      p1FaceCards: [Card.KING_OF_HEARTS],
    }, true);

    // P1 plays Ace of hearts -- UI updates accordingly
    cy.recoverSessionOpponent(playerTwo.username);
    cy.playPointsSpectator(Card.ACE_OF_HEARTS, 1);

    assertGameState(0, {
      p0Hand: [Card.ACE_OF_CLUBS],
      p0Points: [Card.TEN_OF_SPADES, Card.ACE_OF_SPADES],
      p0FaceCards: [Card.KING_OF_SPADES],
      p1Hand: [Card.ACE_OF_DIAMONDS],
      p1Points: [Card.TEN_OF_HEARTS, Card.ACE_OF_HEARTS],
      p1FaceCards: [Card.KING_OF_HEARTS],
    }, true);

    // Disconnect spectator's socket
    cy.window().its('cuttle.app.config.globalProperties.$store').invoke('dispatch', 'disconnectSocket');
  
    // P0 plays ace of clubs
    cy.recoverSessionOpponent(playerOne.username);
    cy.playPointsSpectator(Card.ACE_OF_CLUBS, 0);

    // Reconnect the socket
    cy.window().its('cuttle.app.config.globalProperties.$store').invoke('dispatch', 'reconnectSocket');

    // Spectator receives the update
    assertGameState(0, {
      p0Hand: [],
      p0Points: [Card.TEN_OF_SPADES, Card.ACE_OF_SPADES, Card.ACE_OF_CLUBS],
      p0FaceCards: [Card.KING_OF_SPADES],
      p1Hand: [Card.ACE_OF_DIAMONDS],
      p1Points: [Card.TEN_OF_HEARTS, Card.ACE_OF_HEARTS],
      p1FaceCards: [Card.KING_OF_HEARTS],
    }, true);
  });

  it.only('Prevents spectator from making moves', () => {
    cy.setupGameAsSpectator();
    cy.loadGameFixture({
      p0Hand: [
        Card.ACE_OF_SPADES,
        Card.ACE_OF_HEARTS,
        Card.TWO_OF_DIAMONDS,
        Card.KING_OF_CLUBS,
        Card.JACK_OF_DIAMONDS,
        Card.THREE_OF_CLUBS
      ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [Card.FOUR_OF_CLUBS, Card.ACE_OF_DIAMONDS],
      p1Points: [Card.ACE_OF_CLUBS],
      p1FaceCards: [Card.KING_OF_HEARTS],
    });

    assertGameState(0, {
      p0Hand: [
        Card.ACE_OF_SPADES,
        Card.ACE_OF_HEARTS,
        Card.TWO_OF_DIAMONDS,
        Card.KING_OF_CLUBS,
        Card.JACK_OF_DIAMONDS,
        Card.THREE_OF_CLUBS
      ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [Card.FOUR_OF_CLUBS, Card.ACE_OF_DIAMONDS],
      p1Points: [Card.ACE_OF_CLUBS],
      p1FaceCards: [Card.KING_OF_HEARTS],
    }, true);

    // Can't play points
    cy.get('[data-player-hand-card=1-3]').click();
    cy.get('[data-move-choice=points]').click();
    assertSnackbarError(SnackBarError.NOT_IN_GAME);
    // Can't play oneOff
    // Can't play royal
    // Can't play jack
    // Can't scuttle
    // Can't play targeted oneOff
    // Can't resolve three
    // Can't resolve four
    // Can't play seven
    // Can't counter
    // Can't resolve
  });
});
