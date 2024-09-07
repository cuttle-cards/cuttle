const MoveType = require('../../utils/MoveType.json');

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
    case MoveType.POINTS:
      if (req.body.cardId) {
        return next();
      }
      return res.badRequest({ message: 'Cannot play points without specifying a card' });
    default:
      return res.badRequest({ message: `Invalid moveType of ${req.body.moveType}` });
  }
};
