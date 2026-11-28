
// Suit: ‘C’ (Clubs), ‘D’ (Diamonds), ‘H’ (Hearts), ‘S’ (Spades), and 'R' (Red) / 'B' (Black) for jokers
const suitMap = {
  'C': 0,
  'D': 1,
  'H': 2,
  'S': 3,
  'R': 4,
  'B': 5,
};

// Rank: ‘A’ (Ace), ‘2’, ‘3’, ‘4’, ‘5’, ‘6’, ‘7’, ‘8’, ‘9’, ‘T’ (Ten), ‘J’ (Jack), ‘Q’ (Queen), ‘K’ (King), 'X' (Joker)
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
  'K': 13,
  'X': 14,
};

// cardStr := cardId [ "-" pNum ] [ "(" attachment { "," attachment } ")" ]
// See docs/game-state-api.md for the full grammar
const cardStrRegex = /^([^-()]+)(?:-([^()]*))?(?:\((.*)\))?$/;
const pNumRegex = /^p(\d)$/;

/**
 * Convert String card id (without attachments) to the Card object 
 *
 * @param { String } id - string representation of the card
 * @param { Boolean } isFrozen - whenever a card is frozen by a 9 in resolving
 * @param { Number | null } owner - pNum of the player the card belongs to, if recorded
 * @returns { Object } card {
 *                            suit: string,
 *                            rank: int,
 *                            id: string,
 *                            isFrozen: boolean,
 *                            owner: number | null,
 *                            attachment:[]}
 */
function convertIdToCard (id, isFrozen, owner = null) {
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

    return { suit, rank, id , isFrozen , owner, attachments:[] };
  }

  throw new Error('Unrecognised card identifier ' + id);
}

/**
 * Parse a '-pN' owner suffix
 *
 * @param { String | undefined } suffix - the text after the '-', if any
 * @returns { Number | null } the pNum, or null when there is no suffix
 */
function parseOwner(suffix) {
  if (suffix === undefined) {
    return null;
  }
  const match = suffix.match(pNumRegex);
  if (!match) {
    throw new Error('Unrecognised owner suffix ' + suffix);
  }
  return parseInt(match[1], 10);
}

/**
 * Convert a string representation to a card object
 *
 * @param { String } str - string representation of the card
 * @example KH (King of Hearts)
 * @example TH-p0(JH-p2,JC) (Ten of Hearts played by p0, jacked by p2, then by the player whose column holds it)
 * @example 4D(JC-p0) (legacy: Four of diamonds under Jack of Clubs, owners derived from the column)
 * @param { Boolean } isFrozen - signifies a card was frozen by a 9 and can't be played this turn
 * @returns { Card } Card object {
                                  suit: number || string,
                                  rank: number || string,
                                  id: string,
                                  isFrozen: boolean,
                                  owner: number | null,
                                  attachments: [{
                                                  suit: number || string,
                                                  rank: number || string,
                                                  id: string,
                                                  isFrozen: boolean,
                                                  owner: number | null,
                                                  attachments:[]
                                              }];
                                }
 /**
 */

module.exports = {
  friendlyName: 'Convert card String to card Object',

  description: 'Convert String representation of card (ID, owner and attachments) to Card Object',

  extendedDescription:
    'Context-free: owners are parsed from suffixes only, never from the column the string came from. ' +
    'A stacked card with no host suffix is legacy format, whose attachment suffixes are ignored without being validated; ' +
    'unpack-gamestate reconstructs those owners from the column.',

  inputs: {
    str: {
      type: 'string',
      description: 'string representation of a card',
      required: true,
      example: 'TH-p0(JD)', // 10H played by p0, under Jack of Diamonds
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

      const match = str.match(cardStrRegex);
      if (!match) {
        throw new Error('Unrecognised card string ' + str);
      }
      const [ , mainCardId, hostSuffix, attachmentsString ] = match;

      const maincard = convertIdToCard(mainCardId, isFrozen, parseOwner(hostSuffix));

      // attachment format eg TH-p0(JC-p1,JD)
      const attachmentsArray = attachmentsString ? attachmentsString.split(',') : [];

      // Legacy strings write no host suffix on stacked cards, and their attachment suffixes are
      // shifted one card too high (and may read '-undefined'), so they are never read
      const isLegacy = attachmentsArray.length > 0 && hostSuffix === undefined;

      const attachments = attachmentsArray.map(element => {
        // -> split using the '-' -> [0]:before : card, [1]:player
        const [ id, suffix ] = element.split('-');
        const owner = isLegacy ? null : parseOwner(suffix);
        return convertIdToCard(id, false, owner);
      });

      return exits.success({ ...maincard, attachments: attachments });
    } catch (err) {
      return exits.error(err.message);
    }
  }
};
