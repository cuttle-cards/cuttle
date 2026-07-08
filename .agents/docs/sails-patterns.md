# Sails.js Patterns

Detailed reference for backend patterns in Cuttle. See `ctl-sails-patterns` skill for quick lookups.

## Controller actions

File: `api/controllers/<area>/<action>.js`

```js
module.exports = async function (req, res) {
  let game;
  try {
    const { usr: userId } = req.session;
    let { gameId } = req.params;
    gameId = Number(gameId);
    const { someField } = req.body;

    game = await sails.helpers.lockGame(gameId);

    // ... business logic ...

    await sails.helpers.unlockGame(game.lock);
    return res.ok({ result });
  } catch (err) {
    try {
      await sails.helpers.unlockGame(game.lock);
    } catch (_) {}

    const message = err.raw?.message ?? err;
    switch (err?.code) {
      case CustomErrorType.FORBIDDEN:
        return res.forbidden({ message });
      default:
        return res.serverError({ message });
    }
  }
};
```

Canonical example: `api/controllers/game/rematch.js`

## Helpers

File: `api/helpers/<name>.js`

```js
module.exports = {
  friendlyName: 'Helper name',
  description: 'What it does',
  inputs: {
    gameId: { type: 'number', required: true },
    payload: { type: 'ref', required: true },
  },
  sync: true,  // omit for async helpers
  fn: ({ gameId, payload }, exits) => {
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

### Calling helpers

Cuttle uses positional calling (not `.with()`):

```js
// Positional (project convention)
sails.helpers.broadcastGameEvent(gameId, payload);
await sails.helpers.lockGame(oldGameId);

// Named (.with()) — valid but not used in this codebase
await sails.helpers.lockGame.with({ gameId: oldGameId });
```

For async helpers, `await` the call. For `sync: true` helpers, no `await`.

## Policies

File: `api/policies/<name>.js`

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

Policy chains are configured in `config/policies.js`. Policies run in order before the controller.

## Models

File: `api/models/<Name>.js`

```js
module.exports = {
  attributes: {
    name: { type: 'string', required: true },
    status: { type: 'number', defaultsTo: 0 },
    p0: { model: 'user' },
    p1: { model: 'user' },
  },
  // Lifecycle callbacks (optional)
  beforeCreate(values, proceed) { return proceed(); },
};
```

## Socket broadcasting

Two patterns:

**Symmetric broadcast** (same payload to all rooms):
```js
sails.helpers.broadcastGameEvent(gameId, payload);
// broadcasts to: game_<id>_p0, game_<id>_p1, game_<id>_spectator
```

**Asymmetric broadcast** (different view per player, hides hidden info):
```js
const { p0State, p1State, spectatorState } = await sails.helpers.gameStates.createSocketEvents(game, fullGame);
sails.sockets.broadcast(`game_${gameId}_p0`, 'game', p0State);
sails.sockets.broadcast(`game_${gameId}_p1`, 'game', p1State);
sails.sockets.broadcast(`game_${gameId}_spectator`, 'game', spectatorState);
```

## Routes

`config/routes.js` maps HTTP verbs + paths to controller actions:

```js
'POST /api/game/:gameId/move': { action: 'game/play-move' },
'GET  /api/game/:gameId':      { action: 'game/get-game' },
```

## Error types

| Class | File | HTTP code |
|-------|------|-----------|
| `ForbiddenError` | `api/errors/forbiddenError.js` | 403 |
| `CustomErrorType` | `api/errors/customErrorType.js` | varies |

```js
const ForbiddenError = require('../../errors/forbiddenError');
throw new ForbiddenError('You are not a player in this game!');
```

## Locking pattern

Games use an advisory lock to prevent concurrent mutations:

```js
game = await sails.helpers.lockGame(gameId);
// ... make changes ...
await sails.helpers.unlockGame(game.lock);
```

Always unlock in the `catch` block too (swallow the unlock error, then handle the original error).
