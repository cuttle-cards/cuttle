module.exports = async function getHistory(req, res) {
  const userId = req.session.usr;
  if (!userId) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const sortBy = req.query.sortBy || 'createdAt';
  const sortDirection = req.query.sortDirection === 'asc' ? 'ASC' : 'DESC';

  let finishedGames = await Game.find({
    status: 3,
    or: [{ p0: userId }, { p1: userId }]
  }).sort(`${sortBy} ${sortDirection}`);

  const opponentIdsSet = new Set(
    finishedGames.map(game => (game.p0 === userId ? game.p1 : game.p0))
  );
  const opponentIds = Array.from(opponentIdsSet);

  const opponents = await User.find({ id: opponentIds });
  const opponentMap = Object.fromEntries(opponents.map(u => [u.id, u.username]));

  const result = finishedGames.map(game => {
    const opponentId = game.p0 === userId ? game.p1 : game.p0;
    return {
      ...game,
      winnerLabel: game.winner === userId ? 'You' : 'Opponent',
      opponentName: opponentMap[opponentId] || 'Unknown'
    };
  });

  return res.json({ finishedGames: result });
};