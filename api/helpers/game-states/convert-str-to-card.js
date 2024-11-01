
// Suit: ‘C’ (Clubs), ‘D’ (Diamonds), ‘H’ (Hearts), ‘S’ (Spades)
const suitMap = {
  'C': 0,
  'D': 1,
  'H': 2,
  'S': 3
};

// Rank: ‘A’ (Ace), ‘2’, ‘3’, ‘4’, ‘5’, ‘6’, ‘7’, ‘8’, ‘9’, ‘T’ (Ten), ‘J’ (Jack), ‘Q’ (Queen), ‘K’ (King)
const rankMap = {
  'A': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  'T': 10,
  'J': 11,
  'Q': 12,
  'K': 13
};

/**
 * Convert String card id (without attachments) to the Card object 
 *
 * @param { String } id - string representation of the card
 * @param { Boolean } isFrozen - whenever a card is frozen by a 9 in resolving
 * @returns { Object } card {
 *                            suit: string,
 *                            rank: int,
 *                            id: string,
 *                            isFrozen: boolean,
 *                            attachment:[]}
 */
function convertIdToCard (id, isFrozen) {
  const idCard = id.split('');

  if (idCard.length === 2) {

    const tempCard = { rank: id[0], suit: id[1] };

    const suit = suitMap[tempCard.suit];

    const rank = rankMap[tempCard.rank];

    if (rank === undefined) {
      throw new Error('Unrecognised rank ' + tempCard.rank);
    }
    if (suit === undefined) {
      throw new Error('Unrecognised suit ' + tempCard.suit);
    }

    return { suit, rank, id , isFrozen , attachments:[] };
  }

  throw new Error('Unrecognised card identifier ' + id);
}

/**
 * Convert a string representation to a card object
 *
 * @param { String } str - string representation of the card
 * @example KH (King of Hearts)
 * @example 4D(JC-p0) (Four of diamonds under Jack of Clubs)
 * @param { Boolean } isFrozen - signifies a card was frozen by a 9 and can't be played this turn
 * @returns { Card } Card object {
                                  suit: number || string,
                                  rank: number || string,
                                  id: string,
                                  isFrozen: boolean,
                                  attachments: [{
                                                  suit: number || string,
                                                  rank: number || string,
                                                  id: string,
                                                  isFrozen: boolean,
                                                  attachments:[]
                                              }];
                                }
 /**
 */

module.exports = {
  friendlyName: 'Convert card String to card Object',

  description: 'Convert String representation of card (ID and attachments to Card Object',

  inputs: {
    str: {
      type: 'string',
      description: 'string representation of a card',
      required: true,
      example: 'TH(JD-p0)', // 10H under Jack of Diamonds
    },
    isFrozen: {
      type: 'boolean',
      description: 'if the card is Frozen by use of 9 during resolve MoveType',
      required: false,
      defaultsTo: false,
    },
  },
  sync: true,

  fn: ({ str, isFrozen }, exits) => {
    try {
      // remove whitespace
      str = str.replace(/\s+/g, '');

      // get content before parentheses if any
      const mainCardId = str.replace(/\(.*?\)/g, '');
      // convert
      const maincard = convertIdToCard(mainCardId, isFrozen);

      // Handle attachments or return []
      // attachment format eg 4D(JC-p0, JD-p1)
      // -> get content inside parentheses
      const regex = /\(([^)]+)\)/;
      const attachmentsString = str.match(regex);
      // -> split using the comma
      const attachmentsArray = attachmentsString ? attachmentsString[1].split(',') : [];

      const attachments = attachmentsArray.map(element => {
        // -> split using the '-' -> [0]:before : card, [1]:player
        const content = element.split('-');
        return convertIdToCard(content[0] , false);
      });

      return exits.success({ ...maincard, attachments: attachments });
    } catch (err) {
      return exits.error(err.message);
    }
  }
};
