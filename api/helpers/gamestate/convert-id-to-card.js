
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
 * Convert a string representation to isolate the card identifier rank and suit
 *
 * @param {string} str - string representation of the card
 * @returns {object} { suit: suit, rank : rank, id : string, attachment :[]} card identifier rank and suit
 */
function convertIdToCard (str) {
  const strCard = str.split('');

  if(strCard.length===2){

      const tempCard = { rank : str[0], suit : str[1] };

      const suit = typeof tempCard.suit === 'string' ? suitMap[tempCard.suit.toUpperCase()] : undefined;

      const rank = !isNaN(tempCard.rank) ? parseInt(tempCard.rank) : rankMap[tempCard.rank.toUpperCase()];

      if (rank === undefined) {
        throw new Error('Unrecognised rank ' + tempCard.rank);
      }
      if (suit === undefined) {
        throw new Error('Unrecognised suit ' + tempCard.suit);
      }

    return { suit: suit, rank : rank, id: str, attachments : []};
  }

  throw new Error('Unrecognised card identifier ' + str);
}

 /**
 * separate the attachments to the Card identifier in a String representation
 *
 * @param {string } str - Card Object
 * @returns {Object} Object with maincard and its attachments in format
 * {
        suit: number || string,
        rank: number || string,
        id : string,
        attachments: [{
                        suit: number || string,
                        rank: number || string,
                        id : string,
                    }];
          }
 /**
 */
 function convertToCard(str) {
    //  Simple card eg :‘3D’
    if(str.length===2) {
        return convertIdToCard(str);
    }
    // Card with attachment(attached by Jacks) eg : ‘TH(JH-p0,JC-p1,JD-p0)’
    else if(str.length >2) {
        return oraganiseAttachments(str);
    }
    throw new Error('Unrecognised card identifier format' + str);
}


/**
 * oraganise the Attachments string representation to an array and returns an object representationg the card
 *
 * @param {string } str - string representation of attachments
 * @returns {Object} Object with maincard and its attachments in format
 * {
 *      {
        suit: number || string,
        rank: number || string,
        id : string,
        attachments: [{
                        suit: number || string;
                        rank: number || string;
                        id : string;
                    }];
          }
 /**
 */
 function oraganiseAttachments(str) {
    //remove whitespace
    str = str.replace(/\s+/g, '');

    // get content before parentheses -> main Card
    const mainCardId = str.replace(/\(.*?\)/g, '');
    const maincard = convertIdToCard(mainCardId);

    //get content inside parentheses -> attachements
    const regex = /\(([^)]+)\)/;
    const attachmentsString = str.match(regex);
    //split using the comma
    const attachmentsArray = attachmentsString ? attachmentsString[1].split(',') : [];

    const attachments = attachmentsArray.map(element => {
          //split using the '-' -> [0]:before : card, [1]:player
          let content = element.split('-');
          return convertIdToCard( content[0] );
    });


    return {...maincard, attachments : attachments};
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
        const card = convertToCard(str);

        return exits.success(card);
      } catch (err) {
        return exits.error(err.message);
      }

    }
};
