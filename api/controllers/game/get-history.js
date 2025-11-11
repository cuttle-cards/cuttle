module.exports = async function getHistory(req, res) {
  const userId = req.session.usr;

  const sortBy = req.query.sortBy || 'createdAt';
  const sortDirection = req.query.sortDirection === 'asc' ? 'ASC' : 'DESC';

  const finishedGames = await Game.find({
    status: 3,
    or: [ { p0: userId }, { p1: userId } ]
  }).sort(`${sortBy} ${sortDirection}`);

  const opponentIdsSet = new Set(
    finishedGames.map(game => (game.p0 === userId ? game.p1 : game.p0))
  );
  const opponentIds = Array.from(opponentIdsSet);

  const opponents = await User.find({ id: opponentIds }).select([ 'id', 'username' ]);
  const opponentMap = Object.fromEntries(opponents.map(u => [ u.id, u.username ]));

  const composedGames = finishedGames.map(game => {
    const opponentId = game.p0 === userId ? game.p1 : game.p0;
    return {
      id: game.id,
      name: game.name,
      isRanked: game.isRanked,
      createdAt: game.createdAt,
      winnerLabel: game.winner === userId ? 'You' : 'Opponent',
      opponentName: opponentMap[opponentId] || 'Unknown',
    };
  });

  return res.json({ finishedGames: composedGames });
};
