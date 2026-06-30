# E2E Game Fixtures Pattern

## What

`cy.loadGameFixture()` and `assertGameState()` control and verify game state in Cypress e2e tests. They take fixture objects with per-player hand/points/face-cards plus optional `topCard`, `secondCard`, `deck`, and `scrap`. Two non-obvious rules govern how those interact with the live game.

## Rule 1 — Specifying `deck` puts every other card in scrap

Backend logic at `api/controllers/game/load-fixture-gamestate.js:27-37`:

```javascript
const allFixtureCards = new Set(Object.values(req.body).flat().map(({ id }) => id));
const unusedCards = _.shuffle(DeckIds.filter((id) => !allFixtureCards.has(id)).map(convertStrToCard));
const populatedDeck = deck ?? unusedCards;
const populatedScrap = deck ? [ ...scrap, ...unusedCards ] : scrap;
```

- If `deck` is omitted: unused cards become the deck (shuffled, non-deterministic order).
- If `deck` is provided: deck is exactly those cards (with `topCard`/`secondCard` prepended), and every card not listed in any fixture field is appended to scrap.

A short `deck` like `deck: [ Card.QUEEN_OF_CLUBS ]` means ~40 unrelated cards land in scrap.

## Rule 2 — When the deck empties, opponent hands reveal

Helper at `tests/e2e/support/helpers.js:369, 381-407`:

```javascript
const deckShouldBeEmpty = fixture.deck?.length === 0;
const handShouldBeRevealed =
  checkingCurrentPlayer || playerShouldHaveGlasses || deckShouldBeEmpty || isSpectating;
if (handShouldBeRevealed) {
  // assert opponent hand contents match exactly
} else {
  // assert opponent hand length matches AND every card is hidden
}
```

If the test draws the deck to zero, the game reveals opponent hands. The fixture passed to `assertGameState` must include `deck: []` so the assertion takes the reveal branch — otherwise it expects `allHidden` and fails because the cards are now visible.

## Rule 3 — `scrap` assertion is a subset check

`tests/e2e/support/helpers.js:427-436`:

```javascript
if (fixture.scrap) {
  expect(fixture.scrap.every((card) => game.scrap.some((sc) => cardsMatch(card, sc)))).to.eq(true, ...);
}
```

Every fixture.scrap card must appear in actual scrap; actual scrap may have additional cards. Convention is still to list every expected scrap card so the test reads as documentation.

## When to use this pattern

Whenever you write or modify a test that:
- Specifies a short `deck:` to control the draw sequence, OR
- Plays a one-off (Five, Seven) that draws multiple cards near deck end, OR
- Asserts on `scrap` content

## Canonical example

`tests/e2e/specs/in-game/handLimit.spec.js:199-302` ("Five resolves to 9 cards triggering discard of 1"):

```javascript
cy.loadGameFixture(0, {
  p0Hand: [ Card.FIVE_OF_CLUBS, Card.ACE_OF_CLUBS, Card.TWO_OF_CLUBS, /* ... */ ],
  p0Points: [],
  p0FaceCards: [],
  p1Hand: [ Card.ACE_OF_SPADES ],
  p1Points: [],
  p1FaceCards: [],
  topCard: Card.NINE_OF_CLUBS,
  secondCard: Card.TEN_OF_CLUBS,
  deck: [ Card.JACK_OF_CLUBS ],   // short deck → ~40 cards into scrap
});

// ... test body draws the deck to zero ...

assertGameState(0, {
  p0Hand: [ /* expected hand */ ],
  p0Points: [],
  p0FaceCards: [],
  p1Hand: [ Card.ACE_OF_SPADES ],
  p1Points: [],
  p1FaceCards: [],
  deck: [],                        // signal deck-exhausted (reveals opponent hand)
  scrap: [
    Card.FIVE_OF_CLUBS,            // played during test
    Card.ACE_OF_CLUBS,             // discarded by five effect
    Card.TWO_OF_CLUBS,             // hand-limit discard
    // Cards put into scrap by loadGameFixture
    Card.QUEEN_OF_CLUBS,
    Card.KING_OF_CLUBS,
    Card.ACE_OF_DIAMONDS,
    /* ...all 38 unused cards in suit order: clubs → diamonds → hearts → spades... */
  ],
});
```

The `// Cards put into scrap by loadGameFixture` comment is the standard separator between test-runtime scraps and fixture-time scraps.

## Anti-patterns

- **Specifying a short `deck` and forgetting `deck: []` in `assertGameState`.** The most common failure mode — assertion takes the "hidden" branch, then fails on `allHidden` because the game already revealed the opponent's hand.
- **Specifying a short `deck` and not listing the loadGameFixture-induced scrap cards.** The subset check may still pass, but the test no longer documents true expected state and breaks the parallel between this test and its peers.
- **Calling `loadGameFixture` with no `deck:` when you need a deterministic draw sequence.** Unused cards are shuffled — draw order is non-deterministic.
- **Listing scrap cards out of order.** The conventional order is: (1) cards scrapped during the test in the order they were scrapped, then (2) `// Cards put into scrap by loadGameFixture` comment, then (3) unused cards in clubs → diamonds → hearts → spades order.

## Related

- `docs/patterns/e2e-spec-structure.md`
- `docs/patterns/e2e-one-off-resolution.md` — for tests that draw via Five/Seven
- JSDoc on `cy.loadGameFixture` — `tests/e2e/support/commands.js:777`
- JSDoc on `assertGameState` — `tests/e2e/support/helpers.js`
