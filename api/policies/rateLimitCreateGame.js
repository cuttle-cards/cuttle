const dayjs = require('dayjs');

module.exports = async function (req, res, next) {
  const thirtySecondsAgo = dayjs().subtract(30, 'seconds').valueOf();
  const recentGameCount = await Game.count({ createdBy: req.session.usr, createdAt: { '>=': thirtySecondsAgo } });
  if (recentGameCount >= 5) {
    return res.tooManyRequests({ message: 'Too many requests' });
  }
  return next();
};