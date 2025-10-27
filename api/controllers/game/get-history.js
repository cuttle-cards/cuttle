module.exports = async function getHistory(req, res) {
  console.log('Session:', req.session);
  const userId = req.session.usr;
  if (!userId) {return res.status(403).json({ message: 'Forbidden' });}

  const finishedGames = await Game.find({
    status: 3,
    or: [ { p0: userId }, { p1: userId } ]
  }).sort('createdAt DESC');

  return res.json({ finishedGames });
};
