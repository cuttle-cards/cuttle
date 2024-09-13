const GamePhase = require('../../../../../utils/GamePhase.json');

function findTargetCard(targetId, targetType, opponent) {
  switch (targetType) {
    case 'point':
      return opponent.points.find(card => card.id === targetId);

    case 'faceCard':
      return opponent.faceCards.find(card => card.id === targetId);

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
      throw new Error(`Need a target type to find the ${targetId}`);
  }
}

module.exports = {
  friendlyName: 'Validate request to play untargeted one-off',

  description:
    'Verifies whether a request to play untargeted one-off is legal, throwing explanatory error if not.',

  inputs: {
    currentState: {
      type: 'ref',
      descriptions: 'Object containing the current game state',
      required: true,
    },
    /**
     * @param { Object } requestedMove - Object describing the request to play points
     * @param { String } requestedMove.cardId - Card Played for points
     * @param { String } [ requestedMove.targetId ] - OPTIONAL target of one-off used for 2's and 9's
     * @param { MoveType.ONE_OFF } requestedMove.moveType
     */
    requestedMove: {
      type: 'ref',
      description: 'Object containing data needed for current move',
      required: true,
    },
    playedBy: {
      type: 'number',
      description: 'Player number of player requesting move',
      required: true,
    },
  },
  sync: true,
  fn: ({ requestedMove, currentState, playedBy }, exits) => {
    try {
      const player = currentState[`p${playedBy}`];
      const opponent = currentState[`p${(playedBy + 1) % 2}`];

      const cardPlayed = player.hand.find(({ id }) => id === requestedMove.cardId);

      if (currentState.phase !== GamePhase.MAIN) {
        throw new Error(`Can only play one-off in main phase, not ${currentState.phase}`);
      }

      if (currentState.oneOff) {
        throw new Error(
          'There is already a one-off in play; You cannot play any card, except a two to counter.',
        );
      }

      if (!cardPlayed) {
        throw new Error('game.snackbar.global.playFromHand');
      }

      if (currentState.turn % 2 !== playedBy) {
        throw new Error('game.snackbar.global.notYourTurn');
      }

      if (cardPlayed.isFrozen) {
        throw new Error('game.snackbar.global.cardFrozen');
      }

      switch (cardPlayed.rank) {
        // Ace and Six are always allowed
        case 1:
        case 6:
          return exits.success();

        // 2 and 9 require legal target
        case 2:
        case 9:
          {
            const targetCard = findTargetCard(requestedMove.targetId, requestedMove.targetType, opponent);
            // Must have target
            if (!targetCard) {
              throw new Error(`Can't find the ${requestedMove.targetId} on opponent's board`);
            }

            const queenCount = opponent.faceCards.filter(
              (faceCard) => faceCard.rank === 12
            ).length;

            // Legal if not blocked by opponent's queen(s)
            switch (queenCount) {
              // No queens => always allowed
              case 0:
                return exits.success();

              // One queen => can only target the queen
              case 1: {
                if (targetCard.rank !== 12) {
                  throw new Error('game.snackbar.global.blockedByQueen');
                }
                return exits.success();
              }

              // 2+ queens => Can't target at all
              default:
                throw new Error('game.snackbar.global.blockedByMultipleQueens');
            }
          }

        // Three requires card(s) in scrap
        case 3:
          if (!currentState.scrap.length) {
            throw new Error('game.snackbar.oneOffs.scrapIsEmpty');
          }
          return exits.success();

        // Four requires opponent to have cards in hand
        case 4:
          if (!opponent.hand.length) {
            throw new Error('game.snackbar.oneOffs.opponentHasNoCards');
          }
          return exits.success();

        // Five requires cards in deck
        case 5:
          if (!currentState.deck.length) {
            throw new Error('game.snackbar.five.fiveDeckIsEmpty');
          }
          return exits.success();

        // Seven requires cards in deck
        case 7:
          if (!currentState.deck.length) {
            throw new Error('game.snackbar.oneOffs.sevenWithEmptyDeck');
          }
          return exits.success();

        // No other cards can be used for a one-off
        default:
          throw new Error('You cannot play that card as a one-off without a target.');
      }
    } catch (err) {
      return exits.error(err);
    }
  },
};
