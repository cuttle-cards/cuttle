import { expect, test } from 'vitest';

function sortData (attributesToConvert, ob){
  const sortedData = {};
  attributesToConvert.forEach( el => {
    if( ob[el].length >0){
      ob[el].sort((a, b) => a.id.localeCompare(b.id));
    }
    sortedData[el] = ob[el];
  });
  return sortedData;
}
function sortAndCleanPoints (points, attributeToRemove){
  const cleanData = points.map ((card)=>{
    card.attachments.forEach(attachment => {
      if (Object.hasOwn(attachment, attributeToRemove) ){
        delete attachment[attributeToRemove];
      }
    });
    return card;
  });
  return sortData(['points'], { points : cleanData});
}

function sortArray(attributesToConvert, array){
  const sortedArray = {};
  attributesToConvert.forEach( el => {
    if(el){
      sortedArray[el] = array[el].sort();
    }
  });
  return sortedArray;
}
export function assertGameStateRow(fixture, gameStateRow) {
  //remove attributes added while creating the entry in the database
  const attributesToRemove = ['createdAt', 'id', 'updatedAt'];
  attributesToRemove.forEach(el => delete gameStateRow[el]);

  //Sorting the arrays
  const attributesToSort = ['deck', 'scrap',  'twos', 'discardedCards', 'p0Hand',
                           'p1Hand', 'p0Points', 'p1Points', 'p0FaceCards', 'p1FaceCards'];

  const sortedFixture = sortArray(attributesToSort, fixture);
  const sortedGameStateRow = sortArray(attributesToSort, gameStateRow);


  test('GamestateRow ', () => {
    expect(sortedFixture).toEqual(sortedGameStateRow);
  });
}

/**
 * @param gameState:
 * @param gameStateRow
 */
export function assertGameState(fixture, gameState) {
  //sort Array of cards
  const attributesToSort = ['deck', 'scrap',  'twos', 'discardedCards'];
  const sortedArray = sortData(attributesToSort, gameState);
  const sortedFixtureArray = sortData(attributesToSort, fixture);

  //sort Array of cards in player data
  const playerAttributesToSort = ['hand',  'faceCards'];

  sortedArray.p0 = sortData(playerAttributesToSort, gameState.p0);
  sortedArray.p1 = sortData(playerAttributesToSort, gameState.p1);
  //For Jack's Attachment => added attribute on 'points' from the backend : 'attachedTo'
  const attributeToRemove = 'attachedTo';
  sortedArray.p0.points = sortAndCleanPoints( gameState.p0.points, attributeToRemove);
  sortedArray.p1.points = sortAndCleanPoints(gameState.p1.points, attributeToRemove);

  //fixture doesnt have the attributes, so just add 'points' to playerAttributesToSort
  playerAttributesToSort.push('points');
  sortedFixtureArray.p1 = sortData(playerAttributesToSort, fixture.p1);
  sortedFixtureArray.p0 = sortData(playerAttributesToSort,fixture.p0);

  const fixtureSorted = { ...fixture, ...sortedFixtureArray};
  const gameStateSorted = { ...gameState, ...sortedArray};

  test('Gamestate ', () => {
    expect(fixtureSorted).toEqual(gameStateSorted);
  });
}