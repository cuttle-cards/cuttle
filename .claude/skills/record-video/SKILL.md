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
3. **Add or reuse the test** in `tests/e2e/specs/playground/videoPlayground.spec.js` — reuse/edit a
   matching existing test if there is one, else add a new `it(...)` under the right topic/seat
   block, with a `markClipStart()` call right after `loadGameFixture`. Tests are kept for reuse;
   give the target `.only` and clear every other `.only` (see *Writing the test*).
4. **Run it** headless with video (see *Running*).
5. **Trim & save the video**: cut everything before the marker so the clip opens with the cards in
   place, name it with a scenario slug, and report the path (see *Trimming & saving the video*).

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

### Ending on a win, loss, or stalemate
Whenever the prompt says a player **wins** or **loses**, or the game ends in a **stalemate**, the
game is over — finish the test by asserting the game-over dialog is visible, then holding on it so
the clip lingers on the result. These are the **last two statements** of the test:

```js
cy.get('#game-over-dialog').should('be.visible');
cy.wait(3000);   // keep the result dialog on screen; its entrance animation takes ~3s
```

Use `.should('be.visible')` (not just `.should('exist')`) so the dialog has actually rendered
before the hold. The trailing `cy.wait(3000)` must be the final line — the game-over dialog has an
entrance animation that runs ~3s, so a shorter hold cuts away before it settles.

Useful scrims/dialogs to wait on for realistic timing and correctness:
`#waiting-for-opponent-counter-scrim`, `#waiting-for-opponent-discard-scrim`, `#counter-dialog`,
`#choose-two-dialog`, `#three-dialog`, `#turn-indicator` (`contains('YOUR TURN'|'OPPONENT'S TURN')`),
`#game-over-dialog` (for wins). Study the existing tests in the spec for full worked examples of
every one-off (Two through Nine, jacks, god combo, counters).

---

## Writing the test

Add (or update) an `it('<clear scenario title>', () => { ... })` in the file's existing style and
`cy.wait` cadence. **Where** it goes depends on whether the user names a **topic**.

### Test code is a persistent, reusable library
The generated tests are **kept, never deleted** — `videoPlayground.spec.js` is a growing (tracked)
library of reproducible scenarios. Do not remove test code as "cleanup." Concretely:
- **Re-record** an existing clip (e.g. after a UI change) → just re-run; the test is already there.
- **Tweak** a clip (different cards, timing, an extra move) → **edit the existing `it(...)` in
  place**, then re-run. Don't add a near-duplicate.
- **New scenario** → add a new `it(...)`.

So before writing, **search the file for a test that already matches the request** (by title /
topic / fixture) and reuse or edit it; only add a fresh `it(...)` when none matches. The only
per-run throwaway change is which single test carries `.only` (see *Exclusive `.only`*).

### Shared timing helpers must be at module scope
The pacing helpers (`playerMoveWithDelay`, `playerPointsWithDelay`, `playerScuttleWithDelay`,
`playerJackWithDelay`, `opponentPointsWithDelay`, `opponentScuttleWithDelay`,
`opponentDrawWithDelay`) let any block reuse consistent timing. They must live at **module scope**
(top of the file, outside every `describe`) so topic/seat blocks can call them. If they are still
nested inside `describe('Video Playground')`, **hoist them to module scope once** — this is
non-breaking (nested describes can still reference module-scope functions), and it's a
prerequisite for topic blocks.

### The clip-start marker (enables auto-trimming)
Every clip must open with the cards already in place — not with the app loading or the game being
set up. To make the trim point deterministic (setup time varies run to run), each test flashes a
full-screen black frame **the instant `loadGameFixture` resolves**; the trim step later finds that
black frame with `ffmpeg blackdetect` and cuts to its end.

