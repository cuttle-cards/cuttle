# E2E Opponent Actions Pattern

## What

In a two-player Cypress test, "the player" acts through DOM interactions (`cy.get('[data-...]').click()`) while "the opponent" acts through socket-level custom commands (`cy.<x>Opponent()`). The opponent has no rendered DOM in the test viewport — those commands send the move directly to the Sails backend.

## When to use

Any time the opponent needs to make a move: draw, play points, scuttle, play a one-off, counter, resolve, discard, concede, or stalemate. All helpers live in `tests/e2e/support/commands.js`.

## Mental model

- **Player = you** clicking the UI.
- **Opponent = server** being prodded via the right RPC.

Most opponent commands are thin wrappers around `cy.makeSocketRequest('game', '<endpoint>', { moveType, cardId, ... })`.

## Commands by category

### Basic moves — `tests/e2e/support/commands.js:300-402`
- `cy.drawCardOpponent()` — opponent draws
- `cy.playPointsOpponent(card)` — play for points
- `cy.playFaceCardOpponent(card)` — play King/Queen
- `cy.playJackOpponent(card, target)` — steal a point card with a jack
- `cy.scuttleOpponent(card, target)` — scuttle a point card

### One-offs — `tests/e2e/support/commands.js:404-470`
- `cy.playOneOffOpponent(card)` — untargeted one-off (A, 5, 6)
- `cy.playTargetedOneOffOpponent(card, target, targetType)` — 2, 3, 9. `targetType` ∈ `'faceCard' | 'point' | 'jack'`
- `cy.counterOpponent(card)` — counter player's one-off with a Two
- `cy.resolveOpponent()` — opponent declines to counter (resolves stack)
- `cy.resolveFiveOpponent(card?)` — opponent's five discard
- `cy.resolveThreeOpponent(card)` — opponent picks from scrap (Three effect)

### Discards (Four / hand-limit) — `tests/e2e/support/commands.js:478-513`
- `cy.discardToHandLimitOpponent(...cards)` — opponent discards to hand limit
- `cy.discardOpponent(card1, card2?)` — opponent resolves a Four by discarding 1-2 cards

### Seven-chained moves — `tests/e2e/support/commands.js:515-663`
When the opponent plays a Seven, the top card of the deck is revealed and they play with it. Use the `*FromSeven` variants for whatever they do next:
- `cy.playPointsFromSevenOpponent(card)`
- `cy.playFaceCardFromSevenOpponent(card)`
- `cy.scuttleFromSevenOpponent(card, target)`
- `cy.playJackFromSevenOpponent(card, target)`
- `cy.playOneOffFromSevenOpponent(card)`
- `cy.playTargetedOneOffFromSevenOpponent(card, target, targetType)`
- `cy.sevenDiscardOpponent(card)` — opponent discards the revealed card

### Endgame — `tests/e2e/support/commands.js:665-688`
- `cy.passOpponent()`, `cy.concedeOpponent()`, `cy.stalemateOpponent()`, `cy.acceptStalemateOpponent()`, `cy.rejectStalemateOpponent()`

### Spectator variants — `tests/e2e/support/commands.js:320, 337`
- `cy.playPointsSpectator(card)`, `cy.playOneOffSpectator(card)` — for specs in `tests/e2e/specs/spectating/`

## Canonical example

`tests/e2e/specs/in-game/basicMoves.spec.js:22-42`:

```javascript
// Player acts via DOM
cy.get('[data-player-hand-card=1-3]').click(); // ace of spades
cy.get('[data-move-choice=points]').click();

// Assert intermediate state
assertGameState(0, { /* ... */ });

// Opponent acts via custom command
cy.playPointsOpponent(Card.ACE_OF_DIAMONDS);

assertGameState(0, { /* ... */ });
```

## Anti-patterns

- **Trying to click opponent cards to drive the opponent.** The opponent's hand is hidden; the cards have no DOM. Use the matching `cy.<x>Opponent()` command.
- **Forgetting `cy.resolveOpponent()` after the player plays a one-off.** The opponent must explicitly decline to counter for the one-off to resolve. The wrapper `cy.playOneOffAndResolveAsPlayer(card)` (`commands.js:744`) bundles play + decline-to-counter for the common case.
- **Mixing seven-chained and regular variants.** After an opponent's Seven is played and resolved, their NEXT move uses a `*FromSevenOpponent` command, not the regular one. The deck-revealed card is on a different code path.
- **Asserting state immediately after a socket command without waiting for a DOM signal.** Some opponent moves trigger UI changes the player perceives; assert on those signals (scrim disappearing, turn indicator changing) before reading store state.

## Related

- `docs/patterns/e2e-one-off-resolution.md` — counter / resolution flow detail
- `docs/patterns/e2e-card-selectors.md` — the player's side
