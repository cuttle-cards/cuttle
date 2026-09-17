const TargetType = require('../../../../../utils/TargetType.json');

module.exports = {
  friendlyName: 'Resolve Nine One-Off',

  description: 'Returns new GameState resulting from resolving a nine, which puts the target card on top of the deck',

  inputs: {
    currentState: {
      type: 'ref',
      description: 'The latest GameState before the nine puts the target card on top of the deck',
      required: true,
    },
    playedBy: {
      type: 'number',
      description: 'Player number of player requesting move.',
    }
  },
  sync: true, // synchronous helper
  fn: ({ currentState, playedBy }, exits) => {
    const result = _.cloneDeep(currentState);

    // the user who played the one off is the opposite of the one who is resolving it. 
    const opponent = playedBy ? result.p1 : result.p0;
    const player = playedBy ? result.p0 : result.p1;

    // Cards go onto the deck face down, and the deck is drawn from the front
    const topDeck = (card) => result.deck.unshift({ ...card, attachments: [] });

    if ([ TargetType.point, TargetType.faceCard ].includes(result.oneOffTargetType)) {
      const targetIndex = opponent[`${result.oneOffTargetType}s`].findIndex(({ id }) => id === result.oneOffTarget.id);
      // Sanity check: targets can't disappear mid-resolution, but no-op rather than splice(-1)
      if (targetIndex < 0) {
        return exits.success(result);
      }
      const [ targetCard ] = opponent[`${result.oneOffTargetType}s`].splice(targetIndex, 1);

      // scrap all attachments
      result.scrap.push(...targetCard.attachments);

      topDeck(targetCard);

      return exits.success(result);
    }

    // TargetType = jack
    // Find card that the jack is attached to
    const targetIndex = opponent.points.findIndex(({ attachments }) =>
      attachments.some(({ id }) => id === result.oneOffTarget.id));
    if (targetIndex < 0) {
      return exits.success(result);
    }
    const [ targetCard ] = opponent.points.splice(targetIndex, 1);

    // Remove the targeted jack, which the validator guarantees is the top of the stack
    const jackIndex = targetCard.attachments.findIndex(({ id }) => id === result.oneOffTarget.id);
    const [ jack ] = targetCard.attachments.splice(jackIndex, 1);

    // Card the jack was stealing goes back to other player
    player.points.push(
      {
        ...targetCard,
      });

    // Put the jack on top of the deck
    topDeck(jack);
    return exits.success(result);
  },
};
