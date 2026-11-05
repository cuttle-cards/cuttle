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
});
