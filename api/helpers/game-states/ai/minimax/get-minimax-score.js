module.exports = {
  friendlyName: 'Get Minimax Score',

  description: 'Returns numerical score describing desirability/goodness of a given GameState, from a specified player\'s perspective by traversing possibility tree to a specified depth, scoring the deepest nodes with a heuristic function, and scoring each higher node as the minimum score of its direct child states',

  inputs: {
    currentState: {
      type: 'ref',
      descriptions: 'Object containing the current game state',
      required: true,
    },
    pNum: {
      type: 'number',
      description: 'Player whose perspective we are scoring',
      required: true,
    },
    depth: {
      type: 'number',
      description: 'How many layers deep to look ahead and score',
      required: true,
    },
    priorStates: {
      type: 'ref',
      description: 'List of packed gameStateRows for this game\'s prior states',
      required: true,
    }
  },
  sync: true,
  fn: ({ currentState, pNum, depth, priorStates }, exits) => {
    try {
      if (depth <= 0) {
        const res = sails.helpers.gameStates.ai.minimax.scoreGameState(currentState, pNum);
        return exits.success(res);
      }

      const possibleNextStates = sails.helpers.gameStates.ai.getLegalMoves(currentState, pNum, priorStates);

      const lowestScoreForNextState = possibleNextStates.reduce((total, state) => Math.min(total, sails.helpers.gameStates.ai.minimax.getMinimaxScore(state, (pNum + 1) % 2, depth - 1, [ ...priorStates, currentState ])), 0);

      return exits.success(lowestScoreForNextState);
    } catch (err) {
      return exits.error(err);
    }
  },
};
