---
name: ctl-sails-patterns
description: "Sails.js backend patterns for Cuttle. Use on 'write a controller', 'add a helper', 'create a policy', 'add a route', 'sails helper syntax', 'lock game', 'broadcast socket event', or any backend/API question."
model: inherit
allowed-tools: Read, Grep, Glob, Bash
---

# Sails Patterns

Quick reference for Cuttle's Sails.js backend. Full details in `.agents/docs/sails-patterns.md`.

## Before writing any backend code

```bash
# Find similar controllers
find api/controllers -name "*.js" | head -20

# Find existing helper calls
grep -r "sails.helpers\." api/controllers/ --include="*.js" -h | sort -u | head -20

# Check existing helpers
ls api/helpers/

# Check policy chain
cat config/policies.js
```

## Controller template

File: `api/controllers/<area>/<action>.js`

```js
const GameStatus = require('../../../utils/GameStatus.json');
const CustomErrorType = require('../../errors/customErrorType');
const ForbiddenError = require('../../errors/forbiddenError');

module.exports = async function (req, res) {
  let game;
  try {
    const { usr: userId } = req.session;
    let { gameId } = req.params;
    gameId = Number(gameId);
    const { fieldName } = req.body;

    game = await sails.helpers.lockGame(gameId);

    // Validate user is a player
    const playerIds = [game.p0?.id, game.p1?.id].filter(Boolean);
    if (!playerIds.includes(userId)) {
      throw new ForbiddenError('You are not a player in this game!');
    }

    // ... business logic ...

    await sails.helpers.unlockGame(game.lock);
    return res.ok({ result });
  } catch (err) {
    try { await sails.helpers.unlockGame(game.lock); } catch (_) {}
    const message = err.raw?.message ?? err;
    switch (err?.code) {
      case CustomErrorType.FORBIDDEN: return res.forbidden({ message });
      default: return res.serverError({ message });
    }
  }
};
```

Canonical example: `api/controllers/game/rematch.js`

## Helper template

```js
module.exports = {
  friendlyName: 'Helper name',
  description: 'What it does in one sentence',
  inputs: {
    gameId: { type: 'number', required: true },
  },
  // Add `sync: true` only for synchronous helpers
  fn: async ({ gameId }, exits) => {
    try {
      // ... logic ...
      return exits.success(result);
    } catch (err) {
      return exits.error(err);
    }
  },
};
```

Canonical example: `api/helpers/broadcast-game-event.js`

### Calling helpers (positional form — project convention)

```js
// Async
const game = await sails.helpers.lockGame(gameId);
await sails.helpers.unlockGame(game.lock);

// Sync
sails.helpers.broadcastGameEvent(gameId, payload);
```

Do not use `.with()` — the project uses positional calls consistently.

## Policy template

```js
module.exports = function (req, res, next) {
  const { session } = req;
  const userIsValid = session.usr && typeof session.usr === 'number';
  if (session.loggedIn && userIsValid) {
    return next();
  }
  return res.status(401).json({ message: 'Please log in and try again' });
};
```

Canonical example: `api/policies/isLoggedIn.js`

## Route registration

File: `config/routes.js`

```js
'POST /api/game/:gameId/rematch': { action: 'game/rematch' },
'GET  /api/game/:gameId':          { action: 'game/get-game' },
```

## Socket broadcasting

**Symmetric** (same payload to all rooms):
```js
sails.helpers.broadcastGameEvent(gameId, { change: 'eventName', ...data });
// Broadcasts to: game_<id>_p0, game_<id>_p1, game_<id>_spectator
```

**Asymmetric** (per-player views — hides opponent's hidden cards):
```js
const { p0State, p1State, spectatorState } = await sails.helpers.gameStates
  .createSocketEvents(game, newFullGame);
sails.sockets.broadcast(`game_${gameId}_p0`, 'game', p0State);
sails.sockets.broadcast(`game_${gameId}_p1`, 'game', p1State);
sails.sockets.broadcast(`game_${gameId}_spectator`, 'game', spectatorState);
```

Use asymmetric when the new game state includes hidden information (e.g., opponent's hand).

## Locking pattern

Always lock before reading game state, always unlock in catch:

```js
game = await sails.helpers.lockGame(gameId);
// make changes
await sails.helpers.unlockGame(game.lock);
```

## Error types

```js
const ForbiddenError = require('../../errors/forbiddenError');
const CustomErrorType = require('../../errors/customErrorType');

throw new ForbiddenError('message');  // → res.forbidden()
```

## Security rules

- Every game-mutating route must be protected by `isLoggedIn` policy.
- Always validate that `req.session.usr` matches a player in the game before mutating.
- Never trust client-supplied `userId` — always read from `req.session.usr`.
- No hardcoded secrets; use Sails config.

## Full reference

`.agents/docs/sails-patterns.md`
