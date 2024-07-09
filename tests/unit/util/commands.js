import { assertGameStateRow, gCardsConvertion} from './helpers';


export async function testConvertionGamestateRow(applygCardsConvertion, fixture){
    let gameStateRowFixture =  {};

    if(applygCardsConvertion){
      gameStateRowFixture = gCardsConvertion(fixture);
    }
    else{
      gameStateRowFixture =  fixture;
    }
    const gameState =  await sails.helpers.gamestate.unpackGamestate(gameStateRowFixture);

    assertGameStateRow(gameState, gameStateRowFixture);


    const gameStateRow = await sails.helpers.gamestate.saveGamestate(gameState);

    assertGameStateRow(gameState, gameStateRow);

}
