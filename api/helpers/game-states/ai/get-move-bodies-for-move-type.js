const MoveType = require('../../../../utils/MoveType');
const TargetType = require('../../../../utils/TargetType');

/**
 * Legal targets for a two: royals, glasses eights, and the top jack of each point card.
 * Point cards themselves are never legal targets for a two.
 */
function getTwoTargets(opponentPoints, opponentFaceCards) {
  const faceCardTargets = opponentFaceCards.map(({ id }) => ({
    targetId: id,
    targetType: TargetType.faceCard,
  }));
  const jackTargets = opponentPoints
    .filter(({ attachments }) => attachments.length)
    .map(({ attachments }) => ({ targetId: attachments.at(-1).id, targetType: TargetType.jack }));

  return [ ...faceCardTargets, ...jackTargets ];
}

/**
 * Every legal pair of targets for a nine. Nines return two cards, so they need two distinct
 * targets, and any queen blocks them outright (a queen leaves itself the only legal target).
 * Only the top jack of each point card is targetable.
 */
function getNineTargetPairs(opponentPoints, opponentFaceCards) {
  if (opponentFaceCards.some(({ rank }) => rank === 12)) {
    return [];
  }

  const targets = [
    ...opponentPoints.map(({ id }) => ({ targetId: id, targetType: TargetType.point })),
    ...getTwoTargets(opponentPoints, opponentFaceCards),
  ];

  const pairs = [];
  for (let i = 0; i < targets.length; i++) {
    for (let j = i + 1; j < targets.length; j++) {
      pairs.push([ targets[i], targets[j] ]);
    }
  }

  return pairs;
}

/** Builds the move bodies for playing one targeted one-off card, given its rank's targeting rules */
function getTargetedOneOffBodies({ moveType, playedBy, card, opponentPoints, opponentFaceCards }) {
  if (card.rank === 9) {
    return getNineTargetPairs(opponentPoints, opponentFaceCards).map(([ targetOne, targetTwo ]) => ({
      moveType,
      playedBy,
      cardId: card.id,
      targetId: targetOne.targetId,
      targetType: targetOne.targetType,
      targetIdTwo: targetTwo.targetId,
      targetTypeTwo: targetTwo.targetType,
    }));
  }

  return getTwoTargets(opponentPoints, opponentFaceCards).map(({ targetId, targetType }) => ({
    moveType,
    playedBy,
    cardId: card.id,
    targetId,
    targetType,
  }));
}

