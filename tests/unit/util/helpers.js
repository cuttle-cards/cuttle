import { gameStateRowMap } from '../fixtures/gameStateRowMap';
import { expect } from 'vitest';

export function gCardsConvertion(fixture){
  let gameStateRow =  {};
  for (let key in fixture) {
      if (Array.isArray(fixture[key])){   
        let temp = [];
        fixture[key].forEach(card => {
          if(card){
            temp.push(card.id);
          }
        });
        gameStateRow[key]  = temp;
      }
      else if (isNaN(fixture[key])){
        if(fixture[key]){
          gameStateRow[key]  = fixture[key]['id'];
        }
      }
      else{
        gameStateRow[key]  = fixture[key];
      }
    }
    return gameStateRow;
}
function cardsMatch(card1, card2) {
  return card1.rank === card2.rank && card1.suit === card2.suit;
}

function findCardById(id) {
  for (const card in gameStateRowMap.cards) {
    if (gameStateRowMap.cards[card]['id'] === id) {
      return card;
    }
  }
  return; 
}
function findCardBySRankSuit(card) {
  for (const el in gameStateRowMap.cards) {
    if (cardsMatch (gameStateRowMap.cards[el], card)) {
      return el;
    }
  }
  return; 
}

function getRowAttachments(str){
  //get content inside parentheses -> attachements
  const regex = /\(([^)]+)\)/;
  const attachmentsString = str.match(regex);
  //split using the comma
  const attachmentsArray = attachmentsString ? attachmentsString[1].split(',') : [];
  
  const attachments = [];
  attachmentsArray.map(element => { 
        //split using the '-' -> [0]:before : card, [1]:player
        let content = element.split('-');
        attachments.push(content[0]);
  });

  return  attachments;
}
function attachmentMatch(attachements1, attachements2) {
  for (let i = 0; i < attachements1.length; i++) {
    if (attachements1[i] !== attachements2[i]) {
      return false;
    }
  }
  return true;
}

function gameStateRowMatch(gameStateLine, gameStateRowLine) {
  // If length is not equal
  if (gameStateLine.length !== gameStateRowLine.length){
    return false;
  }
  //Convert Cards though GameStateRowMap
  const rowAttachment =[];
  const rowCardConverted = [];
 gameStateRowLine.forEach(id => {   
                    // get content before parentheses -> main Card
                    let cleanId = id.replace(/\(.*?\)/g, '');
                    if(id.length >2){
                      rowAttachment.push({ maincard : cleanId, attachments : getRowAttachments(id) });
                    }
                    rowCardConverted.push(findCardById(cleanId));
                  });

  const gAttachment = [];
  const gstCardConverted = [];
  gameStateLine.forEach(card => {
                  if(card.attachments){
                    const gAtt = card.attachments.map(attachment => attachment.id);
                    gAttachment.push( { maincard : card.id , attachments : gAtt});
                  }
                  gstCardConverted.push(findCardBySRankSuit(card));
                 });

  if ((rowCardConverted.length != gstCardConverted.length) || 
      (rowCardConverted.length != gameStateRowLine.length) ||
      (gstCardConverted.length != gameStateLine.length) ||
      (gAttachment.length != rowAttachment.length)
    ){
    return false;
  }

  rowCardConverted.sort();
  gstCardConverted.sort();
  // Comparing each element of array
  for (let i = 0; i < rowCardConverted.length; i++){
    if (rowCardConverted[i] != gstCardConverted[i]){
      return false;
    }
  }
  //if any attachment
  if(gAttachment){
    for (let i =0 ; i< gAttachment.length; i++){
      const rowAtt = rowAttachment.find(obj => obj.maincard === gAttachment[i]['maincard'] );
      attachmentMatch(gAttachment[i].attachments, rowAtt.attachments );
    } 
  }

  return true;
}

/**
 * @param gameState:
 * @param gameStateRow
 */
export function assertGameStateRow(gameState, gameStateRow) {
    const attributesToConvert = [
      'deck', 'scrap', 'playedCard', 'targetCardId', 'targetCard2Id', 'oneOff', 'oneOffTarget', 'twos', 'resolving',
      'p0Hand', 'p1Hand', 'p0Points', 'p1Points', 'p0FaceCards', 'p1FaceCards'
    ];
    for (let el in gameStateRow) {
      if(!attributesToConvert.includes(el)){
        continue;
      }
      let rowValue;
      let gameStateValue;
        // if is listed in the pathMap = meaning the paths differ from gamestate to gamestateRow
        if(Object.hasOwn(gameStateRowMap.pathMap, el)){
          rowValue = gameStateRow[el] ? gameStateRow[el] : [];
          const y = gameState[gameStateRowMap.pathMap[el]['player']][gameStateRowMap.pathMap[el]['att']];
          gameStateValue = y  ? y : [];
        } 
        else if (Array.isArray( gameStateRow[el])){
          rowValue = gameStateRow[el];
          gameStateValue = gameState[el];
        }
        else if (typeof  gameStateRow[el] === 'string'){
          rowValue = [ gameStateRow[el] ];
          gameStateValue = [ gameState[el] ];
        }
        if(!gameStateRow[el] ){
          rowValue = [];
        }
        if(!gameStateValue){
          gameStateValue = [];
        }

        expect(gameStateRowMatch( gameStateValue , rowValue)).to.eq(
          true,
          `GameStateRow ${el} should match ${rowValue}, 
          but actual: ${gameStateValue} did not match fixture`
        );
  }
}	