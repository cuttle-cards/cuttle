import { Card } from '../../fixtures/cards';

/**
 * Video Playground
 * This test file is used to create promotional videos of various moves in the game.
 * It is NOT run in CI and will only be visible in they cypress ui if you open cypress
 * with the playground-specific command of `npm run e2e:gui:playground`
 * 
 * Each test sets up a scenario and makes one or several moves, pausing in between
 * for realistic timing. Game logic is not appropriately tested; the focus is on
 * being able to record the screen to create quick move-highlight videos
 */
describe('Video Playground', () => {
  beforeEach(() => {
    cy.viewport(1920, 1080);
    cy.setupGameAsP0();
  });

  it('Plays Points', () => {
    cy.loadGameFixture(0, {
      p0Hand: [Card.ACE_OF_SPADES, Card.SIX_OF_SPADES, Card.EIGHT_OF_HEARTS, Card.SEVEN_OF_DIAMONDS],
      p0Points: [Card.TEN_OF_SPADES],
      p0FaceCards: [],
      p1Hand: [
        Card.THREE_OF_CLUBS,
        Card.FIVE_OF_HEARTS,
        Card.EIGHT_OF_CLUBS,
        Card.NINE_OF_DIAMONDS,
        Card.NINE_OF_HEARTS
      ],
      p1Points: [Card.FIVE_OF_HEARTS],
      p1FaceCards: [],
    });
    cy.wait(1000);

    cy.get('[data-player-hand-card=8-2]').click();
    cy.wait(800);

    cy.get('[data-move-choice=points]').click();
  });

  it('Plays a King', () => {
    cy.loadGameFixture(0, {
      p0Hand: [Card.ACE_OF_SPADES, Card.SIX_OF_SPADES, Card.KING_OF_HEARTS, Card.SEVEN_OF_DIAMONDS],
      p0Points: [Card.TEN_OF_SPADES],
      p0FaceCards: [],
      p1Hand: [
        Card.THREE_OF_CLUBS,
        Card.FIVE_OF_HEARTS,
        Card.EIGHT_OF_CLUBS,
        Card.NINE_OF_DIAMONDS,
        Card.NINE_OF_HEARTS
      ],
      p1Points: [Card.QUEEN_OF_CLUBS],
      p1FaceCards: [],
    });
    cy.wait(1000);
  
    cy.get('[data-player-hand-card=13-2]').click();
    cy.wait(800);
  
    cy.get('[data-move-choice=faceCard]').click();
  });

  it('Scuttles', () => {
    cy.loadGameFixture(0, {
      p0Hand: [Card.ACE_OF_SPADES, Card.SIX_OF_SPADES, Card.KING_OF_HEARTS, Card.SEVEN_OF_DIAMONDS],
      p0Points: [Card.FOUR_OF_CLUBS],
      p0FaceCards: [],
      p1Hand: [
        Card.THREE_OF_CLUBS,
        Card.SEVEN_OF_CLUBS,
        Card.EIGHT_OF_CLUBS,
        Card.NINE_OF_DIAMONDS,
        Card.NINE_OF_HEARTS
      ],
      p1Points: [Card.FIVE_OF_DIAMONDS, Card.TEN_OF_SPADES],
      p1FaceCards: [],
    });
    cy.wait(1000);
  
    cy.get('[data-player-hand-card=7-1]').click();
    cy.wait(800);
  
    cy.get('[data-move-choice=scuttle]').click();

    cy.wait(800);
    cy.get('[data-opponent-point-card=5-1]').click();
  });

  it('Jacks', () => {
    cy.loadGameFixture(0, {
      p0Hand: [Card.ACE_OF_SPADES, Card.SIX_OF_SPADES, Card.JACK_OF_CLUBS, Card.JACK_OF_DIAMONDS],
      p0Points: [Card.FOUR_OF_CLUBS],
      p0FaceCards: [],
      p1Hand: [
        Card.THREE_OF_CLUBS,
        Card.SEVEN_OF_CLUBS,
        Card.EIGHT_OF_CLUBS,
        Card.NINE_OF_DIAMONDS,
        Card.JACK_OF_HEARTS
      ],
      p1Points: [Card.FIVE_OF_DIAMONDS, Card.TEN_OF_SPADES],
      p1FaceCards: [],
    });
    cy.wait(1000);

    cy.get('[data-player-hand-card=11-0]').click();
    cy.wait(800);

    cy.get('[data-move-choice=jack]').click();
    cy.wait(800);

    cy.get('[data-opponent-point-card=10-3]').click();
    cy.wait(1000);

    cy.playJackOpponent(Card.JACK_OF_HEARTS, Card.TEN_OF_SPADES);
    cy.wait(800);

    cy.get('[data-player-hand-card=11-1]').click();
    cy.wait(800);

    cy.get('[data-move-choice=jack]').click();
    cy.wait(800);

    cy.get('[data-opponent-point-card=10-3]').click();
  });

  it.only('Play Queens', () => {
    cy.loadGameFixture(0, {
      p0Hand: [Card.TWO_OF_CLUBS, Card.TWO_OF_HEARTS, Card.FOUR_OF_SPADES],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [Card.QUEEN_OF_SPADES, Card.JACK_OF_DIAMONDS],
      p1Points: [],
      p1FaceCards: [Card.KING_OF_CLUBS, Card.KING_OF_DIAMONDS],
    });
    cy.wait(1000);

    cy.get('[data-player-hand-card=4-3]').click();
    cy.get('[data-move-choice=points]').click();
    cy.get('#turn-indicator').contains("OPPONENT'S TURN");
    cy.wait(1000);

    cy.playJackOpponent(Card.JACK_OF_DIAMONDS, Card.FOUR_OF_SPADES);
    cy.get('#turn-indicator').contains('YOUR TURN');
    cy.wait(1000);

    // START RECORDING HERE //
    // Player uses 2 on opponent jack
    cy.get('[data-player-hand-card=2-0]').click();
    cy.wait(500);
    cy.get('[data-move-choice=targetedOneOff]').click();
    cy.wait(800);
    cy.get('[data-opponent-face-card=13-1]').click();
    cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
    cy.wait(500);
    cy.resolveOpponent();

    // Opponent plays queen
    cy.wait(1000);
    cy.playFaceCardOpponent(Card.QUEEN_OF_SPADES);
    cy.get('#turn-indicator').contains('YOUR TURN');

    // Player attempts to 2 the king, but can't
    cy.get('[data-player-hand-card=2-2]').click();
    cy.wait(500);
    cy.get('[data-move-choice=targetedOneOff]').click();
    cy.wait(800);
    cy.get('[data-opponent-face-card=13-0]').click();

    // Close snackbar, then try on the queen
    cy.wait(1000);
    cy.get('[data-cy=close-snackbar]').click();

    // Player successfully 2's queen
    cy.get('[data-player-hand-card=2-2]').click();
    cy.wait(500);
    cy.get('[data-move-choice=targetedOneOff]').click();
    cy.wait(800);
    cy.get('[data-opponent-face-card=12-3]').click();
    cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
    cy.wait(500);
    cy.resolveOpponent();
  });

  it('Playing Aces', () => {
    cy.loadGameFixture(0, {
      p0Hand: [Card.ACE_OF_SPADES, Card.SIX_OF_SPADES, Card.SEVEN_OF_HEARTS],
      p0Points: [Card.FOUR_OF_CLUBS],
      p0FaceCards: [],
      p1Hand: [
        Card.THREE_OF_CLUBS,
        Card.SEVEN_OF_CLUBS,
        Card.EIGHT_OF_CLUBS,
        Card.NINE_OF_DIAMONDS,
        Card.JACK_OF_HEARTS
      ],
      p1Points: [Card.EIGHT_OF_CLUBS, Card.TEN_OF_SPADES],
      p1FaceCards: [],
    });
    cy.wait(1000);

    cy.get('[data-player-hand-card=1-3]').click();
    cy.wait(800);

    cy.get('[data-move-choice=oneOff]').click();
    cy.wait(1000);

    cy.resolveOpponent();
  });

  it('Playing Sixes', () => {
    cy.loadGameFixture(0, {
      p0Hand: [
        Card.THREE_OF_CLUBS,
        Card.SIX_OF_CLUBS,
        Card.EIGHT_OF_CLUBS,
        Card.NINE_OF_DIAMONDS,
        Card.JACK_OF_CLUBS,
        Card.JACK_OF_HEARTS,
        Card.QUEEN_OF_CLUBS,
      ],
      p0Points: [Card.FIVE_OF_DIAMONDS, Card.TEN_OF_SPADES],
      p0FaceCards: [Card.EIGHT_OF_SPADES],
      p1Hand: [Card.ACE_OF_SPADES, Card.SIX_OF_SPADES, Card.JACK_OF_DIAMONDS, Card.JACK_OF_SPADES],
      p1Points: [Card.FOUR_OF_CLUBS],
      p1FaceCards: [Card.KING_OF_CLUBS, Card.EIGHT_OF_DIAMONDS],
    });

    cy.get('[data-player-hand-card=11-0]').click();
    cy.get('[data-move-choice=jack]').click();
    cy.get('[data-opponent-point-card=4-0]').click();
    cy.get('[data-player-point-card]').should('have.length', 3);

    cy.playJackOpponent(Card.JACK_OF_DIAMONDS, Card.TEN_OF_SPADES);
    cy.get('[data-player-point-card]').should('have.length', 2);

    cy.get('[data-player-hand-card=11-2]').click();
    cy.get('[data-move-choice=jack]').click();
    cy.get('[data-opponent-point-card=10-3]').click();
    cy.get('[data-player-point-card]').should('have.length', 3);

    cy.playJackOpponent(Card.JACK_OF_SPADES, Card.TEN_OF_SPADES);
    cy.get('[data-player-point-card]').should('have.length', 2);

    cy.wait(1500);

    // Part to record: playing the 6
    cy.get('[data-player-hand-card=6-0]').click();
    cy.wait(800);

    cy.get('[data-move-choice=oneOff]').click();
    cy.wait(1000);

    cy.resolveOpponent();
  });
});
