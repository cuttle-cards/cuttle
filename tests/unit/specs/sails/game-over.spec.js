import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Card } from '../../fixtures/Card';
import DeckIds from '../../../../utils/DeckIds.json';
import GamePhase from '../../../../utils/GamePhase.json';
import GameStatus from '../../../../utils/GameStatus.json';
import MoveType from '../../../../utils/MoveType.json';
import getGame from '../../../../api/controllers/game/get-game.js';

dayjs.extend(utc);

const PASSWORD = 'myPassword1';

async function signupPlayer(username) {
  const agent = request.agent(globalThis.sailsApp);
  await agent
    .post('/api/user/signup')
    .send({ username, password: PASSWORD })
    .expect(200);
  const user = await User.findOne({ username });
  return { agent, user };
}

// Ranked games are added to the match for the current week of the running season
function createRunningSeason() {
  const now = dayjs.utc();
  return Season.create({
    name: 'Test Season',
    startTime: now.subtract(1, 'day').toDate(),
    endTime: now.add(1, 'month').toDate(),
  });
}

/**
 * Builds a full game state where p0 (to move) has 11 points and the ten of spades in hand,
 * so playing it for points wins the game. Every other card goes in the deck
 */
function nearlyWonGameState(gameId, overrides = {}) {
  const p0 = { hand: [ Card.TEN_OF_SPADES ], points: [ Card.TEN_OF_HEARTS, Card.ACE_OF_CLUBS ], faceCards: [] };
  const p1 = { hand: [ Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS ], points: [], faceCards: [] };
  const usedIds = new Set([ ...p0.hand, ...p0.points, ...p1.hand ].map(({ id }) => id));
  const { convertStrToCard } = sails.helpers.gameStates;
  const deck = DeckIds.filter((id) => !usedIds.has(id)).map((id) => convertStrToCard(id));

  return {
    p0,
    p1,
    deck,
    scrap: [],
    twos: [],
    discardedCards: [],
    fourRevealedCards: [],
    revealedCards: [],
    oneOff: null,
    oneOffTarget: null,
    oneOffTargetType: null,
    resolved: null,
    playedCard: null,
    targetCard: null,
    gameId,
    playedBy: 1,
    moveType: MoveType.DRAW,
    turn: 2,
    phase: GamePhase.MAIN,
    ...overrides,
  };
}

async function setupGame({ isRanked = false } = {}) {
  const player0 = await signupPlayer('player0');
  const player1 = await signupPlayer('player1');
  const game = await Game.create({
    name: 'Test Game',
    status: GameStatus.STARTED,
    isRanked,
    p0: player0.user.id,
    p1: player1.user.id,
    p0Ready: true,
    p1Ready: true,
  }).fetch();
  await sails.helpers.gameStates.saveGamestate(nearlyWonGameState(game.id));
  return { game, player0, player1 };
}

describe('Checking a game state for a win', () => {
  it('Declares the player with enough points the winner', () => {
    const gameState = nearlyWonGameState(1);
    gameState.p0.points = [ ...gameState.p0.points, Card.TEN_OF_SPADES ];
    const victory = sails.helpers.gameStates.checkGameStateForWin(gameState, 0);
    expect(victory).toEqual({ gameOver: true, winner: 0, conceded: false, currentMatch: null });
  });

  it('Ends the game in a stalemate after three passes', () => {
    const victory = sails.helpers.gameStates.checkGameStateForWin(nearlyWonGameState(1), 3);
    expect(victory).toEqual({ gameOver: true, winner: null, conceded: false, currentMatch: null });
  });

  it('Does not end a game that is still in progress', () => {
    const victory = sails.helpers.gameStates.checkGameStateForWin(nearlyWonGameState(1), 2);
    expect(victory.gameOver).toBe(false);
  });
});

describe('Counting passes', () => {
  const pass = (id) => ({ id, moveType: MoveType.PASS });
  const draw = (id) => ({ id, moveType: MoveType.DRAW });

  it('Counts three passes in a row ending at the given game state', () => {
    const { countPasses } = sails.helpers.gameStates;
    const gameStates = [ draw(1), pass(2), pass(3), pass(4), draw(5) ];
    expect(countPasses(gameStates, { id: 4 })).toBe(3);
    expect(countPasses(gameStates, { id: 5 })).toBeLessThan(3);
    expect(countPasses([ pass(1), draw(2), pass(3) ], { id: 3 })).toBeLessThan(3);
  });
});

