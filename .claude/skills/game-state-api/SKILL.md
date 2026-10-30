---
name: game-state-api
description: >-
  Read docs/game-state-api.md to understand Cuttle's move request lifecycle and the architectural
  relationships between the database, API, and helper layers. Use BEFORE working on anything that
  touches game-move processing: adding or changing a MoveType; editing a move's validate/execute
  helper under api/helpers/game-states/moves/**; the api/controllers/game/move.js request flow;
  packing/unpacking GameState/GameStateRow; the compressed card string format; the GamePhase or
  MoveType enums; the Game or GameStateRow models; or the game socket payload sent to clients. Also
  use when a request asks how a move flows end-to-end (validate → execute → save → publish), or how
  turns/phases advance.
---

# When to read the Game State API doc

`docs/game-state-api.md` is the canonical description of how a single move is processed in
cuttle.cards — from the database schema, through backend validation/execution, to the socket payload
the client receives. **Read it first** (in full) whenever a task touches the game move loop, so your
changes match the established request lifecycle and layer boundaries. Don't reverse-engineer this
from scattered files when the doc already lays it out.

## Read the doc when the task involves any of:

- **A move type** — adding a new `MoveType`, or changing how an existing one is validated/executed.
- **Move helpers** — editing anything under `api/helpers/game-states/moves/<move>/validate.js` or
  `execute.js` (e.g. `draw`, `discard-to-hand-limit`, `resolve`, `one-off`).
- **The request lifecycle** — `api/controllers/game/move.js`: lock game → `unpackGamestate` of the
  latest state → `validate()` → `execute()` → `saveGamestate()` → `publishGameState()` → unlock.
- **State representation** — the `GameState` (uncompressed, object form used for all game logic) vs
  `GameStateRow` (compressed DB row), and the `packGameState()` / `unpackGamestate()` boundary.
- **The compressed card string format** — the `Array<String>` card lists (e.g.
  `'8D(JS-p0,JD-p1)'`), suit/rank letters, and attached-jack notation.
- **Enums** — `GamePhase` (which moves are legal in each phase) or `MoveType`
  (`utils/GamePhase.json`, `utils/MoveType.json`).
- **Models** — `api/models/Game.js` (game metadata) or `api/models/GameStateRow.js` (one move + the
  resulting state).
- **The socket payload** — the shape published to clients (`change`, `game`, `victory`) and how the
  client consumes game updates.
- **Turn/phase progression** — how `turn` and `phase` advance (e.g. why a draw that overflows the
  hand sets `DISCARDING_TO_HAND_LIMIT` and holds the turn).

## How to use it

1. **Read `docs/game-state-api.md` end-to-end** before editing — it's short and covers all four
   layers (DB → backend processing → API/socket → control flow) plus worked `validate`/`execute`
   examples.
2. Map the doc onto the real code (the doc uses the older `gamestate` spelling in a few paths; the
   live paths are hyphenated):
   - Controller: `api/controllers/game/move.js`
   - Move helpers: `api/helpers/game-states/moves/<moveType>/{validate,execute}.js`
   - Pack/unpack/save/publish: `api/helpers/game-states/{pack-gamestate,unpack-gamestate,save-gamestate,publish-game-state}.js`
   - Enums: `utils/GamePhase.json`, `utils/MoveType.json`
   - Models: `api/models/Game.js`, `api/models/GameStateRow.js`
3. Follow the discovered pattern: a new/changed move is a `validate()` (throws `BadRequestError`
   with an i18n key if illegal) + an `execute()` (returns a new `GameState`), dispatched by
   `moveType` from the controller. Mirror an existing move folder rather than inventing structure.
4. If your change alters the doc's described behavior (new move type, new phase, changed payload),
   **update `docs/game-state-api.md`** in the same change.
