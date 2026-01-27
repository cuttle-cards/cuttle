const MoveType = require('../../../../../utils/MoveType');

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
      const { getActivePlayerPNum, checkGameStateForWinSync } = sails.helpers.gameStates;
      const { getLegalMoves } = sails.helpers.gameStates.ai;
      const { scoreGameState, getMinimaxScore } = sails.helpers.gameStates.ai.minimax;

      if (depth <= 0) {
        const res = scoreGameState(currentState, pNum);
        return exits.success(res);
      }


      let numPasses = 0;
      const currentIndex = priorStates.findIndex(gs => gs.id === currentState.id);
      const threeUpToCurrent = priorStates.slice(Math.max(0, currentIndex - 2), currentIndex + 1);

      for (const gameState of threeUpToCurrent) {
        if (gameState.moveType !== MoveType.PASS) {
          break;
        }
        numPasses++;
      }

      const { gameOver, winner } = checkGameStateForWinSync(currentState, numPasses);

      if (gameOver) {
        switch (winner) {
          case pNum: // Max reward if this player wins
            return exits.success(Infinity);
          case (pNum + 1) % 2: // Min reward if this player loses
            return exits.success(-Infinity);
          default: // 0 reward if stalemate
            return exits.success(0);
        }
      }

      const activePlayerPNum = getActivePlayerPNum(currentState);
      const isMyMove = activePlayerPNum === pNum;
      const possibleNextStates = getLegalMoves(currentState, activePlayerPNum, priorStates);

      if (possibleNextStates.length === 0) {
        const res = scoreGameState(currentState, pNum);
        return exits.success(res);
      }

      const baseLineScore = isMyMove ? -Infinity : Infinity;

      const priorStatesPlusCurrentState = [ ...priorStates, currentState ];
      const bestScore = possibleNextStates.reduce((currentScore, state) => {

        const stateScore = getMinimaxScore(state, pNum, depth - 1, priorStatesPlusCurrentState);
        return isMyMove ? Math.max(currentScore, stateScore) : Math.min(currentScore, stateScore);

      }, baseLineScore);

      return exits.success(bestScore);
    } catch (err) {
      return exits.error(err);
    }
  },
};
