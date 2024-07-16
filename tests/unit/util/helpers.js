import { expect, test } from 'vitest';


function removeAttribute (points, attributeToRemove){
  const cleanData = points.map ((card)=>{
    card.attachments.forEach(attachment => {
      if (Object.hasOwn(attachment, attributeToRemove) ){
        delete attachment[attributeToRemove];
      }
    });
    return card;
  });
  return cleanData;
}

export function assertGameStateRow(fixture, gameStateRow) {
  //remove attributes added while creating the entry in the database
  const attributesToRemove = ['createdAt', 'id', 'updatedAt'];
  attributesToRemove.forEach(el => delete gameStateRow[el]);

  expect(fixture).toEqual(gameStateRow);
}

/**
 * @param gameState:
 * @param gameStateRow
 */
export function assertGameState(fixture, gameState) {

  //For Jack's Attachment => an attribute 'attachedTo' on attached cards on 'points' is not present on fixtures
  const attributeToRemove = 'attachedTo';
  gameState.p0.points = removeAttribute( gameState.p0.points, attributeToRemove);
  gameState.p1.points = removeAttribute(gameState.p1.points, attributeToRemove);

  expect(fixture).toEqual(gameState);

}