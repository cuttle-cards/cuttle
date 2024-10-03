import { describe, it, expect, beforeEach } from 'vitest';
import { points } from '../fixtures/gameStates/points';
import { resolveThree } from '../fixtures/gameStates/resolveThree';
import { resolveNine } from '../fixtures/gameStates/resolveNine';

// remove attributes added while creating the entry in the database
function stripDbAttributes(obj) {
  const attributesToRemove = ['createdAt', 'id', 'updatedAt'];
  attributesToRemove.forEach((attr) => delete obj[attr]);
}

describe("Converting GameState's and GameStateRow's and emitting sockets for Points", () => {
  beforeEach(async () => {
    await sails.helpers.wipeDatabase();
  });

  it('Converts GameState to GameStateRow (packing)', async () => {
    const gameStateRow = await sails.helpers.gamestate.saveGamestate(points.gameState);

    stripDbAttributes(gameStateRow);
    expect(gameStateRow).toEqual(points.gameStateRow);

    const dbGameStateRows = await GameStateRow.find({ gameId: gameStateRow.gameId });
    expect(dbGameStateRows.length).toEqual(1);

    const [savedRow] = dbGameStateRows;
    stripDbAttributes(savedRow);
    expect(savedRow).toEqual(points.gameStateRow);
  });

  it('Converts GameStateRow to GameState (unpacking)', () => {
    const gameState = sails.helpers.gamestate.unpackGamestate(points.gameStateRow);
    expect(points.gameState).toEqual(gameState);
  });

  it('Creates and Publishes socket event', async () => {
    const socketEvent = await sails.helpers.gamestate.publishGameState(points.game, points.gameState);
    stripDbAttributes(socketEvent.game);
    delete socketEvent.game.match.startTime;
    delete socketEvent.victory.currentMatch.startTime;
    socketEvent.victory.currentMatch.games.forEach((game) => stripDbAttributes(game));
    expect(socketEvent).toEqual(points.socket);
  });
});

describe('Converting GameState, and GameStateRow, and Publishing Socket for Resolve Three', () => {
  beforeEach(async () => {
    await sails.helpers.wipeDatabase();
  });

  it('Converts GameState to GameStateRow (packing)', async () => {
    const gameStateRow = await sails.helpers.gamestate.saveGamestate(resolveThree.gameState);
    stripDbAttributes(gameStateRow);
    expect(gameStateRow).toEqual(resolveThree.gameStateRow);

    const dbGameStateRows = await GameStateRow.find({ gameId: gameStateRow.gameId });
    expect(dbGameStateRows.length).toEqual(1);

    const [savedRow] = dbGameStateRows;
    stripDbAttributes(savedRow);
    expect(savedRow).toEqual(resolveThree.gameStateRow);
  });

  it('Converts GameStateRow to GameState (unpacking)', async () => {
    const gameState = await sails.helpers.gamestate.unpackGamestate(resolveThree.gameStateRow);
    stripDbAttributes(gameState);
    expect(gameState).toEqual(resolveThree.gameState);
  });

  it('Creates and Publishes socket event', async () => {
    const socketEvent = await sails.helpers.gamestate.publishGameState(
      resolveThree.game,
      resolveThree.gameState,
    );
    stripDbAttributes(socketEvent.game);
    expect(socketEvent).toEqual(resolveThree.socket);
  });
});

describe('Converting GameState, and GameStateRow, and Publishing Socket for Resolve Nine on Jack', () => {
  beforeEach(async () => {
    await sails.helpers.wipeDatabase();
  });

  it('Converts GameState to GameStateRow (packing)', async () => {
    const gameStateRow = await sails.helpers.gamestate.saveGamestate(resolveNine.gameState);
    stripDbAttributes(gameStateRow);
    expect(gameStateRow).toEqual(resolveNine.gameStateRow);

    const dbGameStateRows = await GameStateRow.find({ gameId: gameStateRow.gameId });
    expect(dbGameStateRows.length).toEqual(1);

    const [savedRow] = dbGameStateRows;
    stripDbAttributes(savedRow);
    expect(savedRow).toEqual(resolveNine.gameStateRow);
  });

  it('Converts GameStateRow to GameState (unpacking)', async () => {
    const gameState = await sails.helpers.gamestate.unpackGamestate(resolveNine.gameStateRow);
    stripDbAttributes(gameState);
    expect(gameState).toEqual(resolveNine.gameState);
  });

  it('Creates and Publishes socket event', async () => {
    const socketEvent = await sails.helpers.gamestate.publishGameState(
      resolveNine.game,
      resolveNine.gameState,
    );

    stripDbAttributes(socketEvent.game);
    expect(socketEvent).toEqual(resolveNine.socket);
  });
});
