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
    case MoveType.DRAW:
      // Draw requires no extra data
    return next();
    
    case MoveType.FACECARD: {
      if (!cardId) {
        return res.badRequest({ message: 'Must specify a card' });
      }

      if (!DeckIds.includes(cardId)) {
        return res.badRequest({ message: `${cardId} is not a valid cardId` });
      }
    }
      return next();
    
    case MoveType.POINTS:
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
