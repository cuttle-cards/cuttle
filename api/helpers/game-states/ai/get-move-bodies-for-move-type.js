const MoveType = require('../../../../utils/MoveType');

module.exports = {
  friendlyName: 'Get move bodies for move type',

  description: 'Returns list of move body objects for specified moveType',

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
    const playerPoints = player.points;
    const playerFaceCards = player.faceCards;
    const opponentHand = opponent.hand;
    const opponentPoints = opponent.points;
    const opponentFaceCards = opponent.faceCards;

    let res = [];
    switch (moveType) {
      case MoveType.DRAW:
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
          for (let potentialTarget of opponentFaceCards) {
            res.push({ moveType, playedBy, cardId: twoOrNine.id, targetId: potentialTarget.id, targetType: 'faceCard' });
          }

          for (let pointCard of opponentPoints) {
            if (pointCard.attachments.length) {
              res.push({ moveType, playedBy, cardId: twoOrNine.id, targetId: pointCard.attachments.at(-1).id });
            }
          }
        }
        break;
      }
      case MoveType.COUNTER:
        res = playerHand
          .filter((card) => card.rank === 2)
          .map((card) => ({ moveType, playedBy, cardId: card.id }));
        break;
      case MoveType.RESOLVE:
        res = [ { moveType, playedBy } ];
        break;
      default:
        return exits.error(new Error(`Can't create move bodies for unknown moveType: ${moveType}`));
    }
    return exits.success(res);
  },
};
