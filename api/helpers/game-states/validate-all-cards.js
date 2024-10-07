const DeckIds = require('../../../utils/DeckIds.json');

module.exports = {
  friendlyName: 'Validate All Cards',

  description:
    'Validate that all the cards are accounted for and there are no duplicates, and that only face and pointcards can have attachments',

  inputs: {
    gameState: {
      type: 'ref',
      description: 'Current GameState',
      required: true,
    },
  },
  sync: true,

  fn: ({ gameState }, exits) => {
    const { p0, p1, deck, scrap, twos, oneOff } = gameState;

    const flattenCards = (cards) => {
      return cards.flatMap((card) => [{ ...card, attachments: [] }, ...(card.attachments || [])]);
    };

    const allCards = [
      ...p0.hand,
      ...flattenCards(p0.points),
      ...flattenCards(p0.faceCards),
      ...p1.hand,
      ...flattenCards(p1.points),
      ...flattenCards(p1.faceCards),
      ...deck,
      ...scrap,
      ...twos,
      ...(oneOff ?? []),
    ];

    DeckIds.forEach((id) => {
      const firstIndex = allCards.findIndex((card) => id === card.id);
      const lastIndex = allCards.findIndex((card) => id === card.id);

      if (firstIndex !== lastIndex) {
        throw new Error('Duplicate Card Found');
      }

      if (lastIndex === -1) {
        throw new Error('Missing Card in Game');
      }
    });

    allCards.forEach(({ attachments }) => {
      if (attachments.length) {
        throw new Error('Only Points or FaceCards can have attachments');
      }
    });

    return exits.success();
  },
};