describe('Ending a game', () => {
  beforeEach(async () => {
    await sails.helpers.wipeDatabase();
  });

  it('Records the winner when a move wins a casual game', async () => {
    const { game, player0 } = await setupGame();

    await player0.agent
      .post(`/api/game/${game.id}/move`)
      .send({ moveType: MoveType.POINTS, cardId: Card.TEN_OF_SPADES.id })
      .expect(200);

    const updatedGame = await Game.findOne({ id: game.id });
    expect(updatedGame.status).toBe(GameStatus.FINISHED);
    expect(updatedGame.winner).toBe(player0.user.id);
  });

  it('Adds a ranked game to its match when a move wins it', async () => {
    await createRunningSeason();
    const { game, player0 } = await setupGame({ isRanked: true });

    await player0.agent
      .post(`/api/game/${game.id}/move`)
      .send({ moveType: MoveType.POINTS, cardId: Card.TEN_OF_SPADES.id })
      .expect(200);

    const updatedGame = await Game.findOne({ id: game.id });
    expect(updatedGame.status).toBe(GameStatus.FINISHED);
    expect(updatedGame.winner).toBe(player0.user.id);
    expect(updatedGame.match).not.toBeNull();

    const match = await Match.findOne({ id: updatedGame.match }).populate('games');
    expect(match.games.map(({ id }) => id)).toEqual([ game.id ]);
  });

  it('Leaves the game in progress when a move does not end it', async () => {
    const { game, player0 } = await setupGame();

    await player0.agent
      .post(`/api/game/${game.id}/move`)
      .send({ moveType: MoveType.DRAW })
      .expect(200);

    const updatedGame = await Game.findOne({ id: game.id });
    expect(updatedGame.status).toBe(GameStatus.STARTED);
    expect(updatedGame.winner).toBeNull();
  });

  it('Does not record anything when creating socket events for a winning game state', async () => {
    await createRunningSeason();
    const { game } = await setupGame({ isRanked: true });
    const wonGameState = nearlyWonGameState(game.id, {
      playedBy: 0,
      moveType: MoveType.POINTS,
      turn: 3,
    });
    wonGameState.p0.hand = [];
    wonGameState.p0.points = [ ...wonGameState.p0.points, Card.TEN_OF_SPADES ];
    const gameStateRow = await sails.helpers.gameStates.saveGamestate(wonGameState);

    const fullGame = await Game.findOne({ id: game.id })
      .populate('p0')
      .populate('p1')
      .populate('gameStates', { sort: 'createdAt ASC' });
    const { spectatorState } = await sails.helpers.gameStates.createSocketEvents(
      fullGame,
      { ...wonGameState, id: gameStateRow.id },
    );

    // The socket event reports the win...
    expect(spectatorState.victory.gameOver).toBe(true);
    expect(spectatorState.victory.winner).toBe(0);
    // ...but the game is only recorded as finished by the move endpoint
    const unchangedGame = await Game.findOne({ id: game.id });
    expect(unchangedGame.status).toBe(GameStatus.STARTED);
    expect(unchangedGame.winner).toBeNull();
    expect(unchangedGame.match).toBeNull();
    expect(await Match.count()).toBe(0);
  });
});

/**
 * Loads a game the way a player re-opening it does (GET /api/game/:gameId?gameStateIndex=-1).
 * get-game only accepts socket requests, so call the controller directly
 */
async function loadGame(gameId, userId) {
  const joinSpy = vi.spyOn(sails.sockets, 'join').mockImplementation(() => {});
  let response;
  const res = {
    ok: (body) => { response = { status: 200, body }; },
    serverError: (body) => { response = { status: 500, body }; },
    status: (status) => ({ json: (body) => { response = { status, body }; } }),
  };
  try {
    await getGame({ params: { gameId }, query: { gameStateIndex: -1 }, session: { usr: userId } }, res);
  } finally {
    joinSpy.mockRestore();
  }
  return response;
}

describe('Re-opening a game whose end was not fully recorded', () => {
  beforeEach(async () => {
    await sails.helpers.wipeDatabase();
  });

  it('Adds a ranked game to its match if the winning move failed to', async () => {
    await createRunningSeason();
    const { game, player0 } = await setupGame({ isRanked: true });

    // Adding the game to its match fails after the game has been marked finished
    const addGameToMatchSpy = vi
      .spyOn(sails.helpers, 'addGameToMatch')
      .mockImplementation(() => Promise.reject(new Error('Simulated database failure')));
    try {
      await player0.agent
        .post(`/api/game/${game.id}/move`)
        .send({ moveType: MoveType.POINTS, cardId: Card.TEN_OF_SPADES.id })
        .expect(500);
    } finally {
      addGameToMatchSpy.mockRestore();
    }

    const partlyRecordedGame = await Game.findOne({ id: game.id });
    expect(partlyRecordedGame.status).toBe(GameStatus.FINISHED);
    expect(partlyRecordedGame.match).toBeNull();

    const { status, body } = await loadGame(game.id, player0.user.id);
    expect(status).toBe(200);
    expect(body.victory.gameOver).toBe(true);
    expect(body.victory.currentMatch.games.map(({ id }) => id)).toEqual([ game.id ]);

    const recordedGame = await Game.findOne({ id: game.id });
    expect(recordedGame.match).not.toBeNull();
    const match = await Match.findOne({ id: recordedGame.match }).populate('games');
    expect(match.games.map(({ id }) => id)).toEqual([ game.id ]);
  });

  it('Marks the game finished if the winning move failed to', async () => {
    const { game, player0 } = await setupGame();
    const wonGameState = nearlyWonGameState(game.id, { playedBy: 0, moveType: MoveType.POINTS, turn: 3 });
    wonGameState.p0.hand = [];
    wonGameState.p0.points = [ ...wonGameState.p0.points, Card.TEN_OF_SPADES ];
    await sails.helpers.gameStates.saveGamestate(wonGameState);

    const { status } = await loadGame(game.id, player0.user.id);
    expect(status).toBe(200);

    const recordedGame = await Game.findOne({ id: game.id });
    expect(recordedGame.status).toBe(GameStatus.FINISHED);
    expect(recordedGame.winner).toBe(player0.user.id);
  });

  it('Does not record anything again for a game that is fully recorded', async () => {
    await createRunningSeason();
    const { game, player0 } = await setupGame({ isRanked: true });
    await player0.agent
      .post(`/api/game/${game.id}/move`)
      .send({ moveType: MoveType.POINTS, cardId: Card.TEN_OF_SPADES.id })
      .expect(200);
    const recordedGame = await Game.findOne({ id: game.id });

    const finishGameSpy = vi.spyOn(sails.helpers.gameStates, 'finishGame');
    try {
      const { status, body } = await loadGame(game.id, player0.user.id);
      expect(status).toBe(200);
      expect(body.victory.currentMatch.id).toBe(recordedGame.match);
      expect(finishGameSpy).not.toHaveBeenCalled();
    } finally {
      finishGameSpy.mockRestore();
    }
    expect(await Match.count()).toBe(1);
  });
});
