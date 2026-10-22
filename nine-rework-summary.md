# Session Summary — Nine Rework (Return Two Cards, Unfrozen)

**Branch:** `feat/nines-discard-two` · **Commit:** `8af93434` · **PR:** [#1378](https://github.com/cuttle-cards/cuttle/pull/1378)
**Scope:** 42 files, +1347 / −652, plus one new helper file.

---

## 1. The task

Change the Nine one-off effect to return **two** cards to their controller's hand, and drop
the freeze so both returned cards are immediately replayable. Ship it as a **beta for the
Spades season**, announced on the home page, with a community poll toward the end of the
year deciding whether it stays.

Original request also covered: updating `resolve/nine.js` and `one-off/validate.js`, a major
`rulesVersion` bump, migrating all affected e2e/unit tests, and creating the announcement.

---

## 2. Decisions the user made during planning

These were resolved through questions before implementation began:

| Question | Decision |
|---|---|
| What does "return two cards" mean? | **True dual-target select** — the player picks two separate targets on the opponent's board. |
| Minimum targets | Nine requires **exactly two**; fewer than 2 legal targets makes it unplayable. |
| Target type mixing | **Any mix** of point / faceCard / jack. |
| Queen interaction | A Queen protects everything else, leaving itself the only legal target, so two legal targets are impossible → **any Queen (1+) blocks a Nine outright**. Enforced in the backend validator **and** pre-emptively in the MoveChoiceCard. Twos keep their existing rules. |
| Jack stacks | **Top jack only** — never a buried one. The top jack **and** the point card it sits on may both be selected (inclusive). |
| Resolution order | **Simultaneous.** Both targets go to the hand of whoever controlled them *before* resolution. So jack + its own host → **both to the jack holder's hand**. |
| AI bot | Update it to play two-target Nines (not exclude it). |
| Selection UX | On-board selection + a Confirm button styled like `BaseDialog`'s `v-fab.dialog-activator`. |
| Dead freeze code | Define a rollback plan; keep the plumbing dormant, with a cleanup plan if the change is kept. |
| Targets vanishing mid-resolution | Can't happen; add a sanity no-op guard anyway. |

---

## 3. Critical discoveries during research

**`isFrozen` was never persisted.** It was *re-derived on unpack* in
`api/helpers/game-states/unpack-gamestate.js` from the rule *"resolved card is a 9 AND this
hand card equals `targetCard`"*. So removing freezing required deleting that derivation too —
removing only the `isFrozen: true` writes would have let the DB round-trip re-freeze target #1.

**`resolve/nine.js` was the only producer of `isFrozen: true` in the entire codebase.**
Everything else merely consumes it. Removing the freeze therefore killed the whole mechanic.

**Replays are safe.** Spectating/replay (`api/controllers/game/spectate/join.js`) only
`unpackGamestate`s *stored* rows — it never re-executes moves through current validate/resolve
helpers. Historical games are never re-validated under the new rules.

**`validate-gamestate.js` is an explicit whitelist.** Any GameState field not listed there is
silently dropped before packing — an easy way to lose the new fields.

**Both validators duplicated the whole `case 2: case 9:` block** (`one-off/validate.js` and
`seven-one-off/validate.js`), so Nine rules would have had to be maintained in two places.

---

## 4. What was implemented

### Backend

- **`api/models/GameStateRow.js`** — three additive nullable columns: `oneOffTargetTwo`,
  `oneOffTargetTwoType`, `targetCardTwo`. Chosen over widening the existing singular fields,
  which twos, the seven flow, the log, the socket payload and the store all read.
- **Plumbing** — `pack-gamestate.js`, `unpack-gamestate.js` (+ **freeze derivation deleted**),
  `validate-gamestate.js`, `create-socket-events.js`, `deal-cards.js`,
  `load-fixture-gamestate.js`.
- **`api/helpers/game-states/validate-nine-targets.js`** *(new)* — shared Nine validation
  returning an error message or `null`; called from both validators. Covers: any-queen block,
  ≥2 legal targets, both target pairs present, no duplicate target, top-jack-only.
- **`resolve/nine.js`** — rewritten for simultaneous resolution. Snapshots each target's
  controller before mutation, processes jacks first, uses fresh `findIndex` at splice time,
  splices jacks by index rather than `pop()`, scraps non-targeted attachments, no-ops missing
  targets.
- **`resolve/execute.js`** — sets `targetCardTwo`, nulls both new fields; **also fixes a
  pre-existing leak** where the fizzle path never cleared the target slots.
- **`get-log.js`** — names both returned cards, drops "It cannot be played next turn."
- **`ai/get-move-bodies-for-move-type.js`** — enumerates two-target pairs for Nines, skips
  generation when blocked; also fixes a pre-existing bug where jack bodies omitted `targetType`.
- **`utils/rulesVersion.js`** — `2.0.0` with a history line.
- **`docs/game-state-api.md`** — new columns, GameState fields, socket payload, and the Nine
  targeting/queen rules.

### Frontend

- **`GameView.vue`** — replaced dead `targetType`/`nineTargetIndex` state (and an unused
  `nineTarget` computed) with a real `selectedNineTargets` list; `resolveTargetDescriptor`
  split from submission; toggle-to-deselect; third click ignored; `validMoves` returns `[]`
  for rank 9 when any queen is present. **Rank 2 still fires on first click.**
- **`TargetSelectionOverlay.vue`** — `(n/2)` progress header and a Confirm button carrying
  `BaseDialog`'s pulse-glow/shimmer treatment and reduced-motion guard.
- **`GameCard.vue`** — new `isSelectedTarget` prop → pink border + tint + check badge on a
  light disc.
- **`stores/game.js`** — forwards the second target on both the normal and seven paths;
  `oneOffTargetTwo` / `lastEventTargetTypeTwo` refs hydrated, reset and exported.
- **Counter dialogs** — `GameDialogs.vue`, `CannotCounterDialog.vue`,
  `ChooseWhetherToCounterDialog.vue` now show both cards at stake.
- **`MoveChoiceOverlay.vue`** — queen check moved inside the rank branch; new
  `numValidNineTargets` computed.

### i18n (all five locales: en, de, es, fr, ukr)

Rewrote `game.moves.effects.9`, `rules.oneoffs.nineDescription`, `rules.4Players.rule5`
(mentioned the freeze twice), and `game.snackbar.global.blockedByMultipleQueens` (now Twos
only). Added `game.snackbar.oneOffs.nine.*` (5 keys) and
`game.moves.disabledMove.{queenBlocksNine, nineNeedsTwoTargets}`. Verified identical key
positions across all files and no untranslated English placeholders.

### Announcement

Via the `announcement` skill — `ninesBuff2026Announcement`, "Rules Beta: Nines Return Two
Cards", two 9s as display cards, **2026-09-08 → 2027-01-05**, two sections (the buff
rationale; the Spades-season test + year-end poll). Orphaned keys from the previous Diamonds
announcement removed from every locale.

