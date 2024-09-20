const GamePhase = require('../../../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Set up Seven One-Off',

  description: 'Returns new GameState resulting from a seven beginning to resolve, which sets the current phase to GamePhase.RESOLVING_SEVEN',

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
    result.scrap.push(...result.twos);
    result.twos = [];
    result.phase = GamePhase.RESOLVING_SEVEN;

    return exits.success(result);
  },
};
