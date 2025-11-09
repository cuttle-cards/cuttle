module.exports = async function getHistory(req, res) {
  const userId = req.session.usr;
  if (!userId) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const limit = parseInt(req.query.limit) || 10;
  const skip = parseInt(req.query.skip) || 0;

  const sortBy = req.query.sortBy || 'createdAt';
  const sortDirection = req.query.sortDirection === 'asc' ? 'ASC' : 'DESC';

  const total = await Game.count({
    status: 3,
    or: [ { p0: userId }, { p1: userId } ]
  });

  let finishedGames = await Game.find({
    status: 3,
    or: [ { p0: userId }, { p1: userId } ]
  })
    .sort(`${sortBy} ${sortDirection}`)
    .skip(skip)
    .limit(limit);

  finishedGames = finishedGames.map(game => {
    return {
      ...game,
      winnerLabel: game.winner === userId ? 'You' : 'Opponent'
    };
  });

  return res.json({ finishedGames, total });
};
