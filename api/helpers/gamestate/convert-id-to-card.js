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

      return { suit: suit, rank : rank};   
  }
  
  throw new Error('Unrecognised card identifier ' + str);
  
}

 /**
 * separate the attachments to the Card identifier in a String representation
 *
 * @param {string } str - Card Object, playerId
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
        return { mainCard : convertIdToCard(str), attachments : null };
    }
    // Card with attachment(attached by Jacks) eg : ‘TH(JH-p0,JC-p1,JD-p0)’
    else if(str.length >2){
        const y = oraganiseAttachments(str);
        return { mainCard : convertIdToCard(y.mainCard), attachments : y.attachments };
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
    let mainCard = str.replace(/\(.*?\)/g, '');

    //get content inside parentheses -> attachements
    const regex = /\(([^)]+)\)/;
    const attachmentsString = str.match(regex);
    //split using the comma
    const attachmentsArray = attachmentsString ? attachmentsString[1].split(',') : [];
    const attachments = [];

    attachmentsArray.forEach(element => {
          //split using the '-' -> [0]:before : card, [1]:player
          let content = element.split('-');
          let card =  convertIdToCard( content[0] );
      
          attachments.push(card);
    });

    return { mainCard : mainCard, attachments : attachments.length >0 ?  attachments : null};
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
      description: 'string rep of a card',
      required: true,
    },
    playedBy: {
      type: 'number',
      description: 'player',
      required: false,
    },
  },
  //sync: true,

  fn: async ({ str, playerId }, exits) => {

        try {
          const card = separateAttachtToCard(str);
          const data = {  
            suit : card.mainCard.suit, 
            rank : card.mainCard.rank, 
          };

          //mainCard
          let mainCard = await Card.create(data).fetch();

          //attachments
          if(card.attachments !== null && card.attachments !== undefined){

              for (let i = 0 ; i< card.attachments.length ; i++) {
                  let dataatt = {
                        suit: card.attachments[i].suit,
                        rank: card.attachments[i].rank,
                        attachedTo: mainCard.id,
                        index: i,
                  };
                  if(playerId !== null){
                    data[model] = playerId;
                  }

                  let attachment = await Card.create(dataatt).fetch();

                  await Card.addToCollection(mainCard.id, 'attachments').members([attachment.id]);
                  mainCard = await cardService.findCard({ cardId: mainCard.id });

              }
          }
          
          return exits.success(mainCard);
        } catch (err) {
          return  exits.error(err.message);
        }

    }
};
