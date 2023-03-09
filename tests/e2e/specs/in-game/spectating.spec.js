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

  it.only('Spectates a game', () => {
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

    cy.reload();

    assertGameState(0, {
      p0Hand: [Card.ACE_OF_CLUBS],
      p0Points: [Card.TEN_OF_SPADES, Card.ACE_OF_SPADES],
      p0FaceCards: [Card.KING_OF_SPADES],
      p1Hand: [Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS],
      p1Points: [Card.TEN_OF_HEARTS],
      p1FaceCards: [Card.KING_OF_HEARTS],
    }, true);

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
  });


  it('Continues spectating after page refresh', () => {});

  it('Continues spectating after socket disconnect', () => {});

  it('Prevents spectator from making moves', () => {});
});