import { playerOne, playerTwo } from '../../../fixtures/userFixtures';
import { assertGameState, assertSnackbar } from '../../../support/helpers';
import { SnackBarError } from '../../../fixtures/snackbarError';
import { Card } from '../../../fixtures/cards';

// Longer than the 3s ceiling on the delay between auto-advances, so a timer that should never have
// been scheduled would have fired by the time it elapses
const PAST_MAX_DELAY_MS = 3500;

// Two states exist before either player moves: the deal, and the fixture loaded over it
const FIXTURE_STATE_INDEX = 1;

const STARTING_FIXTURE = {
  p0Hand: [ Card.ACE_OF_SPADES, Card.TWO_OF_SPADES ],
  p0Points: [],
  p0FaceCards: [],
  p1Hand: [ Card.ACE_OF_HEARTS, Card.TWO_OF_HEARTS ],
  p1Points: [],
  p1FaceCards: [],
};

const AFTER_P0_ACE = {
  ...STARTING_FIXTURE,
  p0Hand: [ Card.TWO_OF_SPADES ],
  p0Points: [ Card.ACE_OF_SPADES ],
};

const AFTER_P1_ACE = {
  ...AFTER_P0_ACE,
  p1Hand: [ Card.TWO_OF_HEARTS ],
  p1Points: [ Card.ACE_OF_HEARTS ],
};

// p1 is one ace short of the 21 points that win the game
const WINNING_FIXTURE = {
  p0Hand: [ Card.ACE_OF_SPADES, Card.TWO_OF_SPADES ],
  p0Points: [],
  p0FaceCards: [],
  p1Hand: [ Card.ACE_OF_HEARTS ],
  p1Points: [ Card.TEN_OF_HEARTS, Card.TEN_OF_DIAMONDS ],
  p1FaceCards: [],
};

const AFTER_P0_ACE_WHILE_LOSING = {
  ...WINNING_FIXTURE,
  p0Hand: [ Card.TWO_OF_SPADES ],
  p0Points: [ Card.ACE_OF_SPADES ],
};

// A scuttle animates for a second before it writes the board, which is the window a navigation
// has to survive
const SCUTTLE_FIXTURE = {
  p0Hand: [ Card.ACE_OF_SPADES ],
  p0Points: [ Card.TWO_OF_SPADES ],
  p0FaceCards: [],
  p1Hand: [ Card.TEN_OF_HEARTS ],
  p1Points: [],
  p1FaceCards: [],
};

function spectateLiveGame(fixture = STARTING_FIXTURE) {
  cy.setupGameAsSpectator();
  cy.loadGameFixture(0, fixture);
  assertGameState(0, fixture, true);
  // Spectators join a live game following its latest state
  cy.url().should('include', 'gameStateIndex=-1');
}

function opponentPlaysPoints(user, card) {
  cy.recoverSessionOpponent(user);
  cy.playPointsSpectator(card);
}

