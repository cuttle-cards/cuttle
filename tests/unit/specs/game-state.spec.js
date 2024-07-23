import { describe, it , expect} from 'vitest';
import { fixture } from '../fixtures/gameState';

describe('Coverting GameState\'s and GameStateRow\'s', () => {

  beforeEach(async () => {
    await sails.helpers.wipeDatabase();
  });

  it('Converts GameState to GameStateRow (packing)', async () => {
    const gameStateRow = await sails.helpers.gamestate.saveGamestate(fixture.gameState);

    //remove attributes added while creating the entry in the database
    const stripDbAttributes = (obj) => {
      const attributesToRemove = ['createdAt', 'id', 'updatedAt'];
      attributesToRemove.forEach(attr => delete obj[attr]);
    };

    stripDbAttributes(gameStateRow);
    expect(gameStateRow).toEqual(fixture.gameStateRow);

    const dbGameStateRows = await GameStateRow.find({ gameId : gameStateRow.gameId });
    expect(dbGameStateRows.length).toEqual(1);

    const [ savedRow ] = dbGameStateRows;
    stripDbAttributes(savedRow);
    expect(savedRow).toEqual(fixture.gameStateRow);
  });

  it('Converts GameStateRow to GameState (unpacking)', () => {
    const gameState =  sails.helpers.gamestate.unpackGamestate(fixture.gameStateRow);
    expect(fixture.gameState).toEqual(gameState);
  });
});
