module.exports = {
  friendlyName: 'Add Card ID',

  description: 'Updated a card fixture object to contain an ID',

  inputs: {
    card: {
      type: 'ref',
      description: 'card',
      required: true,
    },
  },
  sync: true,

  fn: ({ card }, exits) => {
    if (!card) {
      throw new Error('Cannot add id to missing card object');
    }

    const makeCardId = (card) => {
      const strRank =
        {
          1: 'A',
          10: 'T',
          11: 'J',
          12: 'Q',
          13: 'K',
        }[card.rank] ?? card.rank;
      const strSuit = ['C', 'D', 'H', 'S'][card.suit];
      return strRank + strSuit;
    };
    const cardId = makeCardId(card);

    return exits.success({ ...card, id: cardId, attachments: [] });
  },
};
