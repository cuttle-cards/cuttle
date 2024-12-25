const MoveType = require('../../utils/MoveType.json');
const DeckIds = require('../../utils/DeckIds.json');

/**
 * hasValidMoveBody
 *
 * @module      :: Policy
 * @description :: Only allows requests that contain parameters determined by moveType
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function (req, res, next) {
  const { moveType, cardId, cardId1, cardId2, targetId, targetType } = req.body;

  switch (moveType) {
    // These moves require no extra data
    case MoveType.PASS:
    case MoveType.DRAW:
    case MoveType.RESOLVE:
    case MoveType.RESOLVE_FIVE: 
    case MoveType.CONCEDE:
      return next();

    // These require a `cardId`
    case MoveType.POINTS:
    case MoveType.FACE_CARD:
    case MoveType.SEVEN_POINTS:
    case MoveType.SEVEN_FACE_CARD:
    case MoveType.COUNTER:
    case MoveType.RESOLVE_THREE:
    case MoveType.SEVEN_DISCARD:
      {
        if (!cardId) {
          return res.badRequest({ message: 'Must specify a card' });
        }

        if (!DeckIds.includes(cardId)) {
          return res.badRequest({ message: `${cardId} is not a valid cardId` });
        }
      }
      return next();

    // Requires `card1` and optionally accepts `card2`
    case MoveType.RESOLVE_FOUR:
      {
        if (!cardId1) {
          return res.badRequest({ message: 'Must specify a card' });
        }

        if (!DeckIds.includes(cardId1)) {
          return res.badRequest({ message: `${cardId1} is not a valid cardId` });
        }

        if (cardId2 && !DeckIds.includes(cardId2)) {
          return res.badRequest({ message: `${cardId2} is not a valid cardId` });
        }
      }
      return next();

    // These require `cardId` and `targetId`
    case MoveType.JACK:
    case MoveType.SCUTTLE:
    case MoveType.SEVEN_SCUTTLE:
    case MoveType.SEVEN_JACK:
      {
        if (!cardId || !targetId) {
          return res.badRequest({ message: 'Must specify a card' });
        }

        const invalidCardId = [ cardId, targetId ].find((id) => !DeckIds.includes(id));

        if (invalidCardId) {
          return res.badRequest({ message: `${invalidCardId} is not a valid cardId` });
        }
      }
      return next();

    // Requires `cardId`; additionally requires `targetId` and `targetType` if cardId specifies a 2 or 9
    case MoveType.ONE_OFF:
    case MoveType.SEVEN_ONE_OFF:
      {
        if (!cardId) {
          return res.badRequest({ message: 'Must specify a card' });
        }

        if (!DeckIds.includes(cardId)) {
          return res.badRequest({ message: `${cardId} is not a valid cardId` });
        }

        const [ rankAsStr ] = cardId;
        const isTwoOrNine = [ '2', '9' ].includes(rankAsStr);
        const missingTarget =
          !targetId || !DeckIds.includes(targetId) || ![ 'point', 'jack', 'faceCard' ].includes(targetType);
        if (isTwoOrNine && missingTarget) {
          return res.badRequest({ message: 'You cannot play that one-off without a target' });
        }
      }

      return next();

    default:
      return res.badRequest({ message: `Invalid moveType of ${req.body.moveType}` });
  }
};
