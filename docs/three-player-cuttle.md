# Three-Player Cuttle (Cutthroat): Architecture & Phase 1 Spec

**Status:** Draft for review. Destined for GitHub issues — each numbered work item below is
intended to become one issue.

**Scope of this document:** the architecture decisions for supporting a 1v1v1 "Cutthroat"
variant, and a fully specified Phase 1. Phase 1 contains *no three-player behavior*. It is
groundwork that ships against two-player rules, gated by the existing test suite, and is
independently valuable because it fixes two latent correctness bugs.

Variant rules as written live in `src/translations/en.json` under `rules.3Players`.

- [Settled rules decisions](#settled-rules-decisions)
- [Architecture decisions](#architecture-decisions)
- [Phase 1 — two-player-safe groundwork](#phase-1--two-player-safe-groundwork)
- [Phases 2–5 — outline](#phases-25--outline)
- [Open questions](#open-questions)

---

## Settled rules decisions

Decided in design discussion; not all are derivable from `en.json`.

| Topic | Decision |
|---|---|
| Glasses eight | Reveals **both** opponents' hands, but only to the player holding the glasses. |
| Counter priority | Clockwise (ascending pNum) from whoever last added to the stack. p0 casts → p1 may counter → if p1 declines, p2 may counter → if p2 counters, p0 may counter that, then p1, etc. Declines are cleared each time the stack grows. |
| Stalemate | All three players passing consecutively (one full round). |
| Concede | **Not allowed** in cutthroat. |
| Stalemate request | **Not allowed** in cutthroat. |
| Win thresholds | 14 points / 9 with one King / 5 with two Kings / 0 with three Kings. |
| Hand limit | 7 (vs 8 in two-player). |
| Deal | 5 cards each; dealer rotates per game; play starts left of the dealer. **Confirmed intentional** -- unlike two-player's 5/6, later players get no extra card, since acting later in a 1v1v1 carries its own advantage. |
| Jokers | **Out of scope** for the initial release. Tracked separately as an orthogonal rule variant. |
| Buried jacks | The **top-jack-only** targeting restriction is kept. After 1a it is no longer required by the representation, so it stands as a deliberate rule. |
| Targeting scope | `targetPNum` must be an **opponent, never yourself**. The Nine may hit any opponent's card. Applies equally to the Two, the Jack and scuttles. |
| Seven reveals | The top two cards are revealed to **every** player, not just the caster. |
| Rematch agreement | **Unanimous** -- all N players must accept. Generalizes `p0Rematch && p1Rematch`. |
| Leaving a game | A **Go Home** menu item replaces Concede/Stalemate in variants that disallow them. Plain navigation: the game persists and the player may return. |
| Queen protection | A Queen protects her owner's board against **every** opponent's targeting effects -- Twos (both effects), Nines, Jacks, and Jokers. Not caster-scoped. |
| Rematch / dealer rotation | **Seat rotation**, generalizing the existing two-player swap: `newSeats = [...seats.slice(1), seats[0]]`. Since p0 always starts, rotating by one advances the starter clockwise each game. No `firstPlayerPNum` column. |

---

## Architecture decisions

### Share the tables

`Game`, `GameStateRow`, and `Match` are all shared; none are forked.

- **`Game`** — extend with `playerCount` (default 2) and `ruleVariants`, plus `p2`/`p2Ready`/`p2Rematch`.
  `utils/rulesVersion.js` already anticipates a `ruleVariants` column, naming jokers as the
  motivating example. Forking `Game` would mean forking everything hanging off it:
  `UserSpectatingGame.gameSpectated`, the lobby list, `get-history`, `archive`, rematch chains,
  and `lockGame`.
- **`GameStateRow`** — add nullable `p2Hand`/`p2Points`/`p2FaceCards`; relax `playedBy` from
  `isIn: [0, 1]` to `[0, 1, 2]`. Purely additive, so historical rows replay with no backfill.
- **`Match`** — untouched. It is ranked-only infrastructure (`player1`/`player2`, created only
  when `game.isRanked` per `api/helpers/add-game-to-match.js:20`) and feeds season scoring.
  **Cutthroat ships casual-only.** Ranked 1v1v1 is a ratings-design problem, not a schema one.

### Share the effect helpers; fork the game-loop policy

Of the 24 directories under `api/helpers/game-states/moves/`:

- **4 are simply disabled** in cutthroat (`concede`, `stalemate-request`/`-accept`/`-reject`) —
  a variant allow-list, not a fork.
- **~2 genuinely differ**, and only in *priority*: `counter` and `resolve`.
- **~18 are identical**, either outright or once the target player is made explicit.

A fork would duplicate ~3,600 lines to vary maybe three of them. The real variance is not in
"what a card does" — it is in turn order, priority, victory, dealing, and stalemate. Those
belong in a **variant policy object**, e.g. `utils/variants/cutthroat.js`:

```js
// resolved rule set -- PURE DATA, no functions (see below)
{
  playerCount: 3,
  handLimit: 7,
  winThresholds: { 0: 14, 1: 9, 2: 5, 3: 0 },
  stalematePasses: 3,          // one full round -- NOT playerCount + 1, see 1d
  deal: [ 5, 5, 5 ],
  deckIds: [ /* 52, or 54 with jokers */ ],
  disallowedMoveTypes: [ 'concede', 'stalemateRequest', 'stalemateAccept', 'stalemateReject' ],
}
```

Turn order needs no field here: seat rotation means p0 always starts, so the active player is
`turn % playerCount` (see the settled-decisions table).

### Composing orthogonal variants

Named presets do not compose: the moment an option is orthogonal (jokers on/off) you need
cutthroat, cutthroat+jokers, standard, standard+jokers. Model it as **flags -> resolver ->
effective rule set**. `Game.playerCount` and `Game.ruleVariants` (e.g. `{ jokers: true }`) resolve
**once per request** at the controller boundary into the plain object above. The resolver is the
single place composition and interaction rules live -- jokers change deck size, which in turn
affects stalemate dynamics.

**The rule set must be pure data.** Every execute helper opens with `_.cloneDeep(currentState)`,
and lodash does not meaningfully clone functions, so function-valued config would silently
degrade. Keep behaviour in free functions that *take* the rule set -- `activePlayer(state, ruleSet)`
rather than `ruleSet.activePlayer(state)`. That also keeps it serializable, loggable and diffable,
which matters for the analysis use case behind the 5.0.1 bump.

**Delivery: attach it in unpack and read it off `currentState`.** `pack-gamestate.js` iterates an
explicit `attributesToConvert` list, so an extra `ruleSet` field is silently not serialized; and
every helper already receives `currentState`, so there is no signature churn across 48 helpers.
`move.js` has `game` in scope, making `unpackGamestate(row, ruleSet)` a one-line call-site change.
(The alternative -- an explicit extra input per helper, as `priorStates` was added -- is more
honest about dependencies, but `handLimit` and `playerCount` are needed in most executes, so
threading them individually buys little.)

**The parser stays variant-blind.** Jokers require extending the id alphabet -- `convertIdToCard`
demands exactly 2 characters today -- but the parser never needs to know whether jokers are
*enabled*: it accepts `XR`/`XB` unconditionally, and a game without them simply never contains
those ids. Same self-describing principle as the encoding discriminator and the context-free
`convertCardToStr`. Deck *composition* is a different layer, and is variant-aware:

| Layer | Variant-aware? |
|---|---|
| `convertStrToCard` / `convertCardToStr` | **No** -- accepts the full possible alphabet |
| `deal-cards.js`, `validate-all-cards.js` | **Yes** -- which cards exist. `validate-all-cards.js` currently builds its expected set from the static `DeckIds` import, a hardcoded 52 |
| Rules helpers | **Yes** -- how cards behave |

**Two properties to enforce.** `ruleVariants` is frozen at creation, like `rulesVersion` --
toggling jokers mid-game would make already-stored rows uninterpretable. And the resolver must
**reject invalid combinations** at creation rather than producing nonsense at move time: the rules
text defines jokers for 3- and 4-player, not for 1v1.

Rationale for sharing over forking:

1. **A fork would preserve the bugs in 1b/1c.** Those helpers encode a two-player *coincidence*
   rather than the actual rule. Forking lets the wrong version keep shipping to the flagship mode.
2. **The ruleset versions actively.** Six bumps to date: the Four reworked twice, the Nine once,
   the Five once, the hand limit once. Each would have been a two-site change under a fork, in a
   codebase that keeps `RESOLVING_FOUR` alive purely so stored games replay.
3. **The cost is asymmetric.** Share → fork is cheap and local. Fork → merge never happens.

**Where forking *is* right:** the client view (a seat-based board component rather than branching
inside the 1634-line `GameView.vue`, preserving the `data-opponent-*` / `data-player-*` selector
contract that 38 e2e specs depend on) and the AI (max^n is not a port of minimax — out of scope).

---

## Verification strategy

**1a, 1b and 1c fix defects that cannot be observed at two players.** The two-player alternation
they remove is *accidentally correct* wherever only two players exist, which is exactly why the
bugs have survived. This has a direct consequence for how the issues are written and reviewed:

> The existing suite is a **no-regression gate, not a correctness proof.** A green run says the
> refactor changed nothing at two players — which is necessary, and says nothing about whether the
> defect is fixed.

Correctness is proved instead by **object-level unit tests over synthetic multi-player
GameStates**. The move and resolve helpers are synchronous pure functions of `currentState`, so a
hand-built three-player state exercises them with no schema support, no `p2` columns and no
database round-trip — Phase 2 is not a prerequisite. They are still Sails helpers, so these belong
in `tests/unit/specs/sails/` alongside the existing engine specs, which already boot Sails via
`tests/unit/setup-sails.vitest.js`.

This is the reason **1e ships early**: `players[]` is what gives the synthetic third player a
natural shape. Without it, every such test needs an ad-hoc `p2` key and template-literal indexing.

Worked example of why two players is not enough, for 1b: take TH owned by p0, jacked by p1, then
p0, then p1. Explicit ownership returns it to p0. Parity sees `jackCount = 3`, odd, and returns it
to "the other player" — also p0. The two agree, and they agree in *every* two-player
configuration. Only a third distinct owner separates them.

### Suggested order

| Order | Item | Why |
|---|---|---|
| 1 | **1a**, **1e** (parallel) | Both independent. Together they unblock everything else. |
| 2 | **1b**, **1c** | Need 1a; need 1e to be provable. |
| 3 | **1d**, **1f** | Independent throughout; cleaner after 1e. |

---

## Phase 1 — two-player-safe groundwork

Every item ships against two-player rules with the existing suite as the regression gate.
Items **1a–1c** are specified in full. **1d–1f** are specified to issue granularity.

### 1a. Make jack ownership authoritative in the storage format

**Problem.** Ownership is *positional*, not authoritative. Suffixes are generated by alternating
between exactly two values at pack time (`convert-card-to-str.js:18-22`), and `is-top-jack.js`
documents the consequence: "Each jack's owner is derived from its position in the stack, so
removing a buried jack silently reassigns every jack above it."

The recorded data is complete for two players (see [Reading legacy rows](#reading-legacy-rows) —
the suffix list is the real ownership sequence, shifted one position). What fails at three players
is the *scheme*, not the coverage: alternation can only ever express a flip between two
participants, so a stack where two different opponents each jacked the same point card is
structurally inexpressible. A point card's original owner likewise stops being recoverable by
parity once a third player can take it.

This blocks 1b entirely.

**Also note:** `pack-gamestate.js:61-65` passes `attribute.player` — the *column* — into
`convertCardToStr` under a comment reading "the cards owner is needed". The column is the
**controller**, not the owner. The existing code already conflates the two.

#### Target format

```
cardStr    := cardId [ "-" pNum ] [ "(" attachment { "," attachment } ")" ]
attachment := cardId "-" pNum
cardId     := rank suit                  ; exactly 2 characters
pNum       := "p" digit
```

- The host card's `-pNum` is its **original owner** — the player who played it to their points.
- Each attachment's `-pNum` is **that jack's controller** — the player who played that jack.
- The suffix is written **whenever the owner is not recoverable from the column**:
  - unstacked card in `pXPoints` -> recoverable (owner == column) -> **omit**, which keeps the
    overwhelming majority of card strings byte-identical to today;
  - stacked card in `pXPoints` -> the column is now the controller, not the owner -> **write**;
  - card in `twos` -> there is no per-player column at all -> **always write** (e.g. `2H-p2`).

Example: `TH-p0(JH-p2,JC-p1)` in `p1Points` — p0 played the Ten of Hearts, p2 jacked it, then
p1 jacked it. Current controller is p1 (top jack); original owner is p0.

#### Reading legacy rows

The format is **self-discriminating per card string** — no version field is consulted anywhere.
The signal differs by column, because the suffix rule does:

| Column | Legacy signal | Why unambiguous |
|---|---|---|
| `pXPoints`, card has attachments | no host suffix | the new format always writes one here, and pack throws rather than omitting it |
| `pXPoints`, card unstacked | n/a | neither format writes a suffix, and both reconstructions agree (owner == column), so misclassification is harmless |
| `twos` | no suffix on any entry | the new format always writes one here; legacy owners reconstruct by alternation from the caster, `twos[i].owner = (caster + i + 1) % 2` |

This is per-row rather than per-game, which matters given the deploy sweep cannot be atomic (see
the deploy note): a game can legitimately hold rows written on either side of the release.

> **Decoding is structural; `rulesVersion` records the change for analysis.** Two separate jobs:
>
> - **Parsing** never consults a version. `unpackGamestate` receives a `GameStateRow`, not a
>   `Game`, so version-gated decoding would mean threading game metadata into the parser, against
>   the context-free direction settled above. Structural detection is also self-checking: a bad
>   migration cannot corrupt decoding.
> - **Analysis** uses `rulesVersion`, bumped to **5.0.1** when 1a ships, with a
>   `VERSION HISTORY` entry in `utils/rulesVersion.js` recording that it is a storage-encoding
>   change with no rules change. Recovering the encoding from a jsonb regex over `pXPoints` is a
>   poor query experience, and a distinction never recorded cannot be retrofitted; collapsing two
>   versions later is trivial by comparison.
>
> Patch, not major or minor: of the three tiers that file defines, only patch ("doesn't change
> legal play") fits, and a major bump would assert a rules break that did not happen. Patch also
> leaves `parseInt(game.rulesVersion, 10)` checks such as `get-log.js:124` undisturbed.
>
> **A few straddling games are expected and acceptable.** Merges deploy automatically and
> immediately, so there is no window to coordinate: the procedure is simply *sweep, then merge*
> (see 1a's merge checklist). Games created between the sweep and the deploy finishing will hold
> rows in both encodings under one creation-time stamp. That costs **analysis precision on a
> handful of games, not correctness** — decoding is structural and per-row, so they render
> correctly, and structural detection still yields their true per-row encoding if analysis ever
> needs it. Not worth building a maintenance mode to prevent.
>
> If a third encoding is ever needed, revisit: an explicit `encoding` column on `GameStateRow`
> has the right granularity and would not spend `rulesVersion`'s semantics a second time.

#### Object layer

Add a single field to the Card object:

```
owner: pNum | null   // the player who played this card onto the field; null off-field
```

One definition, correct in both positions: for a host point card it is the original owner; for a
jack in `attachments` it is that jack's controller. Control stops being stored and becomes a
derivation:

```js
const controllerOf = (pointCard) => pointCard.attachments.at(-1)?.owner ?? pointCard.owner;
```

**Do not add a separate `controller` field.** A jack *is* a card, so `Card` would then carry two
fields each meaningful in only one nesting position — reintroducing exactly the position-dependent
meaning that caused this bug.

**The `twos` stack carries `owner` too.** `twos` is a bare `Array<Card>` serialized through the
generic path in `pack-gamestate.js`, so nothing records who played each counter. At two players the
owners are derivable by alternation from the caster; at three they are not -- the same failure as
jack ownership, in a different column. Set `owner` when a two is played in `counter/execute.js`,
and serialize it per the rule above. Audited against the other card-bearing fields: `deck` and
`scrap` need no owner, `oneOff`'s caster is derivable from `turn` (1c), and
`oneOffTarget`/`fourRevealedCards` are covered by `oneOffTargetPNum` (1c). `twos` is the only
remaining gap.

**Do not populate `owner` for cards in hand, deck, or scrap.** There it would be identical to the
column — zero information, never serialized, and no consumer (the four's reveals are contextual to
`oneOffTargetPNum`; revealed-ness is a separate id set, `create-socket-events.js` does
`revealedIds.has(card.id)`; the client renders hands out of `players[n].hand`). It would add a
sync obligation at every zone transition for no benefit.

#### Lifecycle

Set on entering the field, immutable while on it, cleared on leaving. Re-entry (scrap → three →
hand → replayed by a different player) correctly re-establishes a new owner because it was
cleared on exit.

Moves do **not** set `owner`, with one exception: **moves that create an attachment must set it
on the jack they play** — `jack/execute.js` and `seven-jack/execute.js`. That value is serialized
on that very move and is unrecoverable afterward (the column yields the controller; a buried jack
has no column signal at all). Everything else is hydrated by unpack and carried through
`_.cloneDeep` by `execute`.

#### Pack must refuse to write legacy

Once pack reads `card.owner`, a card with attachments and a null owner would serialize as
`TH(JH-p2,JC-p1)` — no suffix — which the reader then classifies as *legacy* and reconstructs by
parity. At two players parity yields the right answer, so it passes silently; at three it is
silently wrong.

**`convertCardToStr` must throw on an attachment-bearing card with a null `owner`.** Legacy is a
read-only format; nothing may ever write it.

This matters concretely for `load-fixture-gamestate.js:83-84`, which packs the raw request body
before re-unpacking. Any e2e fixture staging a jacked point card must supply `owner`; with the
throw in place those fail loudly during migration rather than passing by parity coincidence and
breaking on the first three-player test.

#### Changes

- `api/helpers/game-states/convert-card-to-str.js` — read `card.owner`; drop the `playedBy`
  parameter (the serializer becomes context-free); throw per above; `validateCardId` must accept
  the suffix.
- `api/helpers/game-states/convert-str-to-card.js` — **both edits are driven by the new format;
  the legacy path through this file is behaviourally unchanged.** `mainCardId` at line 113 strips
  parens and will now retain `-pN`, which `convertIdToCard` rejects (it requires exactly 2
  characters) — split the suffix off. Retain `content[1]` on attachments at line 128 instead of
  discarding it. Legacy strings yield a bare `TH` at line 113 and carry misaligned attachment
  suffixes that must continue to be ignored, so neither edit touches them. The parser stays
  **context-free**, mirroring `convertCardToStr` — it never receives a column.
- `api/helpers/game-states/unpack-gamestate.js` — owns all column-dependent hydration, using the
  pNum already in scope from the name list at lines 30-35. Per card in `pXPoints`: if `owner` is
  set (new format) leave it; if absent and the card has attachments, apply the legacy parity
  reconstruction; if absent and unstacked, set `owner = X`.
- `api/helpers/game-states/pack-gamestate.js` — delete the points-specific branch at lines 61-69;
  points now serialize like every other column.
- `api/helpers/game-states/moves/jack/execute.js`, `.../seven-jack/execute.js` — set `owner` on
  the played jack.
- `api/helpers/game-states/moves/resolve/nine.js:28` — add `owner: null` alongside
  `attachments: []` when top-decking.
- `api/helpers/game-states/validate-gamestate.js` — assert `controllerOf(card) === X` for every
  card in `pXPoints`.
- `utils/rulesVersion.js` — bump `CURRENT_RULES_VERSION` to `5.0.1` and add a `VERSION HISTORY`
  entry recording a storage-encoding change with no rules change. Patch tier, per the rationale in
  [Reading legacy rows](#reading-legacy-rows).
- `api/helpers/game-states/moves/one-off/validate.js:88-90` and `is-top-jack.js`'s
  `extendedDescription` — both justify the top-jack restriction *by the parity representation*,
  which this item removes. Reword to state it as a rule, or a later contributor will read the
  check as dead code and delete it. The restriction itself is kept -- see the
  settled-decisions table.
- `api/models/GameStateRow.js:14-16`, `docs/game-state-api.md:145` — correct the format
  documentation (currently inverted) and state the grammar formally in one place.
- `docs/game-state-api.md:117` — the `p0Hand: ['8D(JS-p0,...)']` example shows a stacked card in
  a *hand*, which cannot occur. Remove.

#### Acceptance criteria

- Full existing unit + e2e suite passes unchanged.
- Round-trip: unstacked point card → `"TH"` → unpacks with `owner` = column.
- Round-trip: `TH-p0(JH-p2,JC-p1)` in `p1Points` → identical object both directions.
- A stored legacy row hydrates to the same object a newly written row would, for all of
  n = 1, 2, 3 attachments, both columns.
- `convertCardToStr` throws on an attachment-bearing card with null `owner`.
- Replay of a pre-change game renders identically.
- **Migration continuity:** a game whose latest stored row is legacy format and contains a jacked
  point card accepts a further move — unpack(legacy) → execute → pack succeeds and writes the new
  format. See the deploy note below: a sweep is planned to make this path rare in production, but
  it cannot make it impossible, so the path is still covered by test.


#### Deploy note: archiving in-progress games

The plan is to archive in-progress games at deploy so that no single game holds rows in both
formats. This is worth doing — it means `unpack(legacy) → execute → pack` effectively never runs
in production, downgrading a hydration gap from "breaks live games" to "mis-renders an old
replay". It does **not** change the code, for two reasons:

- **Replay is forever.** Archived and finished games are still unpacked to be re-rendered, so the
  legacy branch is permanent regardless. The codebase already carries version-aware read paths for
  exactly this: `RESOLVING_FOUR` is retained for stored games, and `get-log.js:124` branches on
  `parseInt(game.rulesVersion, 10) === 3` to render old logs correctly.
- **The sweep races the deploy.** It cannot be atomic with the release; a game created and played
  in the gap lands legacy rows in a `STARTED` game. Unless the site is taken down for the window,
  the sweep is best-effort, so hydration must work anyway.

**Decided:** the sweep covers **all** in-progress games including ranked ones, and runs at a time
of minimal-to-zero usage.

**Timing: this is a step on 1a's merge, not separate infrastructure.** Merges deploy
automatically and immediately, so there is no window to orchestrate. The procedure is:

1. Run the sweep at a time of minimal-to-zero usage.
2. Merge 1a promptly afterwards.

Games created between the two will straddle encodings under one creation-time `rulesVersion`.
Accept them: decoding is structural and per-row, so they render correctly; only their analysis
bucket is imprecise, and structural detection recovers the true encoding if ever needed.

Notes on performing it:

1. It cannot use `DELETE /api/game/:gameId`. `archive.js:26-34` requires the caller to be a player
   in the game and to pass `canArchiveGame`, which demands dormancy past `RECENT_ACTIVITY_MINUTES`.
   The sweep is a migration script setting `status: ARCHIVED` directly, bypassing those guards.
2. Including ranked games overrides a deliberate guard — `can-archive-game.js` declines ranked
   games in the running season week because "those still have a bearing on this week's match". The
   actual consequence is narrow: an archived game has `winner: null`, so it contributes to neither
   player's tally and the match is simply left open at its current score. No standings corruption.
   The only cost is that a match underway at sweep time is not banked that week.
3. **No `Match` cleanup is required.** `findOrCreateCurrentMatch` resolves matches by player pair
   and week alone, ignoring `winner`/`endTime`, and `add-game-to-match.js:45-49` only forces a game
   unranked when its match already has `endTime || winner`. So a left-open match is resumed if the
   same pair plays ranked again that week, and a fresh one is created at week rollover. The sweep
   archives games and stops.

#### Merge checklist

Deploys are automatic and immediate on merge, so these are steps on this PR rather than a separate
task:

1. Run the archive sweep (see the deploy note) at minimal-to-zero usage.
2. Merge promptly afterwards.
3. Confirm the package version label is **patch** — unrelated to the `CURRENT_RULES_VERSION` bump
   to 5.0.1 in this PR, which is the *rule-set* version. Two different version concepts; do not
   let one be "corrected" into the other in review.

**Depends on:** nothing. Ship first.

---

### 1b. Rewrite `six` / `nine` / `two` onto `controllerOf`

**Problem.** Two helpers encode two-player parity as if it were the rule.

`resolve/six.js:29-30`:

```js
if (jackCount % 2 === 1) {
  opponent.points.push(point);  // Move point card to opponent if odd number of jacks
```

"Return the stolen card to its original owner" is the rule; `jackCount % 2 === 1` is a two-player
*encoding* of it. Note also that `six.js:37-38` applies the transform pairwise
(`scrapRoyalsAndSwapStolenPoints(p0, p1)` then `(p1, p0)`), which does not generalize.

`resolve/nine.js:56-58`, the jack-target branch:

```js
const jack = targetCard.attachments.pop();
// Card the jack was stealing goes back to other player
player.points.push(
```

Hands the card to the nine's **caster**. Correct at two players by parity. At three: p0 owns TH,
p2 jacks it, p1 jacks it, p0 nines the top jack — the card should revert to **p2**, not p0.

**Change.** Both read `card.owner` / `controllerOf(card)` instead of inverting parity. `six.js`
iterates all players rather than applying a pairwise swap.

**Acceptance criteria:** existing suite passes (no-regression gate); object-level unit tests over
a **synthetic three-player** state prove the six returns a stolen card to its original owner and
the nine reverts control to the next jack down.

> The three-player state is required, not a nicety. At two players parity and explicit ownership
> agree in *every* configuration — TH owned by p0 and jacked p1 -> p0 -> p1 gives `jackCount = 3`,
> odd, so parity returns it to "the other player" = p0, which is also what `owner` says. A
> two-player test therefore **cannot distinguish the fix from the bug**. Three distinct owners are
> the minimum that separates them. See [Verification strategy](#verification-strategy).

**Depends on:** 1a, and **1e** — `players[]` is what gives a synthetic third player a natural
shape. Without it the tests need an ad-hoc `p2` key and template-literal indexing.

---

### 1c. Store the one-off's target player on the gamestate

**Problem.** Today the player who resolves a one-off is *necessarily* the caster's opponent, and
the effect helpers exploit that inversion to find their victim. `resolve/four.js:27-29` states it
outright:

```js
// The player resolving the one-off is the opposite of the one who played it, so `playedBy`
// identifies the player whose hand is discarded -- not the four's caster.
const victim = playedBy ? result.p1 : result.p0;
```

Same inversion in `resolve/nine.js:24-25` and `resolve/two.js:25-26`;
`create-socket-events.js:62-64` flips `playedBy = (playedBy + 1) % 2` on RESOLVE for the log.

Under clockwise counter priority this is wrong: p0 casts a Four, p1 declines, p2 declines and
thereby resolves → `playedBy` is 2, but the victim is whoever p0 targeted. **The resolver's
identity no longer determines the effect's victim.** Invisible to the two-player suite, because
the inversion stays accidentally correct there.

**The caster needs no column.** A one-off can only be cast on your turn
(`one-off/validate.js:46`, `seven-one-off/validate.js:44`), and `turn` does not advance during the
countering phase — neither `one-off/execute.js` nor `counter/execute.js` touches it, and only
`resolve/execute.js` increments it once the one-off fully resolves. Counters live in `twos`, not
`oneOff`, so the pending one-off is always the one the active player cast. Therefore:

```
casterPNum === activePlayer(turn)
```

at any player count, in O(1), with no column and no walk back through prior states. Use the
variant's `activePlayer` helper once 1d/1e land (`turn % 2` until then) rather than
storing a denormalized copy that could drift
from `turn`.

> Caveat for a future 2v2 variant: its rule 5 allows playing a Nine **out of turn** in response to
> a Royal. That would break this invariant. It does not apply to cutthroat, where no move is legal
> out of turn except countering, which does not set `oneOff`.

**Change.** Carry a single new nullable column, `oneOffTargetPNum`, set when the one-off is cast in
`one-off/execute.js` and `seven-one-off/execute.js` — with one opponent that is `(playedBy + 1) % 2`.
It must be cleared wherever `resolve/execute.js` already clears `oneOffTarget`/`oneOffTargetType`.
Every resolve helper then reads it, and derives the caster from `turn`, instead of inverting
`playedBy`; likewise the log flip at `create-socket-events.js:62-64`.

**Why the target does need storing, unlike the caster.** A Four's target is a *player*, not a
card: `oneOffTarget` is null for it, so nothing else records the victim. For the Two and Nine the
card is in `oneOffTarget` and its owner is findable by searching every board, but
`find-target-card.js` takes a specific player, and `oneOffTarget`/`oneOffTargetType` are already
denormalized onto each countering row for the same reason. This completes that set rather than
introducing a new pattern.

No request-body change is needed — this item is fully implementable at two players with no API
surface. Letting the caster *choose* among several opponents is deliberately **not** part of this
item; see Phase 3.

**Also in scope: the counter-phase Queen check.** `counter/validate.js:61-65` resolves the
protecting player as `playedBy ? p0 : p1`. Queens block counters, and the relevant Queen belongs to
whoever played **the top of the stack** -- which at two players is always "the opponent" only
because counters strictly alternate. Under clockwise priority it is not: p0 casts, p1 declines, p2
counters, and when p0 counters back the check consults p1 rather than p2. Resolve it as *the owner
of the last two in `twos`, or the caster (`activePlayer(turn)`) when `twos` is empty*. The first
half depends on 1a attributing owners to the `twos` stack.

Note this check is blanket (any queen blocks) rather than graded like `one-off/validate.js`,
because the thing being countered is never itself a Queen, so the "may only target the queen
herself" exemption cannot apply. Keep it blanket.

**Acceptance criteria:** existing suite passes; no resolve helper references `playedBy` to
identify a victim or a caster; `oneOffTargetPNum` is populated on every state where `oneOff` is
non-null and cleared wherever `oneOffTarget` is; the counter Queen check resolves its player from
stack ownership rather than from `playedBy`.

**Depends on:** **1a**, for the `twos` ownership the counter-Queen check needs. The
`oneOffTargetPNum` half is independent and could land first if the two are split further.
Benefits from 1e for clean player indexing and for three-player tests, but does not require it:
at two players the caster is `turn % 2`, so use that directly rather than blocking on the
variant's `activePlayer` helper.

**Explicitly out of scope:** `targetPNum` on move request bodies. At two players it is a parameter
with no observable effect, so it reduces no Phase 3 risk. Keeping it out also keeps this schema
migration out of the same PR as an API-contract change, so either can be reverted alone. Its
contract is now settled (targets are chosen at cast time, and must be an opponent -- see the
settled-decisions table); only the plumbing is deferred.

---

### 1d. Extract variant-parameterized config

Move the following out of hard-coded constants into the variant object:

- **Win thresholds.** Currently duplicated in three places:
  `check-game-state-for-win-sync.js:22-38`, `GameView.vue:880-893`, `ScoreGoalToolTip.vue:72`.
- **Hand limit.** `utils/GameConstants.json` is a single global.
- **Stalemate threshold.** `check-game-state-for-win-sync.js:51` uses `numPasses >= 3`, with
  `create-socket-events.js:37-48` scanning the 3 most recent rows.

> **Trap:** the two-player rule is `playerCount + 1` (three passes = one and a half rounds); the
> cutthroat rule is `playerCount` (exactly one round). They coincide at 3 **by accident**. Do not
> refactor to `numPasses >= playerCount` — that silently drops two-player stalemates to two
> passes. Keep it an explicit per-variant constant with a comment explaining why the values are
> equal but the rules are not. The `currentIndex - 2` slice window must track the same constant.

**Acceptance criteria:** no literal win thresholds (`21`/`14`/`10`/`5`) remain in server or client
code; `HAND_LIMIT` is read from the resolved rule set rather than imported from
`GameConstants.json`; the stalemate threshold and the `create-socket-events.js` slice window read
one shared constant; `GameView.vue` and `ScoreGoalToolTip.vue` derive their table from the same
source as `check-game-state-for-win-sync.js`; existing suite passes unchanged.

**Depends on:** nothing. Note this spans server *and* client, since the win table is duplicated in
both — worth calling out in the issue so it is not scoped as backend-only.

---

### 1e. Move `GameState` to a `players[]` array

`p0`/`p1` appears 375 times across `api/`, almost all in-memory rather than at the DB layer —
overwhelmingly the pattern `const opponent = playedBy ? currentState.p0 : currentState.p1`.
Replace with `players[]` plus an `opponentsOf(state, pNum)` helper. Replace the ~22 `turn % 2`
sites with a `playerCount`-aware active-player helper (`get-active-player-p-num.js` is the
existing seam).

Column names stay `p0*`/`p1*`/`p2*`; only the in-memory shape changes. The client store already
holds `players: Player[]` (`src/stores/game.js:100`), though `opponent` is
`players[(myPNum + 1) % 2]` and is consumed widely.

**Acceptance criteria:** `GameState` exposes `players[]`; the ~25 `playedBy ? p1 : p0` lookup sites
(sweep category "benign") become `players[playedBy]`; no helper derives a player *identity* from
alternation except those explicitly deferred to Phase 3; stored column names are unchanged;
existing suite passes; **a synthetic three-entry `players` array can be passed to any move helper
without error** — this is what unblocks the 1b and 1c correctness tests.

**Depends on:** nothing. **Ship early** — alongside 1a rather than after it. It is a pure
two-player-safe refactor, and it is the enabler for proving 1b and 1c at all.

---

### 1f. Generalize socket fan-out to N rooms

`publish-game-state.js` hard-codes three rooms and `create-socket-events.js` returns exactly
`{ p0State, p1State, spectatorState }`. Generalize to N+1. `join.js:51-62` hard-codes the p0→p1
seat ladder.

Note `create-socket-events.js:96-107` already computes hand visibility **per perspective** —
`hideOpponentHand` checks whether *that* player holds a glasses eight and, if so, unhides every
hand in that player's own payload only. The settled eights rule therefore requires no rules logic
at all; it falls out of this item once `originalPlayers` has three entries.

**Acceptance criteria:** `createSocketEvents` returns one state per player plus a spectator state,
derived from player count rather than a fixed `{ p0State, p1State, spectatorState }`;
`publishGameState` broadcasts to N+1 rooms; `join.js` assigns seats by iteration rather than the
p0 -> p1 ladder; `tests/unit/specs/sails/game-perspectives.spec.js`, which asserts room membership
and per-perspective visibility, passes unchanged. That spec is the natural regression gate here.

**Depends on:** nothing hard; cleaner after 1e.

---

## Phases 2–5 — outline

**Phase 2 — schema + lobby.** `Game.playerCount` / `ruleVariants` / `p2` / `p2Ready` /
`p2Rematch`; `GameStateRow.p2*` nullable, `playedBy` relaxed. Create / join / `isGameFull`
(currently `game.p0 && game.p1`) / ready-up for N seats. Both migrations additive.
`archive.js:26-28` checks membership against `[p0, p1]` only — p2 must be added, or the third
player cannot dismiss their own abandoned game.

**Rematch under seat rotation.** `rematch.js` generalizes rather than forks, but has three
reconciliation sites plus one hazard:

1. **Agreement gate** (line 36) — `p0Rematch && p1Rematch` becomes **unanimous** across all N
   players (decided). Note the whole rematch flow is deferred past the first user-facing release
   (see Phase 4); this section is documented now so the issue is ready, not to sequence it early.
2. **Series score** (lines 58-67) — currently normalizes back to the first game's seating to keep
   the tally stable across the swap. Tally by **user id** rather than by seat and the
   reconciliation disappears; order the display by first-game seating.
3. **Series name** (line 67) — `${p0.username} VS ${p1.username} ${w}-${l}-${s}` needs a
   three-player format. Cosmetic, but pick a stable ordering (first-game seating).
4. **Hazard: room remap** (lines 96-97) — `addRoomMembersToRooms` must rotate in the *same*
   direction as the seat assignment. At two players it is a swap and self-evidently correct; a
   3-cycle has a plausible wrong direction, and reversing it places players in another player's
   perspective room. That is an information leak, not a glitch. Cover it with an explicit test:
   after a rematch, every user's socket room matches their new seat.

**Phase 3 — three-player rules.** Turn order + dealer rotation; counter priority with explicit
state; cross-board targeting; board wipes across three fields; win table; hand limit 7; stalemate
redefinition; concede and stalemate-request disabled via the allow-list.

Cross-board targeting is where `targetPNum` enters the move request bodies for `jack`, `scuttle`,
`one-off` and the `seven-*` equivalents, defaulting to the sole opponent at two players. Deferred
from 1c deliberately: it has no observable effect at two players. It writes into the
`oneOffTargetPNum` slot that 1c already established, so 1c is its only prerequisite.

**Self-targeting must be explicitly rejected.** Today it is impossible *by construction* —
`one-off/validate.js:42` scopes the lookup to `opponent`, and `find-target-card.js` takes a single
player, so there is no way to express it. Once `targetPNum` exists a player can request their own
pNum, so a shared validation must reject it. This covers the Two, the Jack and scuttles as well as
the Nine, all of which are opponent-scoped by construction today.

> A future 2v2 variant would invert this: its rule 4 explicitly permits stealing a point card from
> yourself to hand to your partner. That makes self-targeting a `ruleSet` flag rather than a fixed
> rule — but do not add the flag until that variant is real; just keep the check in one place.

Counter priority needs a new `passedPriority` column (`pNum[]`, jsonb, defaults `[]`), cleared
whenever a two is played. Current holder = first player clockwise from `lastStackPlayer + 1` not
in `passedPriority`; if none remain, the one-off resolves. This also reproduces two-player
behavior exactly, so `your-turn-to-counter.js` can be reimplemented on it with no behavior change.

COUNTERING then has three outcomes where it had two. Add an explicit `DECLINE_COUNTER` MoveType
rather than overloading `resolve` with server-side inference — the log is player-facing and replay
re-renders it. Fizzle parity (`twos.length % 2 === 1`) is unaffected at any player count.

**Phase 4 — client.** Seat-based board component; `opponents[]` in the store; seat-scoped
`data-cy` contract leaving the existing two-player selectors untouched; player picker in the
jack / two / nine / four target dialogs.

**Scoped down for the first user-facing release (decided):**

- **Simplified game-over dialog — no rematch, Go Home only.** This deliberately sidesteps the
  most two-player-coupled client code: `GameOverDialog.vue:195-219` reconciles against
  `currentMatch?.games[0].p0` to pick `p1-wins-heading`/`p2-wins-heading`,
  `gameOver/composables/playerData.js:17-21` keys off `ORIGINAL_P0`/`ORIGINAL_P1`, line 297 gates
  on `p0Rematch && p1Rematch`, and `MatchScoreCounter`/`MatchStatusBanner`/
  `MatchWonOrLostIndicator` are all match-shaped. None of it is needed to ship the mode.
- **Go Home in the game menu.** `GameMenu.vue:22-43` already branches: spectators get a Go Home
  item (`mdi-home`, `data-cy="stop-spectating"`, key `game.menus.gameMenu.home`), players get the
  Concede/Stalemate `v-else`. Cutthroat allows neither, so the condition becomes
  `isSpectating || !canConcede`. The i18n key already exists in every locale, so there is no
  translation work. The handler needs a player variant: `stopSpectate()` calls
  `gameStore.requestSpectateLeave()` first, which a player must not; theirs is a plain
  `$router.push('/')`.
- **Required by the above, not deferrable:** `find-current-games-for-user.js:45` derives the
  opponent by alternation (sweep category C5). Go Home is only an exit if the player can get back,
  so the home-page current-games list must render three-player games in the first release. `owner` reaches the client for free via
`create-socket-events`, and is needed to attribute jacks per player — `GameView.vue:240` currently
hardcodes `controlled-by="opponent"`, which is meaningless with two opponents.

**Phase 5 — jokers**, if in scope, as an independent `ruleVariants` flag. Larger than it looks:
`convertIdToCard` requires exactly 2 characters and `suit` is 0–3 / `rank` 1–13, so two
distinguishable jokers need an id scheme and every rank/suit switch audited. "Steal target Royal"
is a new MoveType with its own questions (does a Queen stop it? can you steal a Queen? stealing a
King shifts both players' win thresholds mid-turn). Plus card art.

---

## Pending items

**All rules questions are resolved** -- see the settled-decisions table. One non-rules item
remains outstanding:

1. **Rematch series name format.** `${p0.username} VS ${p1.username} ${w}-${l}-${s}` has no
   obvious three-player form (Phase 2, rematch note). Deferred with rematch itself, which lands
   after the first user-facing release, so this is not needed to ship.

### A recurring pattern worth carrying into the issues

Three separate findings in this plan share one shape: **something prevented by construction
becomes expressible, and must then be explicitly forbidden.** Buried jacks (parity made them
unreachable), self-targeting (`find-target-card.js` takes a single player), and `twos` ownership
(alternation made it unambiguous). When implementing 1a and Phase 3, enumerate what the new
representation makes *possible* and decide which of those stay impossible, rather than discovering
them as bugs.

---

## Appendix: two-player assumption sweep

Exhaustive grep over `api/` and `src/` for the signature **a value that resolves to *a player*
(rather than to a turn) via two-player alternation** — `playedBy ? p0 : p1`, `(x + 1) % 2`,
`% 2`. Run before implementing 1a/1c so no further instances surface mid-change.

### Benign — no action beyond 1e

- **`players[pNum]` lookup.** `const player = playedBy ? result.p1 : result.p0` and friends, ~25
  sites across `moves/*/{validate,execute}.js`, plus `check-game-state-for-win{,-sync}.js:23/29`.
  These index a *known* pNum; they are not alternation. Under 1e they become `players[playedBy]`.
- **Turn arithmetic.** `get-active-player-p-num.js:26,35,39`,
  `discard-to-hand-limit/validate.js:41`, `resolve/execute.js:57`, `src/stores/game.js:195`, and
  the ~20 `turn % 2 !== playedBy` guards. These resolve to *whose turn*, and become
  `% playerCount` via the variant's `activePlayer`.
- **`resolve/execute.js:41`** — `twos.length % 2 === 1` for fizzle. Pure stack parity, correct at
  any player count. Confirmed benign.

### The bug class — a player identity derived from alternation

**C1 — "the target's owner" (12 sites). All resolved by one item:** `targetPNum`, deferred to
Phase 3. Not twelve separate problems.

`one-off/{validate:42,execute:43}`, `seven-one-off/{validate:42,execute:43}`,
`jack/{validate:41,execute:44}`, `seven-jack/{validate:43,execute:44}`,
`scuttle/{validate:41,execute:42}`, `seven-scuttle/{validate:43,execute:41}`.

**C2 — "the one-off's victim". Resolved by `oneOffTargetPNum` (1c).**
`resolve/four.js:29`, `resolve/nine.js:24-25`, `resolve/two.js:25-26`,
`discard-four/execute.js:42`, `create-socket-events.js:62`.

**C3 — "the stack-top owner". Resolved by `twos` ownership (1a) + caster-from-turn (1c).**
`counter/validate.js:61`. The sweep confirms this is the **only** instance of this sub-class.

**C4 — "all opponents" — needs iteration, not a different single pick.**

- `resolve/six.js:19,37-38` (pairwise swap) and `resolve/ace.js:23-24` (wipes `p0`/`p1`
  explicitly) — already covered by 1b.
- **`seven-discard/validate.js:69-73` — NEW.** A revealed double-jack may only be discarded when
  the jacks are unplayable, tested as *the opponent has a Queen or has no points*. At three
  players this must hold against **every** opponent: `opponents.every(o => hasQueen(o) ||
  !o.points.length)`. This is a semantic generalization, not a lookup swap — the only site in the
  sweep where the *rule* changes shape rather than the player reference.

**C5 — presentation. Phase 4 or later; no correctness impact at two players.**

- **`get-log.js:31` — NEW.** Indexes `game` by a template-literal `p<n>` key built from
  `(row.playedBy + 1) % 2`, naming "the opponent" in log text. At three players log lines need the actual target player. Note this file
  already branches on `rulesVersion` (line 124), so it is an established place for
  variant-dependent rendering.
- `find-current-games-for-user.js:45`; `src/stores/game.js:175,183,204,211,420`;
  `MatchGameSelector.vue:69`; `GameOverDialog.vue:195-219`;
  `gameOver/composables/playerData.js:17-21`; `ProfileView.vue:76,84`; `LobbyView.vue:128`;
  `GameOverlays.vue:194`.

**C6 — AI. Out of scope (see Architecture decisions).**
`minimax/score-game-state.js:58,59,63`, `minimax/get-minimax-score.js:60`,
`ai/get-move-bodies-for-move-type.js:42`, `ai/create-vs-ai.js:27`.

**C7 — parity encodings already covered.** `convert-card-to-str.js:18` (1a),
`resolve/six.js:29` (1b), `your-turn-to-counter.js:25` with `src/stores/game.js:220,225`
(Phase 3 counter priority).

### Outcome

No fourth instance of C3 exists, and C1 collapses to a single deferred item. The sweep's net new
work is two sites: `seven-discard/validate.js` (C4, a rule-shape change) and `get-log.js` (C5).