**Critical:** Chrome's screencast (what Cypress records) only captures a frame on visual change, so
a *static* black overlay — or any still hold, like a display-only clip — can drop to a single frame
or none, which `blackdetect` then can't find. The helper works around this two ways: (1) an
invisible 2px "ticker" that animates forever, keeping frames flowing during static periods; and
(2) the marker overlay itself pulses between two near-black shades (both still "black" to
`blackdetect`) so the marker reliably records. Ensure this helper exists at **module scope** (add
it once if missing):

```js
function markClipStart(holdMs = 600) {
  cy.document().then((doc) => {
    if (!doc.getElementById('clip-ticker-style')) {
      const style = doc.createElement('style');
      style.id = 'clip-ticker-style';
      style.textContent =
        '@keyframes clipTick{from{left:0}to{left:2px}}' +
        '#clip-ticker{position:fixed;bottom:0;left:0;width:2px;height:2px;' +
        'background:rgba(0,0,0,0.01);z-index:2147483646;pointer-events:none;' +
        'animation:clipTick 40ms linear infinite alternate}' +
        '@keyframes clipMarkerPulse{from{background:#000}to{background:#030303}}' +
        '#clip-start-marker{position:fixed;inset:0;z-index:2147483647;background:#000;' +
        'animation:clipMarkerPulse 40ms steps(1) infinite alternate}';
      doc.head.appendChild(style);
      const ticker = doc.createElement('div');
      ticker.id = 'clip-ticker';
      doc.body.appendChild(ticker);
    }
    const overlay = doc.createElement('div');
    overlay.id = 'clip-start-marker';
    doc.body.appendChild(overlay);
  });
  cy.wait(holdMs);
  cy.get('#clip-start-marker').then(($el) => $el.remove());
}
```

Every generated test body follows this shape:

```js
cy.loadGameFixture(<pNum>, { /* … */ });
markClipStart();          // ← trim point: cards are in place
cy.wait(1500);            // brief static hold so the clip opens on a settled board
// START RECORDING //
// … moves …
// If the scenario ends the game (win / loss / stalemate), finish with:
cy.get('#game-over-dialog').should('be.visible');
cy.wait(3000);            // hold ~3s for the game-over dialog's entrance animation
```

Use `cy.document()` (the app's document), **not** `document` (that's the Cypress runner frame). The
overlay is removed within the test, and the black frames are trimmed out of the final clip.

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
- Put `.only` on **the single test you're recording this run** (`it.only('…', …)`) and **remove
  `.only` from every other** `it`/`describe`. This only toggles *which* test runs — it never
  deletes any test. There are nested describes — scan the whole file. Exactly one `.only` must
  remain. Verify:

  ```bash
  grep -rn '\.only' tests/e2e/specs/playground/videoPlayground.spec.js   # expect exactly 1 line
  ```

- `.only` trips `eslint-plugin-no-only-tests` (`npm run lint`) and would fail CI if playground
  specs run there. It's fine while recording, but **before committing, remove the lone `.only`**
  (turning `it.only(` back into `it(`) so `grep '.only'` returns nothing. The scenarios themselves
  stay in the file for reuse and reproducibility — only the `.only` marker is transient.

---

## Running

The dev app must be up. Probe it, and start it in the background only if it's down:

```bash
curl -s -o /dev/null -w '%{http_code}' --max-time 4 http://localhost:8080   # expect 200
# if not 200:  npm run start:dev   (run in background; starts Vite :8080 + Sails :1337; wait for both)
```

Then run headless under **Chrome** with the dedicated **`cypress.video.config.js`**:

```bash
npx cypress run --browser chrome --no-runner-ui \
  --config-file cypress.video.config.js \
  --spec tests/e2e/specs/playground/videoPlayground.spec.js
```

The `cypress.video.config.js` file (repo root) extends `cypress.config.js` and bakes in everything
the recording needs — **recreate it if it's missing** (contents below). It exists because:
- **Window size** — headless browsers default to a ~1280px-wide window, which clips the top/bottom
  of the game board (the board is laid out in `vh`/`vw` against the real window, so the opponent
  username gets cut off). A `before:browser:launch` hook forces a true **1920×1080** recording
  window (`--window-size=1920,1168` — Chrome reserves ~88px of height for window chrome — plus
  `--force-device-scale-factor=1` and `--hide-scrollbars`).
