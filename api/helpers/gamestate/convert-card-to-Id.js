const cardMap = require('../../temp/cardMap');

/**
 * Convert a card object to its string representation
 *
 * @param {Card} card - card object
 * @returns {string} String representation of the card
 */
function convertCardToId(card){
  const suitKey =  Object.keys(cardMap.suitMap).find(key => cardMap.suitMap[key] === card.suit);

  const rankKey = card.rank === 1 || card.rank > 9 ? 
                          Object.keys(cardMap.rankMap).find(key => cardMap.rankMap[key] === card.rank)
                          : parseInt(card.rank) ;

  if(suitKey === undefined || suitKey === null ){
    throw new Error('Unrecognisabled suit ' + card.suit ) ;
  }
  if(rankKey === undefined || rankKey === null){
    throw new Error('Unrecognisabled rank ' +  card.rank) ;
  }
  return rankKey + suitKey;
}

 /**
 * Convert the attachments attribute of a card object to its string representation
 *
 * @param {Card, playerid } card, player - Card Object, playerId
 * @returns {string} string representation of the card atatchements attributs
 */
 function concatAttachtToId(card, playedBy){
    if( card.attachments === null || card.attachments === undefined || card.attachments.length === 0){
        return '';
    }

    let playerNum = playedBy === '0' ? 'p0' : 'p1'; 

    let attachmentStr ='(';

    //Format => (JH-p0,JC-p1,JD-p0) cardInString + '-' + player (+',')
    card.attachments.forEach((element, index)=>{
      const cardInString = convertCardToId( element );
      let comma = index < card.attachments.length -1 ? ',': '';
      attachmentStr += cardInString + '-' + playerNum + comma;
      playerNum = playerNum === 'p0' ? 'p1' : 'p0';
    });

    return attachmentStr + ')';
}


/**
 * Convert a card object to its string representation
 *
 * @param { Card} card - card object
 * @returns {string} String representation of the card
 */

module.exports = {
  friendlyName: 'Convert card object to id (string representation )',

  description: '',

  inputs: {
    card: {
      type: 'ref',
      description: 'card',
      required: true,
    },
    playedBy: {
      type: 'string',
      description: 'player',
      required: false,
    },
  },
  sync: true,

  fn: ({ card, playedBy }, exits) => {

      try {
          const mainCard = convertCardToId(card);
          const attachments = concatAttachtToId(card, playedBy);

          return exits.success( mainCard +  attachments);

      } catch (err) {

        return exits.error('Error at unpacking cards : ' +err.message);
      }
    }
};

