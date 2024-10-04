/**
 * Convert the attachments attribute of a card object to its string representation
 *
 * @param { Card } card - the card object to convert
 * @param { 'p0' | 'p1' } cardOwner - which player owns the card
 * @returns { String } string representation of the card atatchements attributs
 */
function concatAttachtToId(card, cardOwner) {
  if (!card.attachments || !card.attachments.length) {
    return '';
  }

  // GameStateRow Format => (JH-p0,JC-p1,JD-p0)

  let opponent = cardOwner === 'p0' ? 'p1' : 'p0';
  // First player on the string owns the main card
  // => if card.attachments length is an odd number, start string construction with the opponent
  let playerNum = card.attachments.length % 2 === 0 ? cardOwner : opponent;

  const convertedCards = card.attachments.map((card) => {
    const cardInString = validateCardId(card.id) + '-' + playerNum;
    playerNum = playerNum === 'p0' ? 'p1' : 'p0';
    return cardInString;
  });

  return '(' + convertedCards.join(',') + ')';
}

/**
 * Validate card id
 *
 * @param {string  } card,
 */
function validateCardId(id) {
  if (!id || id.length !== 2) {
    throw new Error('Invalid card ID');
  }
  return id;
}

/**
 * Convert a card object to its string representation
 *
 * @param { Card } card - card object
 * @returns { String } String representation of the card
 */

module.exports = {
  friendlyName: 'Convert Card to String',

  description: 'Converts Card object to string representation',

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
      const cardId = validateCardId(card.id);
      const attachments = concatAttachtToId(card, playedBy);

      return exits.success(cardId + attachments);
    } catch (err) {
      return exits.error('Error at unpacking cards: ' + err.message);
    }
  },
};
