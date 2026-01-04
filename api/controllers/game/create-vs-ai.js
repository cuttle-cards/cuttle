const GameStatus = require('../../../utils/GameStatus');

module.exports = async function (req, res) {
  const player = await User.findOne(req.session.usr);
  const pNum = req.body.pNum ?? 0;

  if (!player) {
    return res.forbidden('You must be logged in to play vs AI');
  }

  const newGame = await Game.create({
    name: `${player.username} vs AI`,
    isVsAi: true,
    p0: player.id,
    status: GameStatus.STARTED,
    isRanked: false,
    p0Ready: true,
    p1Ready: true,
  }).fetch();

  const gameId = newGame.id;

  const roomName = `game_${gameId}_p${pNum}`;
  sails.sockets.join(req, roomName);

  await sails.helpers.gameStates.dealCards({
    ...newGame,
    gameStates: []
  });

  return res.ok(gameId);
};
