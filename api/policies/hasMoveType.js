const moveType = require('../../utils/MoveType.json');

module.exports = function (req, res, next) {
  if (Object.values(moveType).includes(req.body.moveType)) {
    return next();
  }

  return res.badRequest({ message: 'Error: Missing or invalid moveType' });
};
