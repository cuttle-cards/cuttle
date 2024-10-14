import { assertGameState, assertSnackbar, playOutOfTurn } from '../../support/helpers';
import { Card } from '../../fixtures/cards';
import { SnackBarError } from '../../fixtures/snackbarError';

describe('Game Basic Moves - P0 Perspective', () => {
  beforeEach(() => {
    cy.setupGameAsP0();
  });

  it('Plays Points', () => {
    // Set Up
    cy.loadGameFixture(0, {
      p0Hand: [ Card.ACE_OF_SPADES, Card.ACE_OF_CLUBS ],
      p0Points: [ Card.TEN_OF_SPADES ],
      p0FaceCards: [ Card.KING_OF_SPADES ],
      p1Hand: [ Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS ],
      p1Points: [ Card.TEN_OF_HEARTS ],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
    });

    // Play points (ace of spades)
    cy.get('[data-player-hand-card=1-3]').click(); // ace of spades
    cy.get('[data-move-choice=points]').click();
    cy.get('#turn-indicator').contains("OPPONENT'S TURN");

    // Attempt to play out of turn
    cy.get('[data-player-hand-card=1-0]').click(); // ace of clubs
    playOutOfTurn('points');

    assertGameState(0, {
      // ace of spades moved from p0Hand to p0Points
      p0Hand: [ Card.ACE_OF_CLUBS ],
      p0Points: [ Card.TEN_OF_SPADES, Card.ACE_OF_SPADES ],
      p0FaceCards: [ Card.KING_OF_SPADES ],
      p1Hand: [ Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS ],
      p1Points: [ Card.TEN_OF_HEARTS ],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
    });

    // Opponent plays the ace of diamonds
    cy.playPointsOpponent(Card.ACE_OF_DIAMONDS);

    assertGameState(0, {
      // ace of diamonds moved from p1Hand to p1Points
      p0Hand: [ Card.ACE_OF_CLUBS ],
      p0Points: [ Card.TEN_OF_SPADES, Card.ACE_OF_SPADES ],
      p0FaceCards: [ Card.KING_OF_SPADES ],
      p1Hand: [ Card.ACE_OF_HEARTS ],
      p1Points: [ Card.TEN_OF_HEARTS, Card.ACE_OF_DIAMONDS ],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
    });
  });

  it('Scuttles as P0', () => {
    // Set Up
    cy.loadGameFixture(0, {
      p0Hand: [ Card.ACE_OF_CLUBS, Card.ACE_OF_SPADES, Card.SEVEN_OF_CLUBS ],
      p0Points: [ Card.TWO_OF_CLUBS, Card.TEN_OF_HEARTS ],
      p0FaceCards: [ Card.KING_OF_SPADES ],
      p1Hand: [ Card.TEN_OF_CLUBS, Card.TEN_OF_SPADES ],
      p1Points: [ Card.SIX_OF_HEARTS, Card.ACE_OF_DIAMONDS ],
      p1FaceCards: [ Card.QUEEN_OF_HEARTS ],
    });

    // Player attempts illegal scuttle -- using card too small to target anything on field
    cy.get('[data-player-hand-card=1-0]').click();
    cy.get('[data-move-choice=scuttle]')
      .should('have.class', 'v-card--disabled')
      .should('contain', 'You can only scuttle smaller point cards')
      .click({ force: true });
    cy.get('#player-hand-targeting').should('be.visible');
    cy.get('[data-opponent-point-card=1-1]').click();
    assertSnackbar(SnackBarError.ILLEGAL_SCUTTLE);
    cy.log('Could not scuttle with point card too low to target anything');

    // Player attempts illegal scuttle -- using card big enough to target something else
    cy.get('[data-player-hand-card=1-3]').click(); // 7 of clubs
    cy.get('[data-move-choice=scuttle]').click();
    cy.get('[data-opponent-point-card=6-2]').click(); // 6 of hearts
    assertSnackbar(SnackBarError.ILLEGAL_SCUTTLE);
    cy.log('Could not scuttle invalid target with point card that had alternative valid target');

    // Player scuttles 6 of diamonds with 7 of clubs
    cy.get('[data-player-hand-card=7-0]').click(); // 7 of clubs
    cy.get('[data-move-choice=scuttle]').click();
    cy.get('[data-opponent-point-card=6-2]').click(); // 6 of hearts
    assertGameState(0, {
      p0Hand: [ Card.ACE_OF_CLUBS, Card.ACE_OF_SPADES ],
      p0Points: [ Card.TWO_OF_CLUBS, Card.TEN_OF_HEARTS ],
      p0FaceCards: [ Card.KING_OF_SPADES ],
      p1Hand: [ Card.TEN_OF_CLUBS, Card.TEN_OF_SPADES ],
      p1Points: [ Card.ACE_OF_DIAMONDS ],
      p1FaceCards: [ Card.QUEEN_OF_HEARTS ],
      scrap: [ Card.SEVEN_OF_CLUBS, Card.SIX_OF_HEARTS ],
    });
    cy.log('Successfully scuttled as p0');

    // Attempt to scuttle out of turn
    cy.get('[data-player-hand-card=1-3]').click(); // ace of spades
    cy.get('[data-move-choice=scuttle]')
      .should('have.class', 'v-card--disabled')
      .should('contain', "It's not your turn")
      .click({ force: true });
    cy.get('[data-opponent-point-card=1-1]').click(); // ace of diamonds
    // Test that Error snackbar says its not your turn
    assertSnackbar(SnackBarError.NOT_YOUR_TURN);
    cy.log('Could not scuttle out of turn');

    // Opponent scuttles 10 of hearts with 10 of spades
    cy.scuttleOpponent(Card.TEN_OF_SPADES, Card.TEN_OF_HEARTS);
    assertGameState(0, {
      p0Hand: [ Card.ACE_OF_CLUBS, Card.ACE_OF_SPADES ],
      p0Points: [ Card.TWO_OF_CLUBS ],
      p0FaceCards: [ Card.KING_OF_SPADES ],
      p1Hand: [ Card.TEN_OF_CLUBS ],
      p1Points: [ Card.ACE_OF_DIAMONDS ],
      p1FaceCards: [ Card.QUEEN_OF_HEARTS ],
      scrap: [ Card.SEVEN_OF_CLUBS, Card.SIX_OF_HEARTS, Card.TEN_OF_HEARTS, Card.TEN_OF_SPADES ],
    });
    cy.log('Opponent (p1) successfully scuttled');

    // Player scuttles opponent's last point card
    cy.get('[data-player-hand-card=1-3]').click();
    cy.get('[data-move-choice=scuttle]').click();
    cy.get('#player-hand-targeting').should('be.visible');
    cy.get('[data-opponent-point-card=1-1]').click();
    assertGameState(0, {
      p0Hand: [ Card.ACE_OF_CLUBS ],
      p0Points: [ Card.TWO_OF_CLUBS ],
      p0FaceCards: [ Card.KING_OF_SPADES ],
      p1Hand: [ Card.TEN_OF_CLUBS ],
      p1Points: [],
      p1FaceCards: [ Card.QUEEN_OF_HEARTS ],
      scrap: [
        Card.SEVEN_OF_CLUBS,
        Card.SIX_OF_HEARTS,
        Card.TEN_OF_HEARTS,
        Card.TEN_OF_SPADES,
        Card.ACE_OF_SPADES,
        Card.ACE_OF_DIAMONDS,
      ],
    });
    cy.log("Player (p0) scuttled opponent's last point card");

    cy.scuttleOpponent(Card.TEN_OF_CLUBS, Card.TWO_OF_CLUBS);
    assertGameState(0, {
      p0Hand: [ Card.ACE_OF_CLUBS ],
      p0Points: [],
      p0FaceCards: [ Card.KING_OF_SPADES ],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [ Card.QUEEN_OF_HEARTS ],
      scrap: [
        Card.SEVEN_OF_CLUBS,
        Card.SIX_OF_HEARTS,
        Card.TEN_OF_HEARTS,
        Card.TEN_OF_SPADES,
        Card.ACE_OF_SPADES,
        Card.ACE_OF_DIAMONDS,
        Card.TWO_OF_CLUBS,
        Card.TEN_OF_CLUBS,
      ],
    });

    // Now when player chooses a move, scuttle is disabled b/c there are no opponent points
    cy.get('[data-player-hand-card=1-0]').click();
    cy.get('[data-move-choice=scuttle]')
      .should('have.class', 'v-card--disabled')
      .should('contain', 'Your opponent has no point cards to scuttle');
    cy.log('Scuttling is disabled with specific message when opponent has no points');
  });

  it('Plays Kings', () => {
    // Setup
    cy.loadGameFixture(0, {
      p0Hand: [ Card.KING_OF_SPADES, Card.KING_OF_CLUBS ],
      p0Points: [ Card.TEN_OF_HEARTS ],
      p0FaceCards: [],
      p1Hand: [ Card.SIX_OF_HEARTS, Card.KING_OF_DIAMONDS ],
      p1Points: [ Card.ACE_OF_DIAMONDS ],
      p1FaceCards: [],
    });

    // Player plays king
    cy.get('[data-player-hand-card=13-0]').click(); // king of clubs
    cy.get('[data-move-choice=faceCard]').click();

    assertGameState(0, {
      p0Hand: [ Card.KING_OF_SPADES ],
      p0Points: [ Card.TEN_OF_HEARTS ],
      p0FaceCards: [ Card.KING_OF_CLUBS ],
      p1Hand: [ Card.SIX_OF_HEARTS, Card.KING_OF_DIAMONDS ],
      p1Points: [ Card.ACE_OF_DIAMONDS ],
      p1FaceCards: [],
      scrap: [],
    });

    // Attempt to play king out of turn
    cy.get('[data-player-hand-card=13-3]').click(); // king of clubs
    playOutOfTurn('faceCard');

    // Opponent plays king of diamonds
    cy.playFaceCardOpponent(Card.KING_OF_DIAMONDS);

    assertGameState(0, {
      p0Hand: [ Card.KING_OF_SPADES ],
      p0Points: [ Card.TEN_OF_HEARTS ],
      p0FaceCards: [ Card.KING_OF_CLUBS ],
      p1Hand: [ Card.SIX_OF_HEARTS ],
      p1Points: [ Card.ACE_OF_DIAMONDS ],
      p1FaceCards: [ Card.KING_OF_DIAMONDS ],
      scrap: [],
    });

    // Player plays another king
    cy.get('[data-player-hand-card=13-3]').click(); // king of spades
    cy.get('[data-move-choice=faceCard]').click();

    assertGameState(0, {
      p0Hand: [],
      p0Points: [ Card.TEN_OF_HEARTS ],
      p0FaceCards: [ Card.KING_OF_CLUBS, Card.KING_OF_SPADES ],
      p1Hand: [ Card.SIX_OF_HEARTS ],
      p1Points: [ Card.ACE_OF_DIAMONDS ],
      p1FaceCards: [ Card.KING_OF_DIAMONDS ],
      scrap: [],
    });
  });

  it('Plays Queens', () => {
    // Setup
    cy.loadGameFixture(0, {
      p0Hand: [ Card.QUEEN_OF_DIAMONDS, Card.QUEEN_OF_SPADES, Card.KING_OF_CLUBS, Card.JACK_OF_DIAMONDS ],
      p0Points: [ Card.TEN_OF_HEARTS ],
      p0FaceCards: [],
      p1Hand: [ Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS ],
      p1Points: [ Card.ACE_OF_DIAMONDS ],
      p1FaceCards: [],
    });

    // Player plays queen
    cy.get('[data-player-hand-card=12-3]').click(); // queen of clubs
    cy.get('[data-move-choice=faceCard]').click();

    assertGameState(0, {
      p0Hand: [ Card.KING_OF_CLUBS, Card.QUEEN_OF_DIAMONDS, Card.JACK_OF_DIAMONDS ],
      p0Points: [ Card.TEN_OF_HEARTS ],
      p0FaceCards: [ Card.QUEEN_OF_SPADES ],
      p1Hand: [ Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS ],
      p1Points: [ Card.ACE_OF_DIAMONDS ],
      p1FaceCards: [],
      scrap: [],
    });

    // Attempt to play queen out of turn
    cy.get('[data-player-hand-card=12-1]').click(); // queen of diamonds
    playOutOfTurn('faceCard');

    // Opponent plays queen of hearts
    cy.playFaceCardOpponent(Card.QUEEN_OF_HEARTS);
    assertGameState(0, {
      p0Hand: [ Card.QUEEN_OF_DIAMONDS, Card.KING_OF_CLUBS, Card.JACK_OF_DIAMONDS ],
      p0Points: [ Card.TEN_OF_HEARTS ],
      p0FaceCards: [ Card.QUEEN_OF_SPADES ],
      p1Hand: [ Card.SIX_OF_HEARTS ],
      p1Points: [ Card.ACE_OF_DIAMONDS ],
      p1FaceCards: [ Card.QUEEN_OF_HEARTS ],
      scrap: [],
    });

    // Player is now prevented from playing a jack
    cy.get('[data-player-hand-card=11-1]').click();
    cy.get('[data-move-choice=jack]')
      .should('have.class', 'v-card--disabled')
      .should('contain', "You cannot jack your opponent's points while they have a queen")
      .click({ force: true });
    cy.get('#player-hand-targeting').should('be.visible');
    cy.get('[data-opponent-point-card=1-1]').click();
    assertSnackbar('You cannot use a Jack while your opponent has a Queen');
    cy.log('Cannot play jack now that opponent has queen');
  });

  it('Cancels selection and cancels decision to scuttle/targeted one-off/jack on mobile', () => {
    cy.loadGameFixture(0, {
      p0Hand: [
        Card.TWO_OF_SPADES,
        Card.FOUR_OF_CLUBS,
        Card.NINE_OF_SPADES,
        Card.KING_OF_CLUBS,
        Card.JACK_OF_SPADES,
      ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [ Card.SIX_OF_CLUBS ],
      p1Points: [ Card.ACE_OF_SPADES ],
      p1FaceCards: [ Card.KING_OF_DIAMONDS ],
    });

    // Cancel decision to scuttle
    cy.get('[data-player-hand-card=2-3]').click(); // Two of spades
    cy.get('[data-move-choice=scuttle]').click();
    cy.get('#player-hand-targeting').should('be.visible');
    cy.get('.player-card.selected').should('have.length', 1);
    cy.get('[data-cy=cancel-target-mobile]').click();
    cy.get('#player-hand-targeting').should('not.exist');
    cy.get('.player-card.selected').should('have.length', 0);
    cy.log('Successfully canceled scuttle - mobile');

    // Cancel targeted one-off
    cy.get('[data-player-hand-card=9-3]').click(); // Nine of spades
    cy.get('[data-move-choice=targetedOneOff]').click();
    cy.get('#player-hand-targeting').should('be.visible');
    cy.get('.player-card.selected').should('have.length', 1);
    cy.get('[data-cy=cancel-target-mobile]').click();
    cy.get('#player-hand-targeting').should('not.exist');
    cy.get('.player-card.selected').should('have.length', 0);
    cy.log('Successfully canceled targeted one-off - mobile');

    // Cancel Jack
    cy.get('[data-player-hand-card=11-3]').click(); // Nine of spades
    cy.get('[data-move-choice=jack]').click();
    cy.get('#player-hand-targeting').should('be.visible');
    cy.get('.player-card.selected').should('have.length', 1);
    cy.get('[data-cy=cancel-target-mobile]').click();
    cy.get('#player-hand-targeting').should('not.exist');
    cy.get('.player-card.selected').should('have.length', 0);
    cy.log('Successfully canceled jack - mobile');
  });

  it('Cancels selection and cancels decision to scuttle/targeted one-off/jack', () => {
    cy.loadGameFixture(0, {
      p0Hand: [
        Card.TWO_OF_SPADES,
        Card.FOUR_OF_CLUBS,
        Card.NINE_OF_SPADES,
        Card.KING_OF_CLUBS,
        Card.JACK_OF_SPADES,
      ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [ Card.SIX_OF_CLUBS ],
      p1Points: [ Card.ACE_OF_SPADES ],
      p1FaceCards: [ Card.KING_OF_DIAMONDS ],
    });

    // Cancel selected card (close move-choice-overlay)
    cy.get('[data-player-hand-card=2-3]').click(); // Two of spades
    cy.get('#move-choice-overlay').should('be.visible');
    // Should have 3 move options
    cy.get('[data-move-choice]').should('have.length', 3);
    cy.get('[data-cy=cancel-move]').click();
    cy.get('#move-choice-overlay').should('not.exist');
    cy.log('Successfully canceled card selection');

    // Cancel decision to scuttle
    cy.get('[data-player-hand-card=2-3]').click(); // Two of spades
    cy.get('[data-move-choice=scuttle]').click();
    cy.get('#player-hand-targeting').should('be.visible');
    cy.get('.player-card.selected').should('have.length', 1);
    cy.get('[data-cy=cancel-target]').click();
    cy.get('#player-hand-targeting').should('not.exist');
    cy.get('.player-card.selected').should('have.length', 0);
    cy.log('Successfully canceled scuttle');

    // Cancel targeted one-off
    cy.get('[data-player-hand-card=9-3]').click(); // Nine of spades
    cy.get('[data-move-choice=targetedOneOff]').click();
    cy.get('#player-hand-targeting').should('be.visible');
    cy.get('.player-card.selected').should('have.length', 1);
    cy.get('[data-cy=cancel-target]').click();
    cy.get('#player-hand-targeting').should('not.exist');
    cy.get('.player-card.selected').should('have.length', 0);
    cy.log('Successfully canceled targeted one-off');

    // Cancel Jack
    cy.get('[data-player-hand-card=11-3]').click(); // Nine of spades
    cy.get('[data-move-choice=jack]').click();
    cy.get('#player-hand-targeting').should('be.visible');
    cy.get('.player-card.selected').should('have.length', 1);
    cy.get('[data-cy=cancel-target]').click();
    cy.get('#player-hand-targeting').should('not.exist');
    cy.get('.player-card.selected').should('have.length', 0);
    cy.log('Successfully canceled jack');
  });
});

describe('Game Basic Moves - P1 Perspective', () => {
  beforeEach(() => {
    cy.setupGameAsP1();
  });

  it('Draws from deck', () => {
    // Opponent draws card
    cy.drawCardOpponent();
    // Opponent now has 6 cards in hand
    cy.get('[data-opponent-hand-card]').should('have.length', 6);
    // Player draws card
    cy.get('#deck').click();
    // Player now have 7 cards in hand
    cy.get('[data-player-hand-card]').should('have.length', 7);
    // Attempt to play out of turn
    cy.get('#deck').click();
    // Test that Error snackbar says its not your turn
    assertSnackbar(SnackBarError.NOT_YOUR_TURN);
    // Opponent draws 2nd time
    cy.drawCardOpponent();
    // Opponent now has 7 cards in hand
    cy.get('[data-opponent-hand-card]').should('have.length', 7);
    // Player draws 2nd time
    cy.get('#deck').click();
    // Player now has 8 cards in hand
    cy.get('[data-player-hand-card]').should('have.length', 8);
    // Opponent draws 3rd time (8 cards)
    cy.drawCardOpponent();
    // Opponent now has 8 cards in hand
    cy.get('[data-opponent-hand-card]').should('have.length', 8);
    // Player attempts to draw with full hand
    cy.get('#deck').click();
    // Test that Error snackbar for hand limit
    assertSnackbar('You are at the hand limit; you cannot draw.');
    // Player still has 8 cards in hand
    cy.get('[data-player-hand-card]').should('have.length', 8);
    // Opponent still has 8 cards in hand
    cy.get('[data-opponent-hand-card]').should('have.length', 8);
  });

  it('draws last card from deck, and displays snackbar', () => {
    cy.loadGameFixture(1, {
      p0Hand: [ Card.QUEEN_OF_CLUBS ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [ Card.SIX_OF_HEARTS ],
      p1Points: [],
      p1FaceCards: [],
      topCard: Card.FIVE_OF_CLUBS,
      secondCard: Card.ACE_OF_CLUBS,
      deck: [],
    });

    cy.drawCardOpponent();
    cy.get('#deck').click();
    assertSnackbar('Deck exhausted; revealing player hands', 'surface-1');

    assertGameState(1, {
      p0Hand: [ Card.QUEEN_OF_CLUBS, Card.FIVE_OF_CLUBS ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [ Card.SIX_OF_HEARTS, Card.ACE_OF_CLUBS ],
      p1Points: [],
      p1FaceCards: [],
      topCard: null,
      secondCard: null,
      deck: [],
    });
  });

  it('Opponent draws last card from deck, and displays snackbar for player', () => {
    cy.loadGameFixture(1, {
      p0Hand: [ Card.QUEEN_OF_CLUBS ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [ Card.SIX_OF_HEARTS ],
      p1Points: [],
      p1FaceCards: [],
      topCard: Card.FIVE_OF_CLUBS,
      secondCard: Card.ACE_OF_CLUBS,
      deck: [ Card.TWO_OF_DIAMONDS ],
    });

    cy.drawCardOpponent();
    cy.get('#deck').click();
    cy.drawCardOpponent();
    assertSnackbar('Deck exhausted; revealing player hands', 'surface-1');

    assertGameState(1, {
      p0Hand: [ Card.QUEEN_OF_CLUBS, Card.FIVE_OF_CLUBS, Card.TWO_OF_DIAMONDS ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [ Card.SIX_OF_HEARTS, Card.ACE_OF_CLUBS ],
      p1Points: [],
      p1FaceCards: [],
      topCard: null,
      secondCard: null,
      deck: [],
    });
  });
});

describe('Playing 8s', () => {
  beforeEach(() => {
    cy.setupGameAsP0();
  });

  it('Plays eights for points', () => {
    // Setup
    cy.loadGameFixture(0, {
      p0Hand: [ Card.EIGHT_OF_SPADES, Card.EIGHT_OF_HEARTS, Card.KING_OF_CLUBS, Card.QUEEN_OF_DIAMONDS ],
      p0Points: [ Card.TEN_OF_HEARTS ],
      p0FaceCards: [],
      p1Hand: [ Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS ],
      p1Points: [ Card.ACE_OF_DIAMONDS ],
      p1FaceCards: [],
    });

    // Player plays eight
    cy.get('[data-player-hand-card=8-3]').click(); // eight of spades
    cy.get('[data-move-choice=points]').click();

    assertGameState(0, {
      p0Hand: [ Card.EIGHT_OF_HEARTS, Card.KING_OF_CLUBS, Card.QUEEN_OF_DIAMONDS ],
      p0Points: [ Card.TEN_OF_HEARTS, Card.EIGHT_OF_SPADES ],
      p0FaceCards: [],
      p1Hand: [ Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS ],
      p1Points: [ Card.ACE_OF_DIAMONDS ],
      p1FaceCards: [],
    });

    // Attempt to play eight out of turn for points
    cy.get('[data-player-hand-card=8-2]').click();
    playOutOfTurn('points');
  }); // End play 8 for points

  it('Plays eights for glasses', () => {
    // Setup
    cy.loadGameFixture(0, {
      p0Hand: [ Card.EIGHT_OF_SPADES, Card.EIGHT_OF_HEARTS, Card.KING_OF_CLUBS, Card.QUEEN_OF_DIAMONDS ],
      p0Points: [ Card.TEN_OF_HEARTS ],
      p0FaceCards: [],
      p1Hand: [ Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS, Card.EIGHT_OF_CLUBS ],
      p1Points: [ Card.ACE_OF_DIAMONDS ],
      p1FaceCards: [],
    });

    // Player plays eight
    cy.get('[data-player-hand-card=8-3]').click(); // eight of spades
    cy.get('[data-move-choice=faceCard]').click();

    assertGameState(0, {
      p0Hand: [ Card.EIGHT_OF_HEARTS, Card.KING_OF_CLUBS, Card.QUEEN_OF_DIAMONDS ],
      p0Points: [ Card.TEN_OF_HEARTS ],
      p0FaceCards: [ Card.EIGHT_OF_SPADES ],
      p1Hand: [ Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS, Card.EIGHT_OF_CLUBS ],
      p1Points: [ Card.ACE_OF_DIAMONDS ],
      p1FaceCards: [],
    });

    // Attempt to play glasses eight out of turn
    cy.get('[data-player-hand-card=8-2]').click(); // eight of hearts
    playOutOfTurn('faceCard');

    // Opponent plays glasses eight
    cy.playFaceCardOpponent(Card.EIGHT_OF_CLUBS);
    assertGameState(0, {
      p0Hand: [ Card.EIGHT_OF_HEARTS, Card.KING_OF_CLUBS, Card.QUEEN_OF_DIAMONDS ],
      p0Points: [ Card.TEN_OF_HEARTS ],
      p0FaceCards: [ Card.EIGHT_OF_SPADES ],
      p1Hand: [ Card.SIX_OF_HEARTS, Card.QUEEN_OF_HEARTS ],
      p1Points: [ Card.ACE_OF_DIAMONDS ],
      p1FaceCards: [ Card.EIGHT_OF_CLUBS ],
    });
  }); // End play glasses 8
}); // End eights describe

describe('Play Jacks', () => {
  beforeEach(() => {
    cy.setupGameAsP0();
  });

  it('Player and Opponent plays Jacks on different cards', () => {
    // Set Up
    cy.loadGameFixture(0, {
      p0Hand: [ Card.ACE_OF_SPADES, Card.JACK_OF_CLUBS, Card.KING_OF_SPADES ],
      p0Points: [ Card.TEN_OF_SPADES ],
      p0FaceCards: [],
      p1Hand: [ Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS, Card.JACK_OF_DIAMONDS ],
      p1Points: [ Card.TEN_OF_HEARTS ],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
    });

    // Play jack of clubs on ten of hearts
    cy.get('[data-player-hand-card=11-0]').click();
    cy.get('[data-move-choice=jack]').click();
    cy.get('[data-opponent-point-card=10-2]').click();

    assertGameState(0, {
      p0Hand: [ Card.ACE_OF_SPADES, Card.KING_OF_SPADES ],
      p0Points: [ Card.TEN_OF_SPADES, Card.TEN_OF_HEARTS ],
      p0FaceCards: [],
      p1Hand: [ Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS, Card.JACK_OF_DIAMONDS ],
      p1Points: [],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
      scrap: [],
    });

    cy.get('[data-player-hand-card]').should('have.length', 2);
    cy.get('#turn-indicator').contains("OPPONENT'S TURN");

    // Opponent plays jack
    cy.playJackOpponent(Card.JACK_OF_DIAMONDS, Card.TEN_OF_SPADES);

    assertGameState(0, {
      p0Hand: [ Card.ACE_OF_SPADES, Card.KING_OF_SPADES ],
      p0Points: [ Card.TEN_OF_HEARTS ],
      p0FaceCards: [],
      p1Hand: [ Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS ],
      p1Points: [ Card.TEN_OF_SPADES ],
      p1FaceCards: [ Card.KING_OF_HEARTS ],
      scrap: [],
    });
  });

  it('Quadruple jacks successfully', () => {
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
    // Attempt to play king out of turn
    cy.get('#turn-indicator').contains("OPPONENT'S TURN");

    // Opponent plays 2nd jack
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
});