### Tests

Extended both shared Cypress commands to an optional two-target form (no churn for twos).
Rewrote `9_nines.spec.js` (19 tests): deleted the `assertCardIsFrozen` helper and two
freeze-only tests, converted the stalemate/reload one to assert continued *playability*, and
added coverage for mixed pairs, **jack + its own host**, deselect, confirm-gating, queen
block, `<2` targets, and the seven path. Also updated `targeting_cleanup.spec.js`,
`opponent_sevens.spec.js`, `player_sevens.spec.js`, `handLimit.spec.js`, and three unit
fixtures.

---

## 5. Bugs found *during* testing (all fixed)

1. **Unit fixtures** — `points.js` / `resolveThree.js` needed the new fields; the socket
   *event* carries `targetCardTwo` only when truthy, so a first pass over-added it there.
2. **Self-inflicted goal interaction** — gave the opponent two Kings to have two non-Queen
   royals, but two Kings drop their goal to 10 and the fixture had exactly 10 points. The
   opponent won instantly; the failure screenshot showed "YOU LOSE". Switched to a four.
3. **A four is scuttleable by a nine**, which re-enabled a scuttle choice a test asserts is
   disabled. Swapped that second target for a royal.
4. **Pre-existing fizzle leak** — a new assertion in `targeting_cleanup` exposed that
   `resolve/execute.js` never cleared `oneOffTarget`/`oneOffTargetType` on fizzle (masked
   because the next one-off overwrote them). Now clears all four slots.
