# Three-Player Cuttle (Cutthroat): Architecture & Phase 1 Spec

**Scope of this document:** the architecture decisions for supporting a 1v1v1 "Cutthroat"
variant, and a fully specified Phase 1. Phase 1 contains *no three-player behavior*. It is
groundwork that ships against two-player rules, gated by the existing test suite, and is
independently valuable because it fixes two latent correctness bugs.

Variant rules as written live in `src/translations/en.json` under `rules.3Players`.

- [Settled rules decisions](#settled-rules-decisions)
- [Stacks and jokers](#stacks-and-jokers)
- [Architecture decisions](#architecture-decisions)
- [Verification strategy](#verification-strategy)
- [Phase 1 — two-player-safe groundwork](#phase-1--two-player-safe-groundwork)
- [Phases 2–4 — outline](#phases-24--outline)
- [Pending items](#pending-items)

---

## Settled rules decisions

Decided in design discussion; not all are derivable from `en.json`.

| Topic | Decision |
|---|---|
| Glasses eight | Audience is **open**: either every other player's hand is revealed to all players, or only to the glasses' controller. Decide during Phase 1, before 1e is written — see [Pending items](#pending-items). Either way, revealed cards persist until they leave the hand, as under 5.0.0, and both options are identical at two players. |
| Four's reveal | **Public** -- every player sees the cards a four's victim reveals. |
| Empty-deck reveal | **Not revealed** in cutthroat. At two players the reveal is a convenience for information you could already deduce -- every card not on the field, in the scrap or in your hand must be in your opponent's. At three players only the *union* of the two opponents' hands is deducible, not the split, so revealing would add information the game never earned. Two-player behaviour is unchanged. |
| Hidden information | The four's and the seven's reveals are public. If glasses are public too, cutthroat has **no private knowledge** and revealed state stays one global `revealedCards` set; if glasses go private, they become the **only** source of private knowledge. The guiding distinction: reveals that are deliberate card effects carry over to three players; reveals that are conveniences for deducible information carry over only if the deduction does. |
| Counter priority | Clockwise (ascending pNum) from whoever last added to the stack. p0 casts → p1 may counter → if p1 declines, p2 may counter → if p2 counters, p0 may counter that, then p1, etc. Declines are cleared each time the stack grows. |
| Stalemate | All three players passing consecutively (one full round). |
| Concede | **Not allowed** in cutthroat. |
| Stalemate request | **Not allowed** in cutthroat. |
| Win thresholds | 14 points / 9 with one King / 5 with two Kings / 0 with three Kings. |
| Hand limit | 7 (vs 8 in two-player). |
| Deal | 5 cards each; dealer rotates per game; play starts left of the dealer. **Confirmed intentional** -- unlike two-player's 5/6, later players get no extra card, since acting later in a 1v1v1 carries its own advantage. |
| Jokers | **In scope at launch**, for balance: the lower win thresholds put a player in check after a single King, and jokers add answers to Royals. Two jokers, ids `XR`/`XB`, rank 14. Cutthroat's rule set turns them on; the `ruleVariants` flag is kept for a future 2v2 variant but not exposed as a toggle. See [Stacks and jokers](#stacks-and-jokers). |
| Buried stealers | Only the **top** stealer of a stack (jack or joker) may be targeted, by anything. This keeps the existing top-jack-only rule and extends it to jokers. After 1a it is no longer required by the representation, so it stands as a deliberate rule. |
| Targeting scope | `targetPNum` must be an **opponent, never yourself**. The Nine may hit any opponent's card. Applies equally to the Two, the Jack, the Joker and scuttles. |
| Seven reveals | The top two cards are revealed to **every** player, not just the caster. |
| Rematch agreement | **Unanimous** -- all N players must accept. Generalizes `p0Rematch && p1Rematch`. |
| Rematch series name | Players in **first-game seating order**, then each player's wins in that same order, then stalemates: `A VS B VS C 0-2-1-1` means A has 0 wins, B 2, C 1, with 1 stalemate. This is the current two-player name generalized, so two-player names are unchanged. |
| Leaving a game | A **Go Home** menu item replaces Concede/Stalemate in variants that disallow them. Plain navigation: the game persists and the player may return. |
| Queen protection | A Queen protects her owner's board against **every** opponent's targeting effects -- Twos (both effects), Nines, Jacks, and Jokers. Not caster-scoped. |
| Rematch / dealer rotation | **Seat rotation**, generalizing the existing two-player swap: `newSeats = [...seats.slice(1), seats[0]]`. Since p0 always starts, rotating by one advances the starter clockwise each game. No `firstPlayerPNum` column. |

## Stacks and jokers

Settled. Jokers are "Royals with the effect *steal target Royal*", and the attachment model is
chosen so that **stacks never nest**: jacks and jokers are both *stealers* attached to the card
being controlled.

- **A stack is a base card plus an ordered list of stealers**, bottom to top.
- **Bases** are point cards (in `points`) and Royals in `faceCards`: Kings, Queens and Glasses
  eights.
- **Stealers are never bases.** A jack always sits on a point card; a joker always sits on whatever
  it stole. A joker played on a jack or on another joker attaches to *that stealer's base*. So if
  p1 jacks p0's Ten of Hearts and p0 jokers that jack, p0 has stolen the Ten back:
  `TH-p0(JH)` in `p1Points` becomes `TH-p0(JH-p1,XR)` in `p0Points`. (The top stealer carries no
  suffix: its owner is the controller, which the column already says. See 1a.)
- **Control** is the owner of the top stealer, or the base's own owner when there is none. The base
  sits in its controller's array.
- **A jack** steals a point card, including one whose stack already ends in a joker.
- **A joker** must target a Royal: a Royal base, or the top stealer of any stack. An *unstolen*
  point card cannot be jokered, since it is not a Royal and carries nothing Royal. An eight played
  as points can be jacked but not jokered; an eight played as glasses is a Royal base.
- **Ids `XR` and `XB`, rank 14.** Two characters, so they pass the existing length check; `X` is
  not a rank letter and `R`/`B` are not suit letters. Rank 14 is deliberate: the points, scuttle,
  face-card, one-off and jack validators all reject it (`rank > 10`, `rank >= 11`, the `[8, 12, 13]`
  whitelist, the one-off `switch` default, `rank !== 11`), so a joker cannot be played as anything
  else. A rank of 0 would pass the point checks. The exception is the counter validator, which
  checks no rank at all — see [Found along the way](#found-along-the-way).

Interactions (all confirmed):

1. **Two on a stack.** Targeting the top stealer scraps it, and control drops to the next stealer
   down, or to the base's owner. Targeting a Royal base (a stolen King) scraps the King and its
   whole stack. Both are legal and have different outcomes.
2. **Nine on a stack.** The top stealer goes on top of the deck and control drops a level. A Royal
   base goes on top of the deck and its stealers are scrapped, as `nine.js` already does for point
   and face-card targets.
3. **Top-only targeting.** Only the top stealer can be targeted, by anything. For a joker this costs
   nothing, since targeting any stealer in a stack would attach it to the same base.
4. **Six.** It scraps every Royal, including jacks and jokers. Every face-card stack goes to the
   scrap whole; every point stack loses its stealers and returns to `players[card.owner]`.
5. **Ace.** It scraps all point cards along with their stealers, jokers included. Face-card stacks
   are unaffected.
6. **Queens.** The graded rule applies to jokers as to jacks: with one Queen, only she can be
   targeted; with two, nothing on that board can. A lone Queen can be jokered, and once stolen she
   protects the thief.
7. **Kings.** A stolen King counts toward the thief's threshold and comes off the victim's. The win
   check runs after the move, so jokering a King can win on the spot.
8. **Glasses.** Revealing follows the array a card sits in, so stealing glasses shifts the reveal
   automatically; already-revealed cards stay revealed. Who sees what depends on the open glasses
   audience decision.
9. **No counter window.** Playing a joker is a Royal play like a jack, not a one-off, so Twos cannot
   counter it.
10. **Sevens.** A revealed joker needs a new `sevenJoker` move, and `seven-discard`'s "both jacks are
    unplayable" condition becomes "neither revealed card can legally be played".

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
  a variant disallow-list (`disallowedMoveTypes`), not a fork.
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
  deal: [ 5, 5, 5 ],
  jokers: true,
  deckIds: [ /* 54: the standard 52 plus XR and XB */ ],
  disallowedMoveTypes: [ 'concede', 'stalemateRequest', 'stalemateAccept', 'stalemateReject' ],
  revealHandsOnEmptyDeck: false, // true at two players -- see settled decisions
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

**The rule set is pure data.** Keep behaviour in free functions that *take* the rule set --
`activePlayer(state, ruleSet)` rather than `ruleSet.activePlayer(state)` -- so it stays
serializable, loggable and diffable, which matters for the analysis use case behind the 6.0.0
bump.

**Delivery: taken from the game, and passed alongside the state rather than on it.** The game is
the source of truth: `Game.playerCount` and `Game.ruleVariants`, frozen at creation. Every caller
that unpacks a state holds the game — `move.js`, `ai/ai-move.js`, `get-game.js`,
`spectate/join.js` and `load-fixture-gamestate.js` — and so do the helpers that already take a
`game` input, `createSocketEvents`, `publishGameState`, `checkGameStateForWin` and `dealCards`,
which resolve it there.

The move helpers are the one layer without the game: `validate` and `execute` receive only
`currentState`, `requestedMove`, `playedBy` and `priorStates`. The rule set crosses that boundary
the way `priorStates` already does — `move.js:52` and `:57` pass `game.gameStates` to every
`validate` and `execute` — as one more argument resolved from the game. `updateRevealedCards` and
`checkGameStateForWinSync` take it as an argument too, and every other caller of the move helpers,
including the AI's search for legal moves, must pass it.

It is **not** attached to the state. The state passes through two fixed field lists, in
`validateGamestate` and in pack, and config riding on it can be silently dropped by either: review
caught exactly that, since unpack's last step is `validateGamestate`, which rebuilds the state from
a fixed list. Keeping config off the state also keeps the standing rule for new state fields (see
[Pending items](#standing-rule-every-new-gamestate-field-goes-through-unpack-validation-and-pack))
about state only.

**The argument is optional, with a guard.** Existing callers and specs pass four arguments, e.g.
`moves.resolve.validate(state, resolveMove, 1, [])`, so an omitted rule set defaults to the
standard two-player rules. To stop a forgotten argument from silently applying two-player rules to
a three-player game, a helper throws when the state's player count disagrees with the rule set's.

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
| 1 | **1a-read**, **1e** (parallel) | Both independent. Together they unblock everything else. |
| 2 | **1b**, **1c** | Need 1a-read; need 1e to be provable. |
| 3 | **1d**, **1f** | Independent throughout; cleaner after 1e. |
| 4 | **1a-write** | Any time after 1a-read; must land before Phase 2 opens a third seat. Carries the archive sweep and the 6.0.0 bump. |

The glasses audience decision should be made before 1e is written (see Pending items).

---

## Phase 1 — two-player-safe groundwork

Every item ships against two-player rules with the existing suite as the regression gate.
Items **1a–1c** are specified in full. **1d–1f** are specified to issue granularity.

### 1a. Make stack ownership authoritative in the storage format

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

This blocks 1b entirely. Jokers widen it: face cards can now carry stacks too (see
[Stacks and jokers](#stacks-and-jokers)), and those stacks mix jacks and jokers.

1a ships as **two changes, 1a-read and 1a-write**, so that it can be rolled back at every step —
see [Delivery](#delivery-1a-read-then-1a-write).

**Also note:** `pack-gamestate.js:61-65` passes `attribute.player` — the *column* — into
`convertCardToStr` under a comment reading "the cards owner is needed". The column is the
**controller**, not the owner. The existing code already conflates the two.

#### Target format

```
cardStr    := cardId [ "-" pNum ] [ "(" attachment { "," attachment } ")" ]
attachment := cardId [ "-" pNum ]        ; the writer omits the suffix on the last attachment only
cardId     := rank suit                  ; exactly 2 characters, including XR and XB
pNum       := "p" digit
```

**"Column" means a per-player column** — `pXHand`, `pXPoints`, `pXFaceCards` — whose name says
which player holds or controls the cards in it. The shared columns (`deck`, `scrap`, `twos`, and
the snapshot slots such as `targetCard` and `oneOffTarget`) say nothing about a player.

- The host card's `-pNum` is the base's **original owner** — the player who played it to the field.
  Bases live in `pXPoints` or `pXFaceCards`.
- Each attachment's `-pNum` is **that stealer's owner** — the player who played that jack or joker —
  **except the top attachment's**, which the writer omits. The top stealer's owner is the
  controller, and a stack sits in its controller's column, so the suffix would only repeat it.
- In general a suffix is written **whenever the owner is not recoverable from the column**:
  - unstacked card in a per-player column -> owner == column -> **omit**, which keeps the
    overwhelming majority of card strings byte-identical to today;
  - stacked card -> **write** the base's suffix and every stealer's except the top one's;
  - card in `twos` -> no per-player column at all -> **always write** (e.g. `2H-p2`);
  - unstacked card in the deck, the scrap or another shared slot -> **nothing written**; no owner
    is needed there.

That is the minimum: n suffixes for n stealers, the base's plus all but the top stealer's. It is
also exactly the count the legacy format writes — legacy is this scheme with every suffix sitting
one card too high (see [Reading legacy rows](#reading-legacy-rows)).

Examples: `TH-p0(JH-p2,JC)` in `p1Points` — p0 played the Ten of Hearts, p2 jacked it, then p1
jacked it; controller p1 (the column), original owner p0. `KH-p0(XR)` in `p1FaceCards` — p0's King,
held by p1's joker.

**A stacked card in a snapshot slot** such as `targetCard` is written the same way. Its top
stealer's owner cannot be recovered there, since the slot names no player — but nothing reads
attachments or owners from snapshot slots, so it is simply left null.

**The legacy grammar is a strict subset of this one.** No legacy row contains a face-card stack or
a joker, so extending the grammar now changes nothing for stored rows — and accepting all of it in
1a-read means the storage format changes exactly once.

#### Reading legacy rows

The format is **self-discriminating per card string** — no version field is consulted anywhere.
The signal differs by column, because the suffix rule does:

| Column | Legacy signal | Why unambiguous |
|---|---|---|
| `pXPoints`, card has attachments | no host suffix | the new format always writes one on a stacked card, and pack throws rather than omitting it. A bare last attachment is a second signal: legacy suffixes every attachment |
| `pXHand` / `pXPoints` / `pXFaceCards`, card unstacked | n/a | neither format writes a suffix, and owner == column either way, so misclassification is harmless |
| `pXFaceCards`, card has attachments | n/a | only the new format can produce a face-card stack |
| snapshot slots (`targetCard`, `oneOffTarget`) | n/a — never reconstructed | informational only: nothing reads attachments or owners from them, so a legacy snapshot simply unpacks with null owners. The pack guard does not apply to them |
| `twos` | no suffix on any entry | the new format always writes one here; legacy owners reconstruct by alternation from the caster, `twos[i].owner = (caster + i + 1) % 2` |

This is per-row rather than per-game, which matters given the deploy sweep cannot be atomic (see
the deploy note): a game can legitimately hold rows written on either side of the release.

> **Decoding is structural; `rulesVersion` records the change for analysis.** Two separate jobs:
>
> - **Parsing** never consults a version. `unpackGamestate` receives a `GameStateRow`, not a
>   `Game`, so version-gated decoding would mean threading game metadata into the parser, against
>   the context-free direction settled above. Structural detection is also self-checking: a bad
>   migration cannot corrupt decoding.
> - **Analysis** uses `rulesVersion`, bumped to **6.0.0** when 1a-write ships, with a
>   `VERSION HISTORY` entry in `utils/rulesVersion.js` recording that it is a storage-encoding
>   change with no change to legal play. Recovering the encoding from a jsonb regex over `pXPoints` is a
>   poor query experience, and a distinction never recorded cannot be retrofitted; collapsing two
>   versions later is trivial by comparison.
>
> **Major: 6.0.0** (decided in review). No legal play changes, but the change is not
> backwards-compatible: rows written after 1a-write cannot be read by code from before 1a-read.
> A major bump marks that boundary for anyone analyzing or replaying games. The only code that
> compares `rulesVersion`, `parseInt(game.rulesVersion, 10) === 3` at `get-log.js:124`, is
> unaffected. Deploy safety is a separate concern, handled by splitting 1a into a read change and a
> write change so that each step can be reverted.
>
> **A few straddling games are expected and acceptable.** Merges deploy automatically and
> immediately, so there is no window to coordinate: the procedure is simply *sweep, then merge*
> (see 1a-write's merge checklist). Games created between the sweep and the deploy finishing will hold
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
owner: pNum | null   // the player this card belongs to; null in the deck and the scrap
```

For a card in a hand, that is its holder. For a card on the field, it is the player who played it
there: a base's original owner, or a stealer's controller. Control stops being stored and becomes a
derivation:

```js
const controllerOf = (base) => base.attachments.at(-1)?.owner ?? base.owner;
```

**Do not add a separate `controller` field.** A stealer *is* a card, so `Card` would then carry two
fields each meaningful in only one nesting position — reintroducing exactly the position-dependent
meaning that caused this bug.

**The `twos` stack carries `owner` too.** `twos` is a bare `Array<Card>` serialized through the
generic path in `pack-gamestate.js`, so nothing records who played each counter. At two players the
owners are derivable by alternation from the caster; at three they are not -- the same failure as
jack ownership, in a different column. A counter Two arrives from its player's hand already
carrying its owner (see below), and pack writes it per the rule above. Audited against the other
card-bearing fields: `deck` and
`scrap` need no owner, `oneOff`'s caster is derivable from `turn` (1c), and
`oneOffTarget`/`fourRevealedCards` are covered by `oneOffTargetPNum` (1c). `twos` is the only
remaining gap.

**Hand cards carry `owner` too, filled in from their column by unpack.** Every move that puts a
card on the field from a hand — points, Royals, jacks, jokers, counters — takes it from the
player's *own* hand, so the card brings its owner with it and the move need not set it. An earlier
draft left hand cards ownerless on the grounds that the value only repeats the column; but the play
moves are its consumer, and leaving it null made every freshly played card ownerless until the
next unpack, which review caught as a validation failure. The deck and the scrap stay ownerless:
nothing reads an owner there.

#### Lifecycle

**Owners come from position, not from moves.** Unpack fills them in for every card in a hand or
on the field — from the column, or from suffixes where the column cannot tell — and so does
`saveGamestate`, before it validates, through the same shared helper. Pack writes
them only where the column cannot recover them. So moves never clear `owner`. A card that leaves a
hand for the deck or the scrap mid-move may carry a stale owner in memory for the rest of that
move, but nothing reads an owner there and pack writes none, so it is gone after the next unpack.
Re-entry needs nothing special: a card a Three takes from the scrap is filled in as its new
holder's at the next unpack.

Moves set `owner` in one case only: **the Seven moves that play from the deck** — `seven-points`,
`seven-face-card`, `seven-jack` and, with jokers, `sevenJoker`. Those cards reach the field without
passing through a hand, so there is no owner to inherit. Everything else is hydrated by unpack and
carried through `_.cloneDeep` by `execute`.

The invariant covers cards on the field only. `validate-gamestate.js` checks it on the in-memory
state, which `save-gamestate.js:18-20` validates *before* packing:

- every base has an `owner`;
- an unstacked base's owner equals its column;
- every stealer has an `owner`, and the top stealer's equals its base's column.

Review caught that an earlier blanket check would have rejected every ordinary points move,
because freshly played cards then had a null owner. Filling in hand owners removes that null, so
the strict check holds.

#### Pack decides which suffixes to write, and refuses to write legacy

**The serializer cannot decide on its own whether a suffix is needed.** An unstacked Two in
`p0Points` and a counter Two in `twos` are identical in memory — `owner: 0`, no attachments — yet
only the second must carry a suffix. Review caught this; an earlier draft of this spec made
`convertCardToStr` responsible for the choice and said to delete pack's points branch. Instead:

- `convertCardToStr` writes a base suffix **whenever the base's `owner` is set**, and a suffix on
  every attachment **except the last**. Omitting the top stealer's suffix is structural — it needs
  no column — so the serializer stays context-free.
- `packGamestate`, the only layer that knows the column, makes the column-dependent choice: it
  removes `owner` from every unstacked card outside `twos` — in hands, points, face cards, the
  deck, the scrap and the other card slots — since there it is either derivable or unused. Stacked
  cards and every card in `twos` pass through as they are.

This is consistent with the organizing principle — context lives at the pack/unpack boundary — and
it corrects where the line was drawn, not the principle.

Once pack reads `card.owner`, a stacked card whose base has a null owner would serialize as
`TH(JH-p2,JC)` — no host suffix — which the reader then classifies as *legacy* and reconstructs by
parity. At two players parity yields the right answer, so it passes silently; at three it is
silently wrong.

**`packGamestate` must throw** when a stacked card in a per-player column, or a card in `twos`,
lacks a required owner: the base's, or any stealer's but the top one's. Legacy is a read-only
format; nothing may ever write it. The check lives in pack rather than the serializer because it
depends on the slot. **Snapshot slots are exempt**: they are informational, and a legacy snapshot
unpacks with null owners. Without the exemption, a game paused mid-countering on a Nine aimed at a
stacked point card would hold a legacy `oneOffTarget` such as `TH(JH-p0)`, and the next counter move
would throw when it re-packed it.

**Hand-built states are filled in before the check.** Two paths save raw states that no unpack has
touched: `load-fixture-gamestate.js:83-84`, behind the `loadGameFixture` command used by 28 e2e
specs, and `game-state.spec.js`, which saves states built from `Card.*` constants (lines 19, 54,
88). Their cards carry no `owner`, so the field check would reject even a plain point card. Review
caught this. Both go through `saveGamestate`, so it fills owners from position before validating,
with the same helper unpack uses: from the column for unstacked cards, and by parity
reconstruction for a two-player stack without owners. Existing fixtures, including jacked point
cards, keep working unchanged. A three-player fixture must supply its stealers' owners explicitly,
since parity cannot recover them, and the check throws if they are missing. For states produced by
moves, which arrive with owners already filled in, it is a no-op.

#### Changes

Each change is tagged with the half it ships in.

- **(write)** `api/helpers/game-states/convert-card-to-str.js` — write a base suffix whenever the
  base's `owner` is set, and a suffix on every attachment but the last; drop the `playedBy`
  parameter (the serializer becomes context-free); `validateCardId` must accept the suffix and the
  joker ids.
- **(read)** `api/helpers/game-states/convert-str-to-card.js` — **both edits are driven by the new format;
  the legacy path through this file is behaviourally unchanged.** `mainCardId` at line 113 strips
  parens and will now retain `-pN`, which `convertIdToCard` rejects (it requires exactly 2
  characters) — split the suffix off. Retain `content[1]` on attachments at line 128 instead of
  discarding it. Legacy strings yield a bare `TH` at line 113 and carry misaligned attachment
  suffixes that must continue to be ignored, so neither edit touches them. The parser stays
  **context-free**, mirroring `convertCardToStr` — it never receives a column. Extend the rank and
  suit maps so `XR`/`XB` parse (rank 14; suits outside 0–3), even though no game contains them yet.
  An attachment suffix is optional: accept one on the top attachment too, and leave the owner null
  when it is absent.
- **(read)** `api/helpers/game-states/unpack-gamestate.js` — owns all column-dependent hydration,
  using the pNum already in scope from the name list at lines 30-35. Per card in `pXHand`,
  `pXPoints` and `pXFaceCards`: if `owner` is set (new format) leave it; if absent and the card has
  attachments, apply the legacy parity reconstruction; if absent and unstacked, set `owner = X`.
  For a new-format stack, set the top stealer's owner to `X`, and if a suffix was present, check it
  equals `X`. For `twos` without suffixes, reconstruct owners by alternation from the caster.
  Snapshot slots are left as parsed. Put this owner-filling in one shared helper.
- **(read)** `api/helpers/game-states/save-gamestate.js` — call the same helper before
  `validateGamestate`, so hand-built states from the fixture loader and the unit specs are filled
  in before the check. Reconstruct ownerless stacks by parity only for two-player states.
- **(write)** `api/helpers/game-states/pack-gamestate.js` — the points-specific branch at lines 61-69
  **stays**, but its job changes: instead of passing the column into the serializer to compute
  parity, it removes `owner` from every unstacked card outside `twos` and passes stacked cards and
  `twos` through. It also throws per above, for per-player columns and `twos` only.
- **(read)** `seven-points`, `seven-face-card` and `seven-jack` execute helpers (and `sevenJoker`
  when jokers land) — set `owner` on the card played from the deck. Harmless under the legacy
  writer, which ignores it.
- **(read)** `api/helpers/game-states/validate-gamestate.js` — assert the invariant from
  [Lifecycle](#lifecycle) for every card on the field.
- **(write)** `utils/rulesVersion.js` — bump `CURRENT_RULES_VERSION` to `6.0.0` and add a `VERSION HISTORY`
  entry recording a storage-encoding change with no change to legal play. Major, per the rationale
  in [Reading legacy rows](#reading-legacy-rows).
- **(read)** `api/helpers/game-states/moves/one-off/validate.js:88-90` and `is-top-jack.js`'s
  `extendedDescription` — both justify the top-jack restriction *by the parity representation*,
  which this item removes. Reword to state it as a rule, or a later contributor will read the
  check as dead code and delete it. The restriction itself is kept -- see the
  settled-decisions table.
- **(read)** `api/models/GameStateRow.js:14-16`, `docs/game-state-api.md:145` — correct the format
  documentation (currently inverted) and state the grammar formally in one place.
- **(read)** `docs/game-state-api.md:117` — the `p0Hand: ['8D(JS-p0,...)']` example shows a stacked card in
  a *hand*, which cannot occur. Remove.

#### Delivery: 1a-read, then 1a-write

**The rollback hazard.** The current reader strips the parentheses, so `TH-p0(...)` becomes
`TH-p0`, which fails the two-character check at `convert-str-to-card.js:42` and throws; a suffixed
Two in `twos` fails the same way. Because merges deploy immediately, reverting a combined 1a after
any new-format row was written would break every game holding a stack or a pending counter.
Review raised this. Splitting the change makes every step reversible:

- **1a-read** teaches the reader the whole new grammar — suffixed bases, face-card stacks, joker
  ids, suffixed Twos, top stealers with or without a suffix — fills in `owner` for hands and the
  field, sets it in the Seven moves, and adds the invariant. The writer is untouched and keeps emitting legacy strings. Reverting it is safe: no
  new-format row exists yet.
- **1a-write** switches the writer: the serializer reads `owner`, pack chooses suffixes by column,
  the guard throws, and `rulesVersion` goes to 6.0.0. Reverting it is safe: 1a-read stays deployed
  and still parses whatever 1a-write wrote.

1a-write can land any time after 1a-read, and must land before Phase 2 opens a third seat — until
then the legacy writer's parity output is exact. The archive sweep and the merge checklist belong
to 1a-write, since that is when the encoding changes.

#### Acceptance criteria

- Full existing unit + e2e suite passes unchanged, after each half.
- **(read)** Existing hand-built states save unchanged — the e2e fixture loader's and
  `game-state.spec.js`'s, including jacked point cards — while a three-player fixture with an
  ownerless stealer is rejected.
- **(read)** 1a-read parses every new-format shape — a stacked point card, a stacked face card,
  joker ids, suffixed Twos, a top stealer with or without a suffix — though nothing writes them yet.
  This is what makes reverting 1a-write safe.
- **(read)** A hand card unpacks with `owner` equal to its column, and a card played from the hand
  reaches the field with that owner, so an ordinary points move passes the invariant.
- **(read)** A stored legacy row hydrates to the same object a newly written row would, for all of
  n = 1, 2, 3 attachments, both columns.
- **(read)** Replay of a pre-change game renders identically.
- **(write)** Round-trip: unstacked point card → `"TH"` → unpacks with `owner` = column.
- **(write)** Round-trip: `TH-p0(JH-p2,JC)` in `p1Points` and `KH-p0(XR)` in `p1FaceCards` →
  identical objects both directions.
- **(write)** An unstacked Two in `p0Points` serializes as `2H`; a Two in `twos` as `2H-p0`. Cards in
  hands, the deck and the scrap serialize with no suffix, even when they carry an owner in memory.
- **(write)** Pack throws on a stacked card in a per-player column whose base, or a stealer below the
  top, lacks an owner — and does not throw when re-packing a legacy snapshot in `oneOffTarget`.
- **(write)** **Migration continuity:** a game whose latest stored row is legacy format and contains a jacked
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

**Timing: this is a step on 1a-write's merge, not separate infrastructure.** Merges deploy
automatically and immediately, so there is no window to orchestrate. The procedure is:

1. Run the sweep at a time of minimal-to-zero usage.
2. Merge 1a-write promptly afterwards.

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

#### Merge checklist (1a-write)

Deploys are automatic and immediate on merge, so these are steps on 1a-write's PR rather than a
separate task. 1a-read needs none of them.

1. Run the archive sweep (see the deploy note) at minimal-to-zero usage.
2. Merge promptly afterwards.
3. Choose the package version label on its own merits. It is unrelated to the
   `CURRENT_RULES_VERSION` bump to 6.0.0 in this PR, which is the *rule-set* version. Two different
   version concepts; do not let one be inferred from the other in review.

**Depends on:** 1a-read on nothing — ship it first. 1a-write on 1a-read.

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
`resolve/two.js:29-65`, the Two's jack-target branch, has the same shape: it removes the jack and
pushes the point card to the caster.

**Change.**

- **Six: drop `scrapRoyalsAndSwapStolenPoints` entirely.** With `owner` stored, the Six is: scrap
  every stealer and every face card, then put each remaining point card in
  `players[card.owner].points`. No swap, no pairing, nothing to name. Review pointed out that an
  unstolen card should end up with its owner without any extra work, and with `owner` it does.
  This also covers joker-stolen Royals: they are Royals, so they are scrapped.
- **Nine and Two:** after removing the top stealer, the base moves to `controllerOf(base)` — the
  next stealer down, or its owner — instead of to the caster.

**Acceptance criteria:** existing suite passes (no-regression gate); object-level unit tests over
a **synthetic three-player** state prove the six returns a stolen card to its original owner, and
that the nine and the two revert control to the next stealer down.

> The three-player state is required, not a nicety. At two players parity and explicit ownership
> agree in *every* configuration — TH owned by p0 and jacked p1 -> p0 -> p1 gives `jackCount = 3`,
> odd, so parity returns it to "the other player" = p0, which is also what `owner` says. A
> two-player test therefore **cannot distinguish the fix from the bug**. Three distinct owners are
> the minimum that separates them. See [Verification strategy](#verification-strategy).

**Depends on:** 1a-read, and **1e** — `players[]` is what gives a synthetic third player a natural
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

**Legacy rows need a read rule.** 1c deploys separately from 1a-write's sweep, so a game paused
mid-countering, or awaiting a Four's reveal or discard (`oneOff` stays set through both phases),
will hold a row with `oneOff` set and `oneOffTargetPNum` null. Unpack fills it with the two-player
answer, the non-caster `(activePlayer(turn) + 1) % 2` — exact, because every legacy row is
two-player. Review caught this. See also the standing rule in
[Pending items](#standing-rule-every-new-gamestate-column-declares-a-legacy-read-rule).

No request-body change is needed — this item is fully implementable at two players with no API
surface. Letting the caster *choose* among several opponents is deliberately **not** part of this
item; see Phase 3.

**Also in scope: the counter-phase Queen check.** `counter/validate.js:61-65` resolves the
protecting player as `playedBy ? p0 : p1`. Queens block counters, and the relevant Queen belongs to
whoever played **the top of the stack** -- which at two players is always "the opponent" only
because counters strictly alternate. Under clockwise priority it is not: p0 casts, p1 declines, p2
counters, and when p0 counters back the check consults p1 rather than p2. Resolve it with one
function, `stackTopOwner(state)`: *the owner of the last Two in `twos`, or the caster
(`activePlayer(turn)`) when `twos` is empty*. Phase 3's counter priority uses the same function.
The first half depends on 1a-read attributing owners to the `twos` stack.

Note this check is blanket (any queen blocks) rather than graded like `one-off/validate.js`,
because the thing being countered is never itself a Queen, so the "may only target the queen
herself" exemption cannot apply. Keep it blanket.

**Acceptance criteria:** existing suite passes; no resolve helper references `playedBy` to
identify a victim or a caster; `oneOffTargetPNum` is populated on every state where `oneOff` is
non-null and cleared wherever `oneOffTarget` is; the counter Queen check resolves its player from
`stackTopOwner` rather than from `playedBy`; a test resumes a paused legacy one-off — in the
countering phase and in the Four's reveal phase — after 1c deploys, and resolves it against the
right victim.

**Depends on:** **1a-read**, for the `twos` ownership the counter-Queen check needs. The
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
- **Empty-deck reveal.** A new `revealHandsOnEmptyDeck` flag, true at two players and false for
  cutthroat. It is implemented in **two independent places**, and both must read it:
  `update-revealed-cards.js:68`, which adds every hand to `revealedCards`, and
  `create-socket-events.js:97-101`, where `hideOpponentHand` unhides every hand whenever
  `deckIsEmpty` — a live path that ignores `revealedCards` entirely. Gating only the first would
  still leak every hand at three players through the second. The client has no implementation of
  its own; it only renders the server's `isHidden` placeholders.

**The stalemate threshold is deliberately not extracted.** It is three passes in both variants
(review pointed out that nothing changes). The values coincide for different reasons — two-player's
rule is three consecutive passes, cutthroat's is one full round of three — so leave
`numPasses >= 3` at `check-game-state-for-win-sync.js:51` and the three-row window at
`create-socket-events.js:37-48` as they are. Add a comment saying why 3 holds for both, and warning
against rewriting it as `numPasses >= playerCount`, which would drop two-player stalemates to two
passes. Extract it only when a variant actually differs, such as a future 2v2.

**Acceptance criteria:** no literal win thresholds (`21`/`14`/`10`/`5`) remain in server or client
code; `HAND_LIMIT` is read from the resolved rule set rather than imported from
`GameConstants.json`; both empty-deck reveal sites read `revealHandsOnEmptyDeck`; `GameView.vue`
and `ScoreGoalToolTip.vue` derive their table from the same
source as `check-game-state-for-win-sync.js`; existing suite passes unchanged.

**Depends on:** 1e for the server side, since the move helpers read these values from the rule set
1e threads through to them; the client-side win table is independent. Note this spans server *and*
client, since the win table is duplicated in both — worth calling out in the issue so it is not
scoped as backend-only.

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

**Includes `update-revealed-cards.js`**, which the original sweep pattern missed (see the
appendix). It destructures `{ p0, p1 }` and cross-references by name: p0's glasses reveal p1's hand
and vice versa, `publicIds` reads `[ previousState.p0, previousState.p1 ]`, and the empty-deck branch
reveals both hands. Rewrite it to iterate players. For glasses, implement the audience decided in
[Pending items](#pending-items). Both candidate rules are byte-identical at two players, so if the
decision has not been made when 1e is written, implement the public version — each glasses holder
reveals every other player's hand into the shared set — and Phase 3 adapts it. The empty-deck
branch is different: it must be **gated** on `revealHandsOnEmptyDeck` (1d), not merely iterated,
since cutthroat does not reveal on an empty deck.

**Threads the rule set to the move helpers.** The active-player helper that replaces `turn % 2`
needs the player count, so every validator 1e rewrites gains the rule-set argument described in
[Composing orthogonal variants](#composing-orthogonal-variants); executes that read the hand limit
take it too. Doing it here costs almost nothing, since 1e already edits every one of those helpers.

**Converts `validateGamestate` to `players[]`.** It rebuilds the state from a fixed field list that
names `p0` and `p1` explicitly (`validatePlayerData(gameState.p0)`, `...p1`), so as written it would
drop `players[]` and, later, a third seat on every load and save.

**Acceptance criteria:** `GameState` exposes `players[]`; the ~25 `playedBy ? p1 : p0` lookup sites
(sweep category "benign") become `players[playedBy]`; no helper derives a player *identity* from
alternation except those explicitly deferred to Phase 3; stored column names are unchanged;
existing suite passes; **a synthetic three-entry `players` array can be passed to any move helper
without error** — this is what unblocks the 1b and 1c correctness tests; `update-revealed-cards.js`
iterates players; `validateGamestate` keeps every player; every move helper that reads a rule value
takes the rule set as an optional argument, defaulting to two-player rules and throwing on a
player-count mismatch; `move.js` and the AI's callers pass it, resolved from the game.

**Depends on:** nothing. **Ship early** — alongside 1a rather than after it. It is a pure
two-player-safe refactor, and it is the enabler for proving 1b and 1c at all.

---

### 1f. Generalize socket fan-out to N rooms

`publish-game-state.js` hard-codes three rooms and `create-socket-events.js` returns exactly
`{ p0State, p1State, spectatorState }`. Generalize to N+1. `join.js:51-62` hard-codes the p0→p1
seat ladder.

`broadcast-game-event.js:27-29` hard-codes the same three rooms for its pass-through events, so a
p2 room would silently miss them; it is in scope here too.

**The glasses rule does not live in this item.** `hideOpponentHand` (`create-socket-events.js:96-107`)
unhides hands for a glasses holder in their own payload, but that only covers *live* visibility for
the holder. Persistent reveals live in `update-revealed-cards.js`; see 1e. What happens to this
branch depends on the open glasses decision. If glasses are public, the holder-only unhide becomes
redundant — `move.js` publishes the state after `updateRevealedCards` runs — but stays consistent,
so leave it. If glasses are private, it is the live half of the private rule and stays load-bearing,
and marking revealed cards moves out of the shared pre-pass (lines 25-35) into each player's view.
Its `deckIsEmpty`
branch (lines 97-101) is **not** redundant and must not be left: it is a second, independent
implementation of the empty-deck reveal and must read `revealHandsOnEmptyDeck` (1d), or it unhides
every hand at three players even after `update-revealed-cards.js` is gated.

**Acceptance criteria:** `createSocketEvents` returns one state per player plus a spectator state,
derived from player count rather than a fixed `{ p0State, p1State, spectatorState }`;
`publishGameState` and `broadcastGameEvent` broadcast to N+1 rooms; `join.js` assigns seats by
iteration rather than the
p0 -> p1 ladder; `tests/unit/specs/sails/game-perspectives.spec.js`, which asserts room membership
and per-perspective visibility, passes unchanged. That spec is the natural regression gate here.

**Depends on:** nothing hard; cleaner after 1e.

---

## Phases 2–4 — outline

**Phase 2 — schema + lobby.** `Game.playerCount` / `ruleVariants` / `p2` / `p2Ready` /
`p2Rematch`; `GameStateRow.p2*` nullable, `playedBy` relaxed. Create / join / `isGameFull`
(currently `game.p0 && game.p1`) / ready-up for N seats. Both migrations additive.
`archive.js:26-28` checks membership against `[p0, p1]` only — p2 must be added, or the third
player cannot dismiss their own abandoned game.

**Seat enumeration — security-relevant.** Many controllers and helpers list the seats as `p0, p1`
(sweep category C8). Most fail **closed** when a third seat appears: `move.js:36-44` throws
"You are not a player in this game!" for an unlisted p2. Two fail **open**, into the most
privileged view in the system:

- `get-game.js:22-26` defaults `userRelationship` to `'spectator'` and only matches p0 and p1. A
  seated p2 loading or refreshing their own live game would join `game_<id>_spectator`, and the
  spectator payload is full visibility (`create-socket-events.js:190`) — every hand **and the deck
  order**. That is the ordinary page-load path, not a crafted request.
- `spectate/join.js:26` forbids spectating your own live game by checking `[ p0?.id, p1?.id ]`, so
  p2 could explicitly spectate their own game with the same result.

Resolve both with one `seatOf(game, userId) -> pNum | null` helper iterating the game's seats, used
everywhere a session user is mapped to a seat, and by treating a seated player landing in the
spectator room of a STARTED game as an error rather than a fallback. **Acceptance:** in a
three-player live game, each seated player's game load joins their own perspective room, and
`spectate/join` rejects all three.

The fail-closed sites still need p2: `ready.js:13-31`, `leave-lobby.js:16-22`, `lock-game.js:46-47`
(populate), `find-open-games.js:19-35` (lobby list), `get-history.js:15-47` (p2's games would be
absent from their own history), `StatsController.js:13-14` (unique-player counts), and
`load-fixture-gamestate.js`, which must accept p2 fields before any three-player e2e test can be
staged. `set-is-ranked.js:8` checks membership too — but since cutthroat is casual-only, it should
**reject** `isRanked` on three-player games outright, enforced server-side rather than by hiding
the toggle.

**Rematch under seat rotation.** `rematch.js` generalizes rather than forks, but has three
reconciliation sites plus one hazard:

1. **Agreement gate** (line 36) — `p0Rematch && p1Rematch` becomes **unanimous** across all N
   players (decided). Note the whole rematch flow is deferred past the first user-facing release
   (see Phase 4); this section is documented now so the issue is ready, not to sequence it early.
2. **Series score** (lines 58-67) — currently normalizes back to the first game's seating to keep
   the tally stable across the swap. Tally by **user id** rather than by seat and the
   reconciliation disappears; order the display by first-game seating.
3. **Series name** (line 67) — decided: the players in first-game seating order, then each
   player's wins in that same order, then stalemates, e.g. `A VS B VS C 0-2-1-1`. Today's
   `${p0.username} VS ${p1.username} ${w}-${l}-${s}` is already first-game seating (lines 58-60)
   with stalemates last, so this generalizes it: names joined with the existing `' VS '`, wins
   joined with `-`, stalemates appended. Two-player names come out byte-identical. Build the order
   from the first game's seats, not the current game's: seat rotation reorders `players` every
   rematch, so `players.map(...)` on the current game would reshuffle names from game to game.
4. **Hazard: room remap** (lines 96-97) — `addRoomMembersToRooms` must rotate in the *same*
   direction as the seat assignment. At two players it is a swap and self-evidently correct; a
   3-cycle has a plausible wrong direction, and reversing it places players in another player's
   perspective room. That is an information leak, not a glitch. Cover it with an explicit test:
   after a rematch, every user's socket room matches their new seat.

**Phase 3 — three-player rules.** Turn order (`turn % playerCount`; dealer rotation is handled by
seat rotation on rematch); counter priority with explicit state; cross-board targeting; board wipes
across three fields; win table; hand limit 7; jokers; concede and stalemate-request disabled via
the rule set's `disallowedMoveTypes`. The stalemate threshold needs no change (see 1d). The winner write in
`check-game-state-for-win.js:66-69` maps the winning pNum to `game.p0.id`/`game.p1.id`, so a p2
win needs a seat lookup (sweep C8).

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
whenever a two is played. The candidates are the N−1 players **other than** `stackTopOwner` (1c),
taken clockwise from `stackTopOwner + 1`. The current holder is the first candidate not in
`passedPriority`; once all N−1 have declined, the one-off resolves. `stackTopOwner` is never a
candidate, so nobody is asked to counter their own card. Review caught that the earlier wording —
search every seat for the first not in `passedPriority` — wraps back to the caster and never
reaches "none remain". This also reproduces two-player behavior exactly, so
`your-turn-to-counter.js` can be reimplemented on it with no behavior change.

Acceptance includes the **end-of-round** case (p0 casts; p1 and p2 decline; it resolves) and the
**re-open** case (p2 counters; p0 then p1 are asked, in that order). Legacy read rule: the default
`[]` is exact for a two-player row, whose single candidate cannot yet have declined — a decline
there is the resolve.

**Jokers.** Settled in [Stacks and jokers](#stacks-and-jokers); the engine work:

- New `joker` and `sevenJoker` MoveTypes. Validation: the target is a Royal base or the top stealer
  of a stack, on an opponent's board, subject to the graded Queen rule. Execution: attach the joker
  to the target's base and move the base to the joker player's array.
- `seven-discard`: "both jacks are unplayable" becomes "neither revealed card can legally be
  played", which also supersedes the sweep's C4 note.
- `validate-all-cards.js`: a 54-card expected set from the rule set's `deckIds` rather than the
  static `DeckIds`, and attachments allowed on face-card bases (it currently throws on any
  non-point card with attachments).
- `find-target-card.js` and `is-top-jack.js` search face-card stacks too; today both look only at
  `player.points`.
- `oneOffTargetType` (`GameStateRow.js:156`, `isIn: ['point', 'jack', 'faceCard']`) gains
  `'joker'`, so Twos and Nines can target one. Additive: legacy rows keep `'jack'`.
- Two, Nine, Six and Ace semantics per the interactions list. The win check needs no change: it
  counts Kings in the controller's `faceCards`, where a stolen King already sits.

COUNTERING then has three outcomes where it had two. Add an explicit `DECLINE_COUNTER` MoveType
rather than overloading `resolve` with server-side inference — the log is player-facing and replay
re-renders it. Fizzle parity (`twos.length % 2 === 1`) is unaffected at any player count.

**Phase 4 — client.** Seat-based board component; `opponents[]` in the store; seat-scoped
`data-cy` contract leaving the existing two-player selectors untouched; player picker in the
jack / two / nine / four target dialogs. `owner` reaches the client for free via
`create-socket-events`, and is needed to attribute jacks per player — `GameView.vue:240` currently
hardcodes `controlled-by="opponent"`, which is meaningless with two opponents.

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
  so the home-page current-games list must render three-player games in the first release.
- **Jokers ship in the first release:** card art for `XR`/`XB`, and stacks drawn on face cards.
  `GameView.vue` only draws attachments under point cards (lines 244-289).
- **Rules page lines.** All in the `3Players` section, across all five locale files:
  - **Glasses**, per the audience decision. `glassesDescription` reads "reveal your opponent's
    hand", which is ambiguous at three players under either rule.
  - **Empty deck:** hands stay hidden when the deck runs out. The two-player reveal is undocumented
    (`deckExhaustAnswer` never mentions it), so experienced players will expect it without having
    read anywhere that it exists.
  - **Jokers:** a joker on a jack or another joker steals the card underneath. Rule 3 says only
    "steal target Royal", which does not convey the stacking.

---

## Pending items

One question remains.

1. **Glasses audience — decide during Phase 1, before 1e is written.** 1e rewrites the glasses
   branch of `update-revealed-cards.js`. Both options are identical at two players and neither
   touches the card format, so a late decision blocks nothing: 1e would implement the public
   version and Phase 3 would adapt it.

   | | Public | Private to the controller |
   |---|---|---|
   | **Who sees** | Everyone sees every hand except the holder's | Only the holder sees the other two hands |
   | **The card** | Smaller personal edge, more political: the holder sees two hands, each other player sees one | A strong personal edge — complete information about both opponents — and a prime target for jokers, Twos and Nines |
   | **Jokering the glasses** | Shifts whose hand is hidden | Hands over the view: the thief at once sees both hands, including the former holder's |
   | **Data** | One global `revealedCards` set; no change | A new additive column of per-player reveals, empty for legacy rows (exact) |
   | **UI** | Every revealed card is known to everyone | Needs "only you know this" versus "everyone knows this" |

   If private, the cost is contained: the new column; the glasses branch writing per holder;
   per-view marking in `create-socket-events.js`, moving out of the shared pre-pass at lines 25-35;
   `hideOpponentHand`'s glasses branch staying load-bearing; the client indicator; and synthetic
   tests for glasses stolen by a joker, glasses scrapped, and a seen card leaving the hand. It also
   needs one rule: the former holder keeps seeing what they saw, matching the 5.0.0 principle of
   showing a player what they have legitimately seen.

   *Recommendation: public.* At a table, three people around a face-up hand all see it, so public
   is the faithful port of how the variant is played in person; it also keeps cutthroat free of
   private knowledge. Private is viable if play shows public glasses to be too weak or too
   political.

### Standing rule: every new gamestate field goes through unpack, validation and pack

`validateGamestate` rebuilds the state from a fixed field list, and pack serializes from another;
both silently drop anything they do not name. So every new field must be added in three places:
unpack's field mapping, `validateGamestate`'s list, and pack's list. This applies to
`oneOffTargetPNum` (1c), `passedPriority` (Phase 3), the per-player reveals if glasses go private,
and the players themselves (1e converts `validateGamestate`'s `p0`/`p1` to `players[]`; Phase 2's
third seat follows). Review found the rule set being dropped this way, which is why it is now
passed alongside the state instead.

### Standing rule: every new gamestate column declares a legacy read rule

Each phase deploys separately, so a game can be paused on a row written before a column existed.
Every new column must state how such a row reads, and come with a test that resumes a paused
legacy game across the deploy:

| Column or field | Legacy read rule |
|---|---|
| `owner` on hand and field cards | the column; parity reconstruction for legacy stacks (1a) |
| `owner` on `twos` | alternation from the caster (1a) |
| owners in snapshot slots | none — never reconstructed (1a) |
| `oneOffTargetPNum` | the non-caster, when `oneOff` is set (1c) |
| `passedPriority` | `[]`, exact for two players (Phase 3) |
| per-player reveals, if glasses go private | empty, exact for two players (Phase 3) |

### Found along the way

**`counter/validate.js` never checks that the counter is a Two.** It checks the phase, that a
one-off is pending, that the card is in hand, priority, and the Queen — but not the rank. A crafted
request can counter with any card, so a player can cancel any one-off without holding a Two,
paying only the card they sacrifice. The client only offers Twos, so ordinary play never hits it. This is an existing two-player bug, independent
of this plan; it is the one validator that does not reject a rank-14 joker. Worth a small
standalone fix — `if (playedCard.rank !== 2)` — rather than folding it into a work item.

**The column-less pack path writes `undefined` into suffixes.** `targetCard` and `oneOffTarget` are
serialized through pack's generic path, which calls `convertCardToStr` without a column. For a card
with exactly two attachments that produces `TH(JH-undefined,JC-p0)`. Harmless today, since the
reader discards attachment suffixes, and 1a-write removes it.

### A recurring pattern worth carrying into the issues

Four separate findings in this plan share one shape: **something prevented by construction
becomes expressible, and must then be explicitly forbidden.** Buried jacks (parity made them
unreachable), self-targeting (`find-target-card.js` takes a single player), `twos` ownership
(alternation made it unambiguous), and face-card stacks (only point cards could carry
attachments). When implementing 1a and Phase 3, enumerate what the new
representation makes *possible* and decide which of those stay impossible, rather than discovering
them as bugs.

---

## Appendix: two-player assumption sweep

Run before implementing 1a/1c so no further instances surface mid-change. Two passes:

1. **Pattern grep** over `api/` and `src/` for **a value that resolves to *a player* (rather than to a
   turn) via two-player alternation** — `playedBy ? p0 : p1`, `(x + 1) % 2`, `% 2`.
2. **Per-file coverage check.** The pattern pass missed two shapes that contain no ternary or
   modulo: *pairwise-by-name* (destructure `{ p0, p1 }`, then cross-reference by name, as in
   `update-revealed-cards.js`) and *seat enumeration* (listing `p0, p1` as the seats that exist). So
   every file in `api/` and `src/` that names `p0` or `p1` was checked against this document.
   **Every such file is now classified below**; `src/plugins/sockets/inGameEvents.js` holds only
   rematch flags and is deferred with rematch.

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
- **`update-revealed-cards.js:32-69` — found by the per-file pass.** Pairwise-by-name throughout;
  glasses, `publicIds` and the empty-deck branch all name `p0` and `p1`. Covered by 1e, with the
  empty-deck branch gated by 1d. Its twin, `create-socket-events.js:97-101` (`deckIsEmpty`), must be
  gated too — see 1f.
- **`seven-discard/validate.js:69-73` — NEW.** A revealed double-jack may only be discarded when
  the jacks are unplayable, tested as *the opponent has a Queen or has no points*. At three
  players this must hold against **every** opponent: `opponents.every(o => hasQueen(o) ||
  !o.points.length)`. This is a semantic generalization, not a lookup swap — the only site in the
  sweep where the *rule* changes shape rather than the player reference. With jokers it generalizes
  once more, to "neither revealed card can legally be played" (Phase 3).

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

**C8 — seat enumeration. Phase 2.** Found by the per-file pass. Fails **open**, into full
visibility: `get-game.js:22-26`, `spectate/join.js:26` — see the Phase 2 note. Fails closed or
silently wrong: `move.js:36-44`, `ready.js:13-31`, `leave-lobby.js:16-22`, `lock-game.js:46-47`,
`find-open-games.js:19-35`, `get-history.js:15-47`, `StatsController.js:13-14`,
`set-is-ranked.js:8`, `load-fixture-gamestate.js`, `broadcast-game-event.js:27-29` (1f),
`check-game-state-for-win.js:66-69` (Phase 3), `validate-gamestate.js:74-75` (1e). Deferred with
rematch: `get-casual-match.js:20-21`, `get-match-games.js:9-10`, `get-rematch-games.js:6-8`.

`validate-gamestate.js` was found later, in review. The per-file pass counted a file as covered
whenever this document mentioned it, and it did — but only for the ownership invariant, never for
its `p0`/`p1` field list. A mention is not a classification.

### Outcome

No fourth instance of C3 exists, and C1 collapses to a single deferred item. The pattern pass's net
new work was two sites: `seven-discard/validate.js` (C4, a rule-shape change) and `get-log.js` (C5).
The per-file pass added `update-revealed-cards.js` (1e) and the whole of C8, including the two
fail-open seat checks — the most consequential finding of either pass, since they leak hidden
information on the ordinary page-load path.
