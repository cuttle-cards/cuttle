const GameStatus = require('../../../utils/GameStatus.json');

module.exports = async function getHistory(req, res) {
  const userId = req.session.usr;

  const allowedSortColumns = [ 'createdAt', 'winner', 'isRanked' ];
  const sortBy = allowedSortColumns.includes(req.query.sortBy) ? req.query.sortBy : 'createdAt';
  const sortDirection = req.query.sortDirection === 'asc' ? 'ASC' : 'DESC';

  const limit = parseInt(req.query.limit) || 20;
  const skip = parseInt(req.query.skip) || 0;

  const totalCount = await Game.count({
    status: GameStatus.FINISHED,
    or: [ { p0: userId }, { p1: userId } ],
  });

  const finishedGames = await Game.find({
    status: GameStatus.FINISHED,
    or: [ { p0: userId }, { p1: userId } ],
  })
    .sort(`${sortBy} ${sortDirection}`)
    .limit(limit)
    .skip(skip);

  const playerIdsSet = new Set();
  finishedGames.forEach((game) => {
    playerIdsSet.add(game.p0);
    playerIdsSet.add(game.p1);
  });
  const playerIds = Array.from(playerIdsSet);

  const players = await User.find({ id: playerIds }).select([ 'id', 'username' ]);
  const playerMap = Object.fromEntries(players.map((u) => [ u.id, u.username ]));

  const composedGames = finishedGames.map((game) => {
    const isP0 = game.p0 === userId;

    return {
      id: game.id,
      name: game.name,
      isRanked: game.isRanked,
      createdAt: game.createdAt,
      match: game.match,
      winnerId: game.winner,
      p0: { id: game.p0, username: playerMap[game.p0] || 'Unknown', isOpponent: !isP0 },
      p1: { id: game.p1, username: playerMap[game.p1] || 'Unknown', isOpponent: isP0 },
    };
  });

  return res.json({
    finishedGames: composedGames,
    totalCount: totalCount,
    hasMore: skip + finishedGames.length < totalCount,
  });
};
