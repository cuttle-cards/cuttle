const GamePhase = require('../../../../../utils/GamePhase.json');

function findTargetCard(targetId, targetType, opponent) {
  switch (targetType) {
    case 'point':
      return opponent.points.find(({ id }) => id === targetId);

    case 'faceCard':
      return opponent.faceCards.find(({ id }) => id === targetId);

    case 'jack':
      for (let point of opponent.points) {
        for (let jack of point.attachments) {
          if (jack.id === targetId) {
            return jack;
          }
        }
      }
      return;

    default:
      return null;
  }
}

module.exports = {
  friendlyName: 'Play Seven One-Off',

  description: 'Returns new GameState resulting from requested one-off move, played from the top of the deck via a seven',

  inputs: {
    currentState: {
      type: 'ref',
      description: 'The latest GameState before the requesting player plays a one-off via a seven',
      required: true,
    },
    /**
     * @param { Object } requestedMove - The move being requested. 
     * Specifies that the move is a SevenOneOff, which card is being played, 
     * and if applicable, what target and targetType
     * @param { MoveType.SEVEN_ONE_OFF } requestedMove.moveType
     * @param { String } requestedMove.cardId - Card Played for points
     * @param { String } [ requestedMove.targetId ] - OPTIONAL target of one-off
     * @param { 'point' | 'faceCard' | 'jack' } [ requestedMove.targetType ] - OPTIONAL where to locate target
     */
    requestedMove: {
      type: 'ref',
      description: 'The move being requested. Specifies which player is asking to play a one-off via a seven',
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

    const opponent = playedBy ? result.p0 : result.p1;

    const cardIndex = result.deck.findIndex(({ id }) => id === cardId);
    const [ playedCard ] = result.deck.splice(cardIndex, 1);

    const targetCard = findTargetCard(requestedMove.targetId, requestedMove.targetType, opponent);
    const { oneOff } = result;
    result.scrap.push(oneOff);

    result = {
      ...result,
      ...requestedMove,
      phase: GamePhase.COUNTERING,
      oneOff: playedCard,
      playedBy,
      playedCard,
      targetCard,
      oneOffTarget: targetCard,
      oneOffTargetType: requestedMove.targetType ?? null,
      discardedCards: [],
    };

    return exits.success(result);
  },
};
