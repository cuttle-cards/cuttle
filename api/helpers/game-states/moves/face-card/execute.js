const GamePhase = require('../../../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Play Face Card',

  description: 'Returns new GameState resulting from requested Face Card move',

  inputs: {
    currentState: {
      type: 'ref',
      description: 'The latest GameState before the requesting player plays a face card',
      required: true,
    },
    /**
     * @param { Object } requestedMove - Object describing the request to play a face card (req.body)
     * @param { String } requestedMove.cardId - Card Played being played as face card
     * @param { MoveType.FACE_CARD } requestedMove.moveType - Specifies that this a face card move
     */
    requestedMove: {
      type: 'ref',
      description: 'The move being requested. Specifies which player is asking to play a face card',
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

    const player = playedBy ? result.p1 : result.p0;
    const cardIndex = player.hand.findIndex(({ id }) => id === cardId);

    const [ playedCard ] = player.hand.splice(cardIndex, 1);

    player.faceCards.push(playedCard);

    result.turn++;

    result = {
      ...result,
      ...requestedMove,
      phase: GamePhase.MAIN,
      playedBy,
      playedCard,
      targetCard: null,
      discardedCards: [],
      resolved: null,
    };

    return exits.success(result);
  },
};
