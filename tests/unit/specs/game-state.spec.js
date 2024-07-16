import { assertGameStateRow, assertGameState} from '../util/helpers';
import { describe, it } from 'vitest';
import { fixture } from '../fixtures/gameState';

describe('Coverting GameStates and to GameStateRows', () => {

  it('Converts GameState to GameStateRow(pack)', async () => {
    const gameStateRow = await sails.helpers.gamestate.saveGamestate(fixture.gameState);
    assertGameStateRow(fixture.gameStateRow, gameStateRow);
  });


  it('Converts GameStateRow to GameState(unpack)', () => {
    const gameState =  sails.helpers.gamestate.unpackGamestate(fixture.gameStateRow);
    assertGameState(fixture.gameState, gameState);
  });
});