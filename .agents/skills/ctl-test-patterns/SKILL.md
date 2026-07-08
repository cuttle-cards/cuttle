---
name: ctl-test-patterns
description: "Testing patterns for Cuttle — Cypress E2E and Vitest unit tests. Use on 'write a test', 'add a Cypress spec', 'write a unit test', 'how do I set up a game in tests', 'loadGameFixture', 'assertGameState', 'cy.setupGameAsP0', or any testing question."
model: inherit
allowed-tools: Read, Grep, Glob, Bash
---

# Test Patterns

Quick reference for Cuttle's test infrastructure. Full details in `.agents/docs/testing.md`.

## Before writing tests

```bash
# Find similar E2E specs
ls tests/e2e/specs/in-game/
find tests/e2e/specs -name "*.spec.js" | head -20

# Find similar unit tests
find tests/unit/specs -name "*.spec.js" | head -10

# Read the test helpers
cat tests/e2e/support/helpers.js
grep -n "Cypress.Commands.add" tests/e2e/support/commands.js | head -20
```

## Cypress E2E — file location

```
tests/e2e/specs/in-game/        # in-game moves and interactions
tests/e2e/specs/out-of-game/    # lobby, stats, profile, rankings
tests/e2e/specs/playground/     # development/debug
```

## Cypress E2E — basic structure

```js
describe('Feature name', () => {
  beforeEach(() => {
    cy.setupGameAsP0();  // or cy.setupGameAsP1()
  });

  it('does something', () => {
    cy.loadGameFixture(0, {
      p0Hand: [Card.SEVEN_OF_CLUBS],
      p0Points: [Card.TWO_OF_CLUBS],
      p1Points: [Card.SIX_OF_HEARTS],
    });

    cy.get('[data-player-hand-card=7_0]').click();
    cy.get('[data-move-choice=untargetedOneOff]').click();

    assertGameState(0, {
      p0Hand: [],
      p0Points: [Card.TWO_OF_CLUBS],
      p1Points: [Card.SIX_OF_HEARTS],
      scrap: [Card.SEVEN_OF_CLUBS],
    });
  });
});
```

## `cy.setupGameAsP0()` / `cy.setupGameAsP1()`

Run in `beforeEach`. Automatically:
1. Signs up two accounts
2. Creates and joins a game
3. Readies both players and waits for load

## `cy.loadGameFixture(pNum, fixture)`

Sets the game into a specific state. `pNum` is `0` or `1`.

```js
cy.loadGameFixture(0, {
  p0Hand: [Card.ACE_OF_CLUBS, Card.SEVEN_OF_CLUBS],
  p0Points: [Card.TWO_OF_CLUBS, Card.TEN_OF_HEARTS],
  p0FaceCards: [Card.KING_OF_SPADES],
  p1Hand: [Card.TEN_OF_CLUBS],
  p1Points: [Card.SIX_OF_HEARTS],
  p1FaceCards: [Card.QUEEN_OF_HEARTS],
  topCard: Card.FIVE_OF_DIAMONDS,
  secondCard: Card.EIGHT_OF_SPADES,
  scrap: [Card.TWO_OF_HEARTS],
});
```

All fields are optional.

## `assertGameState(pNum, fixture)`

Asserts full game state from a player's perspective. Same shape as `loadGameFixture`.

```js
assertGameState(0, {
  p0Points: [Card.TWO_OF_CLUBS, Card.SEVEN_OF_CLUBS],
  p1Points: [],
  scrap: [Card.SIX_OF_HEARTS],
});
```

## Card data selectors

Format: `data-<player>-<location>-card=<rank>_<suit>`

```js
'[data-player-hand-card=7_0]'        // 7 of Clubs in player's hand
'[data-opponent-point-card=6_2]'     // opponent's 6 of Hearts on field
'[data-player-face-card=13_3]'       // player's King of Spades on field
'[data-move-choice=scuttle]'         // scuttle move option button
```

## Move selectors

`[data-move-choice=<slug>]` where slug matches the API endpoint:

`points` · `scuttle` · `faceCard` · `untargetedOneOff` · `targetedOneOff` · `jack` · `counter` · `resolve` · `draw`

## Making opponent moves

```js
cy.drawCardOpponent();
cy.playPointsOpponent(Card.TEN_OF_CLUBS);
cy.playFaceCardOpponent(Card.QUEEN_OF_HEARTS);
cy.playOneOffOpponent(Card.ACE_OF_CLUBS);
```

## Vitest unit tests — client

File: `tests/unit/specs/*.spec.js`

Config: `vitest.config.mjs` (root) — `include: ['tests/unit/**/*.spec.{js,ts}']`

```js
import { beforeEach, describe, it, expect, vi } from 'vitest';

describe('module name', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('does something', () => {
    expect(result).toBe(expected);
  });
});
```

## Vitest unit tests — Sails

File: `tests/unit/specs/sails/*.spec.js`

Config: `tests/unit/vitest-sails.config.mjs` — sequential, uses Sails setup file.

Run with: `npm run test:unit:sails`

## Agents tests

File: `.agents/tools/__tests__/*.spec.mjs`

Config: `.agents/tools/vitest.config.mjs`

Run with: `npm run test:agents`

These test pure Node.js logic (no Sails, no Vue). Use ESM imports.

## TDD workflow (from CONTRIBUTING.md)

1. Write or update the test first.
2. Run `npm run start:server` in background.
3. Run `npm run e2e:client` (or `e2e:gui` for interactive).
4. Implement until tests pass.
5. Run `npm run lint` and `npm run test:unit`.

## Full reference

`.agents/docs/testing.md`