describe('Playback controls while spectating a live game', () => {
  it('Shows the playback controls, following live, on a game that is still being played', () => {
    spectateLiveGame();

    cy.get('[data-cy=playback-controls]').should('be.visible');
    cy.get('[data-cy=live-indicator]').should('be.visible');
    // Following live is play mode, so pause is the action on offer
    cy.get('[data-cy=pause]').should('be.visible');
    cy.get('[data-cy=play]').should('not.exist');
    // The bar takes over the username, so the inline one in the hand is not also rendered
    cy.get('#player-username-container').should('have.length', 1);
    cy.get('[data-cy=playback-controls] #player-username-container').should('exist');
    // Live games are never sent matchGames, so there is nothing to select between
    cy.get('[data-cy=match-game-selector]').should('not.exist');
  });

  it('Moves back and forth between the states of a live game', () => {
    spectateLiveGame();
    opponentPlaysPoints(playerOne, Card.ACE_OF_SPADES);
    assertGameState(0, AFTER_P0_ACE, true);
    opponentPlaysPoints(playerTwo, Card.ACE_OF_HEARTS);
    assertGameState(0, AFTER_P1_ACE, true);

    cy.get('[data-cy=step-backward]').click();
    assertGameState(0, AFTER_P0_ACE, true);

    cy.get('[data-cy=step-backward]').click();
    assertGameState(0, STARTING_FIXTURE, true);
    cy.url().should('include', `gameStateIndex=${FIXTURE_STATE_INDEX}`);

    cy.get('[data-cy=step-forward]').click();
    assertGameState(0, AFTER_P0_ACE, true);

    cy.get('[data-cy=skip-backward]').click();
    cy.url().should('include', 'gameStateIndex=0');

    cy.get('[data-cy=skip-forward]').click();
    assertGameState(0, AFTER_P1_ACE, true);
  });

  it('Renders incoming moves while following live', () => {
    spectateLiveGame();

    opponentPlaysPoints(playerOne, Card.ACE_OF_SPADES);

    cy.get('[data-cy=live-indicator]').should('be.visible');
    cy.url().should('include', 'gameStateIndex=-1');
    assertGameState(0, AFTER_P0_ACE, true);
  });

  it('Leaves the board alone while paused, and counts the moves piling up', () => {
    spectateLiveGame();
    opponentPlaysPoints(playerOne, Card.ACE_OF_SPADES);
    assertGameState(0, AFTER_P0_ACE, true);

    // Stepping back pauses
    cy.get('[data-cy=step-backward]').click();
    assertGameState(0, STARTING_FIXTURE, true);
    cy.get('[data-cy=live-indicator]').should('not.exist');
    cy.get('[data-cy=states-behind-badge]').should('have.text', '1');

    opponentPlaysPoints(playerTwo, Card.ACE_OF_HEARTS);

    // The badge moving is proof the event landed; the board did not move with it
    cy.get('[data-cy=states-behind-badge]').should('have.text', '2');
    assertGameState(0, STARTING_FIXTURE, true);

    // And no timer quietly carries the paused spectator forward
    cy.location('search').then((pausedSearch) => {
      cy.wait(PAST_MAX_DELAY_MS);
      cy.location('search').should('eq', pausedSearch);
      assertGameState(0, STARTING_FIXTURE, true);
    });
  });

  it('Catches up with everything that happened when the spectator goes live', () => {
    spectateLiveGame();
    cy.get('[data-cy=step-backward]').click();
    // Assert after each move: the count passes through every value on its way up, so checking only
    // once at the end would pass whenever cypress happened to sample it mid-flight
    opponentPlaysPoints(playerOne, Card.ACE_OF_SPADES);
    cy.get('[data-cy=states-behind-badge]').should('have.text', '2');
    opponentPlaysPoints(playerTwo, Card.ACE_OF_HEARTS);
    cy.get('[data-cy=states-behind-badge]').should('have.text', '3');

    cy.get('[data-cy=skip-forward]').click();

    cy.url().should('include', 'gameStateIndex=-1');
    cy.get('[data-cy=live-indicator]').should('be.visible');
    cy.get('[data-cy=pause]').should('be.visible');
    assertGameState(0, AFTER_P1_ACE, true);
  });

  it('Pins the url to the state on screen when pausing at the live edge, and unpins it on play', () => {
    spectateLiveGame();
    opponentPlaysPoints(playerOne, Card.ACE_OF_SPADES);
    assertGameState(0, AFTER_P0_ACE, true);

    cy.get('[data-cy=pause]').click();

    // -1 means "keep up with the latest", so pausing there has to name the state actually on screen
    cy.url().should('not.include', 'gameStateIndex=-1')
      .and('include', 'gameStateIndex=2');
    cy.get('[data-cy=live-indicator]').should('not.exist');
    cy.get('[data-cy=play]').should('be.visible')
      .and('not.be.disabled');
    assertGameState(0, AFTER_P0_ACE, true);

    // Pausing at the edge must not strand the spectator: a move lands and they can still see it coming
    opponentPlaysPoints(playerTwo, Card.ACE_OF_HEARTS);
    cy.get('[data-cy=states-behind-badge]').should('have.text', '1');
    assertGameState(0, AFTER_P0_ACE, true);

    cy.get('[data-cy=play]').click();

    cy.url().should('include', 'gameStateIndex=-1');
    cy.get('[data-cy=live-indicator]').should('be.visible');
    assertGameState(0, AFTER_P1_ACE, true);
  });

  it('Goes live when stepping forward onto the latest state', () => {
    spectateLiveGame();
    opponentPlaysPoints(playerOne, Card.ACE_OF_SPADES);
    cy.get('[data-cy=step-backward]').click();
    cy.get('[data-cy=play]').should('be.visible');

    cy.get('[data-cy=step-forward]').click();

    cy.url().should('include', 'gameStateIndex=-1');
    cy.get('[data-cy=live-indicator]').should('be.visible');
    cy.get('[data-cy=pause]').should('be.visible');
    assertGameState(0, AFTER_P0_ACE, true);
  });

  it('Keeps the play button usable at the live edge, where there is no next state to walk to', () => {
    spectateLiveGame();
    cy.get('[data-cy=pause]').click();

    cy.get('[data-cy=step-forward]').should('be.disabled');
    cy.get('[data-cy=play]').should('not.be.disabled');
    cy.get('[data-cy=skip-forward]').should('not.be.disabled');
  });

  it('Holds a paused spectator in place when the game ends, and shows the result once they catch up', () => {
    spectateLiveGame(WINNING_FIXTURE);
    opponentPlaysPoints(playerOne, Card.ACE_OF_SPADES);
    assertGameState(0, AFTER_P0_ACE_WHILE_LOSING, true);

    cy.get('[data-cy=step-backward]').click();
    assertGameState(0, WINNING_FIXTURE, true);

    // p1 reaches 21 and wins while the spectator is deliberately behind
    opponentPlaysPoints(playerTwo, Card.ACE_OF_HEARTS);

    cy.get('[data-cy=step-forward]').should('not.be.disabled');
    cy.wait(PAST_MAX_DELAY_MS);
    cy.get('#game-over-dialog').should('not.exist');
    assertGameState(0, WINNING_FIXTURE, true);

    // Reaching the final state is what reveals the result
    cy.get('[data-cy=skip-forward]').click();
    cy.get('#game-over-dialog').should('be.visible');
    cy.get('[data-cy=p2-wins-heading]').should('contain', 'P2 Wins');
  });

  it('Does not drag a paused spectator into a rematch', () => {
    spectateLiveGame(WINNING_FIXTURE);
    opponentPlaysPoints(playerOne, Card.ACE_OF_SPADES);
    assertGameState(0, AFTER_P0_ACE_WHILE_LOSING, true);
    cy.get('[data-cy=step-backward]').click();
    assertGameState(0, WINNING_FIXTURE, true);

    opponentPlaysPoints(playerTwo, Card.ACE_OF_HEARTS);

    cy.get('@gameId').then((gameId) => {
      cy.recoverSessionOpponent(playerOne);
      cy.rematchOpponent({ gameId, rematch: true, skipDomAssertion: true });
      cy.recoverSessionOpponent(playerTwo);
      cy.rematchOpponent({ gameId, rematch: true, skipDomAssertion: true });

      cy.wait(PAST_MAX_DELAY_MS);
      cy.url().should('include', `/spectate/${gameId}`)
        .and('include', `gameStateIndex=${FIXTURE_STATE_INDEX}`);
      assertGameState(0, WINNING_FIXTURE, true);
      cy.get('#game-over-dialog').should('not.exist');
    });
  });

  it('Rejoins the live edge when browser history lands back on it', () => {
    spectateLiveGame();
    opponentPlaysPoints(playerOne, Card.ACE_OF_SPADES);
    assertGameState(0, AFTER_P0_ACE, true);

    // Pins the url and pauses, leaving the -1 it came from in browser history
    cy.get('[data-cy=step-backward]').click();
    cy.get('[data-cy=live-indicator]').should('not.exist');

    cy.go('back');

    // A -1 url nothing keeps up with would strand the spectator, so arriving there follows live again
    cy.url().should('include', 'gameStateIndex=-1');
    cy.get('[data-cy=live-indicator]').should('be.visible');
    assertGameState(0, AFTER_P0_ACE, true);

    opponentPlaysPoints(playerTwo, Card.ACE_OF_HEARTS);
    assertGameState(0, AFTER_P1_ACE, true);
  });

  it('Keeps the state a spectator navigates to, even mid-animation', () => {
    spectateLiveGame(SCUTTLE_FIXTURE);
    opponentPlaysPoints(playerOne, Card.ACE_OF_SPADES);
    cy.get('[data-cy=live-indicator]').should('be.visible');

    // Widen the window a real scuttle animation opens between the event arriving and its board write
    const SLOW_ANIMATION_MS = 2000;
    cy.window().then((win) => {
      const { gameStore } = win.cuttle;
      const processScuttle = gameStore.processScuttle.bind(gameStore);
      gameStore.processScuttle = async (...args) => {
        await new Promise((resolve) => setTimeout(resolve, SLOW_ANIMATION_MS));
        return processScuttle(...args);
      };
    });

    cy.recoverSessionOpponent(playerTwo);
    cy.scuttleOpponent(Card.TEN_OF_HEARTS, Card.TWO_OF_SPADES);
    // Step back while the scuttle is still animating; its board write must not land on top of this
    cy.get('[data-cy=step-backward]').click();

    cy.wait(SLOW_ANIMATION_MS + PAST_MAX_DELAY_MS);
    cy.url().should('include', `gameStateIndex=${FIXTURE_STATE_INDEX}`);
    assertGameState(0, SCUTTLE_FIXTURE, true);
  });

  it('Keeps a snackbar clear of the bar, which is fixed over the bottom of the screen', () => {
    spectateLiveGame();

    // Spectators get an error for any move they try to make; the bar must not swallow it
    cy.get('#deck').click();
    assertSnackbar(SnackBarError.NOT_IN_GAME);

    cy.get('[data-cy=global-snackbar] .v-snackbar__wrapper').then(([ snackbar ]) => {
      cy.get('[data-cy=playback-controls]').then(([ bar ]) => {
        expect(snackbar.getBoundingClientRect().bottom).to.be.at.most(bar.getBoundingClientRect().top);
      });
    });
  });

  describe('Layout', () => {
    // The live bar trades the game selector for the live indicator, and hangs a badge off the last
    // button, so it needs checking at the widths the finished-game bar only just fits
    [ 375, 390 ].forEach((width) => {
      it(`Fits the live indicator and the whole button row on screen at ${width}px wide`, () => {
        cy.viewport(width, 800);
        spectateLiveGame();

        // The indicator only exists while following live, so it is measured before pausing
        cy.get('[data-cy=live-indicator]').should('be.visible')
          .then(([ indicator ]) => {
            cy.get('[data-cy=skip-backward]').then(([ firstButton ]) => {
              const { left, right } = indicator.getBoundingClientRect();
              expect(left).to.be.at.least(0);
              expect(right).to.be.at.most(firstButton.getBoundingClientRect().left);
            });
          });

        // And the badge only exists once paused behind the live edge, which stepping back does
        cy.get('[data-cy=step-backward]').click();
        cy.get('[data-cy=live-indicator]').should('not.exist');
        cy.get('[data-cy=states-behind-badge] .v-badge__badge').should('be.visible');

        [ '[data-cy=skip-forward]', '[data-cy=states-behind-badge] .v-badge__badge' ].forEach((selector) => {
          cy.get(selector).then(([ element ]) => {
            const { right } = element.getBoundingClientRect();
            expect(right).to.be.at.most(element.ownerDocument.documentElement.clientWidth);
          });
        });
      });
    });
  });
});
