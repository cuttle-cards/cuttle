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
      p0Hand: [ Card.ACE_OF_SPADES, Card.SIX_OF_SPADES, Card.EIGHT_OF_HEARTS, Card.SEVEN_OF_DIAMONDS ],
      p0Points: [ Card.TEN_OF_SPADES ],
      p0FaceCards: [],
      p1Hand: [
        Card.THREE_OF_CLUBS,
        Card.FIVE_OF_HEARTS,
        Card.EIGHT_OF_CLUBS,
        Card.NINE_OF_DIAMONDS,
        Card.NINE_OF_HEARTS
      ],
      p1Points: [ Card.FIVE_OF_HEARTS ],
      p1FaceCards: [],
    });
    cy.wait(1000);

    cy.get('[data-player-hand-card=8-2]').click();
    cy.wait(800);

    cy.get('[data-move-choice=points]').click();
  });

  it('Plays a King', () => {
    cy.loadGameFixture(0, {
      p0Hand: [ Card.ACE_OF_SPADES, Card.SIX_OF_SPADES, Card.KING_OF_HEARTS, Card.SEVEN_OF_DIAMONDS ],
      p0Points: [ Card.TEN_OF_SPADES ],
      p0FaceCards: [],
      p1Hand: [
        Card.THREE_OF_CLUBS,
        Card.FIVE_OF_HEARTS,
        Card.EIGHT_OF_CLUBS,
        Card.NINE_OF_DIAMONDS,
        Card.NINE_OF_HEARTS
      ],
      p1Points: [ Card.QUEEN_OF_CLUBS ],
      p1FaceCards: [],
    });
    cy.wait(1000);
  
    cy.get('[data-player-hand-card=13-2]').click();
    cy.wait(800);
  
    cy.get('[data-move-choice=faceCard]').click();
  });

  it('Scuttles', () => {
    cy.loadGameFixture(0, {
      p0Hand: [ Card.ACE_OF_SPADES, Card.SIX_OF_SPADES, Card.KING_OF_HEARTS, Card.SEVEN_OF_DIAMONDS ],
      p0Points: [ Card.FOUR_OF_CLUBS ],
      p0FaceCards: [],
      p1Hand: [
        Card.THREE_OF_CLUBS,
        Card.SEVEN_OF_CLUBS,
        Card.EIGHT_OF_CLUBS,
        Card.NINE_OF_DIAMONDS,
        Card.NINE_OF_HEARTS
      ],
      p1Points: [ Card.FIVE_OF_DIAMONDS, Card.TEN_OF_SPADES ],
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
      p0Hand: [ Card.ACE_OF_SPADES, Card.SIX_OF_SPADES, Card.JACK_OF_CLUBS, Card.JACK_OF_DIAMONDS ],
      p0Points: [ Card.FOUR_OF_CLUBS ],
      p0FaceCards: [],
      p1Hand: [
        Card.THREE_OF_CLUBS,
        Card.SEVEN_OF_CLUBS,
        Card.EIGHT_OF_CLUBS,
        Card.NINE_OF_DIAMONDS,
        Card.JACK_OF_HEARTS
      ],
      p1Points: [ Card.FIVE_OF_DIAMONDS, Card.TEN_OF_SPADES ],
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

  it('Play Queens', () => {
    cy.loadGameFixture(0, {
      p0Hand: [ Card.TWO_OF_CLUBS, Card.TWO_OF_HEARTS, Card.FOUR_OF_SPADES ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [ Card.JACK_OF_DIAMONDS, Card.SEVEN_OF_CLUBS ],
      p1Points: [],
      p1FaceCards: [ Card.KING_OF_CLUBS, Card.QUEEN_OF_SPADES ],
    });
    cy.wait(1000);

    cy.get('[data-player-hand-card=4-3]').click();
    cy.get('[data-move-choice=points]').click();
    cy.get('#turn-indicator').contains("OPPONENT'S TURN");
    cy.wait(1000);

    cy.playJackOpponent(Card.JACK_OF_DIAMONDS, Card.FOUR_OF_SPADES);
    cy.get('#turn-indicator').contains('YOUR TURN');
    cy.wait(2000);

    // START RECORDING HERE //

    // Player attempts to 2 the king, but can't
    cy.get('[data-player-hand-card=2-2]').click();
    cy.wait(500);
    cy.get('[data-move-choice=targetedOneOff]').click();
    cy.wait(1000);
    cy.get('[data-opponent-face-card=13-0]').click();

    // Close snackbar, then try on the queen
    cy.wait(1000);
    cy.get('[data-cy=close-snackbar]').click();

    // Player successfully 2's queen
    cy.get('[data-player-hand-card=2-2]').click();
    cy.wait(500);
    cy.get('[data-move-choice=targetedOneOff]').click();
    cy.wait(1000);
    cy.get('[data-opponent-face-card=12-3]').click();
    cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
    cy.wait(1000);
    cy.resolveOpponent();
  });

  it('Playing Aces', () => {
    cy.loadGameFixture(0, {
      p0Hand: [ Card.ACE_OF_SPADES, Card.SIX_OF_SPADES, Card.SEVEN_OF_HEARTS ],
      p0Points: [ Card.FOUR_OF_CLUBS ],
      p0FaceCards: [],
      p1Hand: [
        Card.THREE_OF_CLUBS,
        Card.SEVEN_OF_CLUBS,
        Card.EIGHT_OF_CLUBS,
        Card.NINE_OF_DIAMONDS,
        Card.JACK_OF_HEARTS
      ],
      p1Points: [ Card.EIGHT_OF_CLUBS, Card.TEN_OF_SPADES ],
      p1FaceCards: [],
    });
    cy.wait(1000);

    cy.get('[data-player-hand-card=1-3]').click();
    cy.wait(800);

    cy.get('[data-move-choice=oneOff]').click();
    cy.wait(1000);

    cy.resolveOpponent();
  });

  describe('Playing Twos', () => {
    it('Two to scrap a royal', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.ACE_OF_SPADES, Card.TWO_OF_HEARTS, Card.SEVEN_OF_HEARTS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.TEN_OF_SPADES ],
        p1Points: [],
        p1FaceCards: [ Card.KING_OF_DIAMONDS, Card.KING_OF_SPADES ],
      });
      cy.wait(2000);

      // START RECORDING HERE //
      cy.get('[data-player-hand-card=2-2]').click();
      cy.wait(800);
      cy.get('[data-move-choice=targetedOneOff]').click();
      cy.wait(1000);
      cy.get('[data-opponent-face-card=13-3]').click();
      cy.wait(1000);
      cy.resolveOpponent();
    });

    it('Plays a 2 to counter opponent one-off', () => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.TWO_OF_HEARTS, Card.SEVEN_OF_HEARTS ],
        p0Points: [ Card.TEN_OF_HEARTS, Card.TEN_OF_SPADES ],
        p0FaceCards: [],
        p1Hand: [ Card.ACE_OF_CLUBS, Card.FOUR_OF_SPADES ],
        p1Points: [],
        p1FaceCards: [],
      });

      cy.get('#deck').click();
      cy.wait(2000);
      // START RECORDING //

      // Opponent Aces
      cy.playOneOffOpponent(Card.ACE_OF_CLUBS);
      cy.wait(1500);

      // Player Counters
      cy.get('#counter-dialog')
        .should('be.visible')
        .get('[data-cy=counter]')
        .click();
      cy.wait(1000);


      cy.get('#choose-two-dialog')
        .should('be.visible')
        .get('[data-counter-dialog-card=2-2]')
        .click();
      cy.wait(1000);
      cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');

      // Opponent Resolves
      cy.resolveOpponent();
      cy.wait(1000);
      cy.get('#turn-indicator').contains('YOUR TURN');

      // Player plays points for the win
      cy.get('[data-player-hand-card=7-2]').click();
      cy.wait(800);
      cy.get('[data-move-choice=points]').click();

      cy.get('#game-over-dialog').should('exist');
    });
  });

  it('Playing Threes', () => {
    cy.loadGameFixture(0, {
      p0Hand: [
        Card.THREE_OF_CLUBS,
        Card.SEVEN_OF_CLUBS,
        Card.EIGHT_OF_CLUBS,
      ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [ Card.ACE_OF_SPADES, Card.SIX_OF_SPADES, Card.JACK_OF_DIAMONDS, Card.JACK_OF_SPADES ],
      p1Points: [],
      p1FaceCards: [ Card.KING_OF_CLUBS, Card.EIGHT_OF_DIAMONDS, Card.QUEEN_OF_SPADES ],
      scrap: [
        Card.SIX_OF_DIAMONDS,
        Card.TEN_OF_SPADES,
        Card.JACK_OF_DIAMONDS
      ],
    });
    cy.wait(1500);

    // START RECORDING //
    cy.get('[data-player-hand-card=3-0]').click();
    cy.wait(1000);
    cy.get('[data-move-choice=oneOff]').click();
    cy.wait(1000);
    cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
    cy.resolveOpponent();

    cy.get('#three-dialog').should('be.visible');
    cy.wait(500);
    cy.get('[data-three-dialog-card=6-1]').click();
    cy.wait(1000);
    cy.get('[data-cy=three-resolve').click();
  });

  it('Playing Fours', () => {
    cy.loadGameFixture(0, {
      p0Hand: [
        Card.FOUR_OF_CLUBS,
        Card.SIX_OF_DIAMONDS,
        Card.NINE_OF_HEARTS,
      ],
      p0Points: [ Card.FIVE_OF_CLUBS ],
      p0FaceCards: [],
      p1Hand: [ Card.ACE_OF_DIAMONDS, Card.EIGHT_OF_HEARTS, Card.JACK_OF_SPADES ],
      p1Points: [],
      p1FaceCards: [],
    });
    cy.wait(1500);

    // START RECORDING //
    cy.get('[data-player-hand-card=4-0]').click();
    cy.wait(1000);
    cy.get('[data-move-choice=oneOff]').click();
    cy.wait(1000);
    cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
    cy.resolveOpponent();
    cy.get('#waiting-for-opponent-discard-scrim').should('be.visible');
    cy.wait(1000);
    cy.discardOpponent(Card.ACE_OF_DIAMONDS, Card.JACK_OF_SPADES);
  });

  it('Playing Fives', () => {
    cy.loadGameFixture(0, {
      p0Hand: [
        Card.FIVE_OF_HEARTS,
        Card.SIX_OF_DIAMONDS,
        Card.QUEEN_OF_HEARTS,
      ],
      p0Points: [],
      p0FaceCards: [ Card.QUEEN_OF_CLUBS, Card.QUEEN_OF_DIAMONDS ],
      p1Hand: [ Card.ACE_OF_DIAMONDS, Card.EIGHT_OF_HEARTS, Card.JACK_OF_SPADES ],
      p1Points: [ Card.TEN_OF_SPADES ],
      p1FaceCards: [],
      topCard: Card.ACE_OF_CLUBS,
      secondCard: Card.TWO_OF_SPADES,
    });
    cy.wait(1500);

    // START RECORDING //
    cy.get('[data-player-hand-card=5-2]').click();
    cy.wait(1000);
    cy.get('[data-move-choice=oneOff]').click();
    cy.wait(1000);
    cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
    cy.resolveOpponent();
    cy.wait(1000);
    cy.get('[data-cy=five-discard-dialog]').should('be.visible');
    cy.get('[data-discard-card=12-2]').click();
    cy.wait(1000);
    cy.get('[data-cy=submit-five-dialog]').click();
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
      p0Points: [ Card.FIVE_OF_DIAMONDS, Card.TEN_OF_SPADES ],
      p0FaceCards: [ Card.EIGHT_OF_SPADES ],
      p1Hand: [ Card.ACE_OF_SPADES, Card.SIX_OF_SPADES, Card.JACK_OF_DIAMONDS, Card.JACK_OF_SPADES ],
      p1Points: [ Card.FOUR_OF_CLUBS ],
      p1FaceCards: [ Card.KING_OF_CLUBS, Card.EIGHT_OF_DIAMONDS ],
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

  it('Playing sevens', () => {
    cy.loadGameFixture(0, {
      p0Hand: [
        Card.SEVEN_OF_SPADES,
        Card.EIGHT_OF_CLUBS,
        Card.NINE_OF_HEARTS,
      ],
      p0Points: [ Card.NINE_OF_DIAMONDS ],
      p0FaceCards: [],
      p1Hand: [ Card.ACE_OF_DIAMONDS, Card.EIGHT_OF_HEARTS, Card.QUEEN_OF_CLUBS ],
      p1Points: [ Card.TEN_OF_HEARTS, Card.TEN_OF_SPADES ],
      p1FaceCards: [],
      topCard: Card.ACE_OF_CLUBS,
      secondCard: Card.JACK_OF_HEARTS,
    });
    cy.wait(1500);

    // START RECORDING //
    cy.get('[data-player-hand-card=7-3]').click();
    cy.wait(1000);
    cy.get('[data-move-choice=oneOff]').click();
    cy.wait(1000);
    cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
    cy.resolveOpponent();
    cy.wait(1000);
    cy.get('[data-second-card=11-2]').click();
    cy.wait(1000);
    cy.get('[data-move-choice=jack]').click();
    cy.wait(1000);
    cy.get('[data-opponent-point-card=10-3]').click();
  });

  it('Playing eights', () => {
    cy.loadGameFixture(0, {
      p0Hand: [
        Card.ACE_OF_CLUBS,
        Card.TWO_OF_DIAMONDS,
        Card.THREE_OF_SPADES,
        Card.FOUR_OF_CLUBS,
        Card.FOUR_OF_HEARTS,
        Card.EIGHT_OF_CLUBS,
        Card.NINE_OF_HEARTS,
      ],
      p0Points: [ Card.NINE_OF_CLUBS ],
      p0FaceCards: [],
      p1Hand: [ Card.TWO_OF_CLUBS, Card.TWO_OF_DIAMONDS,
        Card.TWO_OF_HEARTS, Card.QUEEN_OF_HEARTS, Card.QUEEN_OF_SPADES ],
      p1Points: [],
      p1FaceCards: [],
    });
    cy.wait(1500);

    // START RECORDING //
    cy.get('[data-player-hand-card=8-0]').click();
    cy.wait(1000);
    cy.get('[data-move-choice=faceCard]').click();
    cy.wait(1000);
  });

  it('Playing Nines', () => {
    cy.loadGameFixture(0, {
      p0Hand: [ Card.ACE_OF_SPADES, Card.NINE_OF_CLUBS, Card.TEN_OF_SPADES ],
      p0Points: [ Card.TEN_OF_HEARTS ],
      p0FaceCards: [],
      p1Hand: [ Card.FIVE_OF_HEARTS, Card.SIX_OF_SPADES, Card.JACK_OF_DIAMONDS ],
      p1Points: [ Card.TEN_OF_CLUBS ],
      p1FaceCards: [],
    });
    cy.get('[data-player-hand-card]').should('have.length', 3);
    cy.get('[data-player-hand-card=10-3]').click();
    cy.get('[data-move-choice=points]').click();
    cy.get('#turn-indicator').contains("OPPONENT'S TURN");
    cy.playJackOpponent(Card.JACK_OF_DIAMONDS, Card.TEN_OF_SPADES);
    cy.wait(2000);
    cy.get('#turn-indicator').contains('YOUR TURN');
    
    // START RECORDING HERE //
    cy.get('[data-player-hand-card=9-0]').click();
    cy.wait(1000);
    cy.get('[data-move-choice=targetedOneOff]').click();
    cy.wait(1000);
    cy.get('[data-opponent-face-card=11-1]').click();
    cy.wait(1000);
    cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
    cy.resolveOpponent();
  });
});
