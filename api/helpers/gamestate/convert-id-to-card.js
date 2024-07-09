const cardMap = require('../../temp/cardMap');
/**
 * Convert a string representation to isolate the card identifier rank and suit
 *
 * @param {string} str - string representation of the card
 * @returns {object} { suit: suit, rank : rank} card identifier rank and suit
 */
function convertIdToCard (str){
  const strCard = str.split('');

  if(strCard.length===2){

      const tempCard = { rank : str[0], suit : str[1] };

      const suit = typeof tempCard.suit === 'string' ? cardMap.suitMap[tempCard.suit.toUpperCase()] : undefined;
    
      const rank = !isNaN(tempCard.rank) ? parseInt(tempCard.rank) : cardMap.rankMap[tempCard.rank.toUpperCase()];

      if (rank === undefined) {
        throw new Error('Unrecognisabled rank ' + tempCard.rank);
      }
      if (suit === undefined) {
        throw new Error('Unrecognisabled suit ' + tempCard.suit);
      } 

      return { suit: suit, rank : rank, id: str, attachments : null};   
  }
  
  throw new Error('Unrecognised card identifier ' + str);
  
}

 /**
 * separate the attachments to the Card identifier in a String representation
 *
 * @param {string } str - Card Object
 * @returns {Object} Object with maincard and its attachments in format
 * {       
 *      mainCard :{
        suit: number || string;
        rank: number || string;
                  };
        attachments: [{
                        suit: number || string;
                        rank: number || string;
                    }];
          }
 /**
 */
 function separateAttachtToCard(str){ 
    //  Simple card eg :‘3D’
    if(str.length===2){
        return convertIdToCard(str);
    }
    // Card with attachment(attached by Jacks) eg : ‘TH(JH-p0,JC-p1,JD-p0)’
    else if(str.length >2){
        const y = oraganiseAttachments(str);
        const mainCard = convertIdToCard(y.mainCard);
        mainCard['attachments'] = y.attachments ;
        return  mainCard ;
    } 
    throw new Error('Unrecognised card identifier format' + str);
}


/**
 * oraganise the Attachments string representation to an array and returns an object representationg the card
 *
 * @param {string } str - string representation of attachments
 * @returns {Object} Object with maincard and its attachments in format
 * {       
 *      mainCard :{
        suit: number || string;s
        rank: number || string;
                  };
        attachments: [{
                        suit: number || string;
                        rank: number || string;
                    }];
          }
 /**
 */
 function oraganiseAttachments(str){
    // get content before parentheses -> main Card
    let mainCardId = str.replace(/\(.*?\)/g, '');

    //get content inside parentheses -> attachements
    const regex = /\(([^)]+)\)/;
    const attachmentsString = str.match(regex);
    //split using the comma
    const attachmentsArray = attachmentsString ? attachmentsString[1].split(',') : [];
    
    const attachments = [];
    attachmentsArray.map(element => { 
          //split using the '-' -> [0]:before : card, [1]:player
          let content = element.split('-');
          let card =  convertIdToCard( content[0] );
          card['attachedTo'] = mainCardId;
          attachments.push(card);
    });

    return { mainCard : mainCardId, attachments : attachments.length >0 ?  attachments : null};
}

/**
 * Convert a string representation to a card object
 *
 * @param {string} str - string representation of the card
 * @returns {Card} Card object
 */

module.exports = {
  friendlyName: 'Convert card id (string representation ) to card Object',

  description: 'Convert card id (string representation ) to card Object',

  inputs: {
    str: {
      type: 'string',
      description: 'string representation of a card',
      required: true,
    },
  },
  sync: true,

  fn: ({ str }, exits) => {

        try {
          const card = separateAttachtToCard(str);
          
          return exits.success(card);
        } catch (err) {
          return  exits.error(err.message);
        }

    }
};
