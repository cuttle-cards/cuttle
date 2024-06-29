//Suit: ‘C’ (Clubs), ‘D’ (Diamonds), ‘H’ (Hearts), ‘S’ (Spades)  
const suitMap = {
  'C': 0,
  'D': 1,
  'H': 2,
  'S': 3
};

//Rank: ‘A’ (Ace), ‘2’, ‘3’, ‘4’, ‘5’, ‘6’, ‘7’, ‘8’, ‘9’, ‘T’ (Ten), ‘J’ (Jack), ‘Q’ (Queen), ‘K’ (King)
const rankMap = {
  'A': 1,
  'T': 10,
  'J': 11,
  'Q': 12,
  'K': 13
};
/**
 * Convert a card object to its string representation
 *
 * @param {Card} card - card object
 * @returns {string} String representation of the card
 */
function rankAndSuitToString(card){
  const suitKey =  Object.keys(suitMap).find(key => suitMap[key] === card.suit);

  const rankKey = card.rank === 1 || card.rank > 9 ? 
                          Object.keys(rankMap).find(key => rankMap[key] === card.rank)
                          :parseInt(card.rank) ;

  if(suitKey === undefined || suitKey === null ){
    throw new Error('Unrecognisabled suit ' + card.suit ) ;
  }
  if(rankKey === undefined || rankKey === null){
    throw new Error('Unrecognisabled rank ' +  card.rank) ;
  }
  return rankKey + suitKey;
}

/**
 * Convert a string representation to isolate the card identifier rank and suit
 *
 * @param {string} str - string representation of the card
 * @returns {object} { suit: suit, rank : rank} card identifier rank and suit
 */
function rankAndSuitToCardId (str){
    const strCard = str.split('');
    let card= {};

    if(strCard.length===2){
       card = { rank : str[0], suit : str[1] };
    }
    else{
      throw new Error('Unrecognised card identifier ' + str);
    }
    
    const suit = typeof card.suit === 'string' ? suitMap[card.suit.toUpperCase()] : undefined;
    if (suit === undefined) {
      throw new Error('Unrecognisabled suit ' + card.suit);
    }
  
    const rank = !isNaN(card.rank) ? parseInt(card.rank) : rankMap[card.rank.toUpperCase()];
    if (rank === undefined) {
      throw new Error('Unrecognisabled rank ' + card.rank);
    }
  
    return { suit: suit, rank : rank};
 }

 /**
 * Convert the attachments attribute of a card object to its string representation
 *
 * @param {Card, playerid } card, player - Card Object, playerId
 * @returns {string} string representation of the card atatchements attributs
 */
 function concatAttachtToString(card, playedBy){
    if( card.attachments === null || card.attachments === undefined || card.attachments.length === 0){
        return '';
    }

    //Format => (JH-p0,JC-p1,JD-p0) cardInString + '-' + player (+',')
    let playerNum = playedBy === '0' ? 'p0' : 'p1';
    let attachmentStr ='(';

    card.attachments.forEach((element, index)=>{
      const cardInString = rankAndSuitToString( element );
      let comma = index < card.attachments.length -1 ? ',': '';
      attachmentStr += cardInString + '-' + playerNum + comma;
      playerNum = playerNum === 'p0' ? 'p1' : 'p0';
    });

    return attachmentStr + ')';
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
        return { mainCard : rankAndSuitToCardId(str), attachments : null };
    }
    // Card with attachment(attached by Jacks) eg : ‘TH(JH-p0,JC-p1,JD-p0)’
    else if(str.length >2){
        const y = oraganiseAttachments(str);
        return { mainCard : rankAndSuitToCardId(y.mainCard), attachments : y.attachments };
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
          let card =  rankAndSuitToCardId( content[0] );
      
          attachments.push(card);
    });

    return { mainCard : mainCard, attachments : attachments.length >0 ?  attachments : null};
}



function isFrozen(){
  return false;
}

 
module.exports = {
/**
 * Convert a string representation to a card object
 *
 * @param {string} str - string representation of the card
 * @returns {Card} Card object
 */
  convertStringToCard: async function (str) { //, gameId
    try {
      const card = separateAttachtToCard(str);
      //mainCard
      const mainCard = await Card.create({  
                            suit : card.mainCard.suit, 
                            rank : card.mainCard.rank, 
                            isFrozen : isFrozen(),
                            //deck: gameId,
                          }).fetch();

      //attachments
      if(card.attachments !== null && card.attachments !== undefined){
 
          for (let i = 0 ; i< card.attachments.length ; i++) {
              let attachment = await Card.create({
                                            suit: card.attachments[i].suit,
                                            rank: card.attachments[i].rank,
                                            isFrozen: isFrozen(),
                                            attachedTo: mainCard.id,
                                            //deck: gameId,
                                            index: i,
                                      }).fetch();

              await Card.addToCollection(mainCard.id, 'attachments').members([attachment.id]);
  
          }
      }
      const cardCreated = await cardService.findCard({ cardId: mainCard.id });
      return cardCreated;

    } catch (err) {
      throw new Error('Error at unpacking cards : ' + err);
    }
  },

/**
 * Convert a card object to its string representation
 *
 * @param {Card} card - card object
 * @returns {string} String representation of the card
 */
  convertCardToString: function (card, playedBy) {
    try {
        const mainCard = rankAndSuitToString(card);
        const attachments = concatAttachtToString(card, playedBy);

        return mainCard +  attachments;

    } catch (err) {
      throw new Error('Error at unpacking cards : ' + err);
    }
  }
};

//TODO discardedCards ?