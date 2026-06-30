# E2E One-Off Resolution Pattern

## What

One-off cards (A, 2, 3, 4, 5, 6, 7, 9) go onto a resolution stack when played. The opposing player has the option to counter with a Two; only after a counter chain settles does the one-off take effect. Cypress tests need to drive both the play and the resolution explicitly.

## When to use

Any test that plays a one-off card. The exact flow depends on three axes:
1. Targeted (2, 3, 9) vs untargeted (A, 4, 5, 6, 7)
2. Player-played vs opponent-played
3. Counterable vs the player has no Two to counter

## Untargeted one-offs played by the player — use the helper

`cy.playOneOffAndResolveAsPlayer(card)` from `tests/e2e/support/commands.js:744-769` bundles: click the card → choose `oneOff` → wait for counter scrim → opponent does not counter → scrim disappears.

```javascript
cy.playOneOffAndResolveAsPlayer(Card.ACE_OF_CLUBS);
// One-off has fully resolved; effect applied
```

### Five-specific extra step

If the one-off is a Five, the five-discard dialog opens AFTER the helper returns:

```javascript
cy.playOneOffAndResolveAsPlayer(Card.FIVE_OF_CLUBS);
cy.get('[data-cy=five-discard-dialog]').should('be.visible');
cy.get('[data-discard-card=1-0]').click(); // pick a card to discard
cy.get('[data-cy=submit-five-dialog]').click();
```

(From `tests/e2e/specs/in-game/handLimit.spec.js:222-225`.)

## Targeted one-offs (2, 3, 9)

No bundled helper. Click the card → choose `oneOff` → choose the target → opponent decides whether to counter.

### Opponent-played targeted one-off, player cannot counter

```javascript
// Opponent plays Nine targeting player's point card
cy.playTargetedOneOffOpponent(Card.NINE_OF_SPADES, Card.TEN_OF_CLUBS, 'point');
cy.get('#cannot-counter-dialog').should('be.visible')
  .get('[data-cy=cannot-counter-resolve]')
  .click();
```

(From `tests/e2e/specs/in-game/handLimit.spec.js:394-397`.)

`targetType` is one of `'faceCard' | 'point' | 'jack'`.

## Counter chains

If either side counters with a Two, the counter is itself a one-off that can be re-countered. Sequence:

1. P plays one-off → `cy.get('#waiting-for-opponent-counter-scrim').should('be.visible')`
2. Opponent counters → `cy.counterOpponent(Card.TWO_OF_X)` — now the player can re-counter from the DOM
3. Either side declines (`cy.resolveOpponent()` or the player's resolve button) → chain settles
4. Bottom of the stack resolves; opposing effects of any countered cards apply or don't, per rules

## Sevens

A Seven reveals the top card of the deck; the playing side then plays that card. For opponent moves following an opponent's Seven, use the `*FromSevenOpponent` family in `tests/e2e/support/commands.js:515-663`. See `docs/patterns/e2e-opponent-actions.md`.

## Canonical examples

- **Untargeted, no counter**: `tests/e2e/specs/in-game/one-offs/1_aces.spec.js:26` — `cy.playOneOffAndResolveAsPlayer(Card.ACE_OF_CLUBS)`
- **Untargeted Five with discard step**: `tests/e2e/specs/in-game/handLimit.spec.js:222-225`
- **Opponent-played targeted Nine, player cannot counter**: `tests/e2e/specs/in-game/handLimit.spec.js:394-397`

## Anti-patterns

- **Forgetting `cy.resolveOpponent()` (or the wrapper) when the player plays an un-countered one-off.** Without it, the one-off sits on the stack and the next assertion sees stale state.
- **Using `cy.playOneOffAndResolveAsPlayer` for a targeted one-off.** It only clicks the card and chooses `oneOff` — no target selection. Drive targeted one-offs manually with the card click + `[data-opponent-point-card=...]` / `[data-opponent-face-card=...]` selection.
- **Asserting game state while a scrim or dialog is still visible.** Wait for `#waiting-for-opponent-counter-scrim` / `#cannot-counter-dialog` to disappear first.
- **Forgetting that a Five draws 3 cards.** When the deck is short, Five can exhaust it — see `docs/patterns/e2e-game-fixtures.md` for the `deck: []` rule that comes into play.

## Related

- `docs/patterns/e2e-opponent-actions.md`
- `docs/patterns/e2e-game-fixtures.md` — for tests that exhaust the deck via Five/Seven draws
- `docs/patterns/e2e-card-selectors.md` — selector reference
