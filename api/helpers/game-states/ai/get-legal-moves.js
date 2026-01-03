const MoveType = require('../../../../utils/MoveType');

module.exports = {
  friendlyName: 'Get legal moves',

  description: 'Returns list legally possible next GameStates',

  inputs: {
    currentState: {
      type: 'ref',
      descriptions: 'Object containing the current game state',
      required: true,
    },
    playedBy: {
      type: 'number',
      description: 'Player number of player about to make move',
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
    const disallowedMoveTypes = [ 'DEAL', 'CONCEDE', 'STALEMATE_REQUEST', 'STALEMATE_ACCEPT', 'FIZZLE' ];
    const moveTypes = Object.values(_.omit(MoveType, disallowedMoveTypes));
    const res = [];
    for (let moveType of moveTypes) {
      try {
        const { execute, validate } = sails.helpers.gameStates.moves[moveType];
        const possibleCardsAndTargets = sails.helpers.gameStates.ai
          .getMoveBodiesForMoveType(currentState, playedBy, moveType);
        for (let possibleMove of possibleCardsAndTargets) {
          validate(currentState, possibleMove, playedBy, priorStates);
          const legalMove = execute(currentState, possibleMove, playedBy, priorStates);
          res.push(legalMove);
        }
      } catch (err) {
        // Ignore illegal moves
      }
    }

    return exits.success(res);

  },
};
