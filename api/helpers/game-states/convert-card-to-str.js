/**
 * Convert the attachments attribute of a card object to its string representation
 *
 * @param { Card } card - the card object to convert
 * @param { 'p0' | 'p1' } cardOwner - which player currently controls the card
 * @returns { String } string representation of the card atatchements attributs
 */
function concatAttachtToId(card, cardOwner) {
  if (!card.attachments || !card.attachments.length) {
    return '';
  }

  // A card with jacks on it needs its controller to label them; guessing one would mislabel every jack
  if (![ 'p0', 'p1' ].includes(cardOwner)) {
    throw new Error(`Missing the player who controls ${card.id}, which has jacks attached`);
  }

  // GameStateRow Format => (JH-p0,JC-p1,JD-p0)

  let opponent = cardOwner === 'p0' ? 'p1' : 'p0';
  // Jacks alternate between the players, and the last one was played by the card's controller
  // => with an even number of jacks the first one belongs to the opponent, with an odd number to the controller
  let playerNum = card.attachments.length % 2 === 0 ? opponent : cardOwner;

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
 * @param {string} id
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
    cardOwner: {
      type: 'string',
      description: 'Player who currently controls the card (p0 or p1); required when the card has jacks attached',
      required: false,
    },
  },
  sync: true,

  fn: ({ card, cardOwner }, exits) => {
    try {
      const cardId = validateCardId(card.id);
      const attachments = concatAttachtToId(card, cardOwner);

      return exits.success(cardId + attachments);
    } catch (err) {
      return exits.error('Error at unpacking cards: ' + err.message);
    }
  },
};
