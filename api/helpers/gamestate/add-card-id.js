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
    if (!card || !card.rank || !card.suit) {
      return exits.error('Failed to append Card Fixture');
    }

    const makeCardId = (card) => {
      const strRank =
        {
          1: 'A',
          11: 'J',
          12: 'Q',
          13: 'K',
        }[card.rank] ?? card.rank;
      const strSuit = ['C', 'D', 'H', 'S'][card.suit];
      return strRank + strSuit;
    };

    return exits.success({ ...card, id: makeCardId(card) });
  },
};
