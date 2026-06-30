# E2E Spec Structure Pattern

## What

In-game Cypress specs follow a consistent nesting: outer `describe()` names the feature, inner `describe()` names the player perspective (P0 or P1), `it()` names a specific scenario. Every `it()` is set-up → act → assert, often with intermediate `assertGameState` calls between phases.

## When to use

Creating a new `*.spec.js` file under `tests/e2e/specs/in-game/`. Out-of-game specs (auth, lobby, stats) have their own conventions.

## Folder placement

- `tests/e2e/specs/in-game/` — gameplay specs (`basicMoves.spec.js`, `handLimit.spec.js`, `reconnecting.spec.js`, ...)
  - `tests/e2e/specs/in-game/one-offs/` — one file per rank (`1_aces.spec.js`, `2_twos-destroy-target-royal.spec.js`, `3_threes.spec.js`, ...)
  - `tests/e2e/specs/in-game/game-over/` — endgame
- `tests/e2e/specs/out-of-game/` — auth, lobby, stats, settings
- `tests/e2e/specs/spectating/` — spectator flows
- `tests/e2e/specs/playground/` — experimental, not run in CI

## Canonical example

`tests/e2e/specs/in-game/handLimit.spec.js`:

```javascript
import { assertGameState } from '../../support/helpers';
import { Card } from '../../fixtures/cards';

describe('Hand Limit — Discard to Hand Limit Phase', () => {
  describe('Drawing and Hand Limit', () => {
    describe('P0 perspective', () => {
      beforeEach(() => {
        cy.setupGameAsP0();
      });

      it('Player draws 9th card and discards one to reach hand limit', () => {
        // Set-up
        cy.loadGameFixture(0, { /* ... */ });

        // Act — DOM clicks for the player
        cy.get('#deck').click();
        cy.get('[data-discard-hand-limit-card=1-0]').click();
        cy.get('[data-cy=submit-discard-to-hand-limit-dialog]').click();

        // Assert — full game state
        assertGameState(0, { /* ... */ });
      });
    });

    describe('P1 perspective', () => {
      beforeEach(() => { cy.setupGameAsP1(); });

      it('Opponent draws 9th card and must discard — player sees waiting overlay', () => {
        // mirrors P0 case but drives P0 via cy.drawCardOpponent() / cy.discardToHandLimitOpponent()
      });
    });
  });
});
```

## Key conventions

- **`beforeEach` only sets up the game.** Use `cy.setupGameAsP0()` / `cy.setupGameAsP1()` / `cy.setupGameAsSpectator()` from `tests/e2e/support/commands.js:128-218`. Do NOT load fixtures here.
- **Each `it()` loads its own fixture.** Tests should read top-to-bottom in isolation.
- **One perspective per inner `describe`.** If the behavior matters from both sides, write a P0 case and a P1 case (e.g. `handLimit.spec.js` has both for discard, demonstrating the player view and the waiting-overlay view).
- **Inline `assertGameState` between actions** when a test has multiple meaningful state changes — pinpoints failures.
- **`one-offs/` files are numbered by rank** (`1_aces`, `2_twos-destroy-target-royal`, `3_threes`, ...). Keep the prefix when adding new files.
- **`it.only` is local-debugging only — never commit.** (We caught one in `handLimit.spec.js:304` recently.)

## Anti-patterns

- **Loading fixtures in `beforeEach`.** Tests become unreadable; the fixture is far from the `it()` it describes.
- **Mixing P0 and P1 perspectives in a single `it()`.** Split, or drive one side via the DOM and the other via `cy.<x>Opponent()`.
- **Skipping the inner perspective `describe`** when both sides matter. Future maintainers expect to find both.
- **Committing `it.only` / `describe.only`.** Run lint locally if you're unsure — and check the diff before pushing.

## Related

- `docs/patterns/e2e-game-fixtures.md`
- `docs/patterns/e2e-opponent-actions.md`
- `docs/CONTRIBUTING.md:86-125` — human-facing "How To TDD Using Cypress" section
