const GamePhase = require('../../../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Resolve three',

  description: 'Returns new GameState resulting from requested resolve three move',

  inputs: {
    currentState: {
      type: 'ref',
      description: 'The latest GameState before the requesting player resolves a three card',
      required: true,
    },
    /**
     * @param { Object } requestedMove - Object describing the request to resolve a three
     * @param { String } requestedMove.cardId - Card to retrieve from the scrap pile
     * @param { MoveType.RESOLVE_THREE } requestedMove.moveType - Specifies that this a Resolve Three move
     */
    requestedMove: {
      type: 'ref',
      description: 'The move being requested. Specifies which player is asking to resolve a three',
    },
    playedBy: {
      type: 'number',
      description: 'Player number of player requesting move.',
    },
  },
  sync: true, // synchronous helper
  fn: ({ currentState, requestedMove, playedBy }, exits) => {
    const { cardId } = requestedMove;
    let result = _.cloneDeep(currentState);

    const targetCardIndex = result.scrap.findIndex(card => card.id === cardId);
    
    const [ targetCard ] = result.scrap.splice(targetCardIndex, 1);
    
    const player = playedBy ? result.p1 : result.p0;
    player.hand.push(targetCard);
    result.scrap.push(result.oneOff);

    result.turn++;

    result = {
      ...result,
      ...requestedMove,
      phase: GamePhase.MAIN,
      playedBy,
      playedCard: null,
      targetCard,
      discardedCards: [],
      resolved: result.oneOff,
      oneOff: null,
    };

    return exits.success(result);
  },
};
