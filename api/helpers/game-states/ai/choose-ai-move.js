module.exports = {
  friendlyName: 'Choose an AI move',

  description: 'Returns new GameState with AI\'s chosen move. Returns undefined if no legal moves exist',

  inputs: {
    currentState: {
      type: 'ref',
      descriptions: 'Object containing the current game state',
      required: true,
    },
    playedBy: {
      type: 'number',
      description: 'Player number of player requesting move',
      required: true,
    },
    priorStates: {
      type: 'ref',
      description: 'List of packed gameStateRows for this game\'s prior states',
      required: true,
    }
  },
  sync: true,
  fn: ({ currentState, playedBy, priorStates }, exits) => {
    try {

      const legalMoves = sails.helpers.gameStates.ai.getLegalMoves(currentState, playedBy, priorStates)
        .map((move) => {
          return {
            move,
            score: sails.helpers.gameStates.ai.minimax.getMinimaxScore(move, playedBy, 2, priorStates),
          };
        });

      let topScore = -100;
      for (let futureState of legalMoves) {
        if (futureState.score > topScore) {
          topScore = futureState.score;
        }
      }

      const topScoringMoves = legalMoves.filter((futureState) => futureState.score === topScore);

      const res = _.sample(topScoringMoves, 1)?.move;

      return exits.success(res);
    } catch (err) {
      return exits.error(err);
    }
  },
};
