import { expect } from 'vitest';

function cardsMatch(card1, card2) {
  if(card1 && card2){
    return card1.rank === card2.rank && card1.suit === card2.suit;
  }
  return false;
}

function gameStateRowMatch(fixture, res) {
  // If length is not equal
  if (fixture.length !== res.length){
    return false;
  }
 
  fixture.sort();
  res.sort();
  // Comparing each element of array
  for (let i = 0; i < fixture.length; i++){
    if (fixture[i] != res[i]){
      return false;
    }
  }
  return true;
}

function gameStateMatch( res, fixture) {
  // If length is not equal
  if (fixture.length !== res.length){
    return false;
  }
 
  fixture.sort((a, b) => a.id.localeCompare(b.id));
  res.sort((a, b) => a.id.localeCompare(b.id));
  // Comparing each element of array
  for (let i = 0; i < fixture.length; i++){
    if (!cardsMatch(fixture[i] , res[i])){
      return false;
    }
    //attachments
    if(Object.hasOwn(fixture[i] , 'attachments')){
      for (let j = 0; j < fixture[i]['attachments'].length; j++){

        let fixtureAtt = fixture[i]['attachments'][j];
        let resAtt = res[i]['attachments'][j] ? res[i]['attachments'][j] : null;
        if (!cardsMatch(fixtureAtt, resAtt)){
          return false;
        }

      }
    }
  }
  return true;
}

export function assertGameStateRow(fixture, gameStateRow) {
  const attributesToConvert = [
    'deck', 'scrap', 'playedCard', 'targetCardId', 'targetCard2Id', 'oneOff', 'oneOffTarget', 'twos', 'resolving',
    'p0Hand', 'p1Hand', 'p0Points', 'p1Points', 'p0FaceCards', 'p1FaceCards'
  ];
  for (let el in gameStateRow) {
    if(!attributesToConvert.includes(el)){
      continue;
    }
    let fixtureValue;
    let resValue;
    if (Array.isArray( gameStateRow[el])){
        fixtureValue = fixture[el];
        resValue = gameStateRow[el];
      }
      else if (typeof  gameStateRow[el] === 'string'){
        fixtureValue = [ fixture[el] ];
        resValue = [ gameStateRow[el] ];
      }
      if(!fixtureValue ){
        fixtureValue = [];
      }
      if(!resValue){
        resValue = [];
      }

      expect(gameStateRowMatch( resValue , fixtureValue)).to.eq(
        true,
        `GameStateRow ${el} should match ${fixtureValue}, 
        but actual: ${resValue} did not match fixture`
      );
  }
}

/**
 * @param gameState:
 * @param gameStateRow
 */
export function assertGameState(fixture, gameState) {
  const attributesToConvert = [
    'deck', 'scrap', 'playedCard', 'targetCardId', 'targetCard2Id', 'oneOff', 'oneOffTarget', 'twos', 'resolving',
    'p0', 'p1'
  ];
  for (let el in gameState) {
    if(!attributesToConvert.includes(el)){
      continue;
    }
    let fixtureValue;
    let resValue;
    if(el =='p0'|| el =='p1'){
        for (let element in fixture[el]){
            fixtureValue = fixture[el][element];
            resValue = gameState[el][element];

            expect(gameStateMatch( resValue , fixtureValue)).to.eq(
              true,
              `GameState ${el} ${element} should match ${fixtureValue}, 
              but actual: ${resValue} did not match fixture`
            );
        }
      } 

      else if (Array.isArray( fixture[el])){
        fixtureValue = fixture[el] ?  fixture[el]  : [];
        resValue = gameState[el] ?  gameState[el]  : [];
      }
      else if (isNaN(fixture[el] )){
        fixtureValue = fixture[el] ? [ fixture[el] ] : [];
        resValue = gameState[el] ? [ gameState[el] ] : [];
      }
     if( !fixture[el]){
      fixtureValue = [];
     }
     if( !gameState[el]){
      resValue = [];
     }

      expect(gameStateMatch( resValue , fixtureValue)).to.eq(
        true,
        `GameState ${el} should match ${fixtureValue}, 
        but actual: ${resValue} did not match fixture`
      );
  }
}	