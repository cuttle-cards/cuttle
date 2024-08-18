const moveType = require('../../utils/MoveType.json');

module.exports = function (req, res, next) {
  if (Object.keys(moveType).some((key) => moveType[key] === req.body.moveType)) {
    return next();
  }

  return res.badRequest({ message: 'Error: Missing or invalid moveType' });
};
