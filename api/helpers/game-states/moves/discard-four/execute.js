const GamePhase = require('../../../../../utils/GamePhase.json');
const { HAND_LIMIT } = require('../../../../../utils/GameConstants.json');

module.exports = {
  friendlyName: 'Choose discards for a four',

  description:
    'Returns new GameState resulting from the player of a four choosing two of the cards their opponent ' +
    'revealed, which their opponent discards, completing the four',

  inputs: {
    currentState: {
      type: 'ref',
      description: 'The latest GameState before the requesting player chooses discards',
      required: true,
    },
    /**
     * @param { Object } requestedMove - Object describing the request to choose discards
     * @param { string[] } requestedMove.discardedCards - IDs of the two revealed cards to discard
     * @param { MoveType.DISCARD_FOUR } requestedMove.moveType
     */
    requestedMove: {
      type: 'ref',
      description: 'The move being requested.',
    },
    playedBy: {
      type: 'number',
      description: 'Player number of player requesting move.',
    },
    priorStates: {
      type: 'ref',
      description: 'List of packed gameStateRows for this game\'s prior states',
      required: true,
    }
  },
  sync: true,
  fn: ({ currentState, requestedMove, playedBy }, exits) => {
    const { discardedCards: discardIds } = requestedMove;
    let result = _.cloneDeep(currentState);

    const player = playedBy ? result.p1 : result.p0;
    const victim = playedBy ? result.p0 : result.p1;
    const discardedCards = [];

    for (const cardId of discardIds) {
      const cardIndex = victim.hand.findIndex(({ id }) => id === cardId);
      if (cardIndex === -1) { continue; } // validate() guarantees presence; guard prevents splice(-1) footgun
      const [ discarded ] = victim.hand.splice(cardIndex, 1);
      discardedCards.push(discarded);
      result.scrap.push(discarded);
    }

    result.scrap.push(result.oneOff);

    const playerMustDiscard = player.hand.length > HAND_LIMIT;

    result = {
      ...result,
      ...requestedMove,
      phase: playerMustDiscard ? GamePhase.DISCARDING_TO_HAND_LIMIT : GamePhase.MAIN,
      turn: playerMustDiscard ? result.turn : result.turn + 1,
      playedBy,
      playedCard: null,
      targetCard: null,
      discardedCards,
      fourRevealedCards: [],
      resolved: result.oneOff,
      oneOff: null,
    };

    return exits.success(result);
  },
};
