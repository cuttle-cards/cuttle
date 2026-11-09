import { myUser, playerOne, playerTwo } from '../../../fixtures/userFixtures';
import { createAndPlayGameWithOneOffs } from './replayHelpers';

// Longer than the 3s ceiling on the delay between auto-advances, so a timer that should have been cleared would fire
const PAST_MAX_DELAY_MS = 3500;
// A full playback takes the real gap between each move, clamped to 0.5-3s
const FULL_PLAYBACK_TIMEOUT_MS = 40000;

describe('Auto-advancing playback of finished games', () => {
  beforeEach(() => {
    cy.wipeDatabase();
    cy.visit('/');
    cy.signupOpponent(playerOne);
    cy.signupOpponent(playerTwo);
    createAndPlayGameWithOneOffs();
    cy.visit('/');
    cy.signupPlayer(myUser);
    cy.get('@replayGameId').then((gameId) => {
      cy.visit(`/spectate/${gameId}`);
    });
    cy.url().should('include', '?gameStateIndex=0');
  });

  it('Shows only the play button while paused, and only the pause button while playing', () => {
    cy.get('[data-cy=play]').should('be.visible')
      .and('not.be.disabled');
    cy.get('[data-cy=pause]').should('not.exist');

    cy.get('[data-cy=play]').click();
    cy.get('[data-cy=pause]').should('be.visible');
    cy.get('[data-cy=play]').should('not.exist');

    cy.get('[data-cy=pause]').click();
    cy.get('[data-cy=play]').should('be.visible');
    cy.get('[data-cy=pause]').should('not.exist');
  });

  it('Advances automatically through every state, then pauses with play disabled at the end', () => {
    cy.get('[data-cy=play]').click();

    cy.url({ timeout: FULL_PLAYBACK_TIMEOUT_MS }).should('match', /gameStateIndex=[1-9]/);

    // Reaching the final state ends playback: play comes back, disabled, alongside the forward buttons
    cy.get('[data-cy=play]', { timeout: FULL_PLAYBACK_TIMEOUT_MS }).should('be.disabled');
    cy.get('[data-cy=pause]').should('not.exist');
    cy.get('[data-cy=step-forward]').should('be.disabled');
    cy.get('[data-cy=skip-forward]').should('be.disabled');
  });

  it('Stops advancing when paused', () => {
    cy.get('[data-cy=play]').click();
    cy.get('[data-cy=pause]').click();
    cy.get('[data-cy=play]').should('be.visible');

    cy.location('search').then((pausedSearch) => {
      cy.wait(PAST_MAX_DELAY_MS);
      cy.location('search').should('eq', pausedSearch);
    });
  });

  it('Resumes advancing from where it was paused', () => {
    cy.get('[data-cy=step-forward]').click();
    cy.url().should('include', '?gameStateIndex=1');

    cy.get('[data-cy=play]').click();
    cy.url({ timeout: FULL_PLAYBACK_TIMEOUT_MS }).should('match', /gameStateIndex=[2-9]/);
  });

  it('Pauses when navigating backward during playback', () => {
    cy.get('[data-cy=play]').click();
    cy.url({ timeout: FULL_PLAYBACK_TIMEOUT_MS }).should('match', /gameStateIndex=[2-9]/);

    cy.get('[data-cy=step-backward]').click();
    // Enabled, which it only is when paused mid-game; playback running out the clock leaves it disabled
    cy.get('[data-cy=play]').should('be.visible')
      .and('not.be.disabled');
    cy.get('[data-cy=pause]').should('not.exist');

    cy.location('search').then((pausedSearch) => {
      cy.wait(PAST_MAX_DELAY_MS);
      cy.location('search').should('eq', pausedSearch);
    });
  });

  it('Pauses when skipping back to the start during playback', () => {
    cy.get('[data-cy=play]').click();
    cy.url({ timeout: FULL_PLAYBACK_TIMEOUT_MS }).should('match', /gameStateIndex=[1-9]/);

    cy.get('[data-cy=skip-backward]').click();
    cy.url().should('include', '?gameStateIndex=0');
    cy.get('[data-cy=play]').should('be.visible')
      .and('not.be.disabled');
    cy.get('[data-cy=pause]').should('not.exist');

    cy.location('search').then((pausedSearch) => {
      cy.wait(PAST_MAX_DELAY_MS);
      cy.location('search').should('eq', pausedSearch);
    });
  });

  it('Keeps playing when navigating forward during playback', () => {
    cy.get('[data-cy=play]').click();
    cy.get('[data-cy=step-forward]').click();

    cy.get('[data-cy=pause]').should('be.visible');
    // Playback keeps going past the state that was jumped to
    cy.url({ timeout: FULL_PLAYBACK_TIMEOUT_MS }).should('match', /gameStateIndex=[2-9]/);
  });

  it('Waits for a state that is still loading before starting the advance timer', () => {
    const SLOW_LOAD_MS = 2000;
    // Shorter than the load, longer than the 500ms floor on the delay between auto-advances
    const WAIT_DURING_LOAD_MS = 1200;

    // Stands in for a state whose animation is still running when play is pressed
    cy.window().then((win) => {
      const { gameStore } = win.cuttle;
      const requestGameState = gameStore.requestGameState.bind(gameStore);
      gameStore.requestGameState = async (...args) => {
        const res = await requestGameState(...args);
        await new Promise((resolve) => setTimeout(resolve, SLOW_LOAD_MS));
        return res;
      };
    });

    cy.get('[data-cy=step-forward]').click();
    cy.url().should('include', '?gameStateIndex=1');
    cy.get('[data-cy=play]').click();

    cy.wait(WAIT_DURING_LOAD_MS);
    cy.url().should('include', '?gameStateIndex=1');

    // Once the slow state lands, playback carries on from it
    cy.url({ timeout: FULL_PLAYBACK_TIMEOUT_MS }).should('match', /gameStateIndex=[2-9]/);
  });

  describe('Layout', () => {
    it('Labels the game selector in full on wide screens', () => {
      cy.get('[data-cy=match-game-selector]').should('contain.text', 'Game 1');
    });

    // The bar holds the username, game selector, and five buttons; at these widths it only fits if the
    // buttons shrink and the selector abbreviates its label
    [ 375, 390 ].forEach((width) => {
      it(`Fits every playback button on screen at ${width}px wide`, () => {
        cy.viewport(width, 800);
        cy.get('[data-cy=match-game-selector]').should('contain.text', 'G1')
          .and('not.contain.text', 'Game 1');

        cy.get('[data-cy=skip-forward]').then(($button) => {
          const { right } = $button[0].getBoundingClientRect();
          expect(right).to.be.at.most($button[0].ownerDocument.documentElement.clientWidth);
        });
      });
    });

    it('Still lists games by their full name in the dropdown on phones', () => {
      cy.viewport(375, 800);
      cy.get('[data-cy=match-game-selector]').click();
      cy.get('[role=listbox]').should('contain.text', 'Game 1')
        .and('contain.text', 'Game 2');
    });
  });

  /*
    Vuetify assigns overlay z-indexes from a running stack, so a z-index declared on any overlay
    re-seeds that stack and every overlay opened on top of it inherits the raised base. The game
    selector used to declare one to clear the bar it belongs to, which put dialogs opened while it
    was up above the controls (#1479). It is attached to the bar instead, so nothing raises the
    stack and the controls stay on top of it for every ordering.
  */
  describe('Stacking against overlays', () => {
    const elementAtCenterOf = (selector) =>
      cy.get(selector).then(($el) => {
        const { left, top, width, height } = $el[0].getBoundingClientRect();
        return $el[0].ownerDocument.elementFromPoint(left + width / 2, top + height / 2);
      });

    it('Renders the game selector dropdown inside the playback bar', () => {
      cy.get('[data-cy=match-game-selector]').click();
      cy.get('[role=listbox]').should('be.visible')
        .closest('#playback-controls')
        .should('exist');
    });

    it('Keeps every overlay below the playback controls while the dropdown is open', () => {
      cy.get('[data-cy=match-game-selector]').click();
      cy.get('[role=listbox]').should('be.visible');

      // Whatever seeds the stack propagates to every overlay opened afterwards, so an overlay at
      // or above the bar now means a dialog opened later lands on top of the controls
      cy.get('#playback-controls').then(($bar) => {
        const { defaultView } = $bar[0].ownerDocument;
        const barZIndex = Number(defaultView.getComputedStyle($bar[0]).zIndex);
        expect(barZIndex, 'playback controls z-index').to.be.greaterThan(0);

        const raised = [ ...defaultView.document.querySelectorAll('.v-overlay') ]
          .map((overlay) => Number(defaultView.getComputedStyle(overlay).zIndex))
          .filter((zIndex) => zIndex >= barZIndex);

        expect(raised, 'overlays stacked at or above the playback controls').to.be.empty;
      });
    });

    it('Keeps the playback buttons on top while the dropdown is open', () => {
      cy.get('[data-cy=match-game-selector]').click();
      cy.get('[role=listbox]').should('be.visible');

      elementAtCenterOf('[data-cy=skip-forward]').should((topmost) => {
        expect(topmost.closest('[data-cy=skip-forward]'), 'topmost element over skip-forward').to.not.be.null;
      });
    });
  });
});
