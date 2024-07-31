import { describe, it, expect, beforeEach } from 'vitest';
import { fixture, resolveThree } from '../fixtures/gameState';

//remove attributes added while creating the entry in the database
const stripDbAttributes = (obj) => {
  const attributesToRemove = ['createdAt', 'id', 'updatedAt'];
  attributesToRemove.forEach((attr) => delete obj[attr]);
};

describe("Coverting GameState's and GameStateRow's", () => {
  beforeEach(async () => {
    await sails.helpers.wipeDatabase();
  });

  it('Converts GameState to GameStateRow (packing)', async () => {
    const gameStateRow = await sails.helpers.gamestate.saveGamestate(fixture.gameState);

    stripDbAttributes(gameStateRow);
    expect(gameStateRow).toEqual(fixture.gameStateRow);

    const dbGameStateRows = await GameStateRow.find({ gameId: gameStateRow.gameId });
    expect(dbGameStateRows.length).toEqual(1);

    const [savedRow] = dbGameStateRows;
    stripDbAttributes(savedRow);
    expect(savedRow).toEqual(fixture.gameStateRow);
  });

  it('Converts GameStateRow to GameState (unpacking)', () => {
    const gameState = sails.helpers.gamestate.unpackGamestate(fixture.gameStateRow);
    expect(fixture.gameState).toEqual(gameState);
  });
});

describe('resolveThree', () => {
  it('Converts resolveThree GameStateRow to gameState, then emits socket', async () => {
    const gameStateRow = await sails.helpers.gamestate.saveGamestate(resolveThree.gameState);
    stripDbAttributes(gameStateRow);
    expect(gameStateRow).toEqual(resolveThree.gameStateRow);

    const gameState = await sails.helpers.gamestate.unpackGamestate(gameStateRow);
    stripDbAttributes(gameState);
    expect(gameState).toEqual(resolveThree.gameState);

    const socketEvent = await sails.helpers.gamestate.emitGameState(resolveThree.game, gameState);
    stripDbAttributes(socketEvent.game);
    expect(socketEvent).toEqual(resolveThree.socket);
  });
});
