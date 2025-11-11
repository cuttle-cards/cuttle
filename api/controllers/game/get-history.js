const GameStatus = require('../../../utils/GameStatus.json');

module.exports = async function getHistory(req, res) {
  const userId = req.session.usr;

  const sortBy = req.query.sortBy || 'createdAt';
  const sortDirection = req.query.sortDirection === 'asc' ? 'ASC' : 'DESC';

  const limit = parseInt(req.query.limit) || 20;
  const skip = parseInt(req.query.skip) || 0;

  const totalCount = await Game.count({
    status: GameStatus.FINISHED,
    or: [ { p0: userId }, { p1: userId } ]
  });

  const finishedGames = await Game.find({
    status: GameStatus.FINISHED,
    or: [ { p0: userId }, { p1: userId } ]
  })
    .sort(`${sortBy} ${sortDirection}`)
    .limit(limit)
    .skip(skip);

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
      match: game.match,
      winnerId: game.winner,
      opponentId: opponentId,
      opponentName: opponentMap[opponentId] || 'Unknown',
    };
  });

  return res.json({
    finishedGames: composedGames,
    totalCount: totalCount,
    hasMore: skip + finishedGames.length < totalCount
  });
};
