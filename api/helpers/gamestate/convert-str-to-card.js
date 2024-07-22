
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
 * Convert card id to the card identifier rank and suit
 *
 * @param { String } id - string representation of the card
 * @returns { Object } card { suit: suit, rank : rank, id : string, isFrozen : boolean, attachment :[]}
 */
function convertIdToCard (id) {
  const idCard = id.split('');

  if (idCard.length===2) {

      const tempCard = { rank : id[0], suit : id[1] };

      const suit = typeof tempCard.suit === 'string' ? suitMap[tempCard.suit.toUpperCase()] : undefined;

      const rank = !isNaN(tempCard.rank) ? parseInt(tempCard.rank) : rankMap[tempCard.rank.toUpperCase()];

      if (rank === undefined) {
        throw new Error('Unrecognised rank ' + tempCard.rank);
      }
      if (suit === undefined) {
        throw new Error('Unrecognised suit ' + tempCard.suit);
      }

    return { suit, rank, id , isFrozen :false, attachments :[]};
  }

  throw new Error('Unrecognised card identifier ' + id);
}

/**
 * Convert a string representation to a card object
 *
 * @param {string} str - string representation of the card
 * @example KH (King of Hearts)
 * @example 4D(JC-p0) (Four of diamonds under Jack of Clubs)
 * @returns {Card} Card object {
                                  suit: number || string,
                                  rank: number || string,
                                  id : string,
                                  isfrozen : boolean,
                                  attachments: [{
                                                  suit: number || string,
                                                  rank: number || string,
                                                  id : string,
                                                  isfrozen : boolean,
                                                  attachments :[]
                                              }];
                                }
 /**
 */

module.exports = {
  friendlyName: 'Convert card String to card Object',

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
            //remove whitespace
            str = str.replace(/\s+/g, '');

            // get content before parentheses if any
            const mainCardId = str.replace(/\(.*?\)/g, '');
            //convert
            const maincard = convertIdToCard(mainCardId);

            // Handle attachment or return []
            // attachment format : 4D(JC-p0)
            // -> get content inside parentheses
            const regex = /\(([^)]+)\)/;
            const attachmentsString = str.match(regex);
            // -> split using the comma
            const attachmentsArray = attachmentsString ? attachmentsString[1].split(',') : [];

            const attachments = attachmentsArray.map(element => {
                  // -> split using the '-' -> [0]:before : card, [1]:player
                  const content = element.split('-');
                  return convertIdToCard( content[0] );
            });

        return exits.success({...maincard, attachments : attachments});
      } catch (err) {
        return exits.error(err.message);
      }
    }
};
