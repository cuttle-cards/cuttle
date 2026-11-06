const GamePhase = require('../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Update revealed cards',

  description:
    'Returns the GameState resulting from a move, with revealedCards set to every card in a hand or the deck ' +
    'that both players have seen',

  extendedDescription:
    'Cards stay revealed until they leave the hands and deck, and are revealed again if they come back by a ' +
    'public route. revealedCards is rebuilt from previousState and the cards\' locations, never read from ' +
    'nextState, so a client can\'t mark cards as revealed.',

  inputs: {
    previousState: {
      type: 'ref',
      description: 'The latest saved GameState, before the move',
      required: true,
    },
    nextState: {
      type: 'ref',
      description: 'The GameState returned by the move\'s execute() helper',
      required: true,
    },
  },
  sync: true,
  fn: ({ previousState, nextState }, exits) => {
    const revealedIds = new Set((previousState.revealedCards ?? []).map(({ id }) => id));
    const reveal = (cards) => cards.forEach(({ id }) => revealedIds.add(id));

    const { p0, p1, deck } = nextState;
    const hiddenCards = [ ...p0.hand, ...p1.hand, ...deck ];

    // A card that moves from the field or scrap into a hand or the deck was seen on its way there,
    // e.g. picked from the scrap with a three or returned to hand with a nine
    const publicIds = new Set([
      ...[ previousState.p0, previousState.p1 ].flatMap(({ points, faceCards }) => [
        ...points.flatMap((card) => [ card, ...(card.attachments ?? []) ]),
        ...faceCards,
      ]),
      ...previousState.scrap,
      ...previousState.twos,
      ...(previousState.oneOff ? [ previousState.oneOff ] : []),
    ].map(({ id }) => id));
    reveal(hiddenCards.filter(({ id }) => publicIds.has(id)));

    // A seven shows both players the top two cards of the deck
    if (nextState.phase === GamePhase.RESOLVING_SEVEN) {
      reveal(deck.slice(0, 2));
    }

    // Both players see the cards a four's victim reveals. Only revealFour, resolving a four, and concede
    // can leave the game in this phase, and each sets fourRevealedCards itself
    if (nextState.phase === GamePhase.RESOLVING_FOUR_DISCARD) {
      reveal(nextState.fourRevealedCards ?? []);
    }

    // Glasses show their owner the opponent's hand, including cards drawn while they are in play
    if (p0.faceCards.some(({ rank }) => rank === 8)) {
      reveal(p1.hand);
    }
    if (p1.faceCards.some(({ rank }) => rank === 8)) {
      reveal(p0.hand);
    }

    // Both hands are shown once the deck runs out
    if (!deck.length) {
      reveal([ ...p0.hand, ...p1.hand ]);
    }

    // Drop cards that have since left the hands and deck, e.g. by being played or discarded
    const revealedCards = hiddenCards.filter(({ id }) => revealedIds.has(id));

    return exits.success({ ...nextState, revealedCards });
  },
};
