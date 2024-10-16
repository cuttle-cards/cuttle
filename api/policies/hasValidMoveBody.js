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
  const { moveType, cardId, targetId, targetType } = req.body;

  switch (moveType) {
    case MoveType.PASS:
    case MoveType.DRAW:
    case MoveType.RESOLVE:
    case MoveType.RESOLVE_FIVE: 
      
      return next();

    case MoveType.POINTS:
    case MoveType.FACECARD:
    case MoveType.SEVEN_POINTS:
    case MoveType.COUNTER:
      {
        if (!cardId) {
          return res.badRequest({ message: 'Must specify a card' });
        }

        if (!DeckIds.includes(cardId)) {
          return res.badRequest({ message: `${cardId} is not a valid cardId` });
        }
      }
      return next();

    case MoveType.SCUTTLE:
      {
        if (!cardId || !targetId) {
          return res.badRequest({ message: 'Must specify a card' });
        }

        const invalidCardId = [cardId, targetId].find((id) => !DeckIds.includes(id));

        if (invalidCardId) {
          return res.badRequest({ message: `${invalidCardId} is not a valid cardId` });
        }
      }
      return next();

    case MoveType.ONE_OFF:
      {
        if (!cardId) {
          return res.badRequest({ message: 'Must specify a card' });
        }

        if (!DeckIds.includes(cardId)) {
          return res.badRequest({ message: `${cardId} is not a valid cardId` });
        }

        const [rankAsStr] = cardId;
        const isTwoOrNine = ['2', '9'].includes(rankAsStr);
        const missingTarget =
          !targetId || !DeckIds.includes(targetId) || !['point', 'jack', 'faceCard'].includes(targetType);
        if (isTwoOrNine && missingTarget) {
          return res.badRequest({ message: 'You cannot play that one-off without a target' });
        }
      }

      return next();

    case MoveType.JACK:
      {
        if (!cardId) {
          return res.badRequest({ message: 'Must specify a card' });
        }
        if (!targetId) {
          return res.badRequest({ message: 'Must have a card targeted' });
        }

        if (!DeckIds.includes(cardId)) {
          return res.badRequest({ message: `${cardId} is not a valid cardId` });
        }

        if (!DeckIds.includes(targetId)) {
          return res.badRequest({ message: `${targetId} is not a valid targetId` });
        }
      }
      return next();

    default:
      return res.badRequest({ message: `Invalid moveType of ${req.body.moveType}` });
  }
};
