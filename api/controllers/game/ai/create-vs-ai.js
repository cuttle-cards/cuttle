const GameStatus = require('../../../../utils/GameStatus');

module.exports = async function (req, res) {
  const playerId = req.session.usr;
  const player = await User.findOne(playerId);
  const pNum = req.body.pNum ?? 0;
  const botPNum = (pNum + 1) % 2;

  if (!player) {
    return res.forbidden('You must be logged in to play vs AI');
  }

  const gameData = {
    name: `${player.username} vs AI`,
    isVsAi: true,
    status: GameStatus.STARTED,
    isRanked: false,
    p0Ready: true,
    p1Ready: true,
  };
  gameData[`p${pNum}`] = playerId;
  gameData[`p${botPNum}Rematch`] = true;

  const newGame = await Game.create(gameData).fetch();

  const gameId = newGame.id;

  const roomName = `game_${gameId}_p${pNum}`;
  sails.sockets.join(req, roomName);

  await sails.helpers.gameStates.dealCards({
    ...newGame,
    gameStates: []
  });

  return res.ok(gameId);
};