module.exports = {
  friendlyName: 'Get move bodies for move type',

  description: 'Returns list of move body objects for specified moveType. Moves may not all be legal',

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
    moveType: {
      type: 'string',
      description: 'Type of move made (should be value of MoveType enum)',
      required: true,
    },
  },
  sync: true,
  fn: ({ currentState, playedBy, moveType }, exits) => {
    const player = currentState[`p${playedBy}`];
    const opponent = currentState[`p${(playedBy + 1) % 2}`];
    const playerHand = player.hand;
    const _playerPoints = player.points;
    const _playerFaceCards = player.faceCards;
    const _opponentHand = opponent.hand;
    const opponentPoints = opponent.points;
    const opponentFaceCards = opponent.faceCards;
    const { deck, scrap } = currentState;

    let res = [];
    switch (moveType) {
      case MoveType.DRAW:
      case MoveType.RESOLVE:
      case MoveType.PASS:
      case MoveType.STALEMATE_REJECT:
        res = [ { moveType, playedBy } ];
        break;

      case MoveType.POINTS:
        res = playerHand
          .filter((card) => card.rank <= 10)
          .map((card) => ({ moveType, playedBy, cardId: card.id }));
        break;

      case MoveType.FACE_CARD:
        res = playerHand
          .filter((card) => [ 8, 12, 13 ].includes(card.rank))
          .map((card) => ({ moveType, playedBy, cardId: card.id }));
        break;

      case MoveType.SCUTTLE: {
        const numberCardsInHand = playerHand.filter((card) => card.rank <= 10);
        for (let scuttlingCard of numberCardsInHand) {
          for (let targetCard of opponentPoints) {
            res.push({ moveType, playedBy, cardId: scuttlingCard.id, targetId: targetCard.id });
          }
        }
        break;
      }

      case MoveType.JACK: {
        const jacksInHand = playerHand.filter((card) => card.rank === 11);
        for (let jack of jacksInHand) {
          for (let targetCard of opponentPoints) {
            res.push({ moveType, playedBy, cardId: jack.id, targetId: targetCard.id });
          }
        }
        break;
      }

      case MoveType.ONE_OFF: {
        const untargetedOneOffsInHand = playerHand.filter((card) => [ 1, 3, 4, 5, 6, 7 ].includes(card.rank));
        for (let oneOff of untargetedOneOffsInHand) {
          res.push({ moveType, playedBy, cardId: oneOff.id });
        }

        const twosAndNines = playerHand.filter((card) => [ 2, 9 ].includes(card.rank));
        for (let twoOrNine of twosAndNines) {
          res.push(...getTargetedOneOffBodies({
            moveType,
            playedBy,
            card: twoOrNine,
            opponentPoints,
            opponentFaceCards,
          }));
        }
        break;
      }

      case MoveType.COUNTER:
        res = playerHand
          .filter((card) => card.rank === 2)
          .map((card) => ({ moveType, playedBy, cardId: card.id }));
        break;

      case MoveType.RESOLVE_THREE:
        res = scrap.map((card) => ({ moveType, playedBy, cardId: card.id }));
        break;

      case MoveType.RESOLVE_FOUR: {

        if (playerHand.length === 1) {
          res = [
            {
              moveType,
              playedBy,
              cardId1: playerHand[0].id,
            },
          ];
        }

        for (let i = 0; i < playerHand.length; i++) {
          for (let j = i + 1; j < playerHand.length; j++) {
            res.push({
              moveType,
              playedBy,
              cardId1: playerHand[i].id,
              cardId2: playerHand[j].id
            });
          }
        }
        break;
      }

      case MoveType.RESOLVE_FIVE:
        if (!playerHand.length) {
          res = [ { moveType, playedBy, cardId: null } ];
        } else {
          res = playerHand.map((card) => ({ moveType, playedBy, cardId: card.id }));
        }
        break;

      case MoveType.DISCARD_TO_HAND_LIMIT: {
        const overflowCount = playerHand.length - 8;
        if (overflowCount <= 0) {break;}
        // Enumerates every set of cards the player could discard: C(hand, overflow) move bodies.
        // Bounded by game rules: hands start <= 8 and a turn is a single action, whose largest net
        // gain is a Five (discard 1, draw 3 = +2), so in normal play hand <= ~10 and overflow is 1-2
        // (C(9,1)=9, C(10,2)=45). Recursion depth = overflow (~2). No blow-up risk.
        const getCombinations = (arr, k) => {
          if (k === 1) {return arr.map((item) => [ item ]);}
          const result = [];
          for (let i = 0; i <= arr.length - k; i++) {
            for (const rest of getCombinations(arr.slice(i + 1), k - 1)) {
              result.push([ arr[i], ...rest ]);
            }
          }
          return result;
        };
        res = getCombinations(playerHand, overflowCount).map((combo) => ({
          moveType,
          playedBy,
          discardedCards: combo.map((card) => card.id),
        }));
        break;
      }

      case MoveType.SEVEN_POINTS:
        res = deck.slice(0, 2)
          .filter((card) => card.rank <= 10)
          .map((card) => ({ moveType, playedBy, cardId: card.id }));
        break;

      case MoveType.SEVEN_SCUTTLE: {
        const numberCardsInTopTwo = deck.slice(0, 2).filter((card) => card.rank <= 10);
        for (let scuttlingCard of numberCardsInTopTwo) {
          for (let targetCard of opponentPoints) {
            res.push({ moveType, playedBy, cardId: scuttlingCard.id, targetId: targetCard.id });
          }
        }
        break;
      }

      case MoveType.SEVEN_FACE_CARD:
        res = deck.slice(0, 2)
          .filter((card) => [ 8, 12, 13 ].includes(card.rank))
          .map((card) => ({ moveType, playedBy, cardId: card.id }));
        break;

      case MoveType.SEVEN_JACK: {
        const jacksInTopTwo = deck.slice(0, 2).filter((card) => card.rank === 11);
        for (let jack of jacksInTopTwo) {
          for (let targetCard of opponentPoints) {
            res.push({ moveType, playedBy, cardId: jack.id, targetId: targetCard.id });
          }
        }
        break;
      }

      case MoveType.SEVEN_DISCARD:
        res = deck.slice(0, 2)
          .filter((card) => card.rank === 11)
          .map((card) => ({ moveType, playedBy, cardId: card.id }));
        break;

      case MoveType.SEVEN_ONE_OFF: {
        const topTwo = deck.slice(0, 2);
        const untargetedOneOffs = topTwo.filter((card) => [ 1, 3, 4, 5, 6, 7 ].includes(card.rank));
        const targetedOneOffs = topTwo.filter((card) => [ 2, 9 ].includes(card.rank));

        for (let untargetedOneOff of untargetedOneOffs) {
          res.push({ moveType, playedBy, cardId: untargetedOneOff.id });
        }

        for (let targetedOneOff of targetedOneOffs) {
          res.push(...getTargetedOneOffBodies({
            moveType,
            playedBy,
            card: targetedOneOff,
            opponentPoints,
            opponentFaceCards,
          }));
        }

        break;
      }

      default:
        return exits.error(new Error(`Can't create move bodies for unknown moveType: ${moveType}`));
    }
    return exits.success(res);
  },
};