- **`video: true`** — there is no `--video` CLI flag in Cypress 15; the base config sets it false.
- **`excludeSpecPattern: []`** — the base config excludes playground specs from headless runs.
- **`trashAssetsBeforeRuns: false`** — otherwise Cypress empties `tests/e2e/videos/` before every
  run, deleting previously-saved clips.

```js
// cypress.video.config.js
const { defineConfig } = require('cypress');
const base = require('./cypress.config');
const W = 1920, H = 1080, CHROME_HEIGHT_OVERHEAD = 88;
module.exports = defineConfig({
  ...base,
  video: true,
  e2e: {
    ...base.e2e,
    excludeSpecPattern: [],
    setupNodeEvents(on) {
      on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.family === 'chromium') {
          launchOptions.args.push(`--window-size=${W},${H + CHROME_HEIGHT_OVERHEAD}`);
          launchOptions.args.push('--force-device-scale-factor=1', '--hide-scrollbars');
        } else if (browser.name === 'electron') {
          launchOptions.preferences.width = W;
          launchOptions.preferences.height = H;
        }
        return launchOptions;
      });
    },
  },
  trashAssetsBeforeRuns: false,
});
```

`.only` restricts execution to the one test, so the single spec-level video contains only your
scenario. The run should end with the target test **passing** — a failure means the video is
incomplete (most often a duplicate card in the fixture, or an out-of-turn move). Fix and re-run.
(While iterating you can add `--config retries=0` for faster feedback.) Confirm the raw video is
**1920×1080** (`ffprobe -v error -select_streams v:0 -show_entries stream=width,height <file>`).

---

## Trimming & saving the video

Cypress writes `tests/e2e/videos/videoPlayground.spec.js.mp4` (the raw clip, including app load +
game setup). Trim it so it opens on the settled board, using the `markClipStart()` black frame as
the cut point. Requires `ffmpeg` (`brew install ffmpeg` if `command -v ffmpeg` is empty).

```bash
RAW="tests/e2e/videos/videoPlayground.spec.js.mp4"
SLUG="<scenario-slug>"                                   # e.g. two-counter-then-points-win

# 1. Find the end of the marker's black frame (seconds from video start)
BLACK_END=$(ffmpeg -hide_banner -i "$RAW" -vf "blackdetect=d=0.1:pic_th=0.85" -an -f null - 2>&1 \
  | grep -oE 'black_end:[0-9.]+' | head -1 | cut -d: -f2)

if [ -z "$BLACK_END" ]; then
  echo "No black marker found — leaving raw clip untrimmed at $RAW"       # investigate: did markClipStart() run?
else
  # 2. Re-encode from BLACK_END (frame-accurate), drop audio, then delete the untrimmed raw
  ffmpeg -hide_banner -y -i "$RAW" -ss "$BLACK_END" \
    -c:v libx264 -preset veryfast -crf 20 -an \
    "tests/e2e/videos/${SLUG}.mp4"
  rm -f "$RAW"
  echo "Trimmed clip: tests/e2e/videos/${SLUG}.mp4 (cut at ${BLACK_END}s)"
fi
```

Notes:
- **Delete the untrimmed raw** once the trimmed `<slug>.mp4` is produced — the raw is throwaway (it
  just holds the app-load/setup prefix that was trimmed off), and keeping raws doubles disk use.
- `blackdetect` reports the first fully-black interval; that's the marker (the game board is a wooden
  table, never black, so there are no false positives). `pic_th=0.85` tolerates scrollbars/edges.
- Accumulation across runs relies on `trashAssetsBeforeRuns=false` (see *Running*); otherwise the
  next run wipes `tests/e2e/videos/`. The folder is gitignored, so clips stay local.
- Report the trimmed `<slug>.mp4` path to the user. If the run failed, do **not** present a video —
  report the failure and the fix instead.
