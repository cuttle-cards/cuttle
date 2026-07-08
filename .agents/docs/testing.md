# Testing

Cuttle uses two test frameworks:

- **Cypress** for end-to-end (E2E) tests in `tests/e2e/`
- **Vitest** for unit tests in `tests/unit/`

## Vitest — dual config

| Script | Config | Scope |
|--------|--------|-------|
| `npm run test:unit:client` | `vitest.config.mjs` | `tests/unit/**/*.spec.{js,ts}` (excludes sails) |
| `npm run test:unit:sails` | `tests/unit/vitest-sails.config.mjs` | `tests/unit/specs/sails/**/*` |
| `npm run test:unit` | runs both above | full unit suite |
| `npm run test:agents` | `.agents/tools/vitest.config.mjs` | `.agents/tools/__tests__/**/*.spec.mjs` |

Sails tests require a running Sails instance (setup in `tests/unit/setup-sails.vitest.js`). They run sequentially (`maxWorkers: 1, isolate: false`).

Client tests use `environment: 'node'` and can run in parallel.

## Cypress — E2E helpers

Helpers are in `tests/e2e/support/helpers.js` and `commands.js`.

### `cy.setupGameAsP0()` / `cy.setupGameAsP1()`

Runs in `beforeEach`. Automatically:
1. Signs up two accounts.
2. Creates and joins a game as both players.
3. Readies both players and waits for the game to load.

### `cy.loadGameFixture(fixture)`

Loads a specific game state. All fields are optional.

```js
cy.loadGameFixture({
  p0Hand: [Card.ACE_OF_CLUBS, Card.SEVEN_OF_CLUBS],
  p0Points: [Card.TWO_OF_CLUBS],
  p0FaceCards: [Card.KING_OF_SPADES],
  p1Hand: [Card.TEN_OF_CLUBS],
  p1Points: [Card.SIX_OF_HEARTS],
  p1FaceCards: [Card.QUEEN_OF_HEARTS],
  topCard: Card.FIVE_OF_DIAMONDS,
  secondCard: Card.EIGHT_OF_SPADES,
  scrap: [Card.TWO_OF_HEARTS],
});
```

### `assertGameState(playerNum, fixture)`

Asserts the full game state from a player's perspective. `playerNum` is `0` or `1`.

```js
assertGameState(0, {
  p0Hand: [Card.ACE_OF_CLUBS],
  p0Points: [Card.TWO_OF_CLUBS, Card.SEVEN_OF_CLUBS],
  ...
});
```

## Card data selectors

Format: `data-<player>-<location>-card=<rank>_<suit>`

- `<player>`: `player` (the current player) or `opponent`
- `<location>`: `hand`, `point`, `face-card`
- `<rank>`: integer 1–13
- `<suit>`: integer 0–3 (Clubs=0, Diamonds=1, Hearts=2, Spades=3)

```js
cy.get('[data-player-hand-card=7_0]').click();       // 7 of Clubs in hand
cy.get('[data-move-choice=scuttle]').click();        // choose scuttle
cy.get('[data-opponent-point-card=6_2]').click();    // opponent's 6 of Hearts
```

## Move data selectors

Format: `data-move-choice=<move-name>`

Move names match the API slug: `points`, `scuttle`, `untargetedOneOff`, `targetedOneOff`, `jack`, `faceCard`, `draw`.

## Test structure

E2E specs are in `tests/e2e/specs/`:

- `in-game/` — in-game moves and interactions
- `out-of-game/` — lobby, stats, profile
- `playground/` — development/debug specs

Unit specs are in `tests/unit/specs/`:

- `*.spec.js` — client-side (Vue, Pinia, utilities)
- `sails/` — server-side Sails.js logic
