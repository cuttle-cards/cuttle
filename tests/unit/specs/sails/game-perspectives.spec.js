import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRequire } from 'node:module';
import { gameFixture } from '../../fixtures/Game';

const require = createRequire(import.meta.url);
const getGame = require('../../../../api/controllers/game/get-game');
const joinSpectate = require('../../../../api/controllers/game/spectate/join');
const GameStatus = require('../../../../utils/GameStatus.json');

// Waterline queries are chainable and awaitable. Keep database access out of
// these controller tests; socket delivery is exercised by the Cypress regression.
function gameQuery(game) {
  return {
    populate: vi.fn().mockReturnThis(),
    then: (resolve, reject) => Promise.resolve(game).then(resolve, reject),
  };
}

describe('Game visibility and socket room membership', () => {
  let game;
  let req;
  let res;
  let socketEvents;

  beforeEach(() => {
    game = _.cloneDeep(gameFixture);
    game.gameStates = [ { id: 101 }, { id: 102 } ];
    req = { params: { gameId: String(game.id) }, session: { usr: game.p0.id }, query: {} };
    res = {
      ok: vi.fn(),
      badRequest: vi.fn(),
      serverError: vi.fn(),
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    socketEvents = {
      p0State: { game: { perspective: 'p0' } },
      p1State: { game: { perspective: 'p1' } },
      spectatorState: { game: { perspective: 'spectator' } },
    };

    vi.spyOn(Game, 'findOne').mockReturnValue(gameQuery(game));
    vi.spyOn(User, 'findOne').mockImplementation(async ({ id }) => ({ id, username: 'viewer' }));
    vi.spyOn(UserSpectatingGame, 'create').mockResolvedValue(undefined);
    vi.spyOn(UserSpectatingGame, 'updateOne').mockReturnValue({
      set: vi.fn().mockResolvedValue({ id: 1 }),
    });
    vi.spyOn(sails.sockets, 'join').mockReturnValue(true);
    vi.spyOn(sails.helpers.gameStates, 'unpackGamestate').mockReturnValue({ id: 'unpacked' });
    vi.spyOn(sails.helpers.gameStates, 'createSocketEvents').mockResolvedValue(socketEvents);
    vi.spyOn(sails.helpers, 'broadcastGameEvent').mockReturnValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  for (const status of [ GameStatus.STARTED, GameStatus.FINISHED, GameStatus.ARCHIVED ]) {
    for (const role of [ 'p0', 'p1' ]) {
      it(`Keeps ${role} in their player room when loading a game with status ${status}`, async () => {
        game.status = status;
        req.session.usr = game[role].id;

        await getGame(req, res);

        const perspective = status === GameStatus.STARTED ? role : 'spectator';
        expect(sails.sockets.join).toHaveBeenCalledExactlyOnceWith(req, `game_${game.id}_${role}`);
        expect(res.ok).toHaveBeenCalledExactlyOnceWith(socketEvents[`${perspective}State`]);
        expect(UserSpectatingGame.create).not.toHaveBeenCalled();
        const expectedState = game.gameStates[status === GameStatus.STARTED ? 1 : 0];
        expect(sails.helpers.gameStates.unpackGamestate).toHaveBeenCalledWith(expectedState);
      });
    }
  }

  it('Registers a new non-player spectator and returns full visibility', async () => {
    req.session.usr = 99;

    await getGame(req, res);

    expect(sails.sockets.join).toHaveBeenCalledExactlyOnceWith(req, `game_${game.id}_spectator`);
    expect(UserSpectatingGame.create).toHaveBeenCalledExactlyOnceWith({
      gameSpectated: game.id, spectator: 99,
    });
    expect(res.ok).toHaveBeenCalledWith(socketEvents.spectatorState);
  });

  it('Does not duplicate an existing spectator registration', async () => {
    req.session.usr = 99;
    game.spectatingUsers = [ { spectator: 99 } ];

    await getGame(req, res);

    expect(UserSpectatingGame.create).not.toHaveBeenCalled();
    expect(res.ok).toHaveBeenCalledWith(socketEvents.spectatorState);
  });

  it('Allows selecting the last state of a finished game', async () => {
    game.status = GameStatus.FINISHED;
    req.query.gameStateIndex = '-1';

    await getGame(req, res);

    expect(sails.helpers.gameStates.unpackGamestate).toHaveBeenCalledWith(game.gameStates[1]);
    expect(res.ok).toHaveBeenCalledWith(socketEvents.spectatorState);
  });

  it('Returns 404 for a missing game', async () => {
    Game.findOne.mockReturnValue(gameQuery(null));

    await getGame(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(sails.sockets.join).not.toHaveBeenCalled();
  });

  for (const status of [ GameStatus.FINISHED, GameStatus.ARCHIVED ]) {
    for (const role of [ 'p0', 'p1', 'spectator' ]) {
      it(`Uses the ${role} room when replaying a game with status ${status}`, async () => {
        game.status = status;
        req.session.usr = role === 'spectator' ? 99 : game[role].id;

        await joinSpectate(req, res);

        expect(sails.sockets.join).toHaveBeenCalledExactlyOnceWith(req, `game_${game.id}_${role}`);
        expect(res.ok).toHaveBeenCalledExactlyOnceWith(socketEvents.spectatorState);
      });
    }
  }

  for (const role of [ 'p0', 'p1' ]) {
    it(`Prevents ${role} from spectating their live game`, async () => {
      req.session.usr = game[role].id;

      await joinSpectate(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(sails.sockets.join).not.toHaveBeenCalled();
      expect(sails.helpers.gameStates.createSocketEvents).not.toHaveBeenCalled();
    });
  }

  it('Allows a non-player to spectate a live game', async () => {
    req.session.usr = 99;

    await joinSpectate(req, res);

    expect(sails.sockets.join).toHaveBeenCalledExactlyOnceWith(req, `game_${game.id}_spectator`);
    expect(res.ok).toHaveBeenCalledWith(socketEvents.spectatorState);
  });

  it('Rejects spectating a game with no saved states', async () => {
    game.status = GameStatus.FINISHED;
    game.gameStates = [];

    await joinSpectate(req, res);

    expect(res.badRequest).toHaveBeenCalledWith({ message: 'home.snackbar.spectateNoGamestates' });
    expect(sails.sockets.join).not.toHaveBeenCalled();
  });
});
