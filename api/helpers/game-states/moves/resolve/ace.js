module.exports = {
  friendlyName: 'Resolve Ace One-Off',

  description: 'Returns new GameState resulting from resolving an ace, which scraps all points on the field, and all jacks attached to those point cards.',

  inputs: {
    currentState: {
      type: 'ref',
      description: 'The latest GameState before the ace scraps all point cards and their attachments',
      required: true,
    },
  },
  sync: true, // synchronous helper
  fn: ({ currentState }, exits) => {
    let result = _.cloneDeep(currentState);

    // Scrap all points and all their attachments
    for (let card of [ ...currentState.p0.points, ...currentState.p1.points ]) {
      result.scrap.push(card, ...card.attachments);
      card.attachments = [];
    }

    result.p0.points = [];
    result.p1.points = [];

    return exits.success(result);
  },
};
