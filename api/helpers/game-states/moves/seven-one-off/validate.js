const GamePhase = require('../../../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Validate sevenOneOff',

  description:
    'Verifies whether a request to play a one-off from the top of the deck when resolving a seven is legal, throwing explanatory error if not.',

  inputs: {
    currentState: {
      type: 'ref',
      descriptions: 'Object containing the current game state',
      required: true,
    },
    /**
     * @param { Object } requestedMove - Object describing the request to play one-off via seven
     * @param { String } requestedMove.cardId - Card Played as one-off
     * @param { MoveType.SEVEN_ONE_OFF } requestedMove.moveType - Specifies that this a sevenOneOff move
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
      const topTwoCards = currentState.deck.slice(0, 2);
      const playedCard = topTwoCards.find(({ id }) => id === requestedMove.cardId);
      const opponent = playedBy ? currentState.p0 : currentState.p1;

      if (currentState.turn % 2 !== playedBy) {
        throw new Error('game.snackbar.global.notYourTurn');
      }

      if (currentState.phase !== GamePhase.RESOLVING_SEVEN) {
        throw new Error('game.snackbar.seven.wrongPhase');
      }

      if (!playedCard) {
        throw new Error('game.snackbar.seven.pickAndPlay');
      }

      switch (playedCard.rank) {
        // Ace and Six are always allowed
        case 1:
        case 6:
          return exits.success();

        // 2 and 9 require legal target
        case 2:
        case 9: {
          const targetCard = sails.helpers.gameStates.findTargetCard(
            requestedMove.targetId,
            requestedMove.targetType,
            opponent,
          );
          // Must have target
          if (!targetCard) {
            throw new Error(`Can't find the ${requestedMove.targetId} on opponent's board`);
          }

          if (playedCard.rank === 2 && ![ 'faceCard', 'jack' ].includes(requestedMove.targetType)) {
            throw new Error('Twos can only target royals or glasses');
          }

          const queenCount = opponent.faceCards.filter((faceCard) => faceCard.rank === 12).length;

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
            throw new Error('game.snackbar.oneOffs.three.scrapIsEmpty');
          }
          return exits.success();

        // Four requires opponent to have cards in hand
        case 4:
          if (!opponent.hand.length) {
            throw new Error('game.snackbar.oneOffs.four.opponentHasNoCards');
          }
          return exits.success();

        // Five and sevens require cards in deck
        case 5:
          if (!currentState.deck.length) {
            throw new Error('game.snackbar.oneOffs.emptyDeck');
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
          throw new Error('You cannot play that card as a one-off');
      }
    } catch (err) {
      return exits.error(err);
    }
  },
};
