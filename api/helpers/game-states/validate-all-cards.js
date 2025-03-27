const DeckIds = require('../../../utils/DeckIds.json');

module.exports = {
  friendlyName: 'Validate All Cards',

  description:
    'Validate that all the cards are accounted for and there are no duplicates, and that only point cards can have attachments',

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

    // put Cards and Attachments into a one dimensional array
    const flattenCards = (cards) => {
      return cards.flatMap((card) => [ { ...card, attachments: [] }, ...(card.attachments || []) ]);
    };

    const allCards = new Set([
      ...p0.hand,
      ...flattenCards(p0.points),
      ...p0.faceCards,
      ...p1.hand,
      ...flattenCards(p1.points),
      ...p1.faceCards,
      ...deck,
      ...scrap,
      ...twos,
      ...(oneOff ? [ oneOff ]: []),
    ]);

    const cardIds = new Set();
    const deckIds = new Set(DeckIds);

    allCards.forEach((card) => {
      if (card.attachments.length) {
        throw new Error(`${card.id}` + ' ' + `game.card.cannotHaveAttachments`);
      }

      if (cardIds.has(card.id)) {
        throw new Error(`game.card.duplicateCard ${card.id}`);
      }

      if (!deckIds.has(card.id)) {
        throw new Error(`game.card.invalidCardID ${card.id}`);
      }

      cardIds.add(card.id);
    });

    if (cardIds.size !== deckIds.size) {
      throw new Error(`game.hand.missingCards ${[ ...deckIds.difference(cardIds) ].join(',')}`);
    }

    return exits.success();
  },
};
