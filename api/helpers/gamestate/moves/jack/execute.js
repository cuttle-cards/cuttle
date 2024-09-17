const GamePhase = require('../../../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Play a Jack -> steal an opponent points card',

  description: 'Returns new GameState resulting from requested move',

  inputs: {
    currentState: {
      type: 'ref',
      description: 'The latest gamestate before playing Jack',
      required: true,
    },
    /**
     * @param { Object } requestedMove - The move being requested.
     * @param { String } requestedMove.cardId - Card Played (Jack))
     * @param { String } [ requestedMove.targetId ] - Card targeted by Jack
     */
    requestedMove: {
      type: 'ref',
      description: 'The move being requested',
      required: true,
    },
    playedBy: {
      type: 'number',
      description: '0 or 1 for whether p0 or p1 is making the move',
      required: true,
    },
  },
  sync: true,

  fn: ({ currentState, requestedMove, playedBy }, exits) => {
    try {
      let result = _.cloneDeep(currentState);

      const { cardId, targetId } = requestedMove;

      const player = playedBy ? result.p1 : result.p0;
      const opponent = playedBy ? result.p0 : result.p1;

      const playedCard = player.hand.find(({ id }) => id === cardId);
      const targetCard = opponent.points.find(({ id }) => id === targetId);

      //add jack(playedCard) to targetcard attachment
      targetCard.attachments.push(playedCard);
      //add targetCard to player points
      player.points.push(targetCard);
      // remove jack(playedCard) from player hand
      const cardIndex = player.hand.findIndex(({ id }) => id === cardId);
      player.hand.splice(cardIndex, 1);
      //remove target card from oppponent points
      const targetIndex = opponent.points.findIndex(({ id }) => id === targetId);
      opponent.points.splice(targetIndex, 1);

      result.turn++;

      result = {
        ...result,
        ...requestedMove,
        playedBy,
        playedCard,
        targetCard,
        phase: GamePhase.MAIN,
      };

      return exits.success(result);
    } catch (err) {
      return exits.error({ message: 'Cannot play Jack ' + err });
    }
  },
};
