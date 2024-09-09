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
  switch (req.body.moveType) {
    case MoveType.DRAW:
      // Draw requires no extra data
      return next();
    case MoveType.POINTS:

      if (!req.body.cardId) {
        return res.badRequest({ message: 'Cannot play points without specifying a card' });
      }
      if (!DeckIds.includes(req.body.cardId)) {
        return res.badRequest({ message: `${req.body.cardId} is not a valid cardId` });
      }

      return next();
    default:
      return res.badRequest({ message: `Invalid moveType of ${req.body.moveType}` });
  }
};
