# E2E Card Selectors Pattern

## What

Cards and game-action elements expose `data-*` attributes for Cypress selection. Cards use a numeric `rank-suit` format; moves and dialogs use semantic kebab-case names.

## When to use

Any time a test needs to click a card, button, dialog, or zone for a player action. Opponent actions go through `cy.<x>Opponent()` commands instead — see `docs/patterns/e2e-opponent-actions.md`.

## Card identity encoding

- **Rank**: 1 (Ace) through 13 (King). Jack=11, Queen=12, King=13.
- **Suit**: 0=Clubs, 1=Diamonds, 2=Hearts, 3=Spades.
- **Format**: `rank-suit` joined by a single dash. ACE_OF_CLUBS → `1-0`. SEVEN_OF_HEARTS → `7-2`. JACK_OF_SPADES → `11-3`.

Template binding (e.g. in player-hand components):
```html
:data-player-hand-card="`${card.rank}-${card.suit}`"
```

> The Cypress section of `docs/CONTRIBUTING.md` shows older underscore examples (`data-player-hand-card=7_0`). The current code uses dashes — trust the dash format.

## Common selectors

### Cards (use `rank-suit`)
| Selector | Where it lives |
|---|---|
| `[data-player-hand-card=<r>-<s>]` | Your hand |
| `[data-opponent-hand-card]` | Opponent hand (usually hidden) |
| `[data-player-point-card=<r>-<s>]` | Your point zone |
| `[data-opponent-point-card=<r>-<s>]` | Opponent point zone |
| `[data-player-face-card=<r>-<s>]` | Your face-card zone |
| `[data-opponent-face-card=<r>-<s>]` | Opponent face-card zone |
| `[data-discard-card=<r>-<s>]` | Five-effect discard dialog |
| `[data-discard-hand-limit-card=<r>-<s>]` | Hand-limit / four / draw-9 discard dialog |

### Move choices (post-card-click chooser)
| Selector | Purpose |
|---|---|
| `[data-move-choice=points]` | Play for points |
| `[data-move-choice=scuttle]` | Scuttle |
| `[data-move-choice=jack]` | Play jack |
| `[data-move-choice=oneOff]` | Play as one-off |
| `[data-move-choice=faceCard]` | Play face card |

### Dialogs, scrims, indicators
| Selector | Purpose |
|---|---|
| `#deck` | Click to draw |
| `#turn-indicator` | Contains `OPPONENT'S TURN` / `YOUR TURN` text |
| `#discard-to-hand-limit-dialog` | Hand-limit dialog wrapper |
| `[data-cy=submit-discard-to-hand-limit-dialog]` | Confirm hand-limit discard |
| `[data-cy=five-discard-dialog]` | Five discard dialog wrapper |
| `[data-cy=submit-five-dialog]` | Confirm five discard |
| `#cannot-counter-dialog` | Player cannot counter a targeted one-off |
| `[data-cy=cannot-counter-resolve]` | Acknowledge un-counterable one-off |
| `#waiting-for-opponent-counter-scrim` | Waiting while opponent decides to counter |
| `#waiting-for-opponent-discard-scrim` | Waiting while opponent picks discard |

## Canonical example

`tests/e2e/specs/in-game/basicMoves.spec.js:23-25` (play points):
```javascript
cy.get('[data-player-hand-card=1-3]').click(); // ace of spades
cy.get('[data-move-choice=points]').click();
cy.get('#turn-indicator').contains('OPPONENT\'S TURN');
```

`tests/e2e/specs/in-game/one-offs/1_aces.spec.js:58-60` (play jack on opponent's point):
```javascript
cy.get('[data-player-hand-card=11-0]').click(); // jack of clubs
cy.get('[data-move-choice=jack]').click();
cy.get('[data-opponent-point-card=2-1]').click(); // two of diamonds
```

## Anti-patterns

- **Underscore-formatted card selectors (`7_0`).** Stale convention. Use dashes.
- **Hard-coding suit names in selectors.** Use `Card.X_OF_Y.rank` / `.suit` from `tests/e2e/fixtures/cards.js` if you're building selectors dynamically — they're already numeric.
- **Clicking opponent zones to drive opponent moves.** The opponent's hand and most state are hidden; use `cy.<x>Opponent()` instead.
- **Waiting on `cy.get('[data-...]').should('not.exist')` without a preceding assertion that the dialog WAS visible.** Add the positive assertion first so a regression that skips the dialog entirely still fails the test.

## Related

- `docs/patterns/e2e-opponent-actions.md`
- `tests/e2e/fixtures/cards.js` — `Card.*` constants with `rank`, `suit`, `id`
