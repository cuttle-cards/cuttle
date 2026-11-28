const MoveType = require('../../../utils/MoveType.json');

module.exports = {
  friendlyName: 'Count Passes',

  description:
    'Counts the passes among the (up to) three game states ending at the given one, stopping at the first that is not a pass. Three passes in a row end the game in a stalemate',

  inputs: {
    gameStates: {
      type: 'ref',
      description: 'The game\'s gameStateRows, oldest first, including the given game state',
      required: true,
    },
    gameState: {
      type: 'ref',
      description: 'Game state to count up to (matched by id)',
      required: true,
    },
  },
  sync: true,

  fn: ({ gameStates, gameState }, exits) => {
    let numPasses = 0;
    const currentIndex = gameStates.findIndex((gs) => gs.id === gameState.id);
    const threeMostRecentGameStates = gameStates.slice(Math.max(0, currentIndex - 2), currentIndex + 1);

    for (const priorGameState of threeMostRecentGameStates) {
      if (priorGameState.moveType !== MoveType.PASS) {
        return exits.success(numPasses);
      }
      numPasses++;
    }

    return exits.success(numPasses);
  },
};
