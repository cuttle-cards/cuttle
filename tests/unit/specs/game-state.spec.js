import { describe, it , expect} from 'vitest';
import { fixture } from '../fixtures/gameState';

describe('Coverting GameStates and to GameStateRows', () => {

  it('Converts GameState to GameStateRow(pack)', async () => {
    const gameStateRow = await sails.helpers.gamestate.saveGamestate(fixture.gameState);

    //remove attributes added while creating the entry in the database
    const attributesToRemove = ['createdAt', 'id', 'updatedAt'];
    attributesToRemove.forEach(el => delete gameStateRow[el]);

    expect(fixture.gameStateRow).toEqual(gameStateRow);
  });


  it('Converts GameStateRow to GameState(unpack)', () => {
    const gameState =  sails.helpers.gamestate.unpackGamestate(fixture.gameStateRow);

    expect(fixture.gameState).toEqual(gameState);
  });
});