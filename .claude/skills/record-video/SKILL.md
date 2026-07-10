---
name: record-video
description: >-
  Generate and record gameplay video footage for Cuttle. Use when the user
  describes an in-game situation and a sequence of moves and wants a video clip
  of it — e.g. "record a video of…", "make a clip showing…", "generate footage
  of…", "film a scenario where…". Optionally organizes the clip under a named
  topic/category (the tutorial video it's for). Translates the description into a
  Cypress test in tests/e2e/specs/playground/videoPlayground.spec.js, marks it
  .only(), clears every other .only(), runs Cypress headless with video, and
  saves a named .mp4 to tests/e2e/videos/.
---

# Record Cuttle gameplay video

This skill turns a plain-English scenario ("both players have glasses, player has two point
cards and a queen out, a two and a point card in hand; opponent plays an ace, player counters,
opponent resolves, player wins with points") into a recorded `.mp4` of that exact sequence.

Everything you need already exists in the repo: fixtures, custom Cypress commands, and timing
helpers. Your job is to translate the description into a test using the vocabulary below, then
run it. **Do not invent new Cypress commands or helpers** — reuse what is documented here.

## End-to-end procedure

1. **Parse the scenario** into a `loadGameFixture` object, and note any **topic** the user names
   (see *Scenario → Fixture*).
2. **Parse the move sequence** into ordered Cypress steps (see *Moves → Cypress steps*).
3. **Write the test** into `tests/e2e/specs/playground/videoPlayground.spec.js` — under the right
   topic/seat block — and give it `.only`, clearing every other `.only` in the file (see *Writing
   the test*).
4. **Run it** headless with video (see *Running*).
5. **Rename the video** to a scenario slug and report the path (see *Saving the video*).

Confirm the fixture and move list with the user in prose *before* running if the scenario is
ambiguous — a wrong fixture wastes a ~15s recording run.

---

## Scenario → Fixture

Set up state with `cy.loadGameFixture(pNum, fixture)` after the `beforeEach` game setup. The
human/"player" is **p0** by default; use **p1** only when the scenario reads better from the
second player's seat (or when you want the opponent to move first — as p1 the opponent is p0, who
goes first). The seat decides three things that must agree: the `loadGameFixture` `pNum`
(`0`/`1`), which setup runs in the enclosing `beforeEach` (`cy.setupGameAsP0()` /
`cy.setupGameAsP1()`), and where the test is placed — see *Writing the test*.

Cards come from `import { Card } from '../../fixtures/cards';` — names are `Card.RANK_OF_SUIT`,
e.g. `Card.EIGHT_OF_SPADES`, `Card.TWO_OF_HEARTS`.

**Rank ↔ number** (used in DOM selectors as `rank-suit`): Ace=1, 2–10 as themselves, Jack=11,
Queen=12, King=13. **Suit ↔ number**: Clubs=0, Diamonds=1, Hearts=2, Spades=3. So the Eight of
Spades is `8-3`; the Two of Hearts is `2-2`.

### Fixture keys

```js
cy.loadGameFixture(0, {
  p0Hand:      [ /* Card[] */ ],   // required
  p0Points:    [ /* Card[] */ ],   // required — point cards on p0's field
  p0FaceCards: [ /* Card[] */ ],   // required — royals + glasses eights on p0's field
  p1Hand:      [ /* Card[] */ ],   // required
  p1Points:    [ /* Card[] */ ],   // required
  p1FaceCards: [ /* Card[] */ ],   // required
  topCard:     Card.X,             // optional — face-up top of deck (7s draw from here)
  secondCard:  Card.Y,             // optional — second revealed deck card (used by 7 one-off)
  scrap:       [ /* Card[] */ ],   // optional — discard pile (3 one-off recovers from here)
  deck:        [ /* Card[] */ ],   // optional — remaining deck; deck:[] means "deck empty"
});
```

`loadGameFixture` asserts the player's hand renders with the expected length, so the six required
arrays must be exactly right for the seat you set up.

### ⚠️ Every card must be unique

The Sails backend runs `validateGamestate` and rejects any fixture that uses the **same card in
two places** with a 400 (`Duplicate Card 5H`), which fails the test before recording. Each of the
52 cards may appear **at most once** across all zones for both players (`p0Hand`, `p0Points`,
`p0FaceCards`, `p1Hand`, `p1Points`, `p1FaceCards`, `topCard`, `secondCard`, `scrap`, `deck`).
Double-check for duplicates before running. (The existing `Plays Points` test in the file has this
bug — don't copy it as a template.)

### Vocabulary glossary (from docs/game-rules.md)

| Phrase in the description | Where it goes in the fixture |
| --- | --- |
| "has glasses" / "glasses out" | an **Eight** in that player's `*FaceCards` (renders `.glasses`, reveals the opponent's hand) |
| "queen out" / "has a queen" | a **Queen** in `*FaceCards` (protects other cards from targeting) |
| "king out" / "N kings" | a **King** in `*FaceCards` (lowers points-to-win: 1K→14, 2K→10, 3K→5, 4K→0) |
| "jack on a point card" | a **Jack** in `*FaceCards` (a stolen point card is a point card whose control flipped) |
| "N point cards" / "has X points" | number cards in `*Points`; "points" = sum of their ranks (Ace=1 … Ten=10) |
| "a two in hand", "a point card in hand" | those cards in `*Hand` |
| "both players have glasses" | an Eight in **both** `p0FaceCards` and `p1FaceCards` (different suits — cards are unique!) |

---

## Moves → Cypress steps

Two actors: the **player** (the seat under test — drives the real UI via clicks) and the
**opponent** (driven over the socket by `cy.*Opponent` commands). Interleave them in turn order.
Keep the existing `cy.wait(...)` cadence so footage is watchable, and start the recorded section
with a `// START RECORDING //` comment as the file already does.

### Player moves (UI clicks)

Select a hand card, then pick the move; targeted moves then click the target:

```js
cy.get('[data-player-hand-card=RANK-SUIT]').click();       // e.g. 2-2 for Two of Hearts
cy.get('[data-move-choice=MOVE]').click();                 // MOVE ∈ points | scuttle | jack
                                                           //        | faceCard | oneOff | targetedOneOff
// scuttle / jack / targetedOneOff then click a target:
cy.get('[data-opponent-point-card=RANK-SUIT]').click();    // scuttle target, jack target, or point target
cy.get('[data-opponent-face-card=RANK-SUIT]').click();     // 2-to-scrap-royal / 9 / targeted-two on a royal
```

Move-choice mapping: **points** = play for points; **scuttle** = destroy a lower opponent point
card; **jack** = steal a point card; **faceCard** = play a royal or glasses eight; **oneOff** =
untargeted one-off (Ace/3/5/6/7); **targetedOneOff** = targeted one-off (2-on-a-royal / 4 / 9).

Reusable timing helpers are defined at the top of the spec file — prefer them for the player side:

- `playerPointsWithDelay(card)`
- `playerScuttleWithDelay(playedCard, targetCard)`
- `playerJackWithDelay(playedCard, targetPointCard)`
- `playerMoveWithDelay(card, moveType)` (generic: select card + pick move choice)

### Opponent moves (socket commands, from tests/e2e/support/commands.js)

| Move | Command |
| --- | --- |
| Draw | `cy.drawCardOpponent()` |
| Points | `cy.playPointsOpponent(card)` |
| Scuttle | `cy.scuttleOpponent(card, targetPointCard)` |
| Jack (steal) | `cy.playJackOpponent(card, targetPointCard)` |
| Untargeted one-off (Ace/3/5/6/7) | `cy.playOneOffOpponent(card)` |
| Targeted one-off (2-on-royal/4/9) | `cy.playTargetedOneOffOpponent(card, target, targetType)` — `targetType` ∈ `'faceCard' \| 'point' \| 'jack'` |
| Counter a one-off | `cy.counterOpponent(card)` |
| Resolve (decline to counter) | `cy.resolveOpponent()` |
| Resolve a 3 (take from scrap) | `cy.resolveThreeOpponent(card)` |
| Resolve a 5 (discard, may be null) | `cy.resolveFiveOpponent(card)` |
| Resolve a 4 (discard 1–2) | `cy.discardOpponent(card1, card2)` |
| Pass / concede / stalemate | `cy.passOpponent()` / `cy.concedeOpponent()` / `cy.stalemateOpponent()` |

Playing a card off a revealed 7 uses the `*FromSevenOpponent` family (`playPointsFromSevenOpponent`,
`playJackFromSevenOpponent`, `scuttleFromSevenOpponent`, `playOneOffFromSevenOpponent`, etc.).

Delay opponent moves for pacing, e.g. `opponentPointsWithDelay(card)` (helper in the file) or a
plain `cy.wait(1500)` before the `cy.*Opponent` call.

### When the PLAYER counters an opponent's one-off

The opponent plays a one-off, then the player counters through the counter dialog:

```js
cy.playOneOffOpponent(Card.ACE_OF_CLUBS);      // opponent's one-off
cy.wait(1500);
cy.get('#counter-dialog').should('be.visible')
  .get('[data-cy=counter]').click();           // choose to counter
cy.wait(1000);
cy.get('#choose-two-dialog').should('be.visible')
  .get('[data-counter-dialog-card=2-2]').click();  // pick which 2 to counter with (RANK-SUIT)
cy.wait(1000);
cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
cy.resolveOpponent();                          // opponent declines to re-counter
cy.wait(1000);
cy.get('#turn-indicator').contains('YOUR TURN');
```

Useful scrims/dialogs to wait on for realistic timing and correctness:
`#waiting-for-opponent-counter-scrim`, `#waiting-for-opponent-discard-scrim`, `#counter-dialog`,
`#choose-two-dialog`, `#three-dialog`, `#turn-indicator` (`contains('YOUR TURN'|'OPPONENT'S TURN')`),
`#game-over-dialog` (for wins). Study the existing tests in the spec for full worked examples of
every one-off (Two through Nine, jacks, god combo, counters).

---

## Writing the test

Write the new `it('<clear scenario title>', () => { ... })` in the file's existing style and
`cy.wait` cadence. **Where** it goes depends on whether the user names a **topic**.

### Shared timing helpers must be at module scope
The pacing helpers (`playerMoveWithDelay`, `playerPointsWithDelay`, `playerScuttleWithDelay`,
`playerJackWithDelay`, `opponentPointsWithDelay`, `opponentScuttleWithDelay`,
`opponentDrawWithDelay`) let any block reuse consistent timing. They must live at **module scope**
(top of the file, outside every `describe`) so topic/seat blocks can call them. If they are still
nested inside `describe('Video Playground')`, **hoist them to module scope once** — this is
non-breaking (nested describes can still reference module-scope functions), and it's a
prerequisite for topic blocks.

### No topic given (default)
Add the `it(...)` to the existing seat block: `describe('Video Playground')` for a p0 clip, or
`describe('Playground as p1')` for a p1 clip. (These carry their own `setupGameAsP0` /
`setupGameAsP1` `beforeEach`.)

### Topic given — organize by topic, then by seat
A **topic** is the tutorial video the clip will appear in (e.g. "Countering", "One-Off Basics",
"Endgames"). Structure:

```js
describe('<Topic>', () => {
  describe('Player perspective (P0)', () => {
    beforeEach(() => cy.setupGameAsP0());

    it('<scenario title>', () => { /* cy.loadGameFixture(0, …) + moves */ });
  });

  describe('Opponent perspective (P1)', () => {
    beforeEach(() => cy.setupGameAsP1());

    it('<scenario title>', () => { /* cy.loadGameFixture(1, …) + moves */ });
  });
});
```

Rules:
- **Find or create the topic block.** Search for an existing top-level `describe('<Topic>')`
  (match case-insensitively / on the obvious intent). Reuse it if present; otherwise add it as a
  new **top-level** `describe`, a sibling of `describe('Video Playground')`.
- **Find or create the seat block** inside the topic. Create only the seat(s) you need — a topic
  may have just P0, just P1, or both ("as necessary"). Each seat `describe` **owns its
  `beforeEach`** (`cy.setupGameAsP0()` or `cy.setupGameAsP1()`); do not depend on the top-level
  `Video Playground` setup. Use consistent seat titles like `'Player perspective (P0)'` and
  `'Opponent perspective (P1)'` (no apostrophes — they'd break the single-quoted string).
- **Add the `it(...)`** inside the matching seat block.

### Exclusive `.only` (both cases)
- Mark **the new test** `.only` (`it.only('…', …)`) and **remove `.only` from every other**
  `it`/`describe` in the file. There are nested describes — scan the whole file. Exactly one
  `.only` must remain. Verify:

  ```bash
  grep -rn '\.only' tests/e2e/specs/playground/videoPlayground.spec.js   # expect exactly 1 line
  ```

- `.only` will trip `eslint-plugin-no-only-tests` (`npm run lint`). That is **expected** for this
  ad-hoc video workflow — playground specs are excluded from CI. Remind the user to strip `.only`
  before committing (or leave it uncommitted).

---

## Running

The dev app must be up. Probe it, and start it in the background only if it's down:

```bash
curl -s -o /dev/null -w '%{http_code}' --max-time 4 http://localhost:8080   # expect 200
# if not 200:  npm run start:dev   (run in background; starts Vite :8080 + Sails :1337; wait for both)
```

Then run headless with video. Three `--config` overrides are required:
- **`video=true`** — there is no `--video` CLI flag in Cypress 15; video is config-only and the
  repo sets `video: false`.
- **`excludeSpecPattern=**/__none__/**`** — the playground spec is excluded from headless runs by
  default; override with a non-matching glob (an empty value is ignored).
- **`trashAssetsBeforeRuns=false`** — Cypress otherwise **empties `tests/e2e/videos/` before every
  run**, deleting previously-saved clips. Turning it off preserves earlier recordings.

```bash
npx cypress run --no-runner-ui \
  --spec tests/e2e/specs/playground/videoPlayground.spec.js \
  --config "video=true,trashAssetsBeforeRuns=false,excludeSpecPattern=**/__none__/**"
```

`.only` restricts execution to the one test, so the single spec-level video contains only your
scenario. The run should end with the target test **passing** — a failure means the video is
incomplete (most often a duplicate card in the fixture, or an out-of-turn move). Fix and re-run.
(While iterating you can append `,retries=0` to `--config` for faster feedback.)

---

## Saving the video

Cypress writes `tests/e2e/videos/videoPlayground.spec.js.mp4` and overwrites it each run. Rename it
to a scenario slug so recordings accumulate, then report the final path:

```bash
mv tests/e2e/videos/videoPlayground.spec.js.mp4 \
   tests/e2e/videos/<scenario-slug>.mp4     # e.g. two-counter-then-points-win.mp4
```

This only accumulates if the run used `trashAssetsBeforeRuns=false` (see *Running*) — otherwise the
next run wipes the folder. `tests/e2e/videos/` is gitignored, so saved clips stay local.

Tell the user the saved path. If the run failed, do **not** present a video — report the failure
and the fix instead.
