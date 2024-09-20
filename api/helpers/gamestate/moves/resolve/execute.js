const GamePhase = require('../../../../../utils/GamePhase.json');
const MoveType = require('../../../../../utils/MoveType.json');

module.exports = {
  friendlyName: 'Resolve One-Off',

  description: 'Returns new GameState resulting from requested resolve move',

  inputs: {
    currentState: {
      type: 'ref',
      description: 'The latest GameState before the requesting player resolves the pending one-off and counters',
      required: true,
    },
    /**
     * @param { Object } requestedMove - The move being requested. 
     * Specifies that the move is to resolve
     * @param { MoveType.RESOLVE } requestedMove.moveType
     */
    requestedMove: {
      type: 'ref',
      description: 'The move being requested. Specifies which player is asking to play a one-off ',
    },
    playedBy: {
      type: 'number',
      description: 'Player number of player requesting move.',
    },
  },
  sync: true, // synchronous helper
  fn: ({ currentState, requestedMove, playedBy }, exits) => {
    let result = _.cloneDeep(currentState);

    const { oneOff } = result;

    // Move oneOff + twos into scrap and increment turn
    const fizzles = result.twos.length % 2 === 1;
    result.scrap.push(result.oneOff);
    result.scrap.push(...result.twos);
    result = {
      ...result,
      ...requestedMove,
      phase: GamePhase.MAIN,
      playedBy,
      resolved: oneOff,
      oneOff: null,
      oneOffTarget: null,
      oneOffTargetType: null,
      twos: [],
      turn: result.turn + 1,
    };

    // If one-off fizzles, make no other changes
    if (fizzles) {
      result.moveType = MoveType.FIZZLE;
      return exits.success(result);
    }

    switch (oneOff.rank) {
      case 1:
        result = sails.helpers.gamestate.moves.resolve.ace(result);
        break;
      default:
        return exits.error(new Error(`${oneOff.rank} is not a valid one-off rank`));
    }

    return exits.success(result);
  },
};
