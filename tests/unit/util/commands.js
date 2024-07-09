import { assertGameStateRow, assertGameState} from './helpers';


export async function testConvertionGamestate(fixture){

  const gameStateRow = await sails.helpers.gamestate.saveGamestate(fixture.gameState);
  assertGameStateRow(fixture.gameStateRow, gameStateRow);

  const gameState =  await sails.helpers.gamestate.unpackGamestate(gameStateRow);
  assertGameState(fixture.gameState, gameState);

}

export async function testConvertionGamestateRow(fixture){
  const gameState =  await sails.helpers.gamestate.unpackGamestate(fixture.gameStateRow);

  const gameStateRow = await sails.helpers.gamestate.saveGamestate(gameState);
  assertGameStateRow(fixture.gameStateRow, gameStateRow);


}