5. **Missed two `player_sevens` tests** on the first sweep (that file was wrongly filtered out
   of a grep) — one targeted a Queen, the other never confirmed.
6. **Selection styling was invisible** — the green "valid target" overlay renders *on top* of
   the pink border/tint, so selected cards read as *disabled*. Fixed by suppressing the green
   overlay once a card is selected; tint raised to 0.35 and the badge given a light disc,
   because dark royal art washed out 28% pink.

---

## 6. Verification results (local)

| Check | Result |
|---|---|
| `npm run lint` | clean |
| `npm run test:unit` | 3 client + 83 sails passing (stable across 3 runs) |
| `one-offs/**` (12 specs) | **118 / 118** |
| handLimit, basicMoves, vsAI, reconnecting | **64 / 64** |
| Full `cypress run` (34 specs) | 0 failures through 11 specs, incl. `home.spec.js` with the announcement live — **stopped early at the user's request**; CI verifies the rest |
| Manual UI pass | Verified via captured screenshots (selection states, queen-blocked) |

An early `google.spec.js` failure was investigated and proved to be **flaky DB-state carryover**
from aborted runs — it passes at HEAD and with the changes across repeated runs.

---

## 7. Outstanding items

- ⚠️ **Manual migration required before deploy.** No migration tooling exists; staging/prod are
  `migrate: 'safe'`:
  ```sql
  ALTER TABLE gamestaterow ADD COLUMN IF NOT EXISTS "oneOffTargetTwo" text;
  ALTER TABLE gamestaterow ADD COLUMN IF NOT EXISTS "oneOffTargetTwoType" text;
  ALTER TABLE gamestaterow ADD COLUMN IF NOT EXISTS "targetCardTwo" text;
  ```
- **Follow-up issue at merge time** — if the poll *keeps* the change, delete the now-dead freeze
  plumbing (validator guards, snowflake UI, `convert-str-to-card`'s `isFrozen` input,
  `SnackBarError.FROZEN_CARD`, related i18n). Left dormant so a revert stays a clean
  `git revert`.
- **Branch name mismatch** — `feat/nines-discard-two`, but the effect *returns* cards rather than
  discarding them. PR title/body are accurate; only the branch name is off.
- **PR has no linked issue** — template's `Resolves #` left blank.
- **Pre-existing bug, deliberately not fixed** — `src/stores/game.js` reads
  `lastEvent?.oneOffTargetType`, but the backend only ever puts that field on the game object,
  never inside `lastEvent`. It has always been `null`, making the jack/faceCard branches of the
  card-transition animations dead code. Fixing it would silently enable animations that have
  never run — out of scope here, flagged for a decision.
- **Pre-existing i18n order drift** — `es.json` / `fr.json` diverge from `en.json` at an
  unrelated `game.dialogs` key. Predates this work; not touched.
- **Rules-page art is now stale** — `/img/rulesView/oneoffs_nine.png` and the animated GIF in the
  external `cuttle-cards/cuttle-assets` repo still depict the old behavior. Can't be fixed here.

---

## 8. Rollback plan (if the poll reverts)

1. `git revert` the PR. Because freeze is derived at unpack rather than stored, this restores the
   old behavior with **zero data migration**.
2. Bump `CURRENT_RULES_VERSION` **forward** to `3.0.0` with a history line noting the revert —
   never reuse or decrement, since games are stamped with it.
3. Leave the three columns in place (nullable, unused); trial-era games keep their data.
4. Remove the announcement entry.
5. Accept one cosmetic wrinkle: with the derivation restored, replaying a *trial-era* game
   re-derives a freeze on its first target, showing a frozen card that wasn't frozen when played.

---

## 9. Environment note

The dev stack booted for testing was still running on **1337** and **8080** at session end
(PIDs 87880 / 87897) — the user had shut down their own instance to free the ports, so this is
a replacement instance awaiting their decision.
