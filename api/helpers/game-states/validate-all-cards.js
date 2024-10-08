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

    const allCards = new Set([
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
    ]);

    const cardIds = new Set();
    const deckIds = new Set(DeckIds);

    allCards.forEach((card) => {
      if (card.attachments) {
        throw new Error('Only Points and Face Cards can have attachments');
      }

      if (cardIds.has(card.id)) {
        throw new Error('Duplicate Card');
      }

      if (!deckIds.has(card.id)) {
        throw new Error('Invalid Card');
      }

      cardIds.add(card.id);
    });

    if (cardIds.size !== deckIds.size) {
      throw new Error('Card Missing');
    }

    return exits.success();
  },
};
