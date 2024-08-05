import { describe, it, expect, beforeEach } from 'vitest';
import { scuttle, resolveThree } from '../fixtures/gameState';

//remove attributes added while creating the entry in the database
function stripDbAttributes(obj) {
  const attributesToRemove = ['createdAt', 'id', 'updatedAt'];
  attributesToRemove.forEach((attr) => delete obj[attr]);
}

describe("Coverting GameState's and GameStateRow's and emitting sockets", () => {
  beforeEach(async () => {
    await sails.helpers.wipeDatabase();
  });

  it('Converts GameState to GameStateRow (packing)', async () => {
    const gameStateRow = await sails.helpers.gamestate.saveGamestate(scuttle.gameState);

    stripDbAttributes(gameStateRow);
    expect(gameStateRow).toEqual(scuttle.gameStateRow);

    const dbGameStateRows = await GameStateRow.find({ gameId: gameStateRow.gameId });
    expect(dbGameStateRows.length).toEqual(1);

    const [savedRow] = dbGameStateRows;
    stripDbAttributes(savedRow);
    expect(savedRow).toEqual(scuttle.gameStateRow);
  });

  it('Converts GameStateRow to GameState (unpacking)', () => {
    const gameState = sails.helpers.gamestate.unpackGamestate(scuttle.gameStateRow);
    expect(scuttle.gameState).toEqual(gameState);
  });
  
  it('Converts resolveThree GameStateRow to gameState, then emits socket', async () => {
    const gameStateRow = await sails.helpers.gamestate.saveGamestate(resolveThree.gameState);
    stripDbAttributes(gameStateRow);
    expect(gameStateRow).toEqual(resolveThree.gameStateRow);
  
    const gameState = await sails.helpers.gamestate.unpackGamestate(gameStateRow);
    stripDbAttributes(gameState);
    expect(gameState).toEqual(resolveThree.gameState);
  
    const socketEvent = await sails.helpers.gamestate.publishGameState(resolveThree.game, gameState);
    stripDbAttributes(socketEvent.game);
    expect(socketEvent).toEqual(resolveThree.socket);
  });
});